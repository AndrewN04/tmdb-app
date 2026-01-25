"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Genre } from "@/types/tmdb";
import { SlidersHorizontal, Tag, RotateCcw, Sparkles } from "lucide-react";

interface FilterSidebarProps {
  genres: Genre[];
  type: 'movie' | 'tv';
}

export function FilterSidebar({ genres, type }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sort State
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "popularity.desc");
  
  // Genre State
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get("with_genres")?.split(",") || []
  );

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort_by", sortBy);
    
    if (selectedGenres.length > 0) {
      params.set("with_genres", selectedGenres.join(","));
    } else {
      params.delete("with_genres");
    }

    params.delete("page"); // Reset to page 1 on filter change
    router.push(`/${type === 'movie' ? 'movies' : 'tv'}?${params.toString()}`);
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };
  
  const resetFilters = () => {
      setSortBy("popularity.desc");
      setSelectedGenres([]);
      router.push(`/${type === 'movie' ? 'movies' : 'tv'}`);
  };
  
  const hasActiveFilters = sortBy !== "popularity.desc" || selectedGenres.length > 0;

  return (
    <div className="space-y-6 glass rounded-xl border border-white/10 p-6 sticky top-24">
      {/* Sort section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Sort By</h3>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-white/5 border-white/10 hover:border-white/20 transition-colors focus:ring-primary/50">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent className="glass border-white/10">
            <SelectItem value="popularity.desc" className="focus:bg-white/10">Most Popular</SelectItem>
            <SelectItem value="vote_average.desc" className="focus:bg-white/10">Highest Rated</SelectItem>
            <SelectItem value="primary_release_date.desc" className="focus:bg-white/10">Newest Release</SelectItem>
            <SelectItem value="primary_release_date.asc" className="focus:bg-white/10">Oldest Release</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {/* Genres section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <Tag className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Genres</h3>
          </div>
          {selectedGenres.length > 0 && (
            <span className="text-xs text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10">
              {selectedGenres.length} selected
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2.5">
          {genres.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id.toString());
            return (
              <div 
                key={genre.id} 
                className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-primary/15 border border-primary/30' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
                onClick={() => toggleGenre(genre.id.toString())}
              >
                <Checkbox 
                  id={`genre-${genre.id}`} 
                  checked={isSelected}
                  onCheckedChange={() => toggleGenre(genre.id.toString())}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground border-muted-foreground/40 transition-all"
                />
                <Label 
                  htmlFor={`genre-${genre.id}`}
                  className={`text-sm font-medium leading-none cursor-pointer transition-colors ${
                    isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {genre.name}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {/* Action buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <Button 
          onClick={applyFilters} 
          className="w-full btn-glow bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Apply Filters
        </Button>
        <Button 
          variant="ghost" 
          onClick={resetFilters} 
          className={`w-full h-10 gap-2 transition-all ${
            hasActiveFilters 
              ? 'text-muted-foreground hover:text-foreground hover:bg-white/10' 
              : 'text-muted-foreground/50 cursor-not-allowed'
          }`}
          disabled={!hasActiveFilters}
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
