"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { BudgetItem, TextItem } from "@/types/resources";

export async function getBudgetCategories(): Promise<BudgetItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .or(`user_id.is.null${user ? `,user_id.eq.${user.id}` : ""}`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error al obtener categorías:", error.message);
    return [];
  }

  return (data || []) as BudgetItem[];
}

export async function createBudgetCategory(name: string): Promise<BudgetItem> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("budget_items")
    .insert({
      name,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Error al crear categoría: " + error.message);
  }

  revalidatePath("/edit");
  return data as BudgetItem;
}

export async function createTextItem(content: string): Promise<TextItem> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("text_items")
    .insert({
      content,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Error al crear ítem de texto: " + error.message);
  }

  revalidatePath("/edit");
  return data as TextItem;
}

export async function updateTextItem({
  id,
  content,
}: {
  id: string;
  content: string;
}): Promise<TextItem> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("text_items")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    throw new Error("Error al actualizar ítem de texto: " + error.message);
  }

  revalidatePath("/edit");
  return data as TextItem;
}

export async function deleteTextItem(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { error } = await supabase
    .from("text_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Error al eliminar ítem de texto: " + error.message);
  }

  revalidatePath("/edit");
}
