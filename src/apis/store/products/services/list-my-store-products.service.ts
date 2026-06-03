import { ObjectId } from "mongoose";
import { Product } from "../../../products-and-variants/model/products-and-variants.model";
import { decorateProductPricing } from "./shared/decorate-product-pricing.util";
import { ensureStoreForOwner } from "./shared/ensure-store-for-owner.util";
import { StoreProductsListQuery } from "./shared/store-products-query.type";
import { mapProductResponse } from "../../../../utils/response-mappers";

/**
 * Lists products for the owner view of a specific store (supports inactive items too).
 */
export const listMyStoreProducts = async (
  storeId: string,
  ownerId: ObjectId | string,
  query: StoreProductsListQuery,
) => {
  const { sid } = await ensureStoreForOwner(storeId, ownerId);
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.max(1, Math.min(100, Number(query.limit || 24)));
  const skip = (page - 1) * limit;

  const filter: any = { storeId: sid };
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

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
