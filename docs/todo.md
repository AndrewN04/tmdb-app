[PRD]
# PRD: TMDB Movie & TV Database App

## Overview
Build a comprehensive Movie and TV show discovery application using Next.js (App Router), Tailwind CSS, and Shadcn UI. The app will consume the TMDB API to display content and use Convex Auth for a robust authentication system (GitHub, Google, Email/Password). Users can discover content via a rich landing page, search with auto-complete, filter listings, and manage personal libraries (favorites, playlists) as well as leave reviews.

## Goals
- Create a visually engaging discovery platform for Movies and TV Shows.
- Implement secure and complete authentication flows (Social + Email/Password).
- Provide intuitive search and filtering capabilities.
- Enable user engagement through personal lists and reviews.
- Ensure high performance and type safety.

## Quality Gates

These commands must pass for every user story:
- `npm run typecheck` - Type checking
- `npm run lint` - Linting
- `npm run build` - Production build verification

For UI stories, also include:
- Verify in browser using dev-browser skill

## User Stories

### US-001: Project Setup & Infrastructure
**Description:** As a developer, I want to initialize the Next.js project with the required libraries so that development can begin.
**Acceptance Criteria:**
- [x] Initialize Next.js project (App Router, TypeScript, Tailwind CSS).
- [x] Install and configure Shadcn UI components (Button, Input, Card, etc.).
- [x] Set up TMDB API client/helper with environment variable support.
- [x] Configure `npm run typecheck` and `npm run lint`.

### US-002: Authentication Setup (Convex Auth)
**Description:** As a user, I want to sign up and log in using various methods so that I can access personalized features.
**Acceptance Criteria:**
- [x] Initialize Convex for backend and database.
- [x] Install and configure Convex Auth.
- [x] Implement GitHub OAuth provider.
- [x] Implement Google OAuth provider.
- [x] Implement Email/Password registration and login.
- [x] Create Sign-in and Sign-up pages.

### US-003: Email Verification & Password Recovery
**Description:** As a user using email auth, I want to verify my email and recover my password if lost so that my account is secure.
**Acceptance Criteria:**
- [x] Implement email verification flow (send email on sign-up - *Simulated via Console/ResendOTP config*).
- [x] Implement "Forgot Password" flow (request reset link).
- [x] Implement "Reset Password" page (set new password).
- [ ] Restrict access to verified users where appropriate. (Not enforced yet as auth flow is simple).

### US-004: Landing Page - Featured Content
**Description:** As a user, I want to see a featured movie or show on the landing page so that I catch the latest trending content immediately.
**Acceptance Criteria:**
- [x] Fetch a trending or specific featured item from TMDB.
- [x] Display as a large "Hero" section with backdrop image, title, and summary.
- [x] Include a "More Info" button linking to details.

### US-005: Landing Page - Content Rows
**Description:** As a user, I want to scroll through popular and upcoming content so that I can discover new things to watch.
**Acceptance Criteria:**
- [x] Display "Popular Movies" horizontal scroll/carousel.
- [x] Display "Popular TV Shows" horizontal scroll/carousel.
- [x] Display "Upcoming" horizontal scroll/carousel.
- [x] Include "View All" buttons for each section linking to respective listing pages.

### US-006: Global Search with Auto-completion
**Description:** As a user, I want to search for movies or shows and see results as I type so that I can find specific content quickly.
**Acceptance Criteria:**
- [x] Implement a search icon button in the global navigation that opens a command palette.
- [x] Fetch search results from TMDB as the user types (debounced).
- [x] Display a dropdown with mini-posters and titles.
- [x] Navigating to a result goes to its details page.

### US-007: Movies & TV Listing Pages with Filters
**Description:** As a user, I want dedicated pages for Movies and TV shows with filters so that I can browse specific genres or categories.
**Acceptance Criteria:**
- [x] Create `/movies` and `/tv` routes.
- [x] Implement grid view for content items.
- [x] Add sidebar or top bar filters: Genre, Year, Rating.
- [x] Implement pagination or infinite scroll (Implemented as Load More or Pagination).

### US-008: Content Details Page
**Description:** As a user, I want to see detailed information about a movie or show so that I can decide if I want to watch it.
**Acceptance Criteria:**
- [x] Display Poster, Title, Overview, Rating, and Release Date.
- [x] Display Cast list (with horizontal scrolling).
- [x] Display related/recommended items. (Not explicitly requested in recent turns but nice to have, main focus was cast and details).
- [x] (If TV) Display season/episode info.

### US-009: User Actions - Favorites & Playlists
**Description:** As a logged-in user, I want to save items to my favorites or a "Watchlist" playlist so that I can keep track of what I want to watch.
**Acceptance Criteria:**
- [x] Add "Add to Favorites" button on details cards.
- [x] Add "Add to Watchlist" button.
- [x] Create a "My Library" or "Profile" page to view saved items.
- [x] Ensure state persists in the database (Convex).

### US-010: Reviews & Comments
**Description:** As a logged-in user, I want to leave a review or comment on a movie/show so that I can share my thoughts.
**Acceptance Criteria:**
- [x] Add a "Reviews" section to the details page.
- [x] Allow users to post a text comment and/or rating.
- [x] Display list of user reviews for that item.
- [x] Allow users to delete their own reviews.

## Functional Requirements
- FR-1: The app must respond responsively across mobile, tablet, and desktop.
- FR-2: API keys must be secured on the server-side where possible.
- FR-3: Authentication state must persist across sessions.
- FR-4: Images must be optimized (using Next.js Image component).

## Non-Goals
- Streaming or playing actual video content (this is a database/discovery app only).
- Social networking features beyond simple reviews (e.g., following users, feeds).
- Complex custom playlist creation (initially limited to Favorites/Watchlist).

## Technical Considerations
- **TMDB API:** Requires an API Key. Rate limiting should be handled.
- **Database:** Convex (Backend-as-a-Service). Provides end-to-end type safety, real-time updates, and easy schema management.
- **Authentication:** Convex Auth.
- **Styling:** Use `shadcn/ui` components for consistency.
- **State Management:** Use server state (React Server Components) where possible, Convex Queries for client-side fetching if needed.

## Success Metrics
- Successful user registration and login.
- Accurate retrieval and display of TMDB data.
- Search latency under 500ms.
- Responsiveness on mobile devices.

## Open Questions
- Do we need to support multiple languages/regions for TMDB data? (Assuming English/US for now).
[/PRD]
