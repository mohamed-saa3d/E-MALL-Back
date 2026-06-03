import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import AppError from "../utils/app-error";

/**
 * Generic validation middleware
 * Works with:
 * - req.body
 * - Zod v4
 * - Global Error Handler
 */
const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);

      // replace body with validated & sanitized data
      req.body = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map(err => err.message)
          .join(", ");

        return next(new AppError(message, 400));
      }

      // unexpected error → pass to global handler
      next(error);
    }
  };

export default validate;
