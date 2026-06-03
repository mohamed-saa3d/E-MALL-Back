import { ObjectId } from "mongoose";
import AppError from "../../../../utils/app-error";
import { Product } from "../../../products-and-variants/model/products-and-variants.model";
import { decorateProductPricing } from "./shared/decorate-product-pricing.util";
import { ensureStoreForOwner } from "./shared/ensure-store-for-owner.util";
import { toObjectId } from "./shared/to-object-id.util";
import { mapProductResponse } from "../../../../utils/response-mappers";

/**
 * Returns a single product for owner view inside a specific store.
 */
export const getMyStoreProduct = async (
  storeId: string,
  productId: string,
  ownerId: ObjectId | string,
) => {
  const { sid } = await ensureStoreForOwner(storeId, ownerId);
  const pid = toObjectId(productId, "productId");

  const product = await Product.findOne({ _id: pid, storeId: sid } as any)
    .populate("categoryId", "name slug")
    .populate("storeId", "name logo")
    .lean();
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return mapProductResponse(decorateProductPricing(product));
};

