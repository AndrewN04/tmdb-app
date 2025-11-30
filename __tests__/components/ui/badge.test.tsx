/**
 * Tests for components/ui/badge.tsx
 * Covers the Badge UI component.
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  describe("rendering", () => {
    it("should render children content", () => {
      render(<Badge>Test Label</Badge>);

      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("should render as a span element", () => {
      render(<Badge>Label</Badge>);

      const badge = screen.getByText("Label");
      expect(badge.tagName).toBe("SPAN");
    });
  });

  describe("variants", () => {
    it("should apply default variant styles when no variant specified", () => {
      render(<Badge>Default</Badge>);

      const badge = screen.getByText("Default");
      expect(badge).toHaveClass("bg-white/90");
      expect(badge).toHaveClass("text-black");
    });

    it("should apply default variant styles explicitly", () => {
      render(<Badge variant="default">Default</Badge>);

      const badge = screen.getByText("Default");
      expect(badge).toHaveClass("bg-white/90");
      expect(badge).toHaveClass("text-black");
    });

    it("should apply outline variant styles", () => {
      render(<Badge variant="outline">Outline</Badge>);

      const badge = screen.getByText("Outline");
      expect(badge).toHaveClass("border");
      expect(badge).toHaveClass("border-white/30");
      expect(badge).toHaveClass("text-white/70");
    });
  });

  describe("styling", () => {
    it("should have base styling classes", () => {
      render(<Badge>Styled</Badge>);

      const badge = screen.getByText("Styled");
      expect(badge).toHaveClass("inline-flex");
      expect(badge).toHaveClass("items-center");
      expect(badge).toHaveClass("rounded-full");
      expect(badge).toHaveClass("px-2.5");
      expect(badge).toHaveClass("py-0.5");
      expect(badge).toHaveClass("text-xs");
      expect(badge).toHaveClass("font-medium");
    });

    it("should merge custom className with defaults", () => {
      render(<Badge className="my-custom-class">Custom</Badge>);

      const badge = screen.getByText("Custom");
      expect(badge).toHaveClass("my-custom-class");
      expect(badge).toHaveClass("inline-flex"); // Base class preserved
    });
  });

  describe("HTML attributes", () => {
    it("should pass through additional HTML attributes", () => {
      render(
        <Badge data-testid="test-badge" title="Tooltip text">
          With Attrs
        </Badge>
      );

      const badge = screen.getByTestId("test-badge");
      expect(badge).toHaveAttribute("title", "Tooltip text");
    });

    it("should support onClick handler", () => {
      let clicked = false;
      render(<Badge onClick={() => (clicked = true)}>Clickable</Badge>);

      const badge = screen.getByText("Clickable");
      badge.click();

      expect(clicked).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle empty children", () => {
      render(<Badge>{""}</Badge>);
      // Should render without crashing
    });

    it("should handle numeric content", () => {
      render(<Badge>{42}</Badge>);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should handle nested elements", () => {
      render(
        <Badge>
          <span data-testid="nested">Nested</span>
        </Badge>
      );

      expect(screen.getByTestId("nested")).toBeInTheDocument();
    });
  });
});
