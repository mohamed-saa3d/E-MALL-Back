import Notification from "../model/notification.model";
import { toObjectId } from "../../store/products/services/shared/to-object-id.util";

export async function markAllAsRead(userId: string): Promise<void> {
  const recipientId = toObjectId(userId, "user id");
  await Notification.updateMany({ recipientId, isRead: false } as any, {
    isRead: true,
    readAt: new Date(),
  }).exec();
}
