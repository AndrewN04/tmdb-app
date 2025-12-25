"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { BookmarkCheck, BookmarkPlus, Loader2, RefreshCw, Star, Trash2 } from "lucide-react";
import clsx from "clsx";

import {
  getWatchlistStatus,
  removeWatchlistItem,
  saveWatchlistItem,
  updateWatchlistMeta,
} from "@/app/actions/watchlist";

interface WatchlistPanelProps {
  tmdbId: number;
  title: string;
  mediaType: "movie" | "tv";
  posterPath?: string | null;
  backdropPath?: string | null;
}

interface WatchlistSnapshot {
  favorite: boolean;
  notes: string;
  categories: string[];
}

export function WatchlistPanel({ tmdbId, title, mediaType, posterPath, backdropPath }: WatchlistPanelProps) {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [item, setItem] = useState<WatchlistSnapshot | null>(null);
  const [notes, setNotes] = useState("");
  const [categoriesInput, setCategoriesInput] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isAuthenticated = Boolean(sessionEmail);

  const hasItem = Boolean(item);
  const categoriesList = useMemo(() => {
    return categoriesInput
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }, [categoriesInput]);

  const resetFeedback = () => {
    setFeedback(null);
    setError(null);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const payload = await getWatchlistStatus({ tmdbId, mediaType });

        if (cancelled) return;

        if (!payload.user) {
          setSessionEmail(null);
          setItem(null);
          setNotes("");
          setCategoriesInput("");
          setFavorite(false);
          return;
        }

        setSessionEmail(payload.user.email ?? null);
        if (payload.item) {
          const normalized: WatchlistSnapshot = {
            favorite: Boolean(payload.item.favorite),
            notes: payload.item.notes?.trim() ?? "",
            categories: payload.item.categories ?? [],
          };
          setItem(normalized);
          setNotes(normalized.notes);
          setCategoriesInput(normalized.categories.join(", "));
          setFavorite(normalized.favorite);
        } else {
          setItem(null);
          setNotes("");
          setCategoriesInput("");
          setFavorite(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load status");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadStatus();
    return () => {
      cancelled = true;
    };
  }, [tmdbId, mediaType]);

  const handleSave = () => {
    if (!isAuthenticated) return;
    resetFeedback();

    startTransition(async () => {
      try {
        const result = await saveWatchlistItem({
          tmdbId,
          title,
          mediaType,
          posterPath,
          backdropPath,
          favorite,
          notes,
          categories: categoriesList,
        });

        const normalized: WatchlistSnapshot = {
          favorite: result.item.favorite,
          notes: result.item.notes ?? "",
          categories: result.item.categories ?? [],
        };
        setItem(normalized);
        setNotes(normalized.notes);
        setCategoriesInput(normalized.categories.join(", "));
        setFavorite(normalized.favorite);
        setFeedback(hasItem ? "Watchlist updated" : "Added to watchlist");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to save";
        setError(message);
      }
    });
  };

  const handleRemove = () => {
    if (!isAuthenticated) return;
    resetFeedback();

    startTransition(async () => {
      try {
        await removeWatchlistItem({ tmdbId, mediaType });
        setItem(null);
        setFavorite(false);
        setNotes("");
        setCategoriesInput("");
        setFeedback("Removed from watchlist");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to remove";
        setError(message);
      }
    });
  };

  const handleFavoriteToggle = () => {
    const nextFavorite = !favorite;
    setFavorite(nextFavorite);
    resetFeedback();

    if (!isAuthenticated) {
      setError("Sign in to update favorites");
      return;
    }

    if (!hasItem) {
      setFeedback("Will favorite once saved");
      return;
    }

    startTransition(async () => {
      try {
        await updateWatchlistMeta({ tmdbId, mediaType, favorite: nextFavorite });
        setItem((prev) =>
          prev
            ? {
                ...prev,
                favorite: nextFavorite,
              }
            : prev
        );
        setFeedback(nextFavorite ? "Marked favorite" : "Favorite cleared");
      } catch (err) {
        setFavorite(!nextFavorite);
        const message = err instanceof Error ? err.message : "Unable to update";
        setError(message);
      }
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Watchlist</p>
          {isAuthenticated ? (
            <p className="text-sm text-white/70">
              {hasItem ? "You are tracking this title" : "Save personal notes and tags"}
            </p>
          ) : (
            <p className="text-sm text-white/70">Sign in to manage your watchlist</p>
          )}
        </div>
        {isAuthenticated && sessionEmail && (
          <span className="text-xs text-white/60">{sessionEmail}</span>
        )}
      </div>

      {isAuthenticated ? (
        <div className="mt-6 min-h-80 space-y-4">
          {isLoading && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Syncing status
            </div>
          )}
          <button
            type="button"
            onClick={handleFavoriteToggle}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
              favorite
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-300"
                : "border-white/10 text-white/80 hover:border-white/30"
            )}
            disabled={isPending}
          >
            <Star className={clsx("h-4 w-4", favorite ? "text-yellow-300" : "text-white/70")} />
            {favorite ? "Favorite" : "Mark as favorite"}
          </button>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Thoughts, reminders, who recommended it..."
              className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Categories</label>
            <input
              type="text"
              value={categoriesInput}
              onChange={(event) => setCategoriesInput(event.target.value)}
              placeholder="Comma separated tags"
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
              disabled={isPending}
            />
            {categoriesList.length > 0 && (
              <p className="text-xs text-white/50">{categoriesList.join(" · ")}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black min-w-44"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasItem ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <BookmarkPlus className="h-4 w-4" />
              )}
              {hasItem ? "Update watchlist" : "Add to watchlist"}
            </button>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending || !hasItem}
              className={clsx(
                "inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 hover:border-white/40 transition-opacity",
                hasItem ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>

          <p className={clsx("text-sm h-5", feedback ? "text-emerald-300" : (error || loadError) ? "text-red-400" : "invisible")}>
            {feedback ?? error ?? loadError ?? "\u00A0"}
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4">
          <p className="text-sm text-white/70">
            Sign in to add notes, favorites, and categories for this movie.
          </p>
          <a
            href="/sign-in"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
          >
            Sign in
          </a>
        </div>
      )}
    </section>
  );
}
