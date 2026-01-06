# TMDB Chart – Project TODO

## Completed

- [x] **Rename Supabase env vars** – Switched to explicit `ANON_KEY` / `SERVICE_ROLE_KEY` naming
- [x] **Add Vitest testing infrastructure** – 237 unit tests covering lib utilities, components, and actions
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
- [x] **Codebase modernization** – Removed unused SWR, boilerplate SVGs, updated tsconfig to ES2022

---

## 🎨 Major Redesign Project (Dec)

### Overview

Complete UI overhaul to match new design system, expand from movies-only to include TV Shows, implement search and filtering functionality.

---

### Phase 1: Foundation & Data Layer ✅ COMPLETE

- [x] **Extend TMDB API layer for TV Shows**
  - Added `getTrendingTV()`, `getPopularTV()`, `getTopRatedTV()`, `getOnTheAirTV()`, `getAiringTodayTV()` functions
  - Added `getTVDetails(id)` and `getTVRecommendations(id)`, `getSimilarTV(id)` functions
  - Created unified `MediaSummary` type and `TVShowDetail` TypeScript interface
  - Added `getGenres(type)`, `getMovieGenres()`, `getTVGenres()` for filter options
  - Added `discoverMovies()` and `discoverTV()` for advanced filtering

- [x] **Add Search API functions**
  - Implemented `searchMulti(query)` for combined movie/TV search
  - Implemented `searchMovies(query, filters)` with genre/date filtering
  - Implemented `searchTV(query, filters)` with genre/date filtering
  - Added `SearchFilters` type for flexible filter parameters

- [x] **Update Prisma schema for TV Shows**
  - Updated unique constraint to `@@unique([userId, tmdbId, mediaType])` to support both movies and TV
  - Updated all watchlist actions to require `mediaType` parameter
  - Added `getUserWatchlist()` filtering by `mediaType`, `sortBy`, `favoritesOnly`
  - Added `getWatchlistCounts()` for stats by media type
  - Updated `WatchlistPanel` component and all tests

---

### Phase 2: Navigation & Layout

- [x] **Redesign header/navigation**
  - [x] Add "Movies" and "TV Shows" nav links
  - [x] Add search bar with icon in header
  - [x] Update logo/branding style
  - [x] Add "Login" button styling (purple/gradient)
  - [x] Responsive mobile menu

- [x] **Redesign footer**
  - [x] Display tech stack used for the project

---

### Phase 3: Home Page Redesign

- [x] **New hero section**
  - [x] Large backdrop image with gradient overlay
  - [x] Genre badges (e.g., "SCI-FI"), Year, Rating badge
  - [x] Large gradient title text
  - [x] Movie/show description
  - [x] "Watch Trailer" and "More Info" buttons

- [x] **Redesigned content sections**
  - [x] "Trending Now" with horizontal scroll
  - [x] "What's Popular" section
  - [x] "Coming Soon" with release date badges
  - [x] Section headers with "View All" links
  - [x] Purple accent bar on section titles

- [x] **Updated media cards**
  - [x] Rating badge overlay (top-right)
  - [x] Title and genre tags below poster
  - [x] Hover effects and transitions

---

### Phase 4: Browse Pages with Filters ✅ COMPLETE

- [x] **Create Movies browse page (`/movies`)**
  - Left sidebar with filters
  - Sort dropdown (Popularity, Rating, Release Date)
  - Genre filter chips (multi-select)
  - Release date range picker
  - "Reset Filters" button
  - Grid of movie cards with ratings
  - "Load More" pagination button

- [x] **Create TV Shows browse page (`/tv`)**
  - Same filter sidebar pattern
  - TV-specific genres
  - Air date filters
  - Grid of TV show cards

- [x] **Trending toggle component**
  - "Today" / "This Week" toggle buttons
  - Updates content dynamically

---

### Phase 5: Search Functionality ✅ COMPLETE

- [x] **Global search component**
  - Search input in header
  - Dropdown with instant results
  - Categories: Movies, TV Shows
  - "View all results" link

- [x] **Search results page (`/search`)**
  - Query parameter handling
  - Tabbed results (All, Movies, TV Shows)
  - Pagination with Load More button

---

### Phase 6: Detail Pages Redesign

- [ ] **Movie detail page redesign**
  - Two-column layout (info left, poster right)
  - Backdrop with blur effect
  - Title, tagline, metadata row (date, runtime, rating)
  - "Play Trailer" button
  - Genre badges
  - Overview section
  - Credits section (Director, Screenplay, etc.)
  - Poster with circular rating badge
  - Enhanced "Your Activity" panel
  - "You May Also Like" recommendations

