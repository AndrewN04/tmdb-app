export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/40 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 px-6 text-center text-sm text-white/60">
        <p>
          Built with <span className="font-medium text-white">Next.js</span>,{" "}
          <span className="font-medium text-white">Supabase Auth</span>,{" "}
          <span className="font-medium text-white">Prisma</span>, and{" "}
          <span className="font-medium text-white">Tailwind CSS</span>.
        </p>
      </div>
    </footer>
  );
}
