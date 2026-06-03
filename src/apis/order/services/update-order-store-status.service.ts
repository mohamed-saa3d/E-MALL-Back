import mongoose from "mongoose";
import AppError from "../../../utils/app-error";
import { ensureStoreForOwner } from "../../store/products/services/shared/ensure-store-for-owner.util";
import { IMissingOrderItem, StoreOrderStatus } from "../models/order.model";
import {
  getOrderDocument,
  idsEqual,
  toOrderObjectId,
} from "./order-shared.service";
import { applyDerivedOrderStatus } from "./recompute-order-status.service";
import { notifyOrderEvent } from "../../notifications/services/notify-order-event.service";
import { ORDER_NOTIFICATION_EVENTS } from "../../notifications/constants/order-notification.constants";

interface MissingItemInput {
  orderItemId: mongoose.Types.ObjectId | string;
  reason: string;
}

interface UpdateOrderStoreStatusInput {
  orderId: mongoose.Types.ObjectId | string;
  storeId: mongoose.Types.ObjectId | string;
  ownerId: mongoose.Types.ObjectId | string;
  status?: StoreOrderStatus;
  rejectionReason?: string;
  missingItems?: MissingItemInput[];
}

export const updateOrderStoreStatus = async (
  input: UpdateOrderStoreStatusInput,
) => {
  const { sid } = await ensureStoreForOwner(
    String(input.storeId),
    input.ownerId as any,
  );
  const order = await getOrderDocument(input.orderId);

  const storeSection = order.stores.find((store) =>
    idsEqual(store.storeId, sid),
  );
  if (!storeSection) {
    throw new AppError("Order does not include this store", 404);
  }

  const nextMissingItems: IMissingOrderItem[] = [];
  const reasonText = String(input.rejectionReason || "").trim();
  const inferredStatus =
    input.status ||
    (reasonText || (input.missingItems && input.missingItems.length > 0)
      ? "rejected"
      : undefined);

  if (!inferredStatus) {
    throw new AppError("At least one update field is required", 400);
  }

  if (inferredStatus === "rejected") {
    if (
      !reasonText &&
      (!input.missingItems || input.missingItems.length === 0)
    ) {
      throw new AppError(
        "rejectionReason or missingItems is required when rejecting a store order",
        400,
      );
    }

    for (const missingItem of input.missingItems || []) {
      const orderItemId = toOrderObjectId(
        missingItem.orderItemId,
        "orderItemId",
      );
      const itemExists = storeSection.items.some((item) =>
        idsEqual(item._id, orderItemId),
      );
      const itemReason = String(missingItem.reason || "").trim();

      if (!itemExists) {
        throw new AppError(
          "Missing order item does not belong to this store",
          400,
        );
      }

      if (!itemReason) {
        throw new AppError("Missing item reason is required", 400);
      }

      nextMissingItems.push({
        _id: new mongoose.Types.ObjectId(),
        storeId: sid,
        orderItemId,
        reason: itemReason,
      });
    }
  }

  order.missingItems = order.missingItems.filter(
    (missingItem) => !idsEqual(missingItem.storeId, sid),
  );

  if (nextMissingItems.length > 0) {
    order.missingItems.push(...nextMissingItems);
  }

  storeSection.status = inferredStatus;
  if (inferredStatus === "rejected") {
    storeSection.rejectionReason =
      reasonText ||
      nextMissingItems.map((missingItem) => missingItem.reason).join(", ");
  } else {
    storeSection.rejectionReason = undefined;
  }

  applyDerivedOrderStatus(order);
  await order.save();

  // Send notifications based on the store status update
  if (inferredStatus === "ready") {
    // Notify about order readiness if all stores are ready
    await notifyOrderEvent(order, ORDER_NOTIFICATION_EVENTS.ORDER_READY);
  } else if (inferredStatus === "rejected") {
    // Notify customer about missing/rejected items
    await notifyOrderEvent(order, ORDER_NOTIFICATION_EVENTS.MISSING_ITEMS);
  }
};
