import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { markAllAsRead } from "../services";

export const markAllNotificationsReadHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    await markAllAsRead(String(userId));
    res
      .status(200)
      .json({ status: "success", message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};
