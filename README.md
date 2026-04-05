# 📈 Finance Dashboard (Pro)

A premium, full-stack finance management platform designed with **Performance**, **Security**, and **User Experience** in mind. Built with a modern tech stack featuring **React 19**, **Drizzle ORM**, and **Neon Serverless PostgreSQL**, now supporting **Indian Rupees (₹)**.

---

## ✨ Features (New & Enhanced)

- **🕒 Real-time Analytics**: Dashboard with visual trends, category distribution, and recent activity monitoring.
- **📅 Advanced Filtering**: Premium **Date Range Picker** to quickly drill down into financial data.
- **🇮🇳 Localized Currency**: Full support for **Indian Rupees (₹)** with localized numbering formats.
- **🗑️ Smart Recycle Bin**: Soft-delete functionality allowing you to recover or permanently erase transactions.
- **📦 Bulk Operations**: Select multiple records for efficient bulk deletions and management.
- **🔐 Role-Based Access (RBAC)**: Fine-grained permissions for **Admin**, **Analyst**, and **Viewer** roles.
- **💎 Premium UI**: Built with **shadcn/ui**, **Lucide icons**, and custom **Glassmorphism** styles for a sleek, modern look.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS 4 (using `@tailwindcss/vite`)
- **UI Components**: custom shadcn/ui (Radix Primitives)
- **State & Data**: TanStack Query (React Query)
- **Navigation**: React Router 7
- **Date Utilities**: date-fns & react-day-picker

### **Backend**
- **Runtime**: Node.js (Express.js)
- **ORM**: Drizzle ORM (Modern, Lightweight, Type-safe)
- **Database**: PostgreSQL (Neon Serverless)
- **Auth**: JWT (JSON Web Tokens) with Secure Middleware
- **Security**: Helmet, CORS, and Zod validation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (Neon recommended)

### 1. Setup Server

```bash
cd server

# Install dependencies
npm install

# Configure environment
# Update .env with your DATABASE_URL (Neon URL)
# Example: DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Push schema to database
npm run db:push

# Seed the database (Optional)
npm run db:seed

# Start the dev server
npm run dev
```
*Server runs on: **http://localhost:3000***

### 2. Setup Client

```bash
cd client

# Install dependencies
npm install

# Start the dev server
npm run dev
```
*Client runs on: **http://localhost:5173***

---

## 🔐 Account Access (Shared)

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@finance.com` | `password123` | Full access to users & transactions |
| **Analyst** | `analyst@finance.com` | `password123` | View users, view/edit dashboard |
| **Viewer** | `viewer@finance.com` | `password123` | Read-only dashboard & transactions |

---

## 📡 API Architecture

```
# Authentication
POST   /api/auth/register    → Public
POST   /api/auth/login       → Public
GET    /api/auth/me          → Authenticated

# User Management (RBAC)
GET    /api/users            → Admin, Analyst
POST   /api/users            → Admin
DELETE /api/users/:id        → Admin

# Transaction Engine
GET    /api/transactions     → All Users (List + Filters)
POST   /api/transactions     → Admin (Create)
PATCH  /api/transactions/:id → Admin (Update)
DELETE /api/transactions/:id → Admin (Soft Delete)
POST   /api/transactions/bulk-delete → Admin

# Recycle Bin
GET    /api/transactions/deleted → Admin (Recoverable items)
POST   /api/transactions/restore → Admin (Bulk restore)
POST   /api/transactions/permanent → Admin (Hard delete)

# Dashboard Services
GET    /api/dashboard/summary → Trends, Balances, Totals
GET    /api/dashboard/recent  → Activity Feed
```

---

## 📂 Project Structure

```text
Finance/
├── client/          # Vite + React (UI Layer)
│   ├── src/components/ui/  # Reusable primitives
│   └── src/hooks/          # React-Query endpoints
└── server/          # Express + Drizzle (API Layer)
    ├── src/modules/        # Feature-based routers & services
    └── src/db/             # Drizzle schemas & migrations
```

---

*Built with ❤️ for Modern Web Development.*

We chose Drizzle ORM for faster database performance and shadcn/ui for a custom, premium look that generic libraries can't match. TanStack Query was used to automate state management and caching, while a robust RBAC system provides professional security across three user roles. This setup prioritizes a high-performance, scalable codebase over quick, "copy-paste" shortcuts.
