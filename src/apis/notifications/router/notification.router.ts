import { Router } from "express";
import authorized from "../../../middlewares/authentication";
import validate from "../../../middlewares/validate-params.middleware";
import { getNotificationsHandler } from "../controllers/get-notifications.controller";
import { getUnreadNotificationsHandler } from "../controllers/get-unread-notifications.controller";
import { getUnreadCountHandler } from "../controllers/get-unread-count.controller";
import { markNotificationReadHandler } from "../controllers/mark-notification-read.controller";
import { markAllNotificationsReadHandler } from "../controllers/mark-all-notifications-read.controller";
import { deleteNotificationHandler } from "../controllers/delete-notification.controller";
import { notificationIdParamsSchema } from "../validations/notification.validation";

const notificationRouter = Router();

notificationRouter.use(authorized);

notificationRouter.get("/", getNotificationsHandler);
notificationRouter.get("/unread", getUnreadNotificationsHandler);
notificationRouter.get("/unread-count", getUnreadCountHandler);
notificationRouter.patch(
  "/:id/read",
  validate(notificationIdParamsSchema),
  markNotificationReadHandler,
);
notificationRouter.patch("/read-all", markAllNotificationsReadHandler);
notificationRouter.delete(
  "/:id",
  validate(notificationIdParamsSchema),
  deleteNotificationHandler,
);

export default notificationRouter;
