"use client";

import { ArrowLeft, Eye, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SaveStatusIndicator } from "@/features/budget/components/status-indicator";
import { useBudgetContext } from "@/features/budget/context/context-provider";

export function HeaderStatus() {
  const { budget } = useBudgetContext();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-20">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <Link
          href="/"
          id="editor-back-to-home-btn"
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          aria-label="Volver al panel principal de presupuestos"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Volver al inicio</span>
        </Link>

        <div className="border-l border-slate-200 pl-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {budget.public_code}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-xs">
              {budget.client_name || "Cliente sin nombre"}
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[240px] sm:max-w-md mt-0.5">
            {budget.client_name || "Cotización de Servicios"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <SaveStatusIndicator />

        <Link
          id="editor-preview-btn"
          type="button"
          href={"#"}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
        >
          <Eye className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span>Vista previa</span>
        </Link>

        <button
          id="editor-emit-primary-btn"
          type="button"
          // onClick={() => setShowEmitModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-blue-200" aria-hidden="true" />
          <span>Emitir presupuesto</span>
        </button>
      </div>
    </div>
  );
}
