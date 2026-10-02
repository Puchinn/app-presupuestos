"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Budget,
  BudgetActionResult,
  BudgetIdResult,
  BudgetListResult,
  BudgetResult,
  ChangeSentStatusResult,
  EmitBudgetResult,
  SentStatus,
} from "@/features/budget/types";
import {
  BudgetSchema,
  EmitEssentialSchema,
  ListBudgetSchema,
  SentStatusSchema,
  UIBudgetSchema,
} from "@/features/budget/types";
import { DEFAULT_BUDGET } from "@/lib/default_budget";
import { revalidatePath } from "next/cache";
import { getUser } from "../user/actions";

export async function getUserBudgets(): Promise<BudgetListResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener presupuestos:", error.message);
    return { ok: false, error: "No se pudieron leer tus presupuestos." };
  }

  const parsed = ListBudgetSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Presupuestos inválidos:", parsed.error.issues);
    return { ok: false, error: "Tus presupuestos tienen datos inválidos." };
  }

  return { ok: true, data: parsed.data };
}

export async function getById(id: string): Promise<BudgetResult> {
  if (!id)
    return { ok: false, error: "Falta el identificador del presupuesto." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    // PGRST116 = .single() no encontró filas (no existe o RLS lo oculta);
    // el resto son fallos de lectura reales.
    if (error?.code === "PGRST116") {
      return {
        ok: false,
        error:
          "No encontramos ese presupuesto. Puede que haya sido eliminado o no tengas permiso para verlo.",
      };
    }
    return { ok: false, error: "No se pudo leer el presupuesto." };
  }

  const parsed = UIBudgetSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Presupuesto inválido:", parsed.error.issues);
    return { ok: false, error: "El presupuesto tiene datos inválidos." };
  }

  return { ok: true, data: parsed.data };
}

export async function createNewBudget(): Promise<BudgetIdResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  const userInfoResult = await getUser();
  if (!userInfoResult.ok) return userInfoResult;
  const userInfo = userInfoResult.data;

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
    console.error("Error al crear presupuesto:", error.message);
    return {
      ok: false,
      error: "No se pudo crear el presupuesto. Intenta de nuevo.",
    };
  }

  return { ok: true, id: data.id };
}

