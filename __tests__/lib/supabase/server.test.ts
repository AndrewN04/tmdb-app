/**
 * Tests for lib/supabase/server.ts
 * Covers the server Supabase client factory.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Define types for the mock
interface CookieConfig {
  getAll: () => Array<{ name: string; value: string }>;
  setAll: (
    cookies: Array<{
      name: string;
      value: string;
      options?: Record<string, unknown>;
    }>
  ) => void;
}

interface MockCallArgs {
  cookies: CookieConfig;
}

// Mock @supabase/ssr - use explicit typing for mock calls access
const mockCreateServerClient = vi.fn<
  (url: string, key: string, config: MockCallArgs) => { auth: object }
>(() => ({ auth: {} }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: mockCreateServerClient,
}));

// Mock next/headers
const mockCookieStore = {
  getAll: vi.fn((): Array<{ name: string; value: string }> => []),
  set: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const originalEnv = { ...process.env };

describe("createSupabaseServerClient", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("environment validation", () => {
    it("should throw when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const { createSupabaseServerClient } =
        await import("@/lib/supabase/server");

      await expect(createSupabaseServerClient()).rejects.toThrow(
        "Supabase credentials are missing"
      );
    });

    it("should throw when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { createSupabaseServerClient } =
        await import("@/lib/supabase/server");

      await expect(createSupabaseServerClient()).rejects.toThrow(
        "Supabase credentials are missing"
      );
    });
  });

  describe("client creation", () => {
    it("should create client when env vars are set", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

      const { createSupabaseServerClient } =
        await import("@/lib/supabase/server");

      const client = await createSupabaseServerClient();

      expect(mockCreateServerClient).toHaveBeenCalled();
      expect(client).toBeDefined();
    });

    it("should pass URL and key to createServerClient", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-123";

      const { createSupabaseServerClient } =
        await import("@/lib/supabase/server");
      await createSupabaseServerClient();

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        "https://project.supabase.co",
        "anon-key-123",
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );
    });
  });

  describe("cookie handling", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    });

    it("should wire getAll to cookie store", async () => {
      mockCookieStore.getAll.mockReturnValue([
        { name: "sb-token", value: "abc123" },
      ]);

      const { createSupabaseServerClient } =
        await import("@/lib/supabase/server");
      await createSupabaseServerClient();

      // Get the cookies config passed to createServerClient
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;
      const cookies = cookiesConfig.getAll();

      expect(cookies).toEqual([{ name: "sb-token", value: "abc123" }]);
    });

    it("should wire setAll to cookie store", async () => {
      const { createSupabaseServerClient } =
        await import("@/lib/supabase/server");
      await createSupabaseServerClient();

      // Get the cookies config passed to createServerClient
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies;

      cookiesConfig.setAll([
        { name: "test-cookie", value: "test-value", options: { path: "/" } },
      ]);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "test-cookie",
        "test-value",
        { path: "/" }
      );
    });
  });
});
