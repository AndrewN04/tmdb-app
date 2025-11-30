import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getBaseUrl } from "@/lib/http";

describe("getBaseUrl", () => {
  const originalWindow = global.window;
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.window = originalWindow;
  });

  it("returns window.location.origin in browser environment", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {
      location: {
        origin: "https://example.com",
      },
    };

    expect(getBaseUrl()).toBe("https://example.com");
  });

  it("returns NEXT_PUBLIC_APP_URL when set (server-side)", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://my-app.com";

    expect(getBaseUrl()).toBe("https://my-app.com");
  });

  it("strips trailing slash from NEXT_PUBLIC_APP_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://my-app.com/";

    expect(getBaseUrl()).toBe("https://my-app.com");
  });

  it("returns Vercel URL with https prefix when VERCEL_URL is set", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_URL = "my-app.vercel.app";

    expect(getBaseUrl()).toBe("https://my-app.vercel.app");
  });

  it("returns localhost:3000 as fallback", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;

    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("prioritizes window over env vars", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {
      location: {
        origin: "https://browser.com",
      },
    };
    process.env.NEXT_PUBLIC_APP_URL = "https://env.com";

    expect(getBaseUrl()).toBe("https://browser.com");
  });

  it("prioritizes NEXT_PUBLIC_APP_URL over VERCEL_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://custom.com";
    process.env.VERCEL_URL = "fallback.vercel.app";

    expect(getBaseUrl()).toBe("https://custom.com");
  });
});
