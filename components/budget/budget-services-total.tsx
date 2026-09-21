import { useBudgetContext } from "./budget-context";

export function BudgetServicesTotal() {
  const { grandTotal, formatPrice } = useBudgetContext();

  return (
    <section className="border-t-2 border-foreground pt-6 mb-12">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold uppercase tracking-[0.15em]">
          Total
        </span>
        <span className="text-3xl font-bold tabular-nums tracking-tight">
          $ {formatPrice(grandTotal)}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1.5 text-right uppercase tracking-[0.2em]">
        Pesos Argentinos (ARS)
      </p>
    </section>
  );
}
