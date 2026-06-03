import Notification from "../model/notification.model";
import { toObjectId } from "../../store/products/services/shared/to-object-id.util";

export async function getUnreadCount(
  userId: string,
): Promise<{ count: number }> {
  const recipientId = toObjectId(userId, "user id");
  const count = await Notification.countDocuments({
    recipientId,
    isRead: false,
  } as any);
  return { count };
}
