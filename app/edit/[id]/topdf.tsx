"use client";

import { StickyNote } from "lucide-react";
import { BudgetPdf } from "@/components/budget/budget-pdf";
import { useAppContext } from "./provider";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { X } from "lucide-react";
import { useState } from "react";

export function ToPDF() {
  const { budget } = useAppContext();
  const [showPdfModal, setShowPdfModal] = useState(false);
  //   const [instance] = usePDF({ document: <BudgetPdf budget={budget} /> });

  const handleOpenPdfTab = async () => {
    // 3. Generar el blob del PDF con @react-pdf/renderer
    const blob = await pdf(<BudgetPdf budget={budget} />).toBlob();

    const url = URL.createObjectURL(blob);
    // const printWindow = window.open(url);

    // if (printWindow) {
    //   window.print()
    //   // 3. Forzamos el print automáticamente una vez que cargue el visor
    //   //   printWindow.onload = () => {
    //   //     printWindow.print();
    //   //   };
    // }
  };

  const showModal = () => setShowPdfModal(true);
  //   const fileName = `Presupuesto-${budget.public_code || "documento"}.pdf`;

  const handleSilentPrint = async () => {
    // 1. Generar el blob del PDF con @react-pdf/renderer
    const blob = await pdf(<BudgetPdf budget={budget} />).toBlob();
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
    <div className="relative">
      {/* Tu botón para abrir el visor flotante */}
      <button
        onClick={handleSilentPrint}
        className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
      >
        PDF Preview
      </button>

      {/* {!instance.loading && (
        <a href={instance.url || ""} download={fileName}>
          Download
        </a>
      )} */}

      {/* El resto de tu editor interactivo habitual... */}

      {/* Modal / Ventana flotante estilo Canva */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-10">
          <div className="relative w-full max-w-5xl h-full max-h-[90vh] bg-background rounded-lg shadow-2xl flex flex-col overflow-hidden border border-border">
            {/* Barra superior del modal con título y botón de cierre */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Vista previa del Presupuesto
                </h3>
                <p className="text-xs text-muted-foreground">
                  ID: {budget.public_code}
                </p>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenedor del PDFViewer nativo ocupando el espacio del modal */}
            <div className="flex-1 w-full h-full bg-slate-900">
              <PDFViewer
                showToolbar={false}
                width="100%"
                height="100%"
                style={{ border: "none" }}
              >
                <BudgetPdf budget={budget} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
