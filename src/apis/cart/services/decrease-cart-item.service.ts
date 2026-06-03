import { ObjectId } from "mongoose";
import Cart from "../models/cart.model";
import AppError from "../../../utils/app-error";
import { findVariant } from "./selectVariant.util";
import { attachCartPricing } from "./attach-cart-pricing.util";

interface DecreaseCartItemParams {
  userId: ObjectId | string;
  variantId: ObjectId | string;
  quantity?: number;
}

export const decreaseCartItem = async (params: DecreaseCartItemParams) => {
  const { userId, variantId, quantity = 1 } = params;
  const uid =
    typeof userId === "string"
      ? new (require("mongoose").Types.ObjectId)(userId)
      : userId;

  if (quantity < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  await findVariant(variantId);

  const cart: any = await Cart.findOne({ userId: uid } as any);
  if (!cart) throw new AppError("Cart not found", 404);

  const itemIndex = cart.items.findIndex(
    (item: any) =>
      item.variantId?.toString() ===
      (typeof variantId === "string" ? variantId : variantId.toString()),
  );

  if (itemIndex === -1) {
    throw new AppError("Item not found in cart", 404);
  }

  const item = cart.items[itemIndex];
  item.quantity -= quantity;

  if (item.quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  }

  await cart.save();
  await attachCartPricing(cart);
  return cart;
};
