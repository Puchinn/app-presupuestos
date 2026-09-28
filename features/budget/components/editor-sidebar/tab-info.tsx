import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useBudgetContext } from "../../context/context-provider";

const FIELD_LABELS: Record<string, string> = {
  client_name: "Nombre del cliente",
  client_id: "Asociación con cliente",
  "dates.sent": "Fecha de emisión",
  "dates.estimated": "Fecha de plazo estimada",
  services: "Servicios",
  logo_url: "Logo de empresa",
  conditions: "Condiciones de pago",
  budget_details: "Detalles del presupuesto",
};

export function TabInfo() {
  const { methods } = useBudgetContext();
  const { error } = methods.checkEmpty();

  const totalFields = Object.keys(FIELD_LABELS).length;
  const issueCount = error?.issues?.length ?? 0;
  const completedFields = Math.max(0, totalFields - issueCount);
  const progressPercent = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="space-y-4">
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
          Campos requeridos para emitir:
        </span>
        <ul className="space-y-2 text-xs">
          {Object.keys(FIELD_LABELS).map((key) => {
            const issue = error?.issues.find((err) =>
              err.path.length
                ? err.path.join(".") === key.toString()
                : err.path.toString() === key.toString(),
            );

            const issueKey = issue?.path.join(".");

            const foundedError = FIELD_LABELS[issueKey || ""];
            return (
              <li
                key={key}
                className={`flex items-start gap-2 p-2 rounded-lg border ${
                  !foundedError
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                {!foundedError ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-tight">{FIELD_LABELS[key]}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
        <span className="font-bold block">💡 Consejo de emisión</span>
        <p className="text-[11px] text-blue-800 leading-relaxed">
          Una vez emitido, el presupuesto adquiere un folio fiscal interno y
          queda sellado como versión oficial enviada.
        </p>
      </div>
    </div>
  );
}
