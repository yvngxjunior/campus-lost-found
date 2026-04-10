# 🎒 Campus Lost & Found Portal

A full-stack web portal for declaring, searching, and reclaiming lost & found objects on campus.

## Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | PostgreSQL (Prisma ORM) |
| Auth | JWT + institutional email |
| Frontend | HTML/CSS/JS (vanilla, no framework) |
| Storage | Local filesystem / S3-compatible |

## Project Structure

```
campus-lost-found/
├── server/
│   ├── src/
│   │   ├── config/         # DB, env, multer config
│   │   ├── middleware/     # auth, error, upload
│   │   ├── models/         # Prisma schema (see prisma/)
│   │   ├── routes/         # Express routers
│   │   ├── controllers/    # Business logic per resource
│   │   ├── services/       # Reusable service layer
│   │   └── app.js          # Express app bootstrap
│   ├── prisma/
│   │   └── schema.prisma   # Full ER schema (7 entities)
│   └── package.json
├── client/
│   ├── public/
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   └── pages/
└── docs/
    ├── cahier-des-charges.md
    └── features.md
```

## Getting Started

```bash
# 1. Install dependencies
cd server && npm install

# 2. Copy env file
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET

# 3. Run DB migrations
npx prisma migrate dev --name init

# 4. Start dev server
npm run dev
```

## Entities (ER Model)

7 core entities: `User`, `Item`, `Location`, `Category`, `Message`, `ClaimRequest`, `Photo`

See `server/prisma/schema.prisma` for full schema.

## Features (MVP)

- ✅ Institutional auth (JWT, campus email)
- ✅ Declare lost/found items (CRUD)
- ✅ Photo uploads per item
- ✅ Search & filter (keyword, category, location, date, status)
- ✅ Secure internal messaging
- ✅ Admin moderation panel
- ✅ Claim request workflow
- 🔜 Auto-match suggestions (AI/ML)
- 🔜 Real-time notifications

---

> Built for ISEP campus — RGPD compliant, WCAG accessible.
