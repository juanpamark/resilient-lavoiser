import React from 'react';
import Link from 'next/link';
import {
  Building2,
  LayoutDashboard,
  Cpu,
  LineChart,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm tracking-tight">Platform Admin</h1>
            <p className="text-xs text-slate-500 font-medium">Panel de Agencia</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <Link
            href="/platform/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            Resumen Global
          </Link>
          <Link
            href="/platform/businesses"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            Inquilinos (Businesses)
          </Link>
          <Link
            href="/platform/usage"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Cpu className="w-4 h-4 text-slate-500" />
            Consumo de IA & Tokens
          </Link>
          <Link
            href="/platform/analytics"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LineChart className="w-4 h-4 text-slate-500" />
            Métricas & Margen
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 mb-3">
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800">Admin Agencia</p>
              <p className="text-[11px] text-slate-500 truncate">admin@agency.com</p>
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
