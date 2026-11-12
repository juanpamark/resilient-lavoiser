'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';

interface HeroSimMessage {
  id: string;
  sender: 'customer' | 'ai';
  text: string;
  toolBadge?: string;
  latency?: string;
}

interface PricingTier {
  id: string;
  name: string;
  priceCop: string;
  priceUsdApprox: string;
  conversationsLimit: string;
  description: string;
  highlighted?: boolean;
  badge?: string;
  features: string[];
}

const HERO_PRESET_SCENARIOS: Array<{
  label: string;
  customerText: string;
  aiReply: string;
  toolBadge: string;
  latency: string;
}> = [
  {
    label: '🥩 Pedir Punta de Anca 3/4',
    customerText:
      'Buenas noches, ¿tienen Punta de Anca para enviar a Normandía? La quiero término 3/4.',
    aiReply:
      '¡Buenas noches! Sí señor, tenemos Punta de Anca Madurada de 400g ($58.000) al carbón en término 3/4. Incluye papa criolla y arepa con queso. ¿Te gustaría sumar un Chorizo Santarrosano ($16.000) de entrada? El domicilio a Normandía llega en 35 min.',
    toolBadge: 'search_catalog("punta de anca") → create_order_draft($63.000)',
    latency: '1.1s',
  },
  {
    label: '🍷 Sugerir maridaje',
    customerText: 'Somos 4 personas, ¿qué picada y bebida nos recomiendas?',
    aiReply:
      'Para 4 comensales te recomiendo nuestra Picada Santa Cruz Familiar ($86.000: lomo, costilla BBQ, chorizo, morcilla y guacamole). Marida increíble con nuestra Jarra de Sangría Artesanal de 1L ($32.000). ¿La agendamos para domicilio o reserva en mesa?',
    toolBadge: 'recommend_pairing("picada_familiar") → +$32.000 Ticket',
    latency: '0.9s',
  },
  {
    label: '🚫 Plato agotado (86)',
    customerText: 'Hola! Regálame unas Costillas San Luis BBQ por favor.',
    aiReply:
      '¡Hola! Nuestras Costillas San Luis BBQ se agotaron hace pocos minutos en parrilla, pero tengo recién puesto al carbón el Churrasco Argentino de 350g ($52.000) o el Baby Beef ($54.000). ¿Cuál de los dos te envío?',
    toolBadge: 'check_86_status("costillas") → SOLD_OUT · offer_substitute()',
    latency: '0.8s',
  },
];

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'despegue',
    name: 'Plan Despegue',
    priceCop: '$190.000',
    priceUsdApprox: '~$49 USD / mes',
    conversationsLimit: '1.000 conversaciones / mes',
    description:
      'Ideal para restaurantes de 1 sede que quieren automatizar su toma de pedidos y reservas 24/7.',
    features: [
      '1 línea oficial de WhatsApp Business (WABA)',
      'Hasta 1.000 conversaciones mensuales atendidas por IA',
      'Toma de pedidos con términos de cocción y guarniciones',
      'Bandeja de entrada compartida en vivo',
      'Simulador ilimitado de entrenamiento gastronómico',
      'Conexión directa a Meta (Cero recargo por mensaje)',
    ],
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    priceCop: '$290.000',
    priceUsdApprox: '~$79 USD / mes',
    conversationsLimit: '3.000 conversaciones / mes',
    description:
      'Para parrillas, asaderos y gastrobares con alto volumen de domicilios en fines de semana.',
    highlighted: true,
    badge: 'MÁS ELEGIDO POR RESTAURANTES',
    features: [
      'Hasta 3.000 conversaciones mensuales en WhatsApp',
      'Intervención Humana (Handoff en 1 clic) anti-colisión',
      'Ficha de Cliente (Mini-CRM) con LTV, tags VIP y notas de cocina',
      'Tablero de Comandas en Tiempo Real (KDS) con cronómetros',
      'Botón rápido de Platos Agotados (86) sincronizado con la IA',
      'Soporte prioritario e implementación guiada',
    ],
  },
  {
    id: 'avanzado',
    name: 'Plan Avanzado',
    priceCop: '$390.000',
    priceUsdApprox: '~$99 USD / mes',
    conversationsLimit: 'Conversaciones Ilimitadas',
    description:
      'Operación sin límites de plataforma + Guardián de Reseñas de Google Maps con SEO Local.',
    features: [
      'Conversaciones ilimitadas en plataforma Agilizio',
      'Módulo Guardián de Reseñas Google Maps (SEO + Contención)',
      'Múltiples cajeros simultáneos en bandeja de entrada',
      'Analítica avanzada de horas pico y conversión por plato',
      'Auditoría de prompts de maridaje para subir ticket promedio',
      'Soporte VIP directo por WhatsApp con ingeniería',
    ],
  },
];

