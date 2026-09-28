import { EmptyState } from "@/components/ui/empty-state";
import { Filter } from "../types";
import { Plus, RotateCcw, SearchX } from "lucide-react";
import Link from "next/link";

interface Props {
  activeFilter: Filter;
  hasSearchQuery?: boolean;
  clearFilters: () => void;
}

export function BudgetEmptyResults({
  activeFilter,
  hasSearchQuery,
  clearFilters,
}: Props) {
  const isFiltered = activeFilter !== "all" || hasSearchQuery;

  if (isFiltered) {
    return (
      <EmptyState
        icon={<SearchX className="w-8 h-8" />}
        title="No se encontraron presupuestos"
        description="Probá ajustando los términos de búsqueda o eliminando los filtros activos."
        action={
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer filtros</span>
          </button>
        }
      />
    );
  }

  return (
    <EmptyState
      title="Aún no creaste ningún presupuesto"
      description="Comenzá creando tu primera cotización profesional para enviar a tus clientes."
      action={
        <Link
          href="/new-budget"
          className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Crear presupuesto</span>
        </Link>
      }
    />
  );
}
