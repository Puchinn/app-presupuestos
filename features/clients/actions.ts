"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ClientActionResult, ClientListResult, ClientSchema } from "./types";

// La ruta lleva el route group porque revalidatePath se etiqueta contra
// `definition.page` (que conserva `(budget)`), no contra la URL visible.
const EDIT_PATH = "/(budget)/edit/[id]";

function revalidateEditor() {
  revalidatePath(EDIT_PATH, "page");
}

export async function getClients(): Promise<ClientListResult> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Usuario no autenticado." };

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    return {
      ok: false,
      error: "No se pudieron cargar tus clientes: " + error.message,
    };
  }

  const parsed = ClientSchema.array().safeParse(data ?? []);
  if (!parsed.success) {
    return { ok: false, error: "No se pudieron leer tus clientes." };
  }

  return { ok: true, data: parsed.data };
}

/**
 * Crea un cliente con el nombre indicado y lo devuelve para vincularlo.
 * Si ya existe un cliente con ese nombre (sin distinguir mayúsculas ni
 * espacios sobrantes) devuelve el existente en vez de duplicarlo.
 */
export async function createClient(name: string): Promise<ClientActionResult> {
  const clean = name.trim();
  if (!clean) {
    return { ok: false, error: "El nombre del cliente no puede quedar vacío." };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Usuario no autenticado." };

  const { data: rows, error: readError } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id);

  if (readError) {
    return {
      ok: false,
      error: "No se pudo leer tu lista de clientes: " + readError.message,
    };
  }

  // La comparación se hace acá y no con un filtro de la DB: así no hay que
  // escapar comodines de `ilike` (`%`, `_`) que aparecerían en el nombre.
  const normalized = clean.toLowerCase();
  const existing = (rows ?? []).find(
    (row) => row.name.trim().toLowerCase() === normalized,
  );

  if (existing) {
    const parsed = ClientSchema.safeParse(existing);
    if (!parsed.success) {
      return { ok: false, error: "El cliente existente no se pudo leer." };
    }
    // Ya existe: se vincula el existente sin duplicar. No cambió nada en la
    // DB, así que no hace falta revalidar.
    return { ok: true, data: parsed.data };
  }

  const { data: created, error: insertError } = await supabase
    .from("clients")
    .insert({ user_id: user.id, name: clean })
    .select("*")
    .single();

  if (insertError) {
    return {
      ok: false,
      error: "No se pudo guardar el cliente: " + insertError.message,
    };
  }

  const parsedCreated = ClientSchema.safeParse(created);
  if (!parsedCreated.success) {
    return { ok: false, error: "El cliente guardado no se pudo leer." };
  }

  revalidateEditor();
  return { ok: true, data: parsedCreated.data };
}
