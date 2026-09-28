export function TabSettings() {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Moneda de cotización
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            // onClick={() =>
            //   triggerAutoSave({ ...budget, currency: "ARS" })
            // }
            className={`py-1.5 rounded-lg font-semibold border ${
              true
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-700 border-slate-300"
            }`}
          >
            Pesos (ARS)
          </button>
          <button
            type="button"
            className={`py-1.5 rounded-lg font-semibold border ${
              false
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-700 border-slate-300"
            }`}
          >
            Dólares (USD)
          </button>
        </div>
      </div>

      {/* IVA */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label
            htmlFor="apply-iva-switch"
            className="font-semibold text-slate-800 cursor-pointer"
          >
            Aplicar IVA discriminado
          </label>
          <input
            id="apply-iva-switch"
            type="checkbox"
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
        </div>

        {/* {budget.applyIva && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-slate-600">Alícuota IVA:</span>
                    {[21, 10.5, 0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() =>
                          triggerAutoSave({ ...budget, ivaRate: rate })
                        }
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          budget.ivaRate === rate
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                )} */}
      </div>

      {/* Discount */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Descuento comercial (%)
        </label>
        <input
          type="number"
          min={0}
          max={100}
          //   value={budget.discountPercentage}
          //   onChange={(e) =>
          //     triggerAutoSave({
          //       ...budget,
          //       discountPercentage: Math.max(
          //         0,
          //         Math.min(100, Number(e.target.value)),
          //       ),
          //     })
          //   }
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none font-mono"
        />
      </div>

      {/* Delivery timeframe */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Plazo de entrega
        </label>
        <input
          type="text"
          //   value={budget.deliveryDays}
          //   onChange={(e) =>
          //     triggerAutoSave({
          //       ...budget,
          //       deliveryDays: e.target.value,
          //     })
          //   }
          placeholder="Ej. 15 días hábiles"
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        />
      </div>
    </div>
  );
}
