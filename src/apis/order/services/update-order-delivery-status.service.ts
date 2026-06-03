import mongoose from "mongoose";
import AppError from "../../../utils/app-error";
import { DeliveryStatus } from "../models/order.model";
import { getOrderDocument, toOrderObjectId } from "./order-shared.service";
import {
  applyDerivedOrderStatus,
  deriveOrderStatus,
} from "./recompute-order-status.service";

interface UpdateOrderDeliveryStatusInput {
  orderId: mongoose.ObjectId | mongoose.Types.ObjectId | string;
  status: DeliveryStatus;
  riderId?: mongoose.ObjectId | mongoose.Types.ObjectId | string;
}

const allowedTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  none: ["assigned"],
  assigned: ["collecting"],
  collecting: ["on_the_way"],
  on_the_way: ["delivered"],
  delivered: [],
};

export const updateOrderDeliveryStatus = async (
  input: UpdateOrderDeliveryStatusInput,
) => {
  const order = await getOrderDocument(input.orderId);
  const currentDerivedStatus = deriveOrderStatus(order);

  if (currentDerivedStatus !== "ready_for_delivery" && input.status === "assigned") {
    throw new AppError("Order is not ready for delivery assignment", 409);
  }

  if (
    !["ready_for_delivery", "out_for_delivery", "delivered"].includes(
      currentDerivedStatus,
    ) &&
    input.status !== "assigned"
  ) {
    throw new AppError("Order is not in a deliverable state", 409);
  }

  const allowedNext = allowedTransitions[order.delivery.status];
  if (!allowedNext.includes(input.status)) {
    throw new AppError("Invalid delivery status transition", 409);
  }

  if (input.status === "assigned") {
    if (!input.riderId) {
      throw new AppError("riderId is required when assigning delivery", 400);
    }

    order.delivery.riderId = toOrderObjectId(input.riderId, "riderId");
  } else if (!order.delivery.riderId) {
    throw new AppError("Delivery rider is not assigned", 409);
  }

  order.delivery.status = input.status;
  applyDerivedOrderStatus(order);
  await order.save();

  return order.toObject();
};
