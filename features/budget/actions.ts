"use server";

import { createClient } from "@/lib/supabase/server";
import type { Budget, SentStatus } from "@/features/budget/types";
import {
  BudgetSchema,
  ListBudgetSchema,
  SentStatusSchema,
  UIBudgetSchema,
} from "@/features/budget/types";
import { DEFAULT_BUDGET } from "@/lib/default_budget";
import { revalidatePath } from "next/cache";
import { getUser } from "../user/actions";

export async function getUserBudgets(): Promise<Budget[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const user_id = user?.id;
  if (!user_id) return [];

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener presupuestos:", error.message);
    return [];
  }

  return ListBudgetSchema.parse(data);
}

export async function getById(id: string): Promise<Budget | null> {
  if (!id) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error al obtener presupuesto por id:", error.message);
    return null;
  }

  return UIBudgetSchema.parse(data);
}

export async function createNewBudget(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const userInfo = await getUser();

  // Omitimos id para que PostgreSQL genere el UUID automáticamente
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, ...baseBudget } = DEFAULT_BUDGET;

  const budgetToInsert = {
    ...baseBudget,
    user_id: user.id,
    client_id: null,
    contact_number: userInfo.contact_number || "",
    logo_url: userInfo.logo_url || "",
    website: userInfo.website || "",
    participants: [
      {
        id: user.id,
        name: userInfo.full_name || "",
        role: userInfo.role || "",
      },
    ],
    footer_img_url: userInfo.footer_image_url || "",
  };

  const { data, error } = await supabase
    .from("budgets")
    .insert(budgetToInsert)
    .select("id")
    .single();

  if (error) {
    throw new Error("Error al crear presupuesto: " + error.message);
  }

  return data.id;
}

export async function updateBudget(budget: Partial<Budget>) {
  const supabase = await createClient();

  // Omitimos sent_status: esa columna solo la escribe changeSentStatus.
  // No usamos .partial() ni .optional() porque en Zod 4 el .default() del schema
  // se sigue aplicando y rellenaría sent_status con "draft", pisando el valor real.
  const parsed = BudgetSchema.omit({ sent_status: true }).parse(budget);

  const { error } = await supabase
    .from("budgets")
    .update(parsed)
    .eq("id", budget.id);

  if (error) {
    console.log(error);
    throw "aaaca capo";
  }

  revalidatePath(`/edit/${budget.id}`);

  return {
    success: true,
  };
}

/**
 * Cambia el estado comercial (`sent_status`) de un presupuesto.
 * Es la única vía permitida de escribir esa columna desde la UI.
 * Transiciones libres: solo valida que el valor sea un `SentStatus` válido.
 */
export async function changeSentStatus(
  budgetId: string,
  sentStatus: SentStatus,
): Promise<{ ok: true; sent_status: SentStatus } | { ok: false; error: string }> {
  if (!budgetId) return { ok: false, error: "Falta el identificador del presupuesto." };

  const parsedStatus = SentStatusSchema.safeParse(sentStatus);
  if (!parsedStatus.success) {
    return { ok: false, error: "El estado indicado no es válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo." };
  }

  const { data, error } = await supabase
    .from("budgets")
    .update({
      sent_status: parsedStatus.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", budgetId)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("Error al cambiar el estado del presupuesto:", error.message);
    return { ok: false, error: "No se pudo cambiar el estado del presupuesto. Intenta de nuevo." };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "No se encontró el presupuesto o no tienes permiso para modificarlo." };
  }

  revalidatePath("/");
  revalidatePath(`/edit/${budgetId}`);

  return { ok: true, sent_status: parsedStatus.data };
}

export async function saveBudget(budget: Budget) {
  if (!budget.id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");

  const { error } = await supabase
    .from("budgets")
    .update({
      client_id: budget.client_id || null,
      client_name: budget.client_name,
      dates: budget.dates,
      services: budget.services,
      conditions: budget.conditions,
      budget_details: budget.budget_details,
      participants: budget.participants,
      website: budget.website,
      contact_number: budget.contact_number,
      logo_url: budget.logo_url,
      footer_img_url: budget.footer_img_url,
      status: budget.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", budget.id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Error al guardar presupuesto: " + error.message);
  }

  revalidatePath(`/edit/${budget.id}`);
}

export async function deleteBudget(budget: Budget) {
  const supabase = await createClient();

  await supabase.from("budgets").delete().eq("id", budget.id);

  revalidatePath("/");
}

/**
 * 🎯 DESAFÍO PARA TI:
 * Puedes enriquecer o refactorizar este flujo para usar una función Postgres RPC
 * o gestionar la secuencia de forma atómica y concurrente.
 */
export async function emitBudget(budget: Budget) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuario no autenticado");
  if (budget.status === "issued") return budget;

  // 1. Obtener perfil actual y secuencia
  const profile = await getUser();
  const currentSequence = profile.counters?.budget_sequence ?? 0;
  const nextSequence = currentSequence + 1;

  // 2. Incrementar contador en el perfil
  await supabase
    .from("profiles")
    .update({
      counters: {
        budget_sequence: nextSequence,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  // 3. Generar código público formateado (PRE-2026-00X)
  const paddedSequence = String(nextSequence).padStart(3, "0");
  const public_code = `PRE-${new Date().getFullYear()}-${paddedSequence}`;

  const updatedBudget: Budget = {
    ...budget,
    public_code,
    status: "issued",
  };

  // 4. Actualizar estado del presupuesto en Supabase
  const { error } = await supabase
    .from("budgets")
    .update({
      public_code,
      status: "issued",
      dates: budget.dates,
      services: budget.services,
      participants: budget.participants,
      conditions: budget.conditions,
      budget_details: budget.budget_details,
      updated_at: new Date().toISOString(),
      sent_status: "pending",
    })
    .eq("id", budget.id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Error al emitir el presupuesto: " + error.message);
  }

  revalidatePath(`/edit/${budget.id}`);
  return updatedBudget;
}

export async function changeLogoUrl(file: File, budget_id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.storage
    .from("public_images")
    .upload(`/${user?.id}/${Date.now()}-${file.name}`, file, {
      upsert: true,
    });

  if (error) throw error.message;

  const {
    data: { publicUrl },
  } = supabase.storage.from("public_images").getPublicUrl(data.path);

  await supabase
    .from("budgets")
    .update({
      logo_url: publicUrl,
    })
    .eq("id", budget_id);

  revalidatePath(`/edit`);
  return publicUrl;
}

export async function changeFooterUrl(file: File, budget_id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.storage
    .from("public_images")
    .upload(`/${user?.id}/${Date.now()}-${file.name}`, file, {
      upsert: true,
    });

  if (error) throw error.message;

  const {
    data: { publicUrl },
  } = supabase.storage.from("public_images").getPublicUrl(data.path);

  await supabase
    .from("budgets")
    .update({
      footer_img_url: publicUrl,
    })
    .eq("id", budget_id);

  revalidatePath(`/edit`);
  return publicUrl;
}
