"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { MediaGrid } from "@/components/media-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Movie, TVShow } from "@/types/tmdb";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart, Bookmark, Film, Sparkles, User } from "lucide-react";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const isAuthenticated = !!session?.user;

  const favorites = useQuery(api.actions.getUserLibrary, 
    isAuthenticated ? { filter: "favorite" } : "skip"
  );
  const watchlist = useQuery(api.actions.getUserLibrary, 
    isAuthenticated ? { filter: "watchlist" } : "skip"
  );

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isPending, isAuthenticated, router]);

  if (isPending) {
    return (
      <div className="container py-12 px-4 sm:px-8 max-w-7xl mx-auto min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full shimmer" />
          <p className="text-muted-foreground animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  interface StoredItem {
    tmdbId: number;
    posterPath?: string;
    mediaType: "movie" | "tv";
    title: string;
  }

  const mapToMedia = (items: StoredItem[]): (Movie | TVShow)[] => {
    return items.map(item => ({
      id: item.tmdbId,
      poster_path: item.posterPath || null,
      backdrop_path: null,
      overview: "",
      vote_average: 0,
      vote_count: 0,
      popularity: 0,
      genre_ids: [],
      original_language: "en",
      ...(item.mediaType === "movie" 
        ? { title: item.title, original_title: item.title, release_date: "", video: false }
        : { name: item.title, original_name: item.title, first_air_date: "", origin_country: [] }
      ),
      media_type: item.mediaType,
    })) as (Movie | TVShow)[];
  };

  const favoriteItems = favorites ? mapToMedia(favorites) : [];
  const watchlistItems = watchlist ? mapToMedia(watchlist) : [];

  return (
    <div className="container py-8 px-4 sm:px-8 max-w-7xl mx-auto min-h-[80vh]">
      {/* Profile Header */}
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
            <span className="text-3xl font-bold gradient-text">
              {session.user.name?.charAt(0).toUpperCase() || <User className="w-8 h-8 text-primary" />}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        
        {/* User info */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="text-foreground font-medium">{session.user.name || session.user.email}</span>
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>{favoriteItems.length} Favorites</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Bookmark className="w-4 h-4 text-blue-400" />
              <span>{watchlistItems.length} Watchlist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted/50 p-1 text-muted-foreground mb-8 gap-1">
          <TabsTrigger 
            value="favorites" 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Heart className="w-4 h-4" />
            Favorites ({favoriteItems.length})
          </TabsTrigger>
          <TabsTrigger 
            value="watchlist"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Bookmark className="w-4 h-4" />
            Watchlist ({watchlistItems.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites" className="space-y-6 mt-0">
          {favoriteItems.length > 0 ? (
            <MediaGrid items={favoriteItems} />
          ) : (
            <EmptyState 
              icon={<Heart className="w-12 h-12 text-rose-400/50" />}
              title="No favorites yet"
              description="Start exploring and add movies or shows you love to your favorites."
            />
          )}
        </TabsContent>
        
        <TabsContent value="watchlist" className="space-y-6 mt-0">
          {watchlistItems.length > 0 ? (
            <MediaGrid items={watchlistItems} />
          ) : (
            <EmptyState 
              icon={<Bookmark className="w-12 h-12 text-blue-400/50" />}
              title="Your watchlist is empty"
              description="Add movies and shows you want to watch later to your watchlist."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-linear-to-br from-muted/30 to-muted/10">
      {/* Background decoration */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-primary/3 rounded-full blur-2xl" />
      
      <div className="relative flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-sm">{description}</p>
        
        {/* CTA hint */}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Film className="w-4 h-4" />
          <span>Browse our collection to get started</span>
        </div>
      </div>
    </div>
  );
}
