import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Users, X } from "lucide-react";
import { useBudgetContext } from "../../context/context-provider";
import { EmptyState } from "@/components/ui/empty-state";
import type { Client, ClientListResult } from "@/features/clients/types";
import { useBudgetActions } from "@/features/local/local-actions";

interface TabClientProps {
  clients: ClientListResult;
}

type Notice = { type: "ok" | "error"; text: string };

export function TabClient({ clients }: TabClientProps) {
  const { methods, budget, readOnly } = useBudgetContext();
  const { createClient } = useBudgetActions();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = () => startTransition(() => router.refresh());

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

  const clientList = clients.ok ? clients.data : [];
  // Un vínculo vacío es "" en el estado de UI (UIBudgetSchema); la DB guarda
  // null. Puede venir null desde DEFAULT_BUDGET, por eso el ?? "".
  const linkedId = budget.client_id ?? "";
  const typedName = budget.client_name || "";
  const normalizedTyped = typedName.trim().toLowerCase();
  const linkedClient = linkedId
    ? clientList.find((client) => client.id === linkedId)
    : undefined;
  const isLinkedToTypedName =
    !!linkedClient &&
    linkedClient.name.trim().toLowerCase() === normalizedTyped;
  const canSave = normalizedTyped !== "" && !isLinkedToTypedName;
  // El texto del campo de nombre es también el filtro de la lista.
  const visibleClients = clientList.filter((client) =>
    client.name.trim().toLowerCase().includes(normalizedTyped),
  );

  const saveDisabledReason = isSaving
    ? "Guardando..."
    : normalizedTyped === ""
      ? "Escribí un nombre de cliente para guardarlo."
      : isLinkedToTypedName
        ? "Este cliente ya está vinculado."
        : "";

  const handleSelect = (client: Client) => {
    methods.selectClient(client);
    showNotice("ok", "Cliente vinculado al presupuesto.");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await createClient(typedName);
      if (!result.ok) {
        showNotice("error", result.error);
        return;
      }

      // Si ya existía un cliente con ese nombre, la action devuelve el
      // existente: se vincula sin duplicar.
      methods.selectClient(result.data);
      showNotice("ok", "Cliente guardado y vinculado.");
      refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlink = () => {
    // Solo se vacía client_id; client_name conserva lo escrito a mano.
    methods.editBudgetInfo({ client_id: "" });
    showNotice("ok", "Se quitó el vínculo con el cliente.");
  };

  return (
    <div className="space-y-3 text-xs">
      <span className="text-xs font-bold text-slate-800 block">
        Información fiscal del cliente
      </span>

      <div>
        <label
          htmlFor="budget-client-name"
          className="block text-[11px] font-semibold text-slate-600 mb-1"
        >
          Empresa / Razón Social
        </label>
        <div className="flex items-stretch gap-1.5">
          <input
            id="budget-client-name"
            type="text"
            value={typedName}
            onChange={(e) =>
              methods.editBudgetInfo({ client_name: e.target.value })
            }
            readOnly={readOnly}
            placeholder="Ej. Acme SRL"
            className="min-w-0 flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none read-only:cursor-not-allowed read-only:bg-slate-100"
          />
          {!readOnly && (
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSaving || isPending}
              title={saveDisabledReason || "Guardar este nombre como cliente"}
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[11px] font-bold text-white shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Guardando..." : "Guardar como cliente"}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className={`flex items-start gap-1.5 text-[11px] font-semibold leading-snug ${
            notice.type === "error" ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {notice.type === "error" ? (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
          ) : (
            <Check className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
          )}
          <span>{notice.text}</span>
        </p>
      )}

      {linkedId && (
        <div className="flex items-center justify-between gap-2 p-2 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-[11px] text-blue-800 min-w-0 truncate">
            Vinculado a:{" "}
            <strong className="font-semibold">
              {linkedClient ? linkedClient.name : typedName || "este cliente"}
            </strong>
          </span>
          {!readOnly && (
            <button
              type="button"
              onClick={handleUnlink}
              className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-300 bg-white text-[11px] font-bold text-blue-800 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              Quitar vínculo
            </button>
          )}
        </div>
      )}

      {clients.ok && clientList.length > 0 && (
        <p className="text-[11px] text-slate-500">
          {normalizedTyped
            ? "Clientes que coinciden con lo que escribís:"
            : "Tus clientes guardados:"}
        </p>
      )}

      {/* Estado de error: `getClients` distingue fallo de lista vacía */}
      {!clients.ok && (
        <div
          role="alert"
          className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5"
        >
          <p className="text-xs font-semibold text-rose-700 leading-snug">
            {clients.error}
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

      {/* Estado vacío: sin clientes guardados */}
      {clients.ok && clientList.length === 0 && (
        <EmptyState
          icon={<Users className="w-8 h-8" aria-hidden="true" />}
          title="Todavía no tenés clientes"
          description='Escribí un nombre arriba y usá "Guardar como cliente" para crear el primero.'
        />
      )}

      {/* Estado vacío: hay clientes pero ninguno coincide con el filtro */}
      {clients.ok &&
        clientList.length > 0 &&
        visibleClients.length === 0 && (
          <p className="text-[11px] text-slate-500 italic">
            Ningún cliente coincide con lo que escribís.
          </p>
        )}

      {/* Lista */}
      {visibleClients.length > 0 && (
        <div
          className={`space-y-2 max-h-80 overflow-y-auto pr-1 transition-opacity ${
            isPending ? "opacity-60" : ""
          }`}
        >
          {visibleClients.map((client) => {
            const isLinked = client.id === linkedId;

            return (
              <div
                key={client.id}
                className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {client.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelect(client)}
                  disabled={isLinked || readOnly}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[11px] font-bold text-white shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLinked ? "Vinculado" : "Elegir"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
