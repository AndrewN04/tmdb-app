import { Suspense } from "react";
import { discoverTV, getTVGenres } from "@/lib/tmdb";
import { FilterSidebar } from "@/components/filter-sidebar";
import { MediaGrid } from "@/components/media-grid";
import { Pagination } from "@/components/pagination";

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort_by?: string;
    with_genres?: string;
    "first_air_date.gte"?: string;
    "first_air_date.lte"?: string;
  }>;
}

export default async function TVShowsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ?? "1";
  const sortBy = params.sort_by ?? "popularity.desc";

  const [tvData, genresData] = await Promise.all([
    discoverTV({
      page,
      sort_by: sortBy,
      with_genres: params.with_genres,
      "first_air_date.gte": params["first_air_date.gte"],
      "first_air_date.lte": params["first_air_date.lte"],
    }),
    getTVGenres(),
  ]);

  const genres = genresData.genres;
  const shows = tvData.results;
  const totalPages = tvData.total_pages;
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
            mediaType="tv"
            currentFilters={{
              sort_by: sortBy,
              with_genres: params.with_genres,
              "first_air_date.gte": params["first_air_date.gte"],
              "first_air_date.lte": params["first_air_date.lte"],
            }}
          />
        </Suspense>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">TV Shows</h1>
          <p className="mt-1 text-white/60">
            Explore TV series from around the world
          </p>
        </div>

        <MediaGrid items={shows} genres={genres} mediaType="tv" />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.min(totalPages, 500)}
            baseUrl="/tv"
            currentParams={params}
          />
        )}
      </main>
    </div>
  );
}
