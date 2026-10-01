import { BudgetProvider } from "@/features/budget/context/context-provider";
import { SideBar } from "@/features/budget/components/editor-sidebar/sidebar";
import { HeaderStatus } from "@/features/budget/components/header-status";
import { BudgetWrapper } from "@/features/budget/components/budget-wrapper";
import { getById } from "@/features/budget/actions";
import { getServices } from "@/features/services-catalog/actions";
import { getUserTexts } from "@/features/text-item/actions";
import { getClients } from "@/features/clients/actions";
import { ErrorState } from "@/components/ui/error-state";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const budgetResult = await getById(id);
  const services = await getServices();
  const texts = await getUserTexts();
  const clients = await getClients();

  // No existe, sin permiso o no se pudo leer: `getById` ya distingue el caso.
  if (!budgetResult.ok) {
    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState
          title="No pudimos abrir el presupuesto"
          description={budgetResult.error}
          action={
            <Link
              href="/"
              className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              Volver al inicio
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <BudgetProvider budget={budgetResult.data}>
      <div className="max-w-7xl space-y-8 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeaderStatus />
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <SideBar services={services} texts={texts} clients={clients} />
          <div className="w-full p-4 border rounded-xl">
            <div className="w-full rounded-xl overflow-hidden">
              <BudgetWrapper />
            </div>
          </div>
        </div>
      </div>
    </BudgetProvider>
  );
}
