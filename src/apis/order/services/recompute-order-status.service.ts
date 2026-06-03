import mongoose from "mongoose";
import Order, { IOrder, OrderStatus } from "../models/order.model";
import { getOrderDocument } from "./order-shared.service";

type OrderStatusSource = Pick<IOrder, "stores" | "payment" | "delivery" | "orderStatus">;

export const deriveOrderStatus = (order: OrderStatusSource): OrderStatus => {
  if (order.orderStatus === "cancelled") {
    return "cancelled";
  }

  if (order.delivery.status === "delivered") {
    return "delivered";
  }

  if (order.delivery.status === "on_the_way") {
    return "out_for_delivery";
  }

  if (order.stores.some((store) => store.status === "rejected")) {
    return "waiting_customer_decision";
  }

  const allStoresReady =
    order.stores.length > 0 &&
    order.stores.every((store) => store.status === "ready");

  if (allStoresReady) {
    if (order.payment.method === "online" && order.payment.status !== "paid") {
      return "waiting_payment";
    }

    return "ready_for_delivery";
  }

  const anyStoreTouched = order.stores.some((store) => store.status !== "pending");
  return anyStoreTouched ? "waiting_store_acceptance" : "pending";
};

export const applyDerivedOrderStatus = (order: {
  stores: IOrder["stores"];
  payment: IOrder["payment"];
  delivery: IOrder["delivery"];
  orderStatus: OrderStatus;
}) => {
  const nextStatus = deriveOrderStatus(order);
  order.orderStatus = nextStatus;
  return nextStatus;
};

export const recomputeOrderStatus = async (
  orderId: mongoose.Types.ObjectId | string,
) => {
  const order = await getOrderDocument(orderId);
  applyDerivedOrderStatus(order);
  await order.save();
  return order.toObject();
};
