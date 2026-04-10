# Architecture — Campus Lost & Found

## Overview

```
┌─────────────────────────────────────────────────────┐
│                     Client (Browser)                 │
│   HTML/CSS/JS  ←→  REST API  ←→  Express Server     │
└──────────────────────────┬──────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │     Node.js / Express    │
              │  ┌──────────────────┐   │
              │  │   Auth (JWT)     │   │
              │  │   Routes         │   │
              │  │   Controllers    │   │
              │  │   Services       │   │
              │  │   Middleware     │   │
              │  └──────────────────┘   │
              └────────────┬────────────┘
                           │  Prisma ORM
              ┌────────────▼────────────┐
              │       PostgreSQL         │
              └─────────────────────────┘
```

## API Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | ✗ | Register with campus email |
| POST | /api/auth/login | ✗ | Login, returns JWT |
| GET | /api/auth/me | ✓ | Get own user |
| GET | /api/items | ✗ | List / search items |
| GET | /api/items/:id | ✗ | Get item detail |
| POST | /api/items | ✓ | Create item (+ photos) |
| PUT | /api/items/:id | ✓ | Update own item |
| DELETE | /api/items/:id | ✓ | Delete own item |
| PATCH | /api/items/:id/close | ✓ | Close as recovered |
| GET | /api/messages | ✓ | Inbox |
| GET | /api/messages/item/:id | ✓ | Thread by item |
| POST | /api/messages | ✓ | Send message |
| PATCH | /api/messages/:id/read | ✓ | Mark read |
| POST | /api/claims | ✓ | Submit claim |
| GET | /api/claims/my | ✓ | My claims |
| PATCH | /api/claims/:id/approve | ADMIN | Approve claim |
| PATCH | /api/claims/:id/reject | ADMIN | Reject claim |
| GET | /api/admin/items | ADMIN | Pending moderation queue |
| PATCH | /api/admin/items/:id/verify | ADMIN | Verify item |
| PATCH | /api/admin/items/:id/reject | ADMIN | Reject item |
| GET | /api/admin/users | ADMIN | List users |
| PATCH | /api/admin/users/:id/toggle | ADMIN | Toggle user active |
| PATCH | /api/admin/users/:id/role | ADMIN | Change user role |
| GET/POST/PUT/DELETE | /api/admin/categories | ADMIN | Manage categories |
| GET/POST/PUT/DELETE | /api/admin/locations | ADMIN | Manage locations |

## Security Model

- All campus-only: email domain whitelist at registration
- Passwords hashed with bcrypt (12 rounds)
- JWT Bearer tokens (7-day expiry)
- Role-based access: STUDENT / STAFF / ADMIN
- Sensitive data never exposed in public responses
- Multer validates file types (JPEG/PNG/WebP only)
