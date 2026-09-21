"use client";

import { AlertCircle, Check, CloudOff, Loader2 } from "lucide-react";
import { useAppContext } from "@/app/edit/[id]/provider";

export function SaveStatusIndicator() {
  const { status } = useAppContext();

  switch (status) {
    case "saving":
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
          Guardando cambios...
        </span>
      );
    case "saved":
      return (
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <Check className="h-3.5 w-3.5" />
          Guardado en la nube
        </span>
      );
    case "unsaved":
      return (
        <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
          <CloudOff className="h-3.5 w-3.5" />
          Cambios sin guardar...
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1.5 text-xs text-destructive font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          Error al guardar
        </span>
      );
  }
}
