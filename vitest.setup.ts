import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

// Mock server-only module (used by lib/tmdb.ts and lib/tmdb/fetcher.ts)
vi.mock("server-only", () => ({}));

// Mock next/headers for server components
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
    get: vi.fn(),
  })),
}));

// Mock next/cache for revalidation
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock next/image - returns a proper React element
vi.mock("next/image", () => ({
  default: function MockImage(props: {
    src?: string;
    alt?: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { src, alt, fill, priority, ...rest } = props;
    return React.createElement("img", {
      src: String(src ?? ""),
      alt: String(alt ?? ""),
      "data-testid": "next-image",
      ...rest,
    });
  },
}));

// Mock next/link - returns a proper React element
vi.mock("next/link", () => ({
  default: function MockLink(props: {
    href?: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) {
    const { href, children, ...rest } = props;
    return React.createElement(
      "a",
      { href: String(href ?? ""), ...rest },
      children
    );
  },
}));
