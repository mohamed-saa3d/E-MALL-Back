import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { collectDeliveryOrder } from "../services/delivery-actions.service";

export const collectDeliveryOrderHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || !role) throw new AppError("Unauthorized", 401);

    const orderId = String(req.params.orderId || "");
    if (!orderId) throw new AppError("Missing orderId", 400);

    const order = await collectDeliveryOrder(orderId, userId, role as any);
    res.status(200).json({
      status: "success",
      message: "Delivery collection started successfully",
      data: { order },
    });
  } catch (err: any) {
    next(err);
  }
};
