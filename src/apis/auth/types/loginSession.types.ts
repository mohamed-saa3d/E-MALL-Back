import { ObjectId } from "mongoose";

export interface ILoginSession {
  _id?: string;
  userId: ObjectId;
  refreshToken: string; // hashed
  ip?: string | null;
  userAgent?: string | null;
  lastUsedAt?: Date | null;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export default ILoginSession;
