import { Suspense } from "react";
import { discoverMovies, getMovieGenres } from "@/lib/tmdb";
import { FilterSidebar } from "@/components/filter-sidebar";
import { MediaGrid } from "@/components/media-grid";
import { Pagination } from "@/components/pagination";

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort_by?: string;
    with_genres?: string;
    "primary_release_date.gte"?: string;
    "primary_release_date.lte"?: string;
  }>;
}

export default async function MoviesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ?? "1";
  const sortBy = params.sort_by ?? "popularity.desc";

  const [moviesData, genresData] = await Promise.all([
    discoverMovies({
      page,
      sort_by: sortBy,
      with_genres: params.with_genres,
      "primary_release_date.gte": params["primary_release_date.gte"],
      "primary_release_date.lte": params["primary_release_date.lte"],
    }),
    getMovieGenres(),
  ]);

  const genres = genresData.genres;
  const movies = moviesData.results;
  const totalPages = moviesData.total_pages;
  const currentPage = parseInt(page, 10);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full shrink-0 lg:w-64">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-xl bg-white/5" />
          }
        >
          <FilterSidebar
            genres={genres}
            mediaType="movie"
            currentFilters={{
              sort_by: sortBy,
              with_genres: params.with_genres,
              "primary_release_date.gte": params["primary_release_date.gte"],
              "primary_release_date.lte": params["primary_release_date.lte"],
            }}
          />
        </Suspense>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Movies</h1>
          <p className="mt-1 text-white/60">
            Discover movies from TMDB&apos;s extensive catalog
          </p>
        </div>

        <MediaGrid items={movies} genres={genres} />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.min(totalPages, 500)}
            baseUrl="/movies"
            currentParams={params}
          />
        )}
      </main>
    </div>
  );
}
