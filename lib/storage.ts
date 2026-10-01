"use server";

import { createClient } from "@/lib/supabase/server";

// Resultado tipado de subida de imágenes (convención de AGENTS.md).
export type UploadImageResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

export async function uploadPublicImage(
  file: File,
): Promise<UploadImageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        "No hay una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.",
    };
  }

  const { data, error } = await supabase.storage
    .from("public_images")
    .upload(`/${user.id}/${file.name}`, file, {
      upsert: true,
    });

  if (error) {
    console.error(
      "Error al subir el archivo:",
      error.message,
      error.statusCode,
    );
    return {
      ok: false,
      error: "Ocurrió un error al subir el archivo. Intenta de nuevo.",
    };
  }

  return { ok: true, path: data.path };
}
