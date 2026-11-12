'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { Switch } from '@/components/ui/switch';

interface ExecutiveKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  sublabel: string;
}

interface HourlyTrafficSlot {
  hourLabel: string;
  conversations: number;
  ordersClosed: number;
  revenueCop: number;
  isPeak?: boolean;
}

interface TopAiProduct {
  rank: number;
  name: string;
  category: string;
  unitsSoldByAi: number;
  revenueCop: number;
  upsellPairingRate: string;
  available: boolean;
}

const EXECUTIVE_KPIS: ExecutiveKpi[] = [
  {
    id: 'kpi-revenue',
    label: 'Ventas Cerradas por IA (7 días)',
    value: '$6.480.000',
    delta: '+24.8%',
    deltaPositive: true,
    sublabel: '92 comandas pagadas vía WhatsApp sin intervención humana',
  },
  {
    id: 'kpi-Ticket',
    label: 'Ticket Promedio con Upselling IA',
    value: '$70.430',
    delta: '+$12.400 vs manual',
    deltaPositive: true,
    sublabel: '38% aceptó sugerencia de entrada o maridaje de sangría',
  },
  {
    id: 'kpi-speed',
    label: 'Tiempo de Respuesta en Hora Pico',
    value: '1.1 seg',
    delta: '-13 min vs cajero',
    deltaPositive: true,
    sublabel: '0 chats abandonados en viernes y sábado de 7:00 PM a 10:00 PM',
  },
  {
    id: 'kpi-handoff',
    label: 'Resolución Autónoma (Deflection)',
    value: '91.4%',
    delta: 'Solo 2 Handoffs hoy',
    deltaPositive: true,
    sublabel: '214 conversaciones resueltas de principio a fin por Agilizio',
  },
];

const HOURLY_WHATSAPP_TRAFFIC: HourlyTrafficSlot[] = [
  { hourLabel: '12:00', conversations: 28, ordersClosed: 14, revenueCop: 890000 },
  {
    hourLabel: '13:00',
    conversations: 42,
    ordersClosed: 23,
    revenueCop: 1540000,
    isPeak: true,
  },
  { hourLabel: '14:00', conversations: 31, ordersClosed: 16, revenueCop: 1020000 },
  { hourLabel: '16:00', conversations: 12, ordersClosed: 5, revenueCop: 310000 },
  { hourLabel: '18:00', conversations: 29, ordersClosed: 15, revenueCop: 980000 },
  {
    hourLabel: '19:00',
    conversations: 54,
    ordersClosed: 31,
    revenueCop: 2240000,
    isPeak: true,
  },
  {
    hourLabel: '20:00',
    conversations: 61,
    ordersClosed: 36,
    revenueCop: 2680000,
    isPeak: true,
  },
  {
    hourLabel: '21:00',
    conversations: 38,
    ordersClosed: 19,
    revenueCop: 1390000,
  },
];

const TOP_AI_DISHES: TopAiProduct[] = [
  {
    rank: 1,
    name: 'Punta de Anca Madurada 400g',
    category: 'Cortes de Res',
    unitsSoldByAi: 46,
    revenueCop: 2668000,
    upsellPairingRate: '64% con Chorizo',
    available: true,
  },
  {
    rank: 2,
    name: 'Picada Santa Cruz Familiar (4 Pers)',
    category: 'Para Compartir',
    unitsSoldByAi: 24,
    revenueCop: 2064000,
    upsellPairingRate: '71% con Sangría 1L',
    available: true,
  },
  {
    rank: 3,
    name: 'Churrasco Argentino 350g',
    category: 'Cortes de Res',
    unitsSoldByAi: 31,
    revenueCop: 1612000,
    upsellPairingRate: '48% con Club Colombia',
    available: true,
  },
  {
    rank: 4,
    name: 'Baby Beef 350g',
    category: 'Cortes de Res',
    unitsSoldByAi: 19,
    revenueCop: 1026000,
    upsellPairingRate: '42% con Limonada Coco',
    available: true,
  },
  {
    rank: 5,
    name: 'Costillas San Luis BBQ 500g',
    category: 'Cerdo y Aves',
    unitsSoldByAi: 14,
    revenueCop: 686000,
    upsellPairingRate: '50% con Papa Criolla',
    available: false,
  },
];

