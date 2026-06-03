import { CategoryRef, ProductRef, StoreRef, UserRef } from "../types/ref.types";

export const toCategoryRef = (category: any): CategoryRef | null => {
  if (!category || typeof category !== "object") return null;
  return {
    _id: category._id,
    name: category.name,
    slug: category.slug,
  };
};

export const toStoreRef = (store: any): StoreRef | null => {
  if (!store || typeof store !== "object") return null;
  return {
    _id: store._id,
    name: store.name,
    logo: store.logo,
  };
};

export const toUserRef = (user: any): UserRef | null => {
  if (!user || typeof user !== "object") return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
};

export const toProductRef = (product: any): ProductRef | null => {
  if (!product || typeof product !== "object") return null;
  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    images: product.images,
  };
};

export const mapStoreResponse = (
  store: any,
  options: { includeOwner?: boolean } = {},
) => {
  if (!store || typeof store !== "object") return store;

  const next: any = { ...store };

  if (Object.prototype.hasOwnProperty.call(next, "categoryId")) {
    next.category = toCategoryRef(next.categoryId);
    delete next.categoryId;
  }

  if (Object.prototype.hasOwnProperty.call(next, "ownerId")) {
    if (options.includeOwner) {
      next.owner = toUserRef(next.ownerId);
    }
    delete next.ownerId;
  }

  return next;
};

export const mapProductResponse = (
  product: any,
  options: { includeCategory?: boolean; includeStore?: boolean } = {},
) => {
  if (!product || typeof product !== "object") return product;

  const next: any = { ...product };

  if (Object.prototype.hasOwnProperty.call(next, "categoryId")) {
    if (options.includeCategory !== false) {
      next.category = toCategoryRef(next.categoryId);
    }
    delete next.categoryId;
  }

  if (Object.prototype.hasOwnProperty.call(next, "storeId")) {
    if (options.includeStore !== false) {
      next.store = toStoreRef(next.storeId);
    }
    delete next.storeId;
  }

  return next;
};

export const mapCategoryResponse = (category: any) => {
  if (!category || typeof category !== "object") return category;

  const next: any = { ...category };

  if (Object.prototype.hasOwnProperty.call(next, "parentId")) {
    next.parent = toCategoryRef(next.parentId);
    delete next.parentId;
  }

  return next;
};

export const mapAddressResponse = (address: any) => {
  if (!address || typeof address !== "object") return address;

  const next: any = { ...address };

  if (Object.prototype.hasOwnProperty.call(next, "userId")) {
    delete next.userId;
  }

  return next;
};

const mapItemProductStore = (item: any) => {
  const next: any = { ...item };

  if (Object.prototype.hasOwnProperty.call(next, "productId")) {
    next.product = toProductRef(next.productId);
    delete next.productId;
  }

  if (Object.prototype.hasOwnProperty.call(next, "storeId")) {
    next.store = toStoreRef(next.storeId);
    delete next.storeId;
  }

  return next;
};

export const mapCartResponse = (
  cart: any,
  options: { includeUser?: boolean } = {},
) => {
  if (!cart || typeof cart !== "object") return cart;

  const next: any = { ...cart };

  if (Object.prototype.hasOwnProperty.call(next, "userId")) {
    if (options.includeUser) {
      next.user = toUserRef(next.userId);
    }
    delete next.userId;
  }

  if (Array.isArray(next.items)) {
    next.items = next.items.map(mapItemProductStore);
  }

  return next;
};

export const mapWishListResponse = (
  list: any,
  options: { includeUser?: boolean } = {},
) => {
  if (!list || typeof list !== "object") return list;

  const next: any = { ...list };

  if (Object.prototype.hasOwnProperty.call(next, "userId")) {
    if (options.includeUser) {
      next.user = toUserRef(next.userId);
    }
    delete next.userId;
  }

  if (Array.isArray(next.items)) {
    next.items = next.items.map(mapItemProductStore);
  }

  return next;
};

export const mapOrderResponse = (
  order: any,
  options: { includeUser?: boolean } = {},
) => {
  if (!order || typeof order !== "object") return order;

  const next: any = { ...order };

  if (Object.prototype.hasOwnProperty.call(next, "userId")) {
    if (options.includeUser) {
      next.user = toUserRef(next.userId);
    }
    delete next.userId;
  }

  return next;
};

/**
 * Map an order into a store-scoped view. This enforces strict data isolation
 * for store-facing APIs: only the matching store entry and its items are kept,
 * and global sensitive fields are removed.
 */
export const mapStoreOrderResponse = (order: any, storeId: any) => {
  if (!order || typeof order !== "object") return order;

  const next: any = { ...order };

  // Remove global sensitive fields
  if (Object.prototype.hasOwnProperty.call(next, "orderStatus")) {
    delete next.orderStatus;
  }
  // Remove entire payment object for store view
  if (Object.prototype.hasOwnProperty.call(next, "payment")) {
    delete next.payment;
  }

  // Remove totals
  if (Object.prototype.hasOwnProperty.call(next, "totals")) {
    delete next.totals;
  }

  // Remove user/buyer sensitive info
  if (Object.prototype.hasOwnProperty.call(next, "userId")) delete next.userId;
  if (Object.prototype.hasOwnProperty.call(next, "user")) delete next.user;
  if (Object.prototype.hasOwnProperty.call(next, "buyerSnapshot"))
    delete next.buyerSnapshot;

  // Remove delivery information entirely
  if (Object.prototype.hasOwnProperty.call(next, "delivery"))
    delete next.delivery;

  // Ensure stores array contains only the matching store
  if (Array.isArray(next.stores)) {
    next.stores = next.stores
      .filter((s: any) => String(s.storeId) === String(storeId))
      .map((s: any) => {
        const storeCopy: any = { ...s };

        // Keep only items related to this store and map product refs
        if (Array.isArray(storeCopy.items)) {
          storeCopy.items = storeCopy.items.map(mapItemProductStore);
        }

        // Ensure subtotal exists and is a number
        if (typeof storeCopy.subtotal !== "number") {
          storeCopy.subtotal = Array.isArray(storeCopy.items)
            ? storeCopy.items.reduce(
                (sum: number, it: any) => sum + Number(it.totalPrice || 0),
                0,
              )
            : 0;
        }

        return storeCopy;
      });
  } else {
    next.stores = [];
  }

  // Filter missingItems to this store only
  if (Array.isArray(next.missingItems)) {
    next.missingItems = next.missingItems.filter(
      (mi: any) => String(mi.storeId) === String(storeId),
    );
  }

  return next;
};

export const mapProductCountArray = (items: any[]) => {
  if (!Array.isArray(items)) return items;
  return items.map((item) => {
    const next: any = { ...item };
    if (Object.prototype.hasOwnProperty.call(next, "productId")) {
      next.product = toProductRef(next.productId);
      delete next.productId;
    }
    return next;
  });
};
