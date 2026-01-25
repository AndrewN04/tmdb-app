"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { SearchResult, Movie, TVShow } from "@/types/tmdb";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";

interface SearchCommandProps {
  trigger?: React.ReactNode;
}

export function SearchCommand({ trigger }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  // Prevent hydration mismatch by only rendering dialog after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Custom Debounce Hook logic inline for now if file doesn't exist, 
  // but better to create the hook file. 
  // I will create the hook file in next step.
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    async function fetchResults() {
      setLoading(true);
      try {
        // We need a client-side search API or use Server Actions. 
        // Using tmdb lib directly here won't work client-side if it uses process.env server-only.
        // I will create a server action for search.
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (item: SearchResult) => {
    setOpen(false);
    if (item.media_type === 'movie') {
      router.push(`/movie/${item.id}`);
    } else if (item.media_type === 'tv') {
      router.push(`/tv/${item.id}`);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
          onClick={() => setOpen(true)}
        >
          <span className="hidden lg:inline-flex">Search movies...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      )}
      {mounted && (
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
            placeholder="Type a title to search..." 
            value={query}
            onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {loading && <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>}
          {!loading && results.length > 0 && (
              <CommandGroup heading="Results">
                {results.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.id}-${item.media_type === 'movie' ? (item as Movie).title : (item as TVShow).name}`}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="relative h-10 w-[27px] flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                        {item.poster_path && (
                            <Image 
                                src={getImageUrl(item.poster_path, 'w500')} 
                                alt="" 
                                fill 
                                className="object-cover"
                            />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {item.media_type === 'movie' ? (item as Movie).title : (item as TVShow).name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                             {item.media_type === 'movie' ? 
                                new Date((item as Movie).release_date).getFullYear() : 
                                new Date((item as TVShow).first_air_date).getFullYear()
                             }
                             {' • '}
                             {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                        </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
      )}
    </>
  );
}
