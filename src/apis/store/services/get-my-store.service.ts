import { ObjectId } from "mongoose";
import { IStoreResponse } from "../types/store.types";
import { ensureStoreForOwner } from "../products/services/shared/ensure-store-for-owner.util";
import { mapStoreResponse } from "../../../utils/response-mappers";

/**
 * Get my store (owner's store)
 */
export const getMyStore = async (
  storeId: string,
  ownerId: ObjectId | string,
): Promise<IStoreResponse> => {
  try {
    const { store } = await ensureStoreForOwner(storeId, ownerId);
    await (store as any).populate([
      { path: "categoryId", select: "name slug" },
      { path: "ownerId", select: "name email" },
    ]);
    return mapStoreResponse((store as any).toObject(), {
      includeOwner: true,
    }) as IStoreResponse;
  } catch (error: any) {
    throw error;
  }
};
