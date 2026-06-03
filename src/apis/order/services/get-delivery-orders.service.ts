import { ObjectId } from "mongoose";
import Order from "../models/order.model";
import { mapOrderResponse } from "../../../utils/response-mappers";
import { Role } from "../../auth/models/user.model";

export const getDeliveryOrders = async (
  userId: ObjectId | string,
  role: Role,
) => {
  const filter: any = {
    orderStatus: { $in: ["ready_for_delivery", "out_for_delivery"] },
  };

  if (role === Role.FULFILLMENT) {
    filter.$or = [
      { "delivery.riderId": userId },
      { orderStatus: "ready_for_delivery", "delivery.status": "none" },
    ];
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return orders.map((order) => mapOrderResponse(order));
};
