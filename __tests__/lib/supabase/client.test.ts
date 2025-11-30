/**
 * Tests for lib/supabase/client.ts
 * Covers the browser Supabase client factory.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock @supabase/ssr
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ auth: {} })),
}));

const originalEnv = { ...process.env };

describe("createSupabaseBrowserClient", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("environment validation", () => {
    it("should throw when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");

      expect(() => createSupabaseBrowserClient()).toThrow("Supabase anon key is missing");
    });

    it("should throw when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");

      expect(() => createSupabaseBrowserClient()).toThrow("Supabase anon key is missing");
    });

    it("should throw when both env vars are missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");

      expect(() => createSupabaseBrowserClient()).toThrow("Supabase anon key is missing");
    });
  });

  describe("client creation", () => {
    it("should create client when env vars are set", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const { createBrowserClient } = await import("@supabase/ssr");

      const client = createSupabaseBrowserClient();

      expect(createBrowserClient).toHaveBeenCalledWith(
        "https://test.supabase.co",
        "test-anon-key"
      );
      expect(client).toBeDefined();
    });

    it("should pass correct URL and key to createBrowserClient", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJ0eXAiOiJKV1QifQ";

      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const { createBrowserClient } = await import("@supabase/ssr");

      createSupabaseBrowserClient();

      expect(createBrowserClient).toHaveBeenCalledWith(
        "https://project.supabase.co",
        "eyJ0eXAiOiJKV1QifQ"
      );
    });
  });
});
