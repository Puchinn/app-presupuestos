import { getUser } from "@/features/user/actions";
import { UserInformation } from "@/features/user/components/user-information";

export default async function Page() {
  const profileResult = await getUser();

  // Estado mínimo para compilar; el estado de error fino queda en T-009.
  if (!profileResult.ok) {
    return (
      <p className="max-w-7xl mx-auto text-sm text-slate-600">
        No se pudo cargar tu perfil. Intenta de nuevo más tarde.
      </p>
    );
  }

  return <UserInformation user={profileResult.data} />;
}
