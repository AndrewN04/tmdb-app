"use client";

import { Button } from "@/components/ui/button";
import { Heart, Bookmark } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ActionButtonsProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string;
}

export function ActionButtons({ tmdbId, mediaType, title, posterPath }: ActionButtonsProps) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const isAuthenticated = !!session?.user;
  
  const status = useQuery(api.actions.getLibraryItemStatus, 
    isAuthenticated ? { tmdbId, mediaType } : "skip"
  );
  
  const toggle = useMutation(api.actions.toggleLibraryStatus);

  const handleAction = async (action: "favorite" | "watchlist") => {
    if (!isAuthenticated) {
      toast("Authentication Required", {
        description: "Please sign in to save movies.",
        action: {
          label: "Sign In",
          onClick: () => router.push("/sign-in")
        }
      });
      return;
    }

    try {
      await toggle({
        tmdbId,
        mediaType,
        title,
        posterPath: posterPath || undefined,
        action,
      });
      toast.success(action === "favorite" ? 
        (status?.isFavorite ? "Removed from Favorites" : "Added to Favorites") : 
        (status?.isWatchlist ? "Removed from Watchlist" : "Added to Watchlist")
      );
    } catch {
      toast.error("Failed to update library");
    }
  };

  const isFavorite = status?.isFavorite ?? false;
  const isWatchlist = status?.isWatchlist ?? false;

  return (
    <div className="flex gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-forwards opacity-0">
      <Button 
        size="lg" 
        variant={isFavorite ? "default" : "secondary"}
        className={`rounded-full px-6 shadow-lg transition-all ${isFavorite ? 'bg-red-500 hover:bg-red-600 text-white' : 'backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white border-0'}`}
        onClick={() => handleAction("favorite")}
        disabled={isPending}
      >
        <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
        {isFavorite ? "Favorited" : "Favorite"}
      </Button>

      <Button 
        size="lg" 
        variant={isWatchlist ? "default" : "secondary"}
        className={`rounded-full px-6 shadow-lg transition-all ${isWatchlist ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white border-0'}`}
        onClick={() => handleAction("watchlist")}
        disabled={isPending}
      >
        <Bookmark className={`w-5 h-5 mr-2 ${isWatchlist ? 'fill-current' : ''}`} />
        {isWatchlist ? "In Watchlist" : "Watchlist"}
      </Button>
    </div>
  );
}
