import AppError from "../../../utils/app-error";
import User, { Role } from "../../auth/models/user.model";
import Category, { ICategory } from "../../category/models/category.model";
import Store from "../models/store.model";
import { ICreateStore } from "../types/create-store.types";
import { createNewCategory } from "../../category/services/category.service";

const createNewStore = async (data: ICreateStore) => {
  try {
    const email = data.email;
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const ownerId = user._id;

    const existingStore = await Store.findOne({ name: data.name });

    if (existingStore) {
      throw new AppError("Store with this name already exists", 400);
    }

    if (data.categoryId && data.categoryName) {
      throw new AppError(
        "Please provide either category id or category name",
        400,
      );
    }
    let category: ICategory | null;
    if (data.categoryId) {
      category = await Category.findById(data.categoryId);

      if (!category) {
        throw new AppError("Category not found", 400);
      }
    }

    if (data.categoryName) {
      category = await Category.findOne({ name: data.categoryName });

      if (!category) {
        category = await createNewCategory({ name: data.categoryName });
      }

      data.categoryId = category._id;
    }

    const store = await Store.create({
      name: data.name,
      ownerId: ownerId,
      ...(data.logo && { logo: data.logo }),
      // ...(data.categoryId && { categoryId: data.categoryId }),
      categoryId: data.categoryId,
      ...(data.openingTime && { openingTime: data.openingTime }),
      ...(data.closingTime && { closingTime: data.closingTime }),
      ...(data.authorizedBrand && { authorizedBrand: data.authorizedBrand }),
    });

    user.role=Role.OWNER;
    user.save();
    return {
      storeName: store.name,
      storeId: store._id,
      storeLogo: store.logo,
      storeCategory: category!.name,
      storeOpeningTime: store.openingTime,
      storeClosingTime: store.closingTime,
      user:{
        name: user.name,
        email: user.email
      }
    };
  } catch (error) {
    throw error;
  }
};

export default createNewStore;
