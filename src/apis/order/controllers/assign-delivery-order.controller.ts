import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { assignDeliveryOrder } from "../services/delivery-actions.service";
import { AssignDeliveryInput } from "../validations/assign-delivery.validation";

export const assignDeliveryOrderHandler: RequestHandler = async (
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

    const payload = req.body as AssignDeliveryInput;
    const order = await assignDeliveryOrder(orderId, userId, role as any, payload.riderId);
    res.status(200).json({
      status: "success",
      message: "Delivery assigned successfully",
      data: { order },
    });
  } catch (err: any) {
    next(err);
  }
};
