import { Request, Response, NextFunction } from "express";
import * as cartService from "../services/cart.service";
import AppError from "../../../utils/app-error";

const removeCartItem: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const variantId = String(req.params.variantId);
    if (!variantId) throw new AppError("variantId is required", 400);

    await cartService.removeCartItem(userId, variantId);
    res.status(200).json({ status: "success", message: "Item removed from cart successfully" });
  } catch (err: any) {
    next(err);
  }
};

export default removeCartItem;
