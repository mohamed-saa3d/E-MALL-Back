import { ObjectId } from "mongoose";
import AppError from "../../../../../utils/app-error";
import Store from "../../../models/store.model";
import { toObjectId } from "./to-object-id.util";

/**
 * Ensures the store exists and belongs to the authenticated owner/admin context.
 */
export const ensureStoreForOwner = async (
  storeId: string,
  ownerId: ObjectId | string,
) => {
  const sid = toObjectId(storeId, "storeId");
  const store = await Store.findById(sid);

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  if (store.ownerId.toString() !== ownerId.toString()) {
    throw new AppError("You do not own this store", 403);
  }

  return { sid, store };
};
