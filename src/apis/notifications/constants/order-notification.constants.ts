/**
 * Order notification events
 * These constants define all notification types related to order lifecycle
 */

export const ORDER_NOTIFICATION_EVENTS = {
  ORDER_CREATED: "order_created",
  ORDER_READY: "order_ready",
  ORDER_CANCELLED: "order_cancelled",
  MISSING_ITEMS: "missing_items",
  STORE_PREPARING: "store_preparing",
  STORE_READY: "store_ready",
  STORE_REJECTED: "store_rejected",
} as const;

export type OrderNotificationEventType =
  (typeof ORDER_NOTIFICATION_EVENTS)[keyof typeof ORDER_NOTIFICATION_EVENTS];

/**
 * Order notification entity types
 */
export const ORDER_NOTIFICATION_ENTITY_TYPES = {
  ORDER: "order",
  STORE_ORDER: "store_order",
} as const;

export type OrderNotificationEntityType =
  (typeof ORDER_NOTIFICATION_ENTITY_TYPES)[keyof typeof ORDER_NOTIFICATION_ENTITY_TYPES];
