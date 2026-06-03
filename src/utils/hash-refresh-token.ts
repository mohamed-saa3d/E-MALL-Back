import crypto from "crypto";
import environment from "../config/environment";

// Legacy SHA-256 hash (what existing DB entries may have)
export const legacyHash = (theStringWeWantToHash: string) => {
    return crypto.createHash("sha256").update(theStringWeWantToHash).digest("hex");
};

// Recommended: HMAC-SHA256 keyed with TOKEN_HASH_SECRET (if provided)
export const hashRefreshToken = (theStringWeWantToHash: string) => {
    const secret = environment.TOKEN_HASH_SECRET;
    if (secret && secret.length > 0) {
        return crypto
            .createHmac("sha256", secret)
            .update(theStringWeWantToHash)
            .digest("hex");
    }

    // fallback to legacy sha256 if no secret configured
    return legacyHash(theStringWeWantToHash);
};

export default hashRefreshToken;
