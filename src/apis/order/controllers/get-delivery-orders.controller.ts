import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { getDeliveryOrders } from "../services/get-delivery-orders.service";

export const getDeliveryOrdersHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || !role) throw new AppError("Unauthorized", 401);

    const orders = await getDeliveryOrders(userId, role as any);
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
