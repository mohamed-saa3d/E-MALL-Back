import Notification from "../model/notification.model";
import AppError from "../../../utils/app-error";
import { INotification } from "../types/notification.types";
import { toObjectId } from "../../store/products/services/shared/to-object-id.util";

export async function markAsRead(
  userId: string,
  notificationId: string,
): Promise<INotification> {
  const recipientId = toObjectId(userId, "user id");
  const id = toObjectId(notificationId, "notification id");

  const notification = (await Notification.findOneAndUpdate(
    { _id: id, recipientId } as any,
    { isRead: true, readAt: new Date() },
    { new: true },
  )
    .lean()
    .exec()) as INotification | null;

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return notification;
}
