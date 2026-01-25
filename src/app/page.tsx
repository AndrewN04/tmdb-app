import { Hero } from "@/components/hero";
import { ContentRow } from "@/components/content-row";
import { MediaCard } from "@/components/media-card";
import { tmdb } from "@/lib/tmdb";
import { Movie, TVShow } from "@/types/tmdb";

export default async function Home() {
  let featured: Movie | undefined;
  let popularMovies: Movie[] = [];
  let popularTV: TVShow[] = [];
  let upcomingMovies: Movie[] = [];
  let error = null;

  try {
    const [trendingRes, popMoviesRes, popTVRes, upcomingRes] = await Promise.all([
      tmdb.getTrending('day'),
      tmdb.getPopularMovies(),
      tmdb.getPopularTV(),
      tmdb.getUpcomingMovies(),
    ]);

    // Find first movie with backdrop for hero
    featured = trendingRes.results.find(
      (item): item is Movie => item.media_type === 'movie' && !!item.backdrop_path
    );
    
    popularMovies = popMoviesRes.results;
    popularTV = popTVRes.results;
    upcomingMovies = upcomingRes.results;

  } catch (e) {
    console.error("Failed to fetch data:", e);
    error = e;
  }

  if (!featured && !error) {
     // Fallback if no trending movie found but API worked
     return <div className="p-8">No content found.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {featured ? (
        <Hero movie={featured} />
      ) : (
        <div className="h-[60vh] flex items-center justify-center bg-muted">
             <div className="text-center p-8">
               <h1 className="text-4xl font-bold mb-4">Welcome to TMDB Improved</h1>
               <p className="text-muted-foreground">Unable to load featured content at this time.</p>
             </div>
        </div>
      )}
      
      <div className="flex flex-col gap-8 -mt-8 relative z-20">
        {popularMovies.length > 0 && (
          <ContentRow title="Popular Movies" viewAllLink="/movies">
            {popularMovies.map((movie) => (
              <div key={movie.id} className="w-[160px] md:w-[200px] flex-shrink-0">
                <MediaCard item={movie} />
              </div>
            ))}
          </ContentRow>
        )}

        {popularTV.length > 0 && (
          <ContentRow title="Popular TV Shows" viewAllLink="/tv">
            {popularTV.map((show) => (
              <div key={show.id} className="w-[160px] md:w-[200px] flex-shrink-0">
                <MediaCard item={show} />
              </div>
            ))}
          </ContentRow>
        )}

        {upcomingMovies.length > 0 && (
          <ContentRow title="Upcoming Movies" viewAllLink="/movies?sort=upcoming">
            {upcomingMovies.map((movie) => (
              <div key={movie.id} className="w-[160px] md:w-[200px] flex-shrink-0">
                <MediaCard item={movie} />
              </div>
            ))}
          </ContentRow>
        )}
      </div>
    </div>
  );
}
