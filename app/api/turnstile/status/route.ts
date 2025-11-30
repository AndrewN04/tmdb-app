import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const VERIFICATION_COOKIE_NAME = "turnstile_verified";

export async function GET() {
  const cookieStore = await cookies();
  const verified = cookieStore.get(VERIFICATION_COOKIE_NAME)?.value === "true";

  return NextResponse.json({ verified });
}
