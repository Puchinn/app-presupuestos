"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Service, ServiceSchema } from "./types";
import { TextItem } from "../text-item/types";

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

  revalidatePath("/edit");
  return ServiceSchema.parse(data);
}

export async function updateService(service: Partial<Service>) {
  if (!service.id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (service.name !== undefined) updatePayload.name = service.name;
  if (service.price !== undefined) updatePayload.price = Number(service.price);
  if (service.quantity !== undefined)
    updatePayload.quantity = Number(service.quantity);
  if (service.details !== undefined) updatePayload.details = service.details;

  const { data, error } = await supabase
    .from("services")
    .update(updatePayload)
    .eq("id", service.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    throw new Error("Error al actualizar el servicio: " + error.message);
  }

  revalidatePath("/edit");
  return data as Service;
}

export async function deleteService(service: Service | { id: string }) {
  if (!service.id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", service.id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Error al eliminar el servicio: " + error.message);
  }

  revalidatePath("/edit");
}
