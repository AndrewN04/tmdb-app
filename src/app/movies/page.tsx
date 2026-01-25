import { MediaGrid } from "@/components/media-grid";
import { FilterSidebar } from "@/components/filter-sidebar";
import { tmdb } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Film, ChevronLeft, ChevronRight } from "lucide-react";

interface MoviesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const sortBy = typeof resolvedSearchParams.sort_by === 'string' ? resolvedSearchParams.sort_by : 'popularity.desc';
  const withGenres = typeof resolvedSearchParams.with_genres === 'string' ? resolvedSearchParams.with_genres : undefined;

  const [data, genres] = await Promise.all([
    tmdb.discoverMovies({
      page: page.toString(),
      sort_by: sortBy,
      with_genres: withGenres || '',
    }),
    tmdb.getGenres('movie'),
  ]);

  return (
    <div className="container py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-10 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Film className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Movies</h1>
        </div>
        <p className="text-muted-foreground pl-[52px]">
          Discover {data.total_results.toLocaleString()} movies to watch
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <FilterSidebar genres={genres} type="movie" />
        </div>

        {/* Grid */}
        <div className="flex-1 space-y-10">
          <MediaGrid items={data.results} />
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <Button 
                variant="ghost" 
                className="gap-1.5 hover:bg-white/10"
                asChild
              >
                <Link href={`/movies?page=${page - 1}&sort_by=${sortBy}${withGenres ? `&with_genres=${withGenres}` : ''}`}>
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Link>
              </Button>
            )}
            
            {/* Page indicator */}
            <div className="flex items-center gap-1 px-4 py-2 rounded-lg glass-subtle text-sm">
              <span className="text-foreground font-medium">Page {page}</span>
              <span className="text-muted-foreground">of {Math.min(data.total_pages, 500).toLocaleString()}</span>
            </div>
            
            {page < data.total_pages && page < 500 && (
              <Button 
                variant="ghost" 
                className="gap-1.5 hover:bg-white/10"
                asChild
              >
                <Link href={`/movies?page=${page + 1}&sort_by=${sortBy}${withGenres ? `&with_genres=${withGenres}` : ''}`}>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
