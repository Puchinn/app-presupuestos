import { useBudgetContext } from "../../context/context-provider";

export function TabClient() {
  const { methods, budget } = useBudgetContext();

  return (
    <div className="space-y-3 text-xs">
      <span className="text-xs font-bold text-slate-800 block">
        Información fiscal del cliente
      </span>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Empresa / Razón Social
        </label>
        <input
          type="text"
          value={budget.client_name || ""}
          onChange={(e) =>
            methods.editBudgetInfo({
              client_name: e.target.value,
            })
          }
          placeholder="Ej. Acme SRL"
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Contacto o Titular
        </label>
        <input
          type="text"
          placeholder="Nombre y Apellido"
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          CUIT / CUIL del cliente
        </label>
        <input
          type="text"
          placeholder="30-XXXXXXXX-X"
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Correo para el envío
        </label>
        <input
          type="email"
          placeholder="facturacion@empresa.com"
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Dirección postal
        </label>
        <input
          type="text"
          placeholder="Calle 123, Ciudad"
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        />
      </div>
    </div>
  );
}
