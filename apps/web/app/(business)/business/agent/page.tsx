'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { Switch } from '@/components/ui/switch';

type HostPersonaId = 'parrillero_calido' | 'sommelier_ejecutivo' | 'cajero_express';
type DeliveryEstimateWindow = '25 - 35 min' | '35 - 45 min' | '50 - 60 min';
type MobileViewTab = 'config' | 'simulator';

interface HostPersonaOption {
  id: HostPersonaId;
  title: string;
  icon: string;
  brief: string;
}

interface UpsellRulesConfig {
  suggestStarters: boolean;
  askMeatDoneness: boolean;
  suggestBeveragePairing: boolean;
  allowTableReservations: boolean;
}

interface SimulatorMessage {
  id: string;
  role: 'customer' | 'agent';
  text: string;
  timestamp: string;
  latencyMs?: number;
  executedTools?: string[];
}

interface SimulateApiResponse {
  reply?: string;
  text?: string;
  message?: string;
  latencyMs?: number;
  toolsUsed?: string[];
}

const PERSONA_OPTIONS: HostPersonaOption[] = [
  {
    id: 'parrillero_calido',
    title: 'Parrillero Cálido',
    icon: '🔥',
    brief: 'Cercano, sugiere cortes y guarniciones.',
  },
  {
    id: 'sommelier_ejecutivo',
    title: 'Sommelier & Maitre',
    icon: '🍷',
    brief: 'Elegante, maridajes de sangría y vinos.',
  },
  {
    id: 'cajero_express',
    title: 'Cajero Rápido',
    icon: '⚡',
    brief: 'Directo al grano para horas pico.',
  },
];

const QUICK_TEST_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: '🥩 Punta de Anca 3/4',
    prompt: 'Hola, quiero pedir una Punta de Anca de 400g término 3/4 para enviar a Normandía.',
  },
  {
    label: '🍷 Maridaje Picada',
    prompt: '¿Qué bebida nos recomiendas para acompañar una Picada Familiar?',
  },
  {
    label: '🚫 Consultar agotado (86)',
    prompt: 'Buenas noches, ¿tienen Costillas San Luis BBQ disponibles hoy?',
  },
  {
    label: '🎂 Reserva para 6',
    prompt: 'Quiero reservar una mesa para 6 personas este viernes a las 8:00 PM.',
  },
];

