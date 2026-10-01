import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Plus, Trash2 } from "lucide-react";
import { useBudgetContext } from "../../context/context-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import { deleteTextItem } from "@/features/text-item/actions";
import type { TextItem, TextListResult } from "@/features/text-item/types";

interface TabTextsProps {
  texts: TextListResult;
}

type Destino = "conditions" | "budget_details";

type Notice = { type: "ok" | "error"; text: string };

const DESTINOS: { key: Destino; label: string }[] = [
  { key: "conditions", label: "Condiciones de pago" },
  { key: "budget_details", label: "Detalle del presupuesto" },
];

const recortar = (text: string) =>
  text.length > 60 ? `${text.slice(0, 60)}…` : text;

export function TabTexts({ texts }: TabTextsProps) {
  const { budget, methods, readOnly } = useBudgetContext();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [destino, setDestino] = useState<Destino>("conditions");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [paraBorrar, setParaBorrar] = useState<TextItem | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const refresh = () => startTransition(() => router.refresh());

  const showNotice = (type: Notice["type"], text: string) => {
    setNotice({ type, text });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3000);
  };

  const insertar = (fragmento: string) => {
    // Siempre al final, separado con \n: nunca se pisa lo que ya escribió.
    if (destino === "conditions") {
      methods.editBudgetInfo({
        conditions: budget.conditions
          ? `${budget.conditions}\n${fragmento}`
          : fragmento,
      });
      showNotice("ok", "Insertado en Condiciones de pago.");
    } else {
      methods.editBudgetInfo({
        budget_details: budget.budget_details
          ? `${budget.budget_details}\n${fragmento}`
          : fragmento,
      });
      showNotice("ok", "Insertado en Detalle del presupuesto.");
    }
  };

  const handleDelete = async () => {
    if (!paraBorrar) return;
    const result = await deleteTextItem(paraBorrar.id);
    if (result.ok) refresh();
    showNotice(
      result.ok ? "ok" : "error",
      result.ok ? "Fragmento eliminado." : result.error,
    );
  };

  return (
    <div className="space-y-3 text-xs">
      <div>
        <span className="text-xs font-bold text-slate-800 block">
          Textos del documento
        </span>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Condiciones y detalle que se muestran en el presupuesto
        </p>
      </div>

      <div>
        <label
          htmlFor="text-conditions"
          className="block text-[11px] font-semibold text-slate-600 mb-1"
        >
          Condiciones de pago
        </label>
        <textarea
          id="text-conditions"
          rows={3}
          value={budget.conditions}
          onChange={(e) =>
            methods.editBudgetInfo({ conditions: e.target.value })
          }
          readOnly={readOnly}
          placeholder="Forma de pago, anticipos y vencimientos..."
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none read-only:cursor-not-allowed read-only:bg-slate-100"
        />
        {!budget.settings.show_budget_conditions && (
          <p className="text-[11px] text-slate-400 mt-1">
            Oculto en el documento (se activa en Configuración)
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="text-budget-details"
          className="block text-[11px] font-semibold text-slate-600 mb-1"
        >
          Detalle del presupuesto
        </label>
        <textarea
          id="text-budget-details"
          rows={4}
          value={budget.budget_details}
          onChange={(e) =>
            methods.editBudgetInfo({ budget_details: e.target.value })
          }
          readOnly={readOnly}
          placeholder="Aclaraciones sobre revisiones, licencias o tiempos..."
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none read-only:cursor-not-allowed read-only:bg-slate-100"
        />
        {!budget.settings.show_budget_details && (
          <p className="text-[11px] text-slate-400 mt-1">
            Oculto en el documento (se activa en Configuración)
          </p>
        )}
      </div>

      {/* BIBLIOTECA DE FRAGMENTOS */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <span className="text-xs font-bold text-slate-800 block">
          Biblioteca de fragmentos
        </span>
        <p className="text-[11px] text-slate-500">
          Usá &quot;Guardar&quot; en las secciones del documento para crear
          fragmentos reutilizables.
        </p>

        {/* Destino del insert (opción A del plan) */}
        <div>
          <span className="block text-[11px] font-semibold text-slate-600 mb-1">
            Insertar en
          </span>
          <div className="grid grid-cols-2 gap-1">
            {DESTINOS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setDestino(key)}
                aria-pressed={destino === key}
                disabled={readOnly}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold leading-tight transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:cursor-not-allowed ${
                  destino === key
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                } ${readOnly ? "opacity-60" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Estado de error */}
        {!texts.ok && (
          <div
            role="alert"
            className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5"
          >
            <p className="text-xs font-semibold text-rose-700 leading-snug">
              {texts.error}
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
        {texts.ok && texts.data.length === 0 && (
          <EmptyState
            title="Sin fragmentos todavía"
            description='Usá "Guardar" en Condiciones o Detalle del documento para crear el primero.'
          />
        )}

        {/* Lista */}
        {texts.ok && texts.data.length > 0 && (
          <div
            className={`space-y-2 max-h-64 overflow-y-auto pr-1 transition-opacity ${
              isPending ? "opacity-60" : ""
            }`}
          >
            {texts.data.map((texto) => (
              <div
                key={texto.id}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
              >
                <p className="text-xs text-slate-700 whitespace-pre-wrap break-words line-clamp-4">
                  {texto.content}
                </p>
                {!readOnly && (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => insertar(texto.content)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Insertar
                    </button>
                    <button
                      type="button"
                      onClick={() => setParaBorrar(texto)}
                      title="Eliminar fragmento"
                      aria-label="Eliminar fragmento"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aviso efímero de 3 s (patrón de ServiceCard) */}
      {notice && (
        <p
          role="status"
          className={`flex items-start gap-1.5 text-[11px] font-semibold leading-snug ${
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

      <DeleteAlertDialog
        open={paraBorrar !== null}
        onOpenChange={(open) => {
          if (!open) setParaBorrar(null);
        }}
        title="¿Eliminar este fragmento?"
        description={
          paraBorrar
            ? `Se quitará "${recortar(paraBorrar.content)}" de tu biblioteca.`
            : undefined
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
