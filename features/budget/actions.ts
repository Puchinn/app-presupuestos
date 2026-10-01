"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Budget,
  BudgetActionResult,
  BudgetIdResult,
  BudgetListResult,
  BudgetResult,
  BudgetUrlResult,
  ChangeSentStatusResult,
  SentStatus,
} from "@/features/budget/types";
import {
  BudgetSchema,
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

  // Omitimos sent_status: esa columna solo la escribe changeSentStatus.
  // No usamos .partial() ni .optional() porque en Zod 4 el .default() del schema
  // se sigue aplicando y rellenaría sent_status con "draft", pisando el valor real.
  const parsed = BudgetSchema.omit({ sent_status: true }).safeParse(budget);
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

  const { error } = await supabase
    .from("budgets")
    .update(parsed.data)
    .eq("id", budget.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error al guardar el presupuesto:", error.message);
    return {
      ok: false,
      error: "No se pudieron guardar los cambios. Intenta de nuevo.",
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
    console.error("Error al guardar presupuesto:", error.message);
    return {
      ok: false,
      error: "No se pudo guardar el presupuesto. Intenta de nuevo.",
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
 * 🎯 DESAFÍO PARA TI:
 * Puedes enriquecer o refactorizar este flujo para usar una función Postgres RPC
 * o gestionar la secuencia de forma atómica y concurrente.
 */
export async function emitBudget(budget: Budget): Promise<BudgetResult> {
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
  if (budget.status === "issued") return { ok: true, data: budget };

  // 1. Obtener perfil actual y secuencia
  const profileResult = await getUser();
  if (!profileResult.ok) return profileResult;
  const profile = profileResult.data;
  const currentSequence = profile.counters?.budget_sequence ?? 0;
  const nextSequence = currentSequence + 1;

  // 2. Incrementar contador en el perfil
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
    console.error("Error al emitir el presupuesto:", error.message);
    return {
      ok: false,
      error: "No se pudo emitir el presupuesto. Intenta de nuevo.",
    };
  }

  revalidatePath(`/edit/${budget.id}`);
  return { ok: true, data: updatedBudget };
}

export async function changeLogoUrl(
  file: File,
  budget_id: string,
): Promise<BudgetUrlResult> {
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

  const { data, error } = await supabase.storage
    .from("public_images")
    .upload(`/${user.id}/${Date.now()}-${file.name}`, file, {
      upsert: true,
    });

  if (error) {
    console.error("Error al subir el logo:", error.message);
    return { ok: false, error: "No se pudo subir el logo. Intenta de nuevo." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("public_images").getPublicUrl(data.path);

  const { error: updateError } = await supabase
    .from("budgets")
    .update({
      logo_url: publicUrl,
    })
    .eq("id", budget_id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Error al guardar el logo:", updateError.message);
    return {
      ok: false,
      error: "No se pudo guardar el logo. Intenta de nuevo.",
    };
  }

  revalidatePath(`/edit`);
  return { ok: true, url: publicUrl };
}

export async function changeFooterUrl(
  file: File,
  budget_id: string,
): Promise<BudgetUrlResult> {
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

  const { data, error } = await supabase.storage
    .from("public_images")
    .upload(`/${user.id}/${Date.now()}-${file.name}`, file, {
      upsert: true,
    });

  if (error) {
    console.error("Error al subir la imagen del pie:", error.message);
    return {
      ok: false,
      error: "No se pudo subir la imagen del pie. Intenta de nuevo.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("public_images").getPublicUrl(data.path);

  const { error: updateError } = await supabase
    .from("budgets")
    .update({
      footer_img_url: publicUrl,
    })
    .eq("id", budget_id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Error al guardar la imagen del pie:", updateError.message);
    return {
      ok: false,
      error: "No se pudo guardar la imagen del pie. Intenta de nuevo.",
    };
  }

  revalidatePath(`/edit`);
  return { ok: true, url: publicUrl };
}
