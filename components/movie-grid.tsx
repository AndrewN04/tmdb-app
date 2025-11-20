import { MovieSummary } from "@/lib/tmdb";
import { MovieCard } from "./movie-card";

interface MovieGridProps {
  items: MovieSummary[];
  priorityCount?: number;
}

export function MovieGrid({ items, priorityCount = 4 }: MovieGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} priority={index < priorityCount} />
      ))}
    </div>
  );
}
