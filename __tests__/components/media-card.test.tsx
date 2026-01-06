/**
 * Tests for components/media-card.tsx
 * Covers the MediaCard component for displaying movie/TV show cards.
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaCard } from "@/components/media-card";
import type { MediaSummary, Genre } from "@/lib/tmdb";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    priority,
  }: {
    src: string;
    alt: string;
    priority?: boolean;
    // eslint-disable-next-line @next/next/no-img-element
  }) => <img src={src} alt={alt} data-priority={priority ? "true" : "false"} />,
}));

describe("MediaCard", () => {
  const mockGenres: Genre[] = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 878, name: "Science Fiction" },
  ];

  const defaultMovie: MediaSummary = {
    id: 123,
    title: "Test Movie",
    name: undefined,
    poster_path: "/test-poster.jpg",
    backdrop_path: "/test-backdrop.jpg",
    overview: "A test movie description",
    vote_average: 8.5,
    release_date: "2024-06-15",
    first_air_date: undefined,
    genre_ids: [28, 12],
    media_type: "movie",
  };

  const defaultTVShow: MediaSummary = {
    id: 456,
    title: undefined,
    name: "Test TV Show",
    poster_path: "/test-tv-poster.jpg",
    backdrop_path: "/test-tv-backdrop.jpg",
    overview: "A test TV show description",
    vote_average: 7.8,
    release_date: undefined,
    first_air_date: "2024-03-20",
    genre_ids: [878],
    media_type: "tv",
  };

  describe("rendering", () => {
    it("should render movie title", () => {
      render(<MediaCard media={defaultMovie} genres={mockGenres} />);
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    it("should render TV show name", () => {
      render(<MediaCard media={defaultTVShow} genres={mockGenres} />);
      expect(screen.getByText("Test TV Show")).toBeInTheDocument();
    });

    it("should render movie poster image", () => {
      render(<MediaCard media={defaultMovie} genres={mockGenres} />);
      const img = screen.getByAltText("Test Movie");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        "src",
        "https://image.tmdb.org/t/p/w342/test-poster.jpg"
      );
    });

    it("should render rating badge", () => {
      render(<MediaCard media={defaultMovie} genres={mockGenres} />);
      expect(screen.getByText("8.5")).toBeInTheDocument();
    });

    it("should render year from release_date for movies when no genres", () => {
      const movieNoGenres: MediaSummary = {
        ...defaultMovie,
        genre_ids: [],
      };
      render(<MediaCard media={movieNoGenres} genres={mockGenres} />);
      expect(screen.getByText("2024")).toBeInTheDocument();
    });

    it("should render year from first_air_date for TV shows when no genres", () => {
      const tvNoGenres: MediaSummary = {
        ...defaultTVShow,
        genre_ids: [],
      };
      render(<MediaCard media={tvNoGenres} genres={mockGenres} />);
      expect(screen.getByText("2024")).toBeInTheDocument();
    });

    it("should render genre names", () => {
      render(<MediaCard media={defaultMovie} genres={mockGenres} />);
      // Genres are rendered with commas, so use regex matching
      expect(screen.getByText(/Action/)).toBeInTheDocument();
      expect(screen.getByText(/Adventure/)).toBeInTheDocument();
    });

    it("should limit genres to 2", () => {
      const movieWith3Genres: MediaSummary = {
        ...defaultMovie,
        genre_ids: [28, 12, 878],
      };
      render(<MediaCard media={movieWith3Genres} genres={mockGenres} />);
      expect(screen.getByText(/Action/)).toBeInTheDocument();
      expect(screen.getByText(/Adventure/)).toBeInTheDocument();
      expect(screen.queryByText(/Science Fiction/)).not.toBeInTheDocument();
    });
  });

  describe("linking", () => {
    it("should link to movie detail page for movies", () => {
      render(<MediaCard media={defaultMovie} genres={mockGenres} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/movie/123");
    });

    it("should link to TV detail page for TV shows", () => {
      render(<MediaCard media={defaultTVShow} genres={mockGenres} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/tv/456");
    });

    it("should infer movie type from properties when media_type is undefined", () => {
      const inferredMovie: MediaSummary = {
        ...defaultMovie,
        media_type: undefined,
      };
      render(<MediaCard media={inferredMovie} genres={mockGenres} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/movie/123");
    });

    it("should infer TV type from properties when media_type is undefined", () => {
      const inferredTV: MediaSummary = {
        ...defaultTVShow,
        media_type: undefined,
        title: undefined,
      };
      render(<MediaCard media={inferredTV} genres={mockGenres} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/tv/456");
    });
  });

  describe("edge cases", () => {
    it("should show 'No poster' when poster_path is null", () => {
      const noPosterMovie: MediaSummary = {
        ...defaultMovie,
        poster_path: null,
      };
      render(<MediaCard media={noPosterMovie} genres={mockGenres} />);
      expect(screen.getByText("No poster")).toBeInTheDocument();
    });

    it("should handle missing rating gracefully", () => {
      const noRatingMovie: MediaSummary = {
        ...defaultMovie,
        vote_average: 0,
      };
      render(<MediaCard media={noRatingMovie} genres={mockGenres} />);
      // Should not show rating badge when vote_average is 0
      expect(screen.queryByText("0.0")).not.toBeInTheDocument();
    });

    it("should handle missing genres gracefully", () => {
      const noGenresMovie: MediaSummary = {
        ...defaultMovie,
        genre_ids: undefined,
      };
      render(<MediaCard media={noGenresMovie} genres={mockGenres} />);
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    it("should use title or name fallback", () => {
      const untitledMedia: MediaSummary = {
        ...defaultMovie,
        title: undefined,
        name: undefined,
      };
      render(<MediaCard media={untitledMedia} genres={mockGenres} />);
      // getTitle() falls back to "Unknown" when no title or name
      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });
  });

  describe("priority loading", () => {
    it("should set priority attribute when priority is true", () => {
      render(<MediaCard media={defaultMovie} genres={mockGenres} priority />);
      const img = screen.getByAltText("Test Movie");
      expect(img).toHaveAttribute("data-priority", "true");
    });

    it("should not set priority attribute when priority is false", () => {
      render(
        <MediaCard media={defaultMovie} genres={mockGenres} priority={false} />
      );
      const img = screen.getByAltText("Test Movie");
      expect(img).toHaveAttribute("data-priority", "false");
    });
  });

  describe("release date display", () => {
    it("should show formatted release date when showReleaseDate is true", () => {
      render(
        <MediaCard
          media={defaultMovie}
          genres={mockGenres}
          showReleaseDate={true}
        />
      );
      // Should show "Jun 15" format
      expect(screen.getByText(/Jun/)).toBeInTheDocument();
    });

    it("should not show release date badge by default", () => {
      render(<MediaCard media={defaultMovie} genres={mockGenres} />);
      // The formatted date badge should not be visible
      const dateText = screen.queryByText(/Jun 15/);
      expect(dateText).not.toBeInTheDocument();
    });
  });
});
