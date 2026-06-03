import mongoose, { ObjectId, Query } from "mongoose";

interface ISore {
  _id: ObjectId;
  name: string;
  logo: string;
  ownerId: ObjectId;
  categoryId: ObjectId;
  authorizedBrand: string;
  isActive: boolean;
  openingTime: string;
  closingTime: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

const StoreSchema = new mongoose.Schema<ISore>(
  {
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      //   required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorizedBrand: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    openingTime: {
      type: String,
      //   required: true,
    },
    closingTime: {
      type: String,
      //   required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

StoreSchema.pre(/^find/, async function (this: Query<ISore, ISore[]>) {
  this.where({ deletedAt: null });
});

const Store = mongoose.model("Store", StoreSchema);

export default Store;
