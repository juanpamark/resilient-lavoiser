import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Bot,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  Building2,
  Sliders,
  BarChart3,
  ExternalLink,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">Platform SaaS</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full ml-2">
                v1.0 Producción
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Acceso / Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Previsualización Interactiva Local
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Plataforma Multi-Tenant de Agentes de IA para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
              WhatsApp
            </span>
          </h1>
          <p className="mt-4 text-base text-slate-400 leading-relaxed">
            Arquitectura de 14 fases con Google Gemini 2.5 Flash, PostgreSQL RLS, WebSockets en tiempo real y facturación directa en Meta.
          </p>
        </div>

        {/* Preview Launchpad Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          {/* Platform Admin Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-7 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-medium text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800">
                  Rol: Platform Admin
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Portal de la Agencia (Platform)</h2>
              <p className="text-sm text-slate-400 mb-6">
                Panel global para el superadministrador: aprovisionamiento de inquilinos, monitoreo de costos de IA, márgenes y analíticas.
              </p>

              <div className="space-y-2 mb-6">
                <Link
                  href="/platform/dashboard?preview=platform"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" /> Dashboard General
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  href="/platform/businesses?preview=platform"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" /> Gestión de Inquilinos (Tenants)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  href="/platform/analytics?preview=platform"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" /> Analíticas Globales y Consumo Gemini
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>

            <Link
              href="/platform/dashboard?preview=platform"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
            >
              Abrir Panel Platform Admin
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Business Tenant Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-7 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-medium text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800">
                  Inquilino Piloto: La Casona
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Portal del Negocio (Business)</h2>
              <p className="text-sm text-slate-400 mb-6">
                Panel del cliente final: Bandeja en Vivo con WebSockets, calibración del agente de IA, menú, pedidos y WhatsApp Embedded Signup.
              </p>

              <div className="space-y-2 mb-6">
                <Link
                  href="/business/inbox?preview=business"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium text-emerald-400">
                    <MessageSquare className="w-4 h-4" /> Live Inbox & Handoff Humano (Realtime)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  href="/business/agent?preview=business"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" /> Calibración del Agente IA & Tools
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  href="/business/channels?preview=business"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> Canales (Meta Embedded Signup)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  href="/business/catalog?preview=business"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> Catálogo de Menú y Productos
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>

            <Link
              href="/business/inbox?preview=business"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
            >
              Abrir Live Inbox en Vivo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Platform SaaS — Multi-Tenant Architecture & Production Ready Engine</p>
      </footer>
    </div>
  );
}
