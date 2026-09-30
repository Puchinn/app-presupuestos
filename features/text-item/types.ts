import * as z from "zod";
import { es } from "zod/locales";

z.config(es());

export const TextItemSchema = z.object({
  id: z.string().uuid().or(z.string()),
  content: z.string().min(1, "El contenido es requerido"),
  user_id: z.string().uuid().or(z.string()),
});

export type TextItem = z.infer<typeof TextItemSchema>;

/** Resultado tipado de las actions de fragmentos (ver convención en AGENTS.md). */
export type TextActionResult = { ok: true } | { ok: false; error: string };

/** Resultado tipado de las listas: distingue "vacío" de "error" (T-011). */
export type TextListResult =
  | { ok: true; data: TextItem[] }
  | { ok: false; error: string };
