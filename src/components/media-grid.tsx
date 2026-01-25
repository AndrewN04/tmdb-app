import { MediaCard } from "@/components/media-card";
import { Movie, TVShow } from "@/types/tmdb";

interface MediaGridProps {
  items: (Movie | TVShow)[];
}

export function MediaGrid({ items }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No results found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-8">
      {items.map((item) => (
        <div key={item.id} className="w-full">
            <MediaCard item={item} />
        </div>
      ))}
    </div>
  );
}
