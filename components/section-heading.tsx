import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  description?: string;
  actionSlot?: ReactNode;
}

export function SectionHeading({
  title,
  description,
  actionSlot,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {description && <p className="text-sm text-white/60">{description}</p>}
      </div>
      {actionSlot}
    </div>
  );
}