- [ ] **TV Show detail page (`/tv/[id]`)**
  - Similar layout to movies
  - Season/episode count
  - Network/streaming info
  - Season selector (future enhancement)

---

### Phase 7: Profile Dashboard Redesign

- [ ] **Sidebar navigation**
  - User avatar and name display
  - "Edit Profile" button
  - Nav items: Dashboard, Favorites, Watchlist, History, Reviews
  - Badge counts on nav items

- [ ] **Stats cards row**
  - Total Saved (with trend indicator)
  - Favorites count
  - Watched progress (percentage bar)
  - To Watch count

- [ ] **Content filtering**
  - Filter tabs: All Items, Movies, TV Shows, genre chips
  - Sort dropdown (Date Added, Title, Rating)

- [ ] **Enhanced watchlist cards**
  - Poster, title, year, genre, runtime
  - Note preview with "Add Note" button
  - Status indicator (Watched, Plan to Watch, Rewatching)
  - Pagination

---

### Phase 8: Auth Pages Redesign

- [ ] **Sign In page**
  - Bokeh/bubble animated background
  - Centered card with border
  - "Unlock the Universe" heading
  - Styled form inputs with icons
  - Purple gradient "Sign In" button
  - Divider with "Or continue with"
  - Google and GitHub OAuth buttons
  - "Create an account" link

- [ ] **Sign Up page**
  - Same bokeh background
  - Password requirements checklist (visual checkmarks)
  - Terms of Service agreement text
  - "Create Account" button

- [ ] **Reset Password page**
  - Blurred movie posters background
  - Password strength meter (visual bar)
  - Confirm password field
  - "Update Password" button

---

### Phase 9: Shared Components

- [ ] **Media card component** (unified for movies/TV)
  - Configurable for different layouts
  - Rating badge variants (percentage, star)
  - Genre chips
  - Release date badge option

- [ ] **Filter sidebar component**
  - Reusable across browse pages
  - Genre chips with selection state
  - Date range picker
  - Sort dropdown

- [ ] **Rating circle component**
  - Circular progress with percentage
  - Color coding (green/yellow/red)

- [ ] **Section header component**
  - Title with accent bar
  - Optional "View All" link
  - Optional toggle buttons

---

### Phase 10: Polish & Animations

- [ ] **Micro-interactions**
  - Button hover effects
  - Card hover scale/shadow
  - Page transitions
  - Loading skeletons

- [ ] **Background effects**
  - Bokeh/bubble effect for auth pages
  - Gradient overlays on hero sections
  - Blur effects on backdrops

---

## Design System Reference

### Colors

- Primary Purple: `#6366f1` (indigo-500)
- Background: `#020617` (slate-950)
- Card Background: `rgba(0,0,0,0.4)` with border `rgba(255,255,255,0.1)`
- Accent Yellow: For ratings/favorites
- Text: White with opacity variants (100%, 80%, 60%, 40%)

### Typography

- Headings: Bold, large sizes
- Gradient text for hero titles
- Uppercase tracking for labels

### Components

- Rounded corners: `rounded-lg` to `rounded-2xl`
- Borders: `border-white/10`
- Buttons: Solid purple gradient or ghost with border

---

## Package Status (as of Dec 2024)

| Package                 | Current | Latest | Notes                 |
| ----------------------- | ------- | ------ | --------------------- |
| next                    | 16.1.1  | 16.1.1 | ✅ Up to date         |
| react                   | 19.2.3  | 19.2.3 | ✅ Up to date         |
| @supabase/ssr           | 0.8.0   | 0.8.0  | ✅ Up to date         |
| prisma / @prisma/client | 7.2.0   | 7.2.0  | ✅ Up to date         |
| @types/node             | 24.10.4 | 25.0.3 | ⚠️ Node 25 not GA yet |

---

## Implementation Order (Recommended)

1. **Phase 1** - Data layer (TV shows, search APIs)
2. **Phase 2** - Navigation redesign
3. **Phase 8** - Auth pages (quick visual win)
4. **Phase 3** - Home page redesign
5. **Phase 9** - Shared components
6. **Phase 6** - Detail pages
7. **Phase 4** - Browse pages with filters
8. **Phase 5** - Search functionality
9. **Phase 7** - Profile dashboard
10. **Phase 10** - Polish & animations

---

## Notes

- All new pages should follow the established dark theme
- Maintain accessibility standards (contrast, focus states)
- Mobile-first responsive design
- Reuse components across Movies/TV where possible
