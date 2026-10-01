import { getUserBudgets } from "@/features/budget/actions";
import { BudgetBanner } from "@/features/budget/components/budget-banner";
import { BudgetsSection } from "@/features/budget/components/budgets-section";

export default async function Page() {
  const budgetsResult = await getUserBudgets();
  // En fallo se muestra vacío por ahora; el estado de error queda en T-009.
  const budgets = budgetsResult.ok ? budgetsResult.data : [];

  return (
    <div className="space-y-8">
      <BudgetBanner />
      <BudgetsSection budgets={budgets} />
    </div>
  );
}
