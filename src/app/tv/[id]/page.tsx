import { tmdb, getImageUrl } from "@/lib/tmdb";
import { CastList } from "@/components/cast-list";
import { ContentRow } from "@/components/content-row";
import { MediaCard } from "@/components/media-card";
import { ActionButtons } from "@/components/action-buttons";
import { ReviewsSection } from "@/components/reviews-section";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Layers, Play, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Credits, TVShow } from "@/types/tmdb";

interface TVDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TVDetailsPage({ params }: TVDetailsPageProps) {
  const { id } = await params;
  
  let show;
  try {
    show = await tmdb.getTVDetails(parseInt(id));
  } catch {
    notFound();
  }

  // Type assertion for appended responses
  const credits = (show as unknown as { credits: Credits }).credits;
  const similar = (show as unknown as { similar: { results: TVShow[] } }).similar;
  
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null;

  return (
    <div className="min-h-screen pb-20">
      {/* Header / Backdrop Section */}
      <div className="relative w-full h-[70vh] min-h-[600px] overflow-hidden">
        {/* Background with Ken Burns effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 hero-image">
            <Image
              src={getImageUrl(show.backdrop_path, 'original')}
              alt={show.name}
              fill
              className="object-cover scale-105"
              priority
            />
          </div>
          
          {/* Multi-layered gradients */}
          <div className="absolute inset-0 hero-gradient-overlay" />
          <div className="absolute inset-0 noise-overlay" />
          
          {/* Decorative glow */}
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Content */}
        <div className="container relative h-full flex items-end pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-end md:items-end w-full">
            {/* Poster with glow effect */}
            <div className="hidden md:block w-72 shrink-0 relative group">
              <div className="absolute -inset-2 bg-linear-to-br from-primary/30 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-2/3">
                <Image
                  src={getImageUrl(show.poster_path, 'w500')}
                  alt={show.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-5 text-white stagger-children">
              {/* Title */}
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  {show.name}
                  {year && (
                    <span className="text-white/40 font-light ml-3">({year})</span>
                  )}
                </h1>
                
                {show.tagline && (
                  <p className="text-xl text-white/60 italic font-light mt-2">&ldquo;{show.tagline}&rdquo;</p>
                )}
              </div>
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Rating */}
                <div className="rating-badge flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-black font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{show.vote_average.toFixed(1)}</span>
                </div>
                
                {/* First air date */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-subtle text-sm font-medium">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{show.first_air_date}</span>
                </div>
                
                {/* Seasons */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-subtle text-sm font-medium">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
                </div>
                
                {/* Vote count */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-subtle text-sm font-medium">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{show.vote_count.toLocaleString()} votes</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {show.genres.map(g => (
                  <Badge 
                    key={g.id} 
                    variant="secondary" 
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-3 py-1 text-sm transition-all duration-300 hover:scale-105"
                  >
                    {g.name}
                  </Badge>
                ))}
              </div>
              
              {/* Overview */}
              <div className="max-w-3xl space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  Overview
                </h3>
                <p className="text-gray-300/90 leading-relaxed text-lg font-light">{show.overview}</p>
              </div>

              {/* Action buttons */}
              <ActionButtons 
                tmdbId={show.id} 
                mediaType="tv" 
                title={show.name} 
                posterPath={show.poster_path || undefined} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="container px-4 sm:px-8 max-w-7xl mx-auto space-y-16 mt-12">
        {/* Divider */}
        <div className="section-divider" />
        
        <CastList cast={credits.cast} />
        
        <div className="section-divider" />

        <ReviewsSection tmdbId={show.id} mediaType="tv" />

        {similar.results.length > 0 && (
          <>
            <div className="section-divider" />
            <ContentRow title="More Like This">
              {similar.results.map(item => (
                <div key={item.id} className="w-[160px] sm:w-[200px] shrink-0">
                  <MediaCard item={item} />
                </div>
              ))}
            </ContentRow>
          </>
        )}
      </div>
    </div>
  );
}
