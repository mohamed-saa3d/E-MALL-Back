import AppError from "../../../utils/app-error";
import { getOrderDocument } from "./order-shared.service";
import { applyDerivedOrderStatus } from "./recompute-order-status.service";

export type PaymentWebhookEvent =
  | "payment.succeeded"
  | "payment.failed"
  | "payment.refunded";

export const handlePaymentWebhook = async (
  orderId: string,
  event: PaymentWebhookEvent,
) => {
  const order = await getOrderDocument(orderId);

  if (order.payment.method !== "online") {
    throw new AppError("Order is not configured for online payment", 400);
  }

  if (event === "payment.succeeded") {
    order.payment.status = "paid";
    applyDerivedOrderStatus(order);
  } else if (event === "payment.failed") {
    order.payment.status = "failed";
    applyDerivedOrderStatus(order);
  } else {
    if (order.orderStatus !== "cancelled") {
      throw new AppError("Refund webhook is only valid for cancelled orders", 409);
    }

    order.payment.status = "refunded";
  }

  await order.save();
  return order.toObject();
};
