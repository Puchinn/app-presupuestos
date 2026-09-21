"use client";

import { pdf } from "@react-pdf/renderer";
import { BudgetPdf } from "@/components/budget/budget-pdf";
import { useAppContext } from "./provider";
import { useState } from "react";

export function TruePreviewButton() {
  const { budget } = useAppContext();
  const [isReady, setIsReady] = useState(true);

  const handleSilentPrint = async () => {
    setIsReady(false);
    // 1. Generar el blob del PDF con @react-pdf/renderer
    const blob = await pdf(<BudgetPdf budget={budget} />).toBlob();
    setIsReady(true);
    const url = URL.createObjectURL(blob);

    // 2. Crear un iframe invisible dinámicamente
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;

    // 3. Inyectarlo temporalmente en el body de tu página actual
    document.body.appendChild(iframe);

    // 4. Esperar a que cargue el visor interno del iframe y mandar el print
    iframe.onload = () => {
      try {
        iframe.contentWindow?.print();
      } catch (error) {
        console.error("Error al intentar imprimir desde el iframe", error);
      }

      // Opcional: limpiar el iframe del DOM un ratito después de que se lance la ventana
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 5000);
    };
  };

  return (
    <button
      onClick={handleSilentPrint}
      className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
      disabled={!isReady}
    >
      {isReady ? "Vista previa" : "Generando vista previa…"}
    </button>
  );
}
