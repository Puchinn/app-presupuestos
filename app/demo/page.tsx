"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Check, FileText, Plus, Trash2 } from "lucide-react";
import {
  createLocalBudget,
  deleteLocalBudget,
  reloadStore,
  resetStore,
  useLocalStore,
} from "@/features/local/store";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import { BadgeStatus } from "@/features/budget/components/badge-status";
import { formatARS, formatDate } from "@/lib/utils";
import type { Budget } from "@/features/budget/types";

type Notice = { type: "ok" | "error"; text: string };

export default function DemoPage() {
  const storeState = useLocalStore();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [paraBorrar, setParaBorrar] = useState<Budget | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreate = () => {
    const result = createLocalBudget();
    if (result.ok) {
      router.push(`/demo/edit/${result.id}`);
      return;
    }
    setNotice({ type: "error", text: result.error });
  };

  const handleDelete = async () => {
    if (!paraBorrar) return;
    const result = deleteLocalBudget(paraBorrar.id);
    if (!result.ok) {
      // Lanza para que el diálogo quede abierto y el error se vea (patrón
      // de budgets-section con DeleteAlertDialog).
      setDeleteError(result.error);
      throw new Error(result.error);
    }
    setDeleteError(null);
  };

  if (storeState.status === "loading") {
    return (
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-80 bg-slate-100 rounded" />
        <div className="space-y-3 pt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (storeState.status === "error") {
    return (
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState
          title="No pudimos leer tus datos de prueba"
          description={storeState.error}
          action={
            <button
              type="button"
              onClick={() => {
                resetStore();
                setNotice(null);
              }}
              className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              Borrar datos y empezar de nuevo
            </button>
          }
          onRetry={reloadStore}
        />
      </div>
    );
  }

  const budgets = storeState.store.budgets;

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Tus presupuestos de prueba
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Se guardan en este navegador: no hace falta una cuenta.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nuevo presupuesto
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className={`flex items-center gap-1.5 text-xs font-semibold ${
            notice.type === "error" ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {notice.type === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          {notice.text}
        </p>
      )}

      {budgets.length === 0 && (
        <EmptyState
          icon={<FileText className="w-8 h-8" aria-hidden="true" />}
          title="Todavía no tenés presupuestos"
          description="Creá el primero para probar el editor completo: servicios, cliente, textos y PDF."
          action={
            <button
              type="button"
              onClick={handleCreate}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Crear presupuesto de prueba
            </button>
          }
        />
      )}

      {budgets.length > 0 && (
        <ul className="space-y-3">
          {budgets.map((budget) => (
            <li
              key={budget.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {budget.public_code}
                  </span>
                  <BadgeStatus status={budget.sent_status} />
                  {budget.status === "issued" && (
                    <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs px-2 py-0.5">
                      Emitido
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {budget.client_name || "Cliente sin nombre"}
                </p>
                <p className="text-xs text-slate-500">
                  {formatARS(budget.total_price_services ?? 0)} ·{" "}
                  {formatDate(budget.dates.sent)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/demo/edit/${budget.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                >
                  Abrir
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setParaBorrar(budget);
                    setDeleteError(null);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:outline-none"
                  aria-label="Eliminar presupuesto"
                  title="Eliminar presupuesto"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteAlertDialog
        open={paraBorrar !== null}
        onOpenChange={(open) => {
          if (!open) {
            setParaBorrar(null);
            setDeleteError(null);
          }
        }}
        title="¿Eliminar este presupuesto?"
        description={
          deleteError ??
          (paraBorrar
            ? `Se borrará "${paraBorrar.client_name || "Cliente sin nombre"}" de este navegador. Esta acción no se puede deshacer.`
            : undefined)
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
