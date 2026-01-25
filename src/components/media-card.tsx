import Image from "next/image";
import Link from "next/link";
import { Movie, TVShow } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MediaCardProps {
  item: Movie | TVShow;
  priority?: boolean;
  className?: string;
}

export function MediaCard({ item, priority = false, className }: MediaCardProps) {
  const isMovie = (item as Movie).title !== undefined;
  const title = isMovie ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = isMovie 
    ? (item as Movie).release_date 
    : (item as TVShow).first_air_date;
  const href = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;
  const rating = item.vote_average;

  // Determine rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return "bg-emerald-500 shadow-emerald-500/30";
    if (rating >= 6) return "bg-yellow-500 shadow-yellow-500/30";
    return "bg-orange-500 shadow-orange-500/30";
  };

  return (
    <Link 
      href={href} 
      className={`group outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl block h-full ${className || ''}`}
    >
      <Card className="border-0 bg-transparent shadow-none w-full h-full overflow-visible">
        <CardContent className="p-0 space-y-3 h-full flex flex-col">
          {/* Poster container with hover effects */}
          <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-muted w-full media-card-glow">
            {item.poster_path ? (
              <>
                <Image
                  src={getImageUrl(item.poster_path, "w500")}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 160px, 200px"
                  priority={priority}
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground p-4 text-center text-xs bg-linear-to-br from-muted to-muted/50">
                <span>No Image</span>
              </div>
            )}
            
            {/* Rating badge with dynamic color */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg flex items-center gap-1 ${getRatingColor(rating)} shadow-lg`}>
              <Star className="w-3 h-3 text-white fill-white" />
              <span className="text-xs font-bold text-white">
                {rating.toFixed(1)}
              </span>
            </div>
            
            {/* Type badge - shows on hover */}
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] px-2">
                {isMovie ? "Movie" : "TV Series"}
              </Badge>
            </div>
          </div>
          
          {/* Info section */}
          <div className="space-y-1.5 px-0.5">
            <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">
                {releaseDate ? new Date(releaseDate).getFullYear() : "TBA"}
              </span>
              <Badge 
                variant="outline" 
                className="text-[10px] h-5 px-1.5 py-0 border-border/50 bg-muted/50 hover:bg-muted transition-colors"
              >
                {isMovie ? "Movie" : "TV"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
