# E-Mall Project Memory

This file is a working memory for the current backend state of the `e-mall` project so a future AI agent or teammate can quickly understand the project, what has already been changed, and where the sensitive parts are.

## 1. Project Basics

- Project type: Express + TypeScript + Mongoose backend
- Entry point: [src/app.ts](/c:/projects/e-mall/src/app.ts:1)
- Main stack:
  - Express 5
  - Mongoose 9
  - Zod for body validation
  - JWT bearer auth
  - Cookie-based refresh token flow
- API docs:
  - Generated summary exists in [generated-docs/api-docs.md](/c:/projects/e-mall/generated-docs/api-docs.md:1)
  - Swagger hook exists in [swagger/swagger-docs.ts](/c:/projects/e-mall/swagger/swagger-docs.ts:1)

## 2. Current Mounted Routers

Mounted in [src/app.ts](/c:/projects/e-mall/src/app.ts:21):

- `/auth`
- `/categories`
- `/store`
- `/cart`
- `/wishlist`
- `/products`
- `/addresses`
- `/orders`
- `/delivery`
- `/payments`

## 3. Roles

Defined in [src/apis/auth/models/user.model.ts](/c:/projects/e-mall/src/apis/auth/models/user.model.ts:3):

- `admin`
- `user`
- `owner`
- `accounting`
- `fulfillment`

Notes:

- `owner` manages store-specific resources
- `fulfillment` is used for delivery operations
- `accounting` exists but is not meaningfully wired into order/payment flows yet

## 4. Existing Domain Modules

Important active modules under `src/apis/`:

- `auth`
- `category`
- `store`
- `products-and-variants`
- `cart`
- `wish-list`
- `address`
- `order`

The active codebase is the `src/` tree. There are many deleted/legacy files in git status from older structures; avoid assuming the old `back/` structure is current.

## 5. Core Data Model Relationships

- `User`
  - owns `Store`
  - owns `Cart`
  - owns `WishList`
  - owns `Address`
  - owns `Order`
- `Store`
  - belongs to `User` owner
  - belongs to `Category`
  - has many `Product`
- `Product`
  - belongs to `Store`
  - belongs to `Category`
  - embeds `variants[]`
- `Cart`
  - stores `productId`, `variantId`, `storeId`, `quantity`
- `Address`
  - stores structured delivery info and `phone`
- `Order`
  - belongs to `User`
  - stores snapshots and grouped store sections

## 6. Current Order Model

Order model file:

- [src/apis/order/models/order.model.ts](/c:/projects/e-mall/src/apis/order/models/order.model.ts:1)

Order shape is intentionally multi-store and snapshot-oriented.

Main fields:

- `userId`
- `buyerSnapshot`
  - `name`
  - `phone`
  - `address.street`
  - `address.city`
  - `address.distanceMark`
- `stores[]`
  - `storeId`
  - `storeNameSnapshot`
  - `status`
  - `rejectionReason?`
  - `items[]`
    - `productId`
    - `variantId`
    - `productNameSnapshot`
    - `variantSnapshot`
    - `quantity`
    - `unitPrice`
    - `totalPrice`
  - `subtotal`
- `missingItems[]`
  - `storeId`
  - `orderItemId`
  - `reason`
- `orderStatus`
- `payment`
  - `method`
  - `status`
- `delivery`
  - `riderId?`
  - `status`
- `totals`
  - `itemsTotal`
  - `deliveryFee`
  - `grandTotal`

Important design rule:

- snapshots are the source of truth for display and historic order integrity
- do not rely on live product/store/user refs for order display data

## 7. Order Status Model

### Store section statuses

- `pending`
- `preparing`
- `ready`
- `rejected`

### Global order statuses

- `pending`
- `waiting_store_acceptance`
- `waiting_customer_decision`
- `waiting_payment`
- `ready_for_delivery`
- `out_for_delivery`
- `delivered`
- `cancelled`

### Payment statuses

- `pending`
- `paid`
- `failed`
- `refunded`

### Delivery statuses

- `none`
- `assigned`
- `collecting`
- `on_the_way`
- `delivered`

## 8. Current Order Workflow

### Customer create order

Route:

- `POST /orders`

Validation:

- only `addressId`
- only `paymentMethod`

Service:

- [create-order.service.ts](/c:/projects/e-mall/src/apis/order/services/create-order.service.ts:1)

