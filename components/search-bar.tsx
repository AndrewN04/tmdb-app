"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Film, Tv, Loader2 } from "lucide-react";

interface MediaSummary {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type?: "movie" | "tv" | "person";
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

interface SearchResult {
  results: MediaSummary[];
  total_results: number;
}

// Client-side helper functions (duplicated to avoid importing server-only lib)
function posterUrl(path: string | null, size = "w342"): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function getTitle(media: MediaSummary): string {
  return media.title ?? media.name ?? "Unknown";
}

function getMediaType(media: MediaSummary): "movie" | "tv" {
  if (media.media_type === "tv") return "tv";
  if (media.media_type === "movie") return "movie";
  return media.first_air_date ? "tv" : "movie";
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/tmdb/search/multi?query=${encodeURIComponent(query)}&include_adult=false`
        );
        if (res.ok) {
          const data: SearchResult = await res.json();
          // Filter to only movies and TV shows
          const filtered = data.results.filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
          );
          setResults(filtered.slice(0, 6));
          setTotalResults(data.total_results);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setQuery("");
      }
    },
    [query, router]
  );

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div
      ref={containerRef}
      className="relative hidden w-full max-w-md sm:block"
    >
      <form onSubmit={handleSubmit}>
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() =>
            query.length >= 2 && results.length > 0 && setIsOpen(true)
          }
          placeholder="Search movies, TV shows..."
          className="h-9 w-full rounded-full border border-white/10 bg-white/5 pr-10 pl-10 text-sm text-white placeholder:text-white/40 focus:border-emerald-500 focus:bg-white/10 focus:ring-0 focus:outline-none"
        />
        {isLoading && (
          <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="max-h-96 overflow-y-auto">
            {results.map((item) => {
              const mediaType = getMediaType(item);
              const href =
                mediaType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
              const poster = posterUrl(item.poster_path, "w92");
              const title = getTitle(item);
              const year =
                item.release_date?.slice(0, 4) ||
                item.first_air_date?.slice(0, 4);

              return (
                <Link
                  key={`${mediaType}-${item.id}`}
                  href={href}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                >
                  {/* Poster */}
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-slate-800">
                    {poster ? (
                      <Image
                        src={poster}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/20">
                        {mediaType === "tv" ? (
                          <Tv className="h-5 w-5" />
                        ) : (
                          <Film className="h-5 w-5" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-white">
                      {title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        {mediaType === "tv" ? (
                          <Tv className="h-3 w-3" />
                        ) : (
                          <Film className="h-3 w-3" />
                        )}
                        {mediaType === "tv" ? "TV Show" : "Movie"}
                      </span>
                      {year && <span>• {year}</span>}
                      {item.vote_average > 0 && (
                        <span>• ★ {item.vote_average.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All Results */}
          {totalResults > 6 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={handleResultClick}
              className="block border-t border-white/10 px-4 py-3 text-center text-sm font-medium text-emerald-400 transition-colors hover:bg-white/5"
            >
              View all {totalResults} results
            </Link>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-center text-sm text-white/50 shadow-2xl">
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
