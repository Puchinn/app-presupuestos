import {
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  ImageIcon,
  Package,
  RotateCcw,
  Save,
} from "lucide-react";

interface Props {
  onSave: VoidFunction;
  onClean: VoidFunction;
  onUpdateBudget: VoidFunction;
}

export function BudgetToolbar({ onSave, onClean, onUpdateBudget }: Props) {
  const toPDF = () => {
    const title = document.title.toString();
    document.title = "Dyman Studio-Presupuesto-0001-Rodrigo Lezcano";
    window.print();
    document.title = title;
  };

  return (
    <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[960px] mx-auto px-6 py-3 flex items-center justify-between">
        <button className="border rounded-md p-2" onClick={toPDF}>
          TO PDF
        </button>

        <button onClick={onClean} className="border rounded-md p-2">
          Nuevo
        </button>

        <button onClick={onSave} className="border rounded-md p-2">
          Guardar
        </button>

        <button onClick={onUpdateBudget} className="border rounded-md p-2">
          Actualizar Presupuesto Actual
        </button>
      </div>
    </div>
  );
}
