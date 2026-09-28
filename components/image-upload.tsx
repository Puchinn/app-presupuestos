"use client";

import { ImageIcon, Loader2, X } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

interface Props {
  size: number;
  defaultSrc: string;
  onUpload: (file: File) => Promise<void>;
  onDeleteImage?: VoidFunction;
}

export function ImageUpload({
  defaultSrc,
  size,
  onUpload,
  onDeleteImage,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLoading(true);
      const file = e.target.files[0];
      await onUpload(file);
      setLoading(false);
      e.target.files = null;
    }
  };

  return (
    <div
      className={`${defaultSrc.length ? "" : "border-dashed border-balance border"} rounded-md  relative group  object-cover`}
    >
      <div className="absolute bg-white rounded-md group-hover:text-black z-30 right-0 top-0">
        <X onClick={onDeleteImage} className="cursor-pointer text-gray-500" />
      </div>
      {loading && (
        <div className="w-full h-full rounded-md flex flex-col items-center justify-center rounded-full bg-white/80 p-10 absolute z-10">
          <Loader2 className="text-black/75 w-20 h-20 mb-1 animate-spin" />
          <span className="text-[12px] text-black/75 leading-tight text-center px-1">
            Subiendo...
          </span>
        </div>
      )}
      {defaultSrc.length ? (
        <img
          src={defaultSrc}
          alt="Imagen"
          width={size}
          height={size}
          className={`object-contain`}
          style={{ width: size, height: size }}
        />
      ) : (
        <div>
          <ImageIcon
            style={{
              width: size,
              height: size,
            }}
            className="text-balance p-10"
          />
        </div>
      )}

      <label className="absolute rounded-md opacity-0 group-hover:opacity-100 bg-white/90 text-black flex justify-center items-center inset-0 mx-auto group">
        <p>Cambiar ↑</p>
        <input
          ref={fileRef}
          id="fileInput"
          hidden
          onChange={onFileChange}
          type="file"
          accept="image/*"
        />
      </label>
    </div>
  );
}
