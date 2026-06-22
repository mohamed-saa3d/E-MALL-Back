# E-Mall Backend

A scalable multi-vendor e-commerce backend built with Node.js, Express.js, TypeScript, MongoDB, and Redis.

Designed to support multiple stores, products, carts, orders, payments, delivery workflows, notifications, and secure authentication through a modular architecture focused on maintainability and scalability.

## Key Features

- Multi-Vendor Marketplace Architecture
- JWT Authentication & Refresh Tokens
- Multi-Session Management
- Email Verification & Password Recovery
- Store & Product Management
- Product Variants & Inventory Handling
- Shopping Cart & Wishlist
- Order Management Workflow
- Payment Integration & Webhooks
- Delivery Lifecycle Management
- Real-Time Notifications
- Role-Based Access Control (RBAC)
- Input Validation & Error Handling
- Rate Limiting & Security Middleware
- OpenAPI / Swagger Documentation

## Architecture

The project follows a modular feature-based architecture:

```text
Feature
├── Controllers
├── Services
├── Models
├── Validations
├── Types
└── Routes
```

Core modules:

- Authentication
- Categories
- Stores
- Store Products
- Catalog
- Cart
- Wishlist
- Addresses
- Orders
- Delivery
- Payments
- Notifications

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Redis

### Security

- JWT Authentication
- Refresh Tokens
- Password Hashing
- Rate Limiting
- XSS Protection

### Documentation

- Swagger / OpenAPI

## API Overview

The system provides 70+ RESTful APIs covering:

- Authentication
- Store Management
- Product Management
- Categories
- Cart & Wishlist
- Orders
- Payments
- Delivery Operations
- Notifications

## Performance & Scalability

- Modular service-oriented architecture
- Redis-based caching support
- Optimized database queries
- Store-level product isolation
- Scalable order processing workflow
- Production-ready API structure

## Getting Started

### Installation

```bash
git clone <repository-url>
cd e-mall-backend
npm install
```

### Environment Variables

Create a `.env` file and configure the required variables.

### Run Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## API Documentation

Swagger documentation is available after running the server:

```bash
http://localhost:3000/api-docs
```

## Project Highlights

- 70+ RESTful APIs
- Multi-Vendor Marketplace
- Secure Authentication System
- Order & Delivery Management
- Payment Integration
- Real-Time Notifications
- Production-Oriented Architecture

## License

MIT
