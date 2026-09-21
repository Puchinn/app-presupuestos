"use client"

import { useBudgetContext } from "./budget-context"
import { EditableField } from "@/components/editable-field"
import { Save } from "lucide-react"

export function BudgetConditions() {
  const {
    showConditions, conditions, setConditions,
    saveCurrentCondition,
  } = useBudgetContext()

  if (!showConditions) return null

  return (
    <section className="border border-border rounded-md p-8 mb-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Condiciones de pago
        </h3>
        <button
          onClick={() => saveCurrentCondition(conditions)}
          className="print:hidden flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
          title="Guardar esta condicion para reutilizarla"
        >
          <Save className="h-3 w-3" />
          Guardar
        </button>
      </div>
      <EditableField
        value={conditions}
        onChange={setConditions}
        multiline
        className="text-[15px] leading-relaxed text-muted-foreground w-full"
      />
    </section>
  )
}
