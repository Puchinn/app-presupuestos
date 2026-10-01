// Skeleton con la forma del editor (`/edit/[id]` y `/new-budget`): fila de
// estado, sidebar colapsado y documento. Va dentro del layout del grupo, así
// que el AppHeader ya está montado arriba de este esqueleto.
export default function Loading() {
  return (
    <div className="max-w-7xl space-y-8 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* HEADER DE ESTADO (Skeleton) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Botón "Volver al inicio" falso */}
          <div className="h-9 w-36 bg-slate-100 rounded-xl" />
          <div className="border-l border-slate-200 pl-4 space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              {/* Código falso */}
              <div className="h-5 w-16 bg-blue-100 border border-blue-200 rounded" />
              <div className="h-4 w-32 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-48 bg-slate-200 rounded" />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Estado comercial, indicador de guardado, PDF e "Emitir" falsos */}
          <div className="h-9 w-28 bg-slate-100 rounded-xl" />
          <div className="h-4 w-20 bg-slate-100 rounded hidden sm:block" />
          <div className="h-9 w-24 bg-slate-100 rounded-xl" />
          <div className="h-10 w-40 bg-blue-200 rounded-xl" />
        </div>
      </div>

      {/* CONTENIDO: sidebar + documento (Skeleton) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SIDEBAR colapsado */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs shrink-0 w-full lg:w-16">
          <div className="p-4 border-b border-slate-100 flex justify-end">
            <div className="h-5 w-5 bg-slate-100 rounded-lg" />
          </div>
          <div className="p-2 grid grid-cols-5 lg:flex lg:flex-col gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-8 rounded-lg ${i === 0 ? "bg-blue-50 border border-blue-200" : "bg-slate-100"}`}
              />
            ))}
          </div>
        </div>

        {/* DOCUMENTO */}
        <div className="w-full p-4 border border-slate-200 rounded-xl">
          <div className="max-w-[900px] w-full mx-auto shadow-sm">
            {/* Encabezado negro del documento */}
            <div className="bg-slate-800 px-12 py-8 flex items-center justify-between gap-6">
              <div className="w-24 h-24 bg-slate-700 rounded-lg" />
              <div className="h-6 w-44 bg-slate-700 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-700 rounded ml-auto" />
                <div className="h-3 w-20 bg-slate-700 rounded ml-auto" />
              </div>
            </div>

            {/* Cuerpo del documento */}
            <div className="bg-white px-12 py-10 space-y-6">
              <div className="h-4 w-56 bg-slate-200 rounded ml-auto" />
              <div className="h-px bg-slate-200" />
              <div className="grid grid-cols-[1fr_80px_120px_120px] gap-4 pb-3 border-b-2 border-slate-200">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-10 bg-slate-200 rounded mx-auto" />
                <div className="h-3 w-16 bg-slate-200 rounded ml-auto" />
                <div className="h-3 w-12 bg-slate-200 rounded ml-auto" />
              </div>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_80px_120px_120px] gap-4 py-6 border-b border-slate-100"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 bg-slate-200 rounded" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                  </div>
                  <div className="h-4 w-8 bg-slate-100 rounded mx-auto" />
                  <div className="h-4 w-16 bg-slate-100 rounded ml-auto" />
                  <div className="h-4 w-16 bg-slate-200 rounded ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
