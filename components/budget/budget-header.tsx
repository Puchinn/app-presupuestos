"use client"

import { useBudgetContext } from "./budget-context"
import { EditableField } from "@/components/editable-field"
import { ImageUpload } from "@/components/image-upload"

export function BudgetHeader() {
  const {
    sentDate, setSentDate,
    estimatedTime, setEstimatedTime,
    clientName, setClientName,
  } = useBudgetContext()

  return (
    <header className="bg-foreground text-background px-12 py-8">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        <div className="flex items-center">
          <ImageUpload
            defaultSrc="/logo.webp"
            label="Cambiar logo"
            size={140}
            imageClassName="brightness-0 invert object-contain"
          />
        </div>
        <h1 className="text-xl font-semibold tracking-[0.3em] uppercase text-background text-center">
          Presupuesto
        </h1>
        <div className="flex items-center justify-end gap-8">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
              Enviado
            </p>
            <EditableField
              value={sentDate}
              onChange={setSentDate}
              className="text-sm text-background/80"
            />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
              Plazo
            </p>
            <EditableField
              value={estimatedTime}
              onChange={setEstimatedTime}
              className="text-sm text-background/80"
            />
          </div>
        </div>
      </div>
      <div className="h-px bg-background/10 my-5" />
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-background/30">
          Cliente
        </p>
        <EditableField
          value={clientName}
          onChange={setClientName}
          className="text-sm font-medium text-background tracking-wide"
        />
      </div>
    </header>
  )
}
