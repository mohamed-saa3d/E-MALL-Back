import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { getUnreadNotifications } from "../services";

export const getUnreadNotificationsHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const notifications = await getUnreadNotifications(String(userId));
    res.status(200).json({ status: "success", data: { notifications } });
  } catch (err) {
    next(err);
  }
};
