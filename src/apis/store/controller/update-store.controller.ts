import { NextFunction, Request, RequestHandler, Response } from "express";
import { updateMyStore } from "../services/update-store.service";
import { IUpdateStoreRequest } from "../types/store.types";
import AppError from "../../../utils/app-error";

/**
 * PATCH /stores/:storeId/manage/settings - Update store settings (owner/admin)
 */
export const updateMyStoreHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const storeId = String(req.params.storeId || "");
    if (!storeId) throw new AppError("Missing storeId", 400);
    const updateData: IUpdateStoreRequest = req.body;

    const store = await updateMyStore(storeId, userId, updateData);

    res.status(200).json({
      status: "success",
      message: "Store updated successfully",
      data: {
        store,
      },
    });
  } catch (err: any) {
    next(err);
  }
};
