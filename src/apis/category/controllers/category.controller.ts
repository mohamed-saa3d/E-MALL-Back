import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../utils/app-error";
import {
  getAllCategories,
  getCategoryById,
  createNewCategory,
  updateCategory,
  replaceCategory,
  deleteCategory as deleteCategoryService,
  checkCategoryUsage,
} from "../services/category.service";
import { ObjectId } from "mongoose";
import {
  ICreateCategory,
  IUpdateCategory,
  IReplaceCategory,
} from "../types/category.types";

/**
 * GET /categories - Get all categories
 */
export const listCategories: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await getAllCategories();

    res.status(200).json({
      status: "success",
      data: {
        categories,
        total: categories.length,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * GET /categories/:id - Get single category
 */
export const getCategory: RequestHandler<
  { id: string },
  { status: string; data: { category: any } }
> = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await getCategoryById(id as unknown as ObjectId);

    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * POST /categories - Create new category
 * Only Admin can create
 */
export const createCategory: RequestHandler<
  {},
  { status: string; message: string; data: { category: any } },
  { name: string; parentId?: string }
> = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, parentId } = req.body;

    if (!name) throw new AppError("Missing required fields", 400);

    const data: ICreateCategory = {
      name,
      ...(parentId && { parentId }),
    };

    const category = await createNewCategory(data);

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: {
        category,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * PATCH /categories/:id - Update category (rename)
 * Only Admin can update
 */
export const updateCategoryHandler: RequestHandler<
  { id: string },
  { status: string; message: string; data: { category: any } },
  { name?: string; parentId?: string }
> = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    const data: IUpdateCategory = {};

    if (name) data.name = name;
    if (parentId) data.parentId = parentId;

    const category = await updateCategory(id as unknown as ObjectId, data);

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: {
        category,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * POST /categories/:id/replace - Replace category
 * Only Admin can replace
 */
export const replaceCategoryHandler: RequestHandler<
  { id: string },
  { status: string; message: string; data: any },
  { replacementCategoryId: string }
> = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { replacementCategoryId } = req.body;

    if (!replacementCategoryId || !id)
      throw new AppError("Missing required fields", 400);

    const data: IReplaceCategory = {
      replacementCategoryId,
    };

    const result = await replaceCategory(id as unknown as ObjectId, data);

    res.status(200).json({
      status: "success",
      message:
        "Category replacement processed. Please note: Products and Stores using the old category need to be migrated manually or via a migration script.",
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * GET /categories/:id/usage - Check if category is in use
 */
export const getCategoryUsage: RequestHandler<{id: string}, { status: string; data: any }> = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Verify category exists first
    const category = await getCategoryById(id as unknown as ObjectId);

    const usage = await checkCategoryUsage(id as unknown as ObjectId);

    res.status(200).json({
      status: "success",
      data: {
        ...usage,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * DELETE /categories/:id - Delete category
 * Only Admin can delete
 * Can only delete if not in use
 */
export const deleteCategory: RequestHandler<{id: string}, { status: string; message: string }> = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await deleteCategoryService(id as unknown as ObjectId);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (err: any) {
    next(err);
  }
};
