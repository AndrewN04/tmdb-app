import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  MediaSummary,
  Genre,
  posterUrl,
  formatYear,
  getTitle,
  getMediaType,
} from "@/lib/tmdb";

interface MediaCardProps {
  media: MediaSummary;
  genres?: Genre[];
  priority?: boolean;
  showReleaseDate?: boolean;
}

export function MediaCard({
  media,
  genres = [],
  priority = false,
  showReleaseDate = false,
}: MediaCardProps) {
  const imageSrc = posterUrl(media.poster_path, "w342");
  const title = getTitle(media);
  const rating = media.vote_average ? media.vote_average.toFixed(1) : null;
  const year = formatYear(media);
  const mediaType = getMediaType(media);
  const detailUrl =
    mediaType === "tv" ? `/tv/${media.id}` : `/movie/${media.id}`;

  // Get genre names (limit to 2)
  const mediaGenres =
    media.genre_ids
      ?.slice(0, 2)
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean) ?? [];

  // Format release date for "Coming Soon" badges
  const releaseDate = media.release_date ?? media.first_air_date;
  const formattedDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={detailUrl}
      className="group relative flex shrink-0 flex-col gap-3 transition-transform duration-300 hover:-translate-y-2"
    >
      {/* Poster Container */}
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-slate-800">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
            No poster
          </div>
        )}

        {/* Rating Badge - Top Right */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-slate-900/90 px-2.5 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {rating}
          </div>
        )}

        {/* Release Date Badge - Top Left (for Coming Soon) */}
        {showReleaseDate && formattedDate && (
          <div className="absolute top-2 left-2 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white uppercase shadow-lg">
            {formattedDate}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-white group-hover:text-emerald-400">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/50">
          {mediaGenres.length > 0 ? (
            mediaGenres.map((genre, i) => (
              <span key={genre}>
                {genre}
                {i < mediaGenres.length - 1 && ","}
              </span>
            ))
          ) : (
            <span>{year}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
