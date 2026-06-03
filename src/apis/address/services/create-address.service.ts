import { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import { mapAddressResponse } from "../../../utils/response-mappers";
import Address from "../model/address.model";
import { CreateAddressBody } from "../types/address.types";
import {
  MAX_ADDRESSES_PER_USER,
  toObjectId,
} from "./address-shared.service";

export const createAddress = async (
  userId: ObjectId | string,
  payload: CreateAddressBody,
) => {
  const uid = toObjectId(userId, "user id");
  const addressCount = await Address.countDocuments({ userId: uid } as any);

  if (addressCount >= MAX_ADDRESSES_PER_USER) {
    throw new AppError("Maximum 10 addresses allowed", 400);
  }

  const existing = await Address.findOne({
    userId: uid,
    street: payload.street,
    distanceMark: payload.distanceMark,
  } as any).lean();
  if (existing) {
    throw new AppError(
      "You already have an address with the same street and distance mark",
      400,
    );
  }

  if (payload.isDefault) {
    await Address.updateMany(
      { userId: uid, isDefault: true } as any,
      { $set: { isDefault: false } },
    );
  }

  const address = await Address.create({
    userId: uid,
    street: payload.street,
    city: payload.city,
    distanceMark: payload.distanceMark,
    phone: payload.phone,
    notes: payload.notes,
    isDefault: payload.isDefault ?? false,
  } as any);

  return mapAddressResponse(address.toObject());
};
