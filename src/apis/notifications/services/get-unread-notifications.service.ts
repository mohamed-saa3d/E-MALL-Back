import Notification from "../model/notification.model";
import { INotification } from "../types/notification.types";
import { toObjectId } from "../../store/products/services/shared/to-object-id.util";

export async function getUnreadNotifications(
  userId: string,
): Promise<INotification[]> {
  const recipientId = toObjectId(userId, "user id");
  return Notification.find({ recipientId, isRead: false } as any)
    .sort({ createdAt: -1 })
    .lean()
    .exec() as Promise<INotification[]>;
}
