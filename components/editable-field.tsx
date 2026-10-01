"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  /** Presupuesto emitido: renderiza el valor sin posibilidad de editar. */
  disabled?: boolean;
}

export function EditableField({
  value,
  onChange,
  className = "",
  multiline = false,
  placeholder = "Editar...",
  disabled = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    const setEditable = () => {
      setEditValue(value);
    };

    setEditable();
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      setIsEditing(false);
      onChange(editValue);
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (disabled) {
    return (
      <span className={`inline-block ${className}`}>{value || placeholder}</span>
    );
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-transparent border-b border-foreground/20 outline-none resize-none transition-colors print:resize-none focus:border-foreground/50 ${className}`}
          rows={3}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-transparent border-b print:resize-none border-foreground/20 outline-none transition-colors focus:border-foreground/50 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer border-b border-transparent hover:border-foreground/20 transition-colors inline-block ${className}`}
      title="Click para editar"
    >
      {value || placeholder}
    </span>
  );
}
