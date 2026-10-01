"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Plus, X } from "lucide-react"

interface EditableBulletListProps {
  items: string[]
  onChange: (items: string[]) => void
  /** Presupuesto emitido: muestra la lista sin edición ni borrado. */
  disabled?: boolean
}

export function EditableBulletList({ items, onChange, disabled = false }: EditableBulletListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingIndex])

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditValue(items[index])
  }

  const commitItem = (index: number, value: string, items: string[]): string[] => {
    const newItems = [...items]
    if (value.trim() === "") {
      newItems.splice(index, 1)
    } else {
      newItems[index] = value
    }
    return newItems
  }

  const finishEditing = () => {
    if (editingIndex === null) return
    const newItems = commitItem(editingIndex, editValue, items)
    onChange(newItems)
    setEditingIndex(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingIndex === null) return
    if (e.key === "Enter") {
      e.preventDefault()
      // Save current and jump to next, creating it if needed
      const newItems = commitItem(editingIndex, editValue, items)
      const nextIndex = editValue.trim() === "" ? editingIndex : editingIndex + 1
      if (nextIndex >= newItems.length) {
        newItems.push("")
      }
      onChange(newItems)
      setEditingIndex(nextIndex)
      setEditValue(newItems[nextIndex] ?? "")
    }
    if (e.key === "Escape") {
      setEditingIndex(null)
    }
    if (e.key === "Backspace" && editValue === "") {
      e.preventDefault()
      const newItems = [...items]
      newItems.splice(editingIndex, 1)
      onChange(newItems)
      const prevIndex = editingIndex - 1
      if (prevIndex >= 0) {
        setEditingIndex(prevIndex)
        setEditValue(newItems[prevIndex])
      } else {
        setEditingIndex(null)
      }
    }
  }

  const addItem = () => {
    const newItems = [...items, ""]
    onChange(newItems)
    setEditingIndex(newItems.length - 1)
    setEditValue("")
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  if (disabled) {
    return (
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-2.5 text-sm text-muted-foreground"
          >
            <span className="mt-[8px] h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2.5 group text-sm text-muted-foreground">
          <span className="mt-[8px] h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
          {editingIndex === index ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={finishEditing}
              onKeyDown={handleKeyDown}
              placeholder="Escribi y presiona Enter para el siguiente..."
              className="flex-1 bg-transparent border-b border-foreground/20 outline-none text-sm transition-colors focus:border-foreground/50 placeholder:text-muted-foreground/30"
            />
          ) : (
            <span
              onClick={() => startEditing(index)}
              className="flex-1 cursor-pointer hover:text-foreground transition-colors"
            >
              {item}
            </span>
          )}
          <button
            onClick={() => removeItem(index)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-foreground"
            aria-label="Eliminar detalle"
          >
            <X className="h-3 w-3" />
          </button>
        </li>
      ))}
      <li>
        <button
          onClick={addItem}
          className="print:hidden flex items-center gap-1.5 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-2"
        >
          <Plus className="h-3 w-3" />
          Agregar detalle
        </button>
      </li>
    </ul>
  )
}
