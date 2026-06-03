import { NextFunction, Request, RequestHandler, Response } from "express";
import { getMyOrders } from "../services/get-my-orders.service";
import AppError from "../../../utils/app-error";

/**
 * GET /stores/:storeId/manage/orders - Get orders for a store (owner/admin)
 */
export const getMyOrdersHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const storeIdParam = String(req.params.storeId || "");
    if (!storeIdParam) throw new AppError("Missing storeId", 400);

    const orders = await getMyOrders(storeIdParam, userId);

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
