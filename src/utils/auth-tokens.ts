import generateToken from "./generate-token";
import environment from "../config/environment";
import { ObjectId } from "mongoose";

interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

const JWT_EXPIRES =environment.TOKEN_EXPIRES_STRING; // 15 minutes
const REFRESH_TOKEN_EXPIRES = environment.REFRESH_TOKEN_EXPIRES; // 15 days

const createAuthTokens = async (userId: ObjectId): Promise<AuthTokens> => {
  const token = generateToken(userId, environment.JWT_SECRET_KEY, JWT_EXPIRES);

  const expiresAt = new Date(Date.now() +environment.REFRESH_TOKEN_EXPIRES); // 7 days
  
  const refreshToken = generateToken(
    userId,
    environment.JWT_REFRESH_SECRET_KEY,
    environment.REFRESH_TOKEN_EXPIRES_STRING,
  );

  return { token, refreshToken, expiresAt };
};

export default createAuthTokens;
