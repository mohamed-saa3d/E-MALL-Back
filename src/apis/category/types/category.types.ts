import { ObjectId } from "mongoose";
import { CategoryRef } from "../../../types/ref.types";

export interface ICreateCategory {
  name: string;
  parentId?: ObjectId;
}

export interface IUpdateCategory {
  name?: string;
  parentId?: ObjectId;
}

export interface IReplaceCategory {
  replacementCategoryId: ObjectId;
}

export interface ICategoryResponse {
  _id: ObjectId;
  name: string;
  slug: string;
  parent?: CategoryRef | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryListResponse {
  status: "success";
  data: {
    categories: ICategoryResponse[];
    total: number;
  };
}

export interface ICategorySingleResponse {
  status: "success";
  data: {
    category: ICategoryResponse;
  };
}
