// Skeleton genérico del modo prueba: cubre la lista y el editor mientras
// Next resuelve la navegación (los datos de localStorage se leen en el
// cliente, después de la hidratación).
export default function Loading() {
  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded" />
      <div className="h-4 w-80 bg-slate-100 rounded mt-3" />
      <div className="space-y-3 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 bg-white border border-slate-200 rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}
