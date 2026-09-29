"use server";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { TextItemSchema } from "./types";
import { revalidatePath } from "next/cache";

export async function createTextItem(content: string) {
  if (!content || !content.length) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw "Usuario no autenticado";

  const { data, error: insertError } = await supabase
    .from("text_items")
    .insert({
      user_id: user?.id,
      content: content,
    })
    .select()
    .single();

  if (insertError) throw "Ocurrio un error al crear el item";

  revalidatePath("/edit");

  return TextItemSchema.parse(data);
}
