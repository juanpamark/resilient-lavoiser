'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  badgeTone?: 'amber' | 'emerald' | 'neutral';
  icon: React.ReactNode;
}

const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: 'Resumen Operativo',
    href: '/business/dashboard',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Bandeja en Vivo',
    href: '/business/inbox',
    badge: '2 Handoff',
    badgeTone: 'amber',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    label: 'Comandas (KDS)',
    href: '/business/orders',
    badge: '5',
    badgeTone: 'emerald',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: 'Menú y Agotados (86)',
    href: '/business/catalog',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
  },
  {
    label: 'Agente y Simulador',
    href: '/business/agent',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    label: 'Guardián de Reseñas',
    href: '/business/reviews',
    badge: 'Nuevo',
    badgeTone: 'neutral',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: 'Canales WhatsApp',
    href: '/business/channels',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    label: 'Analítica e Ingresos',
    href: '/business/analytics',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
];

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState<boolean>(false);

  const conversationsUsed = 412;
  const conversationsLimit = 1000;
  const usagePercentage = Math.min(
    100,
    Math.round((conversationsUsed / conversationsLimit) * 100)
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5] text-[#141413] antialiased">
      {/* =====================================================================
          DRAWER MÓVIL EN PANTALLAS PEQUEÑAS (< LG)
      ===================================================================== */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* =====================================================================
          SIDEBAR EN VERDE BOSQUE NOCTURNO (#0C1F17) - FIJO EN DESKTOP (W-60)
          RESPONSIVO EN MÓVIL COMO DRAWER DESLIZABLE
      ===================================================================== */}
      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-50 w-60 shrink-0 bg-[#0C1F17] text-[#E6E4DD] border-r border-white/[0.08] flex flex-col justify-between select-none transition-transform duration-200 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Cabecera de Marca + Salud Operativa del Restaurante */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between px-1.5">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-[#10B981] text-[#0C1F17] flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
                A
              </div>
              <span className="font-semibold text-sm tracking-[-0.02em] text-white">
                agilizio
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono metric-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.07] text-[#A7F3D0] border border-white/[0.08]">
                v2.4
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden h-6 w-6 rounded flex items-center justify-center text-white/70 hover:text-white"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Widget de Salud Operativa del Tenant */}
          <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate">
                Santa Cruz Parrilla
              </span>
              <span className="text-[10px] font-mono metric-mono text-[#A7F3D0]/80">
                WABA
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#E6E4DD]/80">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-emerald-300 font-medium">IA Activa</span>
              </span>
              <span className="font-mono metric-mono text-[11px] text-[#E6E4DD]/60">
                98ms
              </span>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="space-y-0.5 pt-1" aria-label="Navegación del restaurante">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/business/dashboard' &&
                  pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={[
                    'group relative flex items-center justify-between h-9 px-2.5 rounded-md text-[13px] transition-all duration-150',
                    isActive
                      ? 'bg-white/[0.09] text-white font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-emerald-400 before:rounded-r'
                      : 'text-[#E6E4DD]/70 hover:text-white hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span
                      className={
                        isActive
                          ? 'text-emerald-400'
                          : 'text-[#E6E4DD]/50 group-hover:text-[#E6E4DD]/90'
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.badge && (
                    <span
                      className={[
                        'px-1.5 py-0.5 text-[10px] font-mono metric-mono rounded font-medium',
                        item.badgeTone === 'amber'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          : item.badgeTone === 'emerald'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-white/10 text-[#E6E4DD]/80',
                      ].join(' ')}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar: Medidor de Cuota Mensual + Usuario */}
        <div className="p-3.5 space-y-3 border-t border-white/[0.08] bg-[#091711]">
          {/* Medidor de Consumo de Conversaciones */}
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.07] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#E6E4DD]/75 font-medium">
                Cuota Mensual
              </span>
              <span className="font-mono metric-mono text-white font-semibold">
                {conversationsUsed.toLocaleString('es-CO')} /{' '}
                {conversationsLimit.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#E6E4DD]/55">
              <span>Plan Despegue</span>
              <span className="font-mono metric-mono">
                {usagePercentage}% usado
              </span>
            </div>
          </div>

          {/* Perfil Operativo */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-[11px] font-semibold text-emerald-300 shrink-0">
                DA
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-white leading-none truncate">
                  Don Andrés
                </p>
                <p className="text-[10px] text-[#E6E4DD]/55 mt-0.5 truncate">
                  Administrador · Caja 1
                </p>
              </div>
            </div>
            <span
              className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"
              title="Sesión verificada"
            />
          </div>
        </div>
      </aside>

      {/* =====================================================================
          LIENZO PRINCIPAL (WARM IVORY #FAF8F5)
      ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* BARRA SUPERIOR MÓVIL (< LG) */}
        <div className="lg:hidden h-12 bg-[#0C1F17] text-white px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center text-white text-base cursor-pointer"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-[#10B981] text-[#0C1F17] font-bold text-[11px] flex items-center justify-center">
                A
              </div>
              <span className="font-semibold text-xs tracking-tight">agilizio</span>
            </div>
          </div>

          <span className="text-[11px] font-mono metric-mono text-[#A7F3D0]">
            Santa Cruz · 98ms
          </span>
        </div>

        {/* BANNER SUPERIOR DE REVERSE TRIAL (SIMPLIFICADO Y LIMPIO) */}
        <header className="h-9 shrink-0 bg-[#F3F1EC] border-b border-[#E8E6DF] px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono metric-mono font-semibold bg-[#0F291E] text-[#FAF8F5]">
              TRIAL PRO
            </span>
            <span className="text-[#141413] font-medium text-[11px] sm:text-xs">
              <strong className="font-mono metric-mono">11 días restantes</strong> · Sin tarjeta
            </span>
          </div>

          <Link href="/business/channels">
            <Button variant="primary" size="xs">
              Activar Plan ($190k)
            </Button>
          </Link>
        </header>

        {/* CONTENEDOR DE PÁGINA */}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
