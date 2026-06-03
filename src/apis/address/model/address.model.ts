import mongoose, { ObjectId } from "mongoose";

export interface IAddress {
  _id: string;
  userId: ObjectId;
  street: string;
  city: string;
  distanceMark: string;
  phone: string;
  notes?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new mongoose.Schema<IAddress>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    distanceMark: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

AddressSchema.index({ userId: 1, updatedAt: -1 });
AddressSchema.index({ userId: 1, street: 1, distanceMark: 1 }, { unique: true });
AddressSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
);

const Address = mongoose.model("Address", AddressSchema);

export default Address;
