import * as z from "zod";
import { es } from "zod/locales";

z.config(es());

export const StatusSchema = z.enum(["draft", "issued"]);
export const SentStatusSchema = z.enum([
  "sent",
  "rejected",
  "approved",
  "draft",
  "pending",
]);
export type Status = z.infer<typeof StatusSchema>;
export type SentStatus = z.infer<typeof SentStatusSchema>;

export interface BudgetSettings {
  show_logo_url: boolean;
  show_footer_url: boolean;
  show_budget_details: boolean;
  show_budget_conditions: boolean;
}

export const BudgetServiceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  details: z.array(z.string()).default([]),
});

export const BudgetParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});

export const UIBudgetSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  client_id: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val ?? ""),
  public_code: z.string().default("BORRADOR#"),
  dates: z.object({
    sent: z.string(),
    estimated: z.string(),
  }),
  client_name: z.string(),
  logo_url: z.string(),
  services: z.array(BudgetServiceItemSchema).default([]),
  conditions: z.string(),
  budget_details: z.string(),
  participants: z.array(BudgetParticipantSchema).default([]),
  website: z.string(),
  contact_number: z.string(),
  footer_img_url: z.string(),
  status: StatusSchema.default("draft"),
  sent_status: SentStatusSchema.default("draft"),
  total_price_services: z.number().optional(),
  settings: z.object({
    show_logo_url: z.boolean().default(true),
    show_footer_url: z.boolean().default(true),
    show_budget_details: z.boolean().default(true),
    show_budget_conditions: z.boolean().default(true),
  }),
});

// 2. Esquema para la DB (Hereda de la UI pero reconvierte "" a null y valida UUID)

// export const BudgetSchema = UIBudgetSchema.extend({
//   client_id: z.string().nullable(),
// });

export const BudgetSchema = UIBudgetSchema.extend({
  client_id: z
    .string()
    .transform((val) => (val.trim() === "" ? null : val)) // Convertimos "" a null
    .pipe(z.string().uuid().nullable()), // Opcional: valida que si no es null, sea un UUID válido
});

export const ListBudgetSchema = z.array(UIBudgetSchema);

export type Budget = z.infer<typeof BudgetSchema>;

export const CheckEmpty: z.ZodType<Partial<Budget>> = z.object({
  client_name: z.string("Sin nombre de cliente").nonempty(),
  client_id: z
    .string()
    .nonempty(
      "El documento no esta asociado a un ID de cliente, asocialo seleccionado un cliente de la lista de clientes.",
    ),
  dates: z.object({
    sent: z.string("Sin fecha de emision").nonempty(),
    estimated: z.string("Sin fecha estimada").nonempty(),
  }),
  services: z.array(BudgetServiceItemSchema).nonempty("Sin servicios"),
  logo_url: z.string("No hay url del logo").nonempty(),
  conditions: z.string("Sin condiciones y servicios").nonempty(),
  budget_details: z.string("Sin detalles").nonempty(),
});

export type Filter = SentStatus | "issued" | "all";

// Resultados tipados de las server actions del dominio (convención de AGENTS.md):
// nunca throw, siempre { ok } | { ok: false; error } con mensaje en español.
export type BudgetActionResult = { ok: true } | { ok: false; error: string };
export type BudgetResult =
  | { ok: true; data: Budget }
  | { ok: false; error: string };
export type BudgetListResult =
  | { ok: true; data: Budget[] }
  | { ok: false; error: string };
export type BudgetIdResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
export type BudgetUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };
export type ChangeSentStatusResult =
  | { ok: true; sent_status: SentStatus }
  | { ok: false; error: string };
