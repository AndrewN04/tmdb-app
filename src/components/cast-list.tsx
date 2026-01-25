"use client";

import { CastMember } from "@/types/tmdb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/tmdb";
import { Users } from "lucide-react";

interface CastListProps {
  cast: CastMember[];
}

export function CastList({ cast }: CastListProps) {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full bg-linear-to-b from-primary to-primary/30" />
        <h3 className="text-xl font-bold">Top Cast</h3>
        <span className="text-sm text-muted-foreground">({cast.length} people)</span>
      </div>
      
      {/* Cast grid with hover effects */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {cast.slice(0, 16).map((person, index) => (
          <div 
            key={person.id} 
            className="group flex flex-col items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/5 cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Avatar with ring effect */}
            <div className="relative">
              <div className="absolute -inset-1 bg-linear-to-br from-primary/40 to-transparent rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
              <Avatar className="relative h-20 w-20 border-2 border-white/10 group-hover:border-primary/50 transition-all duration-300 group-hover:scale-105">
                <AvatarImage 
                  src={getImageUrl(person.profile_path, 'w500')} 
                  alt={person.name} 
                  className="object-cover"
                />
                <AvatarFallback className="text-lg font-bold bg-linear-to-br from-muted to-muted/50 text-muted-foreground flex items-center justify-center">
                  {person.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Info */}
            <div className="text-center space-y-0.5 w-full">
              <p className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
                {person.name}
              </p>
              <p className="text-xs text-muted-foreground leading-tight truncate">
                {person.character}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Show more indicator if there are more cast members */}
      {cast.length > 16 && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>+{cast.length - 16} more cast members</span>
          </div>
        </div>
      )}
    </div>
  );
}
