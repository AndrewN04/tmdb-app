import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface ContentSectionProps {
  title: string;
  viewAllHref?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}

export function ContentSection({
  title,
  viewAllHref,
  headerAction,
  children,
}: ContentSectionProps) {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-linear-to-b from-emerald-500 to-teal-500" />
          <h2 className="text-xl font-bold text-white md:text-2xl">{title}</h2>
          {headerAction}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            View All
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Content */}
      {children}
    </section>
  );
}
