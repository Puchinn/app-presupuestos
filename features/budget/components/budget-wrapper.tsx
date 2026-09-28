"use client";

import { BudgetEdit } from "./budget-edit";
import { useBudgetContext } from "../context/context-provider";

export function BudgetWrapper() {
  const state = useBudgetContext();

  return <BudgetEdit {...state} />;
}
