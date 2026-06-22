# Event Planner Pro

A full-stack event planning application built with **Next.js 16**, **React 19**, **Clerk Auth**, **Prisma**, and **Neon Postgres**. Create events, share invite links, and track RSVPs with a polished dark-themed UI.

## Features

- **Landing Page** — Animated hero with floating orbs, gradient shifts, scroll-reveal features
- **Auth** — Clerk authentication (sign in, sign up, session management)
- **Dashboard** — Event cards with RSVP count badges, delete events
- **Create Events** — Form with title, description, location, date/time
- **Event Detail** — View event info, generate/share invite links, manage attendees
- **Public RSVP** — Guests respond (Going/Maybe/Not Going) without an account
- **Attendee Table** — Sortable list with status badges, delete responses
- **RSVP Summary** — Real-time count cards for each status
- **Rate Limiting** — 30 req/min per IP on all API routes
- **Input Validation** — Structured validation on event creation and RSVP submission
- **Error Handling** — Error boundaries, loading skeletons, not-found pages, SEO (sitemap + robots.txt)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Auth | Clerk (@clerk/nextjs) |
| Database | Neon Postgres (serverless) |
| ORM | Prisma 6 |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |
| Language | TypeScript 6 |

## Getting Started

### Prerequisites

- Node.js 18+
- Neon Postgres database
- Clerk account (for auth)

### Setup

```bash
git clone git@github.com:MohammadMuntasirKabir/event-planner-pro.git
cd event-planner-pro
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3004](http://localhost:3004)

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

### Running Tests

```bash
npm test          # Run all tests
npm run test:watch
```

**208 tests** covering API routes, server actions, components, and UI.

## Database Schema

```
users (Clerk manages auth)
events
  id (UUID, PK), owner_user_id, title, description, location, event_date, created_at

event_invites
  id (UUID, PK), event_id (UNIQUE -> events.id, CASCADE), token (UNIQUE), created_at

event_rsvps
  id (UUID, PK), event_id (-> events.id, CASCADE), invite_id (-> event_invites.id)
  name, email, email_normalized, status (going/maybe/not_going)
  responded_at, created_at, updated_at
  UNIQUE(event_id, email_normalized)
```

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| DELETE | `/api/events/[eventId]` | Delete event (owner only, rate limited) |
| POST | `/api/events/[eventId]/invite` | Generate/return invite token (owner only, rate limited) |
| DELETE | `/api/events/[eventId]/rsvps/[rsvpId]` | Remove RSVP (owner only, rate limited) |

## Project Structure

```
event-planner-pro/
├── app/
│   ├── api/events/[eventId]/     # Event CRUD + invite API (rate limited)
│   ├── auth/                     # Clerk auth pages
│   ├── dashboard/                # User's events list
│   ├── events/new/               # Create event form
│   ├── events/[eventId]/         # Event detail page
│   ├── invite/[token]/           # Public RSVP page
│   ├── error.tsx                 # Error boundary
│   ├── loading.tsx               # Root loading skeleton
│   ├── not-found.tsx             # 404 page
│   ├── robots.ts                 # robots.txt
│   ├── sitemap.ts                # Sitemap
│   ├── layout.tsx                # Root layout (ClerkProvider)
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── navbar.tsx                # Auth-aware navigation
│   ├── footer.tsx
│   └── ui/                       # shadcn-style primitives
├── lib/
│   ├── actions/events.ts         # Server actions (CRUD + validation)
│   ├── db.ts                     # Prisma client (Neon adapter)
│   ├── rate-limit.ts             # In-memory rate limiter
│   └── validations.ts            # Input validation helpers
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── proxy.ts                      # Clerk middleware
├── tests/                         # 208 tests
└── vitest.config.ts
```

## License

Built with Next.js, Clerk, Neon, and Prisma.
