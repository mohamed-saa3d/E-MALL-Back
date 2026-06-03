// import { Request, Response, NextFunction } from "express";
// import AppError from "../utils/app-error";
// import environment from "../config/environment";
// import dotenv from "dotenv";

// dotenv.config();

// /* =========================
//    Helpers
//    ========================= */

// const parseMongoDuplicate = (err: any) => {
//   if (err?.keyValue && typeof err.keyValue === "object") {
//     const field = Object.keys(err.keyValue).join(", ");
//     const value = Object.values(err.keyValue)
//       .map((v: any) => (v === null ? "null" : String(v)))
//       .join(", ");
//     return { field, value };
//   }

//   const msg = String(err?.message || "");
//   const match = msg.match(/dup key:\s*\{?\s*([^:}]+):\s*([^\}]+)\s*\}?/i);
//   if (match) {
//     return {
//       field: match[1].replace(/["']/g, "").trim(),
//       value: match[2].replace(/["']/g, "").trim(),
//     };
//   }

//   return { field: "field", value: "value" };
// };

// const handleMongoDuplicateError = (err: any): AppError => {
//   const { field, value } = parseMongoDuplicate(err);

//   let message = `Duplicate value for field: ${field} (${value}). Please use another value.`;

//   if (value === "null" || value === null) {
//     message +=
//       " This usually happens because multiple documents have null for a unique field. Consider using a sparse index or removing null values.";
//   }

//   return new AppError(message, 400);
// };

// const handleMongooseValidationError = (err: any): AppError => {
//   const messages = Object.values(err.errors || {}).map((e: any) => e.message);

//   return new AppError(`Invalid input data. ${messages.join(". ")}`, 400);
// };

// const handleMongooseCastError = (err: any): AppError => {
//   const value =
//     typeof err?.value === "string" || typeof err?.value === "number"
//       ? String(err.value)
//       : typeof err?.value === "undefined"
//         ? "undefined"
//         : "[object]";

//   return new AppError(`Invalid ${err.path}: ${value}`, 400);
// };

// /* =========================
//    Response Helpers
//    ========================= */

// const buildDevErrorDetails = (err: any) => {
//   const details: Record<string, any> = {
//     name: err?.name,
//     message: err?.message,
//     stack: err?.stack,
//   };

//   if (typeof err?.statusCode === "number") details.statusCode = err.statusCode;
//   if (typeof err?.status === "string") details.status = err.status;
//   if (typeof err?.code !== "undefined") details.code = err.code;
//   if (typeof err?.path === "string") details.path = err.path;

//   if (typeof err?.value !== "undefined") {
//     details.value =
//       typeof err.value === "string" || typeof err.value === "number"
//         ? String(err.value)
//         : "[object]";
//   }

//   if (err?.errors && typeof err.errors === "object") {
//     details.errors = Object.fromEntries(
//       Object.entries(err.errors).map(([key, value]: any) => [
//         key,
//         value?.message ?? String(value),
//       ]),
//     );
//   }

//   return details;
// };

// const sendErrorDev = (err: any, res: Response) => {
//   if (process.env.NODE_ENV === "development") {
//     console.error(err);
//   }
//   res.status(err.statusCode || 500).json({
//     status: err.status || "error",
//     message: err.message,
//     error: buildDevErrorDetails(err),
//   });
// };

// const sendErrorProd = (err: AppError, res: Response) => {
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   } else {
//     console.error("UNEXPECTED ERROR 💥", err);
//     res.status(500).json({
//       status: "error",
//       message: "Something went wrong!",
//     });
//   }
// };

// /* =========================
//    Global Error Handler
//    ========================= */

// const globalErrorHandler = (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   if (process.env.NODE_ENV === "development") {
//     sendErrorDev(err, res);
//     return;
//   }

//   let error: AppError;

//   if (err instanceof AppError) {
//     error = err;
//   } else {
//     error = new AppError("Something went wrong", 500);
//   }

//   /* ===== Mongo / Mongoose ===== */

//   // Duplicate key
//   if (err?.code === 11000 || err?.name === "MongoServerError") {
//     error = handleMongoDuplicateError(err);
//   }

//   // Validation error
//   if (err?.name === "ValidationError") {
//     error = handleMongooseValidationError(err);
//   }

//   // Cast error (ObjectId, Date, etc.)
//   if (err?.name === "CastError") {
//     error = handleMongooseCastError(err);
//   }

//   sendErrorProd(error, res);
// };

// export default globalErrorHandler;
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/app-error";

// دالة مساعدة لتنسيق رد الخطأ في الإنتاج (Production)
const sendErrorProd = (err: any, res: Response) => {
  // 1. أخطاء إحنا عارفينها ومجهزين رسالة ليها (Operational)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // 2. أخطاء برمجية أو تقنية غير متوقعة (Programming/Unknown)
  // بنخفي التفاصيل عن العميل عشان الأمان وبنطلع رسالة عامة
  console.error("ERROR 💥:", err); // بنسجلها عندنا في السيرفر بس
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

// دالة مساعدة لتنسيق رد الخطأ في التطوير (Development)
const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack, // بنرمي الـ stack هنا عشان نعرف مكان المشكلة فين بالضبط
  });
};

/* ==============================================
   المعالج الرئيسي (Global Error Handler)
   ============================================== */
const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    // في الـ Production بنعمل نسخة من الخطأ عشان نعدل عليها براحتنا
    let error = { ...err };
    error.message = err.message;

    // تحويل أخطاء MongoDB/Mongoose لأخطاء مفهومة (Operational)
    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// --- الدوال المساعدة لتحويل الأخطاء التقنية لأخطاء "يوزر" ---

const handleCastErrorDB = (err: any) => {
  return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(`Invalid input data. ${errors.join(". ")}`, 400);
};

const handleJWTError = () => new AppError("Invalid token. Please log in again!", 401);
const handleJWTExpiredError = () => new AppError("Your token has expired!", 401);

export default globalErrorHandler;