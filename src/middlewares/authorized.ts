import { NextFunction, Request, RequestHandler, Response } from "express";
import { Role } from "../apis/auth/models/user.model";

export const isAuthorized = (...roles: Role[]): RequestHandler => {
  return (req:Request, res:Response, next:NextFunction) => {
    if (req.user) {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
};