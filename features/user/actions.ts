"use server";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserInfo, UserInfoSchema } from "./types";

interface Props {
  email: string;
  password: string;
}

export async function logIn(form: Props) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword(form);

  if (error) return error;

  redirect("/");
}

export async function logOut() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  const { data, success } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (!success) throw "No se pudo encontrar el usuario";

  return UserInfoSchema.parse(data);
}

export async function updateUser(user_data: Partial<UserInfo>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profiles")
    .update(user_data)
    .eq("id", user?.id)
    .select("*")
    .single();

  if (error) throw error;

  revalidatePath("/");

  return UserInfoSchema.parse(data);
}
