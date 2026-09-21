"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { createTextItem } from "@/actions/text_items.actions";

const MAX_LENGTH_FOR_INPUT = 100;

export function CreateTextItem() {
  const [isCreating, setIsCreating] = useState(false);
  const [text, setText] = useState("");

  const isLongText = text.length > MAX_LENGTH_FOR_INPUT;

  const handleSave = () => {
    if (text.trim()) {
      createTextItem(text.trim());
      setText("");
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setText("");
    setIsCreating(false);
  };

  const commonInputClasses =
    "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-black";

  if (!isCreating) {
    return (
      <button
        type="button"
        onClick={() => setIsCreating(true)}
        className="flex items-center justify-center gap-2 w-full p-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Crear ítem
      </button>
    );
  }

  return (
    <div className="flex border border-blue-200 bg-blue-50/30 rounded-md justify-between p-2 items-start gap-2">
      <div className="flex-1 min-w-0 flex items-start gap-1">
        {!isLongText ? (
          <input
            type="text"
            placeholder="Escribí tu texto acá..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`${commonInputClasses} flex-1`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
        ) : (
          <textarea
            placeholder="Escribí tu texto acá..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`${commonInputClasses} flex-1 resize-y`}
            autoFocus
            rows={Math.max(3, Math.min(8, text.split("\n").length + 1))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") handleCancel();
            }}
          />
        )}

        <div
          className={`flex gap-1 ${isLongText ? "flex-col mt-1" : "items-center"}`}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim()}
            className="p-1 text-green-600 hover:bg-green-100 disabled:opacity-40 rounded transition-colors"
            title="Guardar"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
