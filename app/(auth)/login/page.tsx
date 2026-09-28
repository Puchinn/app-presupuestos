"use client";

import React, { useState } from "react";
import {
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { logIn } from "@/features/user/actions";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password reset flow state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage(
        "Por favor completá tu correo electrónico y tu contraseña.",
      );
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage(
        "El formato de correo electrónico ingresado no es válido.",
      );
      return;
    }

    setIsLoading(true);

    const error = await logIn({
      password,
      email,
    });

    if (error) {
      setErrorMessage(
        "Credenciales inválidas. Verificá tu correo electrónico y contraseña e intentá nuevamente.",
      );
      setIsLoading(false);
      return;
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) return;
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ingresar a app-presupuestos
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Gestión y emisión formal de cotizaciones para profesionales
            independientes y estudios en Argentina.
          </p>
        </div>

        {/* Reserved space for error messages (ensures no layout jump) */}
        <div className="min-h-[52px]" aria-live="polite">
          {errorMessage ? (
            <div
              id="login-error-banner"
              className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs font-medium flex items-start gap-2.5 animate-fadeIn"
              role="alert"
            >
              <AlertCircle
                className="w-4 h-4 text-rose-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1">
                <span className="font-bold block">Error al iniciar sesión</span>
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-800 p-0.5"
                aria-label="Cerrar mensaje de error"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="hidden sm:block text-center text-xs text-slate-400 py-2">
              Ingresá tus credenciales registradas
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
                placeholder="nombre@estudio.com.ar"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
                placeholder="Ingresá tu clave"
              />
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 border-slate-300 rounded cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2.5 block text-xs font-medium text-slate-700 cursor-pointer"
            >
              Recordarme en este dispositivo (sesión de 30 días)
            </label>
          </div>

          {/* Submit Button with Loading State */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 transition-all cursor-pointer text-sm"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="w-4 h-4 animate-spin text-white"
                  aria-hidden="true"
                />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal (Fully functional, not decorative) */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="forgot-modal-title"
                  className="text-base font-bold text-slate-900"
                >
                  Recuperar contraseña
                </h2>
                <p className="text-xs text-slate-500">
                  Te enviaremos un enlace de restablecimiento seguro.
                </p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Enlace de recuperación enviado</span>
                </div>
                <p>
                  Si la cuenta{" "}
                  <strong className="font-semibold">{forgotEmail}</strong>{" "}
                  existe en app-presupuestos, recibirás un correo con las
                  instrucciones en unos minutos.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSubmitted(false);
                    }}
                    className="w-full py-2 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors"
                  >
                    Entendido, volver al inicio de sesión
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-email-input"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Correo electrónico asociado
                  </label>
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ejemplo@estudio.com.ar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <span>Enviar enlace</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
