"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Plus, Save, Trash2, UserPlus } from "lucide-react";

import { ImageUpload } from "@/components/image-upload";
import { DatePicker } from "@/components/ui/date-picker";
import { EditableField } from "@/components/editable-field";
import { EditableQuantity } from "@/components/editable-quantity";
import { EditablePrice } from "@/components/editable-price";
import { EditableBulletList } from "@/components/editable-bullet-list";
import { HookReturn } from "../hooks/use-budget";
import type { Budget } from "../types";
import { useBudgetActions } from "@/features/local/local-actions";
import { getFileSizeInMB, getPublicStorageUrl } from "@/lib/utils";

type NoticeData = {
  /** Clave del destino: "conditions", "budget_details", "logo", "footer" o el id del servicio. */
  id: string;
  type: "ok" | "error";
  text: string;
};

function InlineNotice({
  notice,
  className = "",
}: {
  notice: NoticeData;
  className?: string;
}) {
  return (
    <p
      role="status"
      className={`print:hidden flex items-center gap-1.5 text-[11px] font-semibold ${
        notice.type === "error" ? "text-rose-600" : "text-emerald-600"
      } ${className}`}
    >
      {notice.type === "error" ? (
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <Check className="w-3.5 h-3.5 shrink-0" />
      )}
      {notice.text}
    </p>
  );
}

