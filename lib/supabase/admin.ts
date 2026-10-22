import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/db";

/**
 * Service-role client: bypasses RLS entirely. Server-only — never import this
 * from a Client Component or anything bundled to the browser. Used for
 * account bootstrap (profile/student/parent row creation right after
 * auth.admin.createUser) and for the recommendation rule engine, which must
 * write parent_recommendations on a student's behalf.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
