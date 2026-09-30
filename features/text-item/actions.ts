"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { TextActionResult, TextItem, TextListResult } from "./types";

// La ruta lleva el route group porque revalidatePath se etiqueta contra
// `definition.page` (que conserva `(budget)`), no contra la URL visible.
const EDIT_PATH = "/(budget)/edit/[id]";

function revalidateEditor() {
  revalidatePath(EDIT_PATH, "page");
}

export async function getUserTexts(): Promise<TextListResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Usuario no autenticado." };

  const { data, error } = await supabase
    .from("text_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      ok: false,
      error: "No se pudieron cargar tus fragmentos: " + error.message,
    };
  }

  return { ok: true, data: (data || []) as TextItem[] };
}

export async function createTextItem(
  content: string,
): Promise<TextActionResult> {
  const text = content.trim();
  if (!text) return { ok: false, error: "No hay texto para guardar." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Usuario no autenticado." };

  const { error } = await supabase
    .from("text_items")
    .insert({ user_id: user.id, content: text });

  if (error) {
    return {
      ok: false,
      error: "No se pudo guardar el fragmento: " + error.message,
    };
  }

  revalidateEditor();
  return { ok: true };
}

export async function updateTextItem(
  item: { id: string; content: string },
): Promise<TextActionResult> {
  const text = item.content.trim();
  if (!text) return { ok: false, error: "El fragmento no puede quedar vacío." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Usuario no autenticado." };

  const { error } = await supabase
    .from("text_items")
    .update({ content: text, updated_at: new Date().toISOString() })
    .eq("id", item.id)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      error: "No se pudo actualizar el fragmento: " + error.message,
    };
  }

  revalidateEditor();
  return { ok: true };
}

export async function deleteTextItem(id: string): Promise<TextActionResult> {
  if (!id) return { ok: false, error: "No se indicó el fragmento a eliminar." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Usuario no autenticado." };

  // .select() es necesario: sin él Supabase no devuelve las filas afectadas y
  // un delete que no matcheó nada parecería exitoso.
  const { data, error } = await supabase
    .from("text_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    return {
      ok: false,
      error: "No se pudo eliminar el fragmento: " + error.message,
    };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "El fragmento ya no existe." };
  }

  revalidateEditor();
  return { ok: true };
}
