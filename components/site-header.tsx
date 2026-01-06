"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { SearchBar } from "@/components/search-bar";

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
          <span className="text-lg font-bold tracking-tight text-white">
            TMDB Chart
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
        </nav>

        {/* Search & Actions */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <SearchBar />

          <AuthButton />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium text-white/80">
            <Link
              href="/search"
              className="transition-colors hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Search
            </Link>
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
          </nav>
        </div>
      )}
    </header>
  );
}
