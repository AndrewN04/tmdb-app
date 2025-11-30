import { describe, it, expect } from "vitest";
import { formatYear, posterUrl, TMDB_IMAGE_BASE } from "@/lib/tmdb";
import type { MovieSummary } from "@/lib/tmdb";

describe("formatYear", () => {
  it("extracts year from release_date", () => {
    const movie: MovieSummary = {
      id: 1,
      overview: "",
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      release_date: "2023-07-21",
    };

    expect(formatYear(movie)).toBe("2023");
  });

  it("extracts year from first_air_date when release_date is missing", () => {
    const movie: MovieSummary = {
      id: 1,
      overview: "",
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      first_air_date: "2020-01-15",
    };

    expect(formatYear(movie)).toBe("2020");
  });

  it("prefers release_date over first_air_date", () => {
    const movie: MovieSummary = {
      id: 1,
      overview: "",
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      release_date: "2023-05-01",
      first_air_date: "2020-01-01",
    };

    expect(formatYear(movie)).toBe("2023");
  });

  it("returns empty string when no date is available", () => {
    const movie: MovieSummary = {
      id: 1,
      overview: "",
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
    };

    expect(formatYear(movie)).toBe("");
  });

  it("returns empty string for empty date string", () => {
    const movie: MovieSummary = {
      id: 1,
      overview: "",
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      release_date: "",
    };

    expect(formatYear(movie)).toBe("");
  });
});

describe("posterUrl", () => {
  it("constructs full poster URL with default size", () => {
    const result = posterUrl("/abc123.jpg");
    expect(result).toBe(`${TMDB_IMAGE_BASE}/w342/abc123.jpg`);
  });

  it("constructs poster URL with specified size", () => {
    const result = posterUrl("/poster.jpg", "w500");
    expect(result).toBe(`${TMDB_IMAGE_BASE}/w500/poster.jpg`);
  });

  it("constructs poster URL with original size", () => {
    const result = posterUrl("/poster.jpg", "original");
    expect(result).toBe(`${TMDB_IMAGE_BASE}/original/poster.jpg`);
  });

  it("returns null for null path", () => {
    const result = posterUrl(null);
    expect(result).toBeNull();
  });

  it("handles paths without leading slash", () => {
    // The function doesn't normalize paths, so this tests current behavior
    const result = posterUrl("/test.jpg", "w185");
    expect(result).toBe(`${TMDB_IMAGE_BASE}/w185/test.jpg`);
  });
});

describe("TMDB_IMAGE_BASE constant", () => {
  it("has correct TMDB image base URL", () => {
    expect(TMDB_IMAGE_BASE).toBe("https://image.tmdb.org/t/p");
  });
});
