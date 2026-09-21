"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Props {
  email: string;
  password: string;
}

export async function logIn(form: Props) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(form);

  if (!error) redirect("/");

  return error;
}

export async function logOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}
