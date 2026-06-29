import type { SupabaseClient, User } from "@supabase/supabase-js";

const AUTH_TIMEOUT_MS = 5000;

export async function getUserWithTimeout(
  supabase: SupabaseClient,
  timeoutMs = AUTH_TIMEOUT_MS,
): Promise<User | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);

    if (result === null) {
      console.warn("[torqueerp] Supabase auth timeout — verifique conexão e .env");
      return null;
    }

    return result.data.user ?? null;
  } catch {
    return null;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
