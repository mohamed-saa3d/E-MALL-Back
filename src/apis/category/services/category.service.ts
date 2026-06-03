import mongoose, { ObjectId } from "mongoose";
import Category from "../models/category.model";
import AppError from "../../../utils/app-error";
import createSlugFromName from "../../../utils/create-slug-from-name";
import { mapCategoryResponse } from "../../../utils/response-mappers";
import {
  ICreateCategory,
  IUpdateCategory,
  IReplaceCategory,
} from "../types/category.types";

/**
 * Get all categories sorted alphabetically
 */
export const getAllCategories = async () => {
  try {
    const categories = await Category.find()
      .populate("parentId", "name slug")
      .sort({ name: 1 })
      .lean();
    return categories.map(mapCategoryResponse);
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId: ObjectId) => {
  try {
    const category = await Category.findById(categoryId)
      .populate("parentId", "name slug")
      .lean();

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return mapCategoryResponse(category);
  } catch (error: any) {
    throw error;
  }
};

/**
 * Create new category
 */
export const createNewCategory = async (data: ICreateCategory) => {
  try {
    // Check if category with same name exists
    const existingCategory = await Category.findOne({
      name: new RegExp(`^${data.name}$`, "i"),
    });

    if (existingCategory) {
      throw new AppError("Category with this name already exists", 400);
    }

    // If parentId provided, verify it exists
    if (data.parentId) {
      const parentExists = await Category.findById(data.parentId);
      if (!parentExists) {
        throw new AppError("Parent category does not exist", 404);
      }
    }

    const slug = createSlugFromName(data.name);

    const category = await Category.create({
      name: data.name,
      slug,
      ...(data.parentId && { parentId: data.parentId }),
    });

    return category;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update category (rename)
 */
export const updateCategory = async (
  categoryId: ObjectId,
  data: IUpdateCategory,
) => {
  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // Check if new name already exists (if name is being changed)
    if (data.name && data.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: new RegExp(`^${data.name}$`, "i"),
        _id: { $ne: categoryId },
      });

      if (existingCategory) {
        throw new AppError("Category with this name already exists", 400);
      }

      category.name = data.name;
      category.slug = createSlugFromName(data.name);
    }

    // Update parent if provided
    if (data.parentId) {
      const parentExists = await Category.findById(data.parentId);
      if (!parentExists) {
        throw new AppError("Parent category does not exist", 404);
      }
      category.parentId = data.parentId;
    }

    await category.save();
    return category;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Replace category - move all usages to new category then delete old
 * This function needs Product and Store models to be updated
 */
export const replaceCategory = async (
  categoryId: ObjectId,
  replacementData: IReplaceCategory,
) => {
  try {
    const oldCategory = await Category.findById(categoryId);

    if (!oldCategory) {
      throw new AppError("Category to be replaced not found", 404);
    }

    const newCategory = await Category.findById(
      replacementData.replacementCategoryId,
    );

    if (!newCategory) {
      throw new AppError("Replacement category not found", 404);
    }

    if (
      categoryId.toString() === replacementData.replacementCategoryId.toString()
    ) {
      throw new AppError("Cannot replace category with itself", 400);
    }

    // Note: This function assumes that Product and Store models will handle the migration
    // Here we just verify both categories exist and return the replacement ID
    // The actual data migration should be done in the controller or a separate migration service

    return {
      oldCategoryId: categoryId,
      newCategoryId: replacementData.replacementCategoryId,
      oldCategoryName: oldCategory.name,
      newCategoryName: newCategory.name
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Check if category is being used
 */
export const checkCategoryUsage = async (categoryId: ObjectId) => {
  try {
    // Import models dynamically to avoid circular dependencies
    let Product;
    let Store;

    try {
      Product =
        require("../../product/models/product.model").default ||
        require("../../product/models/product.model");
      Store =
        require("../../store/models/store.model").default ||
        require("../../store/models/store.model");
    } catch (e) {
      // Models might not exist yet, return empty usage
      return { productCount: 0, storeCount: 0 };
    }

    const productCount = await Product.countDocuments({ categoryId });
    const storeCount = await Store.countDocuments({ categoryId });

    return {
      productCount,
      storeCount,
      isInUse: productCount > 0 || storeCount > 0,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Delete category (only if not in use)
 */
export const deleteCategory = async (categoryId: ObjectId) => {
  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // Check if category is being used
    const usage = await checkCategoryUsage(categoryId);

    if (usage.isInUse) {
      throw new AppError(
        `Cannot delete category. It is currently used in ${usage.productCount} product(s) and ${usage.storeCount} store(s). Please replace or rename it instead.`,
        400,
      );
    }

    await Category.findByIdAndDelete(categoryId);
    return { message: "Category deleted successfully" };
  } catch (error: any) {
    throw error;
  }
};
