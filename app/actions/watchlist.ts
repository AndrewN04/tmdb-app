"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Server actions that keep Supabase auth, Prisma persistence, and ISR revalidation in sync for watchlists.

const MAX_NOTES_LENGTH = 2000;

interface BaseWatchlistInput {
  tmdbId: number | string;
}

export interface WatchlistUpsertInput extends BaseWatchlistInput {
  title: string;
  mediaType: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  notes?: string | null;
  favorite?: boolean;
  categories?: string[];
}

export interface WatchlistMetaInput extends BaseWatchlistInput {
  notes?: string | null;
  categories?: string[];
  favorite?: boolean;
}

function coerceTmdbId(id: number | string | undefined): number {
  const value = typeof id === "string" ? Number.parseInt(id, 10) : Number(id);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid TMDB id provided");
  }
  return value;
}

function sanitizeNotes(notes?: string | null) {
  if (!notes) return null;
  const trimmed = notes.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_NOTES_LENGTH) {
    throw new Error(`Notes exceed ${MAX_NOTES_LENGTH} characters`);
  }
  return trimmed;
}

function sanitizeCategories(categories?: string[] | null) {
  if (!categories) return [];
  return categories
    .map((item) => item.trim())
    .filter((item) => Boolean(item))
    .slice(0, 12); // avoid runaway arrays
}

// Ensures the caller is authenticated before mutating the watchlist.
async function requireSupabaseUser(): Promise<SupabaseUser> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("You must be signed in to manage your watchlist");
  }

  return data.user;
}

// Prisma schema expects a User row; keep it mirrored with Supabase auth metadata.
async function syncUserRecord(user: SupabaseUser) {
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
    },
    update: {
      email: user.email,
    },
  });
}

// Bust relevant ISR caches so lists/detail pages reflect the latest mutation.
function revalidateWatchlistViews(tmdbId: number) {
  revalidatePath("/profile");
  revalidatePath(`/movie/${tmdbId}`);
}

export async function saveWatchlistItem(input: WatchlistUpsertInput) {
  const user = await requireSupabaseUser();
  await syncUserRecord(user);

  const tmdbId = coerceTmdbId(input.tmdbId);
  const notes = sanitizeNotes(input.notes);
  const categories = sanitizeCategories(input.categories);

  const item = await prisma.watchlistItem.upsert({
    where: {
      userId_tmdbId: {
        userId: user.id,
        tmdbId,
      },
    },
    create: {
      userId: user.id,
      tmdbId,
      title: input.title,
      mediaType: input.mediaType,
      posterPath: input.posterPath ?? null,
      backdropPath: input.backdropPath ?? null,
      favorite: Boolean(input.favorite),
      notes,
      categories,
    },
    update: {
      title: input.title,
      mediaType: input.mediaType,
      posterPath: input.posterPath ?? null,
      backdropPath: input.backdropPath ?? null,
      favorite: input.favorite ?? undefined,
      notes,
      categories,
    },
  });

  revalidateWatchlistViews(tmdbId);
  return { success: true, item };
}

export async function updateWatchlistMeta(input: WatchlistMetaInput) {
  const user = await requireSupabaseUser();
  await syncUserRecord(user);

  const tmdbId = coerceTmdbId(input.tmdbId);
  const notes = input.notes === undefined ? undefined : sanitizeNotes(input.notes);
  const categories = input.categories === undefined ? undefined : sanitizeCategories(input.categories);

  const item = await prisma.watchlistItem.update({
    where: {
      userId_tmdbId: {
        userId: user.id,
        tmdbId,
      },
    },
    data: {
      ...(notes !== undefined && { notes }),
      ...(categories !== undefined && { categories }),
      ...(input.favorite !== undefined && { favorite: input.favorite }),
    },
  });

  revalidateWatchlistViews(tmdbId);
  return { success: true, item };
}

export async function removeWatchlistItem(input: BaseWatchlistInput) {
  const user = await requireSupabaseUser();
  await syncUserRecord(user);

  const tmdbId = coerceTmdbId(input.tmdbId);

  try {
    await prisma.watchlistItem.delete({
      where: {
        userId_tmdbId: {
          userId: user.id,
          tmdbId,
        },
      },
    });
  } catch (error) {
    const isMissingRecord =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

    if (!isMissingRecord) {
      throw error;
    }
  }

  revalidateWatchlistViews(tmdbId);
  return { success: true };
}
