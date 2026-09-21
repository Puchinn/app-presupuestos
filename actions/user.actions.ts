"use server";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { Client, UserInfo } from "@/types/user";
import { revalidatePath } from "next/cache";
import { getUserProfile, updateUserProfile } from "./profile";

export async function updateUserInfo(user: Partial<UserInfo>) {
  if (!user.id) return;
  return await updateUserProfile(user as UserInfo);
}

export async function getUserInfo(): Promise<UserInfo> {
  return await getUserProfile();
}

export async function getUserClients(): Promise<Client[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener clientes:", error.message);
    return [];
  }

  return (data || []) as Client[];
}

export async function createClient(name: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Error al crear cliente: " + error.message);
  }

  revalidatePath("/edit");
  return data as Client;
}

export async function deleteClient(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Error al eliminar cliente: " + error.message);
  }

  revalidatePath("/edit");
}

export async function updateClient(client: Partial<Client>) {
  if (!client.id) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("clients")
    .update({
      name: client.name,
      email: client.email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", client.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    throw new Error("Error al actualizar cliente: " + error.message);
  }

  revalidatePath("/edit");
  return data as Client;
}
