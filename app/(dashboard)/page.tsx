import { getUserBudgets } from "@/features/budget/actions";
import { BudgetBanner } from "@/features/budget/components/budget-banner";
import { BudgetsSection } from "@/features/budget/components/budgets-section";
import { ErrorState } from "@/components/ui/error-state";

export default async function Page() {
  const budgetsResult = await getUserBudgets();

  // En fallo no se muestra la grilla: un ErrorState distingue el error del
  // vacío real ("Aún no creaste ningún presupuesto") y permite reintentar.
  if (!budgetsResult.ok) {
    return <ErrorState description={budgetsResult.error} />;
  }

  return (
    <div className="space-y-8">
      <BudgetBanner />
      <BudgetsSection budgets={budgetsResult.data} />
    </div>
  );
}
