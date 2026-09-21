"use client";

import { CheckCircle2, AlertTriangle, FileCheck2 } from "lucide-react";
import { useAppContext } from "@/app/edit/[id]/provider";

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

export function Information() {
  const { methods } = useAppContext();

  const { success, error } = methods.checkEmpty();
  const totalFields = 7;
  const issueCount = error?.issues?.length ?? 0;
  const completedFields = Math.max(0, totalFields - issueCount);
  const progressPercent = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Validación del Documento
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Requisitos y datos necesarios para la emisión oficial.
        </p>
      </div>

      {/* Barra de progreso de completitud */}
      <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-700">
            Completitud del presupuesto
          </span>
          <span className="font-semibold text-gray-900">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              issueCount === 0 ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-500 pt-0.5">
          <span>
            {completedFields} de {totalFields} requisitos
          </span>
          <span
            className={
              issueCount === 0
                ? "text-emerald-600 font-medium"
                : "text-amber-600 font-medium"
            }
          >
            {issueCount === 0
              ? "Listo para emitir"
              : `${issueCount} pendientes`}
          </span>
        </div>
      </div>

      {success && (!error || issueCount === 0) ? (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 text-emerald-900 space-y-2 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                ¡Documento completo!
              </p>
              <p className="text-xs text-emerald-700">
                El presupuesto cumple con todos los datos requeridos.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-200/60 text-xs text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Ya puedes emitir el presupuesto oficial o exportarlo a PDF.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="font-semibold uppercase tracking-wider text-gray-600 text-[11px]">
              Observaciones pendientes ({issueCount})
            </span>
          </div>

          <div className="space-y-2">
            {error?.issues?.map((issue, i) => {
              const pathKey = issue.path.join(".");
              const label =
                FIELD_LABELS[pathKey] ||
                FIELD_LABELS[issue.path[0].toString()] ||
                "Requisito";

              return (
                <div
                  key={i}
                  className="bg-white border border-amber-200/80 rounded-lg p-3 shadow-sm hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 bg-amber-50 text-amber-600 rounded mt-0.5 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                        {label}
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {issue.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
