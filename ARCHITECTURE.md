# TMDB Watchlist – Architecture Deep Dive

This document provides an in-depth walkthrough of every major file and function in the codebase. It's written as though you're presenting the project during a technical interview—covering intent, design decisions, and how the pieces fit together.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Database Layer – Prisma](#database-layer--prisma)
5. [Supabase Integration](#supabase-integration)
6. [TMDB API Layer](#tmdb-api-layer)
7. [Server Actions – Watchlist](#server-actions--watchlist)
8. [Pages & Routing](#pages--routing)
9. [Components](#components)
10. [Utility Modules](#utility-modules)
11. [API Routes](#api-routes)
12. [Environment Variables](#environment-variables)
13. [Error Handling & Resilience](#error-handling--resilience)
14. [Caching & Revalidation](#caching--revalidation)

---

## Project Overview

**TMDB Watchlist** is a movie discovery application that:

- Fetches live movie data from The Movie Database (TMDB) API.
- Lets authenticated users manage a personal watchlist with notes, favorites, and category tags.
- Persists watchlist data in a Supabase-hosted PostgreSQL database via Prisma ORM.
- Uses Supabase Auth for user identity (supporting magic links or OAuth).

The goal is to demonstrate a modern full-stack Next.js 16 App Router architecture with:
- React Server Components for data fetching.
- Server Actions for mutations.
- Edge-cached API routes for TMDB proxy calls.
- Row-Level Security in Supabase for client-side protection plus a service-role bypass for server-side Prisma queries.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, lucide-react icons |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7 (with driver adapters) |
| Auth | Supabase Auth (SSR via `@supabase/ssr`) |
| External API | TMDB v3 REST API |
| Deployment | Vercel (implied via env vars) |

---

## Directory Structure

```
tmdb/
├── app/                    # Next.js App Router
│   ├── actions/            # Server Actions
│   │   └── watchlist.ts
│   ├── api/                # Route Handlers
│   │   ├── tmdb/[...segments]/route.ts
│   │   └── watchlist/status/  (placeholder)
│   ├── browse/page.tsx
│   ├── movie/[id]/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── movie-card.tsx
│   ├── movie-grid.tsx
│   ├── section-heading.tsx
│   ├── watchlist-panel.tsx
│   └── ui/
│       └── badge.tsx
├── lib/
│   ├── http.ts
│   ├── prisma.ts
│   ├── utils.ts
│   ├── watchlist.ts
│   ├── tmdb.ts
│   ├── tmdb/
│   │   └── fetcher.ts
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── service.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .env
├── package.json
└── README.md
```

---

## Database Layer – Prisma

### `prisma/schema.prisma`

Defines the generator, datasource, and two models:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String          @id @db.Uuid
  email     String?         @unique
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  watchlist WatchlistItem[]
}

model WatchlistItem {
  id           String   @id @default(cuid())
  userId       String   @db.Uuid
  tmdbId       Int
  title        String
  mediaType    String
  posterPath   String?
  backdropPath String?
  notes        String?
  favorite     Boolean  @default(false)
  categories   String[] @default([])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, tmdbId])
  @@index([userId])
  @@index([tmdbId])
}
```

**Key Design Decisions:**

- `User.id` is a UUID matching Supabase Auth's `auth.uid()`.
- `WatchlistItem` uses a composite unique constraint `@@unique([userId, tmdbId])` so a user can only have one entry per TMDB movie.
- Indexes on `userId` and `tmdbId` speed up common lookups.
- `categories` is a Postgres array (`String[]`) for flexible tagging without a join table.

### `lib/prisma.ts`

```typescript
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Purpose:** Singleton pattern with Prisma 7's driver adapter architecture. Uses `@prisma/adapter-pg` for PostgreSQL connections, avoiding multiple client instances during hot reloads.

### `prisma.config.ts`

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
```

**Purpose:** Prisma 7 configuration file for CLI operations (migrations, db push, etc.). The datasource URL moved from schema.prisma to this config file.

---

## Supabase Integration

### `lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseKey = supabaseServiceRoleKey ?? supabaseAnonKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing");
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
```

**Why prefer service role?**

When running server-side (Server Actions, Route Handlers), we use the service-role key so Prisma can bypass RLS and read/write freely. Session cookies are still read to identify the user via `supabase.auth.getUser()`.

### `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase anon key is missing");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
```

Used in Client Components to interact with Supabase Auth directly from the browser. This client is subject to RLS policies.

### `lib/supabase/service.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

let cachedAdminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdminClient() {
  if (cachedAdminClient) return cachedAdminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase service role key is missing");
  }

  cachedAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  return cachedAdminClient;
}
```

Provides a cached admin client for background jobs or scripts that need full database access without RLS.

---

## TMDB API Layer

### `lib/tmdb/fetcher.ts`

This is the **low-level HTTP wrapper** for TMDB.

```typescript
import "server-only";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function fetchTmdb<T>(endpoint: string, options: FetchTmdbOptions = {}): Promise<T> {
  const apiKey = ensureApiKey();
  const url = new URL(`${TMDB_BASE_URL}/${endpoint.replace(/^\/+/, "")}`);

  appendSearchParams(url, options.searchParams);

  const defaultHeaders: HeadersInit = { accept: "application/json" };

  if (isV4Token(apiKey)) {
    defaultHeaders["Authorization"] = `Bearer ${apiKey}`;
  } else {
    url.searchParams.set("api_key", apiKey);
  }

  const headers = mergeHeaders(defaultHeaders, options.init?.headers);
  const res = await fetch(url.toString(), { ...options.init, headers });

  if (!res.ok) {
    const body = await readBody(res);
    throw new Error(`TMDB request failed (${res.status}): ${body}`);
  }

  return (await res.json()) as T;
}
```

**Helper Functions:**

| Function | Purpose |
|----------|---------|
| `ensureApiKey()` | Throws if `TMDB_API_KEY` is missing. |
| `isV4Token(key)` | Detects Bearer-style v4 tokens vs. v3 query-string keys. |
| `mergeHeaders(base, override)` | Combines default headers with caller overrides. |
| `appendSearchParams(url, params)` | Safely appends non-null query params. |
| `readBody(res)` | Reads response text for error messages. |

**Why `"server-only"`?**  
The import at the top ensures this module can only run on the server—preventing accidental exposure of `TMDB_API_KEY` to the client bundle.

### `lib/tmdb.ts`

High-level domain functions built on `fetchTmdb`:

```typescript
export async function getPopularMovies(page = "1") {
  return fetchTmdb<MovieListResponse>("movie/popular", { searchParams: { page } });
}

export async function getTrendingMovies(window = "day") {
  return fetchTmdb<MovieListResponse>(`trending/movie/${window}`);
}

export async function getTopRatedMovies(page = "1") { /* ... */ }
export async function getUpcomingMovies(page = "1") { /* ... */ }
export async function getMovieDetails(id: string) { /* ... */ }
export async function getMovieRecommendations(id: string) { /* ... */ }
```

**Utility Functions:**

| Function | Purpose |
|----------|---------|
| `formatYear(movie)` | Extracts year from `release_date` or `first_air_date`. |
| `posterUrl(path, size)` | Constructs full TMDB image URL with specified size variant. |

---

## Server Actions – Watchlist

### `app/actions/watchlist.ts`

This file defines **Server Actions** that bridge Supabase Auth and Prisma persistence.

#### Authentication Helpers

```typescript
async function requireSupabaseUser(): Promise<SupabaseUser> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("You must be signed in to manage your watchlist");

  return data.user;
}
```

Enforces that a valid session exists before any mutation.

```typescript
async function syncUserRecord(user: SupabaseUser) {
  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email },
    update: { email: user.email },
  });
}
```

Ensures the Prisma `User` table mirrors Supabase Auth—runs on every mutation so we always have a valid FK target.

#### Validation Helpers

| Function | Purpose |
|----------|---------|
| `coerceTmdbId(id)` | Parses string/number to positive int, throws on invalid. |
| `sanitizeNotes(notes)` | Trims, enforces max length (2000 chars). |
| `sanitizeCategories(categories)` | Trims, filters blanks, caps at 12 entries. |

#### CRUD Actions

| Action | Description |
|--------|-------------|
| `saveWatchlistItem(input)` | Upserts a watchlist entry with full metadata. |
| `updateWatchlistMeta(input)` | Partial update for notes, categories, or favorite flag. |
| `removeWatchlistItem(input)` | Deletes entry; swallows "not found" errors gracefully. |
| `getWatchlistStatus(input)` | Returns current user + item state; used by `WatchlistPanel`. |

#### Revalidation

```typescript
function revalidateWatchlistViews(tmdbId: number) {
  revalidatePath("/profile");
  revalidatePath(`/movie/${tmdbId}`);
}
```

Busts Next.js ISR cache for affected pages after any mutation.

#### Error Resilience

```typescript
function isRecoverableAuthError(error: AuthError) {
  return (error.status ?? 0) >= 500 || /session/i.test(error.message);
}

function isRecoverableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = getNodeErrorCode(error);
  if (code && ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "ENOTFOUND"].includes(code)) {
    return true;
  }
  return /fetch failed/i.test(error.message);
}
```

`getWatchlistStatus` catches transient errors and returns an empty status instead of crashing the movie detail page.

---

## Pages & Routing

### `app/layout.tsx`

Root layout providing:

- Global CSS import.
- Geist font configuration.
- Persistent header with nav links (Browse, Profile).
- Footer with attribution.

### `app/page.tsx` – Home

```typescript
export const revalidate = 300; // ISR: regenerate every 5 minutes

export default async function Home() {
  const [popular, trending, upcoming] = await Promise.all([
    getPopularMovies(),
    getTrendingMovies(),
    getUpcomingMovies(),
  ]);

  const feature = trending.results[0] ?? popular.results[0];

  return (
    <div className="space-y-12">
      {feature && <Hero feature={feature} />}
      <section>...</section>
    </div>
  );
}
```

Fetches three TMDB lists in parallel and renders:
1. A hero banner with the top trending movie.
2. Three grids: Popular, Trending, Upcoming.

### `app/browse/page.tsx`

Similar structure but focuses on catalog exploration (Trending Week, Popular, Top Rated).

### `app/movie/[id]/page.tsx`

Dynamic route for movie details:

```typescript
export const dynamic = "force-dynamic";

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  let movie;
  try {
    movie = await getMovieDetails(id);
  } catch {
    notFound();
  }

  if (!movie) notFound();

  const recommendations = await getMovieRecommendations(id);
  // ...render poster, backdrop, metadata, WatchlistPanel, recommendations
}
```

**Key Points:**

- `force-dynamic` ensures fresh TMDB data on every request.
- Gracefully calls `notFound()` on invalid TMDB IDs.
- Embeds `<WatchlistPanel>` which is a Client Component for interactive watchlist management.

---

## Components

### `components/movie-card.tsx`

Renders a single movie poster card with:

- Poster image (lazy-loaded, hover scale effect).
- Star rating badge overlay.
- Title, year, and optional media type badge.
- Links to `/movie/[id]`.

### `components/movie-grid.tsx`

Responsive CSS grid wrapper that maps an array of `MovieSummary` to `<MovieCard>` instances. Supports `priorityCount` for LCP optimization.

### `components/section-heading.tsx`

Reusable heading with optional description and action slot.

### `components/watchlist-panel.tsx`

**Client Component** (`"use client"`) that:

1. On mount, calls `getWatchlistStatus` Server Action to check auth and existing item.
2. Renders auth-aware UI: signed-out prompt vs. full form.
3. Provides inputs for notes, categories, and favorite toggle.
4. Calls `saveWatchlistItem`, `updateWatchlistMeta`, or `removeWatchlistItem` on user interaction.
5. Uses `useTransition` for non-blocking optimistic updates with loading spinners.

### `components/ui/badge.tsx`

Minimal badge component with `default` (filled) and `outline` variants, built with `cn()` utility for conditional Tailwind classes.

---

## Utility Modules

### `lib/utils.ts`

```typescript
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Standard pattern for merging Tailwind classes without conflicts.

