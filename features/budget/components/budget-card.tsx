"use client";

import React, { useState } from "react";
import type { Budget } from "../types";
import { ChangeStatusMenu } from "@/features/budget/components/change-status-menu";
import {
  Eye,
  Edit3,
  Trash2,
  Copy,
  MoreVertical,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import { formatARS, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BudgetCardProps {
  budget: Budget;
  onSelect: (budget: Budget) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onSelect }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="bg-white relative rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
      {/* Top Card Section */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Client Initials Badge */}
            <div
              className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs"
              aria-hidden="true"
            >
              {budget.client_name.substring(0, 2).toUpperCase() || "CL"}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500 tracking-wider">
                  {budget.public_code}
                </span>
                {budget.status === "issued" && (
                  <span className="absolute text-4xl select-none top-1/2 left-1/8 rotate-45 inset-0 font-semibold bg-none uppercase opacity-25 text-slate-600 px-1.5 py-0.5">
                    Emitido
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 truncate text-base leading-snug">
                {budget.client_name || "Sin Nombre"}
              </h3>
            </div>
          </div>

          <ChangeStatusMenu
            budgetId={budget.id}
            current={budget.sent_status}
            size="sm"
            onChange={() => router.refresh()}
          />
        </div>

        {/* Project Title */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-normal">
          {budget.client_name || "Sin título de proyecto asignado"}
        </p>

        {/* Details Grid */}
        <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <DollarSign
                className="w-3.5 h-3.5 text-slate-400"
                aria-hidden="true"
              />
              Monto total (ARS):
            </span>
            <span className="font-bold text-slate-900 text-sm font-mono">
              {formatARS(budget.total_price_services || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar
                className="w-3.5 h-3.5 text-slate-400"
                aria-hidden="true"
              />
              Validez hasta:
            </span>
            <span className="font-medium text-slate-700">
              {formatDate(budget.dates.sent)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock
                className="w-3.5 h-3.5 text-slate-400"
                aria-hidden="true"
              />
              Plazo de entrega:
            </span>
            <span className="font-medium text-slate-700">
              {formatDate(budget.dates.estimated)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2">
          <Link
            href={`/edit/${budget.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>Ver presupuesto</span>
          </Link>

          {budget.status !== "issued" ? (
            <Link
              href={`/edit/${budget.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Editar</span>
            </Link>
          ) : (
            <span className="text-[11px] text-slate-500 italic py-1">
              Solo lectura
            </span>
          )}
        </div>

        {/* Dropdown Menu for Secondary Actions */}
        <div className="relative">
          <button
            id={`btn-menu-${budget.id}`}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
            aria-label={`Acciones adicionales para presupuesto ${budget.public_code}`}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 animate-fadeIn"
              role="menu"
              aria-orientation="vertical"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 focus-visible:bg-slate-100 focus-visible:outline-none"
                role="menuitem"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Duplicar presupuesto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onSelect(budget);
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 focus-visible:bg-rose-50 focus-visible:outline-none"
                role="menuitem"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Eliminar cotización</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
