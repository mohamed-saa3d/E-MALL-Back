import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { getUserOrders } from "../services/get-user-orders.service";

export const getUserOrdersHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const orders = await getUserOrders(userId);
    res.status(200).json({
      status: "success",
      data: {
        orders,
        total: orders.length,
      },
    });
  } catch (err: any) {
    next(err);
  }
};