export async function updateBudget(
  budget: Partial<Budget>,
): Promise<BudgetActionResult> {
  const supabase = await createClient();

  // sent_status solo lo escribe changeSentStatus y status solo emitBudget;
  // el WHERE .eq("status", "draft") de abajo rechaza los presupuestos
  // emitidos. Usamos omit (y no .partial()): en Zod 4 el .default() se aplica
  // igual dentro de .optional() y rellenaría lo que quisiéramos dejar intacto.
  const parsed = BudgetSchema.omit({
    sent_status: true,
    status: true,
  }).safeParse(budget);
  if (!parsed.success) {
    console.error("Presupuesto inválido al guardar:", parsed.error.issues);
    return { ok: false, error: "Los datos del presupuesto no son válidos." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  const { data, error } = await supabase
    .from("budgets")
    .update(parsed.data)
    .eq("id", budget.id)
    .eq("user_id", user.id)
    .eq("status", "draft")
    .select("id");

  if (error) {
    console.error("Error al guardar el presupuesto:", error.message);
    return {
      ok: false,
      error: "No se pudieron guardar los cambios. Intenta de nuevo.",
    };
  }

  if (!data || data.length === 0) {
    // 0 filas: o está emitido o no existe/sin permiso. Distinguimos con una
    // lectura (solo ocurre en el camino de error).
    const { data: row } = await supabase
      .from("budgets")
      .select("status")
      .eq("id", budget.id)
      .eq("user_id", user.id)
      .single();

    if (row?.status === "issued") {
      return {
        ok: false,
        error: "Este presupuesto está emitido y no se puede modificar.",
      };
    }
    return {
      ok: false,
      error:
        "No se encontró el presupuesto o no tienes permiso para modificarlo.",
    };
  }

  revalidatePath(`/edit/${budget.id}`);

  return { ok: true };
}

/**
 * Cambia el estado comercial (`sent_status`) de un presupuesto.
 * Es la única vía permitida de escribir esa columna desde la UI.
 * Transiciones libres: solo valida que el valor sea un `SentStatus` válido.
 */
export async function changeSentStatus(
  budgetId: string,
  sentStatus: SentStatus,
): Promise<ChangeSentStatusResult> {
  if (!budgetId)
    return { ok: false, error: "Falta el identificador del presupuesto." };

  const parsedStatus = SentStatusSchema.safeParse(sentStatus);
  if (!parsedStatus.success) {
    return { ok: false, error: "El estado indicado no es válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
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
    return {
      ok: false,
      error: "No se pudo cambiar el estado del presupuesto. Intenta de nuevo.",
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      error:
        "No se encontró el presupuesto o no tienes permiso para modificarlo.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/edit/${budgetId}`);

  return { ok: true, sent_status: parsedStatus.data };
}

export async function saveBudget(budget: Budget): Promise<BudgetActionResult> {
  if (!budget.id)
    return { ok: false, error: "Falta el identificador del presupuesto." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  const { data, error } = await supabase
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", budget.id)
    .eq("user_id", user.id)
    .eq("status", "draft")
    .select("id");

  if (error) {
    console.error("Error al guardar presupuesto:", error.message);
    return {
      ok: false,
      error: "No se pudo guardar el presupuesto. Intenta de nuevo.",
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      error:
        "Este presupuesto está emitido y no se puede modificar, o ya no existe.",
    };
  }

  revalidatePath(`/edit/${budget.id}`);

  return { ok: true };
}

export async function deleteBudget(
  budget: Budget,
): Promise<BudgetActionResult> {
  if (!budget.id)
    return { ok: false, error: "Falta el identificador del presupuesto." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  const { data, error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", budget.id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("Error al eliminar presupuesto:", error.message);
    return {
      ok: false,
      error: "No se pudo eliminar el presupuesto. Intenta de nuevo.",
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      error: "El presupuesto ya no existe o no tienes permiso para eliminarlo.",
    };
  }

  revalidatePath("/");

  return { ok: true };
}

/**
 * Emite un presupuesto: le asigna un código de folio, lo sella como `issued`
 * y lo pasa a `sent_status: "pending"`.
 *
 * - El estado fiscal se decide con la fila de la DB, nunca con el objeto que
 *   manda el cliente.
 * - Lo esencial (razón social + al menos un servicio) se valida acá, donde no
 *   se puede saltar (decisión T-016).
 * - El WHERE .eq("status", "draft") evita que dos emisiones simultáneas
 *   pisen el mismo presupuesto (el código de folio sí podría repetirse: la
 *   secuencia de `counters` necesita una RPC para ser atómica, deuda anotada).
 */
export async function emitBudget(budget: Budget): Promise<EmitBudgetResult> {
  if (!budget.id)
    return { ok: false, error: "Falta el identificador del presupuesto." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  // 1. Fila real en DB (autoritativa para el estado fiscal).
  const { data: row, error: readError } = await supabase
    .from("budgets")
    .select("status, public_code, sent_status")
    .eq("id", budget.id)
    .eq("user_id", user.id)
    .single();

  if (readError || !row) {
    if (readError?.code === "PGRST116") {
      return {
        ok: false,
        error:
          "No encontramos ese presupuesto. Puede que haya sido eliminado o no tengas permiso para verlo.",
      };
    }
    console.error("Error al leer el presupuesto a emitir:", readError?.message);
    return { ok: false, error: "No se pudo leer el presupuesto." };
  }

  if (row.status === "issued") {
    // Ya emitido: idempotente, devolvemos el código existente.
    return {
      ok: true,
      public_code: row.public_code,
      sent_status: row.sent_status,
    };
  }

  // 2. Validación esencial en el servidor.
  const essential = EmitEssentialSchema.safeParse({
    client_name: budget.client_name,
    services: budget.services,
  });
  if (!essential.success) {
    const faltantes = essential.error.issues.map((i) => i.message).join("; ");
    return {
      ok: false,
      error: `No se puede emitir todavía: ${faltantes}.`,
    };
  }

  // 3. Payload completo del cliente (mismo parseo que updateBudget).
  const parsed = BudgetSchema.omit({ sent_status: true }).safeParse(budget);
  if (!parsed.success) {
    console.error("Presupuesto inválido al emitir:", parsed.error.issues);
    return { ok: false, error: "Los datos del presupuesto no son válidos." };
  }

  // 4. Folio: secuencia del perfil (ver deuda de la RPC arriba).
  const profileResult = await getUser();
  if (!profileResult.ok) return { ok: false, error: profileResult.error };
  const profile = profileResult.data;
  const nextSequence = (profile.counters?.budget_sequence ?? 0) + 1;

  const { error: counterError } = await supabase
    .from("profiles")
    .update({
      counters: {
        budget_sequence: nextSequence,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (counterError) {
    console.error("Error al incrementar el contador:", counterError.message);
    return {
      ok: false,
      error: "No se pudo preparar la emisión. Intenta de nuevo.",
    };
  }

  const paddedSequence = String(nextSequence).padStart(3, "0");
  const public_code = `PRE-${new Date().getFullYear()}-${paddedSequence}`;

  // 5. Sellar el presupuesto: todos los campos editables + estado fiscal.
  const { data: updated, error } = await supabase
    .from("budgets")
    .update({
      ...parsed.data,
      public_code,
      status: "issued",
      sent_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", budget.id)
    .eq("user_id", user.id)
    .eq("status", "draft")
    .select("id");

  if (error) {
    console.error("Error al emitir el presupuesto:", error.message);
    return {
      ok: false,
      error: "No se pudo emitir el presupuesto. Intenta de nuevo.",
    };
  }

  if (!updated || updated.length === 0) {
    // Otro proceso lo emitió entre la lectura y el update.
    return {
      ok: false,
      error:
        "Este presupuesto ya fue emitido o no tienes permiso para modificarlo.",
    };
  }

  revalidatePath(`/edit/${budget.id}`);
  revalidatePath("/");
  return { ok: true, public_code, sent_status: "pending" };
}
