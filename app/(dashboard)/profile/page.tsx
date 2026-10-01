import { getUser } from "@/features/user/actions";
import { UserInformation } from "@/features/user/components/user-information";
import { ErrorState } from "@/components/ui/error-state";

export default async function Page() {
  const profileResult = await getUser();

  if (!profileResult.ok) {
    return <ErrorState description={profileResult.error} />;
  }

  return <UserInformation user={profileResult.data} />;
}
