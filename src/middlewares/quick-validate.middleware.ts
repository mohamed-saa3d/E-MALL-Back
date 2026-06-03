// src/middleware/quick-validate.ts
import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import AppError from "../utils/app-error";

// Schemas
const emailSchema = z
  .email({ message: "Invalid email format" })
  .transform((v) => v.trim().toLowerCase());

const tokenSchema = z
  .string()
  .length(64, "Invalid token length")
  .regex(/^[a-f0-9]+$/i, "Invalid token format");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain English letters")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol");

// Middleware
export function quickValidate(req: Request, res: Response, next: NextFunction) {
  try {
    // Body.password
    if (req.body && typeof req.body === "object" && "password" in req.body && req.body.password != null) {
      req.body.password = passwordSchema.parse(req.body.password);
    }

    // Body.email
    if (req.body && typeof req.body === "object" && "email" in req.body && req.body.email != null) {
      req.body.email = emailSchema.parse(req.body.email);
    }

    // Query/email or params/email
    if (req.query && "email" in req.query && req.query.email != null) {
      req.query.email = emailSchema.parse(String(req.query.email));
    }
    if (req.params && "email" in req.params && req.params.email != null) {
      req.params.email = emailSchema.parse(String(req.params.email));
    }

    // token in params / query / body
    const maybeToken =
      (req.params && (req.params as any).token) ||
      (req.query && (req.query as any).token) ||
      (req.body && (req.body as any).token);

    if (maybeToken != null) {
      const validated = tokenSchema.parse(String(maybeToken));
      if (req.params && (req.params as any).token) (req.params as any).token = validated;
      else if (req.query && (req.query as any).token) (req.query as any).token = validated;
      else if (req.body && (req.body as any).token) (req.body as any).token = validated;
    }

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.issues.map((i) => i.message).join(", ");
      return next(new AppError(message, 400));
    }
    next(err);
  }
}