Behavior:

- reads current user from auth token
- fetches address from DB
- fetches cart from DB
- fetches products/stores from DB
- computes prices from DB
- builds snapshots internally
- does not trust client totals or prices
- empties cart after successful order creation

### Store update order section

Current route:

- `PATCH /store/:storeId/manage/orders/:orderId`

Validation file:

- [store-order.validation.ts](/c:/projects/e-mall/src/apis/store/validations/store-order.validation.ts:1)

Current behavior:

- `status` is optional
- if store sends `rejectionReason` and/or `missingItems` without `status`, backend infers `rejected`
- if store sends a non-rejected `status`, it must not send rejection metadata in the same request
- controller now returns only a success message, not the updated order payload

### Important store-side business rule

If a store has only one item in the order and marks it missing:

1. that store section becomes `rejected`
2. global `orderStatus` becomes `waiting_customer_decision`
3. the order does **not** become ready for delivery yet, even if another store is already `ready`
4. after the customer accepts the partial order:
   - missing items are removed
   - any store section with zero remaining items is removed from the order
   - recomputation runs again
   - if remaining stores are all `ready`, the order can move to:
     - `waiting_payment` for online unpaid orders
     - `ready_for_delivery` otherwise

This means the rejected store effectively drops out of the order only **after** the customer accepts the partial order.

### Customer decision flow

Routes:

- `PATCH /orders/:orderId/accept-partial`
- `PATCH /orders/:orderId/cancel`

Behavior:

- partial acceptance removes missing items
- empty rejected store sections are filtered out
- cancel sets order to `cancelled`
- online paid cancel currently sets payment status to `refunded`

### Payment flow

Routes:

- `POST /orders/:orderId/pay`
- `POST /payments/webhook`

Current state:

- payment is stubbed
- `createPaymentIntent` returns a mock payload
- webhook accepts:
  - `payment.succeeded`
  - `payment.failed`
  - `payment.refunded`

Missing hardening:

- no real gateway
- no webhook signature verification yet

### Delivery flow

Routes:

- `GET /delivery/orders`
- `PATCH /delivery/orders/:orderId/assign`
- `PATCH /delivery/orders/:orderId/collect`
- `PATCH /delivery/orders/:orderId/start`
- `PATCH /delivery/orders/:orderId/deliver`

Behavior:

- fulfillment/admin can access these routes
- assign moves `delivery.status` to `assigned`
- collect -> `collecting`
- start -> `on_the_way`
- deliver -> `delivered`

## 9. Order Status Recompute Rule

File:

- [recompute-order-status.service.ts](/c:/projects/e-mall/src/apis/order/services/recompute-order-status.service.ts:1)

`orderStatus` should never be manually updated from random places.

Current derived logic:

- if order already cancelled -> `cancelled`
- if delivery delivered -> `delivered`
- if delivery on the way -> `out_for_delivery`
- if any store rejected -> `waiting_customer_decision`
- if all stores ready:
  - online and not paid -> `waiting_payment`
  - else -> `ready_for_delivery`
- if any store touched but not all ready -> `waiting_store_acceptance`
- otherwise -> `pending`

Rule to preserve:

- do not let store/payment/delivery controllers directly set `orderStatus` by hand
- go through recompute/apply-derived logic

## 10. Store Order Visibility Rule

Store should see only its own order section.

Files:

- [get-my-orders.service.ts](/c:/projects/e-mall/src/apis/store/services/get-my-orders.service.ts:1)
- [get-my-order.service.ts](/c:/projects/e-mall/src/apis/store/services/get-my-order.service.ts:1)
- [order-shared.service.ts](/c:/projects/e-mall/src/apis/order/services/order-shared.service.ts:1)

Current implementation:

- orders are filtered by `stores.storeId`
- then `toStoreScopedOrder(...)` narrows the returned payload to only the matched store slice

## 11. Buyer Snapshot vs Populated User

Important distinction:

- `buyerSnapshot`
  - immutable order-time data
  - use this for fulfillment and delivery information
- populated `user`
  - live account reference
  - currently still included in some order responses when `includeUser: true` is passed

If privacy/business rules require less exposure to stores, future cleanup may remove `user` from store order responses and rely only on `buyerSnapshot`.

## 12. Cart and Pricing Notes

Cart pricing utilities:

