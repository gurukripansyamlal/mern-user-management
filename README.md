# 🏬 CloudHouse Textile & Retail POS Billing Software

A modern, production-grade Point of Sale (POS) and Enterprise Billing web application engineered specifically for **apparel, textile, and retail showrooms**. Built with **React 18, Vite, TypeScript, Tailwind CSS, Node.js Express, and Prisma ORM**.

---

## 1. Project Overview

CloudHouse POS is a full-featured retail management platform tailored to handle the real-world operational challenges of textile and garment retail showrooms:
- **Staff Billing Counter**: Rapid SKU barcode scanning, quick cash denominations with automatic change calculations, UPI QR code integration, and print-ready thermal/A4 tax invoices.
- **Admin Management Portal**: Complete inventory control, category hierarchies, staff permissions, textile mill suppliers, and financial ledger accounting.
- **Dedicated Mobile Admin Portal (`/admin/mobile`)**: A native-app-style mobile administrative interface featuring bottom navigation tabs, touch-friendly metric cards, mobile product editing, and operational drawer navigation.
- **Real-Time Inventory & Returns Engine**: Atomic transactions that guarantee stock deduction on checkout and automatic stock restoration upon customer return, strictly preventing overselling or over-returns.
- **Financial General Ledger & Reports**: Double-entry style audit trail and multi-tab visual analytics (daily revenue trends, best-selling textile rankings, stock valuation at cost vs. retail, and payment channel breakdown).

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom styling and `@media print` thermal invoice formatting
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Revenue trend bar charts, payment distribution pie charts)
- **Routing**: React Router v6 (Guarded routes with role-based access control)
- **HTTP Client**: Axios with JWT authentication interceptors

### Backend
- **Runtime & Language**: Node.js v20+ with TypeScript
- **Framework**: Express.js REST API
- **ORM**: Prisma ORM (Relational schema with cross-database support: SQLite & PostgreSQL)
- **Database**: SQLite (local development) / PostgreSQL (production)
- **Security & Auth**: Stateless JWT tokens, bcrypt password hashing, input validation, and RBAC middleware

---

## 3. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend Presentation Layer                     │
├─────────────────────────┬──────────────────────┬───────────────────────┤
│  Desktop Admin Portal   │  Staff POS Counter   │  Mobile Admin Portal  │
│  (/admin/dashboard)     │  (/staff/pos)        │  (/admin/mobile)      │
└────────────┬────────────┴──────────┬───────────┴───────────┬───────────┘
             │                       │                       │
             ▼                       ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express.js REST API Layer                       │
├────────────────────────────────────────────────────────────────────────┤
│  - JWT Authentication & RBAC Middleware (/api/auth)                   │
│  - Atomic Checkout & Invoice Numbering (/api/pos)                      │
│  - Product & Category CRUD (/api/products, /api/categories)            │
│  - Returns & Stock Restoration Engine (/api/returns)                   │
│  - Double-Entry General Ledger (/api/ledger)                           │
│  - Business Intelligence Aggregator (/api/reports)                     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Prisma Relational Database                         │
│  User ──< Sale ──< SaleItem >── Product >── Category                   │
│            │           │           │                                   │
│            ▼           ▼           ▼                                   │
│        Return ───────────────> LedgerEntry                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema Entities

- **`User`**: Store staff and administrators with hashed credentials (`passwordHash`), role (`ADMIN` | `STAFF`), phone, and active status.
- **`Category`**: Textile departments (e.g. *Men's Formal*, *Denim*, *Women's Sarees*, *Traditional Handloom*, *Outerwear*, *Accessories*).
- **`Product`**: Garment catalog with unique SKU, cost price, retail price, stock quantity, low-stock threshold alert, and unit measurement.
- **`Supplier`**: Fabric mills and wholesale garment distributors with contact details and address.
- **`Sale`**: Completed transactions with unique sequential invoice numbers (`INV-YYYYMMDD-XXXX`), payment method (`CASH`, `CARD`, `UPI`), taxes, discounts, and cashier ID.
- **`SaleItem`**: Individual billed lines linking products, quantities, rates, and return tracking.
- **`Return`**: Audit records of returned garments, reasons (e.g. size mismatch, defect), refund amount, and stock restoration.
- **`LedgerEntry`**: Double-entry style financial records tracking credits (sales revenue) and debits (customer returns, supplier payments, store utility expenses) with running balance.

---

## 5. Key Workflows & Features

### A. Staff POS Billing Terminal (`/staff/pos` & `/admin/pos`)
- **Product Search & Barcode Scan**: Instant search by garment title or direct entry of SKU/barcode with auto-add to cart.
- **Cart Management**: Real-time stock verification prevents billing more than current showroom stock. Direct quantity adjustment, configurable discount (₹), and automated 5% GST computation.
- **Multi-Mode Checkout**:
  - **Cash**: Preset denomination buttons (+₹500, +₹1000, +₹2000, or exact), tendered amount input, and real-time change calculation.
  - **Card**: POS machine authorization reference recording.
  - **UPI**: Showroom dynamic QR code preview with UPI reference ID.
- **Atomic Execution**: Uses `prisma.$transaction` to atomically reduce product inventory, generate sequential invoice numbers, and log ledger revenue.
- **Printable Tax Invoices**: Formatted with store details, GSTIN, line-item details, tax breakdown, barcode preview, and return policy. Includes CSS `@media print` optimization for clean 80mm thermal receipt or A4 printing.

### B. Product Returns & Inventory Restoration (`/admin/returns`)
- Search transaction by invoice number.
- Inspect original line items with already-returned vs. eligible quantities.
- Specify return quantity (capped at eligible quantity) and reason (e.g., *Size mismatch*, *Defective weave*, *Customer exchange*).
- System atomically restores product inventory, marks the transaction as `PARTIALLY_REFUNDED` or `REFUNDED`, and posts a debit refund entry to the financial ledger.

