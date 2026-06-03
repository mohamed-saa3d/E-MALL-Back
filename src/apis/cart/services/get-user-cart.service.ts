import { ObjectId } from "mongoose";
import mongoose from "mongoose";
import Cart from "../models/cart.model";
import { mapCartResponse } from "../../../utils/response-mappers";
import { attachCartPricing } from "./attach-cart-pricing.util";

export const getUserCart = async (userId: ObjectId | string) => {
  const id =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  let cart = await Cart.findOne({ userId: id } as any)
    // .populate("userId", "name email")
    .populate("items.productId", "name slug images")
    // .populate("items.storeId", "name logo")
    .lean();

  if (!cart) {
    const created = await Cart.create({ userId: id, items: [] } as any);
    cart = await Cart.findById(created._id)
      // .populate("userId", "name email")
      .populate("items.productId", "name slug images")
      // .populate("items.storeId", "name logo")
      .lean();
  }

  await attachCartPricing(cart);
  return mapCartResponse(cart, { includeUser: true });
};
