import { MediaSummary, Genre } from "@/lib/tmdb";
import { MediaCard } from "@/components/media-card";

interface MediaRowProps {
  items: MediaSummary[];
  genres?: Genre[];
  showReleaseDate?: boolean;
}

export function MediaRow({
  items,
  genres = [],
  showReleaseDate = false,
}: MediaRowProps) {
  return (
    <div className="scrollbar-hide -mx-6 flex gap-4 overflow-x-auto px-6 pb-4">
      {items.map((item, i) => (
        <div key={item.id} className="w-37.5 shrink-0 md:w-45">
          <MediaCard
            media={item}
            genres={genres}
            priority={i < 5}
            showReleaseDate={showReleaseDate}
          />
        </div>
      ))}
    </div>
  );
}
