"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"

interface EditablePriceProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function EditablePrice({ value, onChange, className = "" }: EditablePriceProps) {
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
    const parsed = parseFloat(editValue)
    onChange(isNaN(parsed) ? 0 : parsed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false)
      const parsed = parseFloat(editValue)
      onChange(isNaN(parsed) ? 0 : parsed)
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue(value.toString())
    }
  }

  const formatPrice = (num: number) => {
    return num.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-foreground">$</span>
        <input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-28 bg-transparent border-b border-foreground/20 outline-none text-right transition-colors focus:border-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer border-b border-transparent hover:border-foreground/20 transition-colors font-medium tabular-nums ${className}`}
      title="Click para editar"
    >
      $ {formatPrice(value)}
    </span>
  )
}
