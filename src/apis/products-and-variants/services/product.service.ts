import mongoose from "mongoose";
import { Product } from "../model/products-and-variants.model";
import Category from "../../category/models/category.model";
import Store from "../../store/models/store.model";
import AppError from "../../../utils/app-error";
import {
  isVariantSaleActive,
  resolveVariantPrice,
} from "./resolve-variant-price.util";
import { mapProductResponse } from "../../../utils/response-mappers";

type SortOption = "price-asc" | "price-desc" | "newest" | "best-selling";

interface ListParams {
  storeId?: string;
  shopId?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

interface AttributeFilter {
  name: string;
  values: string[];
}

const RESERVED_QUERY_KEYS = new Set([
  "page",
  "limit",
  "minPrice",
  "maxPrice",
  "sort",
  "storeId",
  "shopId",
  "category",
  "search",
  "color",
  "size",
]);

const normalizePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
};

const collectAttributeFilters = (params: ListParams): AttributeFilter[] => {
  const bag = new Map<string, Set<string>>();

  const append = (name: string, raw: unknown) => {
    if (raw === undefined || raw === null) return;
    const values = String(raw)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (values.length === 0) return;
    if (!bag.has(name)) {
      bag.set(name, new Set());
    }
    const current = bag.get(name)!;
    values.forEach((value) => current.add(value));
  };

  append("color", params.color);
  append("size", params.size);

  Object.entries(params).forEach(([key, value]) => {
    if (RESERVED_QUERY_KEYS.has(key)) return;
    append(key, value);
  });

  return Array.from(bag.entries()).map(([name, valueSet]) => ({
    name,
    values: Array.from(valueSet.values()),
  }));
};

