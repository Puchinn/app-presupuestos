import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { useBudgetContext } from "../../context/context-provider";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  Service,
  ServiceListResult,
} from "@/features/services-catalog/types";
import { useBudgetActions } from "@/features/local/local-actions";
import { ServiceCard } from "@/features/services-catalog/components/new-servicecard";

interface TabServicesProps {
  services: ServiceListResult;
}

export function TabServices({ services }: TabServicesProps) {
  const { methods, readOnly } = useBudgetContext();
  const { updateService, deleteService } = useBudgetActions();
  const router = useRouter();
  // La lista vive solo en la prop del servidor: así "Guardar este servicio"
  // del documento (que agrega al catálogo con el sidebar abierto) la mantiene
  // sincronizada sin que haga falta un estado local que pudiera quedar viejo.
  const [isPending, startTransition] = useTransition();

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
        {!readOnly && (
          <button
            type="button"
            onClick={() => methods.createBlankService()}
            className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
          >
            + Ítem vacío
          </button>
        )}
      </div>
      {!readOnly && (
        <p className="text-[11px] text-slate-500">
          Hacé clic en cualquier paquete para insertarlo de inmediato en tu
          presupuesto:
        </p>
      )}

      {/* Estado de error: `getServices` distingue fallo de lista vacía */}
      {!services.ok && (
        <div
          role="alert"
          className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5"
        >
          <p className="text-xs font-semibold text-rose-700 leading-snug">
            {services.error}
          </p>
          <button
            type="button"
            onClick={refresh}
            disabled={isPending}
            className="text-xs font-semibold text-rose-800 underline hover:text-rose-900 disabled:opacity-50"
          >
            {isPending ? "Reintentando..." : "Reintentar"}
          </button>
        </div>
      )}

      {/* Estado vacío */}
      {services.ok && services.data.length === 0 && (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" aria-hidden="true" />}
          title="Tu catálogo está vacío"
          description='Creá el primero con "+ Ítem vacío" o guardá un servicio desde el documento.'
        />
      )}

      {/* Lista */}
      {services.ok && services.data.length > 0 && (
        <div
          className={`space-y-2 max-h-80 overflow-y-auto pr-1 transition-opacity ${
            isPending ? "opacity-60" : ""
          }`}
        >
          {services.data.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onAdd={handleUse}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
