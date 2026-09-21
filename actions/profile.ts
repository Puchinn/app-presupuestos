"use server";

import { UserInfoSchema, UserInfo } from "@/types/user";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { uploadPublicImage } from "./file";
import { getPublicUrl } from "./file";

export async function getUserProfile(): Promise<UserInfo> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const parsed_user = UserInfoSchema.parse(data);
  const avatar_url = await getPublicUrl(parsed_user.avatar_url);
  const logo_url = await getPublicUrl(parsed_user.logo_url);
  const footer_image_url = await getPublicUrl(parsed_user.footer_image_url);

  return {
    ...parsed_user,
    avatar_url,
    logo_url,
    footer_image_url,
  };
}

export async function updateUserProfile(user: UserInfo) {
  const supabase = await createClient();
  const validData = UserInfoSchema.parse(user);

  const { data, error } = await supabase
    .from("profiles")
    .update(validData)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) throw "Ocurrio un error al actualizar los datos: " + error.message;

  revalidatePath("/profile");
  return UserInfoSchema.parse(data);
}

export async function updateLogo(file: File) {
  const userProfile = await getUserProfile();
  const { path } = await uploadPublicImage(file);

  await updateUserProfile({
    ...userProfile,
    logo_url: path,
  });
}
export async function updateFooterImage(file: File) {
  const userProfile = await getUserProfile();
  const { path } = await uploadPublicImage(file);

  await updateUserProfile({
    ...userProfile,
    footer_image_url: path,
  });
}

export async function updateAvatar(file: File) {
  const userProfile = await getUserProfile();
  const { path } = await uploadPublicImage(file);

  const data = await updateUserProfile({
    ...userProfile,
    avatar_url: path,
  });

  return data;
}
