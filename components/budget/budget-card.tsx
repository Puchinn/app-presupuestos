"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MoreVertical,
  Eye,
  Trash2,
  Briefcase,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { deleteBudget } from "@/actions/budget.actions";
import { Budget } from "@/types/budget";
import { es } from "date-fns/locale";
import { format, setDefaultOptions } from "date-fns";

setDefaultOptions({
  locale: es,
});

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getClientInitials = (name: string): string => {
  if (!name) return "CL";
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface BudgetCardProps {
  budget: Budget;
  onView?: (id: string) => void;
}

const statusVariants: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Borrador",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  sent: {
    label: "Enviado",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  approved: {
    label: "Aprobado",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  rejected: {
    label: "Rechazado",
    className:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  },
};

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onView }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  console.log(budget.client_id);

  const currentStatus = statusVariants[budget.status] || {
    label: budget.status,
    className: "bg-gray-100 text-gray-800",
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteBudget(budget);
    } catch (error) {
      console.error("Error eliminando presupuesto:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const clientInitials = getClientInitials(budget.client_name);

  const formattedPrice = budget.total_price_services
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ars",
      }).format(budget.total_price_services)
    : "Sin total";

  const formatedDate = budget.dates.estimated.length
    ? format(budget.dates.estimated, "PP")
    : "";
  return (
    <>
      <Card className="relative overflow-hidden w-full max-w-sm transition-all hover:shadow-md border-border/60 group">
        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3 space-y-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-primary/20 bg-primary/5">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {clientInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-mono">
                {budget.public_code}
              </span>
              <h3 className="font-semibold text-base leading-tight truncate max-w-[140px]">
                {budget.client_name || "Cliente sin nombre"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/edit/${budget.id}`}>
              <div className="relative flex items-center justify-center h-8 w-12 rounded-md border border-border/50 bg-white p-1 shadow-2xs overflow-hidden">
                <ExternalLink className="h-4 w-4 text-muted-foreground/60 transition-transform hover:scale-125" />
              </div>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Menú de opciones</span>
                  </Button>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  render={
                    <Link
                      className="flex items-center w-full"
                      href={`/edit/${budget.id}`}
                    >
                      <Eye className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Ver detalles</span>
                    </Link>
                  }
                ></DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-3 pt-0">
          <div className="flex items-center justify-between border-y border-border/50 py-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Servicios</span>
            </div>
            <span className="font-medium">
              {budget.services?.length || 0} ítems
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Est. Entrega</span>
            </div>
            <span className="font-medium text-xs">
              {formatedDate || "No fijada"}
            </span>
          </div>

          <div className="pt-1 flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
              Monto Total
            </span>
            <div className="flex items-center font-bold text-lg text-primary">
              {formattedPrice}
            </div>
          </div>
        </CardContent>

        <CardFooter className="relative z-10 flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <Badge
            variant="outline"
            className={`border-none ${currentStatus.className}`}
          >
            {currentStatus.label}
          </Badge>
          {budget.participants.length > 0 && (
            <span className="text-muted-foreground">
              {budget.participants.length} participante(s)
            </span>
          )}
        </CardFooter>
      </Card>

      {/* Diálogo de Confirmación para Borrar */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              presupuesto{" "}
              <strong className="font-mono text-foreground">
                {budget.public_code}
              </strong>{" "}
              asociado a {budget.client_name || "Cliente sin nombre"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Eliminando...</span>
                </div>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
