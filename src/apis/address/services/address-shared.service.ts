import mongoose, { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import Address from "../model/address.model";

export const MAX_ADDRESSES_PER_USER = 10;

export const toObjectId = (
  value: ObjectId | mongoose.Types.ObjectId | string,
  fieldName: string,
): mongoose.Types.ObjectId => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  if (typeof value === "string" && mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }

  throw new AppError(`Invalid ${fieldName}`, 400);
};

export const getOwnedAddressDocument = async (
  userId: ObjectId | mongoose.Types.ObjectId | string,
  addressId: ObjectId | mongoose.Types.ObjectId | string,
) => {
  const uid = toObjectId(userId, "user id");
  const aid = toObjectId(addressId, "address id");

  const address = await Address.findOne({ _id: aid, userId: uid } as any);
  if (!address) {
    throw new AppError("Address not found", 404);
  }

  return address;
};
