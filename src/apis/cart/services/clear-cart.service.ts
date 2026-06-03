import { ObjectId } from "mongoose";
import Cart from "../models/cart.model";
export const clearUserCart = async (userId: ObjectId | string) => {
  const uid =
    typeof userId === "string"
      ? new (require("mongoose").Types.ObjectId)(userId)
      : userId;
  // either delete or set items=[]
  await Cart.updateOne({ userId: uid } as any, { $set: { items: [] } });
};
