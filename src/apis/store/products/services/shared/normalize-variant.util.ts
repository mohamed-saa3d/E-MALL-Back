import mongoose from "mongoose";
import AppError from "../../../../../utils/app-error";
import { validateSaleWindow } from "./validate-sale-window.util";

/**
 * Normalizes a variant payload into the shape expected by Product document.
 */
export const normalizeVariant = (variant: any, keepId = false) => {
  const sku = String(variant.sku || "").trim();
  if (!sku) {
    throw new AppError("Variant sku is required", 400);
  }

  validateSaleWindow(variant);

  return {
    ...variant,
    _id:
      keepId && variant._id && mongoose.Types.ObjectId.isValid(String(variant._id))
        ? new mongoose.Types.ObjectId(String(variant._id))
        : new mongoose.Types.ObjectId(),
    sku,
    saleStartAt: variant.saleStartAt ? new Date(variant.saleStartAt) : undefined,
    saleEndAt: variant.saleEndAt ? new Date(variant.saleEndAt) : undefined,
    attributes: Array.isArray(variant.attributes) ? variant.attributes : [],
    images: Array.isArray(variant.images) ? variant.images : [],
  };
};
