/**
 * Tests for lib/tmdb/fetcher.ts
 * Covers the fetchTmdb function with mocked fetch.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Store original env
const originalEnv = { ...process.env };

describe("fetchTmdb", () => {
  beforeEach(() => {
    vi.resetModules();
    // Reset environment
    process.env = { ...originalEnv };
    // Mock global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("API key validation", () => {
    it("should throw error when TMDB_API_KEY is not set", async () => {
      delete process.env.TMDB_API_KEY;

      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");

      await expect(fetchTmdb("movie/popular")).rejects.toThrow(
        "TMDB_API_KEY is not configured"
      );
    });

    it("should not throw when TMDB_API_KEY is set", async () => {
      process.env.TMDB_API_KEY = "test-api-key";
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      } as Response);

      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");

      await expect(fetchTmdb("movie/popular")).resolves.toBeDefined();
    });
  });

  describe("authentication methods", () => {
    it("should use api_key query param for v3 API keys", async () => {
      process.env.TMDB_API_KEY = "abc123v3key";
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      } as Response);

      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      await fetchTmdb("movie/popular");

      const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain("api_key=abc123v3key");
    });

    it("should use Bearer token for v4 JWT tokens", async () => {
      process.env.TMDB_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      } as Response);

      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      await fetchTmdb("movie/popular");

      const calledInit = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
      const headers = new Headers(calledInit.headers);
      expect(headers.get("Authorization")).toContain("Bearer eyJ");
    });
  });

  describe("URL construction", () => {
    beforeEach(() => {
      process.env.TMDB_API_KEY = "test-key";
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      } as Response);
    });

    it("should construct correct base URL", async () => {
      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      await fetchTmdb("movie/popular");

      const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain("https://api.themoviedb.org/3/movie/popular");
    });

    it("should normalize endpoints with leading slashes", async () => {
      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      await fetchTmdb("///movie/popular");

      const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain("/3/movie/popular");
      expect(calledUrl).not.toContain("///");
    });

    it("should append search params to URL", async () => {
      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      await fetchTmdb("movie/popular", {
        searchParams: { page: "2", language: "en-US" },
      });

      const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("language=en-US");
    });

    it("should skip null/undefined/empty search params", async () => {
      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      await fetchTmdb("movie/popular", {
        searchParams: { page: "1", empty: "", nullVal: null, undef: undefined },
      });

      const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain("page=1");
      expect(calledUrl).not.toContain("empty=");
      expect(calledUrl).not.toContain("nullVal=");
      expect(calledUrl).not.toContain("undef=");
    });
  });

  describe("response handling", () => {
    beforeEach(() => {
      process.env.TMDB_API_KEY = "test-key";
    });

    it("should return parsed JSON on success", async () => {
      const mockData = { page: 1, results: [{ id: 1, title: "Test" }] };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);

      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      const result = await fetchTmdb("movie/popular");

      expect(result).toEqual(mockData);
    });

    it("should throw error on non-ok response", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      } as Response);

      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");

      await expect(fetchTmdb("movie/popular")).rejects.toThrow("TMDB request failed (401)");
    });

    it("should include response body in error message", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Resource not found"),
      } as Response);

      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");

      await expect(fetchTmdb("movie/999999")).rejects.toThrow("Resource not found");
    });
  });

  describe("request options", () => {
    beforeEach(() => {
      process.env.TMDB_API_KEY = "test-key";
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });

    it("should set accept header to application/json", async () => {
      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      await fetchTmdb("movie/popular");

      const calledInit = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
      const headers = new Headers(calledInit.headers);
      expect(headers.get("accept")).toBe("application/json");
    });

    it("should merge custom headers with defaults", async () => {
      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      await fetchTmdb("movie/popular", {
        init: { headers: { "X-Custom": "value" } },
      });

      const calledInit = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
      const headers = new Headers(calledInit.headers);
      expect(headers.get("accept")).toBe("application/json");
      expect(headers.get("X-Custom")).toBe("value");
    });

    it("should pass through fetch init options", async () => {
      const { fetchTmdb } = await import("@/lib/tmdb/fetcher");
      await fetchTmdb("movie/popular", {
        init: { cache: "force-cache", next: { revalidate: 3600 } },
      });

      const calledInit = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
      expect(calledInit.cache).toBe("force-cache");
    });
  });
});
