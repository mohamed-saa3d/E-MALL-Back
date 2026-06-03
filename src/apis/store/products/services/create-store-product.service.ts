import { ObjectId } from "mongoose";
import AppError from "../../../../utils/app-error";
import createSlugFromName from "../../../../utils/create-slug-from-name";
import Category from "../../../category/models/category.model";
import { Product } from "../../../products-and-variants/model/products-and-variants.model";
import { CreateStoreProductInput } from "../validations/store-product.validation";
import { decorateProductPricing } from "./shared/decorate-product-pricing.util";
import { ensureStoreForOwner } from "./shared/ensure-store-for-owner.util";
import { normalizeVariantsForCreate } from "./shared/normalize-variants-for-create.util";
import { toObjectId } from "./shared/to-object-id.util";

/**
 * Creates a product inside an owned store using storeId from request params.
 */
export const createStoreProduct = async (
  storeId: string,
  body: CreateStoreProductInput,
  ownerId: ObjectId | string,
) => {
  const { sid } = await ensureStoreForOwner(storeId, ownerId);

  const categoryId = toObjectId(body.categoryId, "categoryId");
  const category = await Category.findById(categoryId).select("_id").lean();
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const slug = createSlugFromName(body.name);
  const slugExists = await Product.findOne({ slug, storeId: sid } as any)
    .select("_id")
    .lean();
  if (slugExists) {
    throw new AppError("Slug already exists in this store", 400);
  }

  const normalized = normalizeVariantsForCreate(body.variants, body.defaultVariantId);
  const skuList = normalized.variants.map((variant: any) => variant.sku);
  const skuConflict = await Product.findOne({
    storeId: sid,
    "variants.sku": { $in: skuList },
  } as any)
    .select("_id")
    .lean();
  if (skuConflict) {
    throw new AppError("Variant sku already exists in this store", 409);
  }

  const product: any = await Product.create({
    ...body,
    slug,
    storeId: sid,
    categoryId,
    variants: normalized.variants,
    defaultVariantId: normalized.defaultVariantId,
    isActive: true,
  } as any);

  return decorateProductPricing(product.toObject());
};
