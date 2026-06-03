"use strict";
// import { NextFunction, Request, RequestHandler, Response } from "express";
// import verifyTokenService from "../services/verify-token.service";
// import AppError from "../../../utils/app-error";
// import environment from "../../../config/environment";
// const verifyToken: RequestHandler = async (req: Request, res: Response,next: NextFunction) => {
//     const { token } = req.params;
//     if (!token)
//         throw new AppError("Missing token", 400);
Object.defineProperty(exports, "__esModule", { value: true });
//     try {
//         const tokenStr = Array.isArray(token) ? token[0] : token;
//         await verifyTokenService(tokenStr);
//         return res.status(200).redirect(`${environment.BASE_URL}/auth/reset-password/token=${tokenStr}`);
//     } catch (err: any) {
//        return next(err);
//     }
// };
// export default verifyToken;
