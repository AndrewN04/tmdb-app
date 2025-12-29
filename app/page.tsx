import Image from "next/image";
import Link from "next/link";
import { Flame, Play } from "lucide-react";

import {
  MovieSummary,
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
  posterUrl,
} from "@/lib/tmdb";
import { SectionHeading } from "@/components/section-heading";
import { MovieGrid } from "@/components/movie-grid";

export const revalidate = 300;

function Hero({ feature }: { feature: MovieSummary }) {
  const backdrop = posterUrl(
    feature.backdrop_path ?? feature.poster_path,
    "w780"
  );
  const title = feature.title ?? feature.name ?? "Featured";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-10">
      {backdrop && (
        <Image
          src={backdrop}
          alt={title}
          fill
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          sizes="100vw"
        />
      )}
      <div className="relative flex flex-col gap-6">
        <div className="flex items-center gap-3 text-sm text-white/80">
          <Flame className="h-5 w-5 text-orange-400" /> Trending today
        </div>
        <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="max-w-2xl text-white/80">
          {feature.overview || "A trending movie curated from TMDB"}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/movie/${feature.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black"
          >
            <Play className="h-5 w-5" /> View details
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-white"
          >
            Browse catalog
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const [popular, trending, upcoming] = await Promise.all([
    getPopularMovies(),
    getTrendingMovies(),
    getUpcomingMovies(),
  ]);

  const feature = trending.results[0] ?? popular.results[0];

  return (
    <div className="space-y-12">
      {feature && <Hero feature={feature} />}

      <section className="space-y-4">
        <SectionHeading
          title="Popular now"
          description="Community favorites pulled live from TMDB"
        />
        <MovieGrid items={popular.results.slice(0, 10)} />
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Trending"
          description="What everyone is watching today"
        />
        <MovieGrid items={trending.results.slice(0, 10)} />
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Upcoming"
          description="Films headed to theaters soon"
        />
        <MovieGrid items={upcoming.results.slice(0, 10)} />
      </section>
    </div>
  );
}
