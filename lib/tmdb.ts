import "server-only";

import { fetchTmdb } from "@/lib/tmdb/fetcher";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// =============================================================================
// Shared Types
// =============================================================================

export interface Genre {
  id: number;
  name: string;
}

export interface GenreListResponse {
  genres: Genre[];
}

/** Base media type - works for both movies and TV shows */
export interface MediaSummary {
  id: number;
  title?: string; // Movies use title
  name?: string; // TV shows use name
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string; // Movies
  first_air_date?: string; // TV shows
  media_type?: "movie" | "tv" | "person";
  genre_ids?: number[];
  popularity?: number;
  vote_count?: number;
  original_language?: string;
  adult?: boolean;
}

export interface MediaListResponse {
  page: number;
  results: MediaSummary[];
  total_pages: number;
  total_results: number;
}

// =============================================================================
// Movie Types
// =============================================================================

/** @deprecated Use MediaSummary instead */
export type MovieSummary = MediaSummary;

/** @deprecated Use MediaListResponse instead */
export type MovieListResponse = MediaListResponse;

export interface MovieDetail extends MediaSummary {
  runtime?: number;
  genres?: Genre[];
  tagline?: string;
  status?: string;
  homepage?: string | null;
  budget?: number;
  revenue?: number;
  production_companies?: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  spoken_languages?: { iso_639_1: string; name: string }[];
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
}

// =============================================================================
// TV Show Types
// =============================================================================

export interface TVShowDetail extends MediaSummary {
  genres?: Genre[];
  tagline?: string;
  status?: string;
  homepage?: string | null;
  number_of_episodes?: number;
  number_of_seasons?: number;
  episode_run_time?: number[];
  networks?: { id: number; name: string; logo_path: string | null }[];
  created_by?: { id: number; name: string; profile_path: string | null }[];
  last_air_date?: string;
  in_production?: boolean;
  seasons?: Season[];
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date?: string;
}

// =============================================================================
// Credits Types
// =============================================================================

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

// =============================================================================
// Search Types
// =============================================================================

export interface SearchFilters {
  [key: string]: string | number | null | undefined;
  page?: string;
  year?: string;
  primary_release_year?: string;
  first_air_date_year?: string;
  with_genres?: string; // Comma-separated genre IDs
  "primary_release_date.gte"?: string;
  "primary_release_date.lte"?: string;
  "first_air_date.gte"?: string;
  "first_air_date.lte"?: string;
  sort_by?: string;
  include_adult?: string;
}

// =============================================================================
// Movie Functions
// =============================================================================

export async function getPopularMovies(page = "1") {
  return fetchTmdb<MediaListResponse>("movie/popular", {
    searchParams: { page },
  });
}

export async function getTrendingMovies(window: "day" | "week" = "day") {
  return fetchTmdb<MediaListResponse>(`trending/movie/${window}`);
}

export async function getTopRatedMovies(page = "1") {
  return fetchTmdb<MediaListResponse>("movie/top_rated", {
    searchParams: { page },
  });
}

export async function getUpcomingMovies(page = "1") {
  return fetchTmdb<MediaListResponse>("movie/upcoming", {
    searchParams: { page },
  });
}

export async function getNowPlayingMovies(page = "1") {
  return fetchTmdb<MediaListResponse>("movie/now_playing", {
    searchParams: { page },
  });
}

export async function getMovieDetails(id: string) {
  return fetchTmdb<MovieDetail>(`movie/${id}`, {
    searchParams: { append_to_response: "credits" },
  });
}

export async function getMovieRecommendations(id: string) {
  return fetchTmdb<MediaListResponse>(`movie/${id}/recommendations`);
}

export async function getSimilarMovies(id: string) {
  return fetchTmdb<MediaListResponse>(`movie/${id}/similar`);
}

// =============================================================================
// TV Show Functions
// =============================================================================

export async function getPopularTV(page = "1") {
  return fetchTmdb<MediaListResponse>("tv/popular", { searchParams: { page } });
}

export async function getTrendingTV(window: "day" | "week" = "day") {
  return fetchTmdb<MediaListResponse>(`trending/tv/${window}`);
}

export async function getTopRatedTV(page = "1") {
  return fetchTmdb<MediaListResponse>("tv/top_rated", {
    searchParams: { page },
  });
}

