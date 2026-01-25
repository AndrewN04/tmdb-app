"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "@/components/search-command";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Search, User, LogOut, Heart, Bookmark, Film, Tv } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MainNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const isAuthenticated = !!session?.user;
  
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/5">
      <div className="container flex h-16 items-center gap-8 px-6 sm:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl tracking-tight group">
          <span className="gradient-text font-extrabold">TMDB</span>
          <span className="text-foreground/80 font-medium group-hover:text-foreground transition-colors">Improved</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link 
            href="/movies" 
            className={`relative px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
              isActive('/movie') 
                ? 'text-primary bg-primary/10' 
                : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            Movies
            {isActive('/movie') && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
          <Link 
            href="/tv" 
            className={`relative px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
              isActive('/tv') 
                ? 'text-primary bg-primary/10' 
                : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
            }`}
          >
            <Tv className="w-4 h-4" />
            TV Shows
            {isActive('/tv') && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        </nav>

        {/* Right section */}
        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Search */}
          <SearchCommand 
            trigger={
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full h-10 w-10 transition-all duration-300"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            }
          />
          
          {/* Auth section */}
          <nav className="flex items-center gap-2">
            {isPending ? (
              <div className="h-10 w-10 rounded-full shimmer" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/50 transition-all duration-300"
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary/30 hover:border-primary/60 transition-colors">
                      <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                        {session.user.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/10">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{session.user.name || "My Account"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4 text-primary" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile?tab=favorites" className="cursor-pointer flex items-center">
                      <Heart className="mr-2 h-4 w-4 text-rose-400" />
                      <span>Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile?tab=watchlist" className="cursor-pointer flex items-center">
                      <Bookmark className="mr-2 h-4 w-4 text-blue-400" />
                      <span>Watchlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-foreground/70 hover:text-foreground hover:bg-white/10 rounded-full px-4" 
                  asChild
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button 
                  size="sm" 
                  className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 font-semibold shadow-lg shadow-primary/20" 
                  asChild
                >
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
