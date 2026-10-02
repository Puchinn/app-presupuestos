"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ListChecks } from "lucide-react";
import { BudgetProvider } from "@/features/budget/context/context-provider";
import { SideBar } from "@/features/budget/components/editor-sidebar/sidebar";
import { HeaderStatus } from "@/features/budget/components/header-status";
import { BudgetWrapper } from "@/features/budget/components/budget-wrapper";
import {
  LocalActionsProvider,
} from "@/features/local/local-actions";
import {
  persistLocalBudget,
  reloadStore,
  resetStore,
  useLocalStore,
} from "@/features/local/store";
import { ErrorState } from "@/components/ui/error-state";

export default function DemoEditPage() {
  const { id } = useParams<{ id: string }>();
  const storeState = useLocalStore();

  if (storeState.status === "loading") {
    return (
      <div className="max-w-7xl space-y-8 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="bg-white rounded-2xl border border-slate-200 h-20" />
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="bg-white rounded-2xl border border-slate-200 h-64 w-full lg:w-16" />
          <div className="w-full border border-slate-200 rounded-xl h-96 bg-white" />
        </div>
      </div>
    );
  }

  if (storeState.status === "error") {
    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState
          title="No pudimos leer tus datos de prueba"
          description={storeState.error}
          onRetry={reloadStore}
          action={
            <button
              type="button"
              onClick={resetStore}
              className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              Borrar datos y empezar de nuevo
            </button>
          }
        />
      </div>
    );
  }

  const budget = storeState.store.budgets.find((item) => item.id === id);

  if (!budget) {
    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState
          title="No encontramos ese presupuesto"
          description="Puede que lo hayas borrado o que los datos de este navegador hayan cambiado."
          retry={false}
          action={
            <Link
              href="/demo"
              className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              Volver a la lista
            </Link>
          }
        />
      </div>
    );
  }

  const { services, texts, clients } = storeState.store;

  return (
    <LocalActionsProvider>
      <BudgetProvider budget={budget} persist={persistLocalBudget}>
        <div className="max-w-7xl space-y-6 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver a la lista de prueba
          </Link>

          <HeaderStatus />

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <SideBar
              services={{ ok: true, data: services }}
              texts={{ ok: true, data: texts }}
              clients={{ ok: true, data: clients }}
            />
            <div className="w-full p-4 border rounded-xl">
              <div className="w-full rounded-xl overflow-hidden">
                <BudgetWrapper />
              </div>
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ListChecks className="w-3.5 h-3.5" aria-hidden="true" />
            Versión de prueba: los cambios se guardan solos en este navegador.
          </p>
        </div>
      </BudgetProvider>
    </LocalActionsProvider>
  );
}
