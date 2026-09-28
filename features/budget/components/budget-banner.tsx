import Link from "next/link";
import { CheckCircle2, FileEdit, Plus, Send } from "lucide-react";
import { formatARS } from "@/lib/utils";
import { getUserBudgets } from "../actions";
import { getUser } from "@/features/user/actions";

export async function BudgetBanner() {
  const user = await getUser();
  const budgets = await getUserBudgets();

  const counts = budgets.reduce(
    (acc, cur) => {
      return {
        sent: acc.sent + (cur.sent_status === "sent" ? 1 : 0),
        approved:
          acc.approved +
          (cur.sent_status === "approved"
            ? (cur.total_price_services ?? 0)
            : 0),
        rejected: acc.rejected + (cur.sent_status === "rejected" ? 1 : 0),
        draft: acc.draft + (cur.sent_status === "draft" ? 1 : 0),
        issued: acc.issued + (cur.status === "issued" ? 1 : 0),
      };
    },
    {
      sent: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      issued: 0,
    },
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Panel de Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Hola, {user.full_name.trim().split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tenés{" "}
            <strong className="text-slate-900 font-semibold">
              {counts.sent} presupuestos
            </strong>{" "}
            en negociación y{" "}
            <strong className="text-slate-900 font-semibold">
              {counts.draft} en borrador
            </strong>
            .
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            id="dashboard-new-budget-cta"
            type="button"
            href="/new-budget"
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>+ Nuevo presupuesto</span>
          </Link>
        </div>
      </div>

      {/* Quick KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">
            Total Cotizaciones
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
            {budgets.length}
          </span>
        </div>

        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
          <span className="text-xs font-semibold text-emerald-800  flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Aprobados este mes
          </span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block font-mono">
            {formatARS(counts.approved)}
          </span>
        </div>

        <div className="bg-sky-50/60 rounded-xl p-4 border border-sky-200">
          <span className="text-xs font-semibold text-sky-800  flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-sky-600" />
            Enviados / En espera
          </span>
          <span className="text-2xl font-black text-sky-900 mt-1 block font-mono">
            {counts.sent}
          </span>
        </div>

        <div className="bg-slate-100/70 rounded-xl p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-700  flex items-center gap-1.5">
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            Borradores activos
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
            {counts.draft}
          </span>
        </div>
      </div>
    </div>
  );
}
