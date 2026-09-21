"use client";

import { Button } from "./button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactElement } from "react";

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
