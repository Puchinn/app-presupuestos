"use client";

// Los error boundaries deben ser Client Components.
import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

interface Props {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function DashboardError({ error, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-8">
      <ErrorState
        title="No se pudo cargar el panel"
        description={
          <>
            Algo salió mal al mostrar esta sección. Probá de nuevo en un
            momento.
            {error.digest && (
              <span className="block mt-1 text-xs font-mono text-slate-400">
                Código: {error.digest}
              </span>
            )}
          </>
        }
        onRetry={retry}
      />
    </div>
  );
}
