"use client";

import { useBudgetContext } from "./budget-context";
import { EditableField } from "@/components/editable-field";
import { EditableBulletList } from "@/components/editable-bullet-list";
import { EditableQuantity } from "@/components/editable-quantity";
import { EditablePrice } from "@/components/editable-price";
import {
  Trash2,
  Plus,
  Save,
  ListPlus,
  ChevronDown,
  FileText,
} from "lucide-react";

export function BudgetServicesTable() {
  const {
    services,
    updateService,
    removeService,
    grandTotal,
    formatPrice,
    activeDetailsMenu,
    setActiveDetailsMenu,
    savedDetails,
    saveServiceDetails,
    setSidebarTab,
  } = useBudgetContext();

  const loadDetailsToService = (
    serviceId: string,
    detail: { items: string[] },
  ) => {
    updateService(serviceId, { details: [...detail.items] });
    setActiveDetailsMenu(null);
  };

  return (
    <section className="mb-12">
      <div className="grid grid-cols-[1fr_80px_120px_120px] gap-4 pb-3 border-b-2 border-foreground">
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Servicio
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground text-center">
          Cant.
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground text-right">
          P. Unitario
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground text-right">
          Total
        </span>
      </div>

      {services.map((service, idx) => {
        const rowTotal = service.quantity * service.unitPrice;
        return (
          <div
            key={service.id}
            className={`group grid grid-cols-[1fr_80px_120px_120px] gap-4 py-6 items-start ${
              idx < services.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <EditableField
                  value={service.title}
                  onChange={(v) => updateService(service.id, { title: v })}
                  className="text-base font-semibold text-foreground tracking-tight"
                />
                {services.length > 1 && (
                  <button
                    onClick={() => removeService(service.id)}
                    className="print:hidden opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Eliminar servicio"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <EditableBulletList
                items={service.details}
                onChange={(items) =>
                  updateService(service.id, { details: items })
                }
              />
              <div className="print:hidden relative mt-2">
                <button
                  onClick={() =>
                    setActiveDetailsMenu(
                      activeDetailsMenu === service.id ? null : service.id,
                    )
                  }
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <ListPlus className="h-3 w-3" />
                  Detalles
                  <ChevronDown className="h-3 w-3" />
                </button>
                {activeDetailsMenu === service.id && (
                  <div className="absolute left-0 top-full mt-1 z-20 w-64 bg-background border border-border rounded-lg shadow-lg py-2">
                    <button
                      onClick={() => saveServiceDetails(service.id, services)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                    >
                      <Save className="h-3.5 w-3.5 text-muted-foreground" />
                      Guardar estos detalles
                    </button>
                    {savedDetails.length > 0 && (
                      <>
                        <div className="h-px bg-border my-2" />
                        <p className="px-4 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
                          Cargar detalles guardados
                        </p>
                        {savedDetails.map((detail) => (
                          <button
                            key={detail.id}
                            onClick={() =>
                              loadDetailsToService(service.id, detail)
                            }
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate">{detail.label}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-0.5">
              <EditableQuantity
                value={service.quantity}
                onChange={(v) => updateService(service.id, { quantity: v })}
                className="text-[15px] text-foreground"
              />
            </div>

            <div className="flex justify-end pt-0.5">
              <EditablePrice
                value={service.unitPrice}
                onChange={(v) => updateService(service.id, { unitPrice: v })}
                className="text-[15px] text-foreground"
              />
            </div>

            <div className="flex justify-end pt-0.5">
              <span
                className="text-[15px] font-semibold tabular-nums text-foreground"
                title="Cantidad x Precio Unitario"
              >
                $ {formatPrice(rowTotal)}
              </span>
            </div>
          </div>
        );
      })}

      <button
        onClick={() => setSidebarTab("services")}
        className="print:hidden flex items-center gap-2 mt-5 text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
      >
        <Plus className="h-4 w-4" />
        Agregar servicio
      </button>
    </section>
  );
}
