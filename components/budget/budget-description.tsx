"use client"

import { useBudgetContext } from "./budget-context"
import { EditableField } from "@/components/editable-field"
import { Save } from "lucide-react"

export function BudgetDescription() {
  const {
    showDescription, description, setDescription,
    saveCurrentDescription,
  } = useBudgetContext()

  if (!showDescription) return null

  return (
    <section className="border border-border rounded-md p-8 mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Detalle del presupuesto
        </h2>
        <button
          onClick={() => saveCurrentDescription(description)}
          className="print:hidden flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
          title="Guardar este detalle para reutilizarlo"
        >
          <Save className="h-3 w-3" />
          Guardar
        </button>
      </div>
      <EditableField
        value={description}
        onChange={setDescription}
        multiline
        className="text-[15px] leading-relaxed text-muted-foreground w-full"
      />
    </section>
  )
}
