import Cart from "../../cart/models/cart.model";
import AppError from "../../../utils/app-error";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

/**
 * Get product count in user's cart from specific store
 * Cart items are embedded inside the Cart document (`cart.items`).
 */
export const getCartProductCount = async (
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

    const cart = await Cart.findOne(filter).lean();

    if (!cart) {
      return 0;
    }

    // sum the quantities of items (filtered by store if needed)
    let count = 0;
    cart.items.forEach((i: any) => {
      if (!storeId) {
        count += i.quantity || 0;
      } else if (
        i.storeId &&
        i.storeId.toString() ===
          (typeof storeId === "string" ? storeId : storeId.toString())
      ) {
        count += i.quantity || 0;
      }
    });
    return count;
  } catch (error: any) {
    throw error;
  }
};
