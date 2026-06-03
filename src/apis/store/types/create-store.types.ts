import { ObjectId } from "mongoose";

export interface ICreateStore {
    name: string;
    logo?: string;
    openingTime?: string;
    closingTime?: string;
    categoryId?: ObjectId;
    categoryName?: string;
    email: string;
    authorizedBrand?: string
}

export interface IRequestStore {
    name: string;
    logo?: string;
    openingTime?: string;
    closingTime?: string;
    categoryId?: ObjectId;
    categoryName?: string;
    email: string;
    authorizedBrand?: string
} 

export interface IResponseStore {
    _id: ObjectId;
    name: string;
    logo?: string;
    authorizedBrand?:string;
    owner:object;
    category?: ObjectId;
    isActive: boolean;
    openingTime?: string;
    closingTime?: string;
}