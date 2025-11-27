import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const CACHE_SECONDS = Number(process.env.TMDB_CACHE_SECONDS ?? "3600");
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export const runtime = "edge";
export const revalidate = CACHE_SECONDS;

function isV4Token(key: string) {
  return key.startsWith("eyJ");
}

// Translate user-friendly catch-all segments into concrete TMDB REST paths.
function mapSegmentsToPath(segments: string[], searchParams: URLSearchParams): string | null {
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
  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "TMDB API key missing" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const path = mapSegmentsToPath(params.segments ?? [], searchParams);

  if (!path) {
    return NextResponse.json({ error: "Unsupported TMDB route" }, { status: 400 });
  }

  const url = new URL(`${TMDB_BASE_URL}/${path}`);

  // `window` is only used internally for mapping
  searchParams.delete("window");

  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  if (!isV4Token(TMDB_API_KEY)) {
    url.searchParams.set("api_key", TMDB_API_KEY);
  }

  const res = await fetch(url.toString(), {
    headers: isV4Token(TMDB_API_KEY)
      ? {
          Authorization: `Bearer ${TMDB_API_KEY}`,
          accept: "application/json",
        }
      : {
          accept: "application/json",
        },
    cache: "force-cache",
    next: { revalidate: CACHE_SECONDS },
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json(
      { error: "TMDB upsteam error", status: res.status, body },
      { status: 502 }
    );
  }

  const payload = await res.json();

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": `public, s-maxage=${CACHE_SECONDS}`,
    },
  });
}