### C. Dedicated Mobile Admin Portal (`/admin/mobile`)
- Native mobile app user experience accessible at `/admin/mobile`.
- Persistent bottom navigation: **Overview**, **POS Billing**, **Catalog**, and **More Ops** menu drawer.
- Touch-friendly cards, responsive charts, quick-action shortcuts (Add Item, Returns, Reports), and zero horizontal overflow on screens down to 320px width.

### D. Financial General Ledger (`/admin/ledger`)
- Real-time showroom cash/bank balance calculation.
- Automated entries for sales credits and return refund debits.
- Filter by transaction type (`SALE`, `RETURN`, `EXPENSE`, `SUPPLIER_PAYMENT`, `OPENING_BALANCE`) and date range.
- Form to log manual operating expenses (e.g., showroom rent, electricity, maintenance).

### E. Business Intelligence Reports (`/admin/reports`)
- **Sales Report**: Daily turnover breakdown, total discounts, tax collected, transaction count, and average order value.
- **Best-Selling Products**: Ranked by units sold and gross revenue with profit margin percentages.
- **Payment Methods Report**: Distribution and percentage breakdown between Cash, Card, and UPI.
- **Inventory Valuation Report**: Total physical stock units, valuation at purchase cost vs. retail showroom value, and gross margin potential.

---

## 6. Environment Variables

The project uses the following environment variables (configured via `.env` files, which are strictly excluded from version control):

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment mode | `development` or `production` |
| `PORT` | Backend server port | `5001` (avoids macOS port 5000 conflict) |
| `DATABASE_URL` | Prisma database connection string | `file:./dev.db` (SQLite) or `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `super-secret-jwt-key-for-cloudhouse-pos` |
| `VITE_API_URL` | Base URL for API requests from the frontend | `/api` (production proxy/single-origin) or `http://localhost:5001/api` |

---

## 7. Migration & Seed Commands

### Database Initialization & Migration
```bash
cd backend

# For local SQLite development:
npx prisma db push

# For PostgreSQL production deployment:
npx prisma migrate deploy
# or
npx prisma db push
```

### Database Seeding
```bash
cd backend

# Execute automated seed script with 22 textile SKUs, demo accounts, and historical records:
npx tsx prisma/seed.ts
```

### Automated End-to-End Verification Suites
```bash
cd backend

# Run the 47-point comprehensive functional validation test:
npx tsx src/test_suite.ts

# Run the Section 10 complete lifecycle integration flow:
npx tsx src/final_e2e_flow.ts
```

---

## 8. Local Setup Guide

### Prerequisites
- Node.js v18+ or v20+
- npm v9+

### Quick Start (Single Command)
```bash
# 1. Clone repository
git clone <repository_url>
cd cloudhouse

# 2. Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Setup database, push schema, and seed demo records
npm run db:setup

# 4. Start production server (serves API and built React SPA on port 5001)
npm run build
cd backend && npm start
```

### Running in Development Mode
```bash
# Terminal 1: Backend API with hot-reload (Port 5001)
cd backend
npm run dev

# Terminal 2: Frontend Vite dev server (Port 3000)
cd frontend
npm run dev
```

---

## 9. Demo Credentials

The database is pre-seeded with realistic textile products, historical sales, categories, and suppliers. Evaluators can also click the **"⚡ One-Click Evaluator Demo Login"** buttons on the login screen.

| Role | Email | Password | Primary Portal |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@posdemo.com` | `Admin@123` | Desktop: `/admin/dashboard`<br>Mobile: `/admin/mobile` |
| **Billing Staff** | `staff@posdemo.com` | `Staff@123` | Staff POS Terminal: `/staff/pos` |
| **Senior Cashier** | `cashier@posdemo.com` | `Cashier@123` | Staff POS Terminal: `/staff/pos` |

---

## 10. Application URLs

- **Main Application**: Provided in submission deployment
- **Admin Portal**: `/admin/dashboard`
- **Staff / POS Portal**: `/staff/pos`
- **Mobile Admin Experience**: `/admin/mobile`
- **Backend Health Check**: `/api/health`

---

## 11. Project Assumptions

1. **Textile Business Modeling**: Products feature industry-relevant units (`pcs`, `mtr`, `set`, `roll`) and standard 5% GST taxation rate default typical for textile and apparel goods in retail showrooms.
2. **Unified Single-Origin Deployment**: In production, the Node.js Express server is architected to serve both the REST API endpoints (`/api/*`) and the compiled Vite React single-page application (`dist/`) with SPA fallback routing. This eliminates CORS overhead and simplifies high-availability hosting.
3. **Database Flexibility**: The Prisma ORM schema is designed for 1:1 cross-compatibility between SQLite (zero-setup local development) and PostgreSQL (cloud production environments).
4. **Thermal Printer Formatting**: Thermal receipts are calibrated for standard 80mm/58mm thermal receipt paper roll widths using CSS print media directives (`@media print`).

---

## 12. Known Limitations

1. **Hardware Cash Drawer Integration**: Cash drawer ejection currently relies on ESC/POS commands handled by standard printer drivers rather than direct WebUSB/WebSerial browser hardware protocols.
2. **Offline-First Mode**: While optimistic UI caching exists in React state, offline checkout queuing (IndexedDB service worker sync) is scheduled for the next release roadmap.
3. **Multi-Store Franchise Sync**: Current inventory is showroom-centric. Centralized multi-warehouse stock replenishment between geographically distributed stores is supported via suppliers but not automated inter-branch transfers.
