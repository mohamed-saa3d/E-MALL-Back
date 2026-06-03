import { NextFunction, Request, RequestHandler, Response } from "express";
import {
  softDeleteStore,
  hardDeleteStore,
} from "../services/delete-store.service";
import { Role } from "../../auth/models/user.model";
import AppError from "../../../utils/app-error";

/**
 * PATCH /stores/:id/soft-delete - Soft delete (deactivate) store
 * Owner can delete their own store
 */
export const softDeleteStoreHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    const idParam = req.params.id as string;

    const result = await softDeleteStore(idParam, user.id);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * DELETE /stores/:id - Hard delete store
 * Admin only
 */
export const hardDeleteStoreHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;

    if (user.role !== Role.ADMIN) {
      throw new AppError("Only admin can permanently delete stores", 403);
    }

    const idParam = req.params.id as string;
    const result = await hardDeleteStore(idParam);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (err: any) {
    next(err);
  }
};
