import Store from "../models/store.model";
import AppError from "../../../utils/app-error";
import { IStoreResponse } from "../types/store.types";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";
import { mapStoreResponse } from "../../../utils/response-mappers";

/**
 * Get my store by owner id (owner/admin)
 */
export const getMyStoreByOwner = async (
  ownerId: ObjectId | string,
): Promise<IStoreResponse> => {
  try {
    const objectId =
      typeof ownerId === "string"
        ? new mongoose.Types.ObjectId(ownerId)
        : ownerId;

    const store = await Store.findOne({ ownerId: objectId as any })
      .populate("categoryId", "name slug")
      .populate("ownerId", "name email")
      .lean();

    if (!store) {
      throw new AppError("Store not found. Please create a store first.", 404);
    }

    return mapStoreResponse(store, { includeOwner: true }) as IStoreResponse;
  } catch (error: any) {
    throw error;
  }
};
