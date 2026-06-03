export const NotificationEvent = {
  order_created: "order_created",
  order_ready: "order_ready",
  order_cancelled: "order_cancelled",
  missing_items: "missing_items",
  payment_required: "payment_required",
  payment_success: "payment_success",
  payment_failed: "payment_failed",
  delivery_assigned: "delivery_assigned",
  out_for_delivery: "out_for_delivery",
  order_delivered: "order_delivered",
} as const;

export type NotificationEventType =
  (typeof NotificationEvent)[keyof typeof NotificationEvent];

export const NotificationEntityType = {
  order: "order",
  payment: "payment",
  delivery: "delivery",
} as const;

export type NotificationEntityType =
  (typeof NotificationEntityType)[keyof typeof NotificationEntityType];

export type NotificationRecipient = "customer" | "store" | "rider";

export interface NotificationEventDefinition {
  description: string;
  recipient: NotificationRecipient;
  entityType: NotificationEntityType;
}

export const NotificationEventDefinitions: Record<
  NotificationEventType,
  NotificationEventDefinition
> = {
  order_created: {
    description:
      "Triggered when a new order is created and requires store owner attention.",
    recipient: "store",
    entityType: NotificationEntityType.order,
  },
  order_ready: {
    description:
      "Triggered when an order is ready for delivery and should notify the customer.",
    recipient: "customer",
    entityType: NotificationEntityType.order,
  },
  order_cancelled: {
    description:
      "Triggered when an order is cancelled and should notify the customer.",
    recipient: "customer",
    entityType: NotificationEntityType.order,
  },
  missing_items: {
    description:
      "Triggered when an order is missing items and requires customer or store attention.",
    recipient: "customer",
    entityType: NotificationEntityType.order,
  },
  payment_required: {
    description: "Triggered when a payment is required for an order.",
    recipient: "customer",
    entityType: NotificationEntityType.payment,
  },
  payment_success: {
    description: "Triggered when payment succeeds for an order.",
    recipient: "customer",
    entityType: NotificationEntityType.payment,
  },
  payment_failed: {
    description: "Triggered when payment fails for an order.",
    recipient: "customer",
    entityType: NotificationEntityType.payment,
  },
  delivery_assigned: {
    description: "Triggered when a delivery agent is assigned to an order.",
    recipient: "rider",
    entityType: NotificationEntityType.delivery,
  },
  out_for_delivery: {
    description:
      "Triggered when an order is out for delivery and should notify the customer.",
    recipient: "customer",
    entityType: NotificationEntityType.order,
  },
  order_delivered: {
    description:
      "Triggered when an order is delivered and should notify the customer.",
    recipient: "customer",
    entityType: NotificationEntityType.order,
  },
};
