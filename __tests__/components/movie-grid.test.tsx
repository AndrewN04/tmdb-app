/**
 * Tests for components/movie-grid.tsx
 * Covers the MovieGrid component.
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovieGrid } from "@/components/movie-grid";
import type { MovieSummary } from "@/lib/tmdb";

// Mock MovieCard to simplify testing
vi.mock("@/components/movie-card", () => ({
  MovieCard: ({ movie, priority }: { movie: MovieSummary; priority: boolean }) => (
    <div data-testid={`movie-card-${movie.id}`} data-priority={priority}>
      {movie.title}
    </div>
  ),
}));

describe("MovieGrid", () => {
  const createMovies = (count: number): MovieSummary[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Movie ${i + 1}`,
      overview: `Overview ${i + 1}`,
      poster_path: `/poster${i + 1}.jpg`,
      backdrop_path: `/backdrop${i + 1}.jpg`,
      vote_average: 7.0 + i * 0.1,
      release_date: `2024-0${(i % 9) + 1}-15`,
    }));
  };

  describe("rendering", () => {
    it("should render all movies in grid", () => {
      const movies = createMovies(5);
      render(<MovieGrid items={movies} />);

      expect(screen.getByTestId("movie-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("movie-card-2")).toBeInTheDocument();
      expect(screen.getByTestId("movie-card-3")).toBeInTheDocument();
      expect(screen.getByTestId("movie-card-4")).toBeInTheDocument();
      expect(screen.getByTestId("movie-card-5")).toBeInTheDocument();
    });

    it("should render empty grid when no movies", () => {
      const { container } = render(<MovieGrid items={[]} />);

      const cards = container.querySelectorAll('[data-testid^="movie-card-"]');
      expect(cards.length).toBe(0);
    });

    it("should render single movie", () => {
      const movies = createMovies(1);
      render(<MovieGrid items={movies} />);

      expect(screen.getByTestId("movie-card-1")).toBeInTheDocument();
    });
  });

  describe("priority loading", () => {
    it("should mark first 4 movies as priority by default", () => {
      const movies = createMovies(6);
      render(<MovieGrid items={movies} />);

      expect(screen.getByTestId("movie-card-1")).toHaveAttribute("data-priority", "true");
      expect(screen.getByTestId("movie-card-2")).toHaveAttribute("data-priority", "true");
      expect(screen.getByTestId("movie-card-3")).toHaveAttribute("data-priority", "true");
      expect(screen.getByTestId("movie-card-4")).toHaveAttribute("data-priority", "true");
      expect(screen.getByTestId("movie-card-5")).toHaveAttribute("data-priority", "false");
      expect(screen.getByTestId("movie-card-6")).toHaveAttribute("data-priority", "false");
    });

    it("should respect custom priorityCount", () => {
      const movies = createMovies(5);
      render(<MovieGrid items={movies} priorityCount={2} />);

      expect(screen.getByTestId("movie-card-1")).toHaveAttribute("data-priority", "true");
      expect(screen.getByTestId("movie-card-2")).toHaveAttribute("data-priority", "true");
      expect(screen.getByTestId("movie-card-3")).toHaveAttribute("data-priority", "false");
    });

    it("should handle priorityCount of 0", () => {
      const movies = createMovies(3);
      render(<MovieGrid items={movies} priorityCount={0} />);

      expect(screen.getByTestId("movie-card-1")).toHaveAttribute("data-priority", "false");
      expect(screen.getByTestId("movie-card-2")).toHaveAttribute("data-priority", "false");
      expect(screen.getByTestId("movie-card-3")).toHaveAttribute("data-priority", "false");
    });

    it("should handle priorityCount larger than items count", () => {
      const movies = createMovies(2);
      render(<MovieGrid items={movies} priorityCount={10} />);

      expect(screen.getByTestId("movie-card-1")).toHaveAttribute("data-priority", "true");
      expect(screen.getByTestId("movie-card-2")).toHaveAttribute("data-priority", "true");
    });
  });

  describe("grid layout", () => {
    it("should have grid container class", () => {
      const movies = createMovies(3);
      const { container } = render(<MovieGrid items={movies} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("grid");
    });

    it("should have responsive grid columns", () => {
      const movies = createMovies(3);
      const { container } = render(<MovieGrid items={movies} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("sm:grid-cols-2");
      expect(grid).toHaveClass("lg:grid-cols-4");
      expect(grid).toHaveClass("xl:grid-cols-5");
    });

    it("should have gap between items", () => {
      const movies = createMovies(3);
      const { container } = render(<MovieGrid items={movies} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("gap-6");
    });
  });

  describe("large datasets", () => {
    it("should handle large movie lists", () => {
      const movies = createMovies(50);
      render(<MovieGrid items={movies} />);

      const cards = screen.getAllByTestId(/^movie-card-/);
      expect(cards.length).toBe(50);
    });
  });

  describe("movie data", () => {
    it("should pass movie data to MovieCard", () => {
      const movies = createMovies(1);
      movies[0].title = "Custom Title";
      
      render(<MovieGrid items={movies} />);

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });
  });
});
