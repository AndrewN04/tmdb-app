import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/tmdb";
import { Movie } from "@/types/tmdb";
import Link from "next/link";
import Image from "next/image";
import { Play, Plus, Star, Calendar } from "lucide-react";

interface HeroProps {
  movie: Movie;
}

export function Hero({ movie }: HeroProps) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  
  return (
    <div className="relative w-full h-[70vh] min-h-[600px] flex items-end overflow-hidden">
      {/* Background Image with Ken Burns effect */}
      <Link href={`/movie/${movie.id}`} className="absolute inset-0 z-0 block cursor-pointer group">
        <div className="absolute inset-0 hero-image">
          <Image
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            fill
            className="object-cover scale-105"
            priority
          />
        </div>
        
        {/* Multi-layered gradient overlays */}
        <div className="absolute inset-0 hero-gradient-overlay pointer-events-none" />
        
        {/* Noise texture for cinema feel */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-transparent to-background/40 pointer-events-none" />
      </Link>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary/3 rounded-full blur-2xl pointer-events-none" />

      {/* Content */}
      <div className="container relative z-10 pb-16 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-4 pointer-events-none">
        <div className="max-w-2xl space-y-5 pointer-events-auto stagger-children">
          {/* Featured badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/30 text-sm font-medium text-primary/90">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Featured Today
          </div>
          
          {/* Title with gradient accent */}
          <Link href={`/movie/${movie.id}`} className="block group">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none">
              <span className="drop-shadow-2xl group-hover:text-primary/90 transition-colors duration-300">
                {movie.title}
              </span>
            </h1>
          </Link>
          
          {/* Meta info row */}
          <div className="flex flex-wrap items-center gap-3 text-white/80">
            {/* Rating badge */}
            <div className="rating-badge flex items-center gap-1.5 px-2.5 py-1 rounded-md text-black font-bold text-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
            
            {/* Year */}
            {year && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md glass-subtle text-sm font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{year}</span>
              </div>
            )}
            
            {/* Separator dot */}
            <span className="w-1 h-1 rounded-full bg-white/40" />
            
            {/* Genre placeholder - you could pass genres as prop */}
            <span className="text-sm text-white/60">Feature Film</span>
          </div>

          {/* Overview with better typography */}
          <p className="text-lg text-gray-200/90 line-clamp-3 md:line-clamp-4 max-w-xl leading-relaxed font-light">
            {movie.overview}
          </p>

          {/* Action buttons with glow effect */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              className="btn-glow rounded-full px-8 h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/25" 
              asChild
            >
              <Link href={`/movie/${movie.id}`}>
                <Play className="w-5 h-5 fill-current" />
                More Info
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="secondary" 
              className="rounded-full px-8 h-12 text-base font-semibold glass hover:bg-white/20 text-white border border-white/20 gap-2 transition-all duration-300 hover:border-white/40"
            >
              <Plus className="w-5 h-5" />
              Watchlist
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none z-5" />
    </div>
  );
}
