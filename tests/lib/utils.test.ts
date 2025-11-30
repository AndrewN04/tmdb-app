import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className utility)", () => {
  it("merges multiple class strings", () => {
    const result = cn("foo", "bar", "baz");
    expect(result).toBe("foo bar baz");
  });

  it("handles conditional classes with clsx syntax", () => {
    const result = cn("base", { active: true, disabled: false });
    expect(result).toBe("base active");
  });

  it("removes conflicting Tailwind classes (tailwind-merge)", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("merges complex Tailwind class conflicts", () => {
    const result = cn("text-red-500 bg-blue-500", "text-green-500");
    expect(result).toBe("bg-blue-500 text-green-500");
  });

  it("handles arrays of classes", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toBe("foo bar baz");
  });

  it("handles undefined and null values", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toBe("foo bar");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("preserves responsive variants", () => {
    const result = cn("md:px-4", "lg:px-6", "px-2");
    expect(result).toBe("md:px-4 lg:px-6 px-2");
  });
});
