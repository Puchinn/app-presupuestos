import * as z from "zod";
import { es } from "zod/locales";
import { UIBudgetSchema, type Budget } from "@/features/budget/types";
import { ServiceSchema, type Service } from "@/features/services-catalog/types";
import { TextItemSchema, type TextItem } from "@/features/text-item/types";
import { ClientSchema, type Client } from "@/features/clients/types";

z.config(es());

// Store local de la versión de prueba (T-007): todo vive en localStorage,
// sin Supabase. Los presupuestos se parsean con UIBudgetSchema (y no
// BudgetSchema) porque su lado de entrada acepta null/undefined en
// client_id y lo convierte en "", igual que lo que ve el editor.
const RawLocalStoreSchema = z.object({
  budgets: z.array(UIBudgetSchema).default([]),
  services: z.array(ServiceSchema).default([]),
  texts: z.array(TextItemSchema).default([]),
  clients: z.array(ClientSchema).default([]),
  counters: z
    .object({
      budget_sequence: z.number().default(0),
    })
    .default({ budget_sequence: 0 }),
});

export interface LocalStore {
  budgets: Budget[];
  services: Service[];
  texts: TextItem[];
  clients: Client[];
  counters: { budget_sequence: number };
}

export const EMPTY_STORE: LocalStore = {
  budgets: [],
  services: [],
  texts: [],
  clients: [],
  counters: { budget_sequence: 0 },
};

export type StoreState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; store: LocalStore };

export function parseStore(raw: unknown): LocalStore | null {
  const parsed = RawLocalStoreSchema.safeParse(raw);
  if (!parsed.success) return null;
  return parsed.data;
}
