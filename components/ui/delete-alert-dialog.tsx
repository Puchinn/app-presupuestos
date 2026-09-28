"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Trash2, X, Loader2 } from "lucide-react";

interface DeleteAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
}

export function DeleteAlertDialog({
  open,
  onOpenChange,
  title,
  description = "Esta acción no se puede deshacer.",
  confirmText = "Sí, Eliminar",
  onConfirm,
}: DeleteAlertDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        render={
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full shrink-0 bg-rose-100 text-rose-700">
                  <Trash2 className="w-6 h-6" aria-hidden="true" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      {title}
                    </h2>
                    <button
                      onClick={() => onOpenChange(false)}
                      disabled={loading}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 focus-visible:outline-none disabled:opacity-50"
                      aria-label="Cerrar diálogo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>

            <AlertDialogFooter>
              <div className="bg-slate-50 px-6 py-3 flex flex-col sm:flex-row justify-end gap-3 w-full border-t border-slate-100">
                <AlertDialogCancel
                  render={
                    <button
                      disabled={loading}
                      onClick={() => onOpenChange(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 focus-visible:outline-none disabled:opacity-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  }
                />

                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-sm font-semibold rounded-lg text-white shadow-xs focus-visible:outline-none disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>{loading ? "Eliminando..." : confirmText}</span>
                </button>
              </div>
            </AlertDialogFooter>
          </div>
        }
      />
    </AlertDialog>
  );
}
