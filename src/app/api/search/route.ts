import { tmdb } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await tmdb.searchMulti(query);
    // Filter out people, only show movies and tv
    const filtered = data.results.filter(
        item => item.media_type === 'movie' || item.media_type === 'tv'
    );
    return NextResponse.json({ results: filtered });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
