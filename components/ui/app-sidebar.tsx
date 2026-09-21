import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { getServices, getUserTexts } from "@/actions/services.actions";

import { TabsContent } from "../sidebar/tabscontent";
import { getUserClients } from "@/actions/user.actions";

export async function AppSidebar() {
  const services = await getServices();
  const texts = await getUserTexts();
  const clients = await getUserClients();

  return (
    <Sidebar>
      <SidebarContent>
        <TabsContent
          clientsList={clients}
          serviceList={services}
          textsList={texts}
        />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
