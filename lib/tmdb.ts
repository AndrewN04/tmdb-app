import "server-only";

import { getBaseUrl } from "./http";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Calls the internal API proxy so Next.js caching and auth headers stay consistent across requests.
async function fetchFromRoute<T>(path: string, searchParams?: Record<string, string>) {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export interface MovieSummary {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

export interface MovieListResponse {
  page: number;
  results: MovieSummary[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetail extends MovieSummary {
  runtime?: number;
  genres?: { id: number; name: string }[];
  tagline?: string;
  status?: string;
  homepage?: string | null;
}

export async function getPopularMovies(page = "1") {
  return fetchFromRoute<MovieListResponse>("/api/tmdb/popular", { page });
}

export async function getTrendingMovies(window = "day") {
  return fetchFromRoute<MovieListResponse>("/api/tmdb/trending", { window });
}

export async function getTopRatedMovies(page = "1") {
  return fetchFromRoute<MovieListResponse>("/api/tmdb/top-rated", { page });
}

export async function getUpcomingMovies(page = "1") {
  return fetchFromRoute<MovieListResponse>("/api/tmdb/upcoming", { page });
}

export async function getMovieDetails(id: string) {
  return fetchFromRoute<MovieDetail>(`/api/tmdb/movie/${id}`);
}

export async function getMovieRecommendations(id: string) {
  return fetchFromRoute<MovieListResponse>(`/api/tmdb/movie/${id}/recommendations`);
}

export function formatYear(movie: MovieSummary) {
  const raw = movie.release_date ?? movie.first_air_date;
  if (!raw) return "";
  return new Date(raw).getFullYear().toString();
}

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" | "original" = "w342") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