### `lib/http.ts`

```typescript
export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
```

Resolves the application's base URL in any environment (browser, server, Vercel).

### `lib/watchlist.ts`

```typescript
import "server-only";
import { prisma } from "./prisma";

export async function getWatchlistItemForUser(userId: string, tmdbId: number) {
  if (!userId) return null;

  return prisma.watchlistItem.findUnique({
    where: { userId_tmdbId: { userId, tmdbId } },
  });
}
```

Shared helper for Prisma reads—can be reused in profile page or revalidation logic.

---

## API Routes

### `app/api/tmdb/[...segments]/route.ts`

Edge-cached proxy for TMDB requests:

```typescript
export const runtime = "edge";
export const revalidate = 3600;

function mapSegmentsToPath(segments: string[], searchParams: URLSearchParams): string | null {
  // Maps user-friendly paths like /api/tmdb/popular → movie/popular
}

export async function GET(request: Request, context) {
  const path = mapSegmentsToPath(params.segments, searchParams);
  if (!path) return NextResponse.json({ error: "Unsupported TMDB route" }, { status: 400 });

  try {
    const payload = await fetchTmdb(path, { /* cache settings */ });
    return NextResponse.json(payload, { headers: { "Cache-Control": `public, s-maxage=${CACHE_SECONDS}` } });
  } catch (error) {
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
```

