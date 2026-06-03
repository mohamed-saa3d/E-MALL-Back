import Notification from "../model/notification.model";
import { INotification } from "../types/notification.types";
import { toObjectId } from "../../store/products/services/shared/to-object-id.util";

export async function getNotifications(
  userId: string,
  page = 1,
  limit = 20,
): Promise<INotification[]> {
  const recipientId = toObjectId(userId, "user id");
  const skip = (page - 1) * limit;

  return Notification.find({ recipientId } as any)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec() as Promise<INotification[]>;
}
