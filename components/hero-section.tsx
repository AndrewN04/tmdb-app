import Image from "next/image";
import Link from "next/link";
import { Play, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  MediaSummary,
  Genre,
  backdropUrl,
  formatYear,
  getTitle,
} from "@/lib/tmdb";

interface HeroSectionProps {
  media: MediaSummary;
  genres?: Genre[];
}

export function HeroSection({ media, genres = [] }: HeroSectionProps) {
  const backdrop = backdropUrl(media.backdrop_path, "original");
  const title = getTitle(media);
  const year = formatYear(media);
  const rating = media.vote_average?.toFixed(1);
  const mediaType = media.media_type ?? "movie";
  const detailUrl =
    mediaType === "tv" ? `/tv/${media.id}` : `/movie/${media.id}`;

  // Get genre names from IDs
  const mediaGenres =
    media.genre_ids
      ?.slice(0, 3)
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean) ?? [];

  return (
    <section className="relative -mx-6 -mt-10 h-[70vh] min-h-125 overflow-hidden">
      {/* Background Image */}
      {backdrop && (
        <Image
          src={backdrop}
          alt={title}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-16">
          {/* Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {mediaGenres.map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="border-white/30 bg-white/10 text-xs tracking-wider text-white uppercase backdrop-blur-sm"
              >
                {genre}
              </Badge>
            ))}
            {year && (
              <Badge
                variant="outline"
                className="border-white/30 bg-white/10 text-xs text-white backdrop-blur-sm"
              >
                {year}
              </Badge>
            )}
            {rating && (
              <Badge className="bg-yellow-500/90 text-xs font-semibold text-black">
                ★ {rating}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-4 text-5xl font-black tracking-tight text-white md:text-7xl">
            {title}
          </h1>

          {/* Description */}
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            {media.overview?.slice(0, 200)}
            {(media.overview?.length ?? 0) > 200 ? "..." : ""}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={detailUrl}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 px-8 py-3 font-semibold text-white transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <Play className="h-5 w-5" fill="currentColor" />
              Watch Trailer
            </Link>
            <Link
              href={detailUrl}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <Info className="h-5 w-5" />
              More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
