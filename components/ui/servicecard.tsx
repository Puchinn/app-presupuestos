import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, ChevronDown } from "lucide-react";
import { Button } from "./button";
import type { Service } from "@/types/resources";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

import { useAppContext } from "@/app/edit/[id]/provider";
import { updateService, deleteService } from "@/actions/services.actions";

interface Props {
  service: Service;
  defaultOpen?: boolean;
}

export function ServiceCard({ service, defaultOpen }: Props) {
  const { name, details, quantity, price } = service;
  const { methods } = useAppContext();

  const [open, setOpen] = useState(defaultOpen);
  // Estado mínimo solo para alternar entre ver y editar
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const rawDetails = (formData.get("details") as string) || "";
    const detailsArray = rawDetails
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const updatedService: Service = {
      ...service,
      name: (formData.get("name") as string) || service.name,
      price: Number(formData.get("price")) || 0,
      quantity: Number(formData.get("quantity")) || 1,
      details: detailsArray,
    };

    setIsEditing(false);
    await updateService(updatedService);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card size="sm" className="mx-auto w-full max-w-xs">
        <CardHeader>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <CardTitle>{isEditing ? "Editando servicio" : name}</CardTitle>
            <ChevronDown className="w-4 h-4" />
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          {!isEditing ? (
            // --- VISTA NORMAL ---
            <>
              <CardContent className="space-y-3">
                <div className="bg-slate-50 p-2 rounded-md">
                  <p className="text-2xl font-bold">${price * quantity}</p>
                  <div className="flex justify-between text-xs text-slate-600">
                    <p>Precio unitario: ${price}</p>
                    <p>Cantidad: {quantity}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Detalles:</p>
                  <ul className="space-y-1 text-sm">
                    {details.map((detail, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-x-1 text-slate-600"
                      >
                        <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />{" "}
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
                <Button
                  onClick={() => methods.addService(service)}
                  variant="default"
                >
                  Usar
                </Button>
              </CardFooter>
            </>
          ) : (
            // --- VISTA DE EDICIÓN (FORMULARIO CON FORM-DATA) ---
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3">
                {/* Nombre */}
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={name}
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
                      defaultValue={price}
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
                      defaultValue={quantity}
                      min="1"
                      required
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
                    defaultValue={details.join("\n")}
                    rows={3}
                    className="w-full mt-1 px-2.5 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  onClick={() => deleteService(service)}
                  type="button"
                  variant={"destructive"}
                >
                  Eliminar
                </Button>
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
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
