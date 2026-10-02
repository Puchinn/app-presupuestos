"use client";

import { useSyncExternalStore } from "react";
import { v4 as uuid } from "uuid";
import {
  EMPTY_STORE,
  parseStore,
  type LocalStore,
  type StoreState,
} from "./types";
import { DEFAULT_BUDGET } from "@/lib/default_budget";
import {
  EmitEssentialSchema,
  SentStatusSchema,
  type Budget,
  type BudgetActionResult,
  type ChangeSentStatusResult,
  type EmitBudgetResult,
  type SentStatus,
} from "@/features/budget/types";
import type { AutoSavePayload } from "@/features/budget/hooks/use-budget";
import {
  ServiceSchema,
  type Service,
  type ServiceActionResult,
  type ServiceCreateResult,
} from "@/features/services-catalog/types";
import {
  TextItemSchema,
  type TextActionResult,
} from "@/features/text-item/types";
import {
  ClientSchema,
  type ClientActionResult,
} from "@/features/clients/types";
import type { UploadImageResult } from "@/lib/storage";

// ---------------------------------------------------------------------------
// Motor del store: un único key en localStorage, leído con
// useSyncExternalStore (snapshot del servidor = "loading"): así no hay
// setState en effects (evita errores react-hooks/set-state-in-effect) ni
// desajuste de hidratación.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "presupuestos.demo.v1";
const LOADING: StoreState = { status: "loading" };

let snapshot: StoreState = LOADING;
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function computeSnapshot(): StoreState {
  if (typeof window === "undefined") return LOADING;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      status: "error",
      error: "Tu navegador no permite guardar datos locales.",
    };
  }

  if (raw === null) return { status: "ready", store: EMPTY_STORE };

  try {
    const store = parseStore(JSON.parse(raw));
    if (!store) {
      return {
        status: "error",
        error: "Los datos guardados en este navegador están dañados.",
      };
    }
    return { status: "ready", store };
  } catch {
    return {
      status: "error",
      error: "No se pudieron leer los datos guardados en este navegador.",
    };
  }
}

function getSnapshot(): StoreState {
  if (!initialized) {
    snapshot = computeSnapshot();
    initialized = true;
  }
  return snapshot;
}

function getServerSnapshot(): StoreState {
  return LOADING;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLocalStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type WriteResult = { ok: true } | { ok: false; error: string };

export function writeStore(next: LocalStore): WriteResult {
  if (typeof window === "undefined") {
    return { ok: false, error: "No hay almacenamiento disponible en este entorno." };
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return {
      ok: false,
      error:
        "No se pudieron guardar los cambios: el almacenamiento de tu navegador está lleno.",
    };
  }
  snapshot = { status: "ready", store: next };
  initialized = true;
  notify();
  return { ok: true };
}

function currentState(): StoreState {
  return getSnapshot();
}

function updateStore(mutator: (store: LocalStore) => LocalStore): WriteResult {
  const state = currentState();
  if (state.status !== "ready") {
    return {
      ok: false,
      error:
        state.status === "error"
          ? state.error
          : "Los datos de prueba todavía se están cargando.",
    };
  }
  return writeStore(mutator(state.store));
}

/** Relee localStorage (botón "Reintentar" de los estados de error). */
export function reloadStore() {
  snapshot = computeSnapshot();
  initialized = true;
  notify();
}

/** Borra todos los datos de prueba (fallback ante store dañado). */
export function resetStore() {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    // Si falla el removeItem, el estado igual vuelve a EMPTY_STORE en memoria.
  } catch {
    // El navegador bloquea el acceso; el estado en memoria queda limpio igual.
  }
  snapshot = { status: "ready", store: EMPTY_STORE };
  initialized = true;
  notify();
}

// ---------------------------------------------------------------------------
// Presupuestos
// ---------------------------------------------------------------------------

export function createLocalBudget():
  | { ok: true; id: string }
  | { ok: false; error: string } {
  const id = uuid();
  const budget: Budget = { ...DEFAULT_BUDGET, id, client_id: "" };
  const result = updateStore((store) => ({
    ...store,
    budgets: [budget, ...store.budgets],
  }));
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, id };
}

