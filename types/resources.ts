import * as z from "zod";

export const ServiceSchema = z.object({
  id: z.string().uuid().or(z.string()),
  user_id: z.string().uuid().or(z.string()),
  name: z.string().min(1, "El nombre del servicio es requerido"),
  price: z.number().nonnegative(),
  quantity: z.number().positive().default(1),
  details: z.array(z.string()).default([]),
});

export type Service = z.infer<typeof ServiceSchema>;

export const TextItemSchema = z.object({
  id: z.string().uuid().or(z.string()),
  content: z.string().min(1, "El contenido es requerido"),
  user_id: z.string().uuid().or(z.string()),
});

export type TextItem = z.infer<typeof TextItemSchema>;

export const BudgetItemSchema = z.object({
  id: z.string().uuid().or(z.string()),
  name: z.string().min(1, "El nombre de la categoría es requerido"),
});

export type BudgetItem = z.infer<typeof BudgetItemSchema>;

export interface BTextItems extends BudgetItem {
  items: TextItem[];
}
