import { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import { getOwnedOrderDocument } from "./order-shared.service";
import { notifyOrderEvent } from "../../notifications/services/notify-order-event.service";
import { ORDER_NOTIFICATION_EVENTS } from "../../notifications/constants/order-notification.constants";

export const cancelOrder = async (
  userId: ObjectId | string,
  orderId: ObjectId | string,
) => {
  const order = await getOwnedOrderDocument(String(userId), orderId);

  if (order.orderStatus === "cancelled") {
    return order.toObject();
  }

  if (
    order.orderStatus === "delivered" ||
    order.delivery.status === "delivered"
  ) {
    throw new AppError("Delivered orders cannot be cancelled", 409);
  }

  if (["collecting", "on_the_way"].includes(order.delivery.status)) {
    throw new AppError("Order can no longer be cancelled", 409);
  }

  if (order.payment.method === "online" && order.payment.status === "paid") {
    order.payment.status = "refunded";
  }

  order.orderStatus = "cancelled";
  await order.save();

  // Notify customer and stores about the cancellation
  await notifyOrderEvent(order, ORDER_NOTIFICATION_EVENTS.ORDER_CANCELLED);

  return order.toObject();
};
