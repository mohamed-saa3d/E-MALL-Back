import bcrypt from "bcrypt";
import LoginSession from "../models/loginSession.model";
import AppError from "../../../utils/app-error";
import createAuthTokens from "../../../utils/auth-tokens";
import hashRefreshToken from "../../../utils/hash-refresh-token";
import User from "../models/user.model";

const loginUser = async (
  email: string,
  password: string,
  ip?: string | null,
  userAgent?: string | null,
) => {
  const user = await User.findOne({ email }).select("+hashPassword");
  if (!user) {
    throw new AppError("User not found", 400);
  }
  if (user.isActive === false) {
    throw new AppError(
      "User is deactivated please login and reset your password to reactivate",
      400,
    );
  }

  const isPasswordMatch = await bcrypt.compare(password, user.hashPassword);
  if (!isPasswordMatch) {
    throw new AppError("Invalid password", 400);
  }

  const { token, refreshToken, expiresAt } = await createAuthTokens(user._id);

  const hashedRefreshToken = hashRefreshToken(refreshToken);

  // Create a new session for this device (do not overwrite existing sessions)
  await LoginSession.create({
    refreshToken: hashedRefreshToken,
    expiresAt,
    userId: user._id,
    ip: ip || null,
    userAgent: userAgent || null,
    lastUsedAt: new Date(),
  });

  return { token, refreshToken, expiresAt, user };
};

export default loginUser;
