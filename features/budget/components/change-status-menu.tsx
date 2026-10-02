"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useBudgetActions } from "@/features/local/local-actions";
import { SentStatusSchema, type SentStatus } from "../types";
import { BadgeStatus } from "@/features/budget/components/badge-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Orden de trabajo del ciclo comercial; los valores vienen del schema zod.
const ESTADOS: { value: SentStatus; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "pending", label: "Sin enviar" },
  { value: "sent", label: "Enviado" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
];

interface ChangeStatusMenuProps {
  budgetId: string;
  current: SentStatus;
  /** Se invoca solo cuando la server action confirmó el cambio (ok: true). */
  onChange: (next: SentStatus) => void;
  size?: "sm" | "md";
  className?: string;
}

export function ChangeStatusMenu({
  budgetId,
  current,
  onChange,
  size = "sm",
  className,
}: ChangeStatusMenuProps) {
  const [value, setValue] = useState<SentStatus>(current);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { changeSentStatus } = useBudgetActions();

  const handleSelect = async (next: unknown) => {
    const parsed = SentStatusSchema.safeParse(next);
    if (!parsed.success || parsed.data === value || pending) return;

    setPending(true);
    setError(null);

    const result = await changeSentStatus(budgetId, parsed.data);

    setPending(false);

    if (result.ok) {
      setValue(parsed.data);
      onChange(parsed.data);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          disabled={pending}
          aria-label={`Estado actual: ${ESTADOS.find((e) => e.value === value)?.label}. Cambiar estado del presupuesto`}
          className="inline-flex items-center gap-1 rounded-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:cursor-wait"
        >
          {pending && (
            <Loader2
              className="w-3 h-3 animate-spin text-slate-400"
              aria-hidden="true"
            />
          )}
          <BadgeStatus status={value} size={size} />
          <ChevronDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom" className="min-w-40">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={value}
              onValueChange={handleSelect}
              disabled={pending}
            >
              {ESTADOS.map((estado) => (
                <DropdownMenuRadioItem
                  key={estado.value}
                  value={estado.value}
                  disabled={pending}
                >
                  {estado.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <p
          role="alert"
          className="text-[11px] font-medium text-rose-600 max-w-[220px] leading-tight"
        >
          {error}
        </p>
      )}
    </div>
  );
}
