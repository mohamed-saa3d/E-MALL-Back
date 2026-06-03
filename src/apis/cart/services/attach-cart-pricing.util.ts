import mongoose from "mongoose";
import { Product } from "../../products-and-variants/model/products-and-variants.model";
import { resolveVariantPrice } from "../../products-and-variants/services/resolve-variant-price.util";

const toObjectId = (value: any): mongoose.Types.ObjectId | null => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === "string" && mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
};

export const attachCartPricing = async (cart: any, at: Date = new Date()) => {
  if (!cart || typeof cart !== "object") return cart;

  const items: any[] = Array.isArray(cart.items) ? cart.items : [];
  if (items.length === 0) {
    cart.totalPrice = 0;
    return cart;
  }

  const variantIds = Array.from(
    new Set(
      items
        .map((i) => toObjectId(i?.variantId))
        .filter(Boolean)
        .map((id) => (id as mongoose.Types.ObjectId).toString()),
    ),
  ).map((id) => new mongoose.Types.ObjectId(id));

  if (variantIds.length === 0) {
    for (const item of items) {
      item.unitPrice = null;
      item.totalPrice = 0;
      item.isPriceAvailable = false;
    }
    cart.totalPrice = 0;
    return cart;
  }

  const rows: any[] = await Product.aggregate([
    { $match: { isActive: true, "variants._id": { $in: variantIds } } },
    { $unwind: "$variants" },
    { $match: { "variants._id": { $in: variantIds } } },
    {
      $project: {
        _id: 0,
        variantId: "$variants._id",
        price: "$variants.price",
        salePrice: "$variants.salePrice",
        saleStartAt: "$variants.saleStartAt",
        saleEndAt: "$variants.saleEndAt",
      },
    },
  ]);

  const pricingByVariantId = new Map<string, any>();
  for (const row of rows) {
    pricingByVariantId.set(String(row.variantId), row);
  }

  let cartTotalPrice = 0;
  for (const item of items) {
    const row = pricingByVariantId.get(String(item?.variantId));
    if (!row) {
      item.unitPrice = null;
      item.totalPrice = 0;
      item.isPriceAvailable = false;
      continue;
    }

    const resolvedUnitPrice = resolveVariantPrice(row, at);
    const unitPrice = Number.isFinite(resolvedUnitPrice) ? resolvedUnitPrice : 0;

    const quantityRaw = Number(item?.quantity ?? 0);
    const quantity = Number.isFinite(quantityRaw) ? quantityRaw : 0;

    const totalPrice = Math.max(0, quantity) * unitPrice;

    item.unitPrice = unitPrice;
    item.totalPrice = totalPrice;
    item.isPriceAvailable = true;
    cartTotalPrice += totalPrice;
  }

  cart.totalPrice = cartTotalPrice;
  return cart;
};
