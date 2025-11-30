import "server-only";

import { fetchTmdb } from "@/lib/tmdb/fetcher";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

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
  return fetchTmdb<MovieListResponse>("movie/popular", { searchParams: { page } });
}

export async function getTrendingMovies(window = "day") {
  return fetchTmdb<MovieListResponse>(`trending/movie/${window}`);
}

export async function getTopRatedMovies(page = "1") {
  return fetchTmdb<MovieListResponse>("movie/top_rated", { searchParams: { page } });
}

export async function getUpcomingMovies(page = "1") {
  return fetchTmdb<MovieListResponse>("movie/upcoming", { searchParams: { page } });
}

export async function getMovieDetails(id: string) {
  return fetchTmdb<MovieDetail>(`movie/${id}`);
}

export async function getMovieRecommendations(id: string) {
  return fetchTmdb<MovieListResponse>(`movie/${id}/recommendations`);
}

export function formatYear(movie: MovieSummary) {
  const raw = movie.release_date ?? movie.first_air_date;
  if (!raw) return "";
  return new Date(raw).getFullYear().toString();
}

export function posterUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w342"
) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
