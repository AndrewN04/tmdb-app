import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const VERIFICATION_COOKIE_NAME = "turnstile_verified";

// Paths that don't require Turnstile verification
const TURNSTILE_PUBLIC_PATHS = [
  "/challenge",
  "/api/turnstile",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check Turnstile verification first (skip for public paths and static assets)
  const isTurnstilePublic = TURNSTILE_PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isStaticAsset = pathname.startsWith("/_next") || pathname.includes(".");
  
  if (!isTurnstilePublic && !isStaticAsset) {
    const isVerified = request.cookies.get(VERIFICATION_COOKIE_NAME)?.value === "true";
    if (!isVerified) {
      return NextResponse.redirect(new URL("/challenge", request.url));
    }
  }

  // Continue with Supabase auth session handling (from proxy.ts)
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validate and refresh the session
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all request paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
