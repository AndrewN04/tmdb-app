import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
  getMovieGenres,
  getTrendingAll,
  getPopularTV,
} from "@/lib/tmdb";
import { HeroSection } from "@/components/hero-section";
import { ContentSection } from "@/components/content-section";
import { MediaRow } from "@/components/media-row";
import { TrendingToggle } from "@/components/trending-toggle";

export const revalidate = 300;

interface HomeProps {
  searchParams: Promise<{ trending?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const trendingWindow =
    params.trending === "week" ? ("week" as const) : ("day" as const);

  const [popular, trending, upcoming, trendingAll, popularTV, genresData] =
    await Promise.all([
      getPopularMovies(),
      getTrendingMovies(trendingWindow),
      getUpcomingMovies(),
      getTrendingAll(trendingWindow),
      getPopularTV(),
      getMovieGenres(),
    ]);

  const genres = genresData.genres;
  const heroMedia = trendingAll.results[0] ?? trending.results[0];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      {heroMedia && <HeroSection media={heroMedia} genres={genres} />}

      {/* Trending Now */}
      <ContentSection
        title="Trending Now"
        viewAllHref="/movies?sort=trending"
        headerAction={<TrendingToggle currentWindow={trendingWindow} />}
      >
        <MediaRow items={trendingAll.results.slice(0, 10)} genres={genres} />
      </ContentSection>

      {/* What's Popular */}
      <ContentSection title="What's Popular" viewAllHref="/movies">
        <MediaRow items={popular.results.slice(0, 10)} genres={genres} />
      </ContentSection>

      {/* Popular TV */}
      <ContentSection title="Popular TV Shows" viewAllHref="/tv">
        <MediaRow items={popularTV.results.slice(0, 10)} genres={genres} />
      </ContentSection>

      {/* Coming Soon */}
      <ContentSection title="Coming Soon" viewAllHref="/movies?sort=upcoming">
        <MediaRow
          items={upcoming.results.slice(0, 10)}
          genres={genres}
          showReleaseDate
        />
      </ContentSection>
    </div>
  );
}
