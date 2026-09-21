import { UserInformationView } from "@/components/profile/profile";
import { getUserProfile } from "@/actions/profile";

export default async function Page() {
  const profile = await getUserProfile();

  return <UserInformationView userData={profile} />;
}
