"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  success?: string;
};

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "oficina"
  );
}

async function createOrganizationForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  companyName: string,
) {
  const baseSlug = slugify(companyName);
  let slug = baseSlug;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: companyName, slug })
      .select("id")
      .single();

    if (!orgError && org) {
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: org.id,
          user_id: userId,
          role: "owner",
        });

      if (memberError) {
        return { error: memberError.message };
      }

      return { success: true };
    }

    if (orgError?.code === "23505") {
      slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
      continue;
    }

    return { error: orgError?.message ?? "Erro ao criar organização." };
  }

  return { error: "Não foi possível gerar um slug único para a oficina." };
}

export async function signUp(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const company = (formData.get("company") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!company || !email || !password) {
    return { error: "Preencha todos os campos." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: company,
        company_name: company,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Não foi possível criar a conta." };
  }

  if (data.session) {
    const orgResult = await createOrganizationForUser(
      supabase,
      data.user.id,
      company,
    );

    if (orgResult.error) {
      return { error: orgResult.error };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return {
    success:
      "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.",
  };
}

export async function signIn(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
