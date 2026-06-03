import { ObjectId } from "mongoose";
import WishList from "../models/wish-list.model";
import { findVariant } from "./findVariant.util";

interface AddWishItemParams {
  userId: ObjectId | string;
  variantId: ObjectId | string;
}

export const addItemToWishList = async (params: AddWishItemParams) => {
  const { userId, variantId } = params;
  const uid =
    typeof userId === "string"
      ? new (require("mongoose").Types.ObjectId)(userId)
      : userId;
  const { productId, storeId, vid } = await findVariant(variantId);

  const list: any = await WishList.findOne({ userId: uid } as any);
  if (!list) {
    const newList = await WishList.create({
      userId: uid,
      items: [{ productId, variantId, storeId }],
    } as any);
    return newList;
  }

  // avoid duplicates
  const exists = list.items.find(
    (i: any) => i.variantId?.toString() === vid.toString(),
  );
  if (exists) {
    return list; // nothing to do
  }

  list.items.push({ productId, variantId, storeId });
  await list.save();
  return list;
};
