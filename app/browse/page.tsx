import { SectionHeading } from "@/components/section-heading";
import { MovieGrid } from "@/components/movie-grid";
import {
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
} from "@/lib/tmdb";

export const revalidate = 300;

export default async function BrowsePage() {
  const [popular, topRated, trending] = await Promise.all([
    getPopularMovies(),
    getTopRatedMovies(),
    getTrendingMovies("week"),
  ]);

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
        <MovieGrid items={trending.results.slice(0, 12)} />
      </section>

      <section className="space-y-4">
        <SectionHeading title="Popular" />
        <MovieGrid items={popular.results.slice(0, 12)} />
      </section>

      <section className="space-y-4">
        <SectionHeading title="Top rated" />
        <MovieGrid items={topRated.results.slice(0, 12)} />
      </section>
    </div>
  );
}
