"use client";

import { useState } from "react";
import type { ServiceListResult } from "@/features/services-catalog/types";
import type { TextListResult } from "@/features/text-item/types";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { TabInfo } from "./tab-info";
import { TabServices } from "./tab-services";
import { TabClient } from "./tab-client";
import { TabTexts } from "./tab-texts";
import { TabSettings } from "./tab-settings";

interface SideBarProps {
  services: ServiceListResult;
  texts: TextListResult;
}

type Tab = "info" | "servicios" | "clientes" | "textos" | "configuracion";

interface TabItemMenu {
  id: Tab;
  label: string;
  icon: React.ReactElement;
}

const menuItems: TabItemMenu[] = [
  {
    id: "info",
    label: "Info & Checklist",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "servicios",
    label: "Servicios & Catálogo",
    icon: <Briefcase className="w-4 h-4" />,
  },
  {
    id: "clientes",
    label: "Datos del Cliente",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "textos",
    label: "Textos & Alcance",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: <Settings className="w-4 h-4" />,
  },
];

export function SideBar({ services, texts }: SideBarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs transition-all duration-300 shrink-0 w-full ${
        collapsed ? "lg:w-16" : "lg:w-80"
      }`}
    >
      <Toogle collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="p-2 border-b border-slate-100 grid grid-cols-5 lg:flex lg:flex-col gap-1">
        {menuItems.map((tab) => (
          <NavButton
            key={tab.id}
            tab={tab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setCollapsiedBar={setCollapsed}
            isCollapsed={collapsed}
          />
        ))}
      </div>

      {/* Sidebar Tab Content Panels */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Tab 1: INFO & CHECKLIST (Onboarding for new budgets) */}
          {activeTab === "info" && <TabInfo />}

          {/* Tab 2: SERVICIOS & CATALOG PRESETS */}
          {activeTab === "servicios" && <TabServices services={services} />}

          {/* Tab 3: CLIENTES */}
          {activeTab === "clientes" && <TabClient />}

          {/* Tab 4: TEXTOS & ALCANCE */}
          {activeTab === "textos" && <TabTexts texts={texts} />}

          {/* Tab 5: CONFIGURACIÓN COMERCIAL */}
          {activeTab === "configuracion" && <TabSettings />}
        </div>
      )}
    </div>
  );
}

function Toogle({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}) {
  return (
    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
      {!collapsed && (
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Herramientas del Editor
        </span>
      )}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ml-auto"
        title={collapsed ? "Expandir panel lateral" : "Colapsar panel lateral"}
        aria-label={
          collapsed ? "Expandir panel lateral" : "Colapsar panel lateral"
        }
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

interface NavButtoProps {
  tab: TabItemMenu;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  setCollapsiedBar: (value: boolean) => void;
  isCollapsed: boolean;
}

function NavButton({
  tab,
  activeTab,
  setActiveTab,
  setCollapsiedBar,
  isCollapsed,
}: NavButtoProps) {
  return (
    <button
      key={tab.id}
      type="button"
      onClick={() => {
        setActiveTab(tab.id);
        if (isCollapsed) setCollapsiedBar(false);
      }}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
        activeTab === tab.id
          ? "bg-blue-50 text-blue-800 border border-blue-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
      }`}
      title={tab.label}
    >
      <span
        className={activeTab === tab.id ? "text-blue-700" : "text-slate-400"}
      >
        {tab.icon}
      </span>
      {!isCollapsed && <span className="truncate">{tab.label}</span>}
    </button>
  );
}
