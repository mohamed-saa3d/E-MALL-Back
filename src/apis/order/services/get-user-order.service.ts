import { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import { mapOrderResponse } from "../../../utils/response-mappers";
import Order from "../models/order.model";

export const getUserOrder = async (
  userId: ObjectId | string,
  orderId: ObjectId | string,
) => {
  const order = await Order.findOne({ _id: orderId, userId } as any).lean();

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return mapOrderResponse(order);
};
