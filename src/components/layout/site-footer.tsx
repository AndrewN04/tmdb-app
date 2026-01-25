import { Film, Github } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/5 mt-16">
      {/* Subtle gradient at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container py-12 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Film className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg">
                <span className="gradient-text">TMDB</span>
                <span className="text-foreground/80 ml-1">Improved</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A modern movie and TV show discovery platform powered by The Movie Database API.
            </p>
          </div>
          
          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/movies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Movies
              </Link>
              <Link href="/tv" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                TV Shows
              </Link>
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                My Library
              </Link>
            </nav>
          </div>
          
          {/* Credits */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Credits</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Data provided by{" "}
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  TMDB
                </a>
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="section-divider mt-10 mb-6" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} a04.dev. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
