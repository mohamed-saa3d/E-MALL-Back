import { ObjectId } from "mongoose";
import { Role } from "../apis/auth/models/user.model";

export interface UserToken {
  id: ObjectId;
  role: Role;
  email: string;
}
