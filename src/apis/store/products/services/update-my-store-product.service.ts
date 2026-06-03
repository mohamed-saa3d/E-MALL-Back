import mongoose, { ObjectId } from "mongoose";
import AppError from "../../../../utils/app-error";
import createSlugFromName from "../../../../utils/create-slug-from-name";
import Category from "../../../category/models/category.model";
import { Product } from "../../../products-and-variants/model/products-and-variants.model";
import { UpdateStoreProductInput } from "../validations/store-product.validation";
import { decorateProductPricing } from "./shared/decorate-product-pricing.util";
import { ensureStoreForOwner } from "./shared/ensure-store-for-owner.util";
import { normalizeVariant } from "./shared/normalize-variant.util";
import { normalizeVariantsForUpdate } from "./shared/normalize-variants-for-update.util";
import { toObjectId } from "./shared/to-object-id.util";

/**
 * Updates a store product with ownership checks and variant/default validation.
 */
export const updateMyStoreProduct = async (
  storeId: string,
  productId: string,
  body: UpdateStoreProductInput,
  ownerId: ObjectId | string,
) => {
  const { sid } = await ensureStoreForOwner(storeId, ownerId);
  const pid = toObjectId(productId, "productId");
  const product = await Product.findOne({ _id: pid, storeId: sid } as any);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (body.name && body.name !== product.name) {
    const nextSlug = createSlugFromName(body.name);
    const slugConflict = await Product.findOne({
      _id: { $ne: product._id },
      storeId: sid,
      slug: nextSlug,
    } as any)
      .select("_id")
      .lean();
    if (slugConflict) {
      throw new AppError("Product slug already exists in this store", 400);
    }
    product.name = body.name;
    product.slug = nextSlug;
  }

  if (body.categoryId !== undefined) {
    const categoryId = toObjectId(body.categoryId, "categoryId");
    const category = await Category.findById(categoryId).select("_id").lean();
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    (product as any).categoryId = categoryId;
  }

  if (body.variants !== undefined) {
    const normalized = normalizeVariantsForUpdate(
      body.variants as any[],
      product.defaultVariantId,
      body.defaultVariantId,
    );

    const skuList = normalized.variants.map((variant: any) => variant.sku);
    const storeSkuConflict = await Product.findOne({
      _id: { $ne: product._id },
      storeId: sid,
      "variants.sku": { $in: skuList },
    } as any)
      .select("_id")
      .lean();
    if (storeSkuConflict) {
      throw new AppError("Variant sku already exists in this store", 409);
    }

    (product as any).variants = normalized.variants;
    (product as any).defaultVariantId = normalized.defaultVariantId;
  } else if (body.defaultVariantId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(body.defaultVariantId)) {
      throw new AppError("Invalid defaultVariantId", 400);
    }
    const exists = product.variants.some(
      (variant: any) => String(variant._id) === String(body.defaultVariantId),
    );
    if (!exists) {
      throw new AppError("defaultVariantId must reference one of the variants", 400);
    }
    (product as any).defaultVariantId = new mongoose.Types.ObjectId(body.defaultVariantId);
    product.variants.forEach((variant: any) => {
      variant.isDefault = String(variant._id) === String(product.defaultVariantId);
    });
  }

  if (body.addVariant !== undefined) {
    const normalizedVariant = normalizeVariant(body.addVariant);
    const skuKey = String(normalizedVariant.sku).toLowerCase();

    const duplicateInProduct = product.variants.some(
      (variant: any) => String(variant.sku).toLowerCase() === skuKey,
    );
    if (duplicateInProduct) {
      throw new AppError("Variant sku already exists in this product", 409);
    }

    const storeSkuConflict = await Product.findOne({
      _id: { $ne: product._id },
      storeId: sid,
      "variants.sku": normalizedVariant.sku,
    } as any)
      .select("_id")
      .lean();
    if (storeSkuConflict) {
      throw new AppError("Variant sku already exists in this store", 409);
    }

    product.variants.push(normalizedVariant as any);

    const shouldBeDefault =
      normalizedVariant.isDefault === true || !product.defaultVariantId;

    if (shouldBeDefault) {
      (product as any).defaultVariantId = normalizedVariant._id as any;
      product.variants.forEach((variant: any) => {
        variant.isDefault =
          String(variant._id) === String(product.defaultVariantId);
      });
    } else {
      normalizedVariant.isDefault = false;
    }
  }

  const updatableFields = [
    "description",
    "brand",
    "basePrice",
    "images",
    "tags",
    "isActive",
  ] as const;

  updatableFields.forEach((field) => {
    if (body[field] !== undefined) {
      (product as any)[field] = body[field];
    }
  });

  await product.save();
  return decorateProductPricing((product as any).toObject());
};