export function BudgetEdit({ budget, methods, readOnly }: HookReturn) {
  const router = useRouter();
  const { saveService, createTextItem, uploadImage } = useBudgetActions();
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const refresh = () => startTransition(() => router.refresh());

  const showNotice = (id: string, type: "ok" | "error", text: string) => {
    setNotice({ id, type, text });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3000);
  };

  const guardarTexto = async (campo: "conditions" | "budget_details") => {
    const contenido =
      campo === "conditions" ? budget.conditions : budget.budget_details;
    const result = await createTextItem(contenido);
    if (result.ok) refresh();
    showNotice(
      campo,
      result.ok ? "ok" : "error",
      result.ok ? "Fragmento guardado en la biblioteca." : result.error,
    );
  };

  const changeImage = async (
    file: File,
    field: keyof Pick<Budget, "logo_url" | "footer_img_url">,
  ) => {
    if (getFileSizeInMB(file) > 1) {
      showNotice(field, "error", "El archivo no puede pesar mas de 1mb");
      return;
    }

    const upload = await uploadImage(file);

    if (!upload.ok) {
      showNotice(field, "error", upload.error);
      return;
    }

    methods.editBudgetInfo({
      [field]: upload.path,
    });

    showNotice(field, "ok", "Actualizado correctamente");
  };

  const clearImage = (prop: keyof Budget) => {
    methods.editBudgetInfo({
      [prop]: "",
    });
  };

  const settings = budget.settings;

  return (
    <div className="max-w-[900px] break-inside-avoid w-full mx-auto print:my-0 print:max-w-none">
      <div className="relative shadow-sm print:shadow-none">
        {/* Marca de agua del editor: el PDF tiene la suya propia (sin "BORRADOR"
            cuando está emitido), así que esto solo se ve en pantalla. */}
        {readOnly && (
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 flex flex-col items-center justify-around overflow-hidden print:hidden"
          >
            <span className="text-6xl sm:text-7xl font-black uppercase tracking-[0.25em] text-slate-900/10 -rotate-12">
              Emitido
            </span>
            <span className="text-6xl sm:text-7xl font-black uppercase tracking-[0.25em] text-slate-900/10 -rotate-12">
              Emitido
            </span>
          </div>
        )}
        {/* HEADER  */}
        <header className="bg-black text-white px-12 py-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
            <div className="flex w-35 h-35 items-center">
              {settings.show_logo_url && (
                <ImageUpload
                  defaultSrc={getPublicStorageUrl(budget.logo_url)}
                  onUpload={(file) => changeImage(file, "logo_url")}
                  size={140}
                  onDeleteImage={() => clearImage("logo_url")}
                  disabled={readOnly}
                />
              )}
            </div>
            <h1 className="text-xl font-semibold tracking-[0.3em] uppercase text-background text-center">
              Presupuesto
            </h1>
            <div>
              <div className="flex items-center justify-end gap-8">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                    Enviado
                  </p>
                  <DatePicker
                    date={budget.dates.sent}
                    setDate={(date) =>
                      methods.editDates("sent", date.toString())
                    }
                    disabled={readOnly}
                  />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                    Plazo
                  </p>
                  <DatePicker
                    date={budget.dates.estimated}
                    setDate={(date) =>
                      methods.editDates("estimated", date.toString())
                    }
                    disabled={readOnly}
                  />
                </div>
              </div>
              <div className="text-right mt-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                  ID:
                </p>
                <EditableField
                  value={budget.public_code}
                  onChange={(value) =>
                    methods.editBudgetInfo({
                      public_code: value,
                    })
                  }
                  className="text-sm text-background/80"
                  disabled={readOnly}
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
              value={budget.client_name}
              onChange={(value) =>
                methods.editBudgetInfo({
                  client_name: value,
                })
              }
              className="text-sm font-medium text-background tracking-wide"
              disabled={readOnly}
            />
          </div>
        </header>
        {/* FIN HEADER */}

        {notice?.id === "logo_url" && (
          <div className="px-12 pt-4">
            <InlineNotice notice={notice} />
          </div>
        )}

        <main className="px-12 py-12">
          {/* SERVICIOS */}
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

            {budget.services.map((service, idx) => {
              const rowTotal = service.quantity * service.price;
              return (
                <div
                  key={service.id}
                  className={`group grid grid-cols-[1fr_80px_120px_120px] gap-4 py-6 items-start ${
                    idx < budget.services.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <EditableField
                        value={service.name}
                        onChange={(value) =>
                          methods.editService(service.id, { name: value })
                        }
                        className="text-base font-semibold text-foreground tracking-tight"
                        disabled={readOnly}
                      />
                      {!readOnly && (
                        <button
                          onClick={() => methods.removeService(service.id)}
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
                        methods.editService(service.id, { details: items })
                      }
                      disabled={readOnly}
                    />
                    {!readOnly && (
                      <div className="print:hidden flex gap-3 relative mt-2 items-center">
                        <button
                          onClick={async () => {
                            const result = await saveService(service);
                            if (result.ok) {
                              showNotice(
                                service.id,
                                "ok",
                                "Servicio guardado en tu catálogo.",
                              );
                            } else {
                              showNotice(service.id, "error", result.error);
                            }
                          }}
                          className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                          <Save className="h-3 w-3" />
                          Guardar este servicio{" "}
                        </button>
                        {notice?.id === service.id && (
                          <InlineNotice notice={notice} />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center pt-0.5">
                    <EditableQuantity
                      value={service.quantity}
                      onChange={(value) =>
                        methods.editService(service.id, { quantity: value })
                      }
                      className="text-[15px] text-foreground"
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <EditablePrice
                      value={service.price}
                      onChange={(v) =>
                        methods.editService(service.id, { price: v })
                      }
                      className="text-[15px] text-foreground"
                      disabled={readOnly}
                    />
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <span
                      className="text-[15px] font-semibold tabular-nums text-foreground"
                      title="Cantidad x Precio Unitario"
                    >
                      {/* $ {formatPrice(rowTotal)} */}$ {rowTotal}
                    </span>
                  </div>
                </div>
              );
            })}

            {!readOnly && (
              <button
                onClick={methods.createBlankService}
                className="print:hidden flex items-center gap-2 mt-5 text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
              >
                <Plus className="h-4 w-4" />
                Agregar servicio
              </button>
            )}
          </section>
          {/* FIN SERVICIOS */}

          {/* TOTAL */}
          <section className="border-t-2 border-foreground pt-6 mb-12">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold uppercase tracking-[0.15em]">
                total
              </span>
              <span className="text-3xl font-bold tabular-nums tracking-tight">
                {/* $ {formatPrice(grandTotal)} */}
                {budget.total_price_services}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 text-right uppercase tracking-[0.2em]">
              Pesos Argentinos (ARS)
            </p>
          </section>
          {/* FIN TOTAL */}

          {/* CONDICIONES */}
          {settings.show_budget_conditions && (
            <section className="border border-border rounded-md p-8 mb-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Condiciones de pago
                </h3>
                {!readOnly && (
                  <button
                    onClick={() => guardarTexto("conditions")}
                    disabled={isPending}
                    className="print:hidden flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors disabled:opacity-50"
                    title="Guardar esta condicion para reutilizarla"
                  >
                    <Save className="h-3 w-3" />
                    Guardar
                  </button>
                )}
              </div>
              {notice?.id === "conditions" && (
                <InlineNotice notice={notice} className="mb-3" />
              )}
              <EditableField
                value={budget.conditions}
                onChange={(value) =>
                  methods.editBudgetInfo({ conditions: value })
                }
                multiline
                className="text-[15px] leading-relaxed text-muted-foreground w-full"
                disabled={readOnly}
              />
            </section>
          )}
          {/* FIN CONDICIONES */}

          {/* DESCRIPTION */}
          {settings.show_budget_details && (
            <section className="border border-border rounded-md p-8 mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Detalle del presupuesto
                </h2>
                {!readOnly && (
                  <button
                    onClick={() => guardarTexto("budget_details")}
                    disabled={isPending}
                    className="print:hidden flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors disabled:opacity-50"
                    title="Guardar este detalle para reutilizarlo"
                  >
                    <Save className="h-3 w-3" />
                    Guardar
                  </button>
                )}
              </div>
              {notice?.id === "budget_details" && (
                <InlineNotice notice={notice} className="mb-3" />
              )}
              <EditableField
                value={budget.budget_details}
                onChange={(value) =>
                  methods.editBudgetInfo({ budget_details: value })
                }
                multiline
                className="text-[15px] leading-relaxed text-muted-foreground w-full"
                disabled={readOnly}
              />
            </section>
          )}
          {/* FIN DESCRIPTION  */}
        </main>
        {/* <BudgetFooter /> */}

        <footer className="border-t border-border px-12 py-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              {settings.show_footer_url && (
                <div className="space-y-2">
                  <ImageUpload
                    onUpload={(file) => changeImage(file, "footer_img_url")}
                    size={80}
                    defaultSrc={getPublicStorageUrl(budget.footer_img_url)}
                    onDeleteImage={() => clearImage("footer_img_url")}
                    disabled={readOnly}
                  />
                  {notice?.id === "footer_img_url" && (
                    <InlineNotice className="absolute" notice={notice} />
                  )}
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Conoce mis trabajos
                </p>
                <EditableField
                  value={budget.website}
                  onChange={(value) =>
                    methods.editBudgetInfo({ website: value })
                  }
                  className="text-sm font-medium text-foreground"
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="text-right">
              <div className="space-y-4">
                {budget.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="group flex items-center justify-end gap-2"
                  >
                    {!readOnly && (
                      <button
                        onClick={() =>
                          methods.removeParticipant(participant.id)
                        }
                        className="print:hidden opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Eliminar participante"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                    <div className="text-right">
                      <EditableField
                        value={participant.name}
                        onChange={(value) =>
                          methods.editParticipant(participant.id, {
                            name: value,
                          })
                        }
                        className="text-[15px] font-semibold text-foreground"
                        disabled={readOnly}
                      />
                      <br />
                      <EditableField
                        value={participant.role}
                        onChange={(v) =>
                          methods.editParticipant(participant.id, { role: v })
                        }
                        className="text-sm text-muted-foreground"
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {!readOnly && (
                <button
                  onClick={methods.createBlankParticipant}
                  className="print:hidden inline-flex items-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                >
                  <UserPlus className="h-4 w-4" />
                  Agregar participante
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-border flex items-center justify-center gap-6">
            <EditableField
              value={budget.contact_number}
              onChange={(value) =>
                methods.editBudgetInfo({ contact_number: value })
              }
              className="text-sm text-muted-foreground"
              disabled={readOnly}
            />
            <span className="text-foreground/10">|</span>
            <EditableField
              value={budget.website}
              onChange={(value) => methods.editBudgetInfo({ website: value })}
              className="text-sm text-muted-foreground"
              disabled={readOnly}
            />
          </div>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground italic">
              ¿Querés presentar tus presupuestos así? Diseñamos tu sistema de
              presupuestos automatizado para tu marca. Consultanos
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
