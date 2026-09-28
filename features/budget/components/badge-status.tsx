import React from "react";

import { FileEdit, Send, CheckCircle2, XCircle, FileClock } from "lucide-react";
import type { SentStatus } from "../types";

interface BadgeProps {
  status: SentStatus;
  className?: string;
  size?: "sm" | "md";
}

export const BadgeStatus: React.FC<BadgeProps> = ({
  status,
  className = "",
  size = "md",
}) => {
  const config = {
    draft: {
      label: "Borrador",
      bg: "bg-slate-100 border-slate-300 text-slate-700",
      icon: (
        <FileEdit
          className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}
          aria-hidden="true"
        />
      ),
    },
    sent: {
      label: "Enviado",
      bg: "bg-sky-50 border-sky-300 text-sky-800",
      icon: (
        <Send
          className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}
          aria-hidden="true"
        />
      ),
    },
    approved: {
      label: "Aprobado",
      bg: "bg-emerald-50 border-emerald-300 text-emerald-800",
      icon: (
        <CheckCircle2
          className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}
          aria-hidden="true"
        />
      ),
    },
    rejected: {
      label: "Rechazado",
      bg: "bg-rose-50 border-rose-300 text-rose-800",
      icon: (
        <XCircle
          className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}
          aria-hidden="true"
        />
      ),
    },
    pending: {
      label: "Sin Enviar",
      bg: "bg-yellow-50 border-yellow-300 text-yellow-800",
      icon: (
        <FileClock
          className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}
          aria-hidden="true"
        />
      ),
    },
  }[status];

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2 py-0.5 gap-1"
      : "text-xs font-medium px-2.5 py-1 gap-1.5";

  return (
    <span
      id={`status-badge-${status}`}
      className={`inline-flex items-center rounded-md border ${config.bg} ${sizeClasses} whitespace-nowrap ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
