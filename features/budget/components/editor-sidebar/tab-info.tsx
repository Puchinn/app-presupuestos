import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useBudgetContext } from "../../context/context-provider";
import type { BudgetSettings } from "../../types";

// Esencial: lo que emitBudget exige en el servidor (bloquea la emisión).
const ESSENTIAL_LABELS: Record<string, string> = {
  client_name: "Nombre del cliente (razón social)",
  services: "Al menos un servicio cargado",
};

// Recomendado: mejora el documento pero no bloquea la emisión.
const RECOMMENDED_LABELS: Record<string, string> = {
  "dates.sent": "Fecha de emisión",
  "dates.estimated": "Fecha de plazo estimada",
  logo_url: "Logo de empresa",
  conditions: "Condiciones de pago",
  budget_details: "Detalle del presupuesto",
};

// El checklist recomendado solo exige (y solo muestra) los campos cuyo toggle
// de Configuración está prendido: lo que no se imprime no se pide.
const recommendedKeys = (settings: BudgetSettings): string[] => [
  "dates.sent",
  "dates.estimated",
  ...(settings.show_logo_url ? ["logo_url"] : []),
  ...(settings.show_budget_conditions ? ["conditions"] : []),
  ...(settings.show_budget_details ? ["budget_details"] : []),
];

function CheckItem({
  label,
  missing,
  urgent,
}: {
  label: string;
  missing: boolean;
  urgent: boolean;
}) {
  return (
    <li
      className={`flex items-start gap-2 p-2 rounded-lg border ${
        !missing
          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
          : urgent
            ? "bg-rose-50/70 border-rose-200 text-rose-900"
            : "bg-amber-50/70 border-amber-200 text-amber-900"
      }`}
    >
      {missing ? (
        <AlertCircle
          className={`w-4 h-4 shrink-0 mt-0.5 ${
            urgent ? "text-rose-600" : "text-amber-600"
          }`}
        />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
      )}
      <span className="leading-tight">{label}</span>
    </li>
  );
}

export function TabInfo() {
  const { methods, budget, readOnly } = useBudgetContext();
  const { essential, recommended } = methods.checklist();

  const essentialKeys = Object.keys(ESSENTIAL_LABELS);
  const recKeys = recommendedKeys(budget.settings);

  const totalFields = essentialKeys.length + recKeys.length;
  const issueCount = essential.length + recommended.length;
  const completedFields = Math.max(0, totalFields - issueCount);
  const progressPercent = totalFields
    ? Math.round((completedFields / totalFields) * 100)
    : 0;

  const isMissing = (issues: { key: string }[], key: string) =>
    issues.some((issue) => issue.key === key);

  return (
    <div className="space-y-4">
      {readOnly && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
          <span className="font-bold block">
            <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
            Presupuesto emitido
          </span>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            El documento está sellado y es de solo lectura. Este checklist queda
            como referencia.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-800">
            Completitud del documento
          </span>
          <span className="text-xs font-mono font-bold text-blue-700">
            {progressPercent}%
          </span>
        </div>
        {/* Progress Bar */}
        <div
          className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full transition-all duration-300 ${
              progressPercent === 100
                ? "bg-emerald-500"
                : progressPercent > 50
                  ? "bg-blue-600"
                  : "bg-amber-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
          Esencial para emitir:
        </span>
        <ul className="space-y-2 text-xs">
          {essentialKeys.map((key) => (
            <CheckItem
              key={key}
              label={ESSENTIAL_LABELS[key]}
              missing={isMissing(essential, key)}
              urgent
            />
          ))}
        </ul>
      </div>

      <div className="space-y-2 pt-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
          Recomendado:
        </span>
        <ul className="space-y-2 text-xs">
          {recKeys.map((key) => (
            <CheckItem
              key={key}
              label={RECOMMENDED_LABELS[key]}
              missing={isMissing(recommended, key)}
              urgent={false}
            />
          ))}
        </ul>
        <p className="text-[11px] text-slate-400">
          No bloquea la emisión; los campos ocultos en Configuración no se
          exigen.
        </p>
      </div>

      {!readOnly && (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
          <span className="font-bold block">💡 Consejo de emisión</span>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Una vez emitido, el presupuesto adquiere un folio fiscal interno y
            queda sellado como versión oficial enviada.
          </p>
        </div>
      )}
    </div>
  );
}
