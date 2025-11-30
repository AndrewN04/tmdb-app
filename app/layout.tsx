import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TMDB Watchlist",
  description: "Browse TMDB movies, track your watchlist, and sync with Supabase Auth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-white antialiased`}>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-xl font-semibold tracking-tight">
                TMDB
              </Link>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <Link href="/browse" className="hover:text-white">
                  Browse
                </Link>
                <Link href="/profile" className="hover:text-white">
                  Profile
                </Link>
              </div>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
          <footer className="border-t border-white/5 bg-black/40 py-6">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 text-xs text-white/60">
              <span>Powered by TMDB • Supabase Auth • Prisma</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
