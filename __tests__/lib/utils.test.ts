/**
 * Tests for lib/utils.ts
 * Covers the cn() utility function for Tailwind class merging.
 */
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (class name utility)", () => {
  describe("basic class composition", () => {
    it("should return empty string when no inputs provided", () => {
      expect(cn()).toBe("");
    });

    it("should return single class unchanged", () => {
      expect(cn("text-white")).toBe("text-white");
    });

    it("should concatenate multiple classes", () => {
      expect(cn("text-white", "bg-black")).toBe("text-white bg-black");
    });

    it("should handle array of classes", () => {
      expect(cn(["text-white", "bg-black"])).toBe("text-white bg-black");
    });
  });

  describe("conditional class handling", () => {
    it("should filter out falsy values", () => {
      expect(cn("text-white", false, null, undefined, "bg-black")).toBe(
        "text-white bg-black"
      );
    });

    it("should handle conditional objects", () => {
      expect(cn({ "text-white": true, "text-black": false })).toBe(
        "text-white"
      );
    });

    it("should handle empty string", () => {
      expect(cn("text-white", "", "bg-black")).toBe("text-white bg-black");
    });
  });

  describe("Tailwind class conflict resolution", () => {
    it("should merge conflicting padding classes (last wins)", () => {
      expect(cn("p-2", "p-4")).toBe("p-4");
    });

    it("should merge conflicting margin classes", () => {
      expect(cn("m-2", "m-8")).toBe("m-8");
    });

    it("should merge conflicting text color classes", () => {
      expect(cn("text-white", "text-black")).toBe("text-black");
    });

    it("should merge conflicting background classes", () => {
      expect(cn("bg-white", "bg-black")).toBe("bg-black");
    });

    it("should not merge non-conflicting classes", () => {
      expect(cn("px-2", "py-4")).toBe("px-2 py-4");
    });

    it("should handle complex class combinations", () => {
      const result = cn(
        "rounded-lg px-4 py-2 bg-white text-black",
        { "opacity-50": false, "hover:bg-white/10": true },
        "bg-black text-white"
      );
      expect(result).toContain("rounded-lg");
      expect(result).toContain("px-4");
      expect(result).toContain("py-2");
      expect(result).toContain("text-white");
      expect(result).toContain("hover:bg-white/10");
      expect(result).toContain("bg-black");
      expect(result).not.toContain("opacity-50");
    });
  });

  describe("edge cases", () => {
    it("should handle nested arrays", () => {
      expect(cn(["text-white", ["bg-black", "p-4"]])).toBe(
        "text-white bg-black p-4"
      );
    });

    it("should handle mixed inputs", () => {
      expect(
        cn(
          "base-class",
          ["array-class"],
          { conditional: true },
          null,
          undefined
        )
      ).toBe("base-class array-class conditional");
    });
  });
});