function formatCop(amount: number): string {
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}

export default function AgilizioLandingPage() {
  // Estado del Simulador Embebido en el Hero
  const [heroMessages, setHeroMessages] = React.useState<HeroSimMessage[]>([
    {
      id: 'h-1',
      sender: 'ai',
      text: '¡Buenas noches! Bienvenido a Santa Cruz Parrilla 🔥 Soy el recepcionista IA del restaurante. Prueba escribirme un pedido o elige un botón abajo.',
      toolBadge: 'agent_ready · Gemini 2.5 Flash',
      latency: '0.8s',
    },
  ]);
  const [customHeroInput, setCustomHeroInput] = React.useState<string>('');

  // Estado de la Calculadora Interactiva de ROI Gastronómico
  const [dailyChats, setDailyChats] = React.useState<number>(45);
  const [averageTicketCop, setAverageTicketCop] = React.useState<number>(62000);
  const [missedOrdersPerDay, setMissedOrdersPerDay] = React.useState<number>(3);

  const roiMetrics = React.useMemo(() => {
    const recoveredMonthlyOrders = missedOrdersPerDay * 30;
    const recoveredOrdersRevenueCop =
      recoveredMonthlyOrders * averageTicketCop;

    // 25% de los pedidos atendidos aceptan sugerencia de entrada/bebida (+$12.000 promedio)
    const estimatedMonthlyOrdersTotal = Math.round(dailyChats * 0.35 * 30);
    const upsellExtraRevenueCop = Math.round(
      estimatedMonthlyOrdersTotal * 0.25 * 12000
    );

    const totalMonthlyImpactCop =
      recoveredOrdersRevenueCop + upsellExtraRevenueCop;
    const proPlanCostCop = 290000;
    const roiMultiplier = Math.max(
      1,
      Math.round(totalMonthlyImpactCop / proPlanCostCop)
    );

    return {
      recoveredMonthlyOrders,
      recoveredOrdersRevenueCop,
      upsellExtraRevenueCop,
      totalMonthlyImpactCop,
      roiMultiplier,
    };
  }, [dailyChats, averageTicketCop, missedOrdersPerDay]);

  const handleTriggerHeroScenario = (
    scenario: (typeof HERO_PRESET_SCENARIOS)[number]
  ) => {
    setHeroMessages((prev) => [
      ...prev.slice(-3),
      {
        id: `c-${Date.now()}`,
        sender: 'customer',
        text: scenario.customerText,
      },
      {
        id: `a-${Date.now() + 1}`,
        sender: 'ai',
        text: scenario.aiReply,
        toolBadge: scenario.toolBadge,
        latency: scenario.latency,
      },
    ]);
  };

  const handleCustomHeroSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = customHeroInput.trim();
    if (!trimmed) return;

    setHeroMessages((prev) => [
      ...prev.slice(-3),
      {
        id: `c-${Date.now()}`,
        sender: 'customer',
        text: trimmed,
      },
      {
        id: `a-${Date.now() + 1}`,
        sender: 'ai',
        text: '¡Con mucho gusto! En Santa Cruz Parrilla tenemos Punta de Anca 400g ($58.000), Churrasco Argentino ($52.000) y Picada Familiar ($86.000). ¿En qué término deseas la carne y a qué barrio de Bogotá te despachamos?',
        toolBadge: 'search_catalog() → ask_doneness_and_address()',
        latency: '1.0s',
      },
    ]);
    setCustomHeroInput('');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413] antialiased selection:bg-[#0F291E] selection:text-[#FAF8F5]">
      {/* =====================================================================
          BARRA DE NAVEGACIÓN EDITORIAL
      ===================================================================== */}
      <header className="sticky top-0 z-40 h-16 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E6DF] px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-[#0F291E] text-[#FAF8F5] flex items-center justify-center font-bold text-xs shadow-2xs">
              A
            </div>
            <span className="font-semibold text-base tracking-[-0.03em] text-[#141413]">
              agilizio
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono metric-mono uppercase px-1.5 py-0.5 rounded bg-[#EEF5F1] text-[#0F291E] border border-[#CDE2D6] font-semibold">
              Gastronomía IA
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#575653]">
            <a href="#arquitectura" className="hover:text-[#141413] transition">
              Módulos Operativos
            </a>
            <a href="#calculadora-roi" className="hover:text-[#141413] transition">
              Calculadora ROI
            </a>
            <a href="#planes" className="hover:text-[#141413] transition">
              Planes en COP
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/business/dashboard">
            <Button variant="primary" size="sm">
              Probar 14 días gratis →
            </Button>
          </Link>
        </div>
      </header>

      {/* =====================================================================
          HERO SECTION: PROPUESTA DE VALOR + SIMULADOR INTERACTIVO EN VIVO
      ===================================================================== */}
      <section className="px-6 lg:px-12 pt-12 pb-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        {/* Columna Izquierda: Copy Directo al Dolor Financiero del Restaurante */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D5D2C8] shadow-2xs">
            <StatusPill
              status="ai_active"
              label="Reverse Trial 14 Días Gratis"
              metric="Sin tarjeta"
              pulse
            />
            <span className="text-xs text-[#575653] hidden sm:inline">
              Actívalo en 3 minutos con tu propio menú
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#141413] leading-[1.08]">
            Tu restaurante pierde pedidos cada viernes por la noche mientras la
            caja está llena.
          </h1>

          <p className="text-base sm:text-lg text-[#575653] leading-relaxed max-w-xl">
            <strong className="text-[#141413] font-semibold">Agilizio</strong>{' '}
            convierte el WhatsApp oficial de tu restaurante, parrilla o
            gastrobar en tu mejor mesero y recepcionista 24/7: conoce tus
            cortes, pregunta el término de la carne, sugiere maridajes y envía
            la comanda a cocina en{' '}
            <span className="font-mono metric-mono font-semibold text-[#0F291E] underline decoration-[#10B981] underline-offset-4">
              1.1 segundos
            </span>
            .
          </p>

          {/* CTAs Principales */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href="/business/dashboard">
              <Button variant="primary" size="lg">
                Empezar prueba gratis de 14 días →
              </Button>
            </Link>
            <Link href="/business/inbox">
              <Button variant="outline" size="lg">
                Explorar Bandeja y KDS en Vivo
              </Button>
            </Link>
          </div>

          {/* Garantías Operativas Clave */}
          <div className="pt-4 border-t border-[#E8E6DF] grid grid-cols-3 gap-4">
            <div>
              <span className="text-xl font-bold font-mono metric-mono text-[#141413] block">
                0% Comisión
              </span>
              <span className="text-xs text-[#575653]">
                Sobre tus ventas. Todo el dinero entra directo a tu Nequi o
                cuenta.
              </span>
            </div>
            <div>
              <span className="text-xl font-bold font-mono metric-mono text-[#0F291E] block">
                1-Clic Handoff
              </span>
              <span className="text-xs text-[#575653]">
                Tu cajero toma el control humano cuando quiera sin pisarse con
                la IA.
              </span>
            </div>
            <div>
              <span className="text-xl font-bold font-mono metric-mono text-[#141413] block">
                Meta Oficial
              </span>
              <span className="text-xs text-[#575653]">
                Conexión directa a tu WABA sin cobrar recargos por mensaje.
              </span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Simulador Interactivo Embebido (Sin Registrarse) */}
        <div className="rounded-xl bg-[#0C1F17] p-5 text-[#E6E4DD] border border-[#0F291E] shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h2 className="text-xs font-semibold text-white">
                  Simulador en Vivo · Santa Cruz Parrilla
                </h2>
                <p className="text-[11px] text-[#E6E4DD]/65">
                  Pruébalo ahora mismo como si fueras un comensal
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono metric-mono px-2 py-0.5 rounded bg-white/10 text-emerald-300">
              Interactivo
            </span>
          </div>

          {/* Ventana de Mensajes del Simulador */}
          <div className="h-[310px] overflow-y-auto rounded-lg bg-[#EFEAE2] p-3.5 space-y-3 text-[#141413]">
            {heroMessages.map((msg) => {
              const isCustomer = msg.sender === 'customer';
              return (
                <div
                  key={msg.id}
                  className={[
                    'flex flex-col max-w-[88%]',
                    isCustomer ? 'ml-auto items-end' : 'mr-auto items-start',
                  ].join(' ')}
                >
                  {!isCustomer && msg.toolBadge && (
                    <span className="mb-1 px-1.5 py-0.5 rounded bg-[#0C1F17] text-[#A7F3D0] font-mono metric-mono text-[9px] font-medium">
                      ⚡ {msg.toolBadge}
                    </span>
                  )}
                  <div
                    className={[
                      'px-3 py-2 rounded-lg text-xs leading-relaxed shadow-2xs',
                      isCustomer
                        ? 'bg-[#DCF8C6] text-[#141413] rounded-tr-xs'
                        : 'bg-white text-[#141413] border border-[#E8E6DF] rounded-tl-xs',
                    ].join(' ')}
                  >
                    <p>{msg.text}</p>
                    {!isCustomer && msg.latency && (
                      <div className="mt-1 text-right font-mono metric-mono text-[9px] text-[#065F46] font-semibold">
                        Respondido en {msg.latency}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botones de Escenario en 1 Clic */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#E6E4DD]/60 block">
              Haz clic para disparar una prueba real:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {HERO_PRESET_SCENARIOS.map((scen) => (
                <button
                  key={scen.label}
                  type="button"
                  onClick={() => handleTriggerHeroScenario(scen)}
                  className="px-2.5 py-1 rounded-md bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-[11px] font-medium text-white transition cursor-pointer"
                >
                  {scen.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input libre */}
          <form onSubmit={handleCustomHeroSubmit} className="flex gap-2 pt-1">
            <input
              type="text"
              value={customHeroInput}
              onChange={(e) => setCustomHeroInput(e.target.value)}
              placeholder="O escribe tu propio pedido aquí..."
              className="flex-1 h-9 px-3 rounded-md bg-white/10 border border-white/15 text-xs text-white placeholder:text-white/45 focus:outline-none focus:border-emerald-400"
            />
            <Button type="submit" variant="amber" size="md">
              Probar
            </Button>
          </form>
        </div>
      </section>

      {/* =====================================================================
          ARQUITECTURA OPERATIVA: LOS 4 PILARES DEL RESTAURANTE
      ===================================================================== */}
      <section
        id="arquitectura"
        className="py-16 px-6 lg:px-12 bg-white border-y border-[#E8E6DF]"
      >
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono metric-mono font-semibold uppercase tracking-wider text-[#0F291E]">
              Diseñado para Operación Real de Caja y Cocina
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-[#141413]">
              Mucho más que un chatbot: un sistema operativo gastronómico.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <article className="p-5 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-mono metric-mono font-bold text-[#0F291E] bg-[#EEF5F1] px-2 py-0.5 rounded border border-[#CDE2D6]">
                  01 · RECEPCIONISTA IA
                </span>
                <h3 className="text-sm font-semibold text-[#141413]">
                  Domina términos de cocción y maridajes
                </h3>
                <p className="text-xs text-[#575653] leading-relaxed">
                  No cierra una orden de Punta de Anca o Churrasco sin
                  confirmar el término (1/2, 3/4, bien asado), guarnición y
                  sugerir una entrada o sangría.
                </p>
              </div>
              <Link
                href="/business/agent"
                className="text-xs font-semibold text-[#0F291E] underline underline-offset-2"
              >
                Ver configurador del agente →
              </Link>
            </article>

            <article className="p-5 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-mono metric-mono font-bold text-[#92400E] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                  02 · HANDOFF 1-CLIC
                </span>
                <h3 className="text-sm font-semibold text-[#141413]">
                  Bandeja multiusuario con Mini-CRM
                </h3>
                <p className="text-xs text-[#575653] leading-relaxed">
                  Pausa la IA en 1 clic cuando un cliente VIP requiere atención
                  especial. Visualiza su LTV, preferencias de cocción y notas
                  de alergias.
                </p>
              </div>
              <Link
                href="/business/inbox"
                className="text-xs font-semibold text-[#0F291E] underline underline-offset-2"
              >
                Abrir bandeja en vivo →
              </Link>
            </article>

            <article className="p-5 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-mono metric-mono font-bold text-[#9A3412] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA]">
                  03 · COMANDAS KDS + 86
                </span>
                <h3 className="text-sm font-semibold text-[#141413]">
                  Tickets térmicos y platos agotados al instante
                </h3>
                <p className="text-xs text-[#575653] leading-relaxed">
                  Avanza pedidos de &ldquo;En Parrilla&rdquo; a &ldquo;En Camino&rdquo; notificando
                  automáticamente por WhatsApp, y apaga platos agotados (86) en
                  1 segundo.
                </p>
              </div>
              <Link
                href="/business/orders"
                className="text-xs font-semibold text-[#0F291E] underline underline-offset-2"
              >
                Ver tablero KDS →
              </Link>
            </article>

            <article className="p-5 rounded-lg bg-[#FAF8F5] border border-[#E8E6DF] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-mono metric-mono font-bold text-[#0F291E] bg-[#EEF5F1] px-2 py-0.5 rounded border border-[#CDE2D6]">
                  04 · GUARDIÁN MAPS
                </span>
                <h3 className="text-sm font-semibold text-[#141413]">
                  SEO Local en 5★ y contención en 1-3★
                </h3>
                <p className="text-xs text-[#575653] leading-relaxed">
                  Inyecta palabras clave locales en tus reseñas positivas de
                  Google Maps y desvía quejas de forma diplomática a tu
                  WhatsApp gerencial.
                </p>
              </div>
              <Link
                href="/business/reviews"
                className="text-xs font-semibold text-[#0F291E] underline underline-offset-2"
              >
                Ver Guardián de Reseñas →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================================
          CALCULADORA INTERACTIVA DE ROI GASTRONÓMICO
      ===================================================================== */}
      <section id="calculadora-roi" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="rounded-xl bg-white border border-[#D5D2C8] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Controles Deslizantes */}
          <div className="p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#E8E6DF]">
            <div>
              <span className="text-xs font-mono metric-mono font-semibold uppercase tracking-wider text-[#0F291E]">
                Calculadora de Impacto Financiero
              </span>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#141413] mt-1">
                ¿Cuánto dinero deja tu restaurante sobre la mesa cada mes?
              </h2>
              <p className="text-xs text-[#575653] mt-1">
                Ajusta los deslizadores con los números reales de tu negocio.
              </p>
            </div>

            <div className="space-y-5">
              {/* Slider 1: Chats Diarios */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label htmlFor="roi-chats" className="font-medium text-[#141413]">
                    Conversaciones diarias en WhatsApp
                  </label>
                  <span className="font-mono metric-mono font-bold text-[#0F291E]">
                    {dailyChats} chats / día
                  </span>
                </div>
                <input
                  id="roi-chats"
                  type="range"
                  min={15}
                  max={200}
                  step={5}
                  value={dailyChats}
                  onChange={(e) => setDailyChats(Number(e.target.value))}
                  className="w-full accent-[#0F291E] cursor-pointer"
                />
              </div>

              {/* Slider 2: Ticket Promedio */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label htmlFor="roi-ticket" className="font-medium text-[#141413]">
                    Ticket promedio por pedido (COP)
                  </label>
                  <span className="font-mono metric-mono font-bold text-[#0F291E]">
                    {formatCop(averageTicketCop)} COP
                  </span>
                </div>
                <input
                  id="roi-ticket"
                  type="range"
                  min={25000}
                  max={140000}
                  step={5000}
                  value={averageTicketCop}
                  onChange={(e) => setAverageTicketCop(Number(e.target.value))}
                  className="w-full accent-[#0F291E] cursor-pointer"
                />
              </div>

              {/* Slider 3: Pedidos perdidos en hora pico */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label htmlFor="roi-missed" className="font-medium text-[#141413]">
                    Pedidos diarios que se enfrían por demora en responder
                  </label>
                  <span className="font-mono metric-mono font-bold text-[#D97706]">
                    {missedOrdersPerDay} pedidos / día
                  </span>
                </div>
                <input
                  id="roi-missed"
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={missedOrdersPerDay}
                  onChange={(e) =>
                    setMissedOrdersPerDay(Number(e.target.value))
                  }
                  className="w-full accent-[#D97706] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Resultado Financiero en Vivo */}
          <div className="p-6 sm:p-8 bg-[#0C1F17] text-[#FAF8F5] flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-mono metric-mono uppercase tracking-wider text-emerald-300">
                Proyección Mensual con Agilizio Activo
              </span>
              <div className="text-3xl sm:text-4xl font-bold font-mono metric-mono text-white tracking-tight">
                +{formatCop(roiMetrics.totalMonthlyImpactCop)} COP / mes
              </div>
              <p className="text-xs text-[#E6E4DD]/75">
                Retorno estimado de{' '}
                <strong className="font-mono metric-mono text-emerald-300">
                  {roiMetrics.roiMultiplier}x
                </strong>{' '}
                frente a la suscripción mensual del Plan Pro ($290.000 COP).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-white/[0.06] border border-white/10">
                <span className="text-[11px] text-[#E6E4DD]/70 block">
                  Ventas recuperadas ({roiMetrics.recoveredMonthlyOrders}{' '}
                  pedidos/mes)
                </span>
                <span className="text-base font-mono metric-mono font-bold text-white mt-1 block">
                  {formatCop(roiMetrics.recoveredOrdersRevenueCop)}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white/[0.06] border border-white/10">
                <span className="text-[11px] text-[#E6E4DD]/70 block">
                  Upselling IA (Entradas y Sangría)
                </span>
                <span className="text-base font-mono metric-mono font-bold text-emerald-300 mt-1 block">
                  +{formatCop(roiMetrics.upsellExtraRevenueCop)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#E6E4DD]/80">
                Comprueba estos números en tu propio restaurante durante 14
                días sin pagar un peso.
              </span>
              <Link href="/business/dashboard" className="w-full sm:w-auto">
                <Button variant="amber" size="md" className="w-full">
                  Iniciar Reverse Trial →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          TABLA DE PRECIOS ESCALONADOS EN COP (METODOLOGÍA REVERSE TRIAL)
      ===================================================================== */}
      <section id="planes" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-mono metric-mono font-semibold uppercase tracking-wider text-[#0F291E]">
            Precios Claros en Pesos Colombianos · Sin Costo de Instalación
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-[#141413]">
            Prueba todo el poder Pro durante 14 días. Paga solo cuando veas
            comandas reales.
          </h2>
          <p className="text-xs text-[#575653]">
            Vinculamos directamente tu cuenta de Meta Cloud API (WABA) para que
            nunca pagues intermediación ni sobrecostos ocultos por mensaje.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={[
                'rounded-xl p-6 flex flex-col justify-between transition-all',
                tier.highlighted
                  ? 'bg-white border-2 border-[#0F291E] shadow-lg relative'
                  : 'bg-white border border-[#D5D2C8] shadow-2xs',
              ].join(' ')}
            >
              {tier.badge && (
                <span className=" -top-3 left-6 absolute px-2.5 py-0.5 rounded-full bg-[#0F291E] text-[#FAF8F5] font-mono metric-mono text-[10px] font-semibold tracking-wider">
                  {tier.badge}
                </span>
              )}

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#141413]">
                      {tier.name}
                    </h3>
                    <span className="text-xs font-mono metric-mono text-[#575653] bg-[#F3F1EC] px-2 py-0.5 rounded border border-[#E8E6DF]">
                      {tier.priceUsdApprox}
                    </span>
                  </div>
                  <p className="text-xs text-[#575653] leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="pb-4 border-b border-[#E8E6DF]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-mono metric-mono text-[#141413]">
                      {tier.priceCop}
                    </span>
                    <span className="text-xs font-medium text-[#575653]">
                      COP / mes
                    </span>
                  </div>
                  <span className="mt-1.5 inline-block text-xs font-mono metric-mono font-semibold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                    {tier.conversationsLimit}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-[#141413]">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className="text-[#10B981] font-bold shrink-0">
                        ✓
                      </span>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E8E6DF]">
                <Link href="/business/dashboard" className="block">
                  <Button
                    variant={tier.highlighted ? 'primary' : 'outline'}
                    size="lg"
                    className="w-full"
                  >
                    Probar 14 días gratis sin tarjeta →
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================================
          FOOTER ARQUITECTÓNICO
      ===================================================================== */}
      <footer className="bg-[#0C1F17] text-[#E6E4DD] border-t border-white/10 py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded bg-[#10B981] text-[#0C1F17] font-bold text-xs flex items-center justify-center">
              A
            </div>
            <span className="font-semibold text-white">agilizio</span>
            <span className="text-[#E6E4DD]/50">
              · Recepcionista y Vendedor IA para Restaurantes
            </span>
          </div>

          <div className="flex items-center gap-5 text-[#E6E4DD]/70">
            <Link href="/business/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/business/inbox" className="hover:text-white">
              Bandeja en Vivo
            </Link>
            <Link href="/business/orders" className="hover:text-white">
              Comandas KDS
            </Link>
            <Link href="/business/agent" className="hover:text-white">
              Simulador
            </Link>
            <Link href="/login" className="hover:text-white">
              Acceso Clientes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
