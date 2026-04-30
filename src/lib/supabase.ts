import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { SupabaseRuntimeConfig } from "@/types/domain";

function readSupabaseCredentials(): {
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
} {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function getSupabaseRuntimeConfig(): SupabaseRuntimeConfig {
  const { url, anonKey } = readSupabaseCredentials();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

export function getSupabaseServerClient(): SupabaseClient | null {
  const { url, anonKey, serviceRoleKey } = readSupabaseCredentials();
  const accessKey = serviceRoleKey ?? anonKey;

  if (!url || !accessKey) {
    return null;
  }

  return createClient(url, accessKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
