"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Minus, Plus } from "lucide-react"

interface EditableQuantityProps {
  value: number
  onChange: (value: number) => void
  className?: string
  /** Presupuesto emitido: muestra el valor sin controles de edición. */
  disabled?: boolean
}

export function EditableQuantity({
  value,
  onChange,
  className = "",
  disabled = false,
}: EditableQuantityProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value.toString())
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    const parsed = parseInt(editValue, 10)
    onChange(isNaN(parsed) || parsed < 1 ? 1 : parsed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false)
      const parsed = parseInt(editValue, 10)
      onChange(isNaN(parsed) || parsed < 1 ? 1 : parsed)
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue(value.toString())
    }
  }

  if (disabled) {
    return <span className={`tabular-nums ${className}`}>{value}</span>
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={1}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-14 bg-transparent border-b border-foreground/20 outline-none text-center tabular-nums transition-colors focus:border-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
      />
    )
  }

  return (
    <div className={`flex items-center gap-1 group ${className}`}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="print:hidden opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        aria-label="Reducir cantidad"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span
        onClick={() => setIsEditing(true)}
        className="cursor-pointer tabular-nums min-w-[2ch] text-center border-b border-transparent hover:border-foreground/20 transition-colors"
        title="Click para editar"
      >
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="print:hidden opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}
