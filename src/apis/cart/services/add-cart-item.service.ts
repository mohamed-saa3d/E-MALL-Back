import { ObjectId } from "mongoose";
import Cart from "../models/cart.model";
import AppError from "../../../utils/app-error";
import { findVariant } from "./selectVariant.util";
import mongoose from "mongoose";
import { attachCartPricing } from "./attach-cart-pricing.util";

interface AddCartItemParams {
  userId: ObjectId | string;
  variantId: ObjectId | string;
  quantity?: number;
}

export const addItemToCart = async (params: AddCartItemParams) => {
  const { userId, variantId, quantity = 1 } = params;
  if (quantity < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  const uid =
    typeof userId === "string"
      ? new mongoose.Types.ObjectId(userId)
      : userId;
  const { productId, storeId, vid } = await findVariant(variantId);

  const cart: any = await Cart.findOne({ userId: uid } as any);
  if (!cart) {
    // create and push
    const newCart = await Cart.create({
      userId: uid,
      items: [
        {
          productId,
          variantId,
          storeId,
          quantity,
        },
      ],
    } as any);
    await attachCartPricing(newCart);
    return newCart;
  }

  // check if variant already exists in cart
  const existing = cart.items.find(
    (i: any) => i.variantId?.toString() === vid.toString(),
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      variantId,
      storeId,
      quantity,
    });
  }
  await cart.save();
  await attachCartPricing(cart);
  return cart;
};