- [attach-cart-pricing.util.ts](/c:/projects/e-mall/src/apis/cart/services/attach-cart-pricing.util.ts:1)
- [resolve-variant-price.util.ts](/c:/projects/e-mall/src/apis/products-and-variants/services/resolve-variant-price.util.ts:1)

Key rule:

- order creation should compute unit prices from product variant data in DB
- never trust client totals

## 13. Validation Pattern

Pattern used across the project:

- body validation middleware:
  - [validate-body.middleware.ts](/c:/projects/e-mall/src/middlewares/validate-body.middleware.ts:1)
- param validation middleware:
  - [validate-params.middleware.ts](/c:/projects/e-mall/src/middlewares/validate-params.middleware.ts:1)
- global light validation:
  - [quick-validate.middleware.ts](/c:/projects/e-mall/src/middlewares/quick-validate.middleware.ts:1)

Typical style:

- route uses `validate(schema)`
- controller reads typed body from `req.body`
- service enforces ownership/business rules

## 14. Auth Pattern

Auth middleware:

- [authentication.ts](/c:/projects/e-mall/src/middlewares/authentication.ts:1)

Role middleware:

- [authorized.ts](/c:/projects/e-mall/src/middlewares/authorized.ts:1)

Request user type:

- [src/interfaces/user-token.interface.ts](/c:/projects/e-mall/src/interfaces/user-token.interface.ts:1)
- [src/types/user.d.ts](/c:/projects/e-mall/src/types/user.d.ts:1)

## 15. Notification Module Architecture

New module files:

- `src/apis/notifications/constants/notification.constants.ts`
- `src/apis/notifications/types/notification.types.ts`
- `src/apis/notifications/model/notification.model.ts`
- `src/apis/notifications/services/notification.service.ts`
- `src/apis/notifications/validations/notification.validation.ts`
- `src/apis/notifications/controllers/*.ts`
- `src/apis/notifications/router/notification.router.ts`
- `src/socket/socket.server.ts`
- `src/utils/jwt-verification.ts`

Design:

- notifications are centralized in `notification.service.ts`
- services and controllers do not emit socket events directly
- socket auth reuses the same JWT verification logic as REST auth
- notifications are persisted before real-time delivery
- notification ownership is enforced by recipient filter in every query

Schema:

- `recipientId`
- `title`
- `message`
- `type`
- `entityType`
- `entityId`
- `isRead`
- `readAt`
- timestamps

Indexes:

- `{ recipientId: 1, createdAt: -1 }`
- `{ recipientId: 1, isRead: 1 }`

Routes mounted in `src/app.ts`:

- `GET /notifications`
- `GET /notifications/unread`
- `GET /notifications/unread-count`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `DELETE /notifications/:id`

Socket.IO:

- authenticated socket connections join a room named by `userId`
- notifications are emitted with `io.to(userId).emit("notification", notification)`
- socket auth uses JWT from handshake auth or authorization header
- no socket IDs are persisted to the database

Future support:

- Web Push will be added as an external delivery channel after central persistence
- Email will also be added from the centralized notification service for selected events

Protected routes usually:

- read `req.user.id`
- read `req.user.role`
- throw `Unauthorized` if missing

## 15. Known Project Rough Edges

These are important if someone continues work later:

- payment webhook lacks signature verification
- payment flow is stubbed, not gateway-backed
- store order responses still may include populated live `user`
- no automated tests are wired in `package.json`
- several old/deleted files exist in git status from previous project layouts
- some routers/controllers in the project still have minor consistency issues outside the order flow

## 16. Suggested Next Safe Steps

If continuing work, these are the most reasonable next actions:

1. tighten store order exposure:
   - probably remove live `user` from store responses
2. add param validators for order/delivery/payment IDs
3. add tests for:
   - create order
   - single-store rejection
   - partial acceptance
   - delivery transitions
4. integrate a real payment provider
5. add webhook signature verification
6. decide whether store should see buyer phone only or full live user reference

## 17. Practical Summary

If you remember only a few things, remember these:

- the active backend lives in `src/`
- order model is already multi-store and snapshot-driven
- store order updates should not manually set global `orderStatus`
- rejection by one store pauses the whole order for customer decision
- after partial acceptance, empty rejected store sections are removed
- prices/totals/snapshots must always come from DB-side logic, never from client input
