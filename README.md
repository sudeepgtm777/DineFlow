# DineFlow

Restaurant and hotel operations app for dine-in QR ordering, kitchen tickets, POS checkout, table and room bookings, and daily sales.

The repo is split into two apps:

| App | Stack | Default URL |
| --- | --- | --- |
| [`backend/`](backend) | Express + TypeScript + MongoDB | `http://localhost:4000` |
| [`client/`](client) | Next.js 16 (App Router) + React 18 + Redux | `http://localhost:3000` |

## Features

**Guest**
- Scan a table QR (`/order?table=2`) or open `/?table=2` to browse the menu
- Cart, checkout, and pay at the counter
- Add items to an already-open table session

**Kitchen (cook)**
- Board of tickets sent to KOT
- Mark orders in progress / completed

**Admin**
- Dashboard: today’s orders, sales, kitchen load, table occupancy
- Manage Orders: send to KOT, update status, generate a bill
- Menu CRUD with image upload (Cloudinary)
- Tables: create, QR codes, occupancy, table bill
- Rooms: inventory, amenities, guest bookings, check-in / check-out
- POS: floor checkout with cash / online / credit / mixed tenders
- Reports and Get Total (payment breakdown by day / week / month / year)
- User management (promote / demote admin)

Prices on guest and POS orders are taken from the menu in the database, not from the client.

## Tech stack

**Client:** Next.js 16, React 18, TypeScript, Tailwind CSS v4, Redux Toolkit, Axios, Recharts, react-toastify

**Server:** Node.js, Express 5, TypeScript, Mongoose 8, JWT (httpOnly cookie), Multer, Cloudinary, QRCode, express-rate-limit

**Data:** MongoDB

## Architecture

```mermaid
flowchart LR
  qr[Table QR] --> guest[Guest menu]
  guest --> api[Express API]
  pos[Admin POS] --> api
  api --> mongo[(MongoDB)]
  api --> kot[Cook board]
  kot --> complete[Complete / bill]
  complete --> posBills[POS sales]
  posBills --> dash[Dashboard / Reports]
```

Auth is cookie-based (`token`, httpOnly). Login and register are rate-limited (5 attempts per minute).

Roles in the user model: `admin` and `cook`. Middleware: `isAuthenticated`, `isAdmin`, `isStaff` (admin or cook).

## Project layout

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── .env.example
├── client/
│   ├── app/                 # Next.js routes
│   ├── components/
│   ├── hooks/
│   ├── legacy-pages/        # Screen implementations
│   └── lib/                 # axios, Redux, endpoints
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account if you want menu / room / table images and QR uploads

## Setup

Clone the repo and install both apps:

```bash
git clone git@github.com:sudeepgtm777/restaurent.git
cd restaurent

cd backend && npm install
cd ../client && npm install
```

### Backend env

Copy [`backend/.env.example`](backend/.env.example) to `backend/.env` and fill in values:

```bash
cd backend
cp .env.example .env
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | yes | Mongo connection string |
| `JWT_SECRET` | yes | Signs auth cookies |
| `PORT` | no | Defaults to `4000` |
| `NODE_ENV` | no | `development` or `production` |
| `FRONTEND_URL` | no | Origin for CORS and QR links (default `http://localhost:3000`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | no | Seeds an admin on first connect if that email does not exist |
| `CLOUDINARY_*` | for uploads | Menu images, room photos, table QR files |

The process exits on boot if `MONGO_URI` or `JWT_SECRET` is missing.

### Client env

Create `client/.env` (or `.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Axios uses that base URL with `withCredentials: true`.

### Run

Two terminals:

```bash
# terminal 1
cd backend
npm run dev
```

```bash
# terminal 2
cd client
npm run dev
```

- API: [http://localhost:4000](http://localhost:4000) (`GET /health` → `{ "status": "ok" }`)
- App: [http://localhost:3000](http://localhost:3000)

Sign in at `/login`. Admins land on `/admin/dashboard`, cooks on `/cook`.

## Guest order loop

1. Create a table in **Tables Manager**. Its QR points at `/order?table={n}`.
2. Guest opens that URL (or `/?table={n}`), adds items, checks out.
3. Admin **Manage Orders** → **Send to KOT**.
4. Cook marks the ticket prepared / completed.
5. Admin completes / prints the table bill. Completing a session writes a POS bill so Dashboard, Reports, and Get Total pick up the sale.

## App routes

| Path | Who |
| --- | --- |
| `/` | Public menu |
| `/order?table=` | Guest dine-in (QR) |
| `/guest-checkout?table=` | Guest checkout |
| `/rooms`, `/rooms/[roomNumber]` | Public room list / book |
| `/login`, `/signup` | Auth |
| `/admin/dashboard` | Admin home |
| `/admin/orders` | Manage Orders |
| `/admin/menu` | Menu |
| `/admin/table-stats` | Tables |
| `/admin/room-stats` | Rooms |
| `/admin/reservations` | Room bookings |
| `/admin/pos` | POS |
| `/admin/reports` | Sales reports |
| `/admin/get-total` | Payment totals |
| `/admin/settings` | Users |
| `/cook` | Kitchen board |

`/admin/*` and `/cook/*` require a `token` cookie (Next middleware).

## API

Base path: `/api/v1`

| Prefix | Area |
| --- | --- |
| `/user` | Register, login, logout, profile, promote / demote |
| `/menuitem` | Menu items and categories |
| `/order` | Create / add items (public), list, KOT, complete, table bill |
| `/table` | Tables, QR, occupancy |
| `/bill` | Table session bill |
| `/pos` | Bills, daily / monthly sales, payment totals |
| `/room` | Rooms, check-in / check-out |
| `/roombooking` | Guest book, admin list / status |

Guest `POST /order/create-order` and `POST /order/add-item/:orderId` are public. Everything else for staff is cookie-authenticated.

Order item ids must be Mongo menu `_id` values. The server looks up each line and uses the stored price.

## Scripts

**Backend**

```bash
npm run dev      # nodemon + ts-node
npm run build    # tsc → dist/
npm start        # node dist/index.js
```

**Client**

```bash
npm run dev      # next dev
npm run build
npm start
npm run lint
```

## Production notes

- Set `NODE_ENV=production` so the auth cookie is `Secure` and `SameSite=None`.
- Set `FRONTEND_URL` to the public site origin (CORS + QR URLs).
- Point `NEXT_PUBLIC_API_URL` at the public API, including `/api/v1`.
- Build and start each app on its own:

```bash
cd backend && npm run build && npm start
cd client && npm run build && npm start
```

## License

ISC. Author: Sudeep Gautam.
