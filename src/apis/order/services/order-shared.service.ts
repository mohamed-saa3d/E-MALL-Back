import mongoose from "mongoose";
import AppError from "../../../utils/app-error";
import Order from "../models/order.model";

export const toOrderObjectId = (
  value: mongoose.ObjectId | mongoose.Types.ObjectId | string,
  fieldName: string,
) => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  if (typeof value === "string" && mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }

  throw new AppError(`Invalid ${fieldName}`, 400);
};

export const idsEqual = (left: unknown, right: unknown) =>
  String(left) === String(right);

export const getOrderDocument = async (
  orderId: mongoose.ObjectId | mongoose.Types.ObjectId | string,
) => {
  const oid = toOrderObjectId(orderId, "orderId");
  const order = await Order.findById(oid);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

export const buildVariantSnapshot = (variant: {
  sku?: string;
  attributes?: Array<{ name?: string; value?: string }>;
}) => {
  const attributeText = Array.isArray(variant.attributes)
    ? variant.attributes
        .map((attribute) => {
          const name = String(attribute?.name || "").trim();
          const value = String(attribute?.value || "").trim();
          if (!name || !value) return "";
          return `${name}: ${value}`;
        })
        .filter(Boolean)
        .join(" / ")
    : "";

  if (attributeText) {
    return attributeText;
  }

  const sku = String(variant.sku || "").trim();
  return sku || "Default";
};

export const getOwnedOrderDocument = async (
  userId: mongoose.ObjectId | mongoose.Types.ObjectId | string,
  orderId: mongoose.ObjectId | mongoose.Types.ObjectId | string,
) => {
  const uid = toOrderObjectId(userId, "userId");
  const oid = toOrderObjectId(orderId, "orderId");

  const order = await Order.findOne({ _id: oid, userId: uid } as any);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

export const toStoreScopedOrder = (
  order: any,
  storeId: mongoose.ObjectId | mongoose.Types.ObjectId | string,
) => {
  const matchedStore = Array.isArray(order?.stores)
    ? order.stores.find((store: any) => idsEqual(store.storeId, storeId))
    : null;

  if (!matchedStore) {
    throw new AppError("Order does not include this store", 404);
  }

  return {
    ...order,
    stores: [matchedStore],
    missingItems: Array.isArray(order?.missingItems)
      ? order.missingItems.filter((item: any) => idsEqual(item.storeId, storeId))
      : [],
  };
};
