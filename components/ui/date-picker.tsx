"use client";

import * as React from "react";
import { format, setDefaultOptions } from "date-fns";
import { es } from "date-fns/locale";
setDefaultOptions({ locale: es });

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  date: string;
  setDate: React.Dispatch<React.SetStateAction<Date>> | undefined;
}

export function DatePicker({ date, setDate }: Props) {
  const validData = date.length > 0 ? new Date(date) : new Date();

  return (
    <Popover>
      <PopoverTrigger
        nativeButton={false}
        render={
          <div
            data-empty={!date}
            className="font-normal cursor-pointer text-sm text-white/80 "
          >
            {date && typeof date !== "object" ? (
              <span
                className={`cursor-pointer border-b border-transparent hover:border-foreground/20 transition-colors `}
              >
                {format(date, "PP")}
              </span>
            ) : (
              <span>Seleccionar Fecha</span>
            )}
            {/* <ChevronDownIcon data-icon="inline-end" /> */}
          </div>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={validData}
          onDayClick={setDate}
          defaultMonth={validData}
        />
      </PopoverContent>
    </Popover>
  );
}
