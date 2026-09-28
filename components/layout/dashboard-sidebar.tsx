import {
  Home,
  UserCircle2,
  Layers,
  FileSpreadsheet,
  BookOpen,
  Plus,
} from "lucide-react";
import { NavButton } from "../ui/navlink";

export const DashboardSideBar = async () => {
  const navItems = [
    {
      id: "dashboard",
      label: "Home",
      icon: <Home className="w-4 h-4" aria-hidden="true" />,
      href: "/",
      badge: null,
    },
    {
      id: "profile",
      label: "Tu Información",
      icon: <UserCircle2 className="w-4 h-4" aria-hidden="true" />,
      badge: null,
      href: "/profile",
    },
    {
      id: "presupuestos" as const,
      label: "Presupuestos",
      icon: <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />,
      badge: null,
      href: "#",
    },

    {
      id: "plantillas" as const,
      label: "Plantillas",
      icon: <Layers className="w-4 h-4" aria-hidden="true" />,
      isActive: false,
      badge: "Próximamente",
      href: "#",
    },
    {
      id: "recursos" as const,
      label: "Recursos",
      icon: <BookOpen className="w-4 h-4" aria-hidden="true" />,
      isActive: false,
      badge: "Próximamente",
      href: "#",
    },
  ];

  return (
    <aside
      id="main-app-sidebar"
      aria-label="Navegación principal de la aplicación"
      className="w-64 shrink-0 hidden md:block"
    >
      <div className="sticky top-28 space-y-6">
        {/* Primary CTA button */}
        <button
          id="sidebar-new-budget-btn"
          type="button"
          //   onClick={onNewBudget}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm px-4 py-3 rounded-xl shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Nuevo presupuesto</span>
        </button>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map(({ id, badge, icon, href, label }) => (
            <NavButton badge={badge ?? ""} href={href} label={label} key={id}>
              {icon}
            </NavButton>
          ))}
        </nav>

        {/* Tip Box for Argentine Freelancers */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
            Validez recomendada
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            En Argentina se recomienda cotizar con plazo de{" "}
            <strong>10 a 15 días</strong> corridos para resguardar costos frente
            a variaciones de precios.
          </p>
        </div>
      </div>
    </aside>
  );
};
