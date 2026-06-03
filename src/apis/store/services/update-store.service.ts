import Store from "../models/store.model";
import AppError from "../../../utils/app-error";
import { IStoreResponse, IUpdateStoreRequest } from "../types/store.types";
import { ObjectId } from "mongoose";
import Category from "../../category/models/category.model";
import createSlugFromName from "../../../utils/create-slug-from-name";
import { ensureStoreForOwner } from "../products/services/shared/ensure-store-for-owner.util";
import { mapStoreResponse } from "../../../utils/response-mappers";

/**
 * Update store (owner only)
 */
export const updateMyStore = async (
  storeId: string,
  ownerId: ObjectId | string,
  updateData: IUpdateStoreRequest,
): Promise<IStoreResponse> => {
  try {
    const { store } = await ensureStoreForOwner(storeId, ownerId);

    // Verify category if provided
    if (updateData.categoryId) {
      const categoryExists = await Category.findById(updateData.categoryId);
      if (!categoryExists) {
        throw new AppError("Category not found", 404);
      }
      store.categoryId = updateData.categoryId;
    }

    if (updateData.name) {
      const existingStore = await Store.findOne({
        name: updateData.name,
        _id: { $ne: store._id },
      });
      if (existingStore) {
        throw new AppError("Store name already exists", 400);
      }
      store.name = updateData.name;
    }

    if (updateData.logo) {
      store.logo = updateData.logo;
    }

    if (updateData.openingTime) {
      store.openingTime = updateData.openingTime;
    }

    if (updateData.closingTime) {
      store.closingTime = updateData.closingTime;
    }

    if (updateData.authorizedBrand) {
      store.authorizedBrand = updateData.authorizedBrand;
    }

    if (updateData.isActive !== undefined) {
      store.isActive = updateData.isActive;
    }

    const savedStore = await (store as any).save();
    await (savedStore as any).populate([
      { path: "categoryId", select: "name slug" },
      { path: "ownerId", select: "name email" },
    ]);
    return mapStoreResponse((savedStore as any).toObject(), {
      includeOwner: true,
    }) as IStoreResponse;
  } catch (error: any) {
    throw error;
  }
};
