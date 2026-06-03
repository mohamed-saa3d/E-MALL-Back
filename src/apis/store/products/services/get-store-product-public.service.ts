import AppError from "../../../../utils/app-error";
import { Product } from "../../../products-and-variants/model/products-and-variants.model";
import { decorateProductPricing } from "./shared/decorate-product-pricing.util";
import { ensureStoreForPublic } from "./shared/ensure-store-for-public.util";
import { toObjectId } from "./shared/to-object-id.util";
import { mapProductResponse } from "../../../../utils/response-mappers";

/**
 * Returns one active product from a public store page.
 */
export const getStoreProductPublic = async (storeId: string, productId: string) => {
  const sid = await ensureStoreForPublic(storeId);
  const pid = toObjectId(productId, "productId");

  const product = await Product.findOne({
    _id: pid,
    storeId: sid,
    isActive: true,
  } as any)
    .populate("categoryId", "name slug")
    .populate("storeId", "name logo")
    .lean();

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return mapProductResponse(decorateProductPricing(product));
};
