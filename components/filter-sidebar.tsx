"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { Genre } from "@/lib/tmdb";

interface FilterSidebarProps {
  genres: Genre[];
  mediaType: "movie" | "tv";
  currentFilters: {
    sort_by?: string;
    with_genres?: string;
    "primary_release_date.gte"?: string;
    "primary_release_date.lte"?: string;
    "first_air_date.gte"?: string;
    "first_air_date.lte"?: string;
  };
}

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity Descending" },
  { value: "popularity.asc", label: "Popularity Ascending" },
  { value: "vote_average.desc", label: "Rating Descending" },
  { value: "vote_average.asc", label: "Rating Ascending" },
  { value: "primary_release_date.desc", label: "Release Date Descending" },
  { value: "primary_release_date.asc", label: "Release Date Ascending" },
];

export function FilterSidebar({
  genres,
  mediaType,
  currentFilters,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const selectedGenres = currentFilters.with_genres?.split(",") ?? [];
  const dateGteKey =
    mediaType === "movie" ? "primary_release_date.gte" : "first_air_date.gte";
  const dateLteKey =
    mediaType === "movie" ? "primary_release_date.lte" : "first_air_date.lte";

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset to page 1 when filters change
    params.delete("page");

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(
        `/${mediaType === "movie" ? "movies" : "tv"}?${params.toString()}`
      );
    });
  };

  const toggleGenre = (genreId: string) => {
    const current = new Set(selectedGenres);
    if (current.has(genreId)) {
      current.delete(genreId);
    } else {
      current.add(genreId);
    }
    const newValue = Array.from(current).join(",");
    updateFilters({ with_genres: newValue || null });
  };

  const resetFilters = () => {
    startTransition(() => {
      router.push(`/${mediaType === "movie" ? "movies" : "tv"}`);
    });
  };

  const hasActiveFilters =
    currentFilters.with_genres ||
    currentFilters[dateGteKey] ||
    currentFilters[dateLteKey] ||
    (currentFilters.sort_by && currentFilters.sort_by !== "popularity.desc");

  return (
    <div className="space-y-6">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </span>
        {hasActiveFilters && (
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs">
            Active
          </span>
        )}
      </button>

      {/* Filter Content */}
      <div className={`space-y-6 ${isOpen ? "block" : "hidden lg:block"}`}>
        {/* Sort */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Sort</h3>
          <select
            value={currentFilters.sort_by ?? "popularity.desc"}
            onChange={(e) => updateFilters({ sort_by: e.target.value })}
            disabled={isPending}
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Genres */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const isSelected = selectedGenres.includes(genre.id.toString());
              return (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id.toString())}
                  disabled={isPending}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">
            {mediaType === "movie" ? "Release Date" : "Air Date"}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-white/60">From</label>
              <input
                type="date"
                value={currentFilters[dateGteKey] ?? ""}
                onChange={(e) =>
                  updateFilters({ [dateGteKey]: e.target.value || null })
                }
                disabled={isPending}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">To</label>
              <input
                type="date"
                value={currentFilters[dateLteKey] ?? ""}
                onChange={(e) =>
                  updateFilters({ [dateLteKey]: e.target.value || null })
                }
                disabled={isPending}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
