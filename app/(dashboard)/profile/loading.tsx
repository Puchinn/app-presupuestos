import React from "react";

// Subcomponente auxiliar para no repetir el código de los inputs falsos
const SkeletonInput = ({ fullWidth = false }: { fullWidth?: boolean }) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    {/* Label falso */}
    <div className="h-3 w-32 bg-slate-200 rounded mb-2"></div>
    {/* Caja de input falsa */}
    <div className="w-full h-[42px] bg-slate-100 border border-slate-200 rounded-lg"></div>
  </div>
);

export default function Loading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto  w-full animate-pulse">
      {/* HEADER VISUAL (Skeleton) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3 w-full max-w-lg">
          {/* Eyebrow */}
          <div className="h-3 w-40 bg-blue-100 rounded"></div>
          {/* Title */}
          <div className="h-8 w-3/4 sm:w-80 bg-slate-200 rounded-md"></div>
          {/* Description */}
          <div className="h-4 w-full bg-slate-100 rounded"></div>
          <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status falso */}
          <div className="h-4 w-24 bg-slate-100 rounded hidden sm:block"></div>
          {/* Botón Guardar falso */}
          <div className="h-10 w-36 bg-blue-200 rounded-xl"></div>
        </div>
      </div>

      {/* LAYOUT PRINCIPAL (Skeleton) */}
      <div className="grid grid-cols-1 gap-8 items-start">
        {/* COLUMNA FORMULARIO (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Identidad Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            {/* Título sección */}
            <div className="h-5 w-64 bg-slate-200 rounded pb-2"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <SkeletonInput fullWidth />
              <SkeletonInput />
              <SkeletonInput />
              <SkeletonInput fullWidth />
            </div>
          </div>

          {/* 2. Contacto Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="h-5 w-64 bg-slate-200 rounded pb-2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <SkeletonInput />
              <SkeletonInput />
              <SkeletonInput />
              <SkeletonInput />
            </div>
          </div>

          {/* 3. Datos Bancarios Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="h-5 w-64 bg-slate-200 rounded pb-2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <SkeletonInput />
              <SkeletonInput />
            </div>
          </div>
        </div>

        {/* COLUMNA PREVIEW (5 cols) Skeleton */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-slate-200 rounded"></div>
            <div className="h-5 w-32 bg-emerald-100 rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-6 relative overflow-hidden">
            {/* Header Documento Falso */}
            <div className="border-b-2 border-slate-100 pb-5 pt-2 flex justify-between gap-4">
              <div className="flex flex-col gap-3">
                {/* Logo Upload falso */}
                <div className="w-[60px] h-[60px] bg-slate-200 rounded-lg"></div>
                <div className="space-y-2 mt-2">
                  <div className="h-5 w-32 bg-slate-300 rounded"></div>
                  <div className="h-3 w-24 bg-slate-200 rounded"></div>
                  <div className="h-3 w-20 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-200 rounded"></div>
            </div>

            {/* Cuerpo Documento Falso */}
            <div className="py-10 px-4 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="h-4 w-32 bg-slate-200 rounded mx-auto mb-2"></div>
              <div className="h-3 w-48 bg-slate-100 rounded mx-auto"></div>
            </div>

            {/* Footer Documento Falso */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w10 h-10 bg-slate-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-slate-300 rounded"></div>
                  <div className="h-3 w-32 bg-slate-200 rounded"></div>
                </div>
              </div>

              {/* Caja bancaria falsa */}
              <div className="bg-slate-50 p-3 rounded border border-slate-100 space-y-2">
                <div className="h-3 w-40 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-32 bg-slate-100 rounded"></div>
                <div className="h-3 w-32 bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
