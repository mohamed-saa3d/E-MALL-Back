
import mongoose, { ObjectId } from "mongoose";

export interface ICategory {
    _id: ObjectId;
    name: string;
    slug: string;
    parentId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  },
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;