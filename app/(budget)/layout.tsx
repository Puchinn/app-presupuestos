import { AppHeader } from "@/components/layout/app-header";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
