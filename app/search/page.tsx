import { Suspense } from "react";
import { searchMulti, getMovieGenres } from "@/lib/tmdb";
import { MediaGrid } from "@/components/media-grid";
import { Pagination } from "@/components/pagination";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    type?: "all" | "movie" | "tv";
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = params.page ?? "1";
  const type = params.type ?? "all";

  // If no query, show search prompt
  if (!query.trim()) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-white/5 p-6">
          <Search className="h-12 w-12 text-white/40" />
        </div>
        <h1 className="text-2xl font-bold text-white">Search TMDB</h1>
        <p className="text-white/60">
          Enter a search term to find movies and TV shows
        </p>
      </div>
    );
  }

  const [searchResults, genresData] = await Promise.all([
    searchMulti(query, page),
    getMovieGenres(),
  ]);

  const genres = genresData.genres;

  // Filter results by type
  let filteredResults = searchResults.results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  );

  if (type === "movie") {
    filteredResults = filteredResults.filter(
      (item) => item.media_type === "movie"
    );
  } else if (type === "tv") {
    filteredResults = filteredResults.filter(
      (item) => item.media_type === "tv"
    );
  }

  const movieCount = searchResults.results.filter(
    (r) => r.media_type === "movie"
  ).length;
  const tvCount = searchResults.results.filter(
    (r) => r.media_type === "tv"
  ).length;

  const totalPages = searchResults.total_pages;
  const currentPage = parseInt(page, 10);
  const totalResults = searchResults.total_results;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-sm tracking-[0.3em] text-white/60 uppercase">
          Search Results
        </p>
        <h1 className="text-3xl font-bold text-white">
          Results for &quot;{query}&quot;
        </h1>
        <p className="text-white/60">
          Found {totalResults.toLocaleString()} results
        </p>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <TabLink
          href={`/search?q=${encodeURIComponent(query)}&type=all`}
          active={type === "all"}
        >
          All
        </TabLink>
        <TabLink
          href={`/search?q=${encodeURIComponent(query)}&type=movie`}
          active={type === "movie"}
        >
          Movies ({movieCount})
        </TabLink>
        <TabLink
          href={`/search?q=${encodeURIComponent(query)}&type=tv`}
          active={type === "tv"}
        >
          TV Shows ({tvCount})
        </TabLink>
      </div>

      {/* Results Grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-2/3 animate-pulse rounded-xl bg-white/5"
              />
            ))}
          </div>
        }
      >
        <MediaGrid items={filteredResults} genres={genres} />
      </Suspense>

      {/* Pagination */}
      {filteredResults.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.min(totalPages, 500)} // TMDB limits to 500 pages
          baseUrl="/search"
          currentParams={{ q: query, type }}
        />
      )}
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </a>
  );
}
