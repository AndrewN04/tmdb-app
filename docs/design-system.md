# Design System & Component Inventory

## App-Wide Design Rules

### Typography
- **Font Family:** Inter (via `next/font/google`) for UI, sans-serif fallback.
- **Scale:**
  - `h1` (Hero Titles): 2.5rem - 3.75rem (Mobile -> Desktop), bold/extrabold.
  - `h2` (Section Headers): 1.5rem - 2rem, bold.
  - `h3` (Card Titles): 1rem - 1.25rem, semibold.
  - `body`: 0.875rem - 1rem, regular/medium.
  - `small`: 0.75rem, regular/medium (metadata like dates, ratings).
- **Line Height:** 1.5 for body, 1.2 for headings.

### Spacing
- **Base Unit:** 4px (Tailwind scale).
- **Container Padding:** `px-4` (16px) mobile, `px-6` tablet, `px-8` desktop.
- **Section Spacing:** `py-8` to `py-16`.
- **Component Gap:** `gap-4` (16px) standard, `gap-2` (8px) for tight groups.

### Layout
- **Max Width:** `max-w-7xl` (1280px) for main container content.
- **Grid:** 
  - Mobile: 1 col
  - Tablet: 2-3 cols
  - Desktop: 4-5 cols
- **Z-Index:**
  - `z-50`: Modals, dropdowns, sticky nav.
  - `z-40`: Overlays.
  - `z-10`: Interactive elements over backgrounds.

### States
- **Empty:** "No results found." with a clear icon and suggested action (e.g., "Reset filters").
- **Loading:** Skeleton loaders mirroring the content shape (e.g., card aspect ratio).
- **Error:** Red-500 text/border with friendly message and "Try Again" button.

### Skeletons
- `HeroSkeleton`: Large rectangle + title/text block.
- `CardSkeleton`: Poster aspect ratio (2:3) + 2 text lines.
- `RowSkeleton`: Horizontal list of CardSkeletons.

---

## Navigation Spec

### Global Navigation Bar
- **Position:** Sticky top, `backdrop-blur-md`, `bg-background/80`.
- **Logo:** Left-aligned, "TMDB Improved" text or icon. Links to `/`.
- **Search:** 
  - Center/Right-aligned.
  - Input with search icon.
  - **Behavior:** Focus expands width (mobile). Typing triggers autocomplete dropdown.
- **Auth/Profile:**
  - **Guest:** "Sign In" (Ghost), "Sign Up" (Primary).
  - **Auth:** Avatar circle -> Dropdown Menu (Profile, Settings, Sign Out).
- **Links:** Movies (`/movies`), TV Shows (`/tv`).

---

## Component Inventory

### 1. Hero (Featured Trending Item)
- **Role:** Highlight top content on landing page.
- **Content:** Backdrop image (dimmed), Title, Overview (truncated), "More Info" button (Primary), "Add to List" (Secondary/Icon).
- **Behavior:** Static or slow fade carousel. Button clicks nav to Details.

### 2. Horizontal Carousel Row
- **Role:** Display list of items (Popular, Upcoming).
- **Components:** Section Title ("Popular Movies") + "View All" link (right).
- **Content:** Horizontal scroll container with snap points.
- **Behavior:** Scroll buttons (chevron left/right) on desktop hover. Touch scroll on mobile.

### 3. Media Card
- **Role:** Standard unit for Movie/TV show.
- **Content:** Poster image (aspect ratio 2:3), Title, Release Year, Rating badge (star icon).
- **Hover:** Slight scale up, show "Add to Favorites" action button overlay.
- **Click:** Navigates to `/movie/[id]` or `/tv/[id]`.

### 4. Search Autocomplete Dropdown
- **Role:** Quick navigation from global search.
- **Content:** List of `SearchItem` (Thumbnail + Title + Year).
- **Behavior:**
  - Debounced API fetch (300ms).
  - **Keyboard:** Arrow Down/Up to select, Enter to go. Escape to close.
  - **Loading:** Spinner in dropdown.
  - **Empty:** "No results for '[query]'"

### 5. Filter Bar
- **Role:** Refine listings on `/movies` or `/tv`.
- **Components:**
  - **Genre:** Multi-select Combobox or Pill list.
  - **Year:** Range slider or Select.
  - **Rating:** "GTE" (Greater Than or Equal) Select (5+, 6+, etc.).
- **Behavior:** Updates URL query params. Triggers re-fetch. "Clear All" button.

### 6. Pagination / Infinite Scroll
- **Role:** Load more content.
- **Behavior:** Infinite scroll via `IntersectionObserver` on a "Load More" trigger element at bottom of list.
- **Fallback:** "Load More" button if auto-load fails or for specific UX preference.

### 7. Details Header
- **Role:** Primary info on Details page.
- **Content:** Backdrop (blurred/dimmed), Poster (left), Text Content (Title, Tagline, Genres, Rating, Overview, Director/Creator).
- **Actions:** "Add to Favorites", "Add to Watchlist", "Rate" (if signed in).

### 8. Cast List
- **Role:** Show actors.
- **Content:** Horizontal scroll of `PersonCard` (Profile Image + Name + Character).
- **Behavior:** Similar to Carousel Row but for people.

### 9. Reviews Section
- **Role:** User Generated Content.
- **Components:**
  - **ReviewList:** List of `ReviewCard` (User Avatar, Name, Rating, Date, Text content).
  - **ReviewForm:** Textarea + Rating Star input + Submit.
- **Permissions:** 
  - Form visible only if logged in.
  - Delete button visible only on own reviews.

### 10. Favorites/Watchlist Buttons
- **Role:** Toggle saved state.
- **States:**
  - **Saved:** Filled icon (Heart/Bookmark), Primary color.
  - **Unsaved:** Outline icon.
  - **Loading:** Spinner/Disabled opacity.
  - **Unauth:** Redirect to login on click.

---

## Responsive Rules

- **Mobile (< 640px):**
  - Navigation: Hamburger menu for links.
  - Hero: Stacked layout (Image top, text bottom).
  - Grids: 1-2 columns.
  - Filters: Collapsible "Filter" drawer/modal.
- **Tablet (640px - 1024px):**
  - Grids: 3 columns.
  - Navigation: Visible links.
- **Desktop (> 1024px):**
  - Grids: 4-5 columns.
  - Hero: Side-by-side (Text left, Image right or background).
  - Filters: Sidebar or Sticky top bar.

---

## Accessibility Requirements

- **Global:**
  - `prefers-reduced-motion`: Disable generic animations.
  - Color contrast: WCAG AA compliance (text vs background).
- **Search:**
  - Input: `aria-label="Search movies and TV shows"`.
  - Dropdown: `role="listbox"`.
  - Options: `role="option"`, `aria-selected="true/false"`.
- **Images:**
  - All posters/backdrops: `alt` text (e.g., "Poster for Inception").
  - Decorative icons: `aria-hidden="true"`.
- **Interactive:**
  - Buttons/Links: Visible focus ring (`ring-2 ring-offset-2`).
  - Loading: `aria-busy="true"` on containers.
