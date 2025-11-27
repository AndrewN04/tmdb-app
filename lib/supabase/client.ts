import { createBrowserClient } from "@supabase/ssr";

// Keeps browser usage centralized so env validation happens once.
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase publishable key is missing");
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
