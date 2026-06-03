import jwt from "jsonwebtoken";
import environment from "../config/environment";

export interface JwtAuthPayload {
  id: string;
  iat: number;
  exp: number;
}

export function verifyAuthToken(token: string): JwtAuthPayload {
  return jwt.verify(token, environment.JWT_SECRET_KEY!) as JwtAuthPayload;
}
