import mongoose from "mongoose";
import Address from "../../address/model/address.model";
import User from "../../auth/models/user.model";
import Cart from "../../cart/models/cart.model";
import { resolveVariantPrice } from "../../products-and-variants/services/resolve-variant-price.util";
import Store from "../../store/models/store.model";
import AppError from "../../../utils/app-error";
import Order, { PaymentMethod } from "../models/order.model";
import {
  buildVariantSnapshot,
  idsEqual,
  toOrderObjectId,
} from "./order-shared.service";
import { applyDerivedOrderStatus } from "./recompute-order-status.service";
import { Product } from "../../products-and-variants/model/products-and-variants.model";
import { notifyOrderEvent } from "../../notifications/services/notify-order-event.service";
import { ORDER_NOTIFICATION_EVENTS } from "../../notifications/constants/order-notification.constants";

interface CreateOrderInput {
  userId: mongoose.Types.ObjectId | string;
  addressId: mongoose.Types.ObjectId | string;
  paymentMethod: PaymentMethod;
}

export const createOrder = async (input: CreateOrderInput) => {
  const userId = toOrderObjectId(input.userId, "userId");
  const addressId = toOrderObjectId(input.addressId, "addressId");

  const [user, address, cart] = await Promise.all([
    User.findOne({ _id: userId, isActive: true, deletedAt: null } as any)
      .select("name phoneNumber")
      .lean(),
    Address.findOne({ _id: addressId, userId } as any).lean(),
    Cart.findOne({ userId } as any),
  ]);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const productIds = Array.from(
    new Set(cart.items.map((item: any) => String(item.productId))),
  ).map((id) => new mongoose.Types.ObjectId(id));

  const storeIds = Array.from(
    new Set(cart.items.map((item: any) => String(item.storeId))),
  ).map((id) => new mongoose.Types.ObjectId(id));

  const [products, stores] = await Promise.all([
    Product.find({ _id: { $in: productIds }, isActive: true }).lean(),
    Store.find({ _id: { $in: storeIds } } as any)
      .select("name")
      .lean(),
  ]);

  const productMap = new Map(
    products.map((product: any) => [String(product._id), product]),
  );
  const storeMap = new Map(
    stores.map((store: any) => [String(store._id), store]),
  );

  const storesById = new Map<string, any>();

  for (const rawItem of cart.items as any[]) {
    const quantity = Number(rawItem.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new AppError("Cart contains an invalid quantity", 400);
    }

    const product = productMap.get(String(rawItem.productId));
    if (!product) {
      throw new AppError("One or more cart products are unavailable", 400);
    }

    if (!idsEqual(product.storeId, rawItem.storeId)) {
      throw new AppError("Cart item store mismatch", 400);
    }

    const variant = Array.isArray(product.variants)
      ? product.variants.find((entry: any) =>
          idsEqual(entry._id, rawItem.variantId),
        )
      : null;

    if (!variant) {
      throw new AppError("One or more cart variants are unavailable", 400);
    }

    const store = storeMap.get(String(rawItem.storeId));
    if (!store) {
      throw new AppError("One or more stores are unavailable", 400);
    }

    const unitPrice = resolveVariantPrice(variant);
    const key = String(rawItem.storeId);

    if (!storesById.has(key)) {
      storesById.set(key, {
        storeId: rawItem.storeId,
        storeNameSnapshot: store.name,
        status: "pending",
        items: [],
        subtotal: 0,
      });
    }

    storesById.get(key).items.push({
      productId: rawItem.productId,
      variantId: rawItem.variantId,
      productNameSnapshot: product.name,
      variantSnapshot: buildVariantSnapshot(variant),
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
    });
  }

  const order = new Order({
    userId,
    buyerSnapshot: {
      name: user.name,
      phone: address.phone,
      address: {
        street: address.street,
        city: address.city,
        distanceMark: address.distanceMark,
      },
    },
    stores: Array.from(storesById.values()),
    missingItems: [],
    orderStatus: "pending",
    payment: {
      method: input.paymentMethod,
      status: "pending",
    },
    delivery: {
      status: "none",
    },
    totals: {
      itemsTotal: 0,
      deliveryFee: 0,
      grandTotal: 0,
    },
  });

  applyDerivedOrderStatus(order);
  await order.save();

  cart.items = [];
  await cart.save();

  // Notify customer and stores about the new order
  await notifyOrderEvent(order, ORDER_NOTIFICATION_EVENTS.ORDER_CREATED);

  return order.toObject();
};
