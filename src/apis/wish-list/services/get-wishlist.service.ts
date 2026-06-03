import { ObjectId } from "mongoose";
import mongoose from "mongoose";
import WishList from "../models/wish-list.model";
import { mapWishListResponse } from "../../../utils/response-mappers";

export const getUserWishList = async (userId: ObjectId | string) => {
  const uid =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  let list = await WishList.findOne({ userId: uid } as any)
    .populate("userId", "name email")
    .populate("items.productId", "name slug images")
    .populate("items.storeId", "name logo")
    .lean();
  if (!list) {
    const created = await WishList.create({ userId: uid, items: [] } as any);
    list = await WishList.findById(created._id)
      .populate("userId", "name email")
      .populate("items.productId", "name slug images")
      .populate("items.storeId", "name logo")
      .lean();
  }
  return mapWishListResponse(list, { includeUser: true });
};
