import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { cancelOrder } from "../services/cancel-order.service";

export const cancelOrderHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const orderId = String(req.params.orderId || "");
    if (!orderId) throw new AppError("Missing orderId", 400);

    const order = await cancelOrder(userId, orderId);
    res.status(200).json({
      status: "success",
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (err: any) {
    next(err);
  }
};
