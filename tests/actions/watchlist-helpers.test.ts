import { describe, it, expect } from "vitest";

// Test the validation and sanitization helpers from watchlist actions
// These are pure functions that can be tested without mocking Supabase/Prisma

describe("Watchlist Action Helpers", () => {
  describe("coerceTmdbId", () => {
    // Replicate the logic for testing
    const coerceTmdbId = (id: number | string | undefined): number => {
      const value = typeof id === "string" ? Number.parseInt(id, 10) : Number(id);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Invalid TMDB id provided");
      }
      return value;
    };

    it("parses valid numeric string", () => {
      expect(coerceTmdbId("12345")).toBe(12345);
    });

    it("accepts valid number", () => {
      expect(coerceTmdbId(67890)).toBe(67890);
    });

    it("throws for zero", () => {
      expect(() => coerceTmdbId(0)).toThrow("Invalid TMDB id provided");
    });

    it("throws for negative number", () => {
      expect(() => coerceTmdbId(-1)).toThrow("Invalid TMDB id provided");
    });

    it("throws for non-numeric string", () => {
      expect(() => coerceTmdbId("abc")).toThrow("Invalid TMDB id provided");
    });

    it("throws for empty string", () => {
      expect(() => coerceTmdbId("")).toThrow("Invalid TMDB id provided");
    });

    it("throws for undefined", () => {
      expect(() => coerceTmdbId(undefined)).toThrow("Invalid TMDB id provided");
    });

    it("throws for NaN", () => {
      expect(() => coerceTmdbId(NaN)).toThrow("Invalid TMDB id provided");
    });

    it("throws for Infinity", () => {
      expect(() => coerceTmdbId(Infinity)).toThrow("Invalid TMDB id provided");
    });

    it("parses string with leading zeros", () => {
      expect(coerceTmdbId("00123")).toBe(123);
    });
  });

  describe("sanitizeNotes", () => {
    const MAX_NOTES_LENGTH = 2000;

    const sanitizeNotes = (notes?: string | null) => {
      if (!notes) return null;
      const trimmed = notes.trim();
      if (!trimmed) return null;
      if (trimmed.length > MAX_NOTES_LENGTH) {
        throw new Error(`Notes exceed ${MAX_NOTES_LENGTH} characters`);
      }
      return trimmed;
    };

    it("returns null for null input", () => {
      expect(sanitizeNotes(null)).toBeNull();
    });

    it("returns null for undefined input", () => {
      expect(sanitizeNotes(undefined)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(sanitizeNotes("")).toBeNull();
    });

    it("returns null for whitespace-only string", () => {
      expect(sanitizeNotes("   \n\t  ")).toBeNull();
    });

    it("trims whitespace from valid notes", () => {
      expect(sanitizeNotes("  hello world  ")).toBe("hello world");
    });

    it("returns valid notes unchanged (except trim)", () => {
      expect(sanitizeNotes("This is a note")).toBe("This is a note");
    });

    it("throws for notes exceeding max length", () => {
      const longNotes = "a".repeat(2001);
      expect(() => sanitizeNotes(longNotes)).toThrow("Notes exceed 2000 characters");
    });

    it("accepts notes at exactly max length", () => {
      const maxNotes = "a".repeat(2000);
      expect(sanitizeNotes(maxNotes)).toBe(maxNotes);
    });

    it("preserves internal whitespace", () => {
      expect(sanitizeNotes("line1\nline2\tindented")).toBe("line1\nline2\tindented");
    });
  });

  describe("sanitizeCategories", () => {
    const sanitizeCategories = (categories?: string[] | null) => {
      if (!categories) return [];
      return categories
        .map((item) => item.trim())
        .filter((item) => Boolean(item))
        .slice(0, 12);
    };

    it("returns empty array for null input", () => {
      expect(sanitizeCategories(null)).toEqual([]);
    });

    it("returns empty array for undefined input", () => {
      expect(sanitizeCategories(undefined)).toEqual([]);
    });

    it("returns empty array for empty array input", () => {
      expect(sanitizeCategories([])).toEqual([]);
    });

    it("trims whitespace from categories", () => {
      expect(sanitizeCategories(["  action  ", " drama "])).toEqual(["action", "drama"]);
    });

    it("filters out empty strings", () => {
      expect(sanitizeCategories(["action", "", "drama"])).toEqual(["action", "drama"]);
    });

    it("filters out whitespace-only strings", () => {
      expect(sanitizeCategories(["action", "   ", "drama"])).toEqual(["action", "drama"]);
    });

    it("limits to 12 categories", () => {
      const manyCategories = Array.from({ length: 20 }, (_, i) => `cat${i}`);
      const result = sanitizeCategories(manyCategories);

      expect(result).toHaveLength(12);
      expect(result[0]).toBe("cat0");
      expect(result[11]).toBe("cat11");
    });

    it("preserves order of categories", () => {
      expect(sanitizeCategories(["z", "a", "m"])).toEqual(["z", "a", "m"]);
    });
  });

  describe("isRecoverableAuthError", () => {
    // Replicate the logic
    const isRecoverableAuthError = (error: { status?: number; message: string }) => {
      return (error.status ?? 0) >= 500 || /session/i.test(error.message);
    };

    it("returns true for 500 status", () => {
      expect(isRecoverableAuthError({ status: 500, message: "" })).toBe(true);
    });

    it("returns true for 503 status", () => {
      expect(isRecoverableAuthError({ status: 503, message: "" })).toBe(true);
    });

    it("returns false for 400 status", () => {
      expect(isRecoverableAuthError({ status: 400, message: "" })).toBe(false);
    });

    it("returns false for 401 status", () => {
      expect(isRecoverableAuthError({ status: 401, message: "" })).toBe(false);
    });

    it("returns true for session-related message", () => {
      expect(isRecoverableAuthError({ status: 400, message: "Session expired" })).toBe(true);
    });

    it("returns true for case-insensitive session match", () => {
      expect(isRecoverableAuthError({ status: 400, message: "SESSION not found" })).toBe(true);
    });

    it("handles undefined status", () => {
      expect(isRecoverableAuthError({ message: "Session error" })).toBe(true);
    });

    it("returns false for unrelated 4xx error", () => {
      expect(isRecoverableAuthError({ status: 404, message: "Not found" })).toBe(false);
    });
  });

  describe("isRecoverableNetworkError", () => {
    const getNodeErrorCode = (error: Error): string | undefined => {
      const cause = (error as { cause?: unknown }).cause;
      if (cause && typeof cause === "object" && "code" in cause) {
        const value = (cause as { code?: unknown }).code;
        return typeof value === "string" ? value : undefined;
      }
      return undefined;
    };

    const isRecoverableNetworkError = (error: unknown): boolean => {
      if (!(error instanceof Error)) return false;
      const code = getNodeErrorCode(error);
      if (code && ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "ENOTFOUND"].includes(code)) {
        return true;
      }
      return /fetch failed/i.test(error.message);
    };

    it("returns false for non-Error", () => {
      expect(isRecoverableNetworkError("not an error")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isRecoverableNetworkError(null)).toBe(false);
    });

    it("returns true for ETIMEDOUT", () => {
      const error = new Error("Connection timed out");
      (error as unknown as { cause: { code: string } }).cause = { code: "ETIMEDOUT" };
      expect(isRecoverableNetworkError(error)).toBe(true);
    });

    it("returns true for ECONNRESET", () => {
      const error = new Error("Connection reset");
      (error as unknown as { cause: { code: string } }).cause = { code: "ECONNRESET" };
      expect(isRecoverableNetworkError(error)).toBe(true);
    });

    it("returns true for ECONNREFUSED", () => {
      const error = new Error("Connection refused");
      (error as unknown as { cause: { code: string } }).cause = { code: "ECONNREFUSED" };
      expect(isRecoverableNetworkError(error)).toBe(true);
    });

    it("returns true for ENOTFOUND", () => {
      const error = new Error("DNS lookup failed");
      (error as unknown as { cause: { code: string } }).cause = { code: "ENOTFOUND" };
      expect(isRecoverableNetworkError(error)).toBe(true);
    });

    it('returns true for "fetch failed" message', () => {
      const error = new Error("fetch failed");
      expect(isRecoverableNetworkError(error)).toBe(true);
    });

    it('returns true for case-insensitive "Fetch Failed"', () => {
      const error = new Error("FETCH FAILED: network error");
      expect(isRecoverableNetworkError(error)).toBe(true);
    });

    it("returns false for other error codes", () => {
      const error = new Error("Some error");
      (error as unknown as { cause: { code: string } }).cause = { code: "EPERM" };
      expect(isRecoverableNetworkError(error)).toBe(false);
    });

    it("returns false for error without cause", () => {
      const error = new Error("Generic error");
      expect(isRecoverableNetworkError(error)).toBe(false);
    });
  });

  describe("getNodeErrorCode", () => {
    const getNodeErrorCode = (error: Error): string | undefined => {
      const cause = (error as { cause?: unknown }).cause;
      if (cause && typeof cause === "object" && "code" in cause) {
        const value = (cause as { code?: unknown }).code;
        return typeof value === "string" ? value : undefined;
      }
      return undefined;
    };

    it("extracts string code from cause", () => {
      const error = new Error("test");
      (error as unknown as { cause: { code: string } }).cause = { code: "ETIMEDOUT" };
      expect(getNodeErrorCode(error)).toBe("ETIMEDOUT");
    });

    it("returns undefined for non-object cause", () => {
      const error = new Error("test");
      (error as unknown as { cause: string }).cause = "string cause";
      expect(getNodeErrorCode(error)).toBeUndefined();
    });

    it("returns undefined for cause without code", () => {
      const error = new Error("test");
      (error as unknown as { cause: { other: string } }).cause = { other: "value" };
      expect(getNodeErrorCode(error)).toBeUndefined();
    });

    it("returns undefined for numeric code", () => {
      const error = new Error("test");
      (error as unknown as { cause: { code: number } }).cause = { code: 123 };
      expect(getNodeErrorCode(error)).toBeUndefined();
    });

    it("returns undefined for null cause", () => {
      const error = new Error("test");
      (error as unknown as { cause: null }).cause = null;
      expect(getNodeErrorCode(error)).toBeUndefined();
    });

    it("returns undefined for error without cause property", () => {
      const error = new Error("test");
      expect(getNodeErrorCode(error)).toBeUndefined();
    });
  });
});
