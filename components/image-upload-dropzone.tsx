import React, { useRef, useState } from "react";
import { UploadCloud, Trash2, RefreshCw, Check } from "lucide-react";
import { getFileSizeInMB } from "@/lib/utils";

interface ImageUploadDropzoneProps {
  id: string;
  label: string;
  description: string;
  value?: string;
  onChange: (file: File) => Promise<void>;
  onClear: () => void;
  aspectHint?: string;
  previewHeight?: string;
  samplePresetUrl?: string;
  samplePresetLabel?: string;
  badgeText?: string;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  id,
  label,
  description,
  value,
  onChange,
  aspectHint = "Recomendado: PNG, JPG o SVG. Máx 1 MB.",
  previewHeight = "h-24",
  badgeText,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith("image/")) {
      setErrorMsg(
        "Por favor seleccioná un archivo de imagen válido (PNG, JPG, SVG o WebP).",
      );
      return;
    }

    // Límite de 1 MB (igual que en los handlers de subida)
    if (getFileSizeInMB(file) > 1) {
      setErrorMsg("La imagen supera el límite recomendado de 1 MB.");
      return;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
      onChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
        >
          {label}
        </label>
        {badgeText && (
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            {badgeText}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/png, image/jpeg, image/svg+xml, image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
          isDragging
            ? "border-blue-600 bg-blue-50/70 scale-[1.01]"
            : value
              ? "border-slate-300 bg-slate-50/50 hover:border-slate-400"
              : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/60"
        }`}
      >
        {value ? (
          /* Preview state with action buttons */
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative p-2 bg-gray-600 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={value}
                alt={label}
                className={`${previewHeight} w-auto max-w-[180px] object-contain rounded`}
              />
              <span
                className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs"
                title="Cargado"
              >
                <Check className="w-3 h-3" />
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cambiar imagen</span>
                </button>

                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 shadow-2xs hover:border-rose-300 focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:outline-none transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Quitar</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Arrastrá un archivo nuevo aquí o hacé clic en cambiar.
              </p>
            </div>
          </div>
        ) : (
          /* Empty dropzone state */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center py-4 text-center cursor-pointer group"
          >
            <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 transition-colors mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Hacé clic para subir o arrastrá el archivo aquí
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{aspectHint}</p>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs text-rose-600 font-medium" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
