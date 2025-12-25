# TMDB Watchlist – Project TODO

## Completed

- [x] **Rename Supabase env vars** – Switched to explicit `ANON_KEY` / `SERVICE_ROLE_KEY` naming
- [x] **Add Vitest testing infrastructure** – 231 unit tests covering lib utilities, components, and actions
- [x] **Update @supabase/ssr to 0.8.0** – Migrated to new `getAll`/`setAll` cookie API
- [x] **Update @types/node to v24** – Matches Node.js 24 runtime
- [x] **Create ARCHITECTURE.md** – Comprehensive codebase documentation
- [x] **Add Supabase OAuth auth** – GitHub and Google OAuth with avatar display, protected routes
- [x] **Build profile dashboard** – Server component with auth redirect, watchlist display with favorites/notes
- [x] **Create watchlist query helpers** – `getUserWatchlist()` action for profile page queries
- [x] **Run quality gates** – All lint, build, and tests pass (Dec 2024)
- [x] **Update dependencies (Dec 2024)** – Updated Next.js 16.1.1, React 19.2.3, lucide-react 0.562.0, @supabase/supabase-js 2.89.0, and other packages
- [x] **Upgrade to Prisma 7** – Migrated to new config-based architecture with driver adapters
- [x] **Remove Cloudflare Turnstile** – Removed challenge page, Turnstile API routes, and captcha from auth forms (Dec 2024)

## In Progress

- [ ] **Document launch/debug paths**
  - Update README.md with auth setup instructions
  - Add Prisma migrate notes
  - Include start/debug instructions for VS Code

## Pending

- [ ] **Add profile editing features**
  - Edit/delete watchlist items from profile
  - Category filtering and badges
  - Sorting options (date, title, favorites)

## Future Ideas

- [ ] Add search functionality
- [ ] Implement TV show support
- [ ] Add social sharing features
- [ ] Create mobile-responsive improvements
- [ ] Add pagination to watchlist

## Package Status (as of Dec 2024)

| Package                  | Current | Latest | Notes                 |
|--------------------------|---------|--------|-----------------------|
| next                     | 16.1.1  | 16.1.1 | ✅ Up to date         |
| react                    | 19.2.3  | 19.2.3 | ✅ Up to date         |
| @supabase/ssr            | 0.8.0   | 0.8.0  | ✅ Up to date         |
| prisma / @prisma/client  | 7.2.0   | 7.2.0  | ✅ Up to date         |
| @types/node              | 24.10.4 | 25.0.3 | ⚠️ Node 25 not GA yet |

## Prisma 7 Migration Notes

The project was upgraded to Prisma 7 with the following changes:

1. **Schema (`prisma/schema.prisma`)**: Generator changed from `prisma-client-js` to `prisma-client` with mandatory `output` field
2. **Config (`prisma.config.ts`)**: New config file for CLI operations (migrations) with datasource URL
3. **Driver Adapter**: Using `@prisma/adapter-pg` for PostgreSQL connections
4. **Imports**: Changed from `@prisma/client` to `@/generated/prisma/client`
5. **Generated Client**: Output at `./generated/prisma/`
