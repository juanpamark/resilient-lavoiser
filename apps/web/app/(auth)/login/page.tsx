import React from 'react';
import Link from 'next/link';
import { login } from '../actions';
import { Bot, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    redirect?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error;
  const redirectTo = params.redirect || '';

  const getErrorMessage = (errCode?: string) => {
    if (!errCode) return null;
    switch (errCode) {
      case 'unauthorized_platform_admin':
        return 'Acceso denegado: Se requieren permisos de Administrador de Plataforma.';
      case 'no_active_business':
        return 'Tu cuenta no tiene una empresa o negocio asociado en el sistema.';
      case 'missing_credentials':
        return 'Por favor ingresa tu correo electrónico y contraseña.';
      case 'invalid_credentials':
      case 'Invalid login credentials':
        return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      default:
        return decodeURIComponent(errCode);
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div>
      {/* Branding Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25 mb-3">
          <Bot className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          agilizio
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inicia sesión para gestionar tus agentes, catálogo y bandeja en vivo
        </p>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Login Form */}
      <form action={login} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tu-correo@empresa.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </form>

      {/* Footer link to Return Home */}
      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
