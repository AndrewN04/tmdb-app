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
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
TMDB_API_KEY=
```

The anon key stays client-side; the service-role key and database URL are server-only and power the privileged server actions.

## Development

```bash
npm install
npm run dev
```

Run `npx prisma migrate deploy` before starting if the database is new. Tests/linting: `npm run lint`.
