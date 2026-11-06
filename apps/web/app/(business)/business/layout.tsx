import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  UtensilsCrossed,
  ShoppingBag,
  Share2,
  BarChart3,
  LogOut,
  Store,
  Star,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#EAE6DF] bg-white flex flex-col shrink-0 shadow-sm">
        {/* Brand & Store Header */}
        <div className="p-5 border-b border-[#EAE6DF]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-black text-slate-900 tracking-tight flex items-center">
              agilizio<span className="w-2 h-2 rounded-full bg-emerald-600 inline-block ml-0.5"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Business
            </span>
          </div>

          {/* Active Restaurant Selector */}
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Store className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-900 text-xs truncate leading-tight">
                  Restaurante Santa Cruz
                </p>
                <p className="text-[10px] text-emerald-700 font-medium">Sede Campestre</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4 flex-1 overflow-y-auto text-xs">
          {/* Section: Operación Diaria */}
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Operación Diaria
            </span>
            <div className="space-y-0.5">
              <Link
                href="/business/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-slate-600 hover:bg-[#FAF9F6] hover:text-slate-900 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                Resumen
              </Link>
              <Link
                href="/business/inbox"
                className="flex items-center justify-between px-3 py-2 rounded-xl font-medium text-slate-600 hover:bg-[#FAF9F6] hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Bandeja en Vivo
                </div>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  1 Espera
                </span>
              </Link>
              <Link
                href="/business/orders"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-slate-600 hover:bg-[#FAF9F6] hover:text-slate-900 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                Pedidos & Comandas
              </Link>
            </div>
          </div>

          {/* Section: Gastronomía & Ventas */}
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Gastronomía & Ventas
            </span>
            <div className="space-y-0.5">
              <Link
                href="/business/catalog"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-slate-600 hover:bg-[#FAF9F6] hover:text-slate-900 transition-colors"
              >
                <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                Menú & Disponibilidad
              </Link>
              <Link
                href="/business/reviews"
                className="flex items-center justify-between px-3 py-2 rounded-xl font-medium text-slate-600 hover:bg-[#FAF9F6] hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  Reseñas Google Maps
                </div>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  4.8 ★
                </span>
              </Link>
              <Link
                href="/business/analytics"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-slate-600 hover:bg-[#FAF9F6] hover:text-slate-900 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-slate-400" />
                Analítica & Métricas
              </Link>
            </div>
          </div>

          {/* Section: Configuración & Canales */}
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Configuración & IA
            </span>
            <div className="space-y-0.5">
              <Link
                href="/business/agent"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-slate-600 hover:bg-[#FAF9F6] hover:text-slate-900 transition-colors"
              >
                <Bot className="w-4 h-4 text-slate-400" />
                Agente de IA (agilizio)
              </Link>
              <Link
                href="/business/channels"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-slate-600 hover:bg-[#FAF9F6] hover:text-slate-900 transition-colors"
              >
                <Share2 className="w-4 h-4 text-slate-400" />
                Línea de WhatsApp (Meta)
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer: User profile & Logout */}
        <div className="p-4 border-t border-[#EAE6DF] space-y-2">
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Juan Pablo</p>
              <p className="text-[10px] text-slate-500 truncate">admin@agilizio.com</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
