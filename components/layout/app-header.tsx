import { FileText, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { getUser, logOut } from "@/features/user/actions";

export const AppHeader = async () => {
  const userResult = await getUser();
  // Sin sesión o perfil ilegible se omite el saludo: es solo decorativo
  // (degradación aceptada en T-009); el resto del header sigue funcionando.
  const user = userResult.ok ? userResult.data : null;

  return (
    <header
      id="main-app-header"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link
            type="button"
            href="/"
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded-lg p-1 group"
            aria-label="Ir al inicio de app-presupuestos"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-xs group-hover:bg-blue-700 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-bold text-slate-900 text-base leading-none block tracking-tight">
                Dyman Cheto
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-tight">
                Emisión Profesional • AR
              </span>
            </div>
          </Link>
        </div>

        {/* User profile & greeting */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-500 block">
                Buenos Dias,{" "}
                <strong className="text-slate-900 font-semibold">
                  {user.full_name}
                </strong>
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                CUIT: {}
              </span>
            </div>
          )}

          <Link
            type="button"
            href="/profile"
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none border border-transparent hover:border-slate-200 transition-all"
            title="Ir a Tu Información / Perfil"
            aria-label="Ver perfil y datos fiscales"
          >
            {user && user.avatar_url.length ? (
              <img
                src={user.avatar_url}
                alt={`Avatar de ${user.full_name}`}
                className="w-9 h-9 rounded-lg object-cover border border-slate-300 shadow-2xs"
              />
            ) : (
              <Avatar render={<User className="w-6 h-6 text-slate-500 " />} />
            )}
          </Link>

          <button
            type="button"
            onClick={logOut}
            className="text-slate-500 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:outline-none cursor-pointer transition-colors"
            title="Cerrar sesión"
            aria-label="Cerrar sesión del sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
