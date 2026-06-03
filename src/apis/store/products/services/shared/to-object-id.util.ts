import mongoose from "mongoose";
import AppError from "../../../../../utils/app-error";

/**
 * Validates a string ObjectId and returns a mongoose ObjectId instance.
 */
export const toObjectId = (value: string, label: string) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
  return new mongoose.Types.ObjectId(value);
};
