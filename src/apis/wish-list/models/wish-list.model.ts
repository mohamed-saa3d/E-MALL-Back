import mongoose, { ObjectId } from "mongoose";

interface IWishListItem {
  _id: string;
  // to support variant-specific wishlist we store variantId as well
  productId: ObjectId;
  variantId?: ObjectId;
  storeId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const wishListItemSchema = new mongoose.Schema<IWishListItem>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
  },
);
export interface IWishList {
  _id: string;
  userId: ObjectId;
  items: IWishListItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishListSchema = new mongoose.Schema<IWishList>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [wishListItemSchema],
  },
  {
    timestamps: true,
  },
);

const WishList = mongoose.model("WishList", WishListSchema);

export default WishList;
