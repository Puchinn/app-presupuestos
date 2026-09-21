import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getUserBudgets } from "@/actions/budget.actions";
import { BudgetCard } from "@/components/budget/budget-card";

export default async function Page() {
  const budgets = await getUserBudgets();

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <Card className="p-6">
        <CardContent className="space-y-6 p-0">
          {/* Botón Nuevo */}
          <Link
            href="/new-budget"
            className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
          >
            <Plus className="h-6 w-6" />
            <span className="font-medium">+ Nuevo</span>
          </Link>

          <hr className="border-border" />

          {/* Sección Presupuestos Recientes */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Presupuestos recientes</h2>

            <div className="flex w-full flex-wrap gap-4">
              {budgets.map((item) => (
                <BudgetCard key={item.id} budget={item} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
