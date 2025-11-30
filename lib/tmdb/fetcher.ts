import "server-only";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

type SearchParams = Record<string, string | number | null | undefined>;

export interface FetchTmdbOptions {
  searchParams?: SearchParams;
  init?: RequestInit;
}

function ensureApiKey() {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not configured. Set it in your environment before running the app.");
  }

  return TMDB_API_KEY;
}

function isV4Token(key: string) {
  return key.startsWith("eyJ");
}

function mergeHeaders(base: HeadersInit, override?: HeadersInit) {
  const headers = new Headers(base);

  if (override) {
    const extras = new Headers(override);
    extras.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function appendSearchParams(url: URL, params?: SearchParams) {
  if (!params) return;

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    url.searchParams.set(key, String(value));
  });
}

async function readBody(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function fetchTmdb<T>(endpoint: string, options: FetchTmdbOptions = {}): Promise<T> {
  const apiKey = ensureApiKey();
  const normalized = endpoint.replace(/^\/+/, "");
  const url = new URL(`${TMDB_BASE_URL}/${normalized}`);

  appendSearchParams(url, options.searchParams);

  const defaultHeaders: HeadersInit = { accept: "application/json" };

  if (isV4Token(apiKey)) {
    defaultHeaders["Authorization"] = `Bearer ${apiKey}`;
  } else {
    url.searchParams.set("api_key", apiKey);
  }

  const headers = mergeHeaders(defaultHeaders, options.init?.headers);

  const init: RequestInit = {
    ...options.init,
    headers,
  };

  const res = await fetch(url.toString(), init);

  if (!res.ok) {
    const body = await readBody(res);
    throw new Error(`TMDB request failed (${res.status}): ${body}`);
  }

  return (await res.json()) as T;
}
