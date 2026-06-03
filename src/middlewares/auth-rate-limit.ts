import rateLimit from "express-rate-limit";

// 5 attempts per 15 minutes for sensitive endpoints
export const authSensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

// higher limit for token refresh endpoint to avoid blocking legitimate clients
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many refresh requests, slow down.",
});

export default authSensitiveLimiter;
