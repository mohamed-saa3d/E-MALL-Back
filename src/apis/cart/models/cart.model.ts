import mongoose, { ObjectId } from "mongoose";

interface ICarTItems {
  productId: ObjectId;
  variantId: ObjectId;
  quantity: number;
  storeId: ObjectId;
}

export interface ICart {
  _id: string;
  userId: ObjectId;
  items: ICarTItems[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new mongoose.Schema<ICarTItems>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Variant",
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },

  },
);

export const CartSchema = new mongoose.Schema<ICart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [CartItemSchema],
  },
  {
    timestamps: true,
  },
);

CartSchema.index({ userId: 1 });

const Cart = mongoose.model("Cart", CartSchema);

export default Cart;
