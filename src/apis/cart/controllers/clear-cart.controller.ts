import { Request, Response, NextFunction } from "express";
import * as cartService from "../services/cart.service";
import AppError from "../../../utils/app-error";

const clearCart: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    await cartService.clearUserCart(userId);
    res.status(200).json({ status: "success", message: "Cart cleared" });
  } catch (err: any) {
    next(err);
  }
};

export default clearCart;
