# 🛍️ EShop REST API

A fully functional e-commerce backend built with **Node.js**, **Express**, and **MongoDB**. It handles everything a real online store needs — authentication, product management, category organization, order processing, and image uploads — all secured behind JWT-based authentication and role-based authorization.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Known Issues & Improvements](#known-issues--improvements)

---

## Overview

This API serves as the backend for an e-commerce application. It exposes a set of REST endpoints that a frontend (web or mobile) can consume to build a complete shopping experience. The API supports two types of users: **regular users** who can browse products and place orders, and **admins** who can manage the entire catalog.

---

## Tech Stack

| Technology            | Purpose                         |
| --------------------- | ------------------------------- |
| Node.js               | Runtime environment             |
| Express.js            | Web framework and routing       |
| MongoDB               | Database                        |
| Mongoose              | MongoDB object modeling         |
| JSON Web Tokens (JWT) | Authentication                  |
| bcrypt                | Password hashing                |
| Multer                | Image upload handling           |
| express-rate-limit    | Brute force protection          |
| dotenv                | Environment variable management |

---

## Project Structure

```
├── controllers/
│   ├── authController.js       # Register, login, token refresh, logout
│   ├── userController.js       # User CRUD operations
│   ├── productController.js    # Product CRUD, image uploads, featured products
│   ├── categoryController.js   # Category CRUD
│   └── orderController.js      # Order management, sales analytics
│
├── routes/
│   ├── authRoutes.js           # /api/auth
│   ├── userRoutes.js           # /api/users
│   ├── productRoutes.js        # /api/products
│   ├── categoryRoutes.js       # /api/categories
│   └── orderRoutes.js          # /api/orders
│
├── database/
│   ├── user.js                 # User schema
│   ├── product.js              # Product schema
│   ├── category.js             # Category schema
│   ├── order.js                # Order schema
│   ├── orderItem.js            # OrderItem schema
│   └── refreshTokens.js        # Refresh token schema
│
├── middlewares/
│   ├── authenticateToken.js    # JWT verification middleware
│   ├── authorize.js            # Admin-only access middleware
│   ├── imageHelper.js          # Multer image upload configuration
│   └── rateLimiter.js          # Login rate limiting
│
└── public/
    └── uploads/                # Stored product images
```

---

## How It Works

### Authentication Flow

The API uses a **dual-token system** to keep users securely logged in without compromising security.

When a user logs in, the server issues two tokens:

- **Access Token** — short-lived (15 minutes). This is what the user sends with every request to prove their identity. Because it expires quickly, a stolen access token becomes useless fast.
- **Refresh Token** — long-lived (7 days). This is stored securely on the server (hashed with bcrypt) and is only used to generate a new access token when the old one expires. This way the user stays logged in for days without needing to re-enter their password.

```
User logs in
    → Server issues Access Token (15min) + Refresh Token (7 days)
    → Client stores both tokens

Client makes API request
    → Sends Access Token in Authorization header
    → Server verifies token → grants access

Access Token expires
    → Client sends Refresh Token to /api/auth/refresh
    → Server validates it, issues new Access Token + new Refresh Token
    → Old Refresh Token is deleted (rotation for security)

User logs out
    → Server deletes the Refresh Token from the database
    → Both tokens are now invalid
```

### Authorization System

Beyond just being logged in, some actions require **admin privileges**. The system uses two middleware layers that work in sequence:

1. `authenticateToken` — checks that the user has a valid JWT. If not, the request is rejected immediately.
2. `authorize` — looks up the user in the database and checks if `isAdmin` is `true`. If not, the request is rejected.

Any route with both middlewares applied is admin-only. Routes with only `authenticateToken` are accessible to any logged-in user.

### Order Processing

When a user places an order, the server does not just save a document — it runs a multi-step calculation:

1. Each item in the order is saved individually as an `OrderItem` document, storing the product reference and quantity.
2. The server then fetches the price of each product and multiplies it by the quantity to get each item's subtotal.
3. All subtotals are summed to produce the final `totalPrice`, which is stored on the Order. This means the price is always calculated server-side — the client never sends the total, preventing price tampering.

### Image Uploads

Product images are handled by **Multer**. When an admin adds a product, the image file is uploaded to the `public/uploads/` directory on the server. Multer validates that only `png`, `jpg`, and `jpeg` files are accepted and renames each file with a timestamp to prevent name collisions. The stored image URL is then constructed as a full path and saved on the product document.

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint    | Description               | Auth Required |
| ------ | ----------- | ------------------------- | ------------- |
| POST   | `/register` | Create a new user account | No            |
| POST   | `/login`    | Log in and receive tokens | No            |
| POST   | `/refresh`  | Get a new access token    | No            |
| POST   | `/logout`   | Invalidate refresh token  | No            |

**Login request body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Login response:**

```json
{
  "message": "logged in successfully",
  "accesstoken": "eyJ...",
  "refreshtoken": "eyJ..."
}
```

All protected requests must include the access token in the header:

```
Authorization: Bearer <accesstoken>
```

---

### Users — `/api/users`

| Method | Endpoint          | Description       | Auth Required | Admin Only |
| ------ | ----------------- | ----------------- | ------------- | ---------- |
| GET    | `/getusers`       | Get all users     | ✅            | ✅         |
| GET    | `/getuser/:id`    | Get a single user | ✅            | No         |
| PUT    | `/updateuser/:id` | Update user data  | ✅            | No         |
| DELETE | `/deleteuser/:id` | Delete a user     | ✅            | No         |

---

### Products — `/api/products`

| Method | Endpoint                | Description                    | Auth Required | Admin Only |
| ------ | ----------------------- | ------------------------------ | ------------- | ---------- |
| GET    | `/getproducts`          | Get all products               | No            | No         |
| GET    | `/getproduct/:id`       | Get single product             | No            | No         |
| POST   | `/addproduct`           | Add a new product (with image) | ✅            | No         |
| PUT    | `/updateproduct/:id`    | Update a product               | ✅            | No         |
| DELETE | `/deleteproduct/:id`    | Delete a product               | ✅            | No         |
| PUT    | `/addimages/:productid` | Upload multiple images         | ✅            | No         |
| GET    | `/getfeatured/:count`   | Get N featured products        | ✅            | ✅         |

**Adding a product** requires `multipart/form-data` since it includes an image file:

```
POST /api/products/addproduct
Content-Type: multipart/form-data

Fields: name, description, brand, price, category, countInStock, isFeatured
File:   image (single file, png/jpg/jpeg only)
```

---

### Categories — `/api/categories`

| Method | Endpoint              | Description         | Auth Required | Admin Only |
| ------ | --------------------- | ------------------- | ------------- | ---------- |
| GET    | `/getcategories`      | Get all categories  | ✅            | No         |
| GET    | `/getcategory/:id`    | Get single category | ✅            | No         |
| POST   | `/addcategory`        | Create a category   | ✅            | ✅         |
| PUT    | `/updatecategory/:id` | Update a category   | ✅            | ✅         |
| DELETE | `/deletecategory/:id` | Delete a category   | ✅            | ✅         |

---

### Orders — `/api/orders`

| Method | Endpoint                   | Description                | Auth Required | Admin Only |
| ------ | -------------------------- | -------------------------- | ------------- | ---------- |
| GET    | `/getorders`               | Get all orders             | ✅            | No         |
| GET    | `/getorder/:id`            | Get single order           | ✅            | No         |
| POST   | `/addorder`                | Place a new order          | ✅            | No         |
| PUT    | `/updateorder/:id`         | Update order status        | ✅            | No         |
| DELETE | `/delete/:id`              | Delete an order            | ✅            | No         |
| GET    | `/get-user-orders/:userid` | Get all orders for a user  | ✅            | No         |
| GET    | `/getorderscount`          | Get total number of orders | ✅            | No         |
| GET    | `/totalsales`              | Get total sales revenue    | ✅            | ✅         |

**Placing an order request body:**

```json
{
  "orderItem": [
    { "product": "<product_id>", "quantity": 2 },
    { "product": "<product_id>", "quantity": 1 }
  ],
  "shippingAddress1": "123 Main St",
  "city": "New York",
  "zip": "10001",
  "country": "US",
  "phone": "1234567890",
  "user": "<user_id>"
}
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/eshop-backend.git
cd eshop-backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Then fill in your values (see Environment Variables below)

# 4. Start the server
node app.js

# Or with auto-restart on file changes (recommended for development)
npm install -g nodemon
nodemon app.js
```

The server will start on `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
# MongoDB connection string
CONNECTION_STRING=mongodb+srv://<username>:<password>@cluster.mongodb.net/eshop

# JWT secrets — use long, random strings for both
ACCESS_TOKEN=your_access_token_secret_here
REFRESH_TOKEN=your_refresh_token_secret_here
```

> ⚠️ Never commit your `.env` file to GitHub. Make sure `.env` is listed in your `.gitignore`.

To generate strong secrets, run this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Security

The following security measures are implemented in this API:

- **Password hashing** — all passwords are hashed with bcrypt before being stored. The raw password is never saved anywhere.
- **JWT authentication** — stateless token verification on all protected routes.
- **Refresh token hashing** — refresh tokens are also hashed with bcrypt before storage, so even a database breach doesn't expose valid tokens.
- **Refresh token rotation** — every time a new access token is issued, the old refresh token is deleted and replaced. This limits the damage of a stolen refresh token.
- **Rate limiting** — the login endpoint is limited to 5 attempts per minute per IP to prevent brute force attacks.
- **Admin authorization** — sensitive operations require `isAdmin: true` on the user's account, checked fresh from the database on every request.
- **File type validation** — the image upload middleware rejects any file that is not a `png`, `jpg`, or `jpeg`.
- **Server-side price calculation** — order totals are always calculated by the server, never trusted from the client.

---
