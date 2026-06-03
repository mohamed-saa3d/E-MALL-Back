import { ObjectId } from "mongoose";

export interface CategoryRef {
  _id: ObjectId;
  name: string;
  slug: string;
}

export interface StoreRef {
  _id: ObjectId;
  name: string;
  logo?: string;
}

export interface UserRef {
  _id: ObjectId;
  name: string;
  email: string;
}

export interface ProductRef {
  _id: ObjectId;
  name: string;
  slug: string;
  images?: string[];
}
