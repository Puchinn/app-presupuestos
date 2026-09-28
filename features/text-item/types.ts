import * as z from "zod";
import { es } from "zod/locales";

z.config(es());

export const TextItemSchema = z.object({
  id: z.string().uuid().or(z.string()),
  content: z.string().min(1, "El contenido es requerido"),
  user_id: z.string().uuid().or(z.string()),
});

export type TextItem = z.infer<typeof TextItemSchema>;
