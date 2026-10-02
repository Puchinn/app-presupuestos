import * as z from "zod";
import { es } from "zod/locales";

z.config(es());

export const UserInfoSchema = z.object({
  id: z.string(),
  full_name: z
    .string()
    .default("")
    .nullable()
    .transform((val) => (!val ? "sin nombre" : val)),
  role: z.string().default(""),
  // No es columna de profiles: lo inyectan getUser/updateUser desde auth.
  email: z.string().default(""),
  avatar_url: z.string().default(""),
  contact_number: z.string().default(""),
  website: z.string().default(""),
  logo_url: z.string().default(""),
  footer_image_url: z.string().default(""),
  counters: z.object({
    budget_sequence: z.number(),
  }),
});

// Campos que la UI del perfil puede escribir. Sin .default() en ningún lado:
// con defaults, un payload parcial (p. ej. solo logo_url) parsearía el resto
// del perfil con strings vacíos y los pisaría. Las claves que no estén acá
// (id, counters, email) se descartan al parsear.
export const UpdateProfileSchema = z
  .object({
    full_name: z.string(),
    role: z.string(),
    avatar_url: z.string(),
    contact_number: z.string(),
    website: z.string(),
    logo_url: z.string(),
    footer_image_url: z.string(),
  })
  .partial();

export type UserInfo = z.infer<typeof UserInfoSchema>;

// Resultado tipado de las server actions del dominio (convención de AGENTS.md):
// nunca throw, siempre { ok } | { ok: false; error } con mensaje en español.
export type UserResult =
  | { ok: true; data: UserInfo }
  | { ok: false; error: string };

// En éxito logIn nunca resuelve: hace redirect("/") desde el servidor.
export type LoginResult = { ok: true } | { ok: false; error: string };
