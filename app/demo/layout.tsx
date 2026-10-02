import Link from "next/link";
import { PropsWithChildren } from "react";
import { FlaskConical } from "lucide-react";

export default function DemoLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wide shrink-0">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
              Modo prueba
            </span>
            <p className="text-xs text-slate-500 truncate">
              Sin cuenta: tus datos se guardan solo en este navegador.
            </p>
          </div>
          <Link
            href="/login"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 underline shrink-0 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
          >
            Ingresar con cuenta
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
