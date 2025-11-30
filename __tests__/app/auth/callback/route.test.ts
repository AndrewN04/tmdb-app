/**
 * Tests for app/auth/callback/route.ts
 * Covers the OAuth callback route.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Supabase client
const mockExchangeCodeForSession = vi.fn();
const mockCreateSupabaseServerClient = vi.fn(() => ({
  auth: {
    exchangeCodeForSession: mockExchangeCodeForSession,
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => mockCreateSupabaseServerClient(),
}));

// Import route after mocks
import { GET } from "@/app/auth/callback/route";

describe("OAuth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createRequest(params: Record<string, string>) {
    const url = new URL("http://localhost:3000/auth/callback");
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new Request(url.toString());
  }

  describe("successful exchange", () => {
    it("should redirect to home on successful code exchange", async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = createRequest({ code: "valid-code" });
      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("Location")).toBe("http://localhost:3000/");
    });

    it("should redirect to next parameter on success", async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = createRequest({ code: "valid-code", next: "/profile" });
      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("Location")).toBe("http://localhost:3000/profile");
    });

    it("should exchange code for session", async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = createRequest({ code: "auth-code-123" });
      await GET(request);

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith("auth-code-123");
    });
  });

  describe("failed exchange", () => {
    it("should redirect to sign-in with error on exchange failure", async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        error: { message: "Exchange failed" },
      });

      const request = createRequest({ code: "invalid-code" });
      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("Location")).toBe(
        "http://localhost:3000/sign-in?error=auth_callback_error"
      );
    });
  });

  describe("missing code", () => {
    it("should redirect to sign-in with error when no code", async () => {
      const request = createRequest({});
      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("Location")).toBe(
        "http://localhost:3000/sign-in?error=auth_callback_error"
      );
    });

    it("should not call exchangeCodeForSession without code", async () => {
      const request = createRequest({});
      await GET(request);

      expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    });
  });

  describe("origin preservation", () => {
    it("should preserve origin in redirect URL", async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const url = new URL("https://app.example.com/auth/callback");
      url.searchParams.set("code", "valid-code");
      url.searchParams.set("next", "/dashboard");
      const request = new Request(url.toString());

      const response = await GET(request);

      expect(response.headers.get("Location")).toBe(
        "https://app.example.com/dashboard"
      );
    });

    it("should preserve origin in error redirect", async () => {
      const url = new URL("https://app.example.com/auth/callback");
      const request = new Request(url.toString());

      const response = await GET(request);

      expect(response.headers.get("Location")).toBe(
        "https://app.example.com/sign-in?error=auth_callback_error"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty next parameter", async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = createRequest({ code: "valid-code", next: "" });
      const response = await GET(request);

      // Empty string is falsy, so should fall back to "/"
      expect(response.headers.get("Location")).toBe("http://localhost:3000/");
    });

    it("should handle Supabase client creation", async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = createRequest({ code: "valid-code" });
      await GET(request);

      expect(mockCreateSupabaseServerClient).toHaveBeenCalled();
    });
  });
});
