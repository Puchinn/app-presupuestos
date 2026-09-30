import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
  Package,
} from "lucide-react";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import type { Service } from "@/features/services-catalog/types";

/** Lo que deben devolver onUpdate/onDelete: el resultado tipado de la action. */
type CallbackResult = { ok: boolean; error?: string };

type Notice = { type: "ok" | "error"; text: string };

export interface ServiceCardProps {
  service: Service;
  defaultOpen?: boolean;
  /** Callback opcional al hacer clic en "Usar" (o se conecta con tu Contexto) */
  onAdd?: (service: Service) => void;
  /** Callback opcional para actualizar (o se conecta con tus server actions) */
  onUpdate?: (
    service: Service,
  ) => Promise<CallbackResult | void> | CallbackResult | void;
  /** Callback opcional para eliminar (o se conecta con tus server actions) */
  onDelete?: (
    service: Service,
  ) => Promise<CallbackResult | void> | CallbackResult | void;
}

export function ServiceCard({
  service,
  defaultOpen = false,
  onAdd,
  onUpdate,
  onDelete,
}: ServiceCardProps) {
  const { name, details, quantity, price } = service;

  const [open, setOpen] = useState(defaultOpen);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotice = (type: Notice["type"], text: string) => {
    setNotice({ type, text });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3000);
  };

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  // Formateador local acorde a las normas de diseño en ARS / moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onUpdate) return;

    setIsSubmitting(true);

    try {
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

      const result = await onUpdate(updatedService);
      if (result && !result.ok) {
        showNotice("error", result.error ?? "No se pudo guardar el servicio.");
        return;
      }

      setIsEditing(false);
      showNotice("ok", "Servicio actualizado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const result = await onDelete(service);
    if (result && !result.ok) {
      showNotice("error", result.error ?? "No se pudo eliminar el servicio.");
    }
  };

  const handleUse = () => {
    if (!onAdd) return;
    onAdd(service);
    showNotice("ok", "Agregado al presupuesto.");
  };

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden font-sans">
      {/* Header / Trigger del Acordeón */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex-1 flex items-center justify-between gap-2 text-left group focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none rounded-lg p-1 -m-1 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                {isEditing ? "Configuración" : "Paquete de Servicio"}
              </span>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate leading-snug">
                {isEditing ? "Editando servicio" : name}
              </h3>
            </div>
          </div>

          <div
            className={`p-1 rounded-md text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
              open ? "rotate-180 text-blue-600" : ""
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Contenido Desplegable */}
      {open && (
        <div className="p-4 space-y-4">
          {notice && (
            <p
              role="status"
              className={`flex items-start gap-1.5 text-xs font-semibold leading-snug ${
                notice.type === "error" ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {notice.type === "error" ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
              ) : (
                <Check className="w-3.5 h-3.5 shrink-0 mt-px" />
              )}
              <span>{notice.text}</span>
            </p>
          )}
          {!isEditing ? (
            // ==================== VISTA NORMAL ====================
            <>
              {/* Tarjeta de Resumen Económico */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Subtotal estimado
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    ARS
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-none">
                  {formatCurrency(price * quantity)}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <span>
                    Precio unit.:{" "}
                    <strong className="font-mono text-slate-800">
                      {formatCurrency(price)}
                    </strong>
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] font-bold text-slate-700">
                    Cant: {quantity}
                  </span>
                </div>
              </div>

              {/* Lista de Detalles / Entregables */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Entregables & Alcance ({details.length}):
                </span>
                {details.length > 0 ? (
                  <ul className="space-y-1.5 text-xs">
                    {details.map((detail, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-slate-700 leading-snug"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Sin especificaciones cargadas.
                  </p>
                )}
              </div>

              {/* Footer de Acciones */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={handleUse}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs hover:shadow focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Usar</span>
                </button>
              </div>
            </>
          ) : (
            // ==================== VISTA DE EDICIÓN ====================
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Nombre del Servicio */}
              <div>
                <label
                  htmlFor={`srv-name-${service.id || "new"}`}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Nombre del servicio *
                </label>
                <input
                  id={`srv-name-${service.id || "new"}`}
                  type="text"
                  name="name"
                  defaultValue={name}
                  required
                  placeholder="ej. Diseño de Marca o Desarrollo Web"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
                />
              </div>

              {/* Precio y Cantidad */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor={`srv-price-${service.id || "new"}`}
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Precio Unit. ($) *
                  </label>
                  <input
                    id={`srv-price-${service.id || "new"}`}
                    type="number"
                    name="price"
                    defaultValue={price}
                    min="0"
                    step="any"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`srv-qty-${service.id || "new"}`}
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Cantidad *
                  </label>
                  <input
                    id={`srv-qty-${service.id || "new"}`}
                    type="number"
                    name="quantity"
                    defaultValue={quantity}
                    min="1"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Detalles / Entregables */}
              <div>
                <label
                  htmlFor={`srv-details-${service.id || "new"}`}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Detalles (uno por línea)
                </label>
                <textarea
                  id={`srv-details-${service.id || "new"}`}
                  name="details"
                  defaultValue={details.join("\n")}
                  rows={3}
                  placeholder="Definición de alcance&#10;Entregables en alta fidelidad&#10;Soporte y documentación"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors resize-none leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Presioná Enter para separar cada ítem en viñetas
                  independientes.
                </span>
              </div>

              {/* Botones del Formulario */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 hover:border-rose-300 focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:outline-none transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Eliminar</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none transition-colors cursor-pointer"
                  >
                    <span>Cancelar</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs hover:shadow focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all cursor-pointer disabled:opacity-60"
                  >
                    <span>{isSubmitting ? "Guardando..." : "Guardar"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      <DeleteAlertDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="¿Eliminar este servicio?"
        description={`Se quitará "${name}" de tu catálogo de servicios.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
