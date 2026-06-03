import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/app-error";
import { removeItemFromWishList } from "../services/remove-wishlist-item.service";

const removeWishItem: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const variantId = String(req.params.variantId);
    if (!variantId) throw new AppError("variantId is required", 400);
    await removeItemFromWishList(userId, variantId);
    res.status(200).json({ status: "success", message: "Item removed from wishlist successfully" });
  } catch (err: any) {
    next(err);
  }
};

export default removeWishItem;
