/**
 * Tests for components/movie-card.tsx
 * Covers the MovieCard component.
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovieCard } from "@/components/movie-card";
import type { MovieSummary } from "@/lib/tmdb";

// Mock the TMDB module
vi.mock("@/lib/tmdb", async () => {
  const actual = await vi.importActual("@/lib/tmdb");
  return {
    ...actual,
    posterUrl: (path: string | null, size?: string) => {
      if (!path) return null;
      return `https://image.tmdb.org/t/p/${size ?? "w342"}${path}`;
    },
    formatYear: (movie: MovieSummary) => {
      const date = movie.release_date ?? movie.first_air_date;
      if (!date) return "";
      return new Date(date).getFullYear().toString();
    },
  };
});

describe("MovieCard", () => {
  const defaultMovie: MovieSummary = {
    id: 123,
    title: "Test Movie",
    overview: "A test movie overview",
    poster_path: "/test-poster.jpg",
    backdrop_path: "/test-backdrop.jpg",
    vote_average: 8.5,
    release_date: "2024-06-15",
  };

  describe("rendering", () => {
    it("should render movie title", () => {
      render(<MovieCard movie={defaultMovie} />);

      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    it("should render movie as a link to detail page", () => {
      render(<MovieCard movie={defaultMovie} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/movie/123");
    });

    it("should render movie poster image", () => {
      render(<MovieCard movie={defaultMovie} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "Test Movie");
      expect(img).toHaveAttribute(
        "src",
        expect.stringContaining("test-poster.jpg")
      );
    });

    it("should render release year", () => {
      render(<MovieCard movie={defaultMovie} />);

      expect(screen.getByText("2024")).toBeInTheDocument();
    });

    it("should render rating with star icon", () => {
      render(<MovieCard movie={defaultMovie} />);

      expect(screen.getByText("8.5")).toBeInTheDocument();
    });
  });

  describe("TV show support", () => {
    it("should use name instead of title for TV shows", () => {
      const tvShow: MovieSummary = {
        ...defaultMovie,
        title: undefined,
        name: "Test TV Show",
        first_air_date: "2023-01-15",
      };

      render(<MovieCard movie={tvShow} />);

      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    it("should show first_air_date year for TV shows", () => {
      const tvShow: MovieSummary = {
        ...defaultMovie,
        release_date: undefined,
        first_air_date: "2023-01-15",
      };

      render(<MovieCard movie={tvShow} />);

      expect(screen.getByText("2023")).toBeInTheDocument();
    });

    it("should show media_type badge when present", () => {
      const movie: MovieSummary = {
        ...defaultMovie,
        media_type: "movie",
      };

      render(<MovieCard movie={movie} />);

      expect(screen.getByText("movie")).toBeInTheDocument();
    });
  });

  describe("missing data handling", () => {
    it("should show 'No art' placeholder when poster is null", () => {
      const movieWithoutPoster: MovieSummary = {
        ...defaultMovie,
        poster_path: null,
      };

      render(<MovieCard movie={movieWithoutPoster} />);

      expect(screen.getByText("No art")).toBeInTheDocument();
    });

    it("should show 'Untitled' when title and name are missing", () => {
      const untitledMovie: MovieSummary = {
        ...defaultMovie,
        title: undefined,
        name: undefined,
      };

      render(<MovieCard movie={untitledMovie} />);

      expect(screen.getByText("Untitled")).toBeInTheDocument();
    });

    it("should not show rating when vote_average is 0", () => {
      const unratedMovie: MovieSummary = {
        ...defaultMovie,
        vote_average: 0,
      };

      render(<MovieCard movie={unratedMovie} />);

      // Rating badge should not be present
      expect(screen.queryByText("0.0")).not.toBeInTheDocument();
    });

    it("should not show year when release_date is missing", () => {
      const movieNoDate: MovieSummary = {
        ...defaultMovie,
        release_date: undefined,
      };

      render(<MovieCard movie={movieNoDate} />);

      expect(screen.queryByText("2024")).not.toBeInTheDocument();
    });
  });

  describe("priority prop", () => {
    it("should accept priority prop for image loading", () => {
      render(<MovieCard movie={defaultMovie} priority />);

      // Just verify it renders without error
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("should default priority to false", () => {
      render(<MovieCard movie={defaultMovie} />);

      expect(screen.getByRole("img")).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("should have card container styling", () => {
      render(<MovieCard movie={defaultMovie} />);

      const link = screen.getByRole("link");
      expect(link).toHaveClass("group");
      expect(link).toHaveClass("rounded-2xl");
    });

    it("should truncate long titles", () => {
      const longTitleMovie: MovieSummary = {
        ...defaultMovie,
        title: "This Is A Very Long Movie Title That Should Be Truncated",
      };

      render(<MovieCard movie={longTitleMovie} />);

      const title = screen.getByText(longTitleMovie.title!);
      expect(title).toHaveClass("line-clamp-2");
    });
  });

  describe("rating formatting", () => {
    it("should format rating to one decimal place", () => {
      const movie: MovieSummary = {
        ...defaultMovie,
        vote_average: 7.89,
      };

      render(<MovieCard movie={movie} />);

      expect(screen.getByText("7.9")).toBeInTheDocument();
    });

    it("should handle perfect 10 rating", () => {
      const movie: MovieSummary = {
        ...defaultMovie,
        vote_average: 10,
      };

      render(<MovieCard movie={movie} />);

      expect(screen.getByText("10.0")).toBeInTheDocument();
    });
  });
});
