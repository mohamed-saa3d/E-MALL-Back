import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/app-error";
import { clearUserWishList } from "../services/clear-wishlist.service";

const clearWishList: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    await clearUserWishList(userId);
    res.status(200).json({ status: "success", message: "Wishlist cleared" });
  } catch (err: any) {
    next(err);
  }
};

export default clearWishList;
