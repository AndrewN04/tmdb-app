"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface TrendingToggleProps {
  currentWindow?: "day" | "week";
}

export function TrendingToggle({ currentWindow = "day" }: TrendingToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleToggle = (window: "day" | "week") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("trending", window);

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      <button
        onClick={() => handleToggle("day")}
        disabled={isPending}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
          currentWindow === "day"
            ? "bg-linear-to-r from-emerald-600 to-teal-600 text-white"
            : "text-white/70 hover:text-white"
        } ${isPending ? "opacity-50" : ""}`}
      >
        Today
      </button>
      <button
        onClick={() => handleToggle("week")}
        disabled={isPending}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
          currentWindow === "week"
            ? "bg-linear-to-r from-emerald-600 to-teal-600 text-white"
            : "text-white/70 hover:text-white"
        } ${isPending ? "opacity-50" : ""}`}
      >
        This Week
      </button>
    </div>
  );
}
