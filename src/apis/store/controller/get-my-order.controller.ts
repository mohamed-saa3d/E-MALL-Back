import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../utils/app-error";
import { getMyOrder } from "../services/get-my-order.service";

/**
 * GET /stores/:storeId/manage/orders/:orderId - Get a single order for store (owner/admin)
 */
export const getMyOrderHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const storeId = String(req.params.storeId || "");
    const orderId = String(req.params.orderId || "");
    if (!storeId || !orderId) {
      throw new AppError("Missing storeId or orderId", 400);
    }

    const order = await getMyOrder(storeId, orderId, userId);
    res.status(200).json({ status: "success", data: { order } });
  } catch (err: any) {
    next(err);
  }
};
