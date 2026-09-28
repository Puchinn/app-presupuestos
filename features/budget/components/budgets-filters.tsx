import { Search } from "lucide-react";
import { Filter } from "../types";

interface FilterProps {
  budget_length: number;
  activeFilter: Filter;
  setFilter: (filter: Filter) => void;
  query: string;
  setSearchQuery: (query: string) => void;
}

export function BudgetFilters({
  budget_length,
  activeFilter,
  setFilter,
  query,
  setSearchQuery,
}: FilterProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="budget-search-input"
          type="text"
          value={query}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por cliente, empresa o código..."
          aria-label="Buscar presupuesto"
          className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700"
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </div>

      {/* Status Filter Buttons */}
      <div
        className="flex flex-wrap justify-center items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0"
        role="tablist"
        aria-label="Filtrar por estado"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "all"}
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
            activeFilter === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Todos ({budget_length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "issued"}
          onClick={() => setFilter("issued")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
            activeFilter === "issued"
              ? "bg-blue-800 text-white"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
          }`}
        >
          Emitido
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "draft"}
          onClick={() => setFilter("draft")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
            activeFilter === "draft"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Borrador
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "pending"}
          onClick={() => setFilter("pending")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
            activeFilter === "pending"
              ? "bg-yellow-800 text-white"
              : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
          }`}
        >
          Sin Enviar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "sent"}
          onClick={() => setFilter("sent")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
            activeFilter === "sent"
              ? "bg-sky-700 text-white"
              : "bg-sky-50 text-sky-800 hover:bg-sky-100"
          }`}
        >
          Enviado
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "approved"}
          onClick={() => setFilter("approved")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
            activeFilter === "approved"
              ? "bg-emerald-700 text-white"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          }`}
        >
          Aprobado
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "rejected"}
          onClick={() => setFilter("rejected")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
            activeFilter === "rejected"
              ? "bg-rose-700 text-white"
              : "bg-rose-50 text-rose-800 hover:bg-rose-100"
          }`}
        >
          Rechazado
        </button>
      </div>
    </div>
  );
}
