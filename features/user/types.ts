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
  avatar_url: z.string().default(""),
  contact_number: z.string().default(""),
  website: z.string().default(""),
  logo_url: z.string().default(""),
  footer_image_url: z.string().default(""),
  counters: z.object({
    budget_sequence: z.number(),
  }),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;
