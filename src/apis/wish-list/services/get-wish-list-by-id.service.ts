import { ObjectId } from "mongoose";
import WishList from "../models/wish-list.model";

const getWishListById = async (id: ObjectId) => {
    return await WishList.findOne({ userId: id });
};

export default getWishListById;