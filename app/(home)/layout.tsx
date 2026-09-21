import { DashboardLayout } from "@/components/home/dashboard";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
