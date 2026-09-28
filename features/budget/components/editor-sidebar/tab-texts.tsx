export function TabTexts() {
  return (
    <div className="space-y-3 text-xs">
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Título o concepto principal
        </label>
        <input
          type="text"
          //   value={budget.projectTitle}
          //   onChange={(e) =>
          //     triggerAutoSave({
          //       ...budget,
          //       projectTitle: e.target.value,
          //     })
          //   }
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Notas comerciales & alcance
        </label>
        <textarea
          rows={4}
          //   value={budget.notes}
          //   onChange={(e) =>
          //     triggerAutoSave({ ...budget, notes: e.target.value })
          //   }
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          placeholder="Aclaraciones sobre revisiones, licencias o tiempos..."
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Términos de pago
        </label>
        <textarea
          //   rows={3}
          //   value={budget.paymentTerms}
          //   onChange={(e) =>
          //     triggerAutoSave({
          //       ...budget,
          //       paymentTerms: e.target.value,
          //     })
          //   }
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        />
      </div>
    </div>
  );
}
