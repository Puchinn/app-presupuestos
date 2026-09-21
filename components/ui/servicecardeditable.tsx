import React, { useState } from "react";

export interface Service {
  id: string;
  user_id: string;
  price: number;
  name: string;
  details: string[];
  quantity: number;
}

interface ServiceCardEditableProps {
  service: Service;
  onUpdate: (updatedService: Service) => void;
  onUse: (service: Service) => void;
}

export const ServiceCardEditable: React.FC<ServiceCardEditableProps> = ({
  service,
  onUpdate,
  onUse,
}) => {
  // Solo necesitamos un estado para alternar entre vista y edición
  const [isEditing, setIsEditing] = useState(false);

  // Manejador del submit usando FormData nativo (sin estados por input)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Capturamos los detalles (separados por saltos de línea en un textarea)
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

    onUpdate(updatedService);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
      {!isEditing ? (
        // --- VISTA NORMAL ---
        <div>
          {/* Cabecera / Nombre */}
          <div className="flex justify-between items-center font-medium text-gray-800 mb-3">
            <span>{service.name}</span>
            <span className="text-sm">▼</span>
          </div>

          {/* Caja de precio y cantidad */}
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${service.price * service.quantity}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Precio unitario: ${service.price}</span>
              <span>Cantidad: {service.quantity}</span>
            </div>
          </div>

          {/* Detalles */}
          <div className="text-sm text-gray-700 mb-4">
            <p className="font-medium mb-1">Detalles:</p>
            <ul className="space-y-1">
              {service.details.map((detail, index) => (
                <li
                  key={index}
                  className="flex items-center gap-1.5 text-gray-600"
                >
                  <span className="text-emerald-500">✔</span> {detail}
                </li>
              ))}
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onUse(service)}
              className="px-4 py-1.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Usar
            </button>
          </div>
        </div>
      ) : (
        // --- VISTA DE EDICIÓN (FORMULARIO CON UNCONTROLLED INPUTS) ---
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex justify-between items-center font-medium text-gray-800 mb-1">
            <span className="text-xs uppercase tracking-wider text-gray-500">
              Editando Servicio
            </span>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Nombre del servicio
            </label>
            <input
              type="text"
              name="name"
              defaultValue={service.name}
              required
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Precio y Cantidad */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Precio Unitario
              </label>
              <input
                type="number"
                name="price"
                defaultValue={service.price}
                min="0"
                step="any"
                required
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                name="quantity"
                defaultValue={service.quantity}
                min="1"
                required
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Detalles (Textarea donde cada línea es un detalle) */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Detalles (uno por línea)
            </label>
            <textarea
              name="details"
              defaultValue={service.details.join("\n")}
              rows={3}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Botones de Guardar / Cancelar */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
