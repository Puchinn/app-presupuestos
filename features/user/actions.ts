"use server";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  LoginResult,
  UpdateProfileSchema,
  UserInfo,
  UserInfoSchema,
  UserResult,
} from "./types";

interface Props {
  email: string;
  password: string;
}

export async function logIn(form: Props): Promise<LoginResult> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword(form);

  if (error) {
    console.error("Error al iniciar sesión:", error.message);
    return {
      ok: false,
      error: "No se pudo iniciar sesión. Verificá tu correo electrónico y contraseña e intentá nuevamente.",
    };
  }

  redirect("/");
}

export async function logOut() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function getUser(): Promise<UserResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error al leer la sesión:", error.message);
    return {
      ok: false,
      error: "No se pudo leer tu sesión. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (profileError || !data) {
    console.error(
      "Error al obtener el perfil:",
      profileError?.message ?? "sin datos",
    );
    return { ok: false, error: "No se pudo cargar tu perfil." };
  }

  const parsed = UserInfoSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Perfil inválido:", parsed.error.issues);
    return { ok: false, error: "Tu perfil tiene datos inválidos." };
  }

  return { ok: true, data: { ...parsed.data, email: user?.email ?? "" } };
}

export async function updateUser(
  user_data: Partial<UserInfo>,
): Promise<UserResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  // Descarta claves fuera del formulario (id, counters, email): escribir
  // counters acá pisaría el folio que emitBudget acaba de asignar.
  const parsedInput = UpdateProfileSchema.safeParse(user_data);
  if (!parsedInput.success) {
    console.error("Perfil inválido al guardar:", parsedInput.error.issues);
    return { ok: false, error: "Los datos del perfil no son válidos." };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(parsedInput.data)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error al actualizar el perfil:", error?.message ?? "sin datos");
    return { ok: false, error: "No se pudieron guardar tus cambios. Intenta de nuevo." };
  }

  const parsed = UserInfoSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Perfil inválido tras guardar:", parsed.error.issues);
    return { ok: false, error: "Tus cambios se guardaron pero el perfil quedó inválido." };
  }

  revalidatePath("/");

  return { ok: true, data: { ...parsed.data, email: user.email ?? "" } };
}
