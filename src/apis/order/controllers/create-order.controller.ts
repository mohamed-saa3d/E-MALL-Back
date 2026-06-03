import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { createOrder } from "../services/create-order.service";
import { CreateOrderInput } from "../validations/create-order.validation";

export const createOrderHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const payload = req.body as CreateOrderInput;
    const order = await createOrder({
      userId: String(userId),
      addressId: payload.addressId,
      paymentMethod: payload.paymentMethod,
    });

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: { order },
    });
  } catch (err: any) {
    next(err);
  }
};
