import { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import { mapAddressResponse } from "../../../utils/response-mappers";
import Address from "../model/address.model";
import { UpdateAddressBody } from "../types/address.types";
import { getOwnedAddressDocument } from "./address-shared.service";

export const updateAddress = async (
  userId: ObjectId | string,
  addressId: ObjectId | string,
  payload: UpdateAddressBody,
) => {
  const address = await getOwnedAddressDocument(userId, addressId);

  const nextStreet = payload.street ?? address.street;
  const nextDistanceMark = payload.distanceMark ?? address.distanceMark;

  const duplicate = await Address.findOne({
    _id: { $ne: address._id } as any,
    userId: address.userId,
    street: nextStreet,
    distanceMark: nextDistanceMark,
  } as any).lean();
  if (duplicate) {
    throw new AppError(
      "You already have an address with the same street and distance mark",
      400,
    );
  }

  if (payload.street !== undefined) address.street = payload.street;
  if (payload.city !== undefined) address.city = payload.city;
  if (payload.distanceMark !== undefined) {
    address.distanceMark = payload.distanceMark;
  }
  if (payload.phone !== undefined) address.phone = payload.phone;
  if (payload.notes !== undefined) address.notes = payload.notes;

  await address.save();
  return mapAddressResponse(address.toObject());
};
