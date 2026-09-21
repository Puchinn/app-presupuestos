import { Service } from "@/types/resources";
import { ServiceCard } from "../ui/servicecard";
import { Button } from "../ui/button";
import { CardContent, CardFooter } from "../ui/card";
import { useState } from "react";
import { saveService } from "@/actions/services.actions";

export function ServicesList({ services }: { services: Service[] }) {
  return (
    <div>
      <h2>Servicios Guardados:</h2>
      <div className="space-y-3">
        {services.length === 0 && "No hay servicios, comienza a agregar aqui."}
        <CreateServiceForm />
        {services.map((service, idx) => (
          <ServiceCard
            defaultOpen={idx === 0}
            service={service}
            key={service.id}
          />
        ))}
      </div>
    </div>
  );
}

function CreateServiceForm() {
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const rawDetails = (formData.get("details") as string) || "";
    const detailsArray = rawDetails
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const updatedService: Partial<Service> = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      quantity: Number(formData.get("quantity")),
      details: detailsArray,
    };

    setIsEditing(false);
    await saveService(updatedService);
  };

  if (!isEditing)
    return (
      <Button type="button" onClick={() => setIsEditing(true)}>
        Crear
      </Button>
    );

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-3">
        {/* Nombre */}
        <div>
          <label className="text-xs font-medium text-slate-600">Nombre</label>
          <input
            type="text"
            name="name"
            defaultValue="Nombre del servicio"
            required
            className="w-full mt-1 px-2.5 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Precio y Cantidad */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-600">
              Precio Unit.
            </label>
            <input
              type="number"
              name="price"
              defaultValue="0"
              min="0"
              step="any"
              required
              className="w-full mt-1 px-2.5 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">
              Cantidad
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              required
              defaultValue={1}
              className="w-full mt-1 px-2.5 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Detalles (Textarea) */}
        <div>
          <label className="text-xs font-medium text-slate-600">
            Detalles (uno por línea)
          </label>
          <textarea
            name="details"
            rows={3}
            className="w-full mt-1 px-2.5 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="default">
            Guardar
          </Button>
        </div>
      </CardFooter>
    </form>
  );
}
