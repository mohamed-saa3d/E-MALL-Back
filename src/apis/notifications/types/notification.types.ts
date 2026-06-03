import { ObjectId } from "mongoose";
import {
  NotificationEntityType,
  NotificationEventType,
} from "../constants/notification.constants";

export interface INotification {
  _id: ObjectId;
  recipientId: ObjectId;
  title: string;
  message: string;
  type: NotificationEventType;
  entityType: NotificationEntityType;
  entityId: ObjectId;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  recipientId: ObjectId | string;
  title: string;
  message: string;
  type: NotificationEventType;
  entityType: NotificationEntityType;
  entityId: ObjectId | string;
}
