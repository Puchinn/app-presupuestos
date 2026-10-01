"use client";

// Los error boundaries deben ser Client Components.
import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";

interface Props {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function BudgetError({ error, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ErrorState
        title="No se pudo cargar el presupuesto"
        description={
          <>
            Algo salió mal al abrir esta sección. Probá de nuevo en un momento.
            {error.digest && (
              <span className="block mt-1 text-xs font-mono text-slate-400">
                Código: {error.digest}
              </span>
            )}
          </>
        }
        onRetry={retry}
        action={
          <Link
            href="/"
            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            Volver al inicio
          </Link>
        }
      />
    </div>
  );
}
