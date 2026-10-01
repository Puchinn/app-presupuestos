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

export type Filter = SentStatus | "issued" | "all";

// --- Checklist de emisión en dos niveles (T-016) ----------------------------
// Esencial: lo que emitBudget exige en el servidor (no se puede saltar).
// Recomendado: mejora el documento pero no bloquea la emisión; los campos con
// toggle de `settings` apagado no se exigen ni se muestran en el checklist.

export type ChecklistIssue = { key: string; message: string };
export type ChecklistResult = {
  essential: ChecklistIssue[];
  recommended: ChecklistIssue[];
};

export const EmitEssentialSchema = z.object({
  client_name: z
    .string()
    .trim()
    .min(1, "el nombre del cliente (razón social) está vacío"),
  services: z
    .array(BudgetServiceItemSchema)
    .min(1, "el presupuesto no tiene servicios"),
});

const RecommendedSchema = z.object({
  dates: z.object({
    sent: z.string().min(1, "falta la fecha de emisión"),
    estimated: z.string().min(1, "falta la fecha de plazo estimada"),
  }),
  logo_url: z.string().min(1, "falta el logo de la empresa"),
  conditions: z.string().min(1, "faltan las condiciones de pago"),
  budget_details: z.string().min(1, "falta el detalle del presupuesto"),
});

// Claves del checklist recomendado que solo se exigen con su toggle prendido.
const OPTIONAL_TOGGLES: Record<string, keyof BudgetSettings> = {
  logo_url: "show_logo_url",
  conditions: "show_budget_conditions",
  budget_details: "show_budget_details",
};

const toIssues = (error: z.ZodError): ChecklistIssue[] =>
  error.issues.map((issue) => ({
    key: issue.path.join("."),
    message: issue.message,
  }));

/**
 * Devuelve los problemas del presupuesto separados por nivel.
 * `settings` manda: si el toggle de un campo está apagado, el campo no se exige.
 */
export function runChecklist(
  data: {
    client_name: string;
    services: Budget["services"];
    dates: Budget["dates"];
    logo_url: string;
    conditions: string;
    budget_details: string;
  },
  settings: BudgetSettings,
): ChecklistResult {
  const essential = EmitEssentialSchema.safeParse(data);
  const recommended = RecommendedSchema.safeParse(data);

  return {
    essential: essential.success ? [] : toIssues(essential.error),
    recommended: recommended.success
      ? []
      : toIssues(recommended.error).filter((issue) => {
          const toggle = OPTIONAL_TOGGLES[issue.key];
          return !toggle || settings[toggle];
        }),
  };
}

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
export type EmitBudgetResult =
  | { ok: true; public_code: string; sent_status: SentStatus }
  | { ok: false; error: string };
