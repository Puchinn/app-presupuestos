"use client";

import { Button } from "./button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, ReactElement } from "react";

interface Props {
  label: string;
  href: string;
  children: ReactElement;
}

export function NavLink({ href, label, children }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button variant={isActive ? "default" : "outline"}>
      <Link
        href={href}
        className="justify-start flex items-center gap-2 w-full text-left"
      >
        {children}
        <span>{label}</span>
      </Link>
    </Button>
  );
}

interface NavButtonProps extends PropsWithChildren {
  label: string;
  href: string;
  badge?: string;
}

export function NavButton({ href, label, badge, children }: NavButtonProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      key={label}
      id={`nav-item-${label.toLowerCase().replace(/\s+/g, "-")}`}
      type="button"
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
        isActive
          ? "bg-blue-50 text-blue-800 font-semibold border border-blue-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
      }`}
    >
      <span className="flex items-center gap-3">
        <span className={isActive ? "text-blue-700" : "text-slate-400"}>
          {children}
        </span>
        <span>{label}</span>
      </span>

      {badge && (
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            badge === "Próximamente"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
