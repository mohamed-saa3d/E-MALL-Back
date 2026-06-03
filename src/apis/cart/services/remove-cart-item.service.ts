import { ObjectId } from "mongoose";
import Cart from "../models/cart.model";
import AppError from "../../../utils/app-error";
import { attachCartPricing } from "./attach-cart-pricing.util";

export const removeCartItem = async (
  userId: ObjectId | string,
  variantId: ObjectId | string,
) => {
  const uid =
    typeof userId === "string"
      ? new (require("mongoose").Types.ObjectId)(userId)
      : userId;
  const cart: any = await Cart.findOne({ userId: uid } as any);
  
  if (!cart) throw new AppError("Cart not found", 404);
  const before = cart.items.length;
  cart.items = cart.items.filter(
    (i: any) =>
      i.variantId?.toString() !==
      (typeof variantId === "string" ? variantId : variantId.toString()),
  );
  if (cart.items.length === before) {
    throw new AppError("Item not found in cart", 404);
  }
  await cart.save();
  await attachCartPricing(cart);
  return cart;
};
