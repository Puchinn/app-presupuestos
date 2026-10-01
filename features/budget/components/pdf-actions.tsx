"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Eye, Loader2 } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Budget } from "@/features/budget/types";

const MENSAJE_ERROR = "No se pudo generar el archivo.";

// Carga perezosa: @react-pdf/renderer entra al bundle solo cuando el usuario
// usa estos botones, nunca en el render del servidor.
async function generarPdf(budget: Budget) {
  const [{ pdf }, { BudgetPdf, pdfFileName }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./budget-pdf"),
  ]);

  const blob = await pdf(<BudgetPdf budget={budget} />).toBlob();
  return { blob, fileName: pdfFileName(budget) };
}

// Igual que el botón de la referencia (docs/reference/preview.txt):
// blob → iframe invisible → impresión → limpieza a los 5 s.
function mostrarEnImpresion(blob: Blob) {
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;

  document.body.appendChild(iframe);

  iframe.onload = () => {
    try {
      iframe.contentWindow?.print();
    } catch (error) {
      console.error("Error al intentar imprimir desde el iframe", error);
    }

    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 5000);
  };
}

function descargar(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface Props {
  budget: Budget;
}

export function PdfActions({ budget }: Props) {
  const [generandoVistaPrevia, setGenerandoVistaPrevia] = useState(false);
  const [generandoDescarga, setGenerandoDescarga] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (errorTimer.current) clearTimeout(errorTimer.current);
    },
    [],
  );

  const mostrarError = (mensaje: string) => {
    setError(mensaje);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setError(null), 3000);
  };

  const trabajando = generandoVistaPrevia || generandoDescarga;

  const handleVistaPrevia = async () => {
    setGenerandoVistaPrevia(true);
    setError(null);
    try {
      const { blob } = await generarPdf(budget);
      mostrarEnImpresion(blob);
    } catch (err) {
      console.error("Error al generar la vista previa del PDF:", err);
      mostrarError(MENSAJE_ERROR);
    } finally {
      setGenerandoVistaPrevia(false);
    }
  };

  const handleDescarga = async () => {
    setGenerandoDescarga(true);
    setError(null);
    try {
      const { blob, fileName } = await generarPdf(budget);
      descargar(blob, fileName);
    } catch (err) {
      console.error("Error al descargar el PDF:", err);
      mostrarError(MENSAJE_ERROR);
    } finally {
      setGenerandoDescarga(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {error ? (
        <span
          role="alert"
          className="text-xs font-semibold text-rose-600 max-w-[180px] truncate"
          title={error}
        >
          {error}
        </span>
      ) : null}

      <button
        id="editor-preview-btn"
        type="button"
        onClick={handleVistaPrevia}
        disabled={trabajando}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {generandoVistaPrevia ? (
          <Loader2
            className="w-4 h-4 animate-spin text-slate-500"
            aria-hidden="true"
          />
        ) : (
          <Eye className="w-4 h-4 text-slate-500" aria-hidden="true" />
        )}
        <span>
          {generandoVistaPrevia ? "Generando vista previa…" : "Vista previa"}
        </span>
      </button>

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              id="editor-download-btn"
              type="button"
              onClick={handleDescarga}
              disabled={trabajando}
              aria-label="Descargar archivo"
              className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generandoDescarga ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          }
        />
        <TooltipContent>Descargar archivo</TooltipContent>
      </Tooltip>
    </div>
  );
}
