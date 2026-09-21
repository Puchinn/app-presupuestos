"use client";

import { ImageIcon, Loader2 } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { updateAvatar } from "@/actions/profile";

export function AvatarUpload({ defaultSrc }: { defaultSrc: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLoading(true);
      const file = e.target.files[0];
      await updateAvatar(file);
      setLoading(false);
      e.target.files = null;
    }
  };

  return (
    <div className="rounded-full relative h-[160px] w-[160px] group border object-cover">
      {loading && (
        <div className="w-full h-full flex flex-col items-center justify-center rounded-full bg-white/80 p-10 absolute z-10">
          <Loader2 className="text-black/75 w-20 h-20  rounded-full mb-1 animate-spin" />
          <span className="text-[12px] text-black/75 leading-tight text-center px-1">
            Subiendo...
          </span>
        </div>
      )}
      {defaultSrc.length ? (
        <img
          src={defaultSrc}
          className="w-full h-full  object-cover rounded-full"
        />
      ) : (
        <ImageIcon className="text-foreground/25 w-full h-full p-10" />
      )}

      <label className="absolute opacity-0 group-hover:opacity-100 bg-black/40 text-white flex justify-center items-center inset-0  rounded-full  mx-auto group">
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
