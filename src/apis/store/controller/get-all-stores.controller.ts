import { NextFunction, Request, RequestHandler, Response } from "express";
import {
  getAllActiveStores,
  getAllStoresAdmin,
} from "../services/get-all-stores.service";
import { Role } from "../../auth/models/user.model";

/**
 * GET /stores - Get all stores
 * Users see only active stores
 * Admin can filter by status
 */
export const listAllStores: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    let stores;
    let total;


    if (user && user.role === Role.ADMIN) {
      // Admin can filter by status
      const filterByActive = req.query.active as string;
      let filter: boolean | undefined = undefined;

      if (filterByActive === "true") filter = true;
      else if (filterByActive === "false") filter = false;

      stores = await getAllStoresAdmin(filter);
    } else {
      // Users only see active stores
      stores = await getAllActiveStores();
    }

    total = stores.length;

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
