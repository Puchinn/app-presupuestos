"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SaveStatusIndicator } from "@/features/budget/components/status-indicator";
import { ChangeStatusMenu } from "@/features/budget/components/change-status-menu";
import { PdfActions } from "@/features/budget/components/pdf-actions";
import { EmitConfirmDialog } from "@/features/budget/components/emit-confirm-dialog";
import { useBudgetContext } from "@/features/budget/context/context-provider";

export function HeaderStatus() {
  const { budget, methods, readOnly } = useBudgetContext();
  const [showEmitDialog, setShowEmitDialog] = useState(false);
  const [notice, setNotice] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const showNotice = (type: "ok" | "error", text: string) => {
    setNotice({ type, text });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  };

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

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <ChangeStatusMenu
          budgetId={budget.id}
          current={budget.sent_status}
          size="md"
          className="items-end"
          onChange={(next) => methods.setSentStatus(next)}
        />

        <SaveStatusIndicator />

        <PdfActions budget={budget} />

        {readOnly ? (
          <span
            id="editor-issued-badge"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Emitido</span>
          </span>
        ) : (
          <button
            id="editor-emit-primary-btn"
            type="button"
            onClick={() => setShowEmitDialog(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-blue-200" aria-hidden="true" />
            <span>Emitir presupuesto</span>
          </button>
        )}

        {notice && (
          <p
            role="status"
            className={`w-full md:w-auto flex items-start gap-1.5 text-[11px] font-semibold leading-snug ${
              notice.type === "error" ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {notice.type === "error" ? (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
            ) : (
              <Check className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
            )}
            <span>{notice.text}</span>
          </p>
        )}
      </div>

      <EmitConfirmDialog
        open={showEmitDialog}
        onOpenChange={setShowEmitDialog}
        onEmitted={(public_code) =>
          showNotice("ok", `Presupuesto emitido con el código ${public_code}.`)
        }
      />
    </div>
  );
}
