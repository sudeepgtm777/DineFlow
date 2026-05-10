# 🍽️ Restro ERP – Restaurant & Hotel Management System

A complete **Restaurant & Hotel Management System** built using **Node.js, Express, MongoDB, React, and Next.js**.  
This ERP helps restaurants & hotels manage **POS, bookings, rooms, tables, menu items, payments, and reports**.

---

## 🚀 Features

### 🔐 Authentication & Users

- JWT-based authentication
- Role-based authorization (Admin, Staff, Receptionist)

### 🍽️ POS (Point of Sale)

- Create & manage orders
- Add/remove menu items
- Auto bill calculation
- Multi-payment support
- Sales summary: Today / Weekly / Monthly / Yearly

### 🏨 Room Management

- Add/Edit/Delete rooms
- Room bookings
- Guest check-in / check-out
- Booking status tracking

### 🍛 Menu Management

- Full CRUD operations
- Category-wise menu items
- Stock & pricing management

### 🍽️ Table Management

- Manage table status
- Table reservations
- Table availability overview

### 💳 Payment System

- Cash / Card / Digital Wallet / Credit
- Credit transfer between payment types
- Filter payments by Today / Week / Month / Year

### 📊 Dashboard

- Real-time analytics
- Booking overview
- Top-selling items

---

## 🛠️ Tech Stack

### **Frontend**

- React.js
- Next.js (App Router)
- TailwindCSS
- Axios

### **Backend**

- Node.js
- Express
- Mongoose (MongoDB)
- JWT Authentication

### **Database**

- MongoDB (Cloud or Local)

---

## ▶️ Run Locally (Two Terminals)

### 1) Backend API

```bash
cd backend
npm install
npm run dev
```

Backend env file lives at `backend/.env`.

### 2) Frontend (Next.js)

```bash
cd client
npm install
npm run dev
```

Set frontend env in `client/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 🏗️ Production Build

Build and run each package separately:

```bash
cd backend && npm run build && npm run start
cd client && npm run build && npm run start
```
