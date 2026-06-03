import Store from "../models/store.model";
import Category from "../../category/models/category.model";
import AppError from "../../../utils/app-error";
import { IStoreResponse } from "../types/store.types";
import mongoose from "mongoose";
import { mapStoreResponse } from "../../../utils/response-mappers";

/**
 * Get stores by category (only active stores for users)
 */
export const getStoresByCategory = async (
  categoryId: string | mongoose.Types.ObjectId,
): Promise<IStoreResponse[]> => {
  try {
    // Verify category exists
    const category = await Category.findById(categoryId).lean();

    
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const objectId = new mongoose.Types.ObjectId(categoryId);
    const stores = await Store.find({
      categoryId: objectId as any,
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    return stores.map((store) =>
      mapStoreResponse({ ...store, categoryId: category }),
    ) as IStoreResponse[];
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get stores by category (admin version - can see all or filtered by status)
 */
export const getStoresByCategoryAdmin = async (
  categoryId: string | mongoose.Types.ObjectId,
  filterByActive?: boolean,
): Promise<IStoreResponse[]> => {
  try {
    // Verify category exists
    const category = await Category.findById(categoryId).lean();

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const objectId = new mongoose.Types.ObjectId(categoryId);
    let query: any = { categoryId: objectId as any };

    if (filterByActive === true) {
      query.isActive = true;
    } else if (filterByActive === false) {
      query.isActive = false;
    }

    const populated = await Store.find(query)
      .populate("ownerId", "name email")
      .sort({ name: 1 })
      .lean();

    return populated.map((store) =>
      mapStoreResponse({ ...store, categoryId: category }, { includeOwner: true }),
    ) as IStoreResponse[];
  } catch (error: any) {
    throw error;
  }
};
