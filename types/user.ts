import * as z from "zod";

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

export const ClientSchema = z.object({
  id: z.string().uuid().or(z.string()),
  name: z.string().min(1, "El nombre del cliente es requerido"),
  user_id: z.string().uuid().or(z.string()),
  email: z.string().optional().default(""),
});

export type Client = z.infer<typeof ClientSchema>;
