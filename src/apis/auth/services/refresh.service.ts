import AppError from "../../../utils/app-error";
import createAuthTokens from "../../../utils/auth-tokens";
import hashRefreshToken, { legacyHash } from "../../../utils/hash-refresh-token";
import LoginSession from "../models/loginSession.model";
import User from "../models/user.model";

const refreshAccessTokenAndRefreshToken = async (
  refreshToken: string,
  ip?: string | null,
  userAgent?: string | null,
) => {
  if (!refreshToken) {
    throw new AppError(
      "You are not logged in. Please log in to get access",
      401,
    );
  }

  const hmacHash = hashRefreshToken(refreshToken);
  const shaHash = legacyHash(refreshToken);

  // Try atomic rotation using HMAC hash first, then fallback to legacy SHA256
  let session = await LoginSession.findOneAndUpdate(
    { refreshToken: hmacHash, revokedAt: null },
    { $set: { revokedAt: new Date(), lastUsedAt: new Date() } },
    { new: true },
  );

  if (!session) {
    // try legacy
    session = await LoginSession.findOneAndUpdate(
      { refreshToken: shaHash, revokedAt: null },
      { $set: { revokedAt: new Date(), lastUsedAt: new Date() } },
      { new: true },
    );
  }

  if (!session) {
    // If a session exists but already revoked => token reuse / theft
    const reused =
      (await LoginSession.findOne({ refreshToken: hmacHash })) ||
      (await LoginSession.findOne({ refreshToken: shaHash }));
    if (reused) {
      await LoginSession.updateMany(
        { userId: reused.userId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      throw new AppError("Refresh token reuse detected. All sessions revoked.", 401);
    }

    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(session.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { token, refreshToken: newRefreshToken, expiresAt } = await createAuthTokens(session.userId);
  const hashNewRefreshToken = hashRefreshToken(newRefreshToken);

  // create a new session for the rotated token (HMAC hashed)
  await LoginSession.create({
    refreshToken: hashNewRefreshToken,
    expiresAt,
    userId: session.userId,
    ip: ip || null,
    userAgent: userAgent || null,
    lastUsedAt: new Date(),
  });

  return { token, refreshToken: newRefreshToken, expiresAt, user };
};

export default refreshAccessTokenAndRefreshToken;
