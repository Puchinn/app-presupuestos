import React, { PropsWithChildren } from "react";
import {
  ChevronLeft,
  Home,
  User,
  FileText,
  Calculator,
  LogOut,
  Folders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NavLink } from "../ui/navlink";
import { getUserInfo } from "@/actions/user.actions";

import { logOut } from "@/actions/auth";

export async function DashboardLayout({ children }: PropsWithChildren) {
  const user = await getUserInfo();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/profile", label: "Tu Informacion", icon: User },
    { href: "#", label: "Plantillas", icon: FileText },
    { href: "#", label: "Presupuestos", icon: Calculator },
    { href: "#", label: "Recursos", icon: Folders },
  ];

  return (
    <div className="flex w-full h-screen flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="flex h-16 items-center gap-3 border-b px-6">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="border bg-muted">B</AvatarFallback>
        </Avatar>
        <span className="text-lg font-medium">
          Hola {user.full_name.split(" ")[0]}
        </span>
      </header>

      <div className="flex  flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex  w-64 flex-col justify-between border-r p-4">
          <div className="space-y-4">
            {/* Collapse / Back Button */}
            <div className="flex justify-end">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.label} label={item.label} href={item.href}>
                    <Icon className="h-4 w-4" />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={logOut}
            className="justify-start gap-2 w-full text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesion</span>
          </Button>
        </aside>

        {/* Main Content Area */}
        <div className="scroll-auto overflow-y-scroll w-full">{children}</div>
      </div>
    </div>
  );
}
