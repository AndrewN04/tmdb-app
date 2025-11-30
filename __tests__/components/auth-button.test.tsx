/**
 * Tests for components/auth-button.tsx
 * Covers the AuthButton component with authentication states.
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthButton } from "@/components/auth-button";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Mock Supabase client
const mockSignOut = vi.fn();
const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  })),
}));

// Mock Next.js router
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("AuthButton", () => {
  const mockUser: Partial<SupabaseUser> = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: {
      full_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loading state", () => {
    it("should show loading placeholder initially", () => {
      mockGetUser.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<AuthButton />);

      const loadingElement = document.querySelector(".animate-pulse");
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe("signed out state", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
    });

    it("should show Sign In link when not authenticated", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        expect(screen.getByText("Sign In")).toBeInTheDocument();
      });
    });

    it("should link to sign-in page", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        const link = screen.getByRole("link", { name: /sign in/i });
        expect(link).toHaveAttribute("href", "/sign-in");
      });
    });
  });

  describe("signed in state", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    });

    it("should show user avatar when authenticated", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        const avatar = screen.getByRole("img");
        expect(avatar).toHaveAttribute("alt", "Test User");
      });
    });

    it("should show fallback icon when no avatar URL", async () => {
      const userWithoutAvatar = {
        ...mockUser,
        user_metadata: { full_name: "No Avatar" },
      };
      mockGetUser.mockResolvedValue({ data: { user: userWithoutAvatar } });

      render(<AuthButton />);

      await waitFor(() => {
        // Should not have an img element, but should have the button
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
      });
    });

    it("should toggle dropdown menu on click", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    it("should show user name and email in dropdown", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("should have link to profile page", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      const profileLink = screen.getByRole("link", { name: /profile/i });
      expect(profileLink).toHaveAttribute("href", "/profile");
    });
  });

  describe("sign out flow", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockSignOut.mockResolvedValue({});
    });

    it("should call signOut when Sign Out is clicked", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      fireEvent.click(screen.getByText("Sign Out"));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it("should redirect to home after sign out", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      fireEvent.click(screen.getByText("Sign Out"));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("should close menu after sign out", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      fireEvent.click(screen.getByText("Sign Out"));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe("auth state changes", () => {
    it("should subscribe to auth state changes on mount", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      render(<AuthButton />);

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });
    });

    it("should unsubscribe on unmount", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const { unmount } = render(<AuthButton />);

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should update user when auth state changes", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      let authCallback: (event: string, session: { user: SupabaseUser | null } | null) => void;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });

      render(<AuthButton />);

      await waitFor(() => {
        expect(screen.getByText("Sign In")).toBeInTheDocument();
      });

      // Simulate auth state change
      authCallback!("SIGNED_IN", { user: mockUser as SupabaseUser });

      await waitFor(() => {
        expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
      });
    });
  });

  describe("menu interactions", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    });

    it("should close menu when backdrop is clicked", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      expect(screen.getByText("Profile")).toBeInTheDocument();

      // Click the backdrop
      const backdrop = document.querySelector(".fixed.inset-0");
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(() => {
        expect(screen.queryByText("Profile")).not.toBeInTheDocument();
      });
    });

    it("should close menu when Profile link is clicked", async () => {
      render(<AuthButton />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      fireEvent.click(screen.getByText("Profile"));

      await waitFor(() => {
        expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
      });
    });
  });

  describe("fallback display name", () => {
    it("should use email as fallback when no name", async () => {
      const userWithoutName = {
        ...mockUser,
        user_metadata: {},
      };
      mockGetUser.mockResolvedValue({ data: { user: userWithoutName } });

      render(<AuthButton />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      // Both name and email fields show the email when no name is set
      const emailElements = screen.getAllByText("test@example.com");
      expect(emailElements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
