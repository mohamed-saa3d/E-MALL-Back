import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../utils/app-error";
import { updateMyOrder } from "../services/update-my-order.service";
import { UpdateStoreOrderInput } from "../validations/store-order.validation";

/**
 * PATCH /stores/:storeId/manage/orders/:orderId - Update order for store (owner/admin)
 */
export const updateMyOrderHandler: RequestHandler = async (
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

    const updates: UpdateStoreOrderInput = req.body;
    await updateMyOrder(storeId, orderId, userId, updates);

    res.status(200).json({
      status: "success",
      message: "Order updated successfully",
    });
  } catch (err: any) {
    next(err);
  }
};
