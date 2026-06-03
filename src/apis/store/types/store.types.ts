import { ObjectId } from "mongoose";
import { CategoryRef, UserRef } from "../../../types/ref.types";

export interface IStoreResponse {
  _id: ObjectId;
  name: string;
  logo?: string;
  category: CategoryRef | null;
  owner?: UserRef | null;
  authorizedBrand?: string;
  isActive: boolean;
  openingTime?: string;
  closingTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreListResponse {
  status: "success";
  data: {
    stores: IStoreResponse[];
    total: number;
  };
}

export interface IStoreSingleResponse {
  status: "success";
  data: {
    store: IStoreResponse;
  };
}

export interface IStoreWithProductCountResponse {
  _id: ObjectId;
  name: string;
  logo?: string;
  category: CategoryRef | null;
  owner?: UserRef | null;
  authorizedBrand?: string;
  isActive: boolean;
  openingTime?: string;
  closingTime?: string;
  productCount: number;
  cartProductCount: number;
  wishlistProductCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateStoreRequest {
  name?: string;
  logo?: string;
  isActive?: boolean;
  openingTime?: string;
  closingTime?: string;
  categoryId?: ObjectId;
  authorizedBrand?: string;
}
