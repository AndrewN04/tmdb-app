import { createBrowserClient } from "@supabase/ssr";

// Keeps browser usage centralized so env validation happens once.
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase anon key is missing");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
