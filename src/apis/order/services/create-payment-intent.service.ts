import { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import { getOwnedOrderDocument } from "./order-shared.service";
import { applyDerivedOrderStatus } from "./recompute-order-status.service";

export const createPaymentIntent = async (
  userId: ObjectId | string,
  orderId: ObjectId | string,
) => {
  const order = await getOwnedOrderDocument(String(userId), orderId);

  if (order.orderStatus === "cancelled") {
    throw new AppError("Cancelled orders cannot be paid", 409);
  }

  if (order.payment.method !== "online") {
    throw new AppError("This order does not use online payment", 400);
  }

  if (order.orderStatus !== "waiting_payment") {
    throw new AppError("Order is not waiting for payment", 409);
  }

  if (order.payment.status === "paid") {
    throw new AppError("Order is already paid", 409);
  }

  order.payment.status = "pending";
  applyDerivedOrderStatus(order);
  await order.save();

  return {
    order: order.toObject(),
    paymentIntent: {
      provider: "stub",
      id: `pi_${order._id}_${Date.now()}`,
      clientSecret: `pi_secret_${order._id}`,
      amount: order.totals.grandTotal,
      currency: "EGP",
      status: "requires_confirmation",
    },
  };
};
