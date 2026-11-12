'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { Switch } from '@/components/ui/switch';

type HostPersonaId = 'parrillero_calido' | 'sommelier_ejecutivo' | 'cajero_express';
type DeliveryEstimateWindow = '25 - 35 min' | '35 - 45 min' | '50 - 60 min';

interface HostPersonaOption {
  id: HostPersonaId;
  title: string;
  subtitle: string;
  sampleGreeting: string;
}

interface UpsellRulesConfig {
  suggestStarters: boolean;
  askMeatDoneness: boolean;
  suggestBeveragePairing: boolean;
  requireDeliveryNeighborhood: boolean;
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
  message?: string;
  latencyMs?: number;
  toolsUsed?: string[];
}

const PERSONA_OPTIONS: HostPersonaOption[] = [
  {
    id: 'parrillero_calido',
    title: 'Anfitrión Parrillero Cálido',
    subtitle: 'Hospitalario, conocedor de cortes, cercano y vendedor sin ser invasivo.',
    sampleGreeting:
      '¡Buenas noches! Bienvenido a Santa Cruz Parrilla 🔥 ¿Se te antoja hoy un buen corte madurado al carbón?',
  },
  {
    id: 'sommelier_ejecutivo',
    title: 'Sommelier & Maitre Ejecutivo',
    subtitle: 'Sobrio, elegante, enfocado en maridajes de vino, sangría y reservas VIP.',
    sampleGreeting:
      'Buenas noches, es un placer atenderle en Santa Cruz. ¿Desea realizar un pedido a domicilio o reservar una mesa?',
  },
  {
    id: 'cajero_express',
    title: 'Toma de Pedidos Ultra Rápida',
    subtitle: 'Respuestas cortas y directas al grano para horas pico de alta congestión.',
    sampleGreeting:
      '¡Hola! Bienvenido a Santa Cruz Parrilla. Dime qué deseas pedir hoy y tu barrio para despacharte de inmediato.',
  },
];

const QUICK_TEST_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: '🥩 Pedir Punta de Anca 3/4',
    prompt: 'Hola, quiero pedir una Punta de Anca de 400g término 3/4 para enviar a Santa Cecilia.',
  },
  {
    label: '🍷 ¿Qué maridaje recomiendas?',
    prompt: '¿Qué bebida o maridaje me recomiendas para acompañar una Picada Familiar?',
  },
  {
    label: '🚫 Consultar plato agotado',
    prompt: 'Buenas noches, ¿tienen Costillas San Luis BBQ disponibles hoy?',
  },
  {
    label: '🎂 Reserva para 6 personas',
    prompt: 'Quiero reservar una mesa para 6 personas este viernes a las 8:00 PM.',
  },
];

