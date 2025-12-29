import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserWatchlist } from "@/app/actions/watchlist";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const watchlist = await getUserWatchlist();
  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-white/60">Welcome back, {name}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Account Details</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/60">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/60">Provider</dt>
            <dd className="capitalize">
              {user.app_metadata?.provider || "Email"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/60">Member since</dt>
            <dd>{new Date(user.created_at).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Your Watchlist</h2>
        {watchlist.length === 0 ? (
          <p className="mt-2 text-sm text-white/60">
            Your saved movies will appear here. Start browsing to add movies to
            your watchlist!
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {watchlist.map((item) => (
              <Link
                key={item.id}
                href={`/movie/${item.tmdbId}`}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10"
              >
                {item.posterPath ? (
                  <div className="relative aspect-2/3">
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {item.favorite && (
                      <div className="absolute top-2 right-2 rounded-full bg-yellow-400/20 p-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-2/3 items-center justify-center bg-white/5">
                    <span className="text-white/40">No poster</span>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="line-clamp-1 font-medium">{item.title}</h3>
                  <p className="mt-1 text-xs text-white/60 capitalize">
                    {item.mediaType}
                  </p>
                  {item.notes && (
                    <p className="mt-2 line-clamp-2 text-xs text-white/50">
                      {item.notes}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
