import { Request, Response, NextFunction } from "express";
import AppError from "../../../utils/app-error";
import { getUserWishList } from "../services/get-wishlist.service";

const getWishList: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const list = await getUserWishList(userId);
    res.status(200).json({ status: "success", data: list });
  } catch (err: any) {
    next(err);
  }
};

export default getWishList;
