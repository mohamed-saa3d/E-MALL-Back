import mongoose, { ObjectId } from "mongoose";
import { Schema } from "mongoose";
export enum Role {
  ADMIN = "admin",
  USER = "user",
  OWNER = "owner",
  ACCOUNTING = "accounting",
  FULFILLMENT = "fulfillment",
}
export interface IUser {
  _id: ObjectId;
  email: string;
  name: string;
  phoneNumber: string;
  role: Role;
  isActive: boolean;
  hashPassword: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  deletedAt: Date;
  // isPasswordVerified?: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    _id: {
      type:mongoose.Schema.Types.ObjectId,
      auto: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      sparse: true,
      unique: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hashPassword: {
      type: String,
      required: true,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
const User = mongoose.model<IUser>("User", UserSchema);
export default User;
