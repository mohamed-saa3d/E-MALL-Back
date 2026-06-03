import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { markAsRead } from "../services";

export const markNotificationReadHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const notificationId = String(req.params.id);
    await markAsRead(String(userId), notificationId);

    res
      .status(200)
      .json({ status: "success", message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
};
