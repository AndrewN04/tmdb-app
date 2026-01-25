"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ContentRowProps {
  title: string;
  viewAllLink?: string;
  children: React.ReactNode;
}

export function ContentRow({ title, viewAllLink, children }: ContentRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-5 py-8">
      {/* Header with title and view all */}
      <div className="flex items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Decorative accent */}
          <div className="w-1 h-6 rounded-full bg-linear-to-b from-primary to-primary/30" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Scroll indicators - visible on desktop */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-8 w-8 transition-all duration-300 ${
                canScrollLeft 
                  ? 'bg-white/10 hover:bg-white/20 text-foreground' 
                  : 'text-muted-foreground/30 cursor-not-allowed'
              }`}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-8 w-8 transition-all duration-300 ${
                canScrollRight 
                  ? 'bg-white/10 hover:bg-white/20 text-foreground' 
                  : 'text-muted-foreground/30 cursor-not-allowed'
              }`}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {viewAllLink && (
            <Link 
              href={viewAllLink}
              className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 ml-2"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="relative group/row">
        {/* Left fade gradient */}
        <div 
          className={`absolute left-0 top-0 bottom-4 z-10 w-16 sm:w-24 bg-linear-to-r from-background via-background/80 to-transparent pointer-events-none transition-opacity duration-300 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 sm:gap-5 px-4 sm:px-8 pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>

        {/* Right fade gradient */}
        <div 
          className={`absolute right-0 top-0 bottom-4 z-10 w-16 sm:w-24 bg-linear-to-l from-background via-background/80 to-transparent pointer-events-none transition-opacity duration-300 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Mobile scroll hint - animated dot indicator */}
        <div className="flex sm:hidden justify-center gap-1 mt-2">
          <div className={`w-6 h-1 rounded-full transition-all duration-300 ${canScrollLeft ? 'bg-primary/40' : 'bg-muted'}`} />
          <div className="w-6 h-1 rounded-full bg-primary" />
          <div className={`w-6 h-1 rounded-full transition-all duration-300 ${canScrollRight ? 'bg-primary/40' : 'bg-muted'}`} />
        </div>
      </div>
    </div>
  );
}
