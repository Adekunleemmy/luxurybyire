# Luxurybyire — Premium Footwear E-Commerce Platform

A production-ready, full-stack luxury e-commerce application built for **Luxurybyire**, an exclusive Nigerian footwear brand.

---

## 🌟 Highlights

- **Full-Stack Architecture**: React 18 + Vite frontend with Express + Prisma ORM + PostgreSQL backend.
- **WhatsApp Direct Checkout**: Seamless Nigerian shopping flow that records orders in the database and generates rich, preformatted WhatsApp messages with product details, customer address, delivery fees, and order totals.
- **Admin Control Center**: Protected administrative panel for managing products, categories, orders, stock inventory, business contact settings, and tiered delivery zones.
- **Luxury Aesthetic**: Curated deep navy palette, Playfair Display serif headings, Inter body typography, smooth micro-interactions, dark & light theme modes, and responsive layouts.
- **SEO & Social**: `react-helmet-async` dynamic metadata, OpenGraph tags, and JSON-LD structured product data.
- **Enterprise Security**: Helmet HTTP headers, CORS whitelisting, rate limiting on API and authentication routes, bcrypt password hashing, and signed JWT authentication.

---

## 🏛️ System Architecture

```
LUXURYBYIRE/
├── frontend/                     # React + Vite Client Application
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── components/           # UI components
│   │   │   ├── layout/           # Navbar, Footer, AdminLayout
│   │   │   └── product/          # ProductCard, ProductGrid
│   │   ├── contexts/             # ThemeContext, CartContext, AuthContext
│   │   ├── hooks/                # useCommon custom hooks
│   │   ├── pages/
│   │   │   ├── customer/         # Home, Shop, ProductDetail, Cart, Checkout, About, Contact
│   │   │   ├── admin/            # Login, Dashboard, Products, ProductForm, Categories, Orders, Settings
│   │   │   └── NotFound.jsx      # Styled 404 page
│   │   ├── services/             # Axios API service layer (interceptors, error normalization)
│   │   ├── styles/               # Design tokens, global CSS, component utilities
│   │   ├── utils/                # Helpers (pricing formatters, WhatsApp URL generator, validators)
│   │   ├── App.jsx               # Client-side routing with scroll-to-top
│   │   └── main.jsx              # React entry point with providers
│   ├── vite.config.js            # Vite build & development proxy configuration
│   └── package.json
│
├── backend/                      # Node.js + Express API Application
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (PostgreSQL)
│   │   └── seed.js               # Database seeding script (admin, categories, delivery zones, products)
│   ├── src/
│   │   ├── config/               # Database singleton, Cloudinary, environment loader
│   │   ├── controllers/          # Request handlers (auth, products, categories, orders, settings, upload)
│   │   ├── middleware/           # Auth guard, error handler, validation runner, upload handler
│   │   ├── routes/               # API endpoints (/auth, /products, /categories, /orders, /settings, /upload, /admin)
│   │   ├── services/             # Core business logic layer
│   │   ├── validators/           # express-validator schemas
│   │   └── server.js             # Express server setup & middleware pipeline
│   ├── .env.example              # Environment variables template
│   └── package.json
│
├── README.md                     # Project documentation
├── DEPLOYMENT.md                 # Production deployment guide
└── .gitignore
```

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: v18.0+ or v20.0+ installed
- **PostgreSQL**: v14+ installed and running locally or remotely

### 1. Clone & Setup Backend

```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
```

Configure your `.env` file with your PostgreSQL connection:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/luxurybyire
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

> **Note on Special Characters**: If your PostgreSQL password contains special characters such as `#` or `@`, ensure they are URL-encoded in the `DATABASE_URL` (e.g. `#` becomes `%23`, `@` becomes `%40`).

Push the database schema and seed demo data:

```bash
npx prisma db push
node prisma/seed.js
```

Start the backend API server:

```bash
npm run dev
# or: node src/server.js
```

The backend server runs on `http://localhost:5000`.

### 2. Setup Frontend

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend application runs on `http://localhost:5173`.

---

## 🔐 Default Admin Credentials

Upon running `node prisma/seed.js`, a default administrator account is provisioned:

- **Email**: `admin@luxurybyire.com`
- **Password**: `LuxuryAdmin2024!`
- **Login URL**: `http://localhost:5173/admin/login`

> ⚠️ Always change this password in production via your environment variables or the settings panel!

---

## 📡 API Reference

### Public Storefront Endpoints
- `GET /api/health` — API health check
- `GET /api/products` — Filterable catalogue (supports `search`, `category`, `brand`, `gender`, `minPrice`, `maxPrice`, `size`, `isSale`, `isFeatured`, `isNewArrival`, `sort`, `page`, `limit`)
- `GET /api/products/:idOrSlug` — Single product details with related items
- `GET /api/products/brands` — List of unique available brands
- `GET /api/categories` — List active footwear categories
- `POST /api/orders` — Record checkout order and calculate delivery
- `GET /api/settings` — Business profile and contact information
- `GET /api/settings/delivery-zones` — Available delivery regions and fees

### Protected Admin Endpoints (`Bearer <JWT>`)
- `POST /api/auth/login` — Admin authentication
- `GET /api/auth/me` — Token session verification
- `GET /api/admin/stats` — Dashboard metrics (product counts, order breakdown)
- `GET /api/admin/products` — Product management listing (includes out-of-stock and draft items)
- `POST /api/products` — Create new product
- `PUT /api/products/:id` — Update product details, sizes, colours, pricing
- `DELETE /api/products/:id` — Remove product
- `POST /api/categories` — Create category
- `PUT /api/categories/:id` — Update category
- `DELETE /api/categories/:id` — Remove category
- `GET /api/orders` — List customer orders with pagination & status filters
- `GET /api/orders/:id` — Order line-item inspection
- `PUT /api/orders/:id/status` — Update order status (`PENDING`, `CONTACTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`)
- `PUT /api/settings` — Update business profile, phone, WhatsApp number, socials
- `PUT /api/settings/delivery-zones` — Update regional delivery pricing

---

## 🧪 Testing and Verification

Build validation:

```bash
# Verify frontend bundle compiles cleanly
cd frontend
npm run build

# Verify backend database connection & routes
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

---

## 📄 License

Proprietary © Luxurybyire. All rights reserved.
