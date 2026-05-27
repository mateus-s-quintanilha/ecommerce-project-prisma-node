# E-Commerce Backend (Prisma + Node.js)

A production-ready e-commerce backend REST API built with **Node.js**, **Express**, **TypeScript**, **Prisma ORM**, and **MySQL**. It features JWT authentication, role-based access control (Admin/User), cart management, order processing with transactional integrity, full-text product search, and Zod-based request validation.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Setup](#local-setup)
  - [Docker Setup](#docker-setup)
- [Database Schema](#database-schema)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
  - [Models](#models)
  - [Enums](#enums)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Products](#products)
  - [Cart](#cart)
  - [Orders](#orders)
- [Error Codes](#error-codes)
- [Architecture](#architecture)
  - [Middleware](#middleware)
  - [Exception Handling](#exception-handling)
  - [Validation (Zod Schemas)](#validation-zod-schemas)
- [Scripts](#scripts)
- [License](#license)

---

## Tech Stack

| Layer             | Technology                                          |
| ----------------- | --------------------------------------------------- |
| **Runtime**       | Node.js 18+                                         |
| **Language**      | TypeScript 5.5                                      |
| **Framework**     | Express 4.19                                        |
| **ORM**           | Prisma 5.19 (with full-text search preview feature) |
| **Database**      | MySQL 8.0                                           |
| **Authentication**| JSON Web Tokens (jsonwebtoken 9)                    |
| **Hashing**       | bcrypt 5                                            |
| **Validation**    | Zod 3.23                                            |
| **Dev Tools**     | Nodemon, ts-node                                    |
| **Containerization**| Docker & Docker Compose                           |

---

## Project Structure

```
.
├── docker-compose.yml          # Multi-container setup (app + MySQL)
├── Dockerfile                  # Node.js 18 Alpine image
├── nodemon.json                # Nodemon configuration
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   └── migrations/             # Migration history
└── src/
    ├── index.ts                # Express app entry point & Prisma client setup
    ├── secrets.ts              # Environment variable loader
    ├── error-handler.ts        # Async error wrapper (try/catch for controllers)
    ├── controllers/
    │   ├── auth.ts             # Signup, login, me
    │   ├── users.ts            # User CRUD, address management, role changes
    │   ├── products.ts         # Product CRUD, full-text search
    │   ├── cart.ts             # Cart item management
    │   └── orders.ts           # Order lifecycle
    ├── middlewares/
    │   ├── auth.ts             # JWT verification
    │   ├── admin.ts            # Role-based admin guard
    │   └── errors.ts           # Global error response formatter
    ├── routes/
    │   ├── index.ts            # Route aggregator
    │   ├── auth.ts
    │   ├── users.ts
    │   ├── products.ts
    │   ├── cart.ts
    │   └── orders.ts
    ├── schema/
    │   ├── users.ts            # Zod schemas for user-related requests
    │   ├── products.ts         # Zod schemas for product requests
    │   ├── cart.ts             # Zod schemas for cart requests
    │   └── orders.ts           # Zod schemas for order status changes
    └── exceptions/
        ├── root.ts             # Base HttpException + ErrorCode enum
        ├── bad-requests.ts     # 400 Bad Request
        ├── internal-exception.ts# 500 Internal Server Error
        ├── not-found.ts        # 404 Not Found
        ├── unauthorized.ts     # 401 Unauthorized
        └── validation.ts       # 422 Unprocessable Entity
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **MySQL** 8.0 (local or Docker)
- **npm**

### Environment Variables

Create a `.env` file in the project root:

```env
# Server
SERVER_PORT=3000

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Database (MySQL)
DATABASE_URL="mysql://root:your_password@localhost:3306/ecommerce_db"
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
MYSQL_PASSWORD=your_password
```

### Local Setup

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Set up the database:**

   ```bash
   npx prisma migrate dev --name init
   ```

3. **Start the development server:**

   ```bash
   npm run start
   # or with migrations:
   npm run start:migrate
   ```

   The server will start on `http://localhost:3000`.

### Docker Setup

1. **Ensure `.env` is configured** with the variables above.

2. **Build and run with Docker Compose:**

   ```bash
   docker-compose up --build
   ```

   This spins up:
   - A MySQL 8.0 container on port `3306`
   - The Node.js app on port `3000` (mapped from your `SERVER_PORT` env var)

   The app will automatically run migrations on startup via `npm run start:migrate`.

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │1────*│   Address    │       │ Product  │
│          │       │              │       │          │
│ id       │       │ id           │       │ id       │
│ name     │       │ lineOne      │       │ name     │
│ email    │       │ lineTwo      │       │ description│
│ password │       │ city         │       │ price    │
│ role     │       │ country      │       │ tags     │
│ defaultS │       │ pincode      │       │          │
│ hippingA │       │ userId (FK)  │       │          │
│ ddress   │       │              │       │          │
│ defaultB │       │ createdAt    │       │ createdAt│
│ illingAd │       │ updatedAt    │       │ updatedAt│
│ dress    │       └──────────────┘       └──────────┘
│          │                                     │
│ createdAt│        ┌──────────────┐             │
│ updatedAt│1────*│  CartItem    │*────────────1│
└──────────┘       │              │             │
      │            │ id           │             │
      │            │ userId (FK)  │             │
      │            │ productId(FK)│             │
      │            │ quantity     │             │
      │            │ createdAt    │             │
      │            │ updatedAt    │             │
      │            └──────────────┘             │
      │                                         │
      │            ┌──────────────┐             │
      │1────*│    Order       │*────────────*│
      │            │              │
      │            │ id           │
      │            │ userId (FK)  │
      │            │ netAmmount   │          ┌──────────────┐
      │            │ address      │          │ OrderProduct │
      │            │ status       │          │              │
      │            │ createdAt    │1────*│ id           │
      │            │ updatedAt    │          │ orderId (FK) │
      │            └──────────────┘          │ productId(FK)│
      │                  │                   │ quantity     │
      │                  │1                 │ createdAt    │
      │                  │                   │ updatedAt    │
      │                  │                   └──────────────┘
      │            ┌──────────────┐
      │            │ OrderEvent   │
      │            │              │
      │            │ id           │
      │            │ orderId (FK) │
      │            │ status       │
      │            │ createdAt    │
      │            │ updatedAt    │
      │            └──────────────┘
```

### Models

#### User (`users`)

| Column                    | Type     | Notes                              |
| ------------------------- | -------- | ---------------------------------- |
| `id`                      | Int (PK) | Auto-increment                     |
| `name`                    | String   |                                    |
| `email`                   | String   | Unique                             |
| `password`                | String   | bcrypt-hashed                      |
| `role`                    | Enum     | `ADMIN` or `USER` (default: USER)  |
| `defaultShippingAddress`  | Int?     | FK to Address                      |
| `defaultBillingAddress`   | Int?     | FK to Address                      |
| `createdAt`               | DateTime | Auto                               |
| `updatedAt`               | DateTime | Auto                               |

**Relations:** `addressses` (Address[]), `cartItems` (CartItem[]), `orders` (Order[])

#### Address (`addresses`)

| Column     | Type     | Notes                          |
| ---------- | -------- | ------------------------------ |
| `id`       | Int (PK) | Auto-increment                 |
| `lineOne`  | String   |                                |
| `lineTwo`  | String?  | Nullable                       |
| `city`     | String   |                                |
| `country`  | String   |                                |
| `pincode`  | String   |                                |
| `userId`   | Int (FK) | References `users.id`          |
| `createdAt`| DateTime | Auto                           |
| `updatedAt`| DateTime | Auto                           |

**Computed field:** `formattedAddress` — generates a string like `"lineOne, lineTwo, city, country -pincode"` via Prisma client extension.

#### Product (`products`)

| Column       | Type     | Notes                                    |
| ------------ | -------- | ---------------------------------------- |
| `id`         | Int (PK) | Auto-increment                           |
| `name`       | String   |                                          |
| `description`| Text     | MySQL `TEXT` for unlimited length        |
| `price`      | Decimal  |                                          |
| `tags`       | String   | Comma-separated string                   |
| `createdAt`  | DateTime | Auto                                     |
| `updatedAt`  | DateTime | Auto                                     |

**Full-text index:** `name`, `description`, and `tags` columns are indexed for full-text search.

#### CartItem (`cart_items`)

| Column      | Type     | Notes                          |
| ----------- | -------- | ------------------------------ |
| `id`        | Int (PK) | Auto-increment                 |
| `userId`    | Int (FK) | References `users.id`          |
| `productId` | Int (FK) | References `products.id`       |
| `quantity`  | Int      |                                |
| `createdAt` | DateTime | Auto                           |
| `updatedAt` | DateTime | Auto                           |

#### Order (`orders`)

| Column      | Type     | Notes                                         |
| ----------- | -------- | --------------------------------------------- |
| `id`        | Int (PK) | Auto-increment                                |
| `userId`    | Int (FK) | References `users.id`                         |
| `netAmmount`| Decimal  | Total calculated from cart items at checkout  |
| `address`   | String   | Snapshot of `formattedAddress` at order time  |
| `status`    | Enum     | `OrderEventStatus` (default: PENDING)         |
| `createdAt` | DateTime | Auto                                          |
| `updatedAt` | DateTime | Auto                                          |

**Relations:** `products` (OrderProduct[]), `events` (OrderEvent[])

#### OrderProduct (`order_products`)

| Column      | Type     | Notes                          |
| ----------- | -------- | ------------------------------ |
| `id`        | Int (PK) | Auto-increment                 |
| `orderId`   | Int (FK) | References `orders.id`         |
| `productId` | Int (FK) | References `products.id`       |
| `quantity`  | Int      |                                |
| `createdAt` | DateTime | Auto                           |
| `updatedAt` | DateTime | Auto                           |

#### OrderEvent (`order_events`)

Tracks the history of status changes on an order.

| Column      | Type     | Notes                              |
| ----------- | -------- | ---------------------------------- |
| `id`        | Int (PK) | Auto-increment                     |
| `orderId`   | Int (FK) | References `orders.id`             |
| `status`    | Enum     | `OrderEventStatus` (default: PENDING) |
| `createdAt` | DateTime | Auto                               |
| `updatedAt` | DateTime | Auto                               |

### Enums

**`Role`**

| Value   | Description        |
| ------- | ------------------ |
| `ADMIN` | Full access        |
| `USER`  | Standard customer  |

**`OrderEventStatus`**

| Value            | Description                      |
| ---------------- | -------------------------------- |
| `PENDING`        | Order placed, awaiting processing|
| `ACCEPTED`       | Order accepted by admin          |
| `OUT_FOR_DELIVERY`| Order is being delivered        |
| `DELIVERED`      | Order delivered to customer      |
| `CANCELED`       | Order canceled by user or admin  |

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint          | Auth | Description                                    |
| ------ | ----------------- | ---- | ---------------------------------------------- |
| POST   | `/api/auth/signup`| No   | Register a new user                            |
| POST   | `/api/auth/login` | No   | Login and receive JWT token                    |
| GET    | `/api/auth/me`    | Yes  | Get the currently authenticated user's profile |

#### POST `/api/auth/signup`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "user successfully created",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "password": "$2b$10$...",
    "createdAt": "2024-08-30T...",
    "updatedAt": "2024-08-30T..."
  }
}
```

#### POST `/api/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER" },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "token_payload": { "userId": 1, "iat": 1725043200 }
}
```

#### GET `/api/auth/me`

**Headers:** `Authorization: <JWT_TOKEN>`

**Response (200):**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "defaultShippingAddress": null,
  "defaultBillingAddress": null,
  "createdAt": "2024-08-30T...",
  "updatedAt": "2024-08-30T..."
}
```

---

### Users

All endpoints require authentication. Admin-only endpoints require both `authMiddleware` and `adminMiddleware`.

| Method  | Endpoint            | Auth        | Description                      |
| ------- | ------------------- | ----------- | -------------------------------- |
| PUT     | `/api/users/`       | User        | Update user profile & defaults   |
| GET     | `/api/users/address`| User        | List user's addresses            |
| POST    | `/api/users/address`| User        | Add a new address                |
| DELETE  | `/api/users/address/:id` | User  | Delete an address                |
| GET     | `/api/users/`       | Admin       | List all users (paginated)       |
| GET     | `/api/users/:id`    | Admin       | Get user by ID (includes addresses) |
| POST    | `/api/users/:id/role`| Admin      | Change user's role               |

#### PUT `/api/users/`

**Request Body:**

```json
{
  "name": "John Updated",
  "defaultShippingAddress": 1,
  "defaultBillingAddress": 2
}
```

All fields are optional.

#### POST `/api/users/address`

**Request Body:**

```json
{
  "lineOne": "123 Main St",
  "lineTwo": "Apt 4B",
  "city": "New York",
  "country": "USA",
  "pincode": "10001"
}
```

`lineTwo` is optional. `pincode` must be exactly 6 characters.

#### GET `/api/users/` (Admin)

**Query Parameters:**

| Param  | Type   | Default | Description              |
| ------ | ------ | ------- | ------------------------ |
| `skip` | number | 0       | Pagination offset        |

Always returns 5 results per page.

#### POST `/api/users/:id/role` (Admin)

**Request Body:**

```json
{
  "role": "ADMIN"
}
```

Valid values: `"ADMIN"` or `"USER"`.

---

### Products

| Method  | Endpoint              | Auth        | Description                        |
| ------- | --------------------- | ----------- | ---------------------------------- |
| POST    | `/api/products/`      | Admin       | Create a new product               |
| GET     | `/api/products/`      | User        | List products (paginated)          |
| GET     | `/api/products/search`| User        | Full-text search products          |
| GET     | `/api/products/:id`   | User        | Get product by ID                  |
| PUT     | `/api/products/:id`   | Admin       | Update a product                   |
| DELETE  | `/api/products/:id`   | Admin       | Delete a product                   |

#### POST `/api/products/`

**Request Body:**

```json
{
  "name": "Wireless Headphones",
  "description": "High-quality Bluetooth headphones with noise cancellation and 30-hour battery life.",
  "price": 99.99,
  "tags": ["electronics", "audio", "bluetooth"]
}
```

- `description`: 15-200 characters
- `tags`: 1-20 items

#### GET `/api/products/`

**Query Parameters:**

| Param  | Type   | Default | Description              |
| ------ | ------ | ------- | ------------------------ |
| `skip` | number | 0       | Pagination offset        |

**Response (200):**

```json
{
  "count": 42,
  "data": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "description": "High-quality Bluetooth headphones...",
      "price": "99.99",
      "tags": "electronics,audio,bluetooth",
      "createdAt": "2024-09-04T...",
      "updatedAt": "2024-09-04T..."
    }
  ]
}
```

#### GET `/api/products/search`

**Query Parameters:**

| Param  | Type   | Description                           |
| ------ | ------ | ------------------------------------- |
| `q`    | string | Search query (searches name, description, tags) |
| `skip` | number | Pagination offset (default: 0)        |

Uses MySQL full-text search across `name`, `description`, and `tags`.

Example: `GET /api/products/search?q=bluetooth&skip=0`

#### PUT `/api/products/:id`

**Request Body** (all fields optional):

```json
{
  "name": "Updated Product Name",
  "price": 79.99,
  "tags": ["updated", "tags"]
}
```

If `tags` are provided, they will be joined into a comma-separated string.

---

### Cart

| Method  | Endpoint          | Auth | Description                                |
| ------- | ----------------- | ---- | ------------------------------------------ |
| POST    | `/api/cart/`      | User | Add item to cart (or increase quantity)     |
| GET     | `/api/cart/`      | User | Get all cart items for the user             |
| PUT     | `/api/cart/:id`   | User | Change quantity of a cart item              |
| DELETE  | `/api/cart/:id`   | User | Remove an item from the cart                |

#### POST `/api/cart/`

**Request Body:**

```json
{
  "productId": 1,
  "quantity": 2
}
```

If the product already exists in the cart, the quantity is **incremented** instead of creating a duplicate entry.

#### PUT `/api/cart/:id`

**Request Body:**

```json
{
  "quantity": 5
}
```

Sets the quantity to the provided value. Ownership is verified — only the cart item owner can modify it.

#### DELETE `/api/cart/:id`

Removes the item from the cart. Ownership is verified before deletion.

---

### Orders

| Method  | Endpoint                  | Auth        | Description                              |
| ------- | ------------------------- | ----------- | ---------------------------------------- |
| POST    | `/api/orders/`            | User        | Create an order from cart items          |
| GET     | `/api/orders/`            | User        | List user's orders                       |
| GET     | `/api/orders/:id`         | User        | Get order by ID (includes products & events) |
| PUT     | `/api/orders/:id/cancel`  | User        | Cancel an order                          |
| GET     | `/api/orders/all`         | Admin       | List all orders (with optional status filter) |
| POST    | `/api/orders/:id/status`  | Admin       | Change order status                      |

#### POST `/api/orders/`

Creates a new order from all items in the user's cart. Runs inside a **database transaction** to ensure:

1. Cart items are read with their product details
2. Total price is calculated
3. The user's default shipping address is retrieved (uses the `formattedAddress` computed field)
4. An `Order` is created with associated `OrderProduct` entries
5. An initial `OrderEvent` (PENDING) is created
6. All cart items for the user are deleted

**Error responses:**
- `{ "message": "Cart is empty" }` — no items in the cart
- `{ "message": "you have no default address" }` — no default shipping address set

#### PUT `/api/orders/:id/cancel`

Cancels an order. Only the order owner can cancel. Runs in a transaction to update the order status and create a CANCELED event.

#### GET `/api/orders/all` (Admin)

**Query Parameters:**

| Param    | Type   | Description                                                       |
| -------- | ------ | ----------------------------------------------------------------- |
| `status` | string | Filter by order status (e.g., `PENDING`, `DELIVERED`, `CANCELED`) |
| `skip`   | number | Pagination offset (default: 0)                                    |

#### POST `/api/orders/:id/status` (Admin)

**Request Body:**

```json
{
  "status": "OUT_FOR_DELIVERY"
}
```

Valid statuses: `PENDING`, `ACCEPTED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELED`.

Runs in a transaction to update the order status and create the corresponding `OrderEvent`.

---

## Error Codes

All errors follow a consistent response format:

```json
{
  "message": "Human-readable error message",
  "errorCode": 1001,
  "errors": null
}
```

| Code   | Name                        | HTTP Status |
| ------ | --------------------------- | ----------- |
| 1001   | `USER_NOT_FOUND`            | 404         |
| 1002   | `USER_ALREADY_EXISTS`       | 400         |
| 1003   | `INCORRECT_PASSWORD`        | 400         |
| 1004   | `ADDRESS_NOT_FOUND`         | 404         |
| 1005   | `ADDRESS_DOES_NOT_BELONG`   | 400         |
| 2001   | `UNPROCESSABLE_ENTITY`      | 422         |
| 3001   | `INTERNAL_EXCEPTION`        | 500         |
| 4001   | `UNAUTHORIZED`              | 401         |
| 5001   | `PRODUCT_NOT_FOUND`         | 404         |
| 6001   | `CART_ITEM_NOT_FOUND`       | 404         |
| 6002   | `CART_ITEM_DOES_NOT_BELONG` | 401         |
| 7001   | `ORDER_NOT_FOUND`           | 404         |

---

## Architecture

### Middleware

The API uses a middleware pipeline on every route:

1. **`authMiddleware`** — Verifies the JWT token from the `Authorization` header. If valid, attaches the user to `req.user`. If invalid or missing, returns 401.
2. **`adminMiddleware`** — Checks if `req.user.role === 'ADMIN'`. Returns 401 if not.

Routes define which middlewares apply:

```typescript
// User-only
productsRoutes.get('/', [authMiddleware], errorHandler(listProducts));

// Admin-only
productsRoutes.post('/', [authMiddleware, adminMiddleware], errorHandler(createProducts));
```

### Exception Handling

All controllers are wrapped with the `errorHandler` utility:

```typescript
export const errorHandler = (method: Function) => {
  return async (req, res, next) => {
    try {
      await method(req, res, next);
    } catch (error) {
      if (error instanceof HttpException)      → exception = error;
      else if (error instanceof ZodError)      → BadRequestsException (422);
      else                                      → InternalException (500);
      next(exception);
    }
  };
};
```

This means:
- **Zod validation errors** → automatically caught and returned as 422
- **Known exceptions** (NotFound, BadRequest, Unauthorized) → proper HTTP status
- **Unexpected errors** → 500 Internal Server Error

The global `errorMiddleware` formats the response:

```typescript
res.status(error.statusCode).json({
  message: error.message,
  errorCode: error.errorCode,
  errors: error.errors
});
```

### Validation (Zod Schemas)

All request bodies are validated at the controller level using Zod schemas:

| Schema                      | Used In                           | Validates                                      |
| --------------------------- | --------------------------------- | ---------------------------------------------- |
| `SignUpSchema`              | `POST /auth/signup`               | name (string), email (valid email), password (min 8 chars) |
| `AddressSchema`             | `POST /users/address`             | lineOne, lineTwo (nullable), pincode (6 chars), country, city |
| `UpdateUserSchema`          | `PUT /users/`                     | name, defaultShippingAddress, defaultBillingAddress (all optional) |
| `ChangeUserRoleSchema`      | `POST /users/:id/role`            | role (ADMIN or USER)                           |
| `createProductSchema`       | `POST /products/`                 | name (string), description (15-200 chars), price (number), tags (1-20 items) |
| `CreateCartSchema`          | `POST /cart/`                     | productId (number), quantity (number)          |
| `ChangeQuantitySchema`      | `PUT /cart/:id`                   | quantity (number)                              |
| `ChangeOrderStatusSchema`   | `POST /orders/:id/status`         | status (OrderEventStatus enum)                 |

---

## Scripts

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `npm start`          | Start the dev server with Nodemon (hot reload)        |
| `npm run start:migrate` | Run Prisma migrations then start the server        |
| `npm test`           | (Placeholder — no tests configured yet)               |

---

## License

ISC — **Mateus Quintanilha**
