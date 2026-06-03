import { NextFunction, Request, RequestHandler, Response } from "express";
import {
  getStoresByCategory,
  getStoresByCategoryAdmin,
} from "../services/get-stores-by-category.service";
import { Role } from "../../auth/models/user.model";

/**
 * GET /stores/category/:categoryId - Get stores by category
 * Users see only active stores in the category
 * Admin can filter by status
 */
export const listStoresByCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryIdParam = req.params.categoryId as string;
    const user = req.user;
    let stores;

    if (user && user.role === Role.ADMIN) {
      // Admin can filter by status
      const filterByActive = req.query.active as string;
      let filter: boolean | undefined = undefined;

      if (filterByActive === "true") filter = true;
      else if (filterByActive === "false") filter = false;

      stores = await getStoresByCategoryAdmin(categoryIdParam, filter);
    } else {
      // Users only see active stores
      stores = await getStoresByCategory(categoryIdParam);
    }

    const total = stores.length;

    res.status(200).json({
      status: "success",
      data: {
        stores,
        total,
      },
    });
  } catch (err: any) {
    next(err);
  }
};
