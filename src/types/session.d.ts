import { Session } from "../interfaces/session.interface";

declare module "express" {
  interface Request {
    session?: Session;
  }
}

export {};