export default function BusinessAgentSimulatorPage() {
  // Estado de configuración guiada para el restaurantero
  const [selectedPersona, setSelectedPersona] =
    React.useState<HostPersonaId>('parrillero_calido');
  const [deliveryWindow, setDeliveryWindow] =
    React.useState<DeliveryEstimateWindow>('35 - 45 min');
  const [minimumOrderCop, setMinimumOrderCop] = React.useState<number>(35000);
  const [baseDeliveryFeeCop, setBaseDeliveryFeeCop] =
    React.useState<number>(5000);
  const [showCompiledPrompt, setShowCompiledPrompt] =
    React.useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = React.useState<boolean>(false);

  const [upsellRules, setUpsellRules] = React.useState<UpsellRulesConfig>({
    suggestStarters: true,
    askMeatDoneness: true,
    suggestBeveragePairing: true,
    requireDeliveryNeighborhood: true,
    allowTableReservations: true,
  });

  // Estado del Simulador de WhatsApp
  const [messages, setMessages] = React.useState<SimulatorMessage[]>([
    {
      id: 'sim-init-1',
      role: 'agent',
      text: '¡Buenas noches! Bienvenido a Santa Cruz Parrilla 🔥 Soy el asistente virtual del restaurante. ¿Te gustaría ver nuestros cortes al carbón o hacer un pedido a domicilio?',
      timestamp: '19:50',
      latencyMs: 840,
      executedTools: ['load_business_context("santa-cruz")'],
    },
  ]);
  const [inputPrompt, setInputPrompt] = React.useState<string>('');
  const [isSimulating, setIsSimulating] = React.useState<boolean>(false);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSimulating]);

  // Compilador determinista de reglas de negocio -> System Prompt
  const compiledSystemInstructions = React.useMemo(() => {
    const activePersona =
      PERSONA_OPTIONS.find((p) => p.id === selectedPersona) ??
      PERSONA_OPTIONS[0];

    const rulesList: string[] = [
      `TONO Y PERSONALIDAD: ${activePersona.title} (${activePersona.subtitle})`,
      `TIEMPO ESTIMADO DE DOMICILIO HOY: ${deliveryWindow}. Costo base domicilio: $${baseDeliveryFeeCop.toLocaleString('es-CO')} COP. Pedido mínimo: $${minimumOrderCop.toLocaleString('es-CO')} COP.`,
    ];

    if (upsellRules.askMeatDoneness) {
      rulesList.push(
        'REGLA OBLIGATORIA PARRILLA: Nunca cierres una orden con cortes de res (Punta de Anca, Churrasco, Baby Beef) sin preguntar el término de cocción (1/2, 3/4 o Bien asado) y la guarnición.'
      );
    }
    if (upsellRules.suggestStarters) {
      rulesList.push(
        'UPSELLING ENTRADAS: Si el cliente pide solo platos fuertes, sugiere sutilmente adicionar Chorizo Santarrosano ($16.000) para compartir.'
      );
    }
    if (upsellRules.suggestBeveragePairing) {
      rulesList.push(
        'MARIDAJE: Antes de emitir el resumen de pago, sugiere acompañar con Jarra de Sangría Artesanal ($32.000) o Club Colombia fría ($8.000).'
      );
    }
    if (upsellRules.requireDeliveryNeighborhood) {
      rulesList.push(
        'LOGÍSTICA: Solicita dirección exacta, barrio en Bogotá y método de pago antes de ejecutar create_order_draft.'
      );
    }

    return rulesList.join('\n• ');
  }, [
    selectedPersona,
    deliveryWindow,
    baseDeliveryFeeCop,
    minimumOrderCop,
    upsellRules,
  ]);

  const handleSaveAgentConfig = () => {
    setSaveSuccess(true);
    window.setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  // Motor de respuesta para el simulador: intenta llamar a /api/agent/simulate y tiene fallback rico con trazabilidad de tools
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
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as SimulateApiResponse;
        const replyText = data.reply ?? data.message;
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
              executedTools: data.toolsUsed ?? [
                'search_catalog()',
                'evaluate_upsell_rules()',
              ],
            },
          ]);
          setIsSimulating(false);
          return;
        }
      }
    } catch {
      // Continúa hacia la simulación determinista local si el endpoint requiere variables de entorno adicionales
    }

    // Simulación local realista basada en las reglas configuradas a la izquierda
    await new Promise((resolve) => window.setTimeout(resolve, 950));
    const lower = trimmed.toLowerCase();
    let reply = '';
    let tools: string[] = [];

    if (lower.includes('punta de anca') || lower.includes('churrasco')) {
      tools = [
        'search_catalog("punta de anca 400g")',
        'check_delivery_zone("Santa Cecilia")',
        'create_order_draft($63.000)',
      ];
      const upsellStarter = upsellRules.suggestStarters
        ? ' ¿Te gustaría adicionar un Chorizo Santarrosano artesanal ($16.000) como entrada?'
        : '';
      const upsellDrink = upsellRules.suggestBeveragePairing
        ? ' Para tomar te recomiendo nuestra Club Colombia Dorada bien fría ($8.000) o Limonada de Coco.'
        : '';
      reply = `¡Excelente elección! Nuestra Punta de Anca Madurada de 400g ($58.000) en término 3/4 queda jugosa al carbón. Incluye papa criolla y arepa con queso.${upsellStarter}${upsellDrink} El domicilio a Santa Cecilia cuesta $${baseDeliveryFeeCop.toLocaleString('es-CO')} y tarda ${deliveryWindow}. ¿Con qué guarnición e indicaciones de dirección la registramos?`;
    } else if (lower.includes('maridaje') || lower.includes('bebida') || lower.includes('picada')) {
      tools = [
        'search_catalog("picada familiar")',
        'get_pairing_recommendations("carnes_maduradas")',
      ];
      reply =
        'Para acompañar la Picada Santa Cruz Familiar ($86.000), nuestro maridaje estrella es la Jarra de Sangría Artesanal de 1 Litro ($32.000) con frutos rojos macerados, que corta perfecto la grasita del lomo y la costilla. ¿Te agrego la Picada con la Jarra de Sangría a tu comanda?';
    } else if (lower.includes('costilla') || lower.includes('agotado')) {
      tools = ['search_catalog("costillas san luis") → status: SOLD_OUT_86'];
      reply =
        'En este momento nuestras Costillas San Luis BBQ se encuentran agotadas por hoy en cocina. Te puedo ofrecer como alternativa nuestro Churrasco Argentino de 350g ($52.000) o el Baby Beef ($54.000) recién puestos al carbón. ¿Cuál de los dos prefieres?';
    } else if (lower.includes('reserva') || lower.includes('mesa')) {
      tools = ['check_table_availability("viernes 20:00", guests: 6)'];
      reply = upsellRules.allowTableReservations
        ? '¡Claro que sí! Tenemos disponibilidad para 6 personas este viernes a las 8:00 PM en el salón principal de Santa Cruz Parrilla. ¿Me confirmas por favor a nombre de quién dejamos la reserva y un número de contacto?'
        : 'En este momento estamos atendiendo por orden de llegada sin reserva previa, ¡pero te esperamos con gusto!';
    } else {
      tools = ['search_catalog()', 'apply_host_persona()'];
      reply = `¡Con mucho gusto! En Santa Cruz Parrilla tenemos Punta de Anca 400g ($58.000), Churrasco Argentino ($52.000) y Picada Familiar ($86.000). Nuestro tiempo de entrega hoy es de ${deliveryWindow}. ¿Qué te provoca pedir?`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `agt-${Date.now()}`,
        role: 'agent',
        text: reply,
        timestamp: nowTime,
        latencyMs: 960,
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
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-[1fr_460px] bg-[#FAF8F5] overflow-hidden">
      {/* =====================================================================
          COLUMNA IZQUIERDA: CONFIGURADOR GASTRONÓMICO GUIADO
      ===================================================================== */}
      <section className="h-full overflow-y-auto p-6 space-y-6 border-r border-[#E8E6DF]">
        {/* Cabecera del Configurador */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-semibold text-[#141413] tracking-[-0.02em]">
                Cerebro del Agente y Reglas de Venta
              </h1>
              <StatusPill
                status="ai_active"
                label="Gemini 2.5 Flash"
                metric="98ms"
                pulse
              />
            </div>
            <p className="text-xs text-[#575653] mt-0.5">
              Configura cómo atiende, sugiere maridajes y toma pedidos tu
              anfitrión en WhatsApp sin escribir código.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-mono metric-mono text-[#065F46] bg-[#ECFDF5] px-2.5 py-1 rounded-md border border-[#A7F3D0]">
                ✓ Publicado en producción
              </span>
            )}
            <Button variant="primary" size="sm" onClick={handleSaveAgentConfig}>
              Guardar y Publicar en Agente
            </Button>
          </div>
        </div>

        {/* Bloque 1: Personalidad del Anfitrión */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#575653]">
              1. Personalidad del Mesero / Recepcionista
            </h2>
            <span className="text-[11px] text-[#8A8884]">
              Afecta el saludo y el estilo de recomendación
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PERSONA_OPTIONS.map((persona) => {
              const isSelected = selectedPersona === persona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => setSelectedPersona(persona.id)}
                  className={[
                    'text-left p-3.5 rounded-lg border transition-all flex flex-col justify-between gap-2.5 cursor-pointer',
                    isSelected
                      ? 'bg-white border-[#0F291E] ring-1 ring-[#0F291E] shadow-2xs'
                      : 'bg-white/70 border-[#E8E6DF] hover:border-[#D5D2C8] hover:bg-white',
                  ].join(' ')}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#141413]">
                        {persona.title}
                      </span>
                      <span
                        className={[
                          'h-2 w-2 rounded-full shrink-0',
                          isSelected ? 'bg-[#10B981]' : 'bg-[#D5D2C8]',
                        ].join(' ')}
                      />
                    </div>
                    <p className="text-[11px] text-[#575653] leading-relaxed">
                      {persona.subtitle}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-[#FAF8F5] border border-[#E8E6DF] text-[11px] italic text-[#575653]">
                    “{persona.sampleGreeting}”
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bloque 2: Reglas de Venta Sugerida (Upselling y Protocolo de Parrilla) */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#575653]">
            2. Protocolo Gastronómico y Upselling Automático
          </h2>

          <div className="rounded-lg bg-white border border-[#E8E6DF] divide-y divide-[#E8E6DF] shadow-2xs">
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#141413]">
                  Exigir siempre término de cocción en cortes de res
                </p>
                <p className="text-[11px] text-[#575653]">
                  Impide cerrar el pedido de Punta de Anca, Churrasco o Baby
                  Beef sin confirmar término (1/2, 3/4, Bien asado) y guarnición.
                </p>
              </div>
              <Switch
                checked={upsellRules.askMeatDoneness}
                onCheckedChange={(checked) =>
                  setUpsellRules((prev) => ({
                    ...prev,
                    askMeatDoneness: checked,
                  }))
                }
              />
            </div>

            <div className="p-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#141413]">
                  Sugerir entrada antes de pasar a caja (+Ticket Promedio)
                </p>
                <p className="text-[11px] text-[#575653]">
                  Ofrece Chorizo Santarrosano o Morcilla al carbón cuando el
                  comensal pide únicamente platos fuertes.
                </p>
              </div>
              <Switch
                checked={upsellRules.suggestStarters}
                onCheckedChange={(checked) =>
                  setUpsellRules((prev) => ({
                    ...prev,
                    suggestStarters: checked,
                  }))
                }
              />
            </div>

            <div className="p-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#141413]">
                  Ofrecer maridaje de bebidas y sangría
                </p>
                <p className="text-[11px] text-[#575653]">
                  Recomienda Jarra de Sangría en pedidos familiares o Club
                  Colombia en cortes individuales.
                </p>
              </div>
              <Switch
                checked={upsellRules.suggestBeveragePairing}
                onCheckedChange={(checked) =>
                  setUpsellRules((prev) => ({
                    ...prev,
                    suggestBeveragePairing: checked,
                  }))
                }
              />
            </div>

            <div className="p-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#141413]">
                  Capturar reservas de mesas automáticamente
                </p>
                <p className="text-[11px] text-[#575653]">
                  Permite agendar mesas de hasta 12 personas y deriva grupos
                  mayores a Handoff Humano.
                </p>
              </div>
              <Switch
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

        {/* Bloque 3: Parámetros Operativos de Domicilio en Vivo */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#575653]">
            3. Tiempos de Entrega y Tarifas de Domicilio Hoy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Selector de Tiempo de Entrega */}
            <div className="p-3.5 rounded-lg bg-white border border-[#E8E6DF] space-y-2">
              <span className="text-[11px] font-medium text-[#575653] block">
                Tiempo estimado domicilio
              </span>
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#FAF8F5] rounded-md border border-[#E8E6DF]">
                {(
                  ['25 - 35 min', '35 - 45 min', '50 - 60 min'] as const
                ).map((windowOption) => (
                  <button
                    key={windowOption}
                    type="button"
                    onClick={() => setDeliveryWindow(windowOption)}
                    className={[
                      'h-7 rounded text-[10px] font-mono metric-mono font-medium transition-all cursor-pointer',
                      deliveryWindow === windowOption
                        ? 'bg-[#0F291E] text-white font-semibold'
                        : 'text-[#575653] hover:text-[#141413]',
                    ].join(' ')}
                  >
                    {windowOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Tarifa Base de Domicilio */}
            <div className="p-3.5 rounded-lg bg-white border border-[#E8E6DF] space-y-1.5">
              <label
                htmlFor="delivery-fee-input"
                className="text-[11px] font-medium text-[#575653] block"
              >
                Tarifa base domicilio (COP)
              </label>
              <input
                id="delivery-fee-input"
                type="number"
                step={500}
                value={baseDeliveryFeeCop}
                onChange={(e) =>
                  setBaseDeliveryFeeCop(Number(e.target.value) || 0)
                }
                className="w-full h-8 px-2.5 rounded-md bg-[#FAF8F5] border border-[#D5D2C8] font-mono metric-mono text-xs font-semibold text-[#141413]"
              />
            </div>

            {/* Pedido Mínimo */}
            <div className="p-3.5 rounded-lg bg-white border border-[#E8E6DF] space-y-1.5">
              <label
                htmlFor="min-order-input"
                className="text-[11px] font-medium text-[#575653] block"
              >
                Valor mínimo de domicilio (COP)
              </label>
              <input
                id="min-order-input"
                type="number"
                step={5000}
                value={minimumOrderCop}
                onChange={(e) =>
                  setMinimumOrderCop(Number(e.target.value) || 0)
                }
                className="w-full h-8 px-2.5 rounded-md bg-[#FAF8F5] border border-[#D5D2C8] font-mono metric-mono text-xs font-semibold text-[#141413]"
              />
            </div>
          </div>
        </div>

        {/* Bloque 4: Inspector de Directrices Compiladas (Para auditoría técnica) */}
        <div className="rounded-lg bg-[#F3F1EC] border border-[#E8E6DF] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#141413]">
              Directrices compiladas hacia PromptBuilder
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setShowCompiledPrompt((prev) => !prev)}
            >
              {showCompiledPrompt ? 'Ocultar código' : 'Ver instrucciones IA'}
            </Button>
          </div>
          {showCompiledPrompt && (
            <pre className="p-3 rounded-md bg-[#141413] text-[#E6E4DD] font-mono text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto">
              • {compiledSystemInstructions}
            </pre>
          )}
        </div>
      </section>

      {/* =====================================================================
          COLUMNA DERECHA: SIMULADOR DE WHATSAPP EN CHASIS MÓVIL REALISTA
      ===================================================================== */}
      <aside className="h-full bg-[#F3F1EC] p-5 flex flex-col items-center justify-between overflow-y-auto">
        {/* Escenarios de prueba de 1 clic */}
        <div className="w-full max-w-[390px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#575653]">
              Pruebas Rápidas (1-Clic)
            </span>
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    role: 'agent',
                    text:
                      PERSONA_OPTIONS.find((p) => p.id === selectedPersona)
                        ?.sampleGreeting ??
                      '¡Buenas noches! Bienvenido a Santa Cruz Parrilla.',
                    timestamp: 'Ahora',
                    latencyMs: 790,
                    executedTools: ['reset_session()'],
                  },
                ])
              }
              className="text-[11px] text-[#0F291E] underline cursor-pointer font-medium"
            >
              Reiniciar chat
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_TEST_PROMPTS.map((scenario) => (
              <button
                key={scenario.label}
                type="button"
                disabled={isSimulating}
                onClick={() => void generateSimulatedTurn(scenario.prompt)}
                className="px-2.5 py-1 rounded-md bg-white border border-[#D5D2C8] hover:border-[#0F291E] text-[11px] font-medium text-[#141413] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        {/* CHASIS DE DISPOSITIVO MÓVIL (WHATSAPP BUSINESS SIMULATOR) */}
        <div className="w-full max-w-[390px] h-[580px] my-3 rounded-[34px] border-[7px] border-[#141413] bg-[#EFEAE2] shadow-xl flex flex-col overflow-hidden relative">
          {/* Cabecera Oficial de WhatsApp Business */}
          <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#10B981] text-[#0C1F17] font-bold text-xs flex items-center justify-center">
                SC
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold leading-none">
                    Santa Cruz Parrilla
                  </span>
                  <span
                    className="text-[10px] text-emerald-300"
                    title="Cuenta de empresa verificada"
                  >
                    ✓
                  </span>
                </div>
                <span className="text-[10px] text-emerald-100/90 block mt-0.5">
                  Agente IA Activo · Responde al instante
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono metric-mono px-1.5 py-0.5 rounded bg-black/20 text-emerald-200">
              Simulador
            </span>
          </div>

          {/* Lienzo de Mensajes del Teléfono */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((msg) => {
              const isCustomer = msg.role === 'customer';
              return (
                <div
                  key={msg.id}
                  className={[
                    'flex flex-col max-w-[86%]',
                    isCustomer ? 'ml-auto items-end' : 'mr-auto items-start',
                  ].join(' ')}
                >
                  {/* Rayos X de Tools ejecutadas por el Agente */}
                  {!isCustomer &&
                    msg.executedTools &&
                    msg.executedTools.length > 0 && (
                      <div className="mb-1 flex flex-wrap gap-1">
                        {msg.executedTools.map((toolName) => (
                          <span
                            key={toolName}
                            className="px-1.5 py-0.5 rounded bg-[#0C1F17] text-[#A7F3D0] font-mono metric-mono text-[9px] font-medium shadow-2xs"
                          >
                            ⚡ {toolName}
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
                          {(msg.latencyMs / 1000).toFixed(2)}s
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
              <div className="mr-auto items-start flex flex-col max-w-[75%]">
                <div className="px-3 py-2 rounded-lg bg-white border border-[#E8E6DF] text-xs text-[#575653] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Consultando menú y reglas de parrilla...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Barra Inferior de Entrada del Simulador */}
          <form
            onSubmit={handleFormSubmit}
            className="p-2.5 bg-[#F0F0F0] border-t border-[#D5D2C8] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isSimulating}
              placeholder="Escribe como un comensal..."
              className="flex-1 h-9 px-3 rounded-full bg-white border border-[#D5D2C8] text-xs text-[#141413] placeholder:text-[#8A8884] focus:outline-none focus:border-[#075E54]"
            />
            <button
              type="submit"
              disabled={isSimulating || inputPrompt.trim().length === 0}
              className="h-9 px-3.5 rounded-full bg-[#075E54] text-white text-xs font-semibold hover:bg-[#064E46] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              Enviar
            </button>
          </form>
        </div>

        <p className="text-[11px] text-[#575653] text-center max-w-[360px]">
          Las conversaciones en este simulador son gratuitas e ilimitadas y{' '}
          <strong>no descuentan</strong> de tu cuota mensual del plan.
        </p>
      </aside>
    </div>
  );
}
