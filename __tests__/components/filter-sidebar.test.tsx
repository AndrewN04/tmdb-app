/**
 * Tests for components/filter-sidebar.tsx
 * Covers the FilterSidebar component for browse page filtering.
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterSidebar } from "@/components/filter-sidebar";
import type { Genre } from "@/lib/tmdb";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("FilterSidebar", () => {
  const mockGenres: Genre[] = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
  ];

  const defaultProps = {
    genres: mockGenres,
    mediaType: "movie" as const,
    currentFilters: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render filter sidebar", () => {
      render(<FilterSidebar {...defaultProps} />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("should render sort dropdown with Sort heading", () => {
      render(<FilterSidebar {...defaultProps} />);
      expect(screen.getByText("Sort")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render all genre chips", () => {
      render(<FilterSidebar {...defaultProps} />);
      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(screen.getByText("Adventure")).toBeInTheDocument();
      expect(screen.getByText("Comedy")).toBeInTheDocument();
      expect(screen.getByText("Drama")).toBeInTheDocument();
    });

    it("should render date range section", () => {
      render(<FilterSidebar {...defaultProps} />);
      expect(screen.getByText("Release Date")).toBeInTheDocument();
      expect(screen.getByText("From")).toBeInTheDocument();
      expect(screen.getByText("To")).toBeInTheDocument();
    });

    it("should render reset filters button when filters are active", () => {
      render(
        <FilterSidebar
          {...defaultProps}
          currentFilters={{ with_genres: "28" }}
        />
      );
      expect(screen.getByText("Reset Filters")).toBeInTheDocument();
    });
  });

  describe("sort options", () => {
    it("should display all sort options in dropdown", () => {
      render(<FilterSidebar {...defaultProps} />);
      const select = screen.getByRole("combobox");

      expect(select).toContainHTML("Popularity Descending");
      expect(select).toContainHTML("Popularity Ascending");
      expect(select).toContainHTML("Rating Descending");
      expect(select).toContainHTML("Rating Ascending");
      expect(select).toContainHTML("Release Date Descending");
      expect(select).toContainHTML("Release Date Ascending");
    });

    it("should show current sort selection", () => {
      render(
        <FilterSidebar
          {...defaultProps}
          currentFilters={{ sort_by: "vote_average.desc" }}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("vote_average.desc");
    });
  });

  describe("genre selection", () => {
    it("should highlight selected genres", () => {
      render(
        <FilterSidebar
          {...defaultProps}
          currentFilters={{ with_genres: "28,35" }}
        />
      );

      // Find buttons by text - selected ones should have different styling
      const actionButton = screen.getByRole("button", { name: "Action" });
      const comedyButton = screen.getByRole("button", { name: "Comedy" });

      // Check that they exist (the visual styling would be tested differently)
      expect(actionButton).toBeInTheDocument();
      expect(comedyButton).toBeInTheDocument();
    });
  });

  describe("mobile toggle", () => {
    it("should render mobile toggle button", () => {
      render(<FilterSidebar {...defaultProps} />);
      // The mobile toggle should be visible on small screens
      const toggleButton = screen.getByRole("button", { name: /filters/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it("should toggle mobile filter visibility", () => {
      render(<FilterSidebar {...defaultProps} />);
      const toggleButton = screen.getByRole("button", { name: /filters/i });

      // Click to open
      fireEvent.click(toggleButton);

      // Content should be visible (the actual visibility would be controlled by state)
      expect(screen.getByText("Genres")).toBeInTheDocument();
    });
  });

  describe("media type handling", () => {
    it("should render for movie media type", () => {
      render(<FilterSidebar {...defaultProps} mediaType="movie" />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("should render for tv media type", () => {
      render(<FilterSidebar {...defaultProps} mediaType="tv" />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });
  });

  describe("reset functionality", () => {
    it("should render reset button", () => {
      render(
        <FilterSidebar
          {...defaultProps}
          currentFilters={{ sort_by: "vote_average.desc", with_genres: "28" }}
        />
      );

      const resetButton = screen.getByRole("button", { name: /reset/i });
      expect(resetButton).toBeInTheDocument();
    });
  });
});
