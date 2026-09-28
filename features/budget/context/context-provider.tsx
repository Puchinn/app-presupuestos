"use client";

import { createContext, PropsWithChildren, useContext } from "react";
import type { Budget } from "../types";
import { useBudget } from "../hooks/use-budget";
import type { HookReturn } from "../hooks/use-budget";

interface Props extends PropsWithChildren {
  budget?: Budget;
}

const context = createContext<HookReturn | null>(null);

export function BudgetProvider({ budget, children }: Props) {
  const state = useBudget(budget);

  return <context.Provider value={state}>{children}</context.Provider>;
}

export const useBudgetContext = () => {
  const state = useContext(context);
  if (!state) throw "No se puede usar fuera del provider";

  return state;
};
