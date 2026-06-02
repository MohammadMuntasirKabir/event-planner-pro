# Event Planner Pro

A full-stack event planning application built with Next.js 16, React 19, Tailwind CSS v4, and Neon Postgres. Create events, share invite links, and track RSVPs in real-time with a polished dark-themed UI and smooth CSS animations.

## Features

- **Landing Page** — Animated hero section with floating orbs, gradient shifts, scroll-reveal feature cards, and staggered entrance animations
- **Auth** — Cookie-based sessions with sign up, sign in, and logout
- **Dashboard** — Grid of event cards with RSVP count badges (Going/Maybe/Not Going), delete events
- **Create Events** — Form with title, description, location, and date/time fields
- **Event Detail** — View event info, generate/share unique invite links, manage attendees
- **Public RSVP** — Guests respond (Going/Maybe/Not Going) without creating an account
- **Attendee Table** — Sortable list with status badges, delete responses
- **RSVP Summary** — Real-time count cards for each status

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Database | Neon Postgres (serverless) |
| ORM | Prisma 6 with PrismaNeonHttp adapter |
| Auth | Cookie-based sessions (SHA-256 hashed passwords) |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |
| Animations | Pure CSS (no JS libraries) |

## CSS Animations

All animations are pure CSS with `prefers-reduced-motion` support:

- Scroll-reveal via IntersectionObserver-triggered CSS classes
- Staggered card entrance delays
- Floating decorative orbs on hero
- Pulsing glow on CTA buttons
- Smooth hover scale/glow on cards and buttons
- Page enter fade transitions

## Getting Started

### Prerequisites

- Node.js 18+
- Neon Postgres database (or any PostgreSQL 15+)

### Setup

```bash
# Clone the repo
git clone git@github.com:MohammadMuntasirKabir/event-planner-pro.git
cd event-planner-pro

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Neon DATABASE_URL:
# postgresql://user:password@host:5432/dbname?sslmode=require

# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma db push

# Run dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon recommended) |
| `NEXT_PUBLIC_APP_URL` | Public app URL (e.g. `http://localhost:3000`) |

### Running Tests

```bash
# All tests
npm run tests

# Watch mode
npm run test:watch
```

## Database Schema

```
users
  id (UUID, PK)
  email (VARCHAR, UNIQUE)
  name (VARCHAR)
  password_hash (VARCHAR)
  created_at, updated_at (TIMESTAMPTZ)

events
  id (UUID, PK)
  owner_user_id (UUID -> users.id)
  title (VARCHAR)
  description (TEXT)
  location (VARCHAR)
  event_date (TIMESTAMPTZ)
  created_at, updated_at (TIMESTAMPTZ)

event_invites
  id (UUID, PK)
  event_id (UUID, UNIQUE -> events.id, CASCADE)
  token (VARCHAR, UNIQUE)
  created_at (TIMESTAMPTZ)

event_rsvps
  id (UUID, PK)
  event_id (UUID -> events.id, CASCADE)
  invite_id (UUID -> event_invites.id, SET NULL)
  name (VARCHAR)
  email (VARCHAR)
  email_normalized (VARCHAR)
  status (ENUM: going, maybe, not_going)
  responded_at, created_at, updated_at (TIMESTAMPTZ)
  UNIQUE(event_id, email_normalized)
```

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth` | Get current session |
| POST | `/api/auth` | Sign in (email + password) |
| PUT | `/api/auth` | Register new account |
| DELETE | `/api/auth` | Sign out |
| DELETE | `/api/events/[eventId]` | Delete event (owner only) |
| POST | `/api/events/[eventId]` | Generate/return invite token (owner only) |
| DELETE | `/api/events/[eventId]/rsvps/[rsvpId]` | Remove RSVP (owner only) |

## Project Structure

```
event-planner-pro/
├── app/                     # Next.js App Router pages + API
│   ├── api/auth/            # Auth API routes
│   ├── api/events/[eventId] # Event CRUD + invite API
│   ├── auth/[path]/         # Sign in page
│   ├── auth/signup/         # Sign up page
│   ├── dashboard/           # User's events list
│   ├── events/new/          # Create event form
│   ├── events/[eventId]/    # Event detail page
│   ├── invite/[token]/      # Public RSVP page
│   ├── layout.tsx           # Root layout with auth provider
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles + animations
├── components/
│   ├── animated-card.tsx    # Scroll-reveal wrapper
│   ├── dashboard-content.tsx
│   ├── event-detail-content.tsx
│   ├── features-section.tsx
│   ├── footer.tsx
│   ├── hero-section.tsx
│   ├── navbar.tsx           # Auth-aware navigation
│   └── ui/                  # shadcn-style primitives
├── lib/
│   ├── actions/events.ts    # Server actions (CRUD)
│   ├── auth/client.tsx      # Client auth context
│   ├── auth/server.ts       # Server auth helpers
│   ├── prisma.ts            # Prisma client (Neon adapter)
│   └── utils.ts             # Shared utilities
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
├── proxy.ts                 # Auth middleware
├── scripts/
│   ├── setup-db.sh          # Neon DB setup script
│   └── full-test.cjs        # End-to-end integration test
├── tests/                   # Test files (83 tests)
└── vitest.config.ts
```

## Default Admin Account

```
Email: admin@eventplanner.pro
Password: password123
```

## License

Built with Next.js, Neon, and Prisma.
