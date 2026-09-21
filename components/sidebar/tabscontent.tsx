"use client";

import React, { useState } from "react";
import { Folder, Text, Users, Info, Settings as ISettings } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import { ServicesList } from "./services";
import { NavButton } from "../ui/navbutton";
import { TextsList } from "./texts";
import { ClientsList } from "./clients";
import { Service, TextItem } from "@/types/resources";
import { Client } from "@/types/user";
import { Information } from "./information";
import { Settings } from "./settings";

type Tab = "info" | "texts" | "services" | "clients" | "settings";

interface TAB {
  title: string;
  icon: React.ElementType;
  active?: boolean;
  tab: Tab;
}

const TABS: TAB[] = [
  {
    title: "Info",
    icon: Info,
    active: true,
    tab: "info",
  },
  {
    title: "Textos",
    icon: Text,
    tab: "texts",
  },
  {
    title: "Servicios",
    icon: Folder,
    tab: "services",
  },
  {
    title: "Clientes",
    icon: Users,
    tab: "clients",
  },
  {
    title: "Confi...",
    icon: ISettings,
    tab: "settings",
  },
];

interface Props {
  serviceList: Service[];
  textsList: TextItem[];
  clientsList: Client[];
}

export function TabsContent({ textsList, serviceList, clientsList }: Props) {
  const { open, setOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const setTab = (tab: Tab) => {
    if (!open) {
      setOpen(true);
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex mt-2">
      <div className="max-w-max border-r h-full px-1">
        {TABS.map((menu) => (
          <NavButton
            key={menu.title}
            open={open}
            Icon={menu.icon}
            label={menu.title}
            isActive={activeTab === menu.tab}
            onClick={() => setTab(menu.tab)}
          />
        ))}
      </div>
      <div className="px-2 max-h-[calc(100svh-64px)] overflow-y-auto w-full">
        {activeTab === "info" && <Information />}
        {activeTab === "texts" && <TextsList texts={textsList} />}
        {activeTab === "services" && <ServicesList services={serviceList} />}
        {activeTab === "clients" && <ClientsList clientsList={clientsList} />}
        {activeTab === "settings" && <Settings />}
      </div>
    </div>
  );
}
