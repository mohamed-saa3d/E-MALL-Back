import mongoose from "mongoose";
import { INotification } from "../types/notification.types";
import {
  NotificationEvent,
  NotificationEntityType,
} from "../constants/notification.constants";

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(NotificationEvent),
    },
    entityType: {
      type: String,
      required: true,
      enum: Object.values(NotificationEntityType),
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, isRead: 1 });

const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);

export default Notification;
