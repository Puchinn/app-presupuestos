import * as z from "zod";
import { es } from "zod/locales";

z.config(es());

export const ServiceSchema = z.object({
  id: z.string().uuid().or(z.string()),
  user_id: z.string().uuid().or(z.string()),
  name: z.string().min(1, "El nombre del servicio es requerido"),
  price: z.number().nonnegative(),
  quantity: z.number().positive().default(1),
  details: z.array(z.string()).default([]),
});

export type Service = z.infer<typeof ServiceSchema>;
