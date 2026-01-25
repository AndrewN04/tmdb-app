# TMDB Improved

A modern movie and TV show discovery application built with Next.js, featuring user authentication, personalized library management, and comprehensive content browsing.

## Project Overview

TMDB Improved is a full-featured entertainment discovery platform that allows users to browse movies and TV shows, create personalized watchlists and favorites, read and write reviews, and search across content with advanced filtering options.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **UI Components:** shadcn/ui, Radix UI
- **Backend:** Convex (database and real-time backend)
- **Authentication:** Better Auth with Convex integration
- **APIs:** The Movie Database (TMDB) API v3
- **OAuth:** GitHub and Google (optional)

## Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))
- Convex account ([Sign up here](https://convex.dev))
- OAuth app credentials (optional, for GitHub/Google login)

## Setup Instructions

1. Clone the repository
   ```bash
   git clone https://github.com/AndrewN04/tmdb-app.git
   cd tmdb-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Convex
   ```bash
   npx convex dev
   ```
   This will create a new Convex project, generate deployment URLs, and push your schema and functions.

4. Create a `.env.local` file in the root directory with the following variables:

   ```env
   # TMDB API
   TMDB_API_TOKEN=your_tmdb_api_token_here

   # Convex
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   NEXT_PUBLIC_CONVEX_SITE_URL=http://localhost:3000

   # Better Auth
   SITE_URL=http://localhost:3000

   # OAuth Providers (Optional)
   AUTH_GITHUB_ID=your_github_oauth_app_client_id
   AUTH_GITHUB_SECRET=your_github_oauth_app_client_secret
   AUTH_GOOGLE_ID=your_google_oauth_client_id
   AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
   ```

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

