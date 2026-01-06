import { SectionHeading } from "@/components/section-heading";
import { MediaGrid } from "@/components/media-grid";
import {
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  getMovieGenres,
} from "@/lib/tmdb";

export const revalidate = 300;

export default async function BrowsePage() {
  const [popular, topRated, trending, genresData] = await Promise.all([
    getPopularMovies(),
    getTopRatedMovies(),
    getTrendingMovies("week"),
    getMovieGenres(),
  ]);

  const genres = genresData.genres;

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm tracking-[0.3em] text-white/60 uppercase">
          Catalog
        </p>
        <h1 className="text-4xl font-bold">Browse movies</h1>
        <p className="text-white/70">
          Everything is fetched on-demand from TMDB via our edge-cached route
          handlers so your data is always fresh.
        </p>
      </header>

      <section className="space-y-4">
        <SectionHeading title="Trending this week" />
        <MediaGrid
          items={trending.results.slice(0, 12)}
          genres={genres}
          mediaType="movie"
        />
      </section>

      <section className="space-y-4">
        <SectionHeading title="Popular" />
        <MediaGrid
          items={popular.results.slice(0, 12)}
          genres={genres}
          mediaType="movie"
        />
      </section>

      <section className="space-y-4">
        <SectionHeading title="Top rated" />
        <MediaGrid
          items={topRated.results.slice(0, 12)}
          genres={genres}
          mediaType="movie"
        />
      </section>
    </div>
  );
}
