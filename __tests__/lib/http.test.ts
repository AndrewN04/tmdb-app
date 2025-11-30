/**
 * Tests for lib/http.ts
 * Covers the getBaseUrl() utility for determining the application's base URL.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("getBaseUrl", () => {
  const originalWindow = global.window;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    global.window = originalWindow;
    process.env = { ...originalEnv };
  });

  describe("client-side (browser)", () => {
    it("should return window.location.origin when in browser", async () => {
      // Mock window with location
      global.window = {
        location: {
          origin: "https://example.com",
        },
      } as unknown as Window & typeof globalThis;

      vi.resetModules();
      const { getBaseUrl } = await import("@/lib/http");

      expect(getBaseUrl()).toBe("https://example.com");
    });

    it("should return origin with port if present", async () => {
      global.window = {
        location: {
          origin: "http://localhost:3000",
        },
      } as unknown as Window & typeof globalThis;

      vi.resetModules();
      const { getBaseUrl } = await import("@/lib/http");

      expect(getBaseUrl()).toBe("http://localhost:3000");
    });
  });

  describe("server-side", () => {
    beforeEach(() => {
      // @ts-expect-error - Simulating server environment
      delete global.window;
    });

    it("should use NEXT_PUBLIC_APP_URL when set", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://my-app.com";

      vi.resetModules();
      const { getBaseUrl } = await import("@/lib/http");

      expect(getBaseUrl()).toBe("https://my-app.com");
    });

    it("should strip trailing slash from NEXT_PUBLIC_APP_URL", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://my-app.com/";

      vi.resetModules();
      const { getBaseUrl } = await import("@/lib/http");

      expect(getBaseUrl()).toBe("https://my-app.com");
    });

    it("should use VERCEL_URL with https when NEXT_PUBLIC_APP_URL not set", async () => {
      process.env.VERCEL_URL = "my-app.vercel.app";

      vi.resetModules();
      const { getBaseUrl } = await import("@/lib/http");

      expect(getBaseUrl()).toBe("https://my-app.vercel.app");
    });

    it("should fallback to localhost:3000 when no env vars set", async () => {
      vi.resetModules();
      const { getBaseUrl } = await import("@/lib/http");

      expect(getBaseUrl()).toBe("http://localhost:3000");
    });

    it("should prioritize NEXT_PUBLIC_APP_URL over VERCEL_URL", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://custom-domain.com";
      process.env.VERCEL_URL = "my-app.vercel.app";

      vi.resetModules();
      const { getBaseUrl } = await import("@/lib/http");

      expect(getBaseUrl()).toBe("https://custom-domain.com");
    });
  });
});
