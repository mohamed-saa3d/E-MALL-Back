import { ObjectId } from "mongoose";
import WishList from "../models/wish-list.model";

export const clearUserWishList = async (userId: ObjectId | string) => {
  const uid =
    typeof userId === "string"
      ? new (require("mongoose").Types.ObjectId)(userId)
      : userId;

  await WishList.updateOne({ userId: uid } as any, { $set: { items: [] } });
};
