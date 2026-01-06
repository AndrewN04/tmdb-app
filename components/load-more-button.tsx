"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";

interface LoadMoreButtonProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  currentParams: Record<string, string | undefined>;
}

export function LoadMoreButton({
  currentPage,
  totalPages,
  baseUrl,
  currentParams,
}: LoadMoreButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    const params = new URLSearchParams();

    Object.entries(currentParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    params.set("page", (currentPage + 1).toString());

    startTransition(() => {
      router.push(`${baseUrl}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={loadMore}
        disabled={isPending}
        className="flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 px-8 py-3 font-semibold text-white transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
      >
        {isPending ? (
          "Loading..."
        ) : (
          <>
            Load More
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="text-xs text-white/40">
        Page {currentPage} of {Math.min(totalPages, 500)}
      </p>
    </div>
  );
}
