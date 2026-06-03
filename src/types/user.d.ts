import { UserToken } from "../interfaces/user-token.interface";
declare module "express" {
  interface Request {
    user?: UserToken;
  }
}

export {};
