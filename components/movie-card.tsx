import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { MovieSummary, formatYear, posterUrl } from "@/lib/tmdb";

interface MovieCardProps {
  movie: MovieSummary;
  priority?: boolean;
}

export function MovieCard({ movie, priority = false }: MovieCardProps) {
  const imageSrc = posterUrl(movie.poster_path, "w342");
  const title = movie.title ?? movie.name ?? "Untitled";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = formatYear(movie);

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-neutral-900">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            width={342}
            height={513}
            priority={priority}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/40">No art</div>
        )}
        {rating && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            <Star className="h-4 w-4 text-yellow-400" />
            {rating}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-white/60">
          {movie.media_type && <Badge variant="outline">{movie.media_type}</Badge>}
          {year && <span>{year}</span>}
        </div>
        <p className="line-clamp-2 font-semibold text-white">{title}</p>
      </div>
    </Link>
  );
}
