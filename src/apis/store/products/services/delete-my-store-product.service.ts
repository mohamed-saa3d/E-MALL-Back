import { ObjectId } from "mongoose";
import AppError from "../../../../utils/app-error";
import { Product } from "../../../products-and-variants/model/products-and-variants.model";
import { decorateProductPricing } from "./shared/decorate-product-pricing.util";
import { ensureStoreForOwner } from "./shared/ensure-store-for-owner.util";
import { toObjectId } from "./shared/to-object-id.util";

/**
 * Soft-delete (deactivate) a store product.
 */
export const deleteMyStoreProduct = async (
  storeId: string,
  productId: string,
  ownerId: ObjectId | string,
) => {
  const { sid } = await ensureStoreForOwner(storeId, ownerId);
  const pid = toObjectId(productId, "productId");

  const product = await Product.findOneAndDelete({ _id: pid, storeId: sid } as any);

  if (!product) {
    throw new AppError("Product not found", 404);
  }
  
};
