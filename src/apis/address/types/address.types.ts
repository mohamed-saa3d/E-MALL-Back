import { ParamsDictionary } from "express-serve-static-core";

export interface AddressPayload {
  _id: string;
  street: string;
  city: string;
  distanceMark: string;
  phone: string;
  notes?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressBody {
  street: string;
  city: string;
  distanceMark: string;
  phone: string;
  notes?: string;
  isDefault?: boolean;
}

export interface UpdateAddressBody {
  street?: string;
  city?: string;
  distanceMark?: string;
  phone?: string;
  notes?: string;
}

export interface SetDefaultAddressBody {
  isDefault?: boolean;
}

export interface AddressParams extends ParamsDictionary {
  id: string;
}

export interface AddressListResponse {
  status: string;
  data: {
    addresses: AddressPayload[];
    total: number;
  };
}

export interface AddressItemResponse {
  status: string;
  data: {
    address: AddressPayload;
  };
}

export interface AddressMessageResponse {
  status: string;
  message: string;
}
