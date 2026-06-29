import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth-timeout";

export type SessionOrganization = {
  id: string;
  name: string;
  slug: string;
};

export type SessionProfile = {
  full_name: string | null;
  avatar_url: string | null;
};

export type SessionContext = {
  user: {
    id: string;
    email: string;
  };
  profile: SessionProfile | null;
  organization: SessionOrganization | null;
  role: string | null;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const user = await getUserWithTimeout(supabase);

  if (!user) {
    return null;
  }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("organization_members")
      .select("role, organizations(id, name, slug)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle(),
  ]);

  const orgData = membership?.organizations;
  let organization: SessionOrganization | null = null;

  if (orgData && !Array.isArray(orgData)) {
    organization = orgData as SessionOrganization;
  } else if (Array.isArray(orgData) && orgData[0]) {
    organization = orgData[0] as SessionOrganization;
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
    },
    profile: profile ?? null,
    organization: organization ?? null,
    role: membership?.role ?? null,
  };
}

export async function getOrganizationId(): Promise<string | null> {
  const session = await getSessionContext();
  return session?.organization?.id ?? null;
}
