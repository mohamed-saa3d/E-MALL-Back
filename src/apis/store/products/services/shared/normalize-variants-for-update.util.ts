import mongoose from "mongoose";
import AppError from "../../../../../utils/app-error";
import { normalizeVariant } from "./normalize-variant.util";

/**
 * Normalizes product variants during update and validates default variant reference.
 */
export const normalizeVariantsForUpdate = (
  variants: any[],
  currentDefaultVariantId: any,
  defaultVariantId?: string,
) => {
  if (variants.length === 0) {
    throw new AppError("Product must contain at least one variant", 400);
  }

  const skuSet = new Set<string>();
  const normalized = variants.map((variant) => {
    const next = normalizeVariant(variant, true);
    const skuKey = String(next.sku).toLowerCase();
    if (skuSet.has(skuKey)) {
      throw new AppError(`Duplicate variant sku: ${next.sku}`, 400);
    }
    skuSet.add(skuKey);
    return next;
  });

  let selectedDefaultId = defaultVariantId || String(currentDefaultVariantId || "");
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
