import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Star } from "lucide-react";

import { notFound } from "next/navigation";

import { MovieGrid } from "@/components/movie-grid";
import { SectionHeading } from "@/components/section-heading";
import { WatchlistPanel } from "@/components/watchlist-panel";
import { getMovieDetails, getMovieRecommendations, posterUrl } from "@/lib/tmdb";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

function formatRuntime(runtime?: number) {
  if (!runtime) return null;
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes}m`;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  let movie;
  try {
    movie = await getMovieDetails(id);
  } catch {
    // Gracefully handle invalid or missing TMDB ids.
    notFound();
  }

  if (!movie) {
    notFound();
  }

  const recommendations = await getMovieRecommendations(id);
  const poster = posterUrl(movie.poster_path, "w500");
  const backdrop = posterUrl(movie.backdrop_path ?? movie.poster_path, "original");

  return (
    <div className="space-y-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        {backdrop && (
          <Image src={backdrop} alt={movie.title ?? "Movie"} fill className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="relative flex flex-col gap-10 bg-linear-to-r from-black/80 via-black/40 to-transparent px-8 py-10 md:flex-row">
          {poster && (
            <div className="shrink-0 overflow-hidden rounded-2xl border border-white/10">
              <Image src={poster} alt={movie.title ?? "Movie poster"} width={360} height={540} className="h-full w-full object-cover" priority />
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold">{movie.title ?? movie.name}</h1>
              {movie.tagline && <p className="text-lg text-white/70">{movie.tagline}</p>}
            </div>
            <p className="text-white/80">{movie.overview}</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              {movie.vote_average && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  <Star className="h-4 w-4 text-yellow-400" /> {movie.vote_average.toFixed(1)}
                </span>
              )}
              {movie.runtime && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <Clock className="h-4 w-4" /> {formatRuntime(movie.runtime)}
                </span>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  {movie.genres.map((genre) => genre.name).join(" · ")}
                </span>
              )}
            </div>

            <WatchlistPanel
              tmdbId={movie.id}
              title={movie.title ?? movie.name ?? "Untitled"}
              mediaType="movie"
              posterPath={movie.poster_path}
              backdropPath={movie.backdrop_path}
            />
          </div>
        </div>
      </section>

      {recommendations.results.length > 0 && (
        <section className="space-y-4">
          <SectionHeading title="Recommended" description="Similar picks pulled from TMDB" />
          <MovieGrid items={recommendations.results.slice(0, 12)} />
        </section>
      )}
    </div>
  );
}