export function deleteLocalBudget(id: string): BudgetActionResult {
  const state = currentState();
  if (state.status === "ready" && !state.store.budgets.some((b) => b.id === id)) {
    return { ok: false, error: "El presupuesto ya no existe." };
  }
  const result = updateStore((store) => ({
    ...store,
    budgets: store.budgets.filter((b) => b.id !== id),
  }));
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/**
 * Autoguardado local (reemplaza a `updateBudget` en el modo prueba):
 * hace merge sobre el registro guardado y nunca escribe `status` ni
 * `sent_status` (mismas reglas que el servidor: solo emisión y
 * changeSentStatus los modifican).
 */
export async function persistLocalBudget(
  payload: AutoSavePayload,
): Promise<{ ok: boolean }> {
  const state = currentState();
  if (state.status !== "ready") return { ok: false };
  if (!state.store.budgets.some((b) => b.id === payload.id)) return { ok: false };

  const result = updateStore((store) => ({
    ...store,
    budgets: store.budgets.map((b) =>
      b.id === payload.id
        ? {
            ...b,
            ...payload,
            status: b.status,
            sent_status: b.sent_status,
          }
        : b,
    ),
  }));
  if (!result.ok) console.error("Error al autoguardar (local):", result.error);
  return { ok: result.ok };
}

export async function changeLocalSentStatus(
  budgetId: string,
  sentStatus: SentStatus,
): Promise<ChangeSentStatusResult> {
  if (!budgetId) {
    return { ok: false, error: "Falta el identificador del presupuesto." };
  }
  const parsedStatus = SentStatusSchema.safeParse(sentStatus);
  if (!parsedStatus.success) {
    return { ok: false, error: "El estado indicado no es válido." };
  }

  const state = currentState();
  if (state.status === "ready" && !state.store.budgets.some((b) => b.id === budgetId)) {
    return { ok: false, error: "No encontramos ese presupuesto en este navegador." };
  }

  const result = updateStore((store) => ({
    ...store,
    budgets: store.budgets.map((b) =>
      b.id === budgetId ? { ...b, sent_status: parsedStatus.data } : b,
    ),
  }));
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, sent_status: parsedStatus.data };
}

/**
 * Emisión local: mismo contrato que `emitBudget` del servidor — valida lo
 * esencial, sella el presupuesto y asigna un folio PRE-YYYY-NNN con el
 * contador local.
 */
export async function emitLocalBudget(
  budget: Budget,
): Promise<EmitBudgetResult> {
  if (!budget.id) {
    return { ok: false, error: "Falta el identificador del presupuesto." };
  }

  const state = currentState();
  if (state.status !== "ready") {
    return { ok: false, error: "Los datos de prueba no están disponibles." };
  }

  const row = state.store.budgets.find((b) => b.id === budget.id);
  if (!row) {
    return { ok: false, error: "No encontramos ese presupuesto en este navegador." };
  }
  if (row.status === "issued") {
    // Idempotente, igual que en el servidor.
    return {
      ok: true,
      public_code: row.public_code,
      sent_status: row.sent_status,
    };
  }

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

  const nextSequence = state.store.counters.budget_sequence + 1;
  const public_code = `PRE-${new Date().getFullYear()}-${String(nextSequence).padStart(3, "0")}`;

  const result = updateStore((store) => ({
    ...store,
    counters: { budget_sequence: nextSequence },
    budgets: store.budgets.map((b) =>
      b.id === budget.id
        ? {
            ...b,
            ...budget,
            public_code,
            status: "issued" as const,
            sent_status: "pending" as const,
          }
        : b,
    ),
  }));
  if (result.ok) return { ok: true, public_code, sent_status: "pending" };
  return { ok: false, error: result.error };
}

// ---------------------------------------------------------------------------
// Catálogo de servicios
// ---------------------------------------------------------------------------

export async function saveLocalService(
  service: Partial<Service>,
): Promise<ServiceCreateResult> {
  const rest: Partial<Service> = { ...service };
  delete rest.id;

  const parsed = ServiceSchema.safeParse({
    ...rest,
    id: uuid(),
    user_id: "local",
  });
  if (!parsed.success) {
    return { ok: false, error: "El servicio tiene datos inválidos." };
  }

  const result = updateStore((store) => ({
    ...store,
    services: [parsed.data, ...store.services],
  }));
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: parsed.data };
}

