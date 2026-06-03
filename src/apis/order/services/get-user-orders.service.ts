import { ObjectId } from "mongoose";
import Order from "../models/order.model";
import { mapOrderResponse } from "../../../utils/response-mappers";

export const getUserOrders = async (userId: ObjectId | string) => {
  const orders = await Order.find({ userId } as any)
    .sort({ createdAt: -1 })
    .lean();

  return orders.map((order) => mapOrderResponse(order));
};
