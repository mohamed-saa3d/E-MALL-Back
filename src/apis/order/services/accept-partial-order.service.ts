import { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import { getOwnedOrderDocument } from "./order-shared.service";
import { applyDerivedOrderStatus } from "./recompute-order-status.service";

export const acceptPartialOrder = async (
  userId: ObjectId | string,
  orderId: ObjectId | string,
) => {
  const order = await getOwnedOrderDocument(String(userId), orderId);

  if (order.orderStatus !== "waiting_customer_decision") {
    throw new AppError("Order is not waiting for customer decision", 409);
  }

  const missingItemIds = new Set(
    order.missingItems.map((item) => String(item.orderItemId || item.itemId)),
  );

  order.stores = order.stores
    .map((store) => {
      const nextItems = store.items.filter(
        (item) => !missingItemIds.has(String(item._id)),
      );

      store.items = nextItems;

      if (store.status === "rejected") {
        store.status = nextItems.length > 0 ? "pending" : store.status;
        store.rejectionReason = undefined;
      }

      return store;
    })
    .filter((store) => store.items.length > 0);

  if (order.stores.length === 0) {
    throw new AppError(
      "No items remain after removing missing items. Cancel the order instead.",
      409,
    );
  }

  order.missingItems = [];

  applyDerivedOrderStatus(order);
  await order.save();

  return order.toObject();
};
