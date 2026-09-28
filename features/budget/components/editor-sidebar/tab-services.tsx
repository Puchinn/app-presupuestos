import { useBudgetContext } from "../../context/context-provider";
import type { Service } from "@/features/services-catalog/types";
import { ServiceCard } from "@/features/services-catalog/components/new-servicecard";

interface TabServicesProps {
  services: Service[];
}

export function TabServices({ services }: TabServicesProps) {
  const { methods } = useBudgetContext();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800">
          Catálogo de servicios AR
        </span>
        <button
          type="button"
          onClick={() => methods.createBlankService()}
          className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
        >
          + Ítem vacío
        </button>
      </div>
      <p className="text-[11px] text-slate-500">
        Hacé clic en cualquier paquete para insertarlo de inmediato en tu
        presupuesto:
      </p>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
