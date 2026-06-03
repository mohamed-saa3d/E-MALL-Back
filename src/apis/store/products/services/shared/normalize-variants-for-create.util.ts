import mongoose from "mongoose";
import AppError from "../../../../../utils/app-error";
import { CreateStoreProductInput } from "../../validations/store-product.validation";
import { normalizeVariant } from "./normalize-variant.util";

/**
 * Normalizes product variants during creation and resolves the default variant id.
 */
export const normalizeVariantsForCreate = (
  variants: CreateStoreProductInput["variants"],
  defaultVariantId?: string,
) => {
  const skuSet = new Set<string>();
  const normalized = variants.map((variant) => {
    const next = normalizeVariant(variant);
    const skuKey = String(next.sku).toLowerCase();
    if (skuSet.has(skuKey)) {
      throw new AppError(`Duplicate variant sku: ${next.sku}`, 400);
    }
    skuSet.add(skuKey);
    return next;
  });

  let selectedDefaultId = defaultVariantId;
  if (!selectedDefaultId) {
    selectedDefaultId = String(
      normalized.find((variant) => variant.isDefault)?._id || normalized[0]._id,
    );
  }

  if (!mongoose.Types.ObjectId.isValid(selectedDefaultId)) {
    throw new AppError("Invalid defaultVariantId", 400);
  }

  const exists = normalized.some(
    (variant) => String(variant._id) === String(selectedDefaultId),
  );
  if (!exists) {
    throw new AppError("defaultVariantId must reference one of the variants", 400);
  }

  normalized.forEach((variant) => {
    variant.isDefault = String(variant._id) === String(selectedDefaultId);
  });

  return {
    variants: normalized,
    defaultVariantId: new mongoose.Types.ObjectId(selectedDefaultId),
  };
};
