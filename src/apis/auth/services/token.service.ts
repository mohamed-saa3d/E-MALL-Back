import crypto, { verify } from "crypto";
import mongoose, { ObjectId } from "mongoose";
import hashWithCrypto from "../../../utils/hash-with-crypto";
import VerifyTokens, { TokenTypes } from "../models/verify-tokens.model";
import AppError from "../../../utils/app-error";

type TokenInputType = "verify" | "reset";

function mapType(t: TokenInputType) {
  switch (t) {
    case "verify":
      return TokenTypes.VERIFICATION;
    case "reset":
      return TokenTypes.PASSWORD_RESET;
    default:
      return TokenTypes.VERIFICATION;
  }
}

export async function createToken(
  userId: ObjectId,
  type: TokenInputType,
  expiresMinutes = 20,
) {
  if (type !== "verify" && type !== "reset")
    throw new AppError("Invalid type", 400);

  let raw: string;
  if (type === "reset") {
    raw = crypto.randomBytes(32).toString("hex");
  } else {
    raw = Math.floor(100000 + Math.random() * 900000).toString();
  } // 6 digits

  const hashed = hashWithCrypto(raw);
  
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  const tokenDoc = await VerifyTokens.create({
    userId,
    token: hashed,
    type: mapType(type),
    expiresAt,
    isUsed: false,
  } as any);

  return { raw, tokenDoc };
}

export async function findActiveTokenByRaw(
  rawToken: string,
  type: TokenInputType,
) {
  const hashed = hashWithCrypto(rawToken);
  const tokenType = mapType(type);
  const tokenDoc = await VerifyTokens.findOne({
    token: hashed,
    type: tokenType,
  });
  if (!tokenDoc) throw new AppError("Invalid token", 400);

  if (tokenDoc.used === true || tokenDoc.expiresAt < new Date())
    throw new AppError("Token expired or already used", 400);

  return tokenDoc;
}

export async function markTokenUsed(id: mongoose.Types.ObjectId | string) {
  await VerifyTokens.findByIdAndUpdate(id, { used: true });
}

export default {
  createToken,
  findActiveTokenByRaw,
  markTokenUsed,
};
