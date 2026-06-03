import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { getUnreadCount } from "../services";

export const getUnreadCountHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const count = await getUnreadCount(String(userId));
    res.status(200).json({ status: "success", data: { count } });
  } catch (err) {
    next(err);
  }
};
