import Store from "../models/store.model";
import AppError from "../../../utils/app-error";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

/**
 * Soft delete store (mark as inactive)
 * Only owner or admin can delete their own store
 */
export const softDeleteStore = async (
  storeId: ObjectId | string,
  ownerId: ObjectId | string,
): Promise<{ message: string }> => {
  try {
    const storeObjectId =
      typeof storeId === "string"
        ? new mongoose.Types.ObjectId(storeId)
        : storeId;
    const ownerObjectId =
      typeof ownerId === "string"
        ? new mongoose.Types.ObjectId(ownerId)
        : ownerId;
    const store = await Store.findById(storeObjectId);

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    // Verify ownership
    if (store.ownerId.toString() !== ownerObjectId.toString()) {
      throw new AppError("You are not authorized to delete this store", 403);
    }

    store.isActive = false;
    await (store as any).save();

    return { message: "Store deactivated successfully" };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Hard delete store (admin only)
 */
export const hardDeleteStore = async (
  storeId: ObjectId | string,
): Promise<{ message: string }> => {
  try {
    const storeObjectId =
      typeof storeId === "string"
        ? new mongoose.Types.ObjectId(storeId)
        : storeId;
    const store = await Store.findByIdAndUpdate(storeObjectId,{
      $set: {
        deletedAt: new Date(),
      },
    });


    if (!store) {
      throw new AppError("Store not found", 404);
    }

    return { message: "Store deleted permanently" };
  } catch (error: any) {
    throw error;
  }
};
