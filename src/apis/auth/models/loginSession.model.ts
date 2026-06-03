import mongoose from "mongoose";
import ILoginSession from "../types/loginSession.types";

export const LoginSessionSchema = new mongoose.Schema<ILoginSession>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      unique: true,
      required: true,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// explicit indexes
LoginSessionSchema.index({ userId: 1 });
// TTL index: expire documents once expiresAt has passed
LoginSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const LoginSession = mongoose.model<ILoginSession>("LoginSession", LoginSessionSchema);

export default LoginSession;