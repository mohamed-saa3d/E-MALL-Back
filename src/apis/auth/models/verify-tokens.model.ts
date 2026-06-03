import mongoose, { ObjectId } from "mongoose";

export enum TokenTypes {
        VERIFICATION = "verify",
        PASSWORD_RESET = "reset",
    }

export interface IVerifyTokens {
    _id: string;
    token: string;
    type: TokenTypes;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    used: boolean;
    userId: ObjectId;
    verifiedAt?: Date;
}

export const VerifyTokensSchema = new mongoose.Schema<IVerifyTokens>(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(TokenTypes),
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const VerifyTokens = mongoose.model("VerifyTokens", VerifyTokensSchema);

export default VerifyTokens;