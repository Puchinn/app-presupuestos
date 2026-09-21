"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Ellipsis, Check, X } from "lucide-react";
import { updateTextItem, deleteTextItem } from "@/actions/text_items.actions";

import { useAppContext } from "@/app/edit/[id]/provider";
import type { TextItem } from "@/types/resources";

interface Props {
  text: TextItem;
}

// Límite de caracteres para decidir cuándo usar un textarea en lugar de input
const MAX_LENGTH_FOR_INPUT = 100;

export function TextItem({ text }: Props) {
  const { content } = text;
  const { methods } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  const isLongText = content.length > MAX_LENGTH_FOR_INPUT;

  const handleSave = async () => {
    if (editText.trim()) {
      await updateTextItem({
        ...text,
        content: editText,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTextItem(text.id);
  };

  // Clases compartidas para el input y el textarea
  const commonInputClasses =
    "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-black";

  return (
    <div className="flex border border-gray-200 rounded-md justify-between p-2 items-start text-gray-900 gap-2">
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-start gap-1">
            {/* Si el texto es corto, usamos un input de una línea */}
            {!isLongText && (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className={`${commonInputClasses} flex-1`}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
              />
            )}

            {/* Si el texto es largo, usamos un textarea que se banca multilínea */}
            {isLongText && (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className={`${commonInputClasses} flex-1 resize-y field-sizing-content`} // resize-y permite agrandarlo verticalmente
                autoFocus
                rows={Math.max(
                  3,
                  Math.min(10, editText.split("\n").length + 1),
                )} // Altura dinámica simple
                onKeyDown={(e) => {
                  // Con Shift+Enter hace salto de línea, con Enter solo guarda
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // Evita el salto de línea por defecto
                    handleSave();
                  }
                  if (e.key === "Escape") handleCancel();
                }}
              />
            )}

            {/* Botones de acción, alineados arriba si es textarea */}
            <div
              className={`flex gap-1 ${isLongText ? "flex-col mt-1" : "items-center"}`}
            >
              <button
                type="button"
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Guardar"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p
              className={`font-black text-left ${isExpanded ? "" : "truncate"}`}
            >
              {content}
            </p>

            {isLongText && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium"
              >
                {isExpanded ? (
                  <>
                    Ver menos <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Ver todo <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {!isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 p-1 hover:bg-gray-100 rounded">
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => methods.addDetailText(content)}>
                Usar en Detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => methods.addConditions(content)}>
                Usar en T&C
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
