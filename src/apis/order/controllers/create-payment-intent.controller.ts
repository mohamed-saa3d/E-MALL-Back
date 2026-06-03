import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { createPaymentIntent } from "../services/create-payment-intent.service";

export const createPaymentIntentHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const orderId = String(req.params.orderId || "");
    if (!orderId) throw new AppError("Missing orderId", 400);

    const result = await createPaymentIntent(userId, orderId);
    res.status(200).json({
      status: "success",
      message: "Payment intent created successfully",
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
};
