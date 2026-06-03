import AppError from "../../../../../utils/app-error";
import Store from "../../../models/store.model";
import { toObjectId } from "./to-object-id.util";

/**
 * Ensures a store is publicly visible (exists and active).
 */
export const ensureStoreForPublic = async (storeId: string) => {
  const sid = toObjectId(storeId, "storeId");
  const store = await Store.findById(sid).lean();

  if (!store || !store.isActive) {
    throw new AppError("Store not found", 404);
  }

  return sid;
};
