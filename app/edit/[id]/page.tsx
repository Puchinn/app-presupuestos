"use client";

import { Budget } from "@/components/budget/budget";
import { useAppContext } from "./provider";
import { BudgetPreview } from "@/components/budget/preview";

export default function Page() {
  const budget = useAppContext();

  if (budget.budget.status === "issued") {
    return <BudgetPreview budget={budget.budget} />;
  }

  return <Budget {...budget} />;
}
