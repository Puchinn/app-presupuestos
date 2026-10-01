import { createNewBudget } from "@/features/budget/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const result = await createNewBudget();

  if (!result.ok) {
    // Estado mínimo para compilar; el diseño de errores queda en T-009.
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">
          No se pudo crear el presupuesto
        </h1>
        <p className="text-sm text-slate-600">{result.error}</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  redirect(`/edit/${result.id}`);
}
