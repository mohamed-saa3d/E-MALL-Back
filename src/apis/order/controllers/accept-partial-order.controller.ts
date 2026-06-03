import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { acceptPartialOrder } from "../services/accept-partial-order.service";

export const acceptPartialOrderHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const orderId = String(req.params.orderId || "");
    if (!orderId) throw new AppError("Missing orderId", 400);

    const order = await acceptPartialOrder(userId, orderId);
    res.status(200).json({
      status: "success",
      message: "Partial order accepted successfully",
      data: { order },
    });
  } catch (err: any) {
    next(err);
  }
};
