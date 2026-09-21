"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadPublicImage(file: File) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.storage
    .from("public_images")
    .upload(`/${user?.id}/${file.name}`, file, {
      upsert: true,
    });

  if (error) throw `Ocurrio un error al subir el archivo: ${error.message}`;

  return data;
}

export async function getPublicUrl(fullPath: string) {
  const supabase = await createClient();

  if (!fullPath) return "";
  if (!fullPath.length) return "";
  if (fullPath.startsWith("http")) return fullPath;

  return supabase.storage.from("public_images").getPublicUrl(fullPath).data
    .publicUrl;
}
