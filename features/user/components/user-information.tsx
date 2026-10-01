"use client";

import { ImageUploadDropzone } from "@/components/image-upload-dropzone";
import type { UserInfo } from "../types";
import { Globe, ImageIcon, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { updateUser } from "../actions";
import { uploadPublicImage } from "@/lib/storage";
import { getPublicStorageUrl } from "@/lib/utils";

type Status = "saved" | "saving" | "unsaved" | "error";

export function UserInformation({ user }: { user: UserInfo }) {
  const [formData, setFormData] = useState<UserInfo>(user);
  const [saveStatus, setSaveStatus] = useState<Status>("saved");

  const handleChange = (formField: Partial<UserInfo>) => {
    setFormData((prev) => ({ ...prev, ...formField }));
  };

  const handleSaveChanges = async () => {
    setSaveStatus("saving");
    const result = await updateUser(formData);
    setSaveStatus(result.ok ? "saved" : "error");
  };

  // sync data
  useEffect(() => {
    const sync = () => {
      setFormData(user);
    };

    sync();
  }, [user]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-800 font-sans">
      <ProfileHeader handleSubmit={handleSaveChanges} saveStatus={saveStatus} />

      <div className="gap-8 items-start">
        <form className="space-y-8" onSubmit={handleSaveChanges}>
          <IdentitySection formData={formData} handleChange={handleChange} />
          <ImagesSection formData={formData} handleChange={handleChange} />
          <ContactSection formData={formData} handleChange={handleChange} />
          <BankSection />
        </form>
      </div>
    </div>
  );
}

interface SectionsProps {
  formData: UserInfo;
  handleChange: (formField: Partial<UserInfo>) => void;
}

interface ProfileHeaderProps {
  saveStatus: Status;
  handleSubmit: () => void;
}

function ProfileHeader({ saveStatus, handleSubmit }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
          Configuración Profesional
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tu Información & Datos de Emisión
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Estos datos fiscales, de contacto y bancarios se integran
          automáticamente en el encabezado y pie de tus cotizaciones.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saveStatus === "saving"}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>
            {saveStatus === "saving"
              ? "Guardando..."
              : saveStatus === "error"
                ? "No se pudo guardar"
                : "Guardar cambios"}
          </span>
        </button>
      </div>
    </div>
  );
}

function IdentitySection({ formData, handleChange }: SectionsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600" />
        <span>Identidad Profesional & Razón Social</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nombre del Estudio / Fantasía (Mock)
          </label>
          <input
            type="text"
            // value={formData.studioName}
            // onChange={(e) => handleChange("studioName", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nombre del Titular *
          </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) =>
              handleChange({
                full_name: e.target.value,
              })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            CUIT / CUIL (Mock)
          </label>
          <input
            type="text"
            // value={formData.cuit}
            // onChange={(e) => handleChange("cuit", e.target.value)}
            placeholder="20-XXXXXXXX-X"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 outline-none transition-colors"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Rol / Especialidad Profesional
          </label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) =>
              handleChange({
                role: e.target.value,
              })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

function ImagesSection({ formData, handleChange }: SectionsProps) {
  const updateLogo = async (file: File) => {
    const upload = await uploadPublicImage(file);
    if (!upload.ok) {
      // Sin feedback visual por ahora; queda para T-009.
      console.error(upload.error);
      return;
    }
    const result = await updateUser({
      logo_url: upload.path,
    });
    // Sin feedback visual por ahora; queda para T-009.
    if (!result.ok) console.error(result.error);
  };

  const updateFooterImage = async (file: File) => {
    const upload = await uploadPublicImage(file);
    if (!upload.ok) {
      // Sin feedback visual por ahora; queda para T-009.
      console.error(upload.error);
      return;
    }
    const result = await updateUser({
      footer_image_url: upload.path,
    });
    // Sin feedback visual por ahora; queda para T-009.
    if (!result.ok) console.error(result.error);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>Logo de la Empresa & Código QR de Cobro</span>
        </h2>
        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
          Imágenes oficiales
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed -mt-2">
        Personalizá la identidad gráfica de tus cotizaciones. El{" "}
        <strong>logo</strong> se posiciona en el encabezado principal y el{" "}
        <strong>código QR</strong> en el pie del documento para facilitar
        transferencias instantáneas.
      </p>

      <div className="flex gap-5">
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
          <ImageUploadDropzone
            id="upload-company-logo"
            label="Logo de la Empresa"
            badgeText="Encabezado PDF"
            description="Aparecerá en el extremo superior de cada presupuesto generado."
            value={getPublicStorageUrl(formData.logo_url)}
            onChange={updateLogo}
            onClear={() =>
              handleChange({
                logo_url: "",
              })
            }
            previewHeight="h-14"
            aspectHint="PNG transparente o SVG (Horizontal o cuadrado, máx 4MB)."
          />
        </div>

        {/* 2. QR de cobro para footer */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
          <ImageUploadDropzone
            id="upload-payment-qr"
            label="Código QR para Cobros"
            badgeText="Footer PDF"
            description="Se ubicará en el pie de página junto a los datos bancarios para pago directo."
            value={getPublicStorageUrl(formData.footer_image_url)}
            onChange={updateFooterImage}
            onClear={() =>
              handleChange({
                footer_image_url: "",
              })
            }
            previewHeight="h-20"
            aspectHint="QR de Mercado Pago, MODO, Transferencias 3.0 o AFIP."
          />
        </div>
      </div>
    </div>
  );
}

function ContactSection({ formData, handleChange }: SectionsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <Globe className="w-4 h-4 text-blue-600" />
        <span>Canales de Contacto & Domicilio</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email de Contacto (Mock)
          </label>
          <input
            type="email"
            //   value={formData.email}
            //   onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Teléfono / WhatsApp
          </label>
          <input
            type="text"
            value={formData.contact_number}
            onChange={(e) =>
              handleChange({
                contact_number: e.target.value,
              })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Sitio Web o Portfolio
          </label>
          <input
            type="text"
            value={formData.website}
            onChange={(e) => handleChange({ website: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Ciudad / Jurisdicción (Mock)
          </label>
          <input
            type="text"
            // value={formData.city}
            // onChange={(e) => handleChange("city", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

function BankSection() {
  return "";
}
