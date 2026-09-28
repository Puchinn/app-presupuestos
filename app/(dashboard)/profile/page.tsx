import { getUser } from "@/features/user/actions";
import { UserInformation } from "@/features/user/components/user-information";

export default async function Page() {
  const profile = await getUser();

  return <UserInformation user={profile} />;
}
