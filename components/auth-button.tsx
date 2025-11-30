"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogOut, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
      >
        Sign In
      </Link>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 rounded-full transition hover:ring-2 hover:ring-white/20"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name || "User avatar"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <User className="h-4 w-4" />
          </div>
        )}
      </button>

      {isMenuOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-white/10 bg-slate-900 py-2 shadow-xl backdrop-blur-none">
            <div className="border-b border-white/10 px-4 py-2">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </div>

            <Link
              href="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
