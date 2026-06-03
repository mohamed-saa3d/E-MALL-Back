import { NextFunction, Request, RequestHandler, Response } from "express";
import { getMyStore } from "../services/get-my-store.service";
import AppError from "../../../utils/app-error";

/**
 * GET /stores/:storeId/manage/settings - Get store settings (owner/admin)
 * Owner only
 */
export const getMyStoreHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const storeId = String(req.params.storeId || "");
    if (!storeId) throw new AppError("Missing storeId", 400);

    const store = await getMyStore(storeId, userId);

    res.status(200).json({
      status: "success",
      data: {
        store,
      },
    });
  } catch (err: any) {
    next(err);
  }
};