function formatCop(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`;
}

export default function BusinessExecutiveDashboardPage() {
  // Switches operativos de inicio de turno
  const [aiAutopilotEnabled, setAiAutopilotEnabled] = React.useState<boolean>(true);
  const [rainyModeDelayEnabled, setRainyModeDelayEnabled] =
    React.useState<boolean>(false);
  const [upsellAggressiveEnabled, setUpsellAggressiveEnabled] =
    React.useState<boolean>(true);

  const maxHourlyConversations = React.useMemo(() => {
    return Math.max(...HOURLY_WHATSAPP_TRAFFIC.map((s) => s.conversations), 1);
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto bg-[#FAF8F5] p-6 space-y-6">
      {/* =====================================================================
          CABECERA EJECUTIVA + ACCIONES RÁPIDAS DE INICIO DE TURNO
      ===================================================================== */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold text-[#141413] tracking-[-0.02em]">
              Centro de Mando · Santa Cruz Parrilla
            </h1>
            <StatusPill
              status={aiAutopilotEnabled ? 'ai_active' : 'human_handoff'}
              label={
                aiAutopilotEnabled
                  ? 'Recepcionista IA Activo'
                  : 'IA en Pausa Manual'
              }
              metric={rainyModeDelayEnabled ? 'Domicilio 50m' : 'Domicilio 35m'}
              pulse={aiAutopilotEnabled}
            />
          </div>
          <p className="text-xs text-[#575653] mt-0.5">
            Rendimiento comercial en tiempo real de tu canal de WhatsApp y
            estado operativo de cocina.
          </p>
        </div>

        {/* Botones de Navegación Operativa Directa */}
        <div className="flex items-center gap-2">
          <Link href="/business/inbox">
            <Button variant="amber" size="sm">
              🔥 Atender 2 Handoffs en Vivo
            </Button>
          </Link>
          <Link href="/business/orders">
            <Button variant="outline" size="sm">
              Ver 5 Comandas en KDS →
            </Button>
          </Link>
          <Link href="/business/agent">
            <Button variant="primary" size="sm">
              Probar Simulador
            </Button>
          </Link>
        </div>
      </header>

      {/* =====================================================================
          BARRA DE CONTROLES RÁPIDOS DE TURNO (ERGONOMÍA PARA ADMINISTRADOR)
      ===================================================================== */}
      <section
        aria-label="Controles rápidos de turno"
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <div className="p-3.5 rounded-lg bg-white border border-[#E8E6DF] shadow-2xs flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#141413]">
              Piloto Automático 24/7 en WhatsApp
            </p>
            <p className="text-[11px] text-[#575653]">
              Responde catálogo, toma pedidos y confirma pagos Nequi.
            </p>
          </div>
          <Switch
            variant="emerald"
            checked={aiAutopilotEnabled}
            onCheckedChange={setAiAutopilotEnabled}
          />
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-[#E8E6DF] shadow-2xs flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#141413]">
              🌧️ Modo Lluvia / Alta Congestión (+15 min)
            </p>
            <p className="text-[11px] text-[#575653]">
              Ajusta la promesa de entrega del bot de 35m a 50m al instante.
            </p>
          </div>
          <Switch
            variant="amber"
            checked={rainyModeDelayEnabled}
            onCheckedChange={setRainyModeDelayEnabled}
          />
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-[#E8E6DF] shadow-2xs flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#141413]">
              🍷 Upselling de Sangría y Entradas
            </p>
            <p className="text-[11px] text-[#575653]">
              Sugiere maridaje antes de generar el resumen de cobro.
            </p>
          </div>
          <Switch
            variant="forest"
            checked={upsellAggressiveEnabled}
            onCheckedChange={setUpsellAggressiveEnabled}
          />
        </div>
      </section>

      {/* =====================================================================
          TARJETAS KPI EJECUTIVAS (ALTA DENSIDAD + .METRIC-MONO)
      ===================================================================== */}
      <section
        aria-label="Indicadores clave de rendimiento"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {EXECUTIVE_KPIS.map((kpi) => (
          <article
            key={kpi.id}
            className="p-4 rounded-lg bg-white border border-[#D5D2C8] shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#575653]">
                {kpi.label}
              </span>
              <span
                className={[
                  'px-1.5 py-0.5 rounded text-[10px] font-mono metric-mono font-semibold border',
                  kpi.deltaPositive
                    ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                    : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
                ].join(' ')}
              >
                {kpi.delta}
              </span>
            </div>

            <div className="text-2xl font-bold font-mono metric-mono text-[#141413] tracking-tight">
              {kpi.value}
            </div>

            <p className="text-[11px] text-[#8A8884] leading-snug">
              {kpi.sublabel}
            </p>
          </article>
        ))}
      </section>

      {/* =====================================================================
          SECCIÓN CENTRAL: HORAS PICO WHATSAPP + PLATOS MÁS VENDIDOS POR LA IA
      ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.15fr] gap-5">
        {/* Panel Izquierdo: Curva de Horas Pico y Conversión en WhatsApp */}
        <section className="p-5 rounded-lg bg-white border border-[#E8E6DF] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#141413]">
                Horas Pico de Atención en WhatsApp
              </h2>
              <p className="text-[11px] text-[#575653]">
                Volumen de chats vs. pedidos facturados por franja horaria
              </p>
            </div>
            <span className="text-[11px] font-mono metric-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E6DF] text-[#141413]">
              Pico: 19:00 - 20:30
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {HOURLY_WHATSAPP_TRAFFIC.map((slot) => {
              const widthPercent = Math.round(
                (slot.conversations / maxHourlyConversations) * 100
              );
              const conversionRate = Math.round(
                (slot.ordersClosed / slot.conversations) * 100
              );

              return (
                <div key={slot.hourLabel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono metric-mono font-semibold text-[#141413] w-11">
                        {slot.hourLabel}
                      </span>
                      {slot.isPeak && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono metric-mono font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
                          HORA PICO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono metric-mono text-[11px]">
                      <span className="text-[#575653]">
                        {slot.conversations} chats
                      </span>
                      <span className="text-[#065F46] font-semibold">
                        → {slot.ordersClosed} pedidos ({conversionRate}%)
                      </span>
                      <span className="text-[#141413] font-semibold w-20 text-right">
                        {formatCop(slot.revenueCop)}
                      </span>
                    </div>
                  </div>

                  {/* Barra proporcional de tráfico */}
                  <div className="w-full h-2 rounded-full bg-[#F3F1EC] overflow-hidden">
                    <div
                      className={[
                        'h-full rounded-full transition-all duration-300',
                        slot.isPeak ? 'bg-[#0F291E]' : 'bg-[#10B981]/75',
                      ].join(' ')}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E8E6DF] flex items-center justify-between text-xs">
            <span className="text-[#575653]">
              💡 <strong>Insight Operativo:</strong> El 58% de las ventas por
              WhatsApp entran entre las 7:00 PM y 9:00 PM cuando la caja física
              está más congestionada.
            </span>
          </div>
        </section>

        {/* Panel Derecho: Platos Estrella Vendidos por el Agente IA */}
        <section className="p-5 rounded-lg bg-white border border-[#E8E6DF] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#141413]">
                Platos Más Vendidos por el Agente IA
              </h2>
              <p className="text-[11px] text-[#575653]">
                Desempeño por corte, efectividad de maridaje y disponibilidad en
                cocina
              </p>
            </div>
            <Link
              href="/business/orders"
              className="text-xs font-medium text-[#0F291E] underline underline-offset-2"
            >
              Gestionar agotados (86) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E6DF] text-[10px] font-semibold uppercase tracking-wider text-[#8A8884]">
                  <th className="pb-2.5 pr-2">#</th>
                  <th className="pb-2.5 px-2">Plato / Corte</th>
                  <th className="pb-2.5 px-2">Upselling IA</th>
                  <th className="pb-2.5 px-2 text-right">Unid.</th>
                  <th className="pb-2.5 pl-2 text-right">Ventas COP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6DF] text-xs">
                {TOP_AI_DISHES.map((dish) => (
                  <tr
                    key={dish.rank}
                    className="hover:bg-[#FAF8F5]/80 transition-colors"
                  >
                    <td className="py-3 pr-2 font-mono metric-mono font-bold text-[#8A8884]">
                      0{dish.rank}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            'font-semibold',
                            dish.available
                              ? 'text-[#141413]'
                              : 'text-[#8A8884] line-through',
                          ].join(' ')}
                        >
                          {dish.name}
                        </span>
                        {!dish.available && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono metric-mono font-semibold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
                            86 · AGOTADO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8A8884] block">
                        {dish.category}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded bg-[#EEF5F1] text-[#0F291E] border border-[#CDE2D6] font-mono metric-mono text-[10px] font-medium">
                        {dish.upsellPairingRate}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono metric-mono font-semibold text-[#141413]">
                      {dish.unitsSoldByAi}
                    </td>
                    <td className="py-3 pl-2 text-right font-mono metric-mono font-bold text-[#0F291E]">
                      {formatCop(dish.revenueCop)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-[#E8E6DF] flex items-center justify-between text-xs text-[#575653]">
            <span>
              Ingresos adicionales generados solo por preguntas de maridaje:
            </span>
            <span className="font-mono metric-mono font-bold text-[#065F46]">
              +$1.120.000 COP esta semana
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
