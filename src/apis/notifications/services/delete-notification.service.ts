import Notification from "../model/notification.model";
import AppError from "../../../utils/app-error";
import { toObjectId } from "../../store/products/services/shared/to-object-id.util";

export async function deleteNotification(
  userId: string,
  notificationId: string,
): Promise<void> {
  const recipientId = toObjectId(userId, "user id");
  const id = toObjectId(notificationId, "notification id");

  const notification = await Notification.findOneAndDelete({
    _id: id,
    recipientId,
  } as any)
    .lean()
    .exec();

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }
}
