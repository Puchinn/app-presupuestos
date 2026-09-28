import { getUserBudgets } from "@/features/budget/actions";
import { BudgetBanner } from "@/features/budget/components/budget-banner";
import { BudgetsSection } from "@/features/budget/components/budgets-section";

export default async function Page() {
  const budgets = await getUserBudgets();

  return (
    <div className="space-y-8">
      <BudgetBanner />
      <BudgetsSection budgets={budgets} />
    </div>
  );
}
