import { Request, Response, NextFunction } from "express";
import * as cartService from "../services/cart.service";
import AppError from "../../../utils/app-error";

const addCartItem: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const variantId = String(req.body.variantId);
    const quantity = req.body.quantity as number | undefined;
    if (!variantId) throw new AppError("variantId is required", 400);

    await cartService.addItemToCart({
      userId,
      variantId,
      quantity,
    });
    res.status(200).json({ status: "success", message: "Item added to cart successfully" });
  } catch (err: any) {
    next(err);
  }
};

export default addCartItem;
