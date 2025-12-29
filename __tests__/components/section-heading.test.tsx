/**
 * Tests for components/section-heading.tsx
 * Covers the SectionHeading component.
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeading } from "@/components/section-heading";

describe("SectionHeading", () => {
  describe("title rendering", () => {
    it("should render title text", () => {
      render(<SectionHeading title="Popular Movies" />);

      expect(screen.getByText("Popular Movies")).toBeInTheDocument();
    });

    it("should render title as h2 element", () => {
      render(<SectionHeading title="Test Title" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Test Title");
    });

    it("should apply title styling", () => {
      render(<SectionHeading title="Styled Title" />);

      const heading = screen.getByRole("heading");
      expect(heading).toHaveClass("text-2xl");
      expect(heading).toHaveClass("font-semibold");
      expect(heading).toHaveClass("text-white");
    });
  });

  describe("description rendering", () => {
    it("should render description when provided", () => {
      render(
        <SectionHeading title="Title" description="A helpful description" />
      );

      expect(screen.getByText("A helpful description")).toBeInTheDocument();
    });

    it("should not render description element when not provided", () => {
      const { container } = render(<SectionHeading title="Title Only" />);

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs.length).toBe(0);
    });

    it("should apply description styling", () => {
      render(<SectionHeading title="Title" description="Description text" />);

      const description = screen.getByText("Description text");
      expect(description).toHaveClass("text-sm");
      expect(description).toHaveClass("text-white/60");
    });
  });

  describe("actionSlot rendering", () => {
    it("should render actionSlot content when provided", () => {
      render(
        <SectionHeading
          title="Title"
          actionSlot={<button data-testid="action-btn">View All</button>}
        />
      );

      expect(screen.getByTestId("action-btn")).toBeInTheDocument();
      expect(screen.getByText("View All")).toBeInTheDocument();
    });

    it("should not render actionSlot area when not provided", () => {
      const { container } = render(<SectionHeading title="No Action" />);

      // Should only have the title wrapper div
      expect(container.querySelector('[data-testid="action-btn"]')).toBeNull();
    });

    it("should render complex actionSlot content", () => {
      render(
        <SectionHeading
          title="Title"
          actionSlot={
            <div data-testid="action-wrapper">
              <button>Button 1</button>
              <button>Button 2</button>
            </div>
          }
        />
      );

      expect(screen.getByTestId("action-wrapper")).toBeInTheDocument();
      expect(screen.getByText("Button 1")).toBeInTheDocument();
      expect(screen.getByText("Button 2")).toBeInTheDocument();
    });
  });

  describe("layout", () => {
    it("should have flex container for layout", () => {
      const { container } = render(<SectionHeading title="Layout Test" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex");
      expect(wrapper).toHaveClass("flex-wrap");
      expect(wrapper).toHaveClass("items-end");
      expect(wrapper).toHaveClass("justify-between");
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in title", () => {
      render(<SectionHeading title="Movies & TV Shows" />);

      expect(screen.getByText("Movies & TV Shows")).toBeInTheDocument();
    });

    it("should handle long title text", () => {
      const longTitle = "This is a very long section heading that might wrap";
      render(<SectionHeading title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle empty string description", () => {
      render(<SectionHeading title="Title" description="" />);

      // Empty description should not render a paragraph
      const paragraphs = document.querySelectorAll("p");
      expect(paragraphs.length).toBe(0);
    });
  });
});
