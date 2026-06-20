import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ws is only needed in Node.js < 22 (no native WebSocket)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ws = typeof WebSocket === "undefined" ? require("ws") : undefined;

function clientOptions() {
  return ws ? { realtime: { transport: ws } } : {};
}

// Client-side client (uses anon key)
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    clientOptions()
  );
}

// Server-side client (uses service role — bypasses RLS)
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    clientOptions()
  );
}
