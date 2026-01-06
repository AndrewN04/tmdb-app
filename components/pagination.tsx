"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  currentParams?: Record<string, string | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  currentParams = {},
}: PaginationProps) {
  const router = useRouter();
  const [prevInput, setPrevInput] = useState("");
  const [nextInput, setNextInput] = useState("");

  // Build URL with page parameter
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, value);
      }
    });
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      router.push(buildUrl(page));
    }
  };

  const handleInputSubmit = (value: string, inputType: "prev" | "next") => {
    const page = parseInt(value, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      goToPage(page);
    }
    if (inputType === "prev") {
      setPrevInput("");
    } else {
      setNextInput("");
    }
  };

  // Calculate which page numbers to show
  const prevPages: number[] = [];
  const nextPages: number[] = [];

  // Previous 2 pages (if they exist and aren't page 1)
  for (let i = 2; i >= 1; i--) {
    const page = currentPage - i;
    if (page > 1) {
      prevPages.push(page);
    }
  }

  // Next 2 pages (if they exist and aren't the last page)
  for (let i = 1; i <= 2; i++) {
    const page = currentPage + i;
    if (page < totalPages) {
      nextPages.push(page);
    }
  }

  // Check if we need the input fields (gap between first/last and visible pages)
  const showPrevInput = currentPage > 4; // Gap between page 1 and first visible prev page
  const showNextInput = currentPage < totalPages - 3; // Gap between last visible next page and last page

  const buttonClass =
    "flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white";
  const disabledButtonClass =
    "flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-sm font-medium text-white/20 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* Previous Arrow */}
      {currentPage > 1 ? (
        <a
          href={buildUrl(currentPage - 1)}
          className={buttonClass}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </a>
      ) : (
        <span className={disabledButtonClass}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page 1 */}
      {currentPage === 1 ? (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
          1
        </span>
      ) : (
        <a href={buildUrl(1)} className={buttonClass}>
          1
        </a>
      )}

      {/* Previous Input (dots) */}
      {showPrevInput && (
        <div className="relative">
          <input
            type="text"
            value={prevInput}
            onChange={(e) => setPrevInput(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInputSubmit(prevInput, "prev");
              }
            }}
            onBlur={() => handleInputSubmit(prevInput, "prev")}
            placeholder="..."
            className="h-10 w-12 rounded-lg border border-white/10 bg-white/5 text-center text-sm text-white placeholder:text-white/40 focus:border-emerald-500 focus:bg-white/10 focus:outline-none"
          />
        </div>
      )}

      {/* Previous Pages */}
      {prevPages.map((page) => (
        <a key={page} href={buildUrl(page)} className={buttonClass}>
          {page}
        </a>
      ))}

      {/* Current Page (if not 1 or last) */}
      {currentPage !== 1 && currentPage !== totalPages && (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
          {currentPage}
        </span>
      )}

      {/* Next Pages */}
      {nextPages.map((page) => (
        <a key={page} href={buildUrl(page)} className={buttonClass}>
          {page}
        </a>
      ))}

      {/* Next Input (dots) */}
      {showNextInput && (
        <div className="relative">
          <input
            type="text"
            value={nextInput}
            onChange={(e) => setNextInput(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInputSubmit(nextInput, "next");
              }
            }}
            onBlur={() => handleInputSubmit(nextInput, "next")}
            placeholder="..."
            className="h-10 w-12 rounded-lg border border-white/10 bg-white/5 text-center text-sm text-white placeholder:text-white/40 focus:border-emerald-500 focus:bg-white/10 focus:outline-none"
          />
        </div>
      )}

      {/* Last Page Number */}
      {totalPages > 1 &&
        (currentPage === totalPages ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            {totalPages}
          </span>
        ) : (
          <a href={buildUrl(totalPages)} className={buttonClass}>
            {totalPages}
          </a>
        ))}

      {/* Next Arrow */}
      {currentPage < totalPages ? (
        <a
          href={buildUrl(currentPage + 1)}
          className={buttonClass}
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </a>
      ) : (
        <span className={disabledButtonClass}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