export const listProducts = async (params: ListParams) => {
  const page = normalizePositiveInt(params.page, 1);
  const limit = Math.min(100, normalizePositiveInt(params.limit, 24));
  const skip = (page - 1) * limit;

  const storeId = typeof params.storeId === "string" ? params.storeId : params.shopId;
  const category = typeof params.category === "string" ? params.category : undefined;
  const search = typeof params.search === "string" ? params.search.trim() : undefined;
  const sort = params.sort;
  const minPrice = params.minPrice !== undefined ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice !== undefined ? Number(params.maxPrice) : undefined;

  if (minPrice !== undefined && Number.isNaN(minPrice)) {
    throw new AppError("minPrice must be a valid number", 400);
  }
  if (maxPrice !== undefined && Number.isNaN(maxPrice)) {
    throw new AppError("maxPrice must be a valid number", 400);
  }
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new AppError("minPrice cannot be greater than maxPrice", 400);
  }

  const baseMatch: Record<string, unknown> = { isActive: true };

  if (storeId) {
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      throw new AppError("Invalid storeId", 400);
    }
    baseMatch.storeId = new mongoose.Types.ObjectId(storeId);
  }

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      baseMatch.categoryId = new mongoose.Types.ObjectId(category);
    } else {
      const categoryDoc = await Category.findOne({ slug: category }).select("_id").lean();
      if (categoryDoc) {
        baseMatch.categoryId = categoryDoc._id;
      } else {
        baseMatch.categoryId = new mongoose.Types.ObjectId();
      }
    }
  }

  if (search) {
    const regex = new RegExp(search, "i");
    baseMatch.$or = [{ name: regex }, { description: regex }];
  }

  const attributeFilters = collectAttributeFilters(params);
  const variantConditions: Record<string, unknown>[] = [];

  if (minPrice !== undefined) {
    variantConditions.push({ $gte: ["$$v.price", minPrice] });
  }

  if (maxPrice !== undefined) {
    variantConditions.push({ $lte: ["$$v.price", maxPrice] });
  }

  attributeFilters.forEach((attribute) => {
    variantConditions.push({
      $gt: [
        {
          $size: {
            $filter: {
              input: "$$v.attributes",
              as: "a",
              cond: {
                $and: [
                  { $eq: ["$$a.name", attribute.name] },
                  { $in: ["$$a.value", attribute.values] },
                ],
              },
            },
          },
        },
        0,
      ],
    });
  });

  const variantCondition =
    variantConditions.length === 0
      ? true
      : variantConditions.length === 1
        ? variantConditions[0]
        : { $and: variantConditions };

  const pipeline: any[] = [
    { $match: baseMatch },
    {
      $addFields: {
        matchedVariants: {
          $filter: {
            input: "$variants",
            as: "v",
            cond: variantCondition,
          },
        },
      },
    },
    {
      $match: {
        $expr: { $gt: [{ $size: "$matchedVariants" }, 0] },
      },
    },
    {
      $addFields: {
        mainVariant: {
          $let: {
            vars: {
              byDefaultId: {
                $first: {
                  $filter: {
                    input: "$matchedVariants",
                    as: "v",
                    cond: { $eq: ["$$v._id", "$defaultVariantId"] },
                  },
                },
              },
              byIsDefault: {
                $first: {
                  $filter: {
                    input: "$matchedVariants",
                    as: "v",
                    cond: { $eq: ["$$v.isDefault", true] },
                  },
                },
              },
            },
            in: {
              $ifNull: [
                "$$byDefaultId",
                {
                  $ifNull: ["$$byIsDefault", { $arrayElemAt: ["$matchedVariants", 0] }],
                },
              ],
            },
          },
        },
        matchedCount: { $size: "$matchedVariants" },
      },
    },
  ];

  if (sort === "best-selling") {
    pipeline.push(
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            { $unwind: "$stores" },
            { $unwind: "$stores.items" },
            {
              $match: {
                $expr: { $eq: ["$stores.items.productId", "$$productId"] },
              },
            },
            { $group: { _id: null, qty: { $sum: "$stores.items.quantity" } } },
          ],
          as: "orderStats",
        },
      },
      {
        $addFields: {
          salesCountForSort: {
            $ifNull: [{ $arrayElemAt: ["$orderStats.qty", 0] }, "$salesCount"],
          },
        },
      },
    );
  }

  const sortStage: Record<string, 1 | -1> = {};
  if (sort === "price-asc") {
    sortStage["mainVariant.price"] = 1;
  } else if (sort === "price-desc") {
    sortStage["mainVariant.price"] = -1;
  } else if (sort === "best-selling") {
    sortStage.salesCountForSort = -1;
    sortStage.createdAt = -1;
  } else {
    sortStage.createdAt = -1;
  }

  pipeline.push(
    { $sort: sortStage },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              slug: 1,
              description: 1,
              brand: 1,
              images: 1,
              categoryId: 1,
              storeId: 1,
              createdAt: 1,
              updatedAt: 1,
              salesCount: 1,
              matchedCount: 1,
              mainVariant: 1,
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    },
  );

  const aggregateResult = await Product.aggregate(pipeline);
  const firstResult = aggregateResult[0] || { data: [], total: [] };
  const products = (firstResult.data || []).map((product: any) => ({
    ...product,
    mainVariant: product.mainVariant
      ? {
          ...product.mainVariant,
          isSaleActive: isVariantSaleActive(product.mainVariant),
          currentPrice: resolveVariantPrice(product.mainVariant),
        }
      : null,
  }));

  const categoryIds = new Set<string>();
  const storeIds = new Set<string>();
  products.forEach((product: any) => {
    if (product.categoryId) categoryIds.add(String(product.categoryId));
    if (product.storeId) storeIds.add(String(product.storeId));
  });

  const [categoryDocs, storeDocs] = await Promise.all([
    categoryIds.size
      ? Category.find({ _id: { $in: Array.from(categoryIds) } } as any)
          .select("name slug")
          .lean()
      : [],
    storeIds.size
      ? Store.find({ _id: { $in: Array.from(storeIds) } } as any)
          .select("name logo")
          .lean()
      : [],
  ]);

  const categoryMap = new Map(
    categoryDocs.map((category: any) => [String(category._id), category]),
  );
  const storeMap = new Map(
    storeDocs.map((store: any) => [String(store._id), store]),
  );

  const mappedProducts = products.map((product: any) =>
    mapProductResponse({
      ...product,
      categoryId: categoryMap.get(String(product.categoryId)) || null,
      storeId: storeMap.get(String(product.storeId)) || null,
    }),
  );

  return {
    products: mappedProducts,
    total: firstResult.total?.[0]?.count || 0,
    page,
    limit,
  };
};

export const getProductBySlug = async (slug: string, storeId?: string) => {
  if (!slug) {
    throw new AppError("Missing slug", 400);
  }

  const filter: Record<string, unknown> = {
    slug: slug.toLowerCase(),
    isActive: true,
  };

  if (storeId) {
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      throw new AppError("Invalid storeId", 400);
    }
    filter.storeId = new mongoose.Types.ObjectId(storeId);
  }

  const products = await Product.find(filter)
    .populate("categoryId", "name slug")
    .populate("storeId", "name logo")
    .limit(storeId ? 1 : 2)
    .lean();

  if (products.length === 0) {
    throw new AppError("Product not found", 404);
  }

  if (!storeId && products.length > 1) {
    throw new AppError(
      "More than one product matches this slug. Pass shopId/storeId to disambiguate.",
      400,
    );
  }

  return mapProductResponse(products[0]);
};

