import { Request, Response, NextFunction } from "express";
import * as cartService from "../services/cart.service";
import AppError from "../../../utils/app-error";

const decreaseCartItem: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const variantId = String(req.params.variantId);
    const quantity = req.body.quantity as number | undefined;

    if (!variantId) throw new AppError("variantId is required", 400);

    await cartService.decreaseCartItem({
      userId,
      variantId,
      quantity,
    });

    res.status(200).json({ status: "success", message: "Cart item decreased successfully" });
  } catch (err: any) {
    next(err);
  }
};

export default decreaseCartItem;
