import { MediaSummary, Genre } from "@/lib/tmdb";
import { MediaCard } from "@/components/media-card";

interface MediaGridProps {
  items: MediaSummary[];
  genres?: Genre[];
  mediaType?: "movie" | "tv";
}

export function MediaGrid({ items, genres = [], mediaType }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-75 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <p className="text-white/60">
          No results found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item, i) => (
        <MediaCard
          key={item.id}
          media={{ ...item, media_type: mediaType ?? item.media_type }}
          genres={genres}
          priority={i < 10}
        />
      ))}
    </div>
  );
}
