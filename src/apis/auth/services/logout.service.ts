import LoginSession from "../models/loginSession.model";
import hashRefreshToken, { legacyHash } from "../../../utils/hash-refresh-token";

const logoutUser = async (refreshToken: string) => {
    if (!refreshToken) {
        return;
    }

    const hmacHash = hashRefreshToken(refreshToken);
    const shaHash = legacyHash(refreshToken);

    // Try to revoke HMAC-hashed session first
    let result = await LoginSession.findOneAndUpdate(
        { refreshToken: hmacHash, revokedAt: null },
        { $set: { revokedAt: new Date() } },
    );

    if (!result) {
        // fallback to legacy sha hash if present
        await LoginSession.findOneAndUpdate(
            { refreshToken: shaHash, revokedAt: null },
            { $set: { revokedAt: new Date() } },
        );
    }
};

export default logoutUser;