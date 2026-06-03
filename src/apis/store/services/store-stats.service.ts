import { ObjectId } from "mongoose";
import Cart from "../../cart/models/cart.model";
import WishList from "../../wish-list/models/wish-list.model";
import Order from "../../order/models/order.model";
import AppError from "../../../utils/app-error";
import mongoose from "mongoose";
import { mapProductCountArray } from "../../../utils/response-mappers";
import { ProductRef } from "../../../types/ref.types";

// For statistics we need to import Product from products-and-variants
import { Product as ProdModel } from "../../products-and-variants/model/products-and-variants.model";

export interface StoreDashboardStats {
  totalProducts: number;
  productsInCarts: Array<{ product: ProductRef | null; count: number }>;
  productsInWishlists: Array<{ product: ProductRef | null; count: number }>;
  bestSelling?: Array<{ product: ProductRef | null; sold: number }>;
}

export const getStoreDashboard = async (storeId: ObjectId | string) => {
  try {
    const sid =
      typeof storeId === "string"
        ? new mongoose.Types.ObjectId(storeId)
        : storeId;
    // products count
    const totalProducts = await ProdModel.countDocuments({
      storeId: sid,
      isActive: true,
    } as any);

    // aggregate carts: unwind items then match storeId then group by productId
    const cartAgg = await Cart.aggregate([
      { $unwind: "$items" },
      { $match: { "items.storeId": sid } },
      {
        $group: {
          _id: "$items.productId",
          count: { $sum: "$items.quantity" },
        },
      },
    ]);

    // optionally load product basic info for display
    const productsInCarts = cartAgg.map((r: any) => ({
      productId: r._id,
      count: r.count,
    }));

    // aggregate wishlist similarly (every entry counts as 1)
    const wishAgg = await WishList.aggregate([
      { $unwind: "$items" },
      { $match: { "items.storeId": sid } },
      {
        $group: {
          _id: "$items.productId",
          count: { $sum: 1 },
        },
      },
    ]);
    const productsInWishlists = wishAgg.map((r: any) => ({
      productId: r._id,
      count: r.count,
    }));

    // determine best selling via orders
    const orderAgg = await Order.aggregate([
      { $unwind: "$stores" },
      { $match: { "stores.storeId": sid } },
      { $unwind: "$stores.items" },
      {
        $group: {
          _id: "$stores.items.productId",
          sold: { $sum: "$stores.items.quantity" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
    ]);

    const bestSelling = orderAgg.map((r) => ({
      productId: r._id,
      sold: r.sold,
    }));

    const productIds = new Set<string>();
    [...productsInCarts, ...productsInWishlists, ...bestSelling].forEach(
      (item: any) => {
        if (item?.productId) {
          productIds.add(String(item.productId));
        }
      },
    );

    const productList = productIds.size
      ? await ProdModel.find({ _id: { $in: Array.from(productIds) } })
          .select("name slug images")
          .lean()
      : [];
    const productMap = new Map(
      productList.map((product: any) => [String(product._id), product]),
    );

    const attachProduct = (item: any) => ({
      ...item,
      productId: productMap.get(String(item.productId)) || null,
    });

    return {
      totalProducts,
      productsInCarts: mapProductCountArray(
        productsInCarts.map(attachProduct),
      ),
      productsInWishlists: mapProductCountArray(
        productsInWishlists.map(attachProduct),
      ),
      bestSelling: mapProductCountArray(bestSelling.map(attachProduct)),
    };
  } catch (error: any) {
    throw error;
  }
};
