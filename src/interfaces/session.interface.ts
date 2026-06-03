import { ObjectId } from "mongoose";

export interface ISession {
  _id: ObjectId | string;
  sessionToken: string;
  userId?: ObjectId | string;
  isGuest: boolean;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
}