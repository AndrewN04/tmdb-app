/**
 * Tests for lib/tmdb.ts
 * Covers utility functions for TMDB data formatting.
 * Note: The async functions (getPopularMovies, etc.) are tested via fetchTmdb mocks.
 */
import { describe, it, expect } from "vitest";
import { formatYear, posterUrl, TMDB_IMAGE_BASE } from "@/lib/tmdb";
import type { MovieSummary } from "@/lib/tmdb";

describe("formatYear", () => {
  describe("with release_date", () => {
    it("should extract year from valid release_date", () => {
      const movie: MovieSummary = {
        id: 1,
        overview: "Test",
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        release_date: "2024-05-15",
      };
      expect(formatYear(movie)).toBe("2024");
    });

    it("should handle year at start of date string", () => {
      const movie: MovieSummary = {
        id: 1,
        overview: "Test",
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        release_date: "1999-12-31",
      };
      expect(formatYear(movie)).toBe("1999");
    });
  });

  describe("with first_air_date (TV shows)", () => {
    it("should extract year from first_air_date when release_date is missing", () => {
      const movie: MovieSummary = {
        id: 1,
        overview: "Test",
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        first_air_date: "2023-06-15", // Use mid-year to avoid timezone issues
      };
      expect(formatYear(movie)).toBe("2023");
    });

    it("should prefer release_date over first_air_date", () => {
      const movie: MovieSummary = {
        id: 1,
        overview: "Test",
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        release_date: "2024-06-15", // Use mid-year to avoid timezone issues
        first_air_date: "2023-06-15",
      };
      expect(formatYear(movie)).toBe("2024");
    });
  });

  describe("edge cases", () => {
    it("should return empty string when no date is available", () => {
      const movie: MovieSummary = {
        id: 1,
        overview: "Test",
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
      };
      expect(formatYear(movie)).toBe("");
    });

    it("should return empty string for empty release_date", () => {
      const movie: MovieSummary = {
        id: 1,
        overview: "Test",
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        release_date: "",
      };
      expect(formatYear(movie)).toBe("");
    });
  });
});

describe("posterUrl", () => {
  describe("valid paths", () => {
    it("should construct URL with default size (w342)", () => {
      const result = posterUrl("/abc123.jpg");
      expect(result).toBe(`${TMDB_IMAGE_BASE}/w342/abc123.jpg`);
    });

    it("should construct URL with specified size", () => {
      expect(posterUrl("/abc.jpg", "w185")).toBe(
        `${TMDB_IMAGE_BASE}/w185/abc.jpg`
      );
      expect(posterUrl("/abc.jpg", "w500")).toBe(
        `${TMDB_IMAGE_BASE}/w500/abc.jpg`
      );
      expect(posterUrl("/abc.jpg", "w780")).toBe(
        `${TMDB_IMAGE_BASE}/w780/abc.jpg`
      );
      expect(posterUrl("/abc.jpg", "original")).toBe(
        `${TMDB_IMAGE_BASE}/original/abc.jpg`
      );
    });

    it("should handle paths with multiple segments", () => {
      const result = posterUrl("/path/to/image.jpg", "w500");
      expect(result).toBe(`${TMDB_IMAGE_BASE}/w500/path/to/image.jpg`);
    });
  });

  describe("null/invalid paths", () => {
    it("should return null for null path", () => {
      expect(posterUrl(null)).toBeNull();
    });

    it("should return null for null path regardless of size", () => {
      expect(posterUrl(null, "w500")).toBeNull();
      expect(posterUrl(null, "original")).toBeNull();
    });
  });
});

describe("TMDB_IMAGE_BASE constant", () => {
  it("should be the correct TMDB image base URL", () => {
    expect(TMDB_IMAGE_BASE).toBe("https://image.tmdb.org/t/p");
  });
});
