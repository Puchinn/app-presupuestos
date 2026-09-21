"use client";

import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import type { UserInfo } from "@/types/user";
import { AvatarUpload } from "../avatar-upload";
import { ImageUpload } from "../image-upload";

import { updateLogo, updateFooterImage } from "@/actions/profile";
import { updateUserProfile } from "@/actions/profile";

export const UserInformationView = ({ userData }: { userData: UserInfo }) => {
  const [formData, setFormData] = useState<UserInfo>(userData);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onUpdate = async () => {
    setLoading(true);
    await updateUserProfile(formData);
    setLoading(false);
  };

  const onDeleteImage = async (from: "logo_url" | "footer_image_url") => {
    setLoading(true);
    await updateUserProfile({
      ...formData,
      [from]: "",
    });
    setLoading(false);
  };

  useEffect(() => {
    const updateState = () => setFormData(userData);
    updateState();
  }, [userData]);

  return (
    <div className="max-w-4xl p-6 space-y-6 min-h-screen text-slate-800 font-sans">
      <h1 className="text-2xl font-bold mb-4">Tu Información</h1>

      {loading && "ACTUALIZANDO......"}

      {/* SECCIÓN 1: FORMULARIO EDITABLE */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Espacio reservado para tu componente de Avatar */}
          <AvatarUpload defaultSrc={userData.avatar_url} />

          {/* Campos editables */}
          <div className="md:col-span-2 space-y-4">
            {/* Campo: Nombre */}
            <div className="relative flex items-center">
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Nombre completo"
                className="w-full text-xl font-bold pr-10 pl-3 py-1 bg-transparent hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded border border-transparent hover:border-slate-300 transition-all outline-none"
              />
              <Pencil className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>

            {/* Campo: Rol / Puesto */}
            <div className="relative flex items-center">
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Rol o puesto"
                className="w-full text-base text-slate-600 pr-10 pl-3 py-1 bg-transparent hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded border border-transparent hover:border-slate-300 transition-all outline-none"
              />
              <Pencil className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>

            {/* Campos en dos columnas: Sitio Web y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Sitio web"
                  className="w-full text-sm text-slate-600 pr-10 pl-3 py-1 bg-transparent hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded border border-transparent hover:border-slate-300 transition-all outline-none"
                />
                <Pencil className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  className="w-full text-sm text-slate-600 pr-10 pl-3 py-1 bg-transparent hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded border border-transparent hover:border-slate-300 transition-all outline-none"
                />
                <Pencil className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <button onClick={onUpdate} className="border p-2 rounded-md">
          Guardar Informacion
        </button>
      </div>

      {/* SECCIÓN 2: PREVISUALIZACIÓN PRESUPUESTO */}
      <header className="bg-foreground border border-slate-200 rounded-md text-background px-12 py-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="flex items-center">
            <ImageUpload
              onUpload={updateLogo}
              size={140}
              defaultSrc={formData.logo_url}
              onDeleteImage={() => onDeleteImage("logo_url")}
            />
          </div>
          <h1 className="text-xl font-semibold tracking-[0.3em] uppercase text-background text-center">
            Presupuesto
          </h1>
          <div className="flex items-center justify-end gap-8">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                Enviado
              </p>
              <span className="border-b text-sm border-transparent hover:border-foreground/20 transition-colors inline-block">
                25 Sep 2026
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                Plazo
              </p>
              <span className="border-b text-sm border-transparent hover:border-foreground/20 transition-colors inline-block">
                8 Oct 2026
              </span>
            </div>
          </div>
        </div>
        <div className="h-px bg-background/10 my-5" />
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-background/30">
            Cliente
          </p>
          <span className="border-b text-sm border-transparent hover:border-foreground/20 transition-colors inline-block">
            NIKE
          </span>
        </div>
      </header>

      {/* SECCIÓN 3: PREVISUALIZACIÓN FIRMA / TARJETA */}
      <footer className="border-t border-border px-12 py-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <ImageUpload
              onUpload={updateFooterImage}
              size={80}
              defaultSrc={formData.footer_image_url}
              onDeleteImage={() => onDeleteImage("footer_image_url")}
            />
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Conoce mis trabajos
              </p>
              <span className="border-b text-sm border-transparent hover:border-foreground/20 transition-colors inline-block">
                {formData.website}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="space-y-4">
              <div className="text-right">
                <span className="text-[15px] font-semibold text-foreground">
                  {formData.full_name}
                </span>
                <br />
                <span className="text-sm text-muted-foreground">
                  {formData.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border flex items-center justify-center gap-6">
          <span className="text-sm text-muted-foreground">
            {formData.website}
          </span>
          <span className="text-foreground/10">|</span>
          <span className="text-sm text-muted-foreground">
            {formData.contact_number}
          </span>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground italic">
            ¿Querés presentar tus presupuestos así? Diseñamos tu sistema de
            presupuestos automatizado para tu marca. Consultanos
          </p>
        </div>
      </footer>
    </div>
  );
};