export async function getOnTheAirTV(page = "1") {
  return fetchTmdb<MediaListResponse>("tv/on_the_air", {
    searchParams: { page },
  });
}

export async function getAiringTodayTV(page = "1") {
  return fetchTmdb<MediaListResponse>("tv/airing_today", {
    searchParams: { page },
  });
}

export async function getTVDetails(id: string) {
  return fetchTmdb<TVShowDetail>(`tv/${id}`, {
    searchParams: { append_to_response: "credits" },
  });
}

export async function getTVRecommendations(id: string) {
  return fetchTmdb<MediaListResponse>(`tv/${id}/recommendations`);
}

export async function getSimilarTV(id: string) {
  return fetchTmdb<MediaListResponse>(`tv/${id}/similar`);
}

// =============================================================================
// Genre Functions
// =============================================================================

export async function getMovieGenres() {
  return fetchTmdb<GenreListResponse>("genre/movie/list");
}

export async function getTVGenres() {
  return fetchTmdb<GenreListResponse>("genre/tv/list");
}

export async function getGenres(type: "movie" | "tv") {
  return type === "movie" ? getMovieGenres() : getTVGenres();
}

// =============================================================================
// Search Functions
// =============================================================================

export async function searchMulti(query: string, page = "1") {
  return fetchTmdb<MediaListResponse>("search/multi", {
    searchParams: { query, page, include_adult: "false" },
  });
}

export async function searchMovies(
  query: string,
  page = "1",
  filters?: SearchFilters
) {
  return fetchTmdb<MediaListResponse>("search/movie", {
    searchParams: { query, page, include_adult: "false", ...filters },
  });
}

export async function searchTV(
  query: string,
  page = "1",
  filters?: SearchFilters
) {
  return fetchTmdb<MediaListResponse>("search/tv", {
    searchParams: { query, page, include_adult: "false", ...filters },
  });
}

// =============================================================================
// Discover Functions (For Filtering)
// =============================================================================

export async function discoverMovies(filters: SearchFilters = {}) {
  const params: SearchFilters = {
    page: "1",
    sort_by: "popularity.desc",
    include_adult: "false",
    ...filters,
  };
  return fetchTmdb<MediaListResponse>("discover/movie", {
    searchParams: params,
  });
}

export async function discoverTV(filters: SearchFilters = {}) {
  const params: SearchFilters = {
    page: "1",
    sort_by: "popularity.desc",
    include_adult: "false",
    ...filters,
  };
  return fetchTmdb<MediaListResponse>("discover/tv", { searchParams: params });
}

// =============================================================================
// Trending (Combined)
// =============================================================================

export async function getTrendingAll(window: "day" | "week" = "day") {
  return fetchTmdb<MediaListResponse>(`trending/all/${window}`);
}

// =============================================================================
// Utility Functions
// =============================================================================

/** Get display title - works for both movies and TV shows */
export function getTitle(media: MediaSummary) {
  return media.title ?? media.name ?? "Unknown";
}

/** Get release/air year */
export function formatYear(media: MediaSummary) {
  const raw = media.release_date ?? media.first_air_date;
  if (!raw) return "";
  return new Date(raw).getFullYear().toString();
}

/** Get full release/air date formatted */
export function formatDate(media: MediaSummary, locale = "en-US") {
  const raw = media.release_date ?? media.first_air_date;
  if (!raw) return "";
  return new Date(raw).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Get runtime display (e.g., "2h 46m") */
export function formatRuntime(minutes?: number) {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Get rating as percentage (e.g., 8.4 → 84) */
export function ratingToPercent(voteAverage: number) {
  return Math.round(voteAverage * 10);
}

/** Get poster URL with size variant */
export function posterUrl(
  path: string | null,
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w342"
) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/** Get backdrop URL with size variant */
export function backdropUrl(
  path: string | null,
  size: "w300" | "w780" | "w1280" | "original" = "w1280"
) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/** Get profile image URL (for cast/crew) */
export function profileUrl(
  path: string | null,
  size: "w45" | "w185" | "h632" | "original" = "w185"
) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/** Determine media type from object */
export function getMediaType(media: MediaSummary): "movie" | "tv" {
  if (media.media_type) return media.media_type as "movie" | "tv";
  // Infer from properties
  if (media.title || media.release_date) return "movie";
  if (media.name || media.first_air_date) return "tv";
  return "movie"; // Default fallback
}
