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

// Título falso de sección (misma altura que los h2 reales)
const SkeletonTitle = ({ width = "w-64" }: { width?: string }) => (
  <div className={`h-5 ${width} bg-slate-200 rounded pb-2`}></div>
);

export default function Loading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-pulse">
      {/* HEADER (Skeleton de ProfileHeader) */}
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
          {/* Botón Guardar falso */}
          <div className="h-10 w-36 bg-blue-200 rounded-xl"></div>
        </div>
      </div>

      {/* 1. Identidad Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
        <SkeletonTitle />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SkeletonInput />
          <SkeletonInput />
        </div>
      </div>

      {/* 2. Imágenes Skeleton (logo + QR) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <SkeletonTitle width="w-72" />
          <div className="h-5 w-32 bg-blue-100 rounded-full"></div>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded"></div>
        <div className="h-3 w-4/5 bg-slate-100 rounded"></div>
        <div className="flex gap-5">
          <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-3 flex-1">
            <div className="h-3 w-32 bg-slate-200 rounded"></div>
            <div className="h-14 w-full bg-slate-100 border border-slate-200 rounded-lg"></div>
          </div>
          <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-3 flex-1">
            <div className="h-3 w-32 bg-slate-200 rounded"></div>
            <div className="h-20 w-full bg-slate-100 border border-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* 3. Contacto Skeleton (email, teléfono, sitio web) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
        <SkeletonTitle width="w-56" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SkeletonInput fullWidth />
          <SkeletonInput />
          <SkeletonInput />
        </div>
      </div>
    </div>
  );
}
