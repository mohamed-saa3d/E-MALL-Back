import mongoose from "mongoose";

const { Schema } = mongoose;

export const STORE_ORDER_STATUSES = [
  "pending",
  "preparing",
  "ready",
  "rejected",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "waiting_store_acceptance",
  "waiting_customer_decision",
  "waiting_payment",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_METHODS = ["cod", "online"] as const;
export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;
export const DELIVERY_STATUSES = [
  "none",
  "assigned",
  "collecting",
  "on_the_way",
  "delivered",
] as const;

export type StoreOrderStatus = (typeof STORE_ORDER_STATUSES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface IBuyerAddressSnapshot {
  street: string;
  city: string;
  distanceMark: string;
}

export interface IBuyerSnapshot {
  name: string;
  phone: string;
  address: IBuyerAddressSnapshot;
}

export interface IOrderStoreItem {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId: mongoose.Types.ObjectId;
  productNameSnapshot: string;
  variantSnapshot: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrderStore {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  storeNameSnapshot: string;
  status: StoreOrderStatus;
  rejectionReason?: string;
  items: IOrderStoreItem[];
  subtotal: number;
}

export interface IMissingOrderItem {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  orderItemId: mongoose.Types.ObjectId;
  itemId?: mongoose.Types.ObjectId;
  reason: string;
}

export interface IOrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
}

export interface IOrderDelivery {
  riderId?: mongoose.Types.ObjectId;
  status: DeliveryStatus;
}

export interface IOrderTotals {
  itemsTotal: number;
  deliveryFee: number;
  grandTotal: number;
}

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  buyerSnapshot: IBuyerSnapshot;
  stores: IOrderStore[];
  missingItems: IMissingOrderItem[];
  orderStatus: OrderStatus;
  payment: IOrderPayment;
  delivery: IOrderDelivery;
  totals: IOrderTotals;
  createdAt: Date;
  updatedAt: Date;
}

const BuyerAddressSnapshotSchema = new Schema<IBuyerAddressSnapshot>(
  {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    distanceMark: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const BuyerSnapshotSchema = new Schema<IBuyerSnapshot>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: BuyerAddressSnapshotSchema,
      required: true,
    },
  },
  { _id: false },
);

const OrderStoreItemSchema = new Schema<IOrderStoreItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    variantId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    productNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    variantSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

const OrderStoreSchema = new Schema<IOrderStore>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    storeNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: STORE_ORDER_STATUSES,
      required: true,
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    items: {
      type: [OrderStoreItemSchema],
      required: true,
      validate: {
        validator(items: IOrderStoreItem[]) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "Store items are required",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

const MissingOrderItemSchema = new Schema<IMissingOrderItem>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    orderItemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true },
);

const PaymentSchema = new Schema<IOrderPayment>(
  {
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      required: true,
      default: "pending",
    },
  },
  { _id: false },
);

const DeliverySchema = new Schema<IOrderDelivery>(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: DELIVERY_STATUSES,
      required: true,
      default: "none",
    },
  },
  { _id: false },
);

const TotalsSchema = new Schema<IOrderTotals>(
  {
    itemsTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerSnapshot: {
      type: BuyerSnapshotSchema,
      required: true,
    },
    stores: {
      type: [OrderStoreSchema],
      required: true,
      validate: {
        validator(stores: IOrderStore[]) {
          return Array.isArray(stores) && stores.length > 0;
        },
        message: "Order stores are required",
      },
    },
    missingItems: {
      type: [MissingOrderItemSchema],
      default: [],
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
      default: "pending",
    },
    payment: {
      type: PaymentSchema,
      required: true,
    },
    delivery: {
      type: DeliverySchema,
      required: true,
    },
    totals: {
      type: TotalsSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

OrderSchema.pre("validate", function () {
  let itemsTotal = 0;

  if (Array.isArray(this.stores)) {
    this.stores.forEach((store) => {
      let subtotal = 0;

      if (Array.isArray(store.items)) {
        store.items.forEach((item) => {
          item.totalPrice = item.quantity * item.unitPrice;
          subtotal += item.totalPrice;
        });
      }

      store.subtotal = subtotal;

      if (store.status !== "rejected") {
        store.rejectionReason = undefined;
      }

      itemsTotal += subtotal;
    });
  }

  if (!this.totals) {
    this.totals = {
      itemsTotal: 0,
      deliveryFee: 0,
      grandTotal: 0,
    };
  }

  this.totals.itemsTotal = itemsTotal;
  this.totals.deliveryFee = this.totals.deliveryFee ?? 0;
  this.totals.grandTotal = this.totals.itemsTotal + this.totals.deliveryFee;
});

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ "stores.storeId": 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ "delivery.riderId": 1, "delivery.status": 1 });

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
