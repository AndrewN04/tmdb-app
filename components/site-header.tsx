"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { AuthButton } from "@/components/auth-button";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl supports-backdrop-filter:bg-slate-950/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
        {/* Mobile Menu Button */}
        <button
          className="text-white/80 hover:text-white md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            T
          </div>
          <span className="hidden text-lg font-bold tracking-tight text-white sm:inline-block">
            TMDB Stylistic
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
          <Link href="/movies" className="transition-colors hover:text-white">
            Movies
          </Link>
          <Link href="/tv" className="transition-colors hover:text-white">
            TV Shows
          </Link>
          <Link href="/people" className="transition-colors hover:text-white">
            People
          </Link>
        </nav>

        {/* Search & Actions */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="relative hidden w-full max-w-md sm:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              placeholder="Search movies, TV shows..."
              className="h-9 w-full rounded-full border border-white/10 bg-white/5 pr-4 pl-10 text-sm text-white placeholder:text-white/40 focus:border-blue-500 focus:bg-white/10 focus:ring-0 focus:outline-none"
            />
          </div>

          <AuthButton />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium text-white/80">
            <Link
              href="/movies"
              className="transition-colors hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Movies
            </Link>
            <Link
              href="/tv"
              className="transition-colors hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              TV Shows
            </Link>
            <Link
              href="/people"
              className="transition-colors hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              People
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
