"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Service, ServiceSchema, ServiceActionResult } from "./types";
import { TextItem } from "../text-item/types";

// La ruta lleva el route group porque revalidatePath se etiqueta contra
// `definition.page` (que conserva `(budget)`), no contra la URL visible.
const EDIT_PATH = "/(budget)/edit/[id]";

function revalidateEditor() {
  revalidatePath(EDIT_PATH, "page");
}

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener servicios:", error.message);
    return [];
  }

  return (data || []) as Service[];
}

export async function getUserTexts(): Promise<TextItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("text_items")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error al obtener textos:", error.message);
    return [];
  }

  return (data || []) as TextItem[];
}

export async function saveService(service: Partial<Service>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { id, ...cleanData } = service;

  const newService: Partial<Service> = {
    ...cleanData,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("services")
    .insert(newService)
    .select("*")
    .single();

  if (error) {
    throw new Error("Error al guardar el servicio: " + error.message);
  }

  revalidateEditor();
  return ServiceSchema.parse(data);
}

export async function updateService(
  service: Partial<Service>,
): Promise<ServiceActionResult> {
  if (!service.id) {
    return { ok: false, error: "No se indicó el servicio a actualizar." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Usuario no autenticado." };

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (service.name !== undefined) updatePayload.name = service.name;
  if (service.price !== undefined) updatePayload.price = Number(service.price);
  if (service.quantity !== undefined)
    updatePayload.quantity = Number(service.quantity);
  if (service.details !== undefined) updatePayload.details = service.details;

  const { error } = await supabase
    .from("services")
    .update(updatePayload)
    .eq("id", service.id)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      error: "No se pudo actualizar el servicio: " + error.message,
    };
  }

  revalidateEditor();
  return { ok: true };
}

export async function deleteService(
  service: Service | { id: string },
): Promise<ServiceActionResult> {
  if (!service.id) {
    return { ok: false, error: "No se indicó el servicio a eliminar." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Usuario no autenticado." };

  // .select() es necesario: sin él Supabase no devuelve las filas afectadas y
  // un delete que no matcheó nada parecería exitoso.
  const { data, error } = await supabase
    .from("services")
    .delete()
    .eq("id", service.id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    return {
      ok: false,
      error: "No se pudo eliminar el servicio: " + error.message,
    };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "El servicio ya no está en tu catálogo." };
  }

  revalidateEditor();
  return { ok: true };
}
