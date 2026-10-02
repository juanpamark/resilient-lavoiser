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
} from 'lucide-react';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div className="truncate">
            <h1 className="font-bold text-slate-900 text-sm tracking-tight truncate">
              La Casona Gourmet
            </h1>
            <p className="text-xs text-slate-500 font-medium">Panel de Negocio</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <Link
            href="/business/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            Resumen
          </Link>
          <Link
            href="/business/inbox"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              Bandeja en Vivo
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              1 Espera
            </span>
          </Link>
          <Link
            href="/business/agent"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bot className="w-4 h-4 text-slate-500" />
            Agente de IA
          </Link>
          <Link
            href="/business/catalog"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4 text-slate-500" />
            Menú y Catálogo
          </Link>
          <Link
            href="/business/orders"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-slate-500" />
            Pedidos
          </Link>
          <Link
            href="/business/channels"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            Canales (WhatsApp)
          </Link>
          <Link
            href="/business/analytics"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            Analítica & Reportes
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 mb-3">
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800">Operador Activo</p>
              <p className="text-[11px] text-slate-500 truncate">operador@lacasona.com</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
