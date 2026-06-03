import WishList from "../../wish-list/models/wish-list.model";
import AppError from "../../../utils/app-error";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

/**
 * Get product count in user's wishlist
 * Assumes WishListItem model exists with productId
 */
export const getWishlistProductCount = async (
  userId: ObjectId | string,
  storeId?: ObjectId | string,
): Promise<number> => {
  try {
    const objectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
    const filter: any = { userId: objectId as any };
    if (storeId) {
      filter["items.storeId"] =
        typeof storeId === "string"
          ? new mongoose.Types.ObjectId(storeId)
          : storeId;
    }
    const wishlist = await WishList.findOne(filter).lean();

    if (!wishlist) {
      return 0;
    }

    let count = 0;
    wishlist.items.forEach((i: any) => {
      if (!storeId) {
        count += 1;
      } else if (
        i.storeId &&
        i.storeId.toString() ===
          (typeof storeId === "string" ? storeId : storeId.toString())
      ) {
        count += 1;
      }
    });
    return count;
  } catch (error: any) {
    throw error;
  }
};
