"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description: React.ReactNode;
  /** Muestra el botón "Reintentar". Por defecto sí. */
  retry?: boolean;
  /**
   * Reintento propio (ej. el `retry()` de un `error.tsx`). Si no se pasa, el
   * botón usa `router.refresh()`.
   */
  onRetry?: () => void;
  /** Acción secundaria (ej. un Link "Volver al inicio"). */
  action?: React.ReactNode;
  /** Variante compacta y horizontal, para uso dentro de tarjetas (banner). */
  compact?: boolean;
  className?: string;
}

export function ErrorState({
  title,
  description,
  retry = true,
  onRetry,
  action,
  compact = false,
  className = "",
}: ErrorStateProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRetry = () =>
    startTransition(() => {
      if (onRetry) onRetry();
      else router.refresh();
    });

  if (compact) {
    return (
      <div
        role="alert"
        className={`flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl ${className}`}
      >
        <AlertTriangle
          className="w-4 h-4 shrink-0 text-rose-600 mt-0.5"
          aria-hidden="true"
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
          <p className="text-sm font-semibold text-rose-700 leading-snug">
            {description}
          </p>
          {retry && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={isPending}
              className="text-xs font-semibold text-rose-800 underline hover:text-rose-900 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Reintentando..." : "Reintentar"}
            </button>
          )}
          {action}
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`bg-white rounded-2xl border border-rose-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs space-y-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          {title ?? "No se pudo cargar la información"}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>

      {(retry || action) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {action}
          {retry && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={isPending}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-60 cursor-pointer"
            >
              {isPending ? "Reintentando..." : "Reintentar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