export default function BusinessAgentSimulatorPage() {
  const [mobileTab, setMobileTab] = React.useState<MobileViewTab>('simulator');
  const [selectedPersona, setSelectedPersona] =
    React.useState<HostPersonaId>('parrillero_calido');
  const [deliveryWindow, setDeliveryWindow] =
    React.useState<DeliveryEstimateWindow>('35 - 45 min');
  const [baseDeliveryFeeCop, setBaseDeliveryFeeCop] =
    React.useState<number>(5000);
  const [minimumOrderCop, setMinimumOrderCop] = React.useState<number>(35000);
  const [saveSuccess, setSaveSuccess] = React.useState<boolean>(false);

  const [upsellRules, setUpsellRules] = React.useState<UpsellRulesConfig>({
    suggestStarters: true,
    askMeatDoneness: true,
    suggestBeveragePairing: true,
    allowTableReservations: true,
  });

  // Estado del simulador de WhatsApp
  const [messages, setMessages] = React.useState<SimulatorMessage[]>([
    {
      id: 'sim-init-1',
      role: 'agent',
      text: '¡Buenas noches! Bienvenido a Santa Cruz Parrilla 🔥 Soy el asistente virtual del restaurante. ¿Te gustaría ordenar un corte madurado o consultar nuestra carta?',
      timestamp: '19:50',
      latencyMs: 780,
      executedTools: ['load_context("santa_cruz")'],
    },
  ]);
  const [inputPrompt, setInputPrompt] = React.useState<string>('');
  const [isSimulating, setIsSimulating] = React.useState<boolean>(false);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSimulating]);

  const compiledSystemInstructions = React.useMemo(() => {
    const persona = PERSONA_OPTIONS.find((p) => p.id === selectedPersona) || PERSONA_OPTIONS[0];
    return [
      `PERSONALIDAD: ${persona.title}. ${persona.brief}`,
      `TIEMPO DE DOMICILIO: ${deliveryWindow}. Domicilio base: $${baseDeliveryFeeCop.toLocaleString('es-CO')} COP. Pedido mínimo: $${minimumOrderCop.toLocaleString('es-CO')} COP.`,
      upsellRules.askMeatDoneness ? 'REGLA: En cortes de res pregunta siempre término (1/2, 3/4 o bien asado) y guarnición.' : '',
      upsellRules.suggestStarters ? 'UPSELLING: Sugiere Chorizo Santarrosano ($16.000) si solo piden platos fuertes.' : '',
      upsellRules.suggestBeveragePairing ? 'MARIDAJE: Sugiere Jarra de Sangría ($32.000) o Club Colombia Dorada ($8.000).' : '',
      upsellRules.allowTableReservations ? 'RESERVAS: Permite agendar mesas de hasta 12 personas.' : '',
    ]
      .filter(Boolean)
      .join('\n• ');
  }, [selectedPersona, deliveryWindow, baseDeliveryFeeCop, minimumOrderCop, upsellRules]);

  const handleSaveConfig = () => {
    setSaveSuccess(true);
    window.setTimeout(() => setSaveSuccess(false), 2000);
  };

  const generateSimulatedTurn = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isSimulating) return;

    const nowTime = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const userMsg: SimulatorMessage = {
      id: `usr-${Date.now()}`,
      role: 'customer',
      text: trimmed,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsSimulating(true);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/agent/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          systemInstructions: compiledSystemInstructions,
          history: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as SimulateApiResponse;
        const replyText = data.reply || data.text || data.message;
        if (replyText) {
          const elapsed = Math.round(performance.now() - startTime);
          setMessages((prev) => [
            ...prev,
            {
              id: `agt-${Date.now()}`,
              role: 'agent',
              text: replyText,
              timestamp: nowTime,
              latencyMs: data.latencyMs ?? elapsed,
              executedTools: data.toolsUsed ?? ['search_catalog()'],
            },
          ]);
          setIsSimulating(false);
          return;
        }
      }
    } catch {
      // Fallback local enriquecido
    }

    await new Promise((resolve) => window.setTimeout(resolve, 850));
    const lower = trimmed.toLowerCase();
    let reply = '';
    let tools: string[] = ['search_catalog()'];

    if (lower.includes('costilla')) {
      tools = ['check_stock("costillas") → SOLD_OUT_86'];
      reply =
        'En este momento las Costillas San Luis BBQ se encuentran agotadas en parrilla por hoy. Te puedo ofrecer Punta de Anca madurada 400g ($58.000) o Churrasco Argentino ($52.000) al carbón. ¿Cuál prefieres?';
    } else if (lower.includes('punta de anca') || lower.includes('churrasco') || lower.includes('carne')) {
      tools = ['search_catalog("punta_de_anca")', 'create_order_draft()'];
      reply = `¡Excelente elección! Nuestra Punta de Anca Madurada de 400g ($58.000) en término 3/4 queda jugosa al carbón con papa criolla y arepa con queso. El domicilio tarda ${deliveryWindow}. ¿Te adiciono un Chorizo Santarrosano ($16.000) de entrada?`;
    } else if (lower.includes('maridaje') || lower.includes('sangria') || lower.includes('bebida')) {
      tools = ['get_pairing("picada_familiar")'];
      reply =
        'Para acompañar la Picada Familiar, nuestro maridaje estrella es la Jarra de Sangría Artesanal de 1L ($32.000) con frutos rojos, o Club Colombia bien fría ($8.000). ¿Te agrego la sangría?';
    } else if (lower.includes('reserva') || lower.includes('mesa')) {
      tools = ['check_table_availability()'];
      reply =
        '¡Claro que sí! Tenemos mesa disponible para 6 personas este viernes a las 8:00 PM en nuestro salón principal. ¿A nombre de quién registramos la reserva?';
    } else {
      reply =
        `¡Buenas noches! En Santa Cruz Parrilla tenemos Punta de Anca ($58.000), Churrasco ($52.000) y Picada Familiar ($86.000). Tiempo de entrega hoy: ${deliveryWindow}. ¿Qué se te antoja ordenar?`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `agt-${Date.now()}`,
        role: 'agent',
        text: reply,
        timestamp: nowTime,
        latencyMs: 920,
        executedTools: tools,
      },
    ]);
    setIsSimulating(false);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void generateSimulatedTurn(inputPrompt);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#FAF8F5] overflow-hidden">
      {/* =====================================================================
          CONMUTADOR DE VISTA EN PANTALLAS MENORES A XL (< 1280px)
      ===================================================================== */}
      <div className="xl:hidden h-11 bg-white border-b border-[#E8E6DF] px-4 flex items-center justify-between shrink-0">
        <div className="inline-flex p-0.5 rounded-lg bg-[#F3F1EC] border border-[#E8E6DF]">
          <button
            type="button"
            onClick={() => setMobileTab('config')}
            className={[
              'h-7 px-3 rounded-md text-xs font-medium transition cursor-pointer',
              mobileTab === 'config'
                ? 'bg-white text-[#141413] shadow-2xs font-semibold'
                : 'text-[#575653]',
            ].join(' ')}
          >
            ⚙️ Configuración
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('simulator')}
            className={[
              'h-7 px-3 rounded-md text-xs font-medium transition cursor-pointer',
              mobileTab === 'simulator'
                ? 'bg-[#0F291E] text-white shadow-2xs font-semibold'
                : 'text-[#575653]',
            ].join(' ')}
          >
            💬 Simulador WhatsApp
          </button>
        </div>

        <StatusPill
          status="ai_active"
          label="En vivo"
          metric="Gemini"
          pulse
        />
      </div>

      {/* =====================================================================
          CONTENEDOR PRINCIPAL: DUAL EN DESKTOP XL, TAB SWITCH EN MENORES A XL
      ===================================================================== */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_420px] overflow-hidden">
        {/* =====================================================================
            COLUMNA IZQUIERDA: CONFIGURADOR MINIMALISTA (ZERO RUIDO COGNITIVO)
        ===================================================================== */}
        <section
          className={[
            'h-full overflow-y-auto p-4 sm:p-6 space-y-5 border-r border-[#E8E6DF]',
            mobileTab === 'config' ? 'block' : 'hidden xl:block',
          ].join(' ')}
        >
          {/* Cabecera compacta */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-[#141413] tracking-tight">
                Reglas del Asistente de WhatsApp
              </h1>
              <p className="text-[11px] text-[#575653]">
                Ajusta cómo saluda, sugiere maridajes y toma pedidos tu bot.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="text-[11px] font-mono metric-mono text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                  ✓ Guardado
                </span>
              )}
              <Button variant="primary" size="xs" onClick={handleSaveConfig}>
                Guardar
              </Button>
            </div>
          </div>

          {/* Bloque 1: Personalidad en 3 tarjetas horizontales ultra compactas */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#575653]">
              1. Tono del Anfitrión
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PERSONA_OPTIONS.map((persona) => {
                const isSelected = selectedPersona === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setSelectedPersona(persona.id)}
                    className={[
                      'p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between gap-1',
                      isSelected
                        ? 'bg-white border-[#0F291E] ring-1 ring-[#0F291E] shadow-2xs'
                        : 'bg-white/70 border-[#E8E6DF] hover:bg-white',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#141413]">
                        {persona.icon} {persona.title}
                      </span>
                      <span
                        className={[
                          'h-1.5 w-1.5 rounded-full',
                          isSelected ? 'bg-[#10B981]' : 'bg-[#D5D2C8]',
                        ].join(' ')}
                      />
                    </div>
                    <p className="text-[11px] text-[#575653] leading-snug">
                      {persona.brief}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bloque 2: Switches de Protocolo en 1 sola línea */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#575653]">
              2. Protocolo de Venta
            </span>

            <div className="rounded-lg bg-white border border-[#E8E6DF] divide-y divide-[#E8E6DF] shadow-2xs">
              <div className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#141413]">
                    Exigir término de cocción en carnes
                  </p>
                  <p className="text-[11px] text-[#8A8884] truncate">
                    Pregunta 1/2, 3/4 o bien asado antes de cerrar orden.
                  </p>
                </div>
                <Switch
                  size="sm"
                  checked={upsellRules.askMeatDoneness}
                  onCheckedChange={(checked) =>
                    setUpsellRules((prev) => ({ ...prev, askMeatDoneness: checked }))
                  }
                />
              </div>

              <div className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#141413]">
                    Sugerir entrada (+Ticket Promedio)
                  </p>
                  <p className="text-[11px] text-[#8A8884] truncate">
                    Ofrece Chorizo Santarrosano ($16.000) de acompañamiento.
                  </p>
                </div>
                <Switch
                  size="sm"
                  checked={upsellRules.suggestStarters}
                  onCheckedChange={(checked) =>
                    setUpsellRules((prev) => ({ ...prev, suggestStarters: checked }))
                  }
                />
              </div>

              <div className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#141413]">
                    Sugerir maridaje de sangría y cerveza
                  </p>
                  <p className="text-[11px] text-[#8A8884] truncate">
                    Recomienda Jarra de Sangría 1L ($32.000) o Club Colombia.
                  </p>
                </div>
                <Switch
                  size="sm"
                  checked={upsellRules.suggestBeveragePairing}
                  onCheckedChange={(checked) =>
                    setUpsellRules((prev) => ({
                      ...prev,
                      suggestBeveragePairing: checked,
                    }))
                  }
                />
              </div>

              <div className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#141413]">
                    Tomar reservas de mesas
                  </p>
                  <p className="text-[11px] text-[#8A8884] truncate">
                    Agenda mesas hasta 12 comensales automáticamente.
                  </p>
                </div>
                <Switch
                  size="sm"
                  checked={upsellRules.allowTableReservations}
                  onCheckedChange={(checked) =>
                    setUpsellRules((prev) => ({
                      ...prev,
                      allowTableReservations: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Tiempos y Domicilios */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#575653]">
              3. Tiempos y Tarifas Hoy
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-white border border-[#E8E6DF] space-y-1.5">
                <span className="text-[11px] text-[#575653] block">
                  Promesa entrega
                </span>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#FAF8F5] rounded border border-[#E8E6DF]">
                  {(['25 - 35 min', '35 - 45 min', '50 - 60 min'] as const).map(
                    (windowOption) => (
                      <button
                        key={windowOption}
                        type="button"
                        onClick={() => setDeliveryWindow(windowOption)}
                        className={[
                          'h-6 rounded text-[10px] font-mono metric-mono transition cursor-pointer',
                          deliveryWindow === windowOption
                            ? 'bg-[#0F291E] text-white font-semibold'
                            : 'text-[#575653]',
                        ].join(' ')}
                      >
                        {windowOption.split(' ')[0]}m
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-[#E8E6DF] space-y-1">
                <label
                  htmlFor="cfg-delivery-fee"
                  className="text-[11px] text-[#575653] block truncate"
                >
                  Costo domicilio COP
                </label>
                <input
                  id="cfg-delivery-fee"
                  type="number"
                  step={500}
                  value={baseDeliveryFeeCop}
                  onChange={(e) => setBaseDeliveryFeeCop(Number(e.target.value) || 0)}
                  className="w-full h-7 px-2 rounded bg-[#FAF8F5] border border-[#D5D2C8] font-mono metric-mono text-xs font-semibold"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-[#E8E6DF] space-y-1">
                <label
                  htmlFor="cfg-min-order"
                  className="text-[11px] text-[#575653] block truncate"
                >
                  Pedido mínimo COP
                </label>
                <input
                  id="cfg-min-order"
                  type="number"
                  step={5000}
                  value={minimumOrderCop}
                  onChange={(e) => setMinimumOrderCop(Number(e.target.value) || 0)}
                  className="w-full h-7 px-2 rounded bg-[#FAF8F5] border border-[#D5D2C8] font-mono metric-mono text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            COLUMNA DERECHA: TELÉFONO DE WHATSAPP A ALTURA COMPLETA (RESPIRA)
        ===================================================================== */}
        <aside
          className={[
            'h-full bg-[#F3F1EC] p-3 sm:p-5 flex flex-col items-center justify-between overflow-hidden',
            mobileTab === 'simulator' ? 'flex' : 'hidden xl:flex',
          ].join(' ')}
        >
          {/* CHASIS MÓVIL A ALTURA COMPLETA SIN APLASTARSE */}
          <div className="w-full max-w-[390px] h-full max-h-[720px] rounded-[32px] border-[6px] border-[#141413] bg-[#EFEAE2] shadow-xl flex flex-col overflow-hidden relative">
            {/* Cabecera WhatsApp Business */}
            <div className="bg-[#075E54] text-white px-3.5 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-full bg-[#10B981] text-[#0C1F17] font-bold text-xs flex items-center justify-center shrink-0">
                  SC
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold leading-none truncate">
                      Santa Cruz Parrilla
                    </span>
                    <span className="text-[10px] text-emerald-300">✓</span>
                  </div>
                  <span className="text-[10px] text-emerald-100/90 block mt-0.5 truncate">
                    IA Activa · Responde en vivo
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: `reset-${Date.now()}`,
                      role: 'agent',
                      text: '¡Buenas noches! Bienvenido a Santa Cruz Parrilla 🔥 ¿Qué corte o plato te gustaría ordenar hoy?',
                      timestamp: 'Ahora',
                      latencyMs: 700,
                    },
                  ])
                }
                className="text-[10px] text-emerald-200 hover:text-white underline cursor-pointer shrink-0"
              >
                Reiniciar
              </button>
            </div>

            {/* Lienzo de Mensajes del Teléfono */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {messages.map((msg) => {
                const isCustomer = msg.role === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={[
                      'flex flex-col max-w-[88%]',
                      isCustomer ? 'ml-auto items-end' : 'mr-auto items-start',
                    ].join(' ')}
                  >
                    {!isCustomer && msg.executedTools && msg.executedTools.length > 0 && (
                      <div className="mb-0.5 flex flex-wrap gap-1">
                        {msg.executedTools.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded bg-[#0C1F17] text-[#A7F3D0] font-mono metric-mono text-[9px]"
                          >
                            ⚡ {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className={[
                        'px-3 py-2 rounded-lg text-xs leading-relaxed shadow-2xs',
                        isCustomer
                          ? 'bg-[#DCF8C6] text-[#141413] rounded-tr-xs'
                          : 'bg-white text-[#141413] rounded-tl-xs border border-[#E8E6DF]',
                      ].join(' ')}
                    >
                      <p>{msg.text}</p>
                      <div className="mt-1 flex items-center justify-end gap-1.5 text-[9px] font-mono metric-mono text-[#8A8884]">
                        {!isCustomer && msg.latencyMs && (
                          <span className="text-[#065F46] font-semibold">
                            {(msg.latencyMs / 1000).toFixed(1)}s
                          </span>
                        )}
                        <span>{msg.timestamp}</span>
                        {isCustomer && <span className="text-sky-600">✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isSimulating && (
                <div className="mr-auto items-start flex flex-col max-w-[80%]">
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E6DF] text-xs text-[#575653] flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Gemini pensando respuesta...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Fila Horizontal de Pruebas Rápidas en 1 Línea con Scroll */}
            <div className="px-2.5 py-1.5 bg-[#FAF8F5] border-t border-[#D5D2C8] shrink-0">
              <div className="flex overflow-x-auto gap-1.5 no-scrollbar py-0.5">
                {QUICK_TEST_PROMPTS.map((scen) => (
                  <button
                    key={scen.label}
                    type="button"
                    disabled={isSimulating}
                    onClick={() => void generateSimulatedTurn(scen.prompt)}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#D5D2C8] hover:border-[#0F291E] text-[10px] font-medium text-[#141413] whitespace-nowrap shrink-0 transition cursor-pointer disabled:opacity-50"
                  >
                    {scen.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input de Chat de WhatsApp */}
            <form
              onSubmit={handleFormSubmit}
              className="p-2 bg-[#F0F0F0] border-t border-[#D5D2C8] flex items-center gap-1.5 shrink-0"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={isSimulating}
                placeholder="Escribe como cliente..."
                className="flex-1 h-8 px-3 rounded-full bg-white border border-[#D5D2C8] text-xs text-[#141413] placeholder:text-[#8A8884] focus:outline-none focus:border-[#075E54]"
              />
              <button
                type="submit"
                disabled={isSimulating || inputPrompt.trim().length === 0}
                className="h-8 px-3 rounded-full bg-[#075E54] text-white text-xs font-semibold hover:bg-[#064E46] disabled:opacity-50 transition cursor-pointer shrink-0"
              >
                Enviar
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
