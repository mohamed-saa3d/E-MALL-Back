import { ObjectId } from "mongoose";
import environment from "../../../config/environment";
import AppError from "../../../utils/app-error";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import LoginSession from "../models/loginSession.model";
import createAuthTokens from "../../../utils/auth-tokens";
import hashRefreshToken from "../../../utils/hash-refresh-token";

const changePassword = async (
  id: ObjectId,
  oldPassword: string,
  newPassword: string,
  confirmNewPassword: string,
) => {
  const user = await User.findById(id).select("+hashPassword");

  if (!user) {
    throw new AppError("User not found", 400);
  }

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.hashPassword);

  if (!isPasswordMatch) {
    throw new AppError("Invalid old password", 401);
  }

  if (oldPassword === newPassword) {
    throw new AppError("New password cannot be the same as the old password", 401);
  }

  if (newPassword !== confirmNewPassword) {
    throw new AppError("New password and confirm password do not match", 401);
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    environment.BCRYPT_SALT,
  );

  await user.updateOne({ hashPassword: hashedPassword });

  const oldSessions = await LoginSession.find({ userId: user._id, revokedAt: null });

  const { token, refreshToken, expiresAt } = await createAuthTokens(user._id);

  const hashedRefreshToken = hashRefreshToken(refreshToken);

  // Revoke all existing active sessions
  if (oldSessions && oldSessions.length > 0) {
    await LoginSession.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  }

  // Create a new session for the user with the rotated token
  await LoginSession.create({
    refreshToken: hashedRefreshToken,
    expiresAt,
    userId: user._id,
    lastUsedAt: new Date(),
  });

  return true;
};

export default changePassword;
