# E-Mall Backend API Documentation

Generated from the live Express router, middleware, validation, controller, service, and Mongoose model files in `src/`.

- **Application root:** `src/app.ts`
- **Framework:** Express 5.2.1, TypeScript, Mongoose 9.1.5
- **Validation:** Zod 4.3.6 via `src/middlewares/validate-body.middleware.ts` and selected controller-level `schema.parse(...)`
- **Authentication:** JWT bearer token via `src/middlewares/authentication.ts`
- **Global middleware:** `express.json`, `cookie-parser`, XSS sanitizer, Helmet, `quickValidate`
- **Base URL:** not hard-coded in the project; examples use `http://localhost:<PORT>`

## Table of Contents

1. [Global API Behavior](#global-api-behavior)
2. [Data Models and Relations](#data-models-and-relations)
3. [Auth Module](#auth-module)
4. [Categories Module](#categories-module)
5. [Stores Module](#stores-module)
6. [Products Module](#products-module)
7. [Cart Module](#cart-module)
8. [Wishlist Module](#wishlist-module)
9. [Addresses Module](#addresses-module)
10. [Orders Module](#orders-module)
11. [Delivery Module](#delivery-module)
12. [Payments Module](#payments-module)
13. [Cross-Cutting Analysis](#cross-cutting-analysis)

## Global API Behavior

### Authentication

Protected endpoints require:

| Header | Required | Example | Notes |
|---|---:|---|---|
| `Authorization` | Yes | `Bearer eyJhbGciOi...` | Parsed by `authentication.ts`. The token payload must include `id`; the user must still exist. |
| `Content-Type` | For JSON bodies | `application/json` | All body validators expect JSON. |
| `Cookie` | For refresh/logout | `refreshToken=<token>` | Refresh tokens are stored in an HTTP-only `refreshToken` cookie. |

Authentication error examples:

```json
{
  "status": "fail",
  "message": "You are not logged in. Please log in to get access"
}
```

```json
{
  "status": "fail",
  "message": "Your session has expired. Please log in again."
}
```

### Roles

The application defines these roles in `src/apis/auth/models/user.model.ts`:

| Role | Usage |
|---|---|
| `admin` | Category administration, store administration, store management, product deletion, delivery operations. |
| `owner` | Store/product/order management for owned stores, product deletion. |
| `user` | Default registered customer role. |
| `accounting` | Defined but not used by the current routers. |
| `fulfillment` | Delivery/order fulfillment routes. |

### Standard Error Shape

Operational errors are produced by `AppError` and handled by `global-error-handling.middleware.ts`.

```json
{
  "status": "fail",
  "message": "Validation or business error message"
}
```

Common error codes:

| Status | Meaning | Typical Causes |
|---:|---|---|
| `400` | Bad request | Zod validation failure, invalid ID, invalid state, duplicate value. |
| `401` | Unauthorized | Missing/invalid/expired JWT, missing refresh cookie. |
| `403` | Forbidden | Valid user lacks required role or ownership. |
| `404` | Not found | Missing user, category, store, product, address, cart, wishlist, or order. |
| `409` | Conflict | Invalid order state transition or SKU uniqueness conflict. |
| `429` | Too many requests | Rate limiter on `/auth/refresh`. |
| `500` | Server error | Unexpected runtime/database error. |

### Global Validation and Sanitization

`quickValidate` runs before all routes and validates/sanitizes common fields if present:

| Field Location | Field | Rules |
|---|---|---|
| Body | `email` | Valid email, trimmed, lowercased. |
| Query | `email` | Valid email, trimmed, lowercased. |
| Params | `email` | Valid email, trimmed, lowercased. |
| Body | `password` | Min 8, must contain English letters, a number, and a symbol. |
| Params/Query/Body | `token` | Exactly 64 hex characters. |

`xss.ts` recursively sanitizes string values in `req.body`, `req.query`, and `req.params`.

## Data Models and Relations

| Model | File | Main Fields | Relations |
|---|---|---|---|
| `User` | `src/apis/auth/models/user.model.ts` | `email`, `name`, `phoneNumber`, `role`, `isActive`, `hashPassword`, verification flags | Owns stores; owns cart, wishlist, addresses, orders; can be delivery rider. |
| `LoginSession` | `src/apis/auth/models/loginSession.model.ts` | `userId`, hashed `refreshToken`, `ip`, `userAgent`, `revokedAt`, `expiresAt` | Belongs to `User`; TTL index on `expiresAt`. |
| `VerifyTokens` | `src/apis/auth/models/verify-tokens.model.ts` | `userId`, `token`, `type`, `expiresAt`, `used`, `verifiedAt` | Belongs to `User`; used for email verification and password reset. |
| `Category` | `src/apis/category/models/category.model.ts` | `name`, `slug`, `parentId` | Self-references parent category; referenced by stores and products. |
| `Store` | `src/apis/store/models/store.model.ts` | `name`, `logo`, `ownerId`, `categoryId`, `authorizedBrand`, `isActive`, opening/closing times, `deletedAt` | Belongs to owner `User` and `Category`; has products and store order slices. |
| `Product` | `src/apis/products-and-variants/model/products-and-variants.model.ts` | `name`, `slug`, `description`, `brand`, `categoryId`, `storeId`, `variants`, `tags`, `isActive`, `salesCount` | Belongs to `Store` and `Category`; embeds variants. Unique indexes on `(slug, storeId)` and `("variants.sku", storeId)`. |
| `Cart` | `src/apis/cart/models/cart.model.ts` | `userId`, `items[]` | Belongs to `User`; item refs `Product`, variant ID, `Store`. |
| `WishList` | `src/apis/wish-list/models/wish-list.model.ts` | `userId`, `items[]` | Belongs to `User`; item refs `Product`, variant ID, `Store`. |
| `Address` | `src/apis/address/model/address.model.ts` | `userId`, `street`, `city`, `distanceMark`, `phone`, `notes`, `isDefault` | Belongs to `User`; unique default address per user. |
| `Order` | `src/apis/order/models/order.model.ts` | buyer snapshot, store slices, missing items, order/payment/delivery status, totals | Belongs to `User`; embeds store-specific order groups, item snapshots, payment and delivery data. |

## Auth Module

Router file: `src/apis/auth/router/auth.route.ts`

### Auth Request Schemas

| Schema | Field | Type | Required | Validation / Rules | Default | Example |
|---|---|---:|---:|---|---|---|
| `RegisterBody` | `name` | string | Yes | Trimmed, min 1, max 100 | None | `Mohammed Hassan` |
| `RegisterBody` | `email` | string | Yes | Valid email, trimmed, lowercased | None | `user@example.com` |
| `RegisterBody` | `password` | string | Yes | Min 8, must contain letters, number, symbol | None | `Str0ng!Pass` |
| `RegisterBody` | `phone` | string | No | Regex `^01\d{9}$` | None | `01012345678` |
| `LoginBody` | `email` | string | Yes | Valid email, lowercased | None | `user@example.com` |
| `LoginBody` | `password` | string | Yes | Min 8, max 128 | None | `Str0ng!Pass` |
| `ForgotPasswordBody` | `email` | string | Yes | Valid email, lowercased | None | `user@example.com` |
| `ResetPasswordBody` | `newPassword` | string | Yes | Controller requires; global password rules apply only to field named `password`, so this is service-checked for confirmation match only | None | `N3w!Password` |
| `ResetPasswordBody` | `confirmPassword` | string | Yes | Must equal `newPassword` | None | `N3w!Password` |
| `EmailVerificationBody` | `email` | string | Yes | Valid email by global `quickValidate` | None | `user@example.com` |
| `EmailVerificationBody` | `verifyCode` | string | Yes | Required by controller | None | `123456` |
| `SendEmailVerificationCodeBody` | `email` | string | Yes | Valid email by global `quickValidate` | None | `user@example.com` |

### Auth Endpoints

| Method | Full Route Path | Short Description | Controller / Handler | File Location |
|---|---|---|---|---|
| `POST` | `/auth/register` | Create a user, cart, wishlist, login session, access token, and refresh cookie. | `register` | `src/apis/auth/controllers/register.controller.ts` |
| `POST` | `/auth/login` | Authenticate with email/password and create a refresh session. | `login` | `src/apis/auth/controllers/login.controller.ts` |
| `POST` | `/auth/refresh` | Rotate refresh token cookie and return a new access token. | `refreshToken` | `src/apis/auth/controllers/refresh.controller.ts` |
| `GET` | `/auth/logout` | Revoke current refresh cookie session and clear cookie. | `logout` | `src/apis/auth/controllers/logout.controller.ts` |
| `POST` | `/auth/forgot-password` | Create a password-reset token and send email. | `forgotPassword` | `src/apis/auth/controllers/forgot.controller.ts` |
| `POST` | `/auth/reset-password/:token` | Reset password using a 64-character reset token. | `resetPassword` | `src/apis/auth/controllers/reset-password.controller.ts` |
| `POST` | `/auth/send-code-email-verification` | Send an email verification code. | `sendCodeEmailVerification` | `src/apis/auth/controllers/email-send-code-verification.controller.ts` |
| `PATCH` | `/auth/email-verification` | Verify email using email and verification code. | `emailVerification` | `src/apis/auth/controllers/email-verification.controller.ts` |

### Auth Endpoint Details

| Endpoint | Authentication | Roles / Permissions | Required Headers | Path Params | Query Params | Request Body | Success Response | Error Responses | Middleware / Analysis |
|---|---|---|---|---|---|---|---|---|---|
| `POST /auth/register` | No | Public | `Content-Type: application/json` | None | None | `RegisterBody` | `200`, `{ status, token, data.user }`; sets `refreshToken` cookie | `400` duplicate/deactivated/missing fields/validation, `500` | `validate(registerSchema)`, global password/email validation, XSS, Helmet. Creates `User`, `LoginSession`, `Cart`, `WishList`. |
| `POST /auth/login` | No | Public | `Content-Type: application/json` | None | None | `LoginBody` | `201`, `{ status, token, data.user }`; sets `refreshToken` cookie | `400` user not found/deactivated/invalid password/validation, `500` | `validate(loginSchema)`. Stores hashed refresh token session with IP and user agent. |
| `POST /auth/refresh` | Refresh cookie required | Public session | Cookie: `refreshToken` | None | None | None | `200`, `{ status, token, data.user }`; rotates cookie | `401` missing/invalid/reused refresh token, `404` user not found, `429`, `500` | `refreshLimiter`: 100 requests/15 minutes. Detects refresh token reuse and revokes active sessions. |
| `GET /auth/logout` | Refresh cookie optional | Current session | Cookie: `refreshToken` if present | None | None | None | `200`, string `"Logout successfully"` or `"cookies not found"` | `500` | Clears HTTP-only refresh cookie using `cookie-options.ts`. |
| `POST /auth/forgot-password` | No | Public | `Content-Type: application/json` | None | None | `ForgotPasswordBody` | `200`, `{ message }` | `400` user not found/validation, `500` email failure | `validate(forgotPasswordSchema)`. Creates reset token with 30-minute service TTL. |
| `POST /auth/reset-password/:token` | No | Reset token | `Content-Type: application/json` | `token`: string, required, 64 hex chars, example `5a2d...b631` | None | `ResetPasswordBody` | `200`, `{ status, message }` | `400` missing token/password/confirm, invalid token, mismatch, user not found | Token is validated globally by `quickValidate`; route comment says body validation is intended through `quickValidate`, but `newPassword` is not covered by the global `password` field rule. |
| `POST /auth/send-code-email-verification` | No | Public | `Content-Type: application/json` | None | None | `SendEmailVerificationCodeBody` | `200`, `{ message }` | `400` user not found, invalid email, `500` | No route-local Zod schema; global `quickValidate` validates `email`. |
| `PATCH /auth/email-verification` | No | Public | `Content-Type: application/json` | None | None | `EmailVerificationBody` | `200`, `{ message }` | `400` user not found/already verified/invalid or expired code, `401` missing email/code | No route-local schema; global `quickValidate` validates `email`. |

Example register request:

```json
{
  "name": "Mohammed Hassan",
  "email": "user@example.com",
  "password": "Str0ng!Pass",
  "phone": "01012345678"
}
```

Example auth response:

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "665f51b9e5348a2f42b56c41",
      "name": "Mohammed Hassan",
      "email": "user@example.com",
      "phoneNumber": "01012345678"
    }
  }
}
```

## Categories Module

Router file: `src/apis/category/router/category.route.ts`

### Category Request Schemas

| Schema | Field | Type | Required | Validation / Rules | Default | Example |
|---|---|---:|---:|---|---|---|
| `CreateCategoryBody` | `name` | string | Yes | Trimmed, min 1, max 100 | None | `Electronics` |
| `CreateCategoryBody` | `parentId` | ObjectId string | No | Must be valid Mongo ObjectId; transformed to ObjectId | None | `665f51b9e5348a2f42b56c41` |
| `UpdateCategoryBody` | `name` | string | No | Trimmed, min 1, max 100 | None | `Mobiles` |
| `UpdateCategoryBody` | `parentId` | ObjectId string | No | Valid ObjectId | None | `665f51b9e5348a2f42b56c41` |
| `ReplaceCategoryBody` | `replacementCategoryId` | ObjectId string | Yes | Valid ObjectId | None | `665f51b9e5348a2f42b56c42` |
| `ReplaceCategoryBody` | `reason` | string | No | Trimmed, max 500 | None | `Merged duplicate categories` |

### Category Endpoints

| Endpoint | Description | Handler | File | Authentication | Roles | Params | Query | Body | Success Response | Errors / Analysis |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET /categories/` | List all categories. | `listCategories` | `src/apis/category/controllers/category.controller.ts` | No | Public | None | None | None | `200`, `{ status, data: { categories, total } }` | `500`; no pagination. |
| `GET /categories/:id/usage` | Check if a category is used by stores/products. | `getCategoryUsage` | same | No | Public | `id`: ObjectId, required | None | None | `200`, `{ status, data: { ...usage } }` | `404` category not found, `400` invalid ID via Mongoose cast. |
| `GET /categories/:id` | Fetch one category by ID. | `getCategory` | same | No | Public | `id`: ObjectId, required | None | None | `200`, `{ status, data: { category } }` | `404`, `400`. |
| `POST /categories/` | Create a category. | `createCategory` | same | Yes | `admin` | None | None | `CreateCategoryBody` | `201`, `{ status, message, data.category }` | `400` duplicate/missing/validation, `401`, `403`, `404` parent not found. |
| `PATCH /categories/:id` | Update name or parent. | `updateCategoryHandler` | same | Yes | `admin` | `id`: ObjectId, required | None | `UpdateCategoryBody` | `200`, `{ status, message, data.category }` | `400`, `401`, `403`, `404`. |
| `POST /categories/:id/replace` | Validate replacement and return replacement-processing result. | `replaceCategoryHandler` | same | Yes | `admin` | `id`: ObjectId, required | None | `ReplaceCategoryBody` | `200`, `{ status, message, data }` | `400` same/missing IDs, `401`, `403`, `404`. |
| `DELETE /categories/:id` | Delete an unused category. | `deleteCategory` | same | Yes | `admin` | `id`: ObjectId, required | None | None | `200`, `{ status, message }` | `400`/`404` invalid/in-use category, `401`, `403`. |

Example category response:

```json
{
  "status": "success",
  "data": {
    "category": {
      "_id": "665f51b9e5348a2f42b56c41",
      "name": "Electronics",
      "slug": "electronics",
      "parentId": null,
      "createdAt": "2026-05-10T00:00:00.000Z",
      "updatedAt": "2026-05-10T00:00:00.000Z"
    }
  }
}
```

## Stores Module

Router file: `src/apis/store/router/store.router.ts`

### Store Request Schemas

| Schema | Field | Type | Required | Validation / Rules | Default | Example |
|---|---|---:|---:|---|---|---|
| `CreateStoreBody` | `name` | string | Yes | Trimmed, min 1, max 100 | None | `Tech Hub` |
| `CreateStoreBody` | `email` | string | Yes | Valid email, lowercased | None | `owner@example.com` |
| `CreateStoreBody` | `categoryName` | string | Conditional | Required if `categoryId` absent; mutually exclusive with `categoryId` | None | `Electronics` |
| `CreateStoreBody` | `categoryId` | ObjectId string | Conditional | Required if `categoryName` absent; valid ObjectId; mutually exclusive with `categoryName` | None | `665f51b9e5348a2f42b56c41` |
| `CreateStoreBody` | `authorizedBrand` | string | No | Trimmed, min 1, max 100 | None | `Apple` |
| `CreateStoreBody` | `logo` | string | No | Trimmed, min 1, max 100 | None | `https://cdn.example.com/logo.png` |
| `CreateStoreBody` | `openingTime` | string | No | Exactly 5 chars; intended `HH:MM` | None | `09:00` |
| `CreateStoreBody` | `closingTime` | string | No | Exactly 5 chars; intended `HH:MM` | None | `22:00` |
| `UpdateStoreOrderBody` | `status` | enum | Yes | `pending`, `preparing`, `ready`, `rejected` | None | `ready` |
| `UpdateStoreOrderBody` | `rejectionReason` | string | Conditional | Required when rejected unless `missingItems` provided | None | `Out of stock` |
| `UpdateStoreOrderBody` | `missingItems[]` | array | Conditional | Required when rejected unless `rejectionReason` provided; each entry uses `orderItemId` and `reason` | None | See example |
| `StoreProductBody` | `name` | string | Yes on create | Min 1 | None | `iPhone 15` |
| `StoreProductBody` | `slug` | string | No | Min 1 | Generated by service if absent | `iphone-15` |
| `StoreProductBody` | `description` | string | No | Any string | None | `128GB smartphone` |
| `StoreProductBody` | `brand` | string | No | Any string | None | `Apple` |
| `StoreProductBody` | `categoryId` | string | Yes on create | Min 1; service verifies category | None | `665f51b9e5348a2f42b56c41` |
| `StoreProductBody` | `basePrice` | number | No | Min 0 | None | `799` |
| `StoreProductBody` | `variants[]` | array | Yes on create | Min 1 on create | None | See product example |
| `StoreProductBody` | `defaultVariantId` | string | No | Must reference one variant if supplied | None | `665f51b9e5348a2f42b56c45` |
| `StoreProductBody` | `images[]` | string[] | No | Array of strings | None | `["https://cdn.example.com/p.png"]` |
| `StoreProductBody` | `tags[]` | string[] | No | Array of strings | None | `["phone"]` |
| `StoreProductBody` | `isActive` | boolean | No, update only | Toggle product visibility | model default `true` | `true` |
| `Variant` | `sku` | string | Yes | Min 1; unique in store/product | None | `IPH15-BLK-128` |
| `Variant` | `price` | number | Yes | Min 0 | None | `799` |
| `Variant` | `salePrice` | number | No | Min 0, <= price; requires sale window | None | `749` |
| `Variant` | `saleStartAt` | date | Conditional | Required when `salePrice` is set; coerced date | None | `2026-05-10T00:00:00.000Z` |
| `Variant` | `saleEndAt` | date | Conditional | Required when `salePrice` is set; must be after start | None | `2026-05-20T00:00:00.000Z` |
| `Variant` | `imageUrl` | string | No | Any string | None | `https://cdn.example.com/v.png` |
| `Variant` | `images[]` | string[] | No | Array of strings | None | `[]` |
| `Variant` | `isDefault` | boolean | No | Preferred default variant | `false` | `true` |
| `Variant` | `attributes[]` | array | No | Each item has required `name` and `value` | None | `[{"name":"color","value":"black"}]` |

### Store Endpoints

| Endpoint | Description | Handler | File | Authentication | Roles | Params | Query | Body | Success Response | Errors / Analysis |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET /store/` | List active stores for public users. | `listAllStores` | `src/apis/store/controller/get-all-stores.controller.ts` | No | Public | None | None | None | `200`, `{ status, data: { stores, total } }` | No pagination. If `req.user` is admin, code can inspect `active`, but this public route does not attach `req.user`. |
| `GET /store/category/:categoryId` | List active stores in a category. | `listStoresByCategory` | `src/apis/store/controller/get-stores-by-category.controller.ts` | No | Public | `categoryId`: ObjectId, required | None | None | `200`, `{ status, data: { stores, total } }` | `404` category not found; no pagination. |
| `GET /store/admin` | Admin store listing. | `listAllStores` | `src/apis/store/controller/get-all-stores.controller.ts` | Yes | `admin` | None | `active`: boolean string, optional, intended filter | None | `200`, `{ status, data: { stores, total } }` | `401`, `403`. Service currently builds a filter but calls `Store.find()` without applying it, so active filtering may not work. |
| `GET /store/:storeId` | Fetch a public store by ID. | `getStoreByIdHandler` | `src/apis/store/controller/get-store-by-id.controller.ts` | No | Public | `storeId`: ObjectId/string, required | None | None | `200`, `{ status, data: { store } }` | `404` store not found, `400` invalid ID. |
| `GET /store/:storeId/products` | List public active products for a store. | `listStoreProductsPublicHandler` | `src/apis/store/products/controllers/list-store-products-public.controller.ts` | No | Public | `storeId`: string, required | `search`, `page`, `limit` | None | `200`, `{ status, data: { products, total, page, limit } }` | `400` invalid query/store ID, `404` store not found. Pagination default `page=1`, `limit=24`, max `100`; sorted newest first. |
| `GET /store/:storeId/products/:productId` | Fetch one public store product. | `getStoreProductPublicHandler` | `src/apis/store/products/controllers/get-store-product-public.controller.ts` | No | Public | `storeId`, `productId`: strings, required | None | None | `200`, `{ status, data: { product } }` | `404` product/store not found. |
| `POST /store/` | Create a store for an owner email/category. | `createStore` | `src/apis/store/controller/create-store.controller.ts` | Yes | `admin` | None | None | `CreateStoreBody` | `201`, `{ status, message, data.store }` | `400` missing/mutually exclusive category inputs/duplicate/category missing, `401`, `403`, `404` owner user not found. |
| `GET /store/my-store` | Get the current owner's store. | `getMyStoreByOwnerHandler` | `src/apis/store/controller/get-my-store-by-owner.controller.ts` | Yes | `owner`, `admin` | None | None | None | `200`, `{ status, data.store }` | `401`, `403`, `404`. **Route-order caveat:** currently defined after `GET /store/:storeId`, so it can be shadowed and treated as `storeId="my-store"` unless moved above `/:storeId`. |
| `PATCH /store/:storeId/manage/settings` | Update store settings. | `updateMyStoreHandler` | `src/apis/store/controller/update-store.controller.ts` | Yes | `owner`, `admin` | `storeId`: string, required | None | Partial store fields; no route-local Zod schema | `200`, `{ status, message, data.store }` | `400`, `401`, `403`, `404`, duplicate name. |
| `GET /store/:storeId/manage/dashboard` | Get store dashboard stats. | `getDashboardHandler` | `src/apis/store/controller/dashboard.controller.ts` | Yes | `owner`, `admin` | `storeId`: string in route, but handler currently uses store owned by `req.user` | None | None | `200`, `{ status, data }` | `401`, `403`, `404` no owned store. |
| `DELETE /store/:storeId/manage/delete` | Permanently delete store. | `hardDeleteStoreHandler` | `src/apis/store/controller/delete-store.controller.ts` | Yes | `admin` | `storeId`: string path, but handler reads `req.params.id`; see analysis | None | None | `200`, `{ status, message }` | `401`, `403`, `404`. **Implementation caveat:** route param is `storeId` but handler expects `id`, so hard delete may receive `undefined`. |
| `GET /store/:storeId/manage/products` | List owner/admin products, including inactive when requested. | `listMyStoreProductsHandler` | `src/apis/store/products/controllers/list-my-store-products.controller.ts` | Yes | `owner`, `admin` | `storeId`: string, required | `search`, `page`, `limit`, `isActive` | None | `200`, `{ status, data: { products, total, page, limit } }` | `400`, `401`, `403`, `404`. Pagination default `1/24`, max `100`. |
| `GET /store/:storeId/manage/products/:productId` | Fetch owner/admin product detail. | `getMyStoreProductHandler` | `src/apis/store/products/controllers/get-my-store-product.controller.ts` | Yes | `owner`, `admin` | `storeId`, `productId`: strings, required | None | None | `200`, `{ status, data.product }` | `401`, `403`, `404`. |
| `POST /store/:storeId/manage/products` | Create product in a store. | `createStoreProductHandler` | `src/apis/store/products/controllers/create-store-product.controller.ts` | Yes | `owner`, `admin` | `storeId`: string, required | None | `CreateStoreProductBody` | `201`, `{ status, data.product }` | `400` validation/default variant/category, `401`, `403`, `404`, `409` duplicate SKU. |
| `PATCH /store/:storeId/manage/products/:productId` | Update product or variants. | `updateMyStoreProductHandler` | `src/apis/store/products/controllers/update-my-store-product.controller.ts` | Yes | `owner`, `admin` | `storeId`, `productId`: strings, required | None | `UpdateStoreProductBody` | `200`, `{ status, data.product }` | `400`, `401`, `403`, `404`, `409` duplicate SKU. |
| `DELETE /store/:storeId/manage/products/:productId` | Delete a store product. | `deleteMyStoreProductHandler` | `src/apis/store/products/controllers/delete-my-store-product.controller.ts` | Yes | `owner`, `admin` | `storeId`, `productId`: strings, required | None | None | `200`, `{ status, message }` | `401`, `403`, `404`. |
| `GET /store/:storeId/manage/orders` | List store orders. | `getMyOrdersHandler` | `src/apis/store/controller/get-my-orders.controller.ts` | Yes | `owner`, `admin` | `storeId`: string, required | None | None | `200`, `{ status, data: { orders, total } }` | `400`, `401`, `403`, `404`. No pagination. |
| `GET /store/:storeId/manage/orders/:orderId` | Fetch a store-scoped order. | `getMyOrderHandler` | `src/apis/store/controller/get-my-order.controller.ts` | Yes | `owner`, `admin` | `storeId`, `orderId`: strings, required | None | None | `200`, `{ status, data.order }` | `400`, `401`, `403`, `404`. |
| `PATCH /store/:storeId/manage/orders/:orderId` | Update store order status. | `updateMyOrderHandler` | `src/apis/store/controller/update-my-order.controller.ts` | Yes | `owner`, `admin` | `storeId`, `orderId`: strings, required | None | `UpdateStoreOrderBody` | `200`, `{ status, message, data.order }` | `400`, `401`, `403`, `404`, `409` invalid state. |

Example store product create request:

```json
{
  "name": "iPhone 15",
  "description": "128GB smartphone",
  "brand": "Apple",
  "categoryId": "665f51b9e5348a2f42b56c41",
  "basePrice": 799,
  "variants": [
    {
      "sku": "IPH15-BLK-128",
      "price": 799,
      "salePrice": 749,
      "saleStartAt": "2026-05-10T00:00:00.000Z",
      "saleEndAt": "2026-05-20T00:00:00.000Z",
      "isDefault": true,
      "attributes": [
        { "name": "color", "value": "black" },
        { "name": "storage", "value": "128GB" }
      ]
    }
  ],
  "tags": ["phone", "ios"]
}
```

Example paginated product list response:

```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "_id": "665f51b9e5348a2f42b56c50",
        "name": "iPhone 15",
        "slug": "iphone-15",
        "brand": "Apple",
        "mainVariant": {
          "_id": "665f51b9e5348a2f42b56c51",
          "sku": "IPH15-BLK-128",
          "price": 799,
          "currentPrice": 749,
          "isSaleActive": true
        },
        "category": { "_id": "665f51b9e5348a2f42b56c41", "name": "Electronics", "slug": "electronics" },
        "store": { "_id": "665f51b9e5348a2f42b56c52", "name": "Tech Hub", "logo": "https://cdn.example.com/logo.png" }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 24
  }
}
```

## Products Module

Router file: `src/apis/products-and-variants/router/product.router.ts`

### Product Query Parameters

| Name | Type | Required | Default | Description | Example |
|---|---|---:|---|---|---|
| `storeId` | ObjectId string | No | None | Limit products to one store. | `665f51b9e5348a2f42b56c52` |
| `shopId` | ObjectId string | No | None | Alias for `storeId`. | `665f51b9e5348a2f42b56c52` |
| `category` | string | No | None | Category ObjectId or category slug. | `electronics` |
| `search` | string | No | None | Case-insensitive match on product name or description. | `iphone` |
| `minPrice` | number | No | None | Minimum variant price. | `100` |
| `maxPrice` | number | No | None | Maximum variant price. | `1000` |
| `sort` | enum | No | `newest` behavior | `price-asc`, `price-desc`, `newest`, `best-selling` | `price-asc` |
| `page` | integer | No | `1` | Page number. | `2` |
| `limit` | integer | No | `24` | Page size, max 100. | `20` |
| dynamic attributes | string | No | None | Any extra query key filters variant attributes; comma values supported. | `color=black,white&size=M` |

### Product Endpoints

| Endpoint | Description | Handler | File | Authentication | Roles | Params | Query | Body | Success Response | Errors / Analysis |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET /products` | Search/filter/sort paginated active products. | `listProducts` | `src/apis/products-and-variants/controllers/list-products.controller.ts` | No | Public | None | See product query table | None | `200`, `{ status, data: { products, total, page, limit } }` | `400` invalid price range/store ID/query. Supports pagination, sorting, price and dynamic attribute filtering. |
| `GET /products/:slug` | Fetch active product by slug; optional store disambiguation. | `getProductBySlug` | `src/apis/products-and-variants/controllers/get-product-by-slug.controller.ts` | No | Public | `slug`: string, required | `storeId`: ObjectId string, optional | None | `200`, `{ status, data.product }` | `400` duplicate slug without store ID or invalid store ID, `404` product not found. |
| `DELETE /products/:id` | Soft-delete product by ID. | `deleteProduct` | `src/apis/products-and-variants/controllers/delete-product.controller.ts` | Yes | `admin`, `owner` | `id`: ObjectId string, required | None | None | `200`, `{ status, data.product }` | `400` invalid/missing ID, `401`, `403` ownership, `404`. |

## Cart Module

Router file: `src/apis/cart/router/cart.router.ts`

All cart endpoints use `cartRouter.use(authorized)` and require a bearer token.

### Cart Request Schemas

| Schema | Field | Type | Required | Validation / Rules | Default | Example |
|---|---|---:|---:|---|---|---|
| `AddCartItemBody` | `variantId` | string | Yes | Min 1; service must find variant | None | `665f51b9e5348a2f42b56c51` |
| `AddCartItemBody` | `quantity` | integer | No | Min 1 | Service default `1` | `2` |
| `DecreaseCartItemBody` | `quantity` | integer | No | Min 1 | Service default `1` | `1` |

### Cart Endpoints

| Endpoint | Description | Handler | File | Auth / Roles | Params | Query | Body | Success Response | Errors / Analysis |
|---|---|---|---|---|---|---|---|---|---|
| `GET /cart/` | Get current user's cart. | `getCart` | `src/apis/cart/controllers/get-cart.controller.ts` | Bearer token, any role | None | None | None | `200`, `{ status, data: cart }` | `401`, `404` cart not found, `500`. |
| `POST /cart/item` | Add a product variant to cart. | `addCartItem` | `src/apis/cart/controllers/add-cart-item.controller.ts` | Bearer token, any role | None | None | `AddCartItemBody` | `200`, `{ status, message }` | `400` invalid quantity/variantId, `401`, `404` variant not found. |
| `PATCH /cart/items/:variantId/decrease` | Decrease quantity or remove if quantity reaches zero. | `decreaseCartItem` | `src/apis/cart/controllers/decrease-cart-item.controller.ts` | Bearer token, any role | `variantId`: string, required | None | `DecreaseCartItemBody` | `200`, `{ status, message }` | `400`, `401`, `404` cart/item not found. |
| `DELETE /cart/item/:variantId` | Remove an item by variant. | `removeCartItem` | `src/apis/cart/controllers/remove-cart-item.controller.ts` | Bearer token, any role | `variantId`: string, required | None | None | `200`, `{ status, message }` | `400`, `401`, `404`. |
| `DELETE /cart/` | Clear the current user's cart. | `clearCart` | `src/apis/cart/controllers/clear-cart.controller.ts` | Bearer token, any role | None | None | None | `200`, `{ status, message }` | `401`, `500`. |

Example cart response:

```json
{
  "status": "success",
  "data": {
    "_id": "665f51b9e5348a2f42b56c60",
    "items": [
      {
        "variantId": "665f51b9e5348a2f42b56c51",
        "quantity": 2,
        "product": { "_id": "665f51b9e5348a2f42b56c50", "name": "iPhone 15", "slug": "iphone-15" },
        "store": { "_id": "665f51b9e5348a2f42b56c52", "name": "Tech Hub", "logo": "https://cdn.example.com/logo.png" }
      }
    ]
  }
}
```

## Wishlist Module

Router file: `src/apis/wish-list/router/wish-list.router.ts`

All wishlist endpoints use `wishRouter.use(authorized)` and require a bearer token.

### Wishlist Endpoints

| Endpoint | Description | Handler | File | Auth / Roles | Params | Query | Body | Success Response | Errors / Analysis |
|---|---|---|---|---|---|---|---|---|---|
| `GET /wishlist/` | Get current user's wishlist. | `getWishList` | `src/apis/wish-list/controllers/get-wishlist.controller.ts` | Bearer token, any role | None | None | None | `200`, `{ status, data: list }` | `401`, `404`, `500`. |
| `POST /wishlist/item` | Add a variant to wishlist. | `addWishItem` | `src/apis/wish-list/controllers/add-wishlist-item.controller.ts` | Bearer token, any role | None | None | `variantId`: string, required, min 1 | `200`, `{ status, message }` | `400`, `401`, `404` variant not found. |
| `DELETE /wishlist/item/:variantId` | Remove a variant from wishlist. | `removeWishItem` | `src/apis/wish-list/controllers/remove-wishlist.controller.ts` | Bearer token, any role | `variantId`: string, required | None | None | `200`, `{ status, message }` | `400`, `401`, `404`. |
| `DELETE /wishlist/` | Clear current user's wishlist. | `clearWishList` | `src/apis/wish-list/controllers/clear-wishlist.controller.ts` | Bearer token, any role | None | None | None | `200`, `{ status, message }` | `401`, `500`. |

Example add wishlist request:

```json
{
  "variantId": "665f51b9e5348a2f42b56c51"
}
```

## Addresses Module

Router file: `src/apis/address/router/address.router.ts`

All address endpoints use `addressRouter.use(authorized)`.

### Address Request Schemas

| Schema | Field | Type | Required | Validation / Rules | Default | Example |
|---|---|---:|---:|---|---|---|
| `CreateAddressBody` | `street` | string | Yes | Trimmed, min 1 | None | `15 Nile St` |
| `CreateAddressBody` | `city` | string | Yes | Trimmed, min 1 | None | `Cairo` |
| `CreateAddressBody` | `distanceMark` | string | Yes | Trimmed, min 1 | None | `Near mall entrance` |
| `CreateAddressBody` | `phone` | string | Yes | Trimmed, min 1 | None | `01012345678` |
| `CreateAddressBody` | `notes` | string | No | Trimmed | None | `Call on arrival` |
| `CreateAddressBody` | `isDefault` | boolean | No | Optional | `false` model default | `true` |
| `UpdateAddressBody` | any address field except `isDefault` | string | At least one | Same string trim rules | None | `Cairo` |
| `SetDefaultAddressBody` | `isDefault` | boolean | No | Optional; service receives value | Service behavior | `true` |

### Address Endpoints

| Endpoint | Description | Handler | File | Auth / Roles | Params | Query | Body | Success Response | Errors / Analysis |
|---|---|---|---|---|---|---|---|---|---|
| `GET /addresses/` | List current user's addresses. | `getMyAddresses` | `src/apis/address/controllers/get-my-addresses.controller.ts` | Bearer token, any role | None | None | None | `200`, `{ status, data: { addresses, total } }` | `401`, `500`. No pagination. |
| `GET /addresses/default` | Get default address. | `getDefaultAddress` | `src/apis/address/controllers/get-default-address.controller.ts` | Bearer token | None | None | None | `200`, `{ status, data.address }` | `401`, `404` no default. |
| `GET /addresses/:id` | Get one owned address. | `getAddressById` | `src/apis/address/controllers/get-address-by-id.controller.ts` | Bearer token | `id`: ObjectId string, required | None | None | `200`, `{ status, data.address }` | `400` invalid ID, `401`, `404`. |
| `POST /addresses/` | Create address. | `createAddress` | `src/apis/address/controllers/create-address.controller.ts` | Bearer token | None | None | `CreateAddressBody` | `201`, `{ status, data.address }` | `400` validation, duplicate address, max 10 addresses, `401`. |
| `PATCH /addresses/:id` | Update owned address. | `updateAddress` | `src/apis/address/controllers/update-address.controller.ts` | Bearer token | `id`: ObjectId string, required | None | `UpdateAddressBody` | `200`, `{ status, data.address }` | `400`, `401`, `404`, duplicate address. |
| `PATCH /addresses/:id/default` | Set address as default. | `setDefaultAddress` | `src/apis/address/controllers/set-default-address.controller.ts` | Bearer token | `id`: ObjectId string, required | None | `SetDefaultAddressBody` | `200`, `{ status, data.address }` | `400`, `401`, `404`. |
| `DELETE /addresses/:id` | Delete owned address. | `deleteAddress` | `src/apis/address/controllers/delete-address.controller.ts` | Bearer token | `id`: ObjectId string, required | None | None | `200`, `{ status, message }` | `400`, `401`, `404`. |

Example address response:

```json
{
  "status": "success",
  "data": {
    "address": {
      "_id": "665f51b9e5348a2f42b56c70",
      "street": "15 Nile St",
      "city": "Cairo",
      "distanceMark": "Near mall entrance",
      "phone": "01012345678",
      "notes": "Call on arrival",
      "isDefault": true
    }
  }
}
```

## Orders Module

Router file: `src/apis/order/router/order.router.ts`

All order endpoints use `orderRouter.use(authorized)`.

### Order Request Schemas

| Schema | Field | Type | Required | Validation / Rules | Default | Example |
|---|---|---:|---:|---|---|---|
| `CreateOrderBody` | `addressId` | string | Yes | Trimmed, min 1; service validates address ownership | None | `665f51b9e5348a2f42b56c70` |
| `CreateOrderBody` | `paymentMethod` | enum | Yes | `cod`, `online` | None | `online` |

### Order Endpoints

| Endpoint | Description | Handler | File | Auth / Roles | Params | Query | Body | Success Response | Errors / Analysis |
|---|---|---|---|---|---|---|---|---|---|
| `GET /orders/` | List current user's orders. | `getUserOrdersHandler` | `src/apis/order/controllers/get-user-orders.controller.ts` | Bearer token, any role | None | None | None | `200`, `{ status, data: { orders, total } }` | `401`, `500`. No pagination. |
| `GET /orders/:orderId` | Fetch one current-user order. | `getUserOrderHandler` | `src/apis/order/controllers/get-user-order.controller.ts` | Bearer token | `orderId`: ObjectId string, required | None | None | `200`, `{ status, data.order }` | `400`, `401`, `404`. |
| `POST /orders/` | Create order from current cart and selected address. | `createOrderHandler` | `src/apis/order/controllers/create-order.controller.ts` | Bearer token | None | None | `CreateOrderBody` | `201`, `{ status, message, data.order }` | `400` empty cart/unavailable product/invalid quantity, `401`, `404` user/address, `500`. |
| `PATCH /orders/:orderId/accept-partial` | Accept an order after store-side missing items decision. | `acceptPartialOrderHandler` | `src/apis/order/controllers/accept-partial-order.controller.ts` | Bearer token | `orderId`: string, required | None | None | `200`, `{ status, message, data.order }` | `400`, `401`, `404`, `409` invalid order state. |
| `PATCH /orders/:orderId/cancel` | Cancel current-user order if still cancellable. | `cancelOrderHandler` | `src/apis/order/controllers/cancel-order.controller.ts` | Bearer token | `orderId`: string, required | None | None | `200`, `{ status, message, data.order }` | `400`, `401`, `404`, `409` delivered/no longer cancellable. |
| `POST /orders/:orderId/pay` | Create a payment intent for an online order. | `createPaymentIntentHandler` | `src/apis/order/controllers/create-payment-intent.controller.ts` | Bearer token | `orderId`: string, required | None | None | `200`, `{ status, message, data }` | `400`, `401`, `404`, `409` invalid payment/order state. |

Example create order request:

```json
{
  "addressId": "665f51b9e5348a2f42b56c70",
  "paymentMethod": "online"
}
```

Example order response:

```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "665f51b9e5348a2f42b56c80",
      "buyerSnapshot": {
        "name": "Mohammed Hassan",
        "phone": "01012345678",
        "address": {
          "street": "15 Nile St",
          "city": "Cairo",
          "distanceMark": "Near mall entrance"
        }
      },
      "orderStatus": "waiting_store_acceptance",
      "payment": { "method": "online", "status": "pending" },
      "delivery": { "status": "none" },
      "totals": { "itemsTotal": 799, "deliveryFee": 0, "grandTotal": 799 }
    }
  }
}
```

## Delivery Module

Router file: `src/apis/order/router/delivery.router.ts`

All delivery endpoints use `authorized` and `isAuthorized(Role.FULFILLMENT, Role.ADMIN)`.

### Delivery Endpoints

| Endpoint | Description | Handler | File | Auth / Roles | Params | Query | Body | Success Response | Errors / Analysis |
|---|---|---|---|---|---|---|---|---|---|
| `GET /delivery/orders` | List delivery orders visible to current fulfillment user/admin. | `getDeliveryOrdersHandler` | `src/apis/order/controllers/get-delivery-orders.controller.ts` | Bearer token | `fulfillment`, `admin` | None | None | `200`, `{ status, data: { orders, total } }` | `401`, `403`, `500`. |
| `PATCH /delivery/orders/:orderId/assign` | Assign order delivery rider. | `assignDeliveryOrderHandler` | `src/apis/order/controllers/assign-delivery-order.controller.ts` | Bearer token | `fulfillment`, `admin` | `orderId`: string, required | None | `riderId`: string, optional; service may require it by status | `200`, `{ status, message, data.order }` | `400` missing rider in required state, `401`, `403`, `404`, `409`. |
| `PATCH /delivery/orders/:orderId/collect` | Mark delivery collection started. | `collectDeliveryOrderHandler` | `src/apis/order/controllers/collect-delivery-order.controller.ts` | Bearer token | `fulfillment`, `admin` | `orderId`: string, required | None | None | `200`, `{ status, message, data.order }` | `400`, `401`, `403`, `404`, `409` invalid state. |
| `PATCH /delivery/orders/:orderId/start` | Mark order as on the way. | `startDeliveryOrderHandler` | `src/apis/order/controllers/start-delivery-order.controller.ts` | Bearer token | `fulfillment`, `admin` | `orderId`: string, required | None | None | `200`, `{ status, message, data.order }` | `400`, `401`, `403`, `404`, `409`. |
| `PATCH /delivery/orders/:orderId/deliver` | Mark order delivered. | `deliverDeliveryOrderHandler` | `src/apis/order/controllers/deliver-delivery-order.controller.ts` | Bearer token | `fulfillment`, `admin` | `orderId`: string, required | None | None | `200`, `{ status, message, data.order }` | `400`, `401`, `403`, `404`, `409`. |

Example delivery assignment request:

```json
{
  "riderId": "665f51b9e5348a2f42b56c90"
}
```

## Payments Module

Router file: `src/apis/order/router/payment.router.ts`

### Payment Request Schema

| Schema | Field | Type | Required | Validation / Rules | Default | Example |
|---|---|---:|---:|---|---|---|
| `PaymentWebhookBody` | `orderId` | string | Yes | Trimmed, min 1 | None | `665f51b9e5348a2f42b56c80` |
| `PaymentWebhookBody` | `event` | enum | Yes | `payment.succeeded`, `payment.failed`, `payment.refunded` | None | `payment.succeeded` |

### Payment Endpoint

| Endpoint | Description | Handler | File | Authentication | Roles | Params | Query | Body | Success Response | Errors / Analysis |
|---|---|---|---|---|---|---|---|---|---|---|
| `POST /payments/webhook` | Process payment provider event for an order. | `paymentWebhookHandler` | `src/apis/order/controllers/payment-webhook.controller.ts` | No route auth | External/payment system | None | None | `PaymentWebhookBody` | `200`, `{ status, message, data.order }` | `400` invalid event/non-online order, `404` order not found, `409` invalid refund state. No signature verification middleware detected. |

Example payment webhook request:

```json
{
  "orderId": "665f51b9e5348a2f42b56c80",
  "event": "payment.succeeded"
}
```

## Cross-Cutting Analysis

### Detected Validation Libraries

| Library / Mechanism | Location | Usage |
|---|---|---|
| Zod | `src/apis/**/validations/*.ts` | Body schemas and some controller-level param/query parsing. |
| Mongoose validation | `src/apis/**/models/*.ts` | Required fields, enums, min values, unique indexes, embedded documents. |
| Global quick validation | `src/middlewares/quick-validate.middleware.ts` | Email, password, token checks when matching field names exist. |
| XSS sanitizer | `src/middlewares/xss.ts` | Sanitizes strings in body/query/params. |

### Middleware Affecting Endpoints

| Middleware | File | Scope |
|---|---|---|
| `express.json()` | `src/app.ts` | All routes. |
| `cookieParser()` | `src/app.ts` | All routes; required by refresh/logout. |
| `xss` | `src/middlewares/xss.ts` | All routes. |
| `helmet()` | `src/app.ts` | All routes. |
| `quickValidate` | `src/middlewares/quick-validate.middleware.ts` | All routes. |
| `authorized` | `src/middlewares/authentication.ts` | Protected routers/routes. |
| `isAuthorized` | `src/middlewares/authorized.ts` | Role-protected routes. |
| `validate` | `src/middlewares/validate-body.middleware.ts` | Routes with Zod body schemas. |
| `refreshLimiter` | `src/middlewares/auth-rate-limit.ts` | `POST /auth/refresh`. |

### Rate Limiting

| Limiter | Endpoint(s) | Window | Max | Notes |
|---|---|---:|---:|---|
| `refreshLimiter` | `POST /auth/refresh` | 15 minutes | 100 | Enabled. |
| `authSensitiveLimiter` | Intended auth-sensitive endpoints | 15 minutes | 5 | Defined but commented out on register/login/logout. |

### File Uploads

No active file upload middleware or multipart parser is used by the current `src/app.ts` router tree. Product/store image fields are string URLs/paths in JSON, not uploaded files.

### Pagination, Sorting, Filtering

| Resource | Pagination | Sorting | Filtering |
|---|---|---|---|
| Public products `/products` | `page`, `limit`, default `1/24`, max `100` | `price-asc`, `price-desc`, `newest`, `best-selling` | `storeId`, `shopId`, `category`, `search`, price range, dynamic variant attributes. |
| Store products | `page`, `limit`, default `1/24`, max `100` | Newest first | `search`; owner route also supports `isActive`. |
| Stores/categories/cart/wishlist/addresses/orders/delivery | Not paginated in current code | Fixed service sorting where implemented | Limited filters only (`active` intended for admin stores). |

### Caching

No response caching, Redis cache, HTTP cache headers, or cache middleware were detected in the live `src/` backend.

### Security Notes

| Area | Observation |
|---|---|
| JWT access tokens | Required as `Authorization: Bearer <token>` for protected routes. |
| Refresh tokens | Stored in HTTP-only, same-site strict cookies and hashed in `LoginSession`. Rotation and reuse detection are implemented. |
| Payment webhook | No signature verification middleware was found; consider validating provider signatures before mutating order payment state. |
| Route order | `GET /store/my-store` should be moved above `GET /store/:storeId` to avoid shadowing. |
| Param mismatch | `DELETE /store/:storeId/manage/delete` uses a route param named `storeId`, but `hardDeleteStoreHandler` reads `req.params.id`. |
| Validation gap | `reset-password` uses `newPassword` rather than `password`, so global `quickValidate` password rules do not apply to that field name. |
