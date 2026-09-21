import { getUserInfo } from "@/actions/user.actions";
import { Home } from "lucide-react";
import { EmitirBtn } from "./emitir";
import { SaveStatusIndicator } from "@/components/budget/status-indicator";
import { TruePreviewButton } from "./truePREVIEW";

import Link from "next/link";

export async function Header() {
  const { full_name } = await getUserInfo();

  return (
    <header className="flex print:hidden sticky top-0 h-16 bg-white z-20 items-center gap-3 border-b px-6">
      <Link className="flex flex-col items-center justify-center" href={"/"}>
        <Home className="w-10 border p-2 border-gray-100 rounded-md shadow text-gray-600 h-10" />
      </Link>
      <span className="text-lg font-medium">
        Hola {full_name.split(" ")[0]}
      </span>
      <EmitirBtn />
      <TruePreviewButton />
      <SaveStatusIndicator />
    </header>
  );
}
