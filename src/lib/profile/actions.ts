"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  error?: string;
  success?: string;
};

export async function updateProfile(
  _prevState: ProfileState | null,
  formData: FormData,
): Promise<ProfileState> {
  const fullName = (formData.get("full_name") as string)?.trim();

  if (!fullName) {
    return { error: "Informe seu nome." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: "Perfil atualizado com sucesso." };
}
