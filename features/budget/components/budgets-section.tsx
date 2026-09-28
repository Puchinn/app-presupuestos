"use client";
import { useMemo, useState } from "react";
import type { Budget } from "../types";
import { BudgetCard } from "./budget-card";
import { BudgetEmptyResults } from "./budget-empty-results";
import { Filter } from "../types";
import { BudgetFilters } from "./budgets-filters";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import { deleteBudget } from "../actions";

export function BudgetsSection({ budgets }: { budgets: Budget[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [budget, setSelectedBudget] = useState<Budget | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      const matchesStatus =
        (activeFilter === "issued" && b.status === "issued") ||
        (activeFilter === "draft" && b.status === "draft") ||
        activeFilter === "all" ||
        (b.sent_status === activeFilter && activeFilter !== "draft");

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        b.public_code.toLowerCase().includes(q) ||
        b.client_name.toLowerCase().includes(q) ||
        b.dates.sent.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [budgets, activeFilter, searchQuery]);

  const onDeleteBudgetClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!budget) return;

    await deleteBudget(budget);
    setOpen(false);
  };

  const setFilter = (filter: Filter) => {
    setActiveFilter(filter);
  };

  const clearFilters = () => {
    setFilter("all");
  };

  return (
    <>
      <BudgetFilters
        activeFilter={activeFilter}
        setFilter={setFilter}
        query={searchQuery}
        setSearchQuery={setSearchQuery}
        budget_length={budgets.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBudgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            onSelect={onDeleteBudgetClick}
            budget={budget}
          />
        ))}
      </div>

      {!filteredBudgets.length && (
        <BudgetEmptyResults
          activeFilter={activeFilter}
          clearFilters={clearFilters}
        />
      )}

      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirmDelete}
        title={`Estás a punto de eliminar la cotización ${budget?.public_code} - ${budget?.client_name || "Sin Nombre"}`}
        description="Esta acción eliminará permanentemente todos los ítems y condiciones asociadas."
      />
    </>
  );
}
