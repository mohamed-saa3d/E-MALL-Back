import { Schema, model, Document, ObjectId } from "mongoose";

/* ---------------- ATTRIBUTES ---------------- */

interface IAttribute {
  name: string
  value: string
}

const attributeSchema = new Schema<IAttribute>({
  name: { type: String, required: true },
  value: { type: String, required: true }
},{ _id:false })


/* ---------------- VARIANT ---------------- */

interface IVariant {
  _id?: ObjectId
  sku: string
  price: number
  salePrice?: number
  saleStartAt?: Date
  saleEndAt?: Date
  imageUrl?: string
  images?: string[]
  isDefault: boolean
  attributes: IAttribute[]
}

const variantSchema = new Schema<IVariant>({
  sku: { type: String, required: true, trim: true },

  price: { type: Number, required: true, min: 0 },

  salePrice: { type: Number, min: 0 },

  saleStartAt: Date,

  saleEndAt: Date,

  imageUrl: String,

  images: [String],

  isDefault: { type: Boolean, default: false },

  attributes: [attributeSchema]

},{ _id:true })


/* ---------------- PRODUCT ---------------- */

interface IProduct extends Document {
  name: string
  slug: string
  description?: string
  brand?: string
  categoryId: ObjectId
  basePrice?: number
  variants: IVariant[]
  defaultVariantId?: ObjectId
  tags?: string[]
  storeId: ObjectId
  isActive: boolean
  salesCount: number
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>({

  name: { type: String, required: true, trim: true },

  slug: { type: String, required: true, lowercase: true },

  description: String,

  brand: String,

  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  basePrice: Number,

  variants: [variantSchema],

  defaultVariantId: Schema.Types.ObjectId,

  tags: [String],

  isActive: { type: Boolean, default: true },

  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },

  salesCount: { type: Number, default: 0 }

},{
  timestamps:true
})


/* ---------------- INDEXES ---------------- */

productSchema.index({ slug: 1, storeId: 1 }, { unique: true })

productSchema.index({ "variants.sku": 1 , storeId: 1 }, { unique: true })

productSchema.index({ categoryId: 1, isActive: 1 })

productSchema.index({
  "variants.attributes.name":1,
  "variants.attributes.value":1
})


/* ---------------- MODEL ---------------- */

const Product = model<IProduct>("Product", productSchema)


export { Product }