**Why a proxy?**

- Hides `TMDB_API_KEY` from client.
- Enables edge caching for reduced latency and TMDB rate-limit protection.
- Provides a stable internal API surface (`/api/tmdb/popular`) independent of TMDB URL structure.

---

## Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | Server | Prisma connection string (Supabase Postgres pooler). |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/public key for browser auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Bypasses RLS for Prisma server actions (optional). |
| `TMDB_API_KEY` | Server | TMDB v3 or v4 API token. |
| `NEXT_PUBLIC_APP_URL` | Public | Canonical app URL for server-side fetches (optional). |
| `TMDB_CACHE_SECONDS` | Server | Custom cache duration for TMDB API proxy (optional, default: 3600). |

---

## Error Handling & Resilience

1. **TMDB fetch failures** – `fetchTmdb` throws with status and body; callers (pages, API routes) catch and show fallback UI or 502.

2. **Supabase auth errors** – `getWatchlistStatus` detects 5xx or session-related errors and returns empty status instead of crashing.

3. **Network transient errors** – `isRecoverableNetworkError` checks for `ETIMEDOUT`, `ECONNRESET`, etc., logging warnings without throwing.

4. **Invalid TMDB IDs** – Movie detail page catches fetch errors and calls `notFound()` for a clean 404.

5. **Prisma "not found" on delete** – `removeWatchlistItem` swallows `P2025` errors so double-deletes are idempotent.

---

## Caching & Revalidation

| Layer | Strategy |
|-------|----------|
| Home / Browse pages | `export const revalidate = 300` (ISR every 5 min). |
| Movie detail page | `export const dynamic = "force-dynamic"` (always fresh). |
| TMDB API proxy | Edge cache with `s-maxage=3600` (1 hour). |
| Watchlist mutations | `revalidatePath()` busts ISR cache for `/profile` and `/movie/[id]`. |

---

## Summary

This project demonstrates a production-grade architecture combining:

- **React Server Components** for zero-JS data fetching.
- **Server Actions** for type-safe mutations without custom API routes.
- **Supabase Auth + Prisma** for secure, scalable user data.
- **Edge caching** for performant external API proxying.
- **Graceful error handling** to keep pages functional under partial failures.

The codebase is intentionally modular—each `lib/` file handles a single concern, components are reusable, and environment configuration is centralized. This makes it straightforward to extend (e.g., add TV shows, implement search, build out the profile dashboard) without touching unrelated code.
