import * as z from "zod";
import { es } from "zod/locales";

z.config(es());

export const ClientSchema = z.object({
  id: z.string().uuid().or(z.string()),
  name: z.string().min(1, "El nombre del cliente es requerido"),
  user_id: z.string().uuid().or(z.string()),
  email: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
});

export type Client = z.infer<typeof ClientSchema>;

/** Resultado tipado de las actions de clientes (ver convención en AGENTS.md). */
export type ClientActionResult =
  | { ok: true; data: Client }
  | { ok: false; error: string };

/** Resultado tipado de la lista de clientes: distingue "vacío" de "error" (T-011). */
export type ClientListResult =
  | { ok: true; data: Client[] }
  | { ok: false; error: string };
