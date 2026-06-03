import { ObjectId } from "mongoose";
import { mapAddressResponse } from "../../../utils/response-mappers";
import Address from "../model/address.model";
import {
  getOwnedAddressDocument,
  toObjectId,
} from "./address-shared.service";

export const setDefaultAddress = async (
  userId: ObjectId | string,
  addressId: ObjectId | string,
  requestedIsDefault?: boolean,
) => {
  const uid = toObjectId(userId, "user id");
  const address = await getOwnedAddressDocument(uid, addressId);

  const shouldToggle =
    requestedIsDefault === undefined || requestedIsDefault === address.isDefault;
  const nextIsDefault = shouldToggle ? !address.isDefault : requestedIsDefault;

  if (nextIsDefault) {
    await Address.updateMany(
      { userId: uid, isDefault: true } as any,
      { $set: { isDefault: false } },
    );
  }

  address.isDefault = nextIsDefault;
  await address.save();

  return mapAddressResponse(address.toObject());
};
