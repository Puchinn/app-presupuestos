// Skeleton del dashboard (banner + filtros + grilla). Renderiza dentro del
// `<main>` del layout del grupo: AppHeader y el sidebar ya están montados.
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* BANNER (Skeleton) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3 w-full max-w-lg">
            <div className="h-3 w-40 bg-blue-100 rounded" />
            <div className="h-8 w-56 bg-slate-200 rounded-md" />
            <div className="h-4 w-full bg-slate-100 rounded" />
          </div>
          {/* CTA "+ Nuevo presupuesto" falso */}
          <div className="h-11 w-52 bg-blue-200 rounded-xl" />
        </div>

        {/* KPIs falsos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2"
            >
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-7 w-16 bg-slate-300 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* FILTROS (Skeleton) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 h-9 bg-slate-50 border border-slate-300 rounded-lg" />
        <div className="flex flex-wrap justify-center gap-1.5 w-full md:w-auto">
          {[72, 84, 84, 96, 88, 88, 92].map((w, i) => (
            <div
              key={i}
              style={{ width: w }}
              className="h-7 bg-slate-100 rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* GRILLA DE TARJETAS (Skeleton) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="h-5 w-20 bg-blue-100 border border-blue-200 rounded" />
              <div className="h-5 w-24 bg-slate-100 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-8 w-24 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