export async function updateLocalService(
  service: Partial<Service>,
): Promise<ServiceActionResult> {
  if (!service.id) {
    return { ok: false, error: "No se indicó el servicio a actualizar." };
  }

  const state = currentState();
  if (state.status === "ready" && !state.store.services.some((i) => i.id === service.id)) {
    return { ok: false, error: "El servicio ya no está en tu catálogo." };
  }

  const result = updateStore((store) => ({
    ...store,
    services: store.services.map((item) => {
      if (item.id !== service.id) return item;
      const next = { ...item };
      if (service.name !== undefined) next.name = service.name;
      if (service.price !== undefined) next.price = Number(service.price);
      if (service.quantity !== undefined) next.quantity = Number(service.quantity);
      if (service.details !== undefined) next.details = service.details;
      return next;
    }),
  }));
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function deleteLocalService(
  service: Service | { id: string },
): Promise<ServiceActionResult> {
  if (!service.id) {
    return { ok: false, error: "No se indicó el servicio a eliminar." };
  }

  const state = currentState();
  if (state.status === "ready" && !state.store.services.some((i) => i.id === service.id)) {
    return { ok: false, error: "El servicio ya no está en tu catálogo." };
  }

  const result = updateStore((store) => ({
    ...store,
    services: store.services.filter((i) => i.id !== service.id),
  }));
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

// ---------------------------------------------------------------------------
// Fragmentos de texto
// ---------------------------------------------------------------------------

export async function createLocalTextItem(
  content: string,
): Promise<TextActionResult> {
  const text = content.trim();
  if (!text) return { ok: false, error: "No hay texto para guardar." };

  const parsed = TextItemSchema.safeParse({
    id: uuid(),
    user_id: "local",
    content: text,
  });
  if (!parsed.success) {
    return { ok: false, error: "El fragmento tiene datos inválidos." };
  }

  const result = updateStore((store) => ({
    ...store,
    texts: [parsed.data, ...store.texts],
  }));
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function deleteLocalTextItem(
  id: string,
): Promise<TextActionResult> {
  if (!id) return { ok: false, error: "No se indicó el fragmento a eliminar." };

  const state = currentState();
  if (state.status === "ready" && !state.store.texts.some((t) => t.id === id)) {
    return { ok: false, error: "El fragmento ya no existe." };
  }

  const result = updateStore((store) => ({
    ...store,
    texts: store.texts.filter((t) => t.id !== id),
  }));
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export async function createLocalClient(
  name: string,
): Promise<ClientActionResult> {
  const clean = name.trim();
  if (!clean) {
    return { ok: false, error: "El nombre del cliente no puede quedar vacío." };
  }

  const state = currentState();
  if (state.status !== "ready") {
    return { ok: false, error: "Los datos de prueba no están disponibles." };
  }

  // Misma regla que el servidor: no duplicar por diferencias de tipeo.
  const normalized = clean.toLowerCase();
  const existing = state.store.clients.find(
    (client) => client.name.trim().toLowerCase() === normalized,
  );
  if (existing) return { ok: true, data: existing };

  const parsed = ClientSchema.safeParse({
    id: uuid(),
    user_id: "local",
    name: clean,
  });
  if (!parsed.success) {
    return { ok: false, error: "El cliente tiene datos inválidos." };
  }

  const result = updateStore((store) => ({
    ...store,
    clients: [...store.clients, parsed.data].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  }));
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: parsed.data };
}

// ---------------------------------------------------------------------------
// Imágenes
// ---------------------------------------------------------------------------

/**
 * Subida local (T-007): la imagen queda como data URL en el presupuesto.
 * El límite de 1 MB lo valida el editor antes de llamar (igual que con
 * `uploadPublicImage`).
 */
export async function uploadLocalImage(file: File): Promise<UploadImageResult> {
  try {
    const path = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsDataURL(file);
    });
    return { ok: true, path };
  } catch {
    return {
      ok: false,
      error: "No se pudo procesar la imagen. Intenta de nuevo.",
    };
  }
}
