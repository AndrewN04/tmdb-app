# Route Map

## Route Table

| Route | Visibility | Purpose | Key UI Sections | Data Requirements |
|-------|------------|---------|-----------------|-------------------|
| `/` | Public | Landing / Discovery | Hero, Carousel Rows (Popular/Trending) | TMDB Trending, TMDB Popular (Movie/TV) |
| `/movies` | Public | Browse Movies | Filter Sidebar, Movie Grid, Pagination | TMDB Discover Movie, Genres |
| `/tv` | Public | Browse TV Shows | Filter Sidebar, TV Grid, Pagination | TMDB Discover TV, Genres |
| `/movie/[id]` | Public | Movie Details | Header info, Cast, Reviews, Recommendations | TMDB Movie Details, Credits, Similar, Convex Reviews |
| `/tv/[id]` | Public | TV Details | Header info, Seasons, Cast, Reviews, Recommendations | TMDB TV Details, Credits, Similar, Convex Reviews |
| `/auth/sign-in` | Public (Guest) | Login | Email/Pass Form, OAuth Providers | Better Auth |
| `/auth/sign-up` | Public (Guest) | Registration | Email/Pass Form, OAuth Providers | Better Auth |
| `/auth/forgot-password` | Public | Recovery Request | Email Input | Better Auth |
| `/auth/reset-password` | Public | Password Reset | New Password Input | Better Auth (Token validation) |
| `/profile` | Protected | User Library & Info | User Info, Tabbed Lists (Favorites/Watchlist) | Convex User Data, Saved Items (joined with TMDB data) |

## Authentication Actions

Specific actions that require an authenticated session (handled via Better Auth middleware or client-side checks):

- **Add/Remove Favorite:** Toggle button on details/card.
- **Add/Remove Watchlist:** Toggle button on details/card.
- **Post Review:** Form submission on details page.
- **Delete Review:** Trash icon on user's own reviews.
- **View Profile:** Accessing `/profile` route.

## Navigation Structure

1. **Header (Global)**
   - Logo -> `/`
   - "Movies" -> `/movies`
   - "TV Shows" -> `/tv`
   - Search -> `/movie/[id]` or `/tv/[id]` (direct nav)
   - **Unauth:**
     - "Sign In" -> `/auth/sign-in`
     - "Sign Up" -> `/auth/sign-up`
   - **Auth:**
     - Avatar/Menu -> Profile (`/profile`), Sign Out

2. **Footer (Global)**
   - Links to `/`, `/movies`, `/tv`
   - Copyright info

3. **In-Page Nav**
   - "View All" on Landing Page -> `/movies` or `/tv`
   - Movie/TV Card Click -> `/[type]/[id]`
   - Person Card Click -> `N/A` (Scope: Cast details page out of scope for now, usually just list)
