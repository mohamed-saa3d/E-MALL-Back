import { NextFunction, Request, Response, RequestHandler } from "express";
import AppError from "../../../utils/app-error";
import { getNotificationsQuerySchema } from "../validations/notification.validation";
import { getNotifications } from "../services";

export const getNotificationsHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { page, limit } = getNotificationsQuerySchema.parse(req.query);
    const notifications = await getNotifications(String(userId), page, limit);

    res.status(200).json({
      status: "success",
      data: {
        notifications,
        page,
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};
