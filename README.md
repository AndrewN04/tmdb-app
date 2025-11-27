## Project Goal

TMDB Watchlist is a TMDB-powered movie discovery site that lets users browse trending titles and maintain a Supabase-backed watchlist (notes, favorites, categories) through Prisma.

## Creation & Stack

- **Next.js 16 App Router** for UI, Edge route handlers, and ISR caching.
- **Supabase Auth + Postgres** with Prisma 7 for persistence.
- **TMDB API proxy** (`app/api/tmdb/[...segments]/route.ts`) handles API keys and caching.
- **Tailwind CSS + lucide-react** for styling and icons.

## Environment

Create a `.env` and supply the Supabase + TMDB secrets:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DATABASE_URL=
TMDB_API_KEY=
```

Publishable keys stay client-side; the secret key and database URL are server-only.

## Development

```bash
npm install
npm run dev
```

Run `npx prisma migrate deploy` before starting if the database is new. Tests/linting: `npm run lint`.
