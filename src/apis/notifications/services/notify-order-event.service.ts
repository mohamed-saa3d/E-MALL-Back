import mongoose from "mongoose";
import Order from "../../order/models/order.model";
import AppError from "../../../utils/app-error";
import { createNotification } from "./index";
import {
  ORDER_NOTIFICATION_EVENTS,
  ORDER_NOTIFICATION_ENTITY_TYPES,
  OrderNotificationEventType,
} from "../constants/order-notification.constants";
import { toObjectId } from "../../store/products/services/shared/to-object-id.util";

/**
 * Centralized handler for all order-related notifications
 *
 * This function:
 * - Resolves recipients based on event type
 * - Maps order events to notification types
 * - Calls createNotification() for each recipient
 * - Ensures all business rules are in one place
 *
 * @param order - The order document
 * @param eventType - The notification event type
 */
export async function notifyOrderEvent(
  order: InstanceType<typeof Order>,
  eventType: OrderNotificationEventType,
): Promise<void> {
  try {
    switch (eventType) {
      case ORDER_NOTIFICATION_EVENTS.ORDER_CREATED:
        await notifyOrderCreated(order);
        break;

      case ORDER_NOTIFICATION_EVENTS.ORDER_READY:
        await notifyOrderReady(order);
        break;

      case ORDER_NOTIFICATION_EVENTS.MISSING_ITEMS:
        await notifyMissingItems(order);
        break;

      case ORDER_NOTIFICATION_EVENTS.ORDER_CANCELLED:
        await notifyOrderCancelled(order);
        break;

      default:
        // Silently ignore unknown event types
        break;
    }
  } catch (error: any) {
    // Log but don't throw - notification failure shouldn't break order flow
    console.error(
      `[NotifyOrderEvent] Failed to notify for event ${eventType}:`,
      error.message,
    );
  }
}

/**
 * Notify when an order is created
 * Recipients: customer + all involved stores
 */
async function notifyOrderCreated(
  order: InstanceType<typeof Order>,
): Promise<void> {
  const orderId = String(order._id);
  const customerId = order.userId;
  const storeIds = order.stores.map((store: any) => store.storeId);

  // Notify customer
  await createNotification({
    recipientId: String(customerId) as any,
    title: "Order Confirmed",
    message: `Your order has been created successfully. Order ID: ${orderId}`,
    type: ORDER_NOTIFICATION_EVENTS.ORDER_CREATED,
    entityType: ORDER_NOTIFICATION_ENTITY_TYPES.ORDER,
    entityId: order._id as any,
  });

  // Notify all involved stores
  for (const storeId of storeIds) {
    await createNotification({
      recipientId: String(storeId) as any,
      title: "New Order Received",
      message: `You received a new order. Order ID: ${orderId}`,
      type: ORDER_NOTIFICATION_EVENTS.ORDER_CREATED,
      entityType: ORDER_NOTIFICATION_ENTITY_TYPES.ORDER,
      entityId: order._id as any,
    });
  }
}

/**
 * Notify when an order is ready
 * Recipient: customer only (if all stores are ready)
 */
async function notifyOrderReady(
  order: InstanceType<typeof Order>,
): Promise<void> {
  // Check if all stores are ready
  const allStoresReady = order.stores.every(
    (store: any) => store.status === "ready",
  );

  if (!allStoresReady) {
    // Not all stores are ready yet, skip notification
    return;
  }

  const orderId = String(order._id);

  await createNotification({
    recipientId: String(order.userId) as any,
    title: "Order Ready",
    message: `Your order is ready for pickup/delivery. Order ID: ${orderId}`,
    type: ORDER_NOTIFICATION_EVENTS.ORDER_READY,
    entityType: ORDER_NOTIFICATION_ENTITY_TYPES.ORDER,
    entityId: order._id as any,
  });
}

/**
 * Notify when order has missing/rejected items
 * Recipient: customer only
 */
async function notifyMissingItems(
  order: InstanceType<typeof Order>,
): Promise<void> {
  // Only notify if there are actually missing items
  if (!order.missingItems || order.missingItems.length === 0) {
    return;
  }

  const orderId = String(order._id);

  // Build a descriptive message about missing items
  const missingItemsCount = order.missingItems.length;
  const message =
    missingItemsCount === 1
      ? `1 item in your order is unavailable.`
      : `${missingItemsCount} items in your order are unavailable.`;

  await createNotification({
    recipientId: String(order.userId) as any,
    title: "Items Unavailable",
    message: `${message} Order ID: ${orderId}`,
    type: ORDER_NOTIFICATION_EVENTS.MISSING_ITEMS,
    entityType: ORDER_NOTIFICATION_ENTITY_TYPES.ORDER,
    entityId: order._id as any,
  });
}

/**
 * Notify when an order is cancelled
 * Recipient: customer + all involved stores
 */
async function notifyOrderCancelled(
  order: InstanceType<typeof Order>,
): Promise<void> {
  const orderId = String(order._id);
  const storeIds = order.stores.map((store: any) => store.storeId);

  // Notify customer
  await createNotification({
    recipientId: String(order.userId) as any,
    title: "Order Cancelled",
    message: `Your order has been cancelled. Order ID: ${orderId}`,
    type: ORDER_NOTIFICATION_EVENTS.ORDER_CANCELLED,
    entityType: ORDER_NOTIFICATION_ENTITY_TYPES.ORDER,
    entityId: order._id as any,
  });

  // Notify all involved stores
  for (const storeId of storeIds) {
    await createNotification({
      recipientId: String(storeId) as any,
      title: "Order Cancelled",
      message: `An order has been cancelled. Order ID: ${orderId}`,
      type: ORDER_NOTIFICATION_EVENTS.ORDER_CANCELLED,
      entityType: ORDER_NOTIFICATION_ENTITY_TYPES.ORDER,
      entityId: order._id as any,
    });
  }
}
