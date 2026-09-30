import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useBudgetContext } from "../../context/context-provider";
import type { Service } from "@/features/services-catalog/types";
import {
  deleteService,
  updateService,
} from "@/features/services-catalog/actions";
import { ServiceCard } from "@/features/services-catalog/components/new-servicecard";

interface TabServicesProps {
  services: Service[];
}

export function TabServices({ services }: TabServicesProps) {
  const { methods } = useBudgetContext();
  const router = useRouter();
  // La lista vive solo en la prop del servidor: así "Guardar este servicio"
  // del documento (que agrega al catálogo con el sidebar abierto) la mantiene
  // sincronizada sin que haga falta un estado local que pudiera quedar viejo.
  const [, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  const handleUse = (service: Service) => {
    // Copia de solo los campos del ítem: el id del catálogo y el user_id no
    // deben viajar al presupuesto.
    methods.addService({
      name: service.name,
      price: service.price,
      quantity: service.quantity,
      details: service.details,
    });
  };

  const handleUpdate = async (service: Service) => {
    const result = await updateService(service);
    if (result.ok) refresh();
    return result;
  };

  const handleDelete = async (service: Service) => {
    const result = await deleteService(service);
    if (result.ok) refresh();
    return result;
  };

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
          <ServiceCard
            key={service.id}
            service={service}
            onAdd={handleUse}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
