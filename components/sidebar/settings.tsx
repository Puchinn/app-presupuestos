"use client";

import { useAppContext } from "@/app/edit/[id]/provider";
import type { BudgetSettings } from "@/types/budget";
import {
  Image as ImageIcon,
  PanelBottom,
  FileText,
  ShieldCheck,
} from "lucide-react";

const DEFAULT_SETTINGS: BudgetSettings = {
  show_logo_url: true,
  show_footer_url: true,
  show_budget_details: true,
  show_budget_conditions: true,
};

const SETTINGS_CONFIG: {
  key: keyof BudgetSettings;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "show_logo_url",
    label: "Logo",
    description: "Mostrar logo en la cabecera",
    icon: ImageIcon,
  },
  {
    key: "show_footer_url",
    label: "Pie de página",
    description: "Mostrar imagen de pie de página",
    icon: PanelBottom,
  },
  {
    key: "show_budget_details",
    label: "Detalles",
    description: "Mostrar sección de detalles",
    icon: FileText,
  },
  {
    key: "show_budget_conditions",
    label: "Condiciones",
    description: "Mostrar términos y condiciones",
    icon: ShieldCheck,
  },
];

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}

function Switch({ checked, onCheckedChange, id }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50 ${
        checked ? "bg-black" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function Settings() {
  const {
    budget,
    methods: { editBudgetInfo },
  } = useAppContext();

  const currentSettings: BudgetSettings = {
    ...DEFAULT_SETTINGS,
    ...(budget?.settings ?? {}),
  };

  const handleToggle = (key: keyof BudgetSettings, value: boolean) => {
    editBudgetInfo({
      settings: {
        ...currentSettings,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Configuración</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Controla qué secciones e información se muestran en este presupuesto.
        </p>
      </div>

      <div className="space-y-2">
        {SETTINGS_CONFIG.map(({ key, label, description, icon: Icon }) => {
          const isChecked = currentSettings[key];
          const elementId = `setting-toggle-${key}`;

          return (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-colors shadow-sm gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 p-1 rounded bg-gray-50 text-gray-600 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <label
                    htmlFor={elementId}
                    className="text-sm font-medium text-gray-800 block cursor-pointer"
                  >
                    {label}
                  </label>
                  <p className="text-xs text-gray-500 truncate">
                    {description}
                  </p>
                </div>
              </div>

              <Switch
                id={elementId}
                checked={isChecked}
                onCheckedChange={(checked) => handleToggle(key, checked)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
