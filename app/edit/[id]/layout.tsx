import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Header } from "./header";
import { BudgetProvider } from "./provider";
import { PropsWithChildren } from "react";
import { getById } from "@/actions/budget.actions";

interface Props extends PropsWithChildren {
  params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: Props) {
  const { id } = await params;

  const budget = await getById(id);

  if (!budget) return "Documento no encontrado.";

  return (
    <BudgetProvider budget={budget}>
      <Header />
      <SidebarProvider>
        <AppSidebar />

        <main className="w-full">
          <SidebarTrigger className="fixed" />
          {children}
        </main>
      </SidebarProvider>
    </BudgetProvider>
  );
}
