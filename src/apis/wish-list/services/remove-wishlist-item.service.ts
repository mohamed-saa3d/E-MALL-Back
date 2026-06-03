import { ObjectId } from "mongoose";
import WishList from "../models/wish-list.model";
import AppError from "../../../utils/app-error";

export const removeItemFromWishList = async (
  userId: ObjectId | string,
  variantId: ObjectId | string,
) => {
  const uid =
    typeof userId === "string"
      ? new (require("mongoose").Types.ObjectId)(userId)
      : userId;
  const list: any = await WishList.findOne({ userId: uid } as any);
  if (!list) throw new AppError("Wishlist not found", 404);
  const before = list.items.length;
  list.items = list.items.filter(
    (i: any) =>
      i.variantId?.toString() !==
      (typeof variantId === "string" ? variantId : variantId.toString()),
  );
  if (list.items.length === before) {
    throw new AppError("Item not found in wishlist", 404);
  }
  await list.save();
  return list;
};
