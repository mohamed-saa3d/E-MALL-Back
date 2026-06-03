import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/app-error";
import { addItemToWishList } from "../services/add-wishlist-item.service";

const addWishItem: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const variantId = String(req.body.variantId);
    if (!variantId) throw new AppError("variantId is required", 400);
    await addItemToWishList({ userId, variantId });
    res.status(200).json({ status: "success", message: "Item added to wishlist successfully" });
  } catch (err: any) {
    next(err);
  }
};

export default addWishItem;
