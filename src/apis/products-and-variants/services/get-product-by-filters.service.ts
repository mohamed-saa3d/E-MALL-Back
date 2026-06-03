// product.service.ts (تكملة)
import { Product } from "../model/products-and-variants.model";
import mongoose from "mongoose";

type ListQuery = {
  page?: any;
  limit?: any;
  minPrice?: any;
  maxPrice?: any;
  sort?: string;
  storeId?: string;
  category?: string; // could be id or slug
  search?: string;
  // + any dynamic attribute keys
};

const RESERVED_QS = new Set([
  "page",
  "limit",
  "minPrice",
  "maxPrice",
  "sort",
  "storeId",
  "category",
  "search",
  "shopId",
]);

export const listProducts = async (rawQuery: ListQuery) => {
  const page = Math.max(1, Number(rawQuery.page || 1));
  const limit = Math.max(1, Math.min(100, Number(rawQuery.limit || 24)));
  const skip = (page - 1) * limit;

  // build base $match
  const baseMatch: any = { isActive: true };

  if (rawQuery.storeId) {
    if (!mongoose.Types.ObjectId.isValid(rawQuery.storeId)) {
      throw new Error("Invalid storeId");
    }
    baseMatch.storeId =new mongoose.Types.ObjectId(rawQuery.storeId);
  }

  // category could be id or slug. resolve slug here if necessary.
  if (rawQuery.category) {
    const cat = rawQuery.category;
    if (mongoose.Types.ObjectId.isValid(cat)) {
      baseMatch.categoryId =new mongoose.Types.ObjectId(cat);
    } else {
      // try to resolve slug -> category _id (assume Category model exists)
      const Category = mongoose.model("Category");
      const found = await Category.findOne({ slug: cat }).select("_id").lean();
      if (found) baseMatch.categoryId = (found as any)._id;
      else {
        // no category matches slug -> no products
        baseMatch.categoryId = new mongoose.Types.ObjectId(); // impossible id
      }
    }
  }

  // search on name / description
  if (rawQuery.search) {
    const re = new RegExp(String(rawQuery.search), "i");
    baseMatch.$or = [{ name: re }, { description: re }];
  }

  // build price constraints (used inside variant filtering)
  const minPrice = rawQuery.minPrice !== undefined ? Number(rawQuery.minPrice) : undefined;
  const maxPrice = rawQuery.maxPrice !== undefined ? Number(rawQuery.maxPrice) : undefined;

  // parse dynamic attributes from query (keys not reserved)
  const attributeFilters: { name: string; values: string[] }[] = [];
  for (const [k, v] of Object.entries(rawQuery)) {
    if (RESERVED_QS.has(k)) continue;
    // skip empty values
    if (!v && v !== 0) continue;
    // allow comma-separated values: color=red,blue
    const vals = String(v).split(",").map((s) => s.trim()).filter(Boolean);
    if (vals.length > 0) attributeFilters.push({ name: k, values: vals });
  }

  //
  // Aggregation strategy:
  // 1) $match base product filters (isActive, store, category, search)
  // 2) $addFields: matchedVariants = $filter(variants, cond: <price cond + all attributes cond>)
  // 3) $match: size(matchedVariants) > 0  --> keep products that have at least one matching variant
  // 4) $addFields: mainVariant = logic (defaultVariantId or variant with isDefault true or first variant)
  // 5) $sort by requested field (can use mainVariant.price or salesCount)
  // 6) $facet: { data: [ $skip, $limit, $project fields ], total: [ $count ] }
  //

  const pipeline: any[] = [];
  pipeline.push({ $match: baseMatch });

  // build the $filter cond for variants
  const variantConditions: any[] = [];

  // price condition
  if (minPrice !== undefined) variantConditions.push({ $gte: ["$$v.price", minPrice] });
  if (maxPrice !== undefined) variantConditions.push({ $lte: ["$$v.price", maxPrice] });

  // attribute conditions: for each attribute we require that variant.attributes contains an element with that name and one of the allowed values
  for (const attr of attributeFilters) {
    // build a $gt: [ { $size: { $filter: { input: "$$v.attributes", cond: <eq name & in values> } } }, 0 ]
    const inValuesArray = attr.values.map((val) => val);
    const attrMatch = {
      $gt: [
        {
          $size: {
            $filter: {
              input: "$$v.attributes",
              as: "a",
              cond: {
                $and: [
                  { $eq: ["$$a.name", attr.name] },
                  { $in: ["$$a.value", inValuesArray] },
                ],
              },
            },
          },
        },
        0,
      ],
    };
    variantConditions.push(attrMatch);
  }

  // final cond for $filter: if no conditions, we want to accept all variants -> use true
  let variantCond: any = true;
  if (variantConditions.length === 1) {
    variantCond = variantConditions[0];
  } else if (variantConditions.length > 1) {
    variantCond = { $and: variantConditions };
  }

  // add matchedVariants field
  pipeline.push({
    $addFields: {
      matchedVariants: {
        $filter: {
          input: "$variants",
          as: "v",
          cond: variantCond,
        },
      },
    },
  });

  // keep products that have at least one matchedVariant
  pipeline.push({
    $match: {
      $expr: { $gt: [{ $size: "$matchedVariants" }, 0] },
    },
  });

  // pick mainVariant (prefer defaultVariantId -> variant.isDefault -> first variant)
  pipeline.push({
    $addFields: {
      mainVariant: {
        $let: {
          vars: {
            byDefaultId: {
              $first: {
                $filter: {
                  input: "$variants",
                  as: "v",
                  cond: { $eq: ["$$v._id", "$defaultVariantId"] },
                },
              },
            },
            byIsDefault: {
              $first: {
                $filter: {
                  input: "$variants",
                  as: "v",
                  cond: { $eq: ["$$v.isDefault", true] },
                },
              },
            },
          },
          in: {
            $ifNull: [
              "$$byDefaultId",
              { $ifNull: ["$$byIsDefault", { $arrayElemAt: ["$variants", 0] }] },
            ],
          },
        },
      },
      // optionally expose number of matching variants for UI (e.g., show "3 variants match")
      matchedCount: { $size: "$matchedVariants" },
    },
  });

  // sorting
  const sortStage: any = {};
  const sort = rawQuery.sort;
  if (sort === "price-asc") {
    sortStage["mainVariant.price"] = 1;
  } else if (sort === "price-desc") {
    sortStage["mainVariant.price"] = -1;
  } else if (sort === "best-selling") {
    sortStage["salesCount"] = -1;
  } else {
    // default newest
    sortStage["createdAt"] = -1;
  }
  pipeline.push({ $sort: sortStage });

  // facet for pagination + total
  pipeline.push({
    $facet: {
      data: [
        { $skip: skip },
        { $limit: limit },
        // project minimal fields for list view (product basic + mainVariant)
        {
          $project: {
            name: 1,
            slug: 1,
            brand: 1,
            images: 1,
            storeId: 1,
            categoryId: 1,
            salesCount: 1,
            createdAt: 1,
            matchedCount: 1,
            mainVariant: 1,
          },
        },
      ],
      total: [{ $count: "count" }],
    },
  });

  const aggRes = await Product.aggregate(pipeline);

  const data = aggRes[0].data || [];
  const total = aggRes[0].total[0] ? aggRes[0].total[0].count : 0;

  return {
    products: data,
    total,
    page,
    limit,
  };
};