"use client";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { AlertCircle, StickyNoteCheck } from "lucide-react";
import { emitBudget } from "@/actions/budget.actions";
import { useAppContext } from "./provider";
import { useState } from "react";

export function EmitirBtn() {
  const { budget, methods } = useAppContext();
  const [open, setOpen] = useState(false);

  const { success, error } = methods.checkEmpty();

  const onConfirm = async () => {
    const updatedBudget = await emitBudget(budget);
    if (!updatedBudget) return;
    methods.setBudget(updatedBudget);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <AlertDialogTrigger>
          <TooltipTrigger
            render={
              <div className="flex hover:bg-slate-50 p-1 rounded-md gap-x-1 items-center">
                <StickyNoteCheck className="w-4 h-4" />
                <span>Emitir</span>
              </div>
            }
          ></TooltipTrigger>
          <TooltipContent>
            Asigna número oficial y bloquea edición
          </TooltipContent>
        </AlertDialogTrigger>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Emitir presupuesto definitivo?</AlertDialogTitle>
          {!success && (
            <div className="my-2">
              <span className="text-lg">Todavia tenes campos vacios:</span>
              {error.issues.map(({ message }, i) => (
                <div
                  className="flex text-sm text-black/75 items-center gap-2"
                  key={i}
                >
                  <AlertCircle className="w-4 text-blue-600 h-4" /> {message}
                </div>
              ))}
            </div>
          )}

          <AlertDialogDescription>
            Esta acción generará el número oficial de folio (PRES-2026-XXXX),
            cerrará el estado de borrador y el documento ya no podrá ser
            modificado. ¿Deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Revisar de nuevo</AlertDialogCancel>
          <AlertDialogAction variant={"default"} onClick={onConfirm}>
            Sí, emitir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
