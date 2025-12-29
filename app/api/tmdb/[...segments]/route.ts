import { NextResponse } from "next/server";

import { fetchTmdb } from "@/lib/tmdb/fetcher";

export const runtime = "edge";
export const revalidate = 3600;

const CACHE_SECONDS = process.env.TMDB_CACHE_SECONDS
  ? Number(process.env.TMDB_CACHE_SECONDS)
  : revalidate;

// Translate user-friendly catch-all segments into concrete TMDB REST paths.
function mapSegmentsToPath(
  segments: string[],
  searchParams: URLSearchParams
): string | null {
  if (segments.length === 0) {
    return null;
  }

  const [head, ...rest] = segments;

  switch (head) {
    case "popular":
      return "movie/popular";
    case "upcoming":
      return "movie/upcoming";
    case "top-rated":
      return "movie/top_rated";
    case "trending": {
      const window = searchParams.get("window") ?? "day";
      return `trending/movie/${window}`;
    }
    case "movie": {
      if (rest.length === 0) return null;
      return `movie/${rest.join("/")}`;
    }
    default:
      return null;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ segments: string[] }> }
) {
  const params = await context.params;
  const { searchParams } = new URL(request.url);
  const path = mapSegmentsToPath(params.segments ?? [], searchParams);

  if (!path) {
    return NextResponse.json(
      { error: "Unsupported TMDB route" },
      { status: 400 }
    );
  }

  // `window` is only used internally for mapping
  searchParams.delete("window");

  try {
    const payload = await fetchTmdb(path, {
      searchParams: Object.fromEntries(searchParams.entries()),
      init: {
        cache: "force-cache",
        next: { revalidate: CACHE_SECONDS },
      },
    });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "TMDB upstream error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
