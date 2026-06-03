import Notification from "../model/notification.model";
import {
  CreateNotificationInput,
  INotification,
} from "../types/notification.types";
import { emitNotificationToUser } from "../../../socket/socket.server";
import { toObjectId } from "../../store/products/services/shared/to-object-id.util";

export async function createNotification(
  input: CreateNotificationInput,
): Promise<INotification> {
  const recipientId = toObjectId(String(input.recipientId), "recipientId");
  const entityId = toObjectId(String(input.entityId), "entityId");

  const notification = await Notification.create({
    recipientId: recipientId as any,
    title: input.title,
    message: input.message,
    type: input.type,
    entityType: input.entityType,
    entityId: entityId as any,
  } as any);

  emitNotificationToUser(String(recipientId), notification);

  return notification as unknown as INotification;
}
