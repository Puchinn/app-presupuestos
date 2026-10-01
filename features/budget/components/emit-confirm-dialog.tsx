"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Loader2, ShieldCheck, X } from "lucide-react";
import { useBudgetContext } from "../context/context-provider";
import { emitBudget } from "../actions";

interface EmitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se llama solo si la emisión terminó bien (para avisar en el header). */
  onEmitted: (public_code: string) => void;
}

export function EmitConfirmDialog({
  open,
  onOpenChange,
  onEmitted,
}: EmitConfirmDialogProps) {
  const { budget, methods } = useBudgetContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { essential } = methods.checklist();
  const faltantes = essential.map((issue) => issue.message);
  const canEmit = faltantes.length === 0;

  // El error del intento anterior se limpia al cerrar (en un handler, no en un
  // effect: react-hooks/set-state-in-effect).
  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null);
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    if (!canEmit || loading) return;
    setLoading(true);
    setError(null);
    // El autoguardado pendiente chocaría con el rechazo del servidor tras emitir.
    methods.cancelPendingSave();

    const result = await emitBudget(budget);

    if (result.ok) {
      methods.setIssued(result.public_code, result.sent_status);
      onEmitted(result.public_code);
      handleOpenChange(false);
    } else {
      // La emisión falló: repone el guardado cancelado para no perder cambios.
      await methods.saveNow();
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        render={
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full shrink-0 bg-blue-100 text-blue-700">
                  <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      ¿Emitir este presupuesto?
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleOpenChange(false)}
                      disabled={loading}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 focus-visible:outline-none disabled:opacity-50"
                      aria-label="Cerrar diálogo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {canEmit ? (
                    <>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Al emitir el presupuesto:
                      </p>
                      <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
                        <li>
                          Se le asigna un código de folio único (formato
                          PRE-2026-001).
                        </li>
                        <li>
                          El documento queda sellado y de{" "}
                          <strong>solo lectura</strong>: ya no se puede editar.
                        </li>
                        <li>
                          El estado comercial pasa a <strong>Pendiente</strong>.
                        </li>
                      </ul>
                      <p className="text-[11px] text-slate-500">
                        Esta acción no se puede deshacer.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Faltan datos esenciales para emitir:
                      </p>
                      <ul className="text-sm text-rose-700 space-y-1 list-disc pl-5">
                        {faltantes.map((mensaje) => (
                          <li key={mensaje}>{mensaje}</li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-slate-500">
                        Completalos en el documento o en la pestaña Info &amp;
                        Checklist.
                      </p>
                    </>
                  )}

                  {error && (
                    <div
                      role="alert"
                      className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 leading-snug"
                    >
                      <span className="inline-flex items-start gap-1.5">
                        <AlertCircle
                          className="w-3.5 h-3.5 shrink-0 mt-px"
                          aria-hidden="true"
                        />
                        {error}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <AlertDialogFooter>
              <div className="bg-slate-50 px-6 py-3 flex flex-col sm:flex-row justify-end gap-3 w-full border-t border-slate-100">
                <AlertDialogCancel
                  render={
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleOpenChange(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 focus-visible:outline-none disabled:opacity-50 transition-colors"
                    >
                      {canEmit ? "Cancelar" : "Cerrar"}
                    </button>
                  }
                />

                {canEmit && (
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold rounded-lg text-white shadow-xs focus-visible:outline-none disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>{loading ? "Emitiendo..." : "Sí, emitir"}</span>
                  </button>
                )}
              </div>
            </AlertDialogFooter>
          </div>
        }
      />
    </AlertDialog>
  );
}
