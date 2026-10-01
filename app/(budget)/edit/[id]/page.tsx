import { BudgetProvider } from "@/features/budget/context/context-provider";
import { SideBar } from "@/features/budget/components/editor-sidebar/sidebar";
import { HeaderStatus } from "@/features/budget/components/header-status";
import { BudgetWrapper } from "@/features/budget/components/budget-wrapper";
import { getById } from "@/features/budget/actions";
import { getServices } from "@/features/services-catalog/actions";
import { getUserTexts } from "@/features/text-item/actions";
import { getClients } from "@/features/clients/actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const budgetResult = await getById(id);
  const services = await getServices();
  const texts = await getUserTexts();
  const clients = await getClients();

  // No existe o no se pudo leer (el estado de error fino queda en T-009).
  if (!budgetResult.ok) return "No se encontro el documento.";

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
