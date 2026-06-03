import { Product } from "../../../products-and-variants/model/products-and-variants.model";
import { decorateProductPricing } from "./shared/decorate-product-pricing.util";
import { ensureStoreForPublic } from "./shared/ensure-store-for-public.util";
import { StoreProductsListQuery } from "./shared/store-products-query.type";
import { mapProductResponse } from "../../../../utils/response-mappers";

/**
 * Lists active products for public store page (customer view).
 */
export const listStoreProductsPublic = async (
  storeId: string,
  query: StoreProductsListQuery,
) => {
  const sid = await ensureStoreForPublic(storeId);
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.max(1, Math.min(100, Number(query.limit || 24)));
  const skip = (page - 1) * limit;

  const filter: any = { storeId: sid, isActive: true };
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("categoryId", "name slug")
      .populate("storeId", "name logo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: products
      .map((product: any) => decorateProductPricing(product))
      .map((product: any) => mapProductResponse(product)),
    total,
    page,
    limit,
  };
};
