import { Switch } from "@/components/ui/switch";
import { useBudgetContext } from "../../context/context-provider";
import type { Budget } from "../../types";

type SettingsKey = keyof Budget["settings"];

// Los textos replican los encabezados de sección de budget-edit.tsx, para que
// lo que se apaga en el documento coincida con lo que dice la pestaña.
const TOGGLES: { key: SettingsKey; label: string }[] = [
  { key: "show_logo_url", label: "Logo" },
  { key: "show_footer_url", label: "Imagen secundaria" },
  { key: "show_budget_conditions", label: "Condiciones de pago" },
  { key: "show_budget_details", label: "Detalle del presupuesto" },
];

export function TabSettings() {
  const { budget, methods, readOnly } = useBudgetContext();

  return (
    <div className="space-y-3 text-xs">
      <div>
        <span className="text-xs font-bold text-slate-800 block">
          Configuración
        </span>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Qué se muestra en el documento
        </p>
      </div>

      {TOGGLES.map(({ key, label }) => (
        <div
          key={key}
          className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100"
        >
          <label
            htmlFor={`setting-${key}`}
            className="font-semibold text-slate-800 cursor-pointer"
          >
            {label}
          </label>
          <Switch
            id={`setting-${key}`}
            checked={budget.settings[key]}
            onCheckedChange={(checked) => methods.editSetting(key, checked)}
            disabled={readOnly}
          />
        </div>
      ))}
    </div>
  );
}
