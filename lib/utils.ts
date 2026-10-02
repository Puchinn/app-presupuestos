import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, setDefaultOptions } from "date-fns";
import { es } from "date-fns/locale";

setDefaultOptions({
  locale: es,
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | null) {
  return date ? format(date, "PP") : "Sin Fecha";
}

export function getFileSizeInMB(file: File): number {
  return file.size / (1024 * 1024);
}

const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

export function getPublicStorageUrl(path: string | null) {
  if (!path) return ""; // fallback
  // Data URLs (versión de prueba T-007) y URLs absolutas se usan tal cual;
  // solo los paths relativos del bucket se prefijan.
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  return `${SUPABASE_STORAGE_URL}/public_images/${path}`;
}
