/**
 * Tests for app/actions/watchlist.ts
 * Covers server actions for watchlist CRUD operations.
 * Tests utility functions and database interactions with mocks.
 */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";

// Define mock functions at module scope for hoisting
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
    },
    watchlistItem: {
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Import after mocks
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  saveWatchlistItem,
  updateWatchlistMeta,
  removeWatchlistItem,
  getWatchlistStatus,
  getUserWatchlist,
} from "@/app/actions/watchlist";

describe("watchlist actions", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  const mockWatchlistItem = {
    id: "item-1",
    userId: "user-123",
    tmdbId: 12345,
    title: "Test Movie",
    mediaType: "movie",
    posterPath: "/poster.jpg",
    backdropPath: "/backdrop.jpg",
    favorite: false,
    notes: "Great movie",
    categories: ["action", "sci-fi"],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
  };

  // Get typed mock references
  const mockRevalidatePath = revalidatePath as Mock;
  const mockCreateSupabaseServerClient = createSupabaseServerClient as Mock;
  const mockPrismaUserUpsert = prisma.user.upsert as Mock;
  const mockPrismaWatchlistItemUpsert = prisma.watchlistItem.upsert as Mock;
  const mockPrismaWatchlistItemUpdate = prisma.watchlistItem.update as Mock;
  const mockPrismaWatchlistItemDelete = prisma.watchlistItem.delete as Mock;
  const mockPrismaWatchlistItemFindUnique = prisma.watchlistItem.findUnique as Mock;
  const mockPrismaWatchlistItemFindMany = prisma.watchlistItem.findMany as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default Supabase mock
    mockCreateSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    });
    
    mockPrismaUserUpsert.mockResolvedValue(mockUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("coerceTmdbId (tested via saveWatchlistItem)", () => {
    it("should accept valid numeric tmdbId", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      const result = await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
      });

      expect(result.success).toBe(true);
      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId_tmdbId_mediaType: expect.objectContaining({
              tmdbId: 12345,
              mediaType: "movie",
            }),
          }),
        })
      );
    });

    it("should accept valid string tmdbId and convert to number", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: "12345",
        title: "Test",
        mediaType: "movie",
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId_tmdbId_mediaType: expect.objectContaining({
              tmdbId: 12345,
            }),
          }),
        })
      );
    });

    it("should reject invalid tmdbId (zero)", async () => {
      await expect(
        saveWatchlistItem({
          tmdbId: 0,
          title: "Test",
          mediaType: "movie",
        })
      ).rejects.toThrow("Invalid TMDB id provided");
    });

    it("should reject invalid tmdbId (negative)", async () => {
      await expect(
        saveWatchlistItem({
          tmdbId: -1,
          title: "Test",
          mediaType: "movie",
        })
      ).rejects.toThrow("Invalid TMDB id provided");
    });

    it("should reject invalid tmdbId (NaN string)", async () => {
      await expect(
        saveWatchlistItem({
          tmdbId: "not-a-number",
          title: "Test",
          mediaType: "movie",
        })
      ).rejects.toThrow("Invalid TMDB id provided");
    });
  });

  describe("sanitizeNotes (tested via saveWatchlistItem)", () => {
    it("should accept valid notes", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
        notes: "Great movie!",
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            notes: "Great movie!",
          }),
        })
      );
    });

    it("should trim whitespace from notes", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
        notes: "  trimmed  ",
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            notes: "trimmed",
          }),
        })
      );
    });

    it("should convert empty notes to null", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
        notes: "   ",
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            notes: null,
          }),
        })
      );
    });

    it("should reject notes exceeding 2000 characters", async () => {
      const longNotes = "x".repeat(2001);

      await expect(
        saveWatchlistItem({
          tmdbId: 12345,
          title: "Test",
          mediaType: "movie",
          notes: longNotes,
        })
      ).rejects.toThrow("Notes exceed 2000 characters");
    });

    it("should accept notes at exactly 2000 characters", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);
      const exactNotes = "x".repeat(2000);

      const result = await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
        notes: exactNotes,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("sanitizeCategories (tested via saveWatchlistItem)", () => {
    it("should accept valid categories array", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
        categories: ["action", "comedy"],
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            categories: ["action", "comedy"],
          }),
        })
      );
    });

    it("should trim whitespace from categories", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
        categories: ["  action  ", "  comedy  "],
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            categories: ["action", "comedy"],
          }),
        })
      );
    });

    it("should filter out empty categories", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
        categories: ["action", "", "  ", "comedy"],
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            categories: ["action", "comedy"],
          }),
        })
      );
    });

    it("should limit categories to 12 items", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);
      const manyCategories = Array.from({ length: 20 }, (_, i) => `cat${i}`);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
        categories: manyCategories,
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            categories: expect.arrayContaining(["cat0", "cat11"]),
          }),
        })
      );

      const createCall = mockPrismaWatchlistItemUpsert.mock.calls[0][0];
      expect(createCall.create.categories.length).toBe(12);
    });

    it("should return empty array for undefined categories", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
        categories: undefined,
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            categories: [],
          }),
        })
      );
    });
  });

  describe("saveWatchlistItem", () => {
    it("should require authentication", async () => {
      mockCreateSupabaseServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      });

      await expect(
        saveWatchlistItem({
          tmdbId: 12345,
          title: "Test",
          mediaType: "movie",
        })
      ).rejects.toThrow("You must be signed in to manage your watchlist");
    });

    it("should throw on auth error", async () => {
      mockCreateSupabaseServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Auth error" },
          }),
        },
      });

      await expect(
        saveWatchlistItem({
          tmdbId: 12345,
          title: "Test",
          mediaType: "movie",
        })
      ).rejects.toThrow("Auth error");
    });

    it("should sync user record before saving", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
      });

      expect(mockPrismaUserUpsert).toHaveBeenCalledWith({
        where: { id: "user-123" },
        create: { id: "user-123", email: "test@example.com" },
        update: { email: "test@example.com" },
      });
    });

    it("should upsert watchlist item with all fields", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test Movie",
        mediaType: "movie",
        posterPath: "/poster.jpg",
        backdropPath: "/backdrop.jpg",
        favorite: true,
        notes: "My notes",
        categories: ["action"],
      });

      expect(mockPrismaWatchlistItemUpsert).toHaveBeenCalledWith({
        where: {
          userId_tmdbId_mediaType: {
            userId: "user-123",
            tmdbId: 12345,
            mediaType: "movie",
          },
        },
        create: {
          userId: "user-123",
          tmdbId: 12345,
          title: "Test Movie",
          mediaType: "movie",
          posterPath: "/poster.jpg",
          backdropPath: "/backdrop.jpg",
          favorite: true,
          notes: "My notes",
          categories: ["action"],
        },
        update: {
          title: "Test Movie",
          posterPath: "/poster.jpg",
          backdropPath: "/backdrop.jpg",
          favorite: true,
          notes: "My notes",
          categories: ["action"],
        },
      });
    });

    it("should revalidate paths after save for movie", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith("/profile");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/movie/12345");
    });

    it("should revalidate paths after save for tv", async () => {
      const tvItem = { ...mockWatchlistItem, mediaType: "tv" };
      mockPrismaWatchlistItemUpsert.mockResolvedValue(tvItem);

      await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test TV Show",
        mediaType: "tv",
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith("/profile");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/tv/12345");
    });

    it("should return success with item", async () => {
      mockPrismaWatchlistItemUpsert.mockResolvedValue(mockWatchlistItem);

      const result = await saveWatchlistItem({
        tmdbId: 12345,
        title: "Test",
        mediaType: "movie",
      });

      expect(result).toEqual({
        success: true,
        item: mockWatchlistItem,
      });
    });
  });

  describe("updateWatchlistMeta", () => {
    it("should require authentication", async () => {
      mockCreateSupabaseServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      });

      await expect(
        updateWatchlistMeta({ tmdbId: 12345, mediaType: "movie", favorite: true })
      ).rejects.toThrow("You must be signed in to manage your watchlist");
    });

    it("should update favorite field only", async () => {
      mockPrismaWatchlistItemUpdate.mockResolvedValue(mockWatchlistItem);

      await updateWatchlistMeta({
        tmdbId: 12345,
        mediaType: "movie",
        favorite: true,
      });

      expect(mockPrismaWatchlistItemUpdate).toHaveBeenCalledWith({
        where: {
          userId_tmdbId_mediaType: {
            userId: "user-123",
            tmdbId: 12345,
            mediaType: "movie",
          },
        },
        data: {
          favorite: true,
        },
      });
    });

    it("should update notes field only", async () => {
      mockPrismaWatchlistItemUpdate.mockResolvedValue(mockWatchlistItem);

      await updateWatchlistMeta({
        tmdbId: 12345,
        mediaType: "movie",
        notes: "Updated notes",
      });

      expect(mockPrismaWatchlistItemUpdate).toHaveBeenCalledWith({
        where: {
          userId_tmdbId_mediaType: {
            userId: "user-123",
            tmdbId: 12345,
            mediaType: "movie",
          },
        },
        data: {
          notes: "Updated notes",
        },
      });
    });

    it("should update categories field only", async () => {
      mockPrismaWatchlistItemUpdate.mockResolvedValue(mockWatchlistItem);

      await updateWatchlistMeta({
        tmdbId: 12345,
        mediaType: "movie",
        categories: ["drama"],
      });

      expect(mockPrismaWatchlistItemUpdate).toHaveBeenCalledWith({
        where: {
          userId_tmdbId_mediaType: {
            userId: "user-123",
            tmdbId: 12345,
            mediaType: "movie",
          },
        },
        data: {
          categories: ["drama"],
        },
      });
    });

    it("should revalidate paths after update for movie", async () => {
      mockPrismaWatchlistItemUpdate.mockResolvedValue(mockWatchlistItem);

      await updateWatchlistMeta({ tmdbId: 12345, mediaType: "movie", favorite: true });

      expect(mockRevalidatePath).toHaveBeenCalledWith("/profile");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/movie/12345");
    });

    it("should revalidate paths after update for tv", async () => {
      const tvItem = { ...mockWatchlistItem, mediaType: "tv" };
      mockPrismaWatchlistItemUpdate.mockResolvedValue(tvItem);

      await updateWatchlistMeta({ tmdbId: 12345, mediaType: "tv", favorite: true });

      expect(mockRevalidatePath).toHaveBeenCalledWith("/profile");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/tv/12345");
    });
  });

  describe("removeWatchlistItem", () => {
    it("should require authentication", async () => {
      mockCreateSupabaseServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      });

      await expect(removeWatchlistItem({ tmdbId: 12345, mediaType: "movie" })).rejects.toThrow(
        "You must be signed in to manage your watchlist"
      );
    });

    it("should delete watchlist item", async () => {
      mockPrismaWatchlistItemDelete.mockResolvedValue(mockWatchlistItem);

      await removeWatchlistItem({ tmdbId: 12345, mediaType: "movie" });

      expect(mockPrismaWatchlistItemDelete).toHaveBeenCalledWith({
        where: {
          userId_tmdbId_mediaType: {
            userId: "user-123",
            tmdbId: 12345,
            mediaType: "movie",
          },
        },
      });
    });

    it("should revalidate paths after remove for movie", async () => {
      mockPrismaWatchlistItemDelete.mockResolvedValue(mockWatchlistItem);

      await removeWatchlistItem({ tmdbId: 12345, mediaType: "movie" });

      expect(mockRevalidatePath).toHaveBeenCalledWith("/profile");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/movie/12345");
    });

    it("should revalidate paths after remove for tv", async () => {
      mockPrismaWatchlistItemDelete.mockResolvedValue(mockWatchlistItem);

      await removeWatchlistItem({ tmdbId: 12345, mediaType: "tv" });

      expect(mockRevalidatePath).toHaveBeenCalledWith("/profile");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/tv/12345");
    });

    it("should return success", async () => {
      mockPrismaWatchlistItemDelete.mockResolvedValue(mockWatchlistItem);

      const result = await removeWatchlistItem({ tmdbId: 12345, mediaType: "movie" });

      expect(result).toEqual({ success: true });
    });
  });

  describe("getWatchlistStatus", () => {
    it("should return empty status when not authenticated", async () => {
      mockCreateSupabaseServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      });

      const result = await getWatchlistStatus({ tmdbId: 12345, mediaType: "movie" });

      expect(result).toEqual({ user: null, item: null });
    });

    it("should return user and item when authenticated with item", async () => {
      mockPrismaWatchlistItemFindUnique.mockResolvedValue(mockWatchlistItem);

      const result = await getWatchlistStatus({ tmdbId: 12345, mediaType: "movie" });

      expect(result).toEqual({
        user: {
          id: "user-123",
          email: "test@example.com",
        },
        item: {
          favorite: false,
          notes: "Great movie",
          categories: ["action", "sci-fi"],
        },
      });
    });

    it("should return user without item when authenticated but no item exists", async () => {
      mockPrismaWatchlistItemFindUnique.mockResolvedValue(null);

      const result = await getWatchlistStatus({ tmdbId: 12345, mediaType: "movie" });

      expect(result).toEqual({
        user: {
          id: "user-123",
          email: "test@example.com",
        },
        item: null,
      });
    });

    it("should return empty status on recoverable auth error (500+)", async () => {
      mockCreateSupabaseServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Server error", status: 500 },
          }),
        },
      });

      const result = await getWatchlistStatus({ tmdbId: 12345, mediaType: "movie" });

      expect(result).toEqual({ user: null, item: null });
    });

    it("should return empty status on session-related auth error", async () => {
      mockCreateSupabaseServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Session expired", status: 401 },
          }),
        },
      });

      const result = await getWatchlistStatus({ tmdbId: 12345, mediaType: "movie" });

      expect(result).toEqual({ user: null, item: null });
    });

    it("should throw on non-recoverable auth error", async () => {
      mockCreateSupabaseServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Invalid credentials", status: 401 },
          }),
        },
      });

      await expect(getWatchlistStatus({ tmdbId: 12345, mediaType: "movie" })).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("getUserWatchlist", () => {
    it("should return empty array when not authenticated", async () => {
      mockCreateSupabaseServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      });

      const result = await getUserWatchlist();

      expect(result).toEqual([]);
    });

    it("should return mapped watchlist items", async () => {
      mockPrismaWatchlistItemFindMany.mockResolvedValue([mockWatchlistItem]);

      const result = await getUserWatchlist();

      expect(result).toEqual([
        {
          id: "item-1",
          tmdbId: 12345,
          title: "Test Movie",
          mediaType: "movie",
          posterPath: "/poster.jpg",
          backdropPath: "/backdrop.jpg",
          notes: "Great movie",
          favorite: false,
          categories: ["action", "sci-fi"],
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      ]);
    });

    it("should order items by createdAt descending by default", async () => {
      mockPrismaWatchlistItemFindMany.mockResolvedValue([]);

      await getUserWatchlist();

      expect(mockPrismaWatchlistItemFindMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter by mediaType when specified", async () => {
      mockPrismaWatchlistItemFindMany.mockResolvedValue([]);

      await getUserWatchlist({ mediaType: "movie" });

      expect(mockPrismaWatchlistItemFindMany).toHaveBeenCalledWith({
        where: { userId: "user-123", mediaType: "movie" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter by favorites when specified", async () => {
      mockPrismaWatchlistItemFindMany.mockResolvedValue([]);

      await getUserWatchlist({ favoritesOnly: true });

      expect(mockPrismaWatchlistItemFindMany).toHaveBeenCalledWith({
        where: { userId: "user-123", favorite: true },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should use custom sort order when specified", async () => {
      mockPrismaWatchlistItemFindMany.mockResolvedValue([]);

      await getUserWatchlist({ sortBy: "title", sortOrder: "asc" });

      expect(mockPrismaWatchlistItemFindMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        orderBy: { title: "asc" },
      });
    });

    it("should return empty array on error", async () => {
      mockPrismaWatchlistItemFindMany.mockRejectedValue(new Error("DB error"));

      const result = await getUserWatchlist();

      expect(result).toEqual([]);
    });
  });
});
