import { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import { Product } from "../../products-and-variants/model/products-and-variants.model";

export const findVariant = async (variantId: ObjectId | string) => {
  const vid =
    typeof variantId === "string"
      ? new (require("mongoose").Types.ObjectId)(variantId)
      : variantId;

  const product = await Product.findOne(
    { "variants._id": vid, isActive: true } as any,
    { variants: { $elemMatch: { _id: vid } }, storeId: 1 },
  ).lean();
  if (!product || !product.variants || product.variants.length === 0) {
    throw new AppError("Variant not found", 404);
  }
  const variant: any = product.variants[0];
  return { productId: product._id, variant, storeId: product.storeId, vid };
};
