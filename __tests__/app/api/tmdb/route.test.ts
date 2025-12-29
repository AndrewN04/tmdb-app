/**
 * Tests for app/api/tmdb/[...segments]/route.ts
 * Covers the TMDB proxy API route.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetchTmdb before importing route
const mockFetchTmdb = vi.fn();

vi.mock("@/lib/tmdb/fetcher", () => ({
  fetchTmdb: (...args: unknown[]) => mockFetchTmdb(...args),
}));

// Import route after mocks
import { GET } from "@/app/api/tmdb/[...segments]/route";

describe("TMDB API route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  function createRequest(path: string, searchParams?: Record<string, string>) {
    const url = new URL(`http://localhost:3000/api/tmdb/${path}`);
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    return new Request(url.toString());
  }

  describe("segment mapping", () => {
    it("should map 'popular' to 'movie/popular'", async () => {
      mockFetchTmdb.mockResolvedValue({ results: [] });

      const request = createRequest("popular");
      await GET(request, {
        params: Promise.resolve({ segments: ["popular"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "movie/popular",
        expect.any(Object)
      );
    });

    it("should map 'upcoming' to 'movie/upcoming'", async () => {
      mockFetchTmdb.mockResolvedValue({ results: [] });

      const request = createRequest("upcoming");
      await GET(request, {
        params: Promise.resolve({ segments: ["upcoming"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "movie/upcoming",
        expect.any(Object)
      );
    });

    it("should map 'top-rated' to 'movie/top_rated'", async () => {
      mockFetchTmdb.mockResolvedValue({ results: [] });

      const request = createRequest("top-rated");
      await GET(request, {
        params: Promise.resolve({ segments: ["top-rated"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "movie/top_rated",
        expect.any(Object)
      );
    });

    it("should map 'trending' to 'trending/movie/day' by default", async () => {
      mockFetchTmdb.mockResolvedValue({ results: [] });

      const request = createRequest("trending");
      await GET(request, {
        params: Promise.resolve({ segments: ["trending"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "trending/movie/day",
        expect.any(Object)
      );
    });

    it("should map 'trending' with window=week parameter", async () => {
      mockFetchTmdb.mockResolvedValue({ results: [] });

      const request = createRequest("trending", { window: "week" });
      await GET(request, {
        params: Promise.resolve({ segments: ["trending"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "trending/movie/week",
        expect.any(Object)
      );
    });

    it("should map 'movie/{id}' to 'movie/{id}'", async () => {
      mockFetchTmdb.mockResolvedValue({ id: 12345 });

      const request = createRequest("movie/12345");
      await GET(request, {
        params: Promise.resolve({ segments: ["movie", "12345"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "movie/12345",
        expect.any(Object)
      );
    });

    it("should map 'movie/{id}/credits' to 'movie/{id}/credits'", async () => {
      mockFetchTmdb.mockResolvedValue({ cast: [] });

      const request = createRequest("movie/12345/credits");
      await GET(request, {
        params: Promise.resolve({ segments: ["movie", "12345", "credits"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "movie/12345/credits",
        expect.any(Object)
      );
    });
  });

  describe("invalid routes", () => {
    it("should return 400 for empty segments", async () => {
      const request = createRequest("");
      const response = await GET(request, {
        params: Promise.resolve({ segments: [] }),
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Unsupported TMDB route");
    });

    it("should return 400 for unknown route", async () => {
      const request = createRequest("unknown");
      const response = await GET(request, {
        params: Promise.resolve({ segments: ["unknown"] }),
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Unsupported TMDB route");
    });

    it("should return 400 for movie with no ID", async () => {
      const request = createRequest("movie");
      const response = await GET(request, {
        params: Promise.resolve({ segments: ["movie"] }),
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Unsupported TMDB route");
    });
  });

  describe("search params forwarding", () => {
    it("should forward page parameter", async () => {
      mockFetchTmdb.mockResolvedValue({ results: [], page: 2 });

      const request = createRequest("popular", { page: "2" });
      await GET(request, {
        params: Promise.resolve({ segments: ["popular"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "movie/popular",
        expect.objectContaining({
          searchParams: { page: "2" },
        })
      );
    });

    it("should remove window parameter from forwarded params", async () => {
      mockFetchTmdb.mockResolvedValue({ results: [] });

      const request = createRequest("trending", { window: "week", page: "1" });
      await GET(request, {
        params: Promise.resolve({ segments: ["trending"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "trending/movie/week",
        expect.objectContaining({
          searchParams: { page: "1" },
        })
      );

      // Ensure window is not in searchParams
      const callArgs = mockFetchTmdb.mock.calls[0][1];
      expect(callArgs.searchParams.window).toBeUndefined();
    });
  });

  describe("caching", () => {
    it("should set Cache-Control header with default revalidate", async () => {
      mockFetchTmdb.mockResolvedValue({ results: [] });

      const request = createRequest("popular");
      const response = await GET(request, {
        params: Promise.resolve({ segments: ["popular"] }),
      });

      expect(response.headers.get("Cache-Control")).toBe(
        "public, s-maxage=3600"
      );
    });

    it("should use force-cache strategy", async () => {
      mockFetchTmdb.mockResolvedValue({ results: [] });

      const request = createRequest("popular");
      await GET(request, {
        params: Promise.resolve({ segments: ["popular"] }),
      });

      expect(mockFetchTmdb).toHaveBeenCalledWith(
        "movie/popular",
        expect.objectContaining({
          init: expect.objectContaining({
            cache: "force-cache",
          }),
        })
      );
    });
  });

  describe("error handling", () => {
    it("should return 502 on fetch error with message", async () => {
      mockFetchTmdb.mockRejectedValue(new Error("TMDB API failed"));

      const request = createRequest("popular");
      const response = await GET(request, {
        params: Promise.resolve({ segments: ["popular"] }),
      });

      expect(response.status).toBe(502);
      const json = await response.json();
      expect(json.error).toBe("TMDB API failed");
    });

    it("should return generic message for non-Error throws", async () => {
      mockFetchTmdb.mockRejectedValue("unknown error");

      const request = createRequest("popular");
      const response = await GET(request, {
        params: Promise.resolve({ segments: ["popular"] }),
      });

      expect(response.status).toBe(502);
      const json = await response.json();
      expect(json.error).toBe("TMDB upstream error");
    });
  });

  describe("successful responses", () => {
    it("should return JSON payload on success", async () => {
      const mockPayload = {
        results: [{ id: 1, title: "Movie" }],
        page: 1,
        total_pages: 10,
      };
      mockFetchTmdb.mockResolvedValue(mockPayload);

      const request = createRequest("popular");
      const response = await GET(request, {
        params: Promise.resolve({ segments: ["popular"] }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual(mockPayload);
    });
  });
});
