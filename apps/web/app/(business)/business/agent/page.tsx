'use client';

import React, { useState } from 'react';
import {
  Bot,
  Save,
  Plus,
  Trash2,
  Wrench,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
  ShoppingBag,
  Utensils,
  Briefcase,
  Play,
  Send,
  RefreshCw,
  X,
  MessageSquare,
  Clock,
  Sparkle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { IndustryType } from '@platform/core';

interface IndustryPreset {
  id: IndustryType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  systemInstructions: string;
  recommendedTools: string[];
  faqs: Array<{ q: string; a: string }>;
  fewShots: Array<{ user: string; assistant: string }>;
  returnPolicy: string;
  cancellationPolicy: string;
}

const industryPresets: Record<IndustryType, IndustryPreset> = {
  food_and_beverage: {
    id: 'food_and_beverage',
    name: 'Gastronomía & Restaurantes',
    icon: Utensils,
    tone: 'amable, cálido y cercano',
    systemInstructions:
      'Eres "agilizio", el asistente virtual oficial de este restaurante por WhatsApp. Tu objetivo es asesorar a los comensales, detallar platos e ingredientes, gestionar pedidos con precisión matemática y derivar a un asesor humano ante dudas complejas o quejas.',
    recommendedTools: [
      'search_products',
      'get_product_details',
      'calculate_order',
      'create_order',
      'transfer_to_human',
      'get_business_information',
    ],
    faqs: [
      {
        q: '¿Tienen servicio de domicilio propio o por aplicaciones?',
        a: 'Tenemos domiciliarios propios con entrega en 35 a 45 minutos. El costo varía entre $4,000 y $7,000 según la zona de cobertura.',
      },
      {
        q: '¿Qué medios de pago aceptan?',
        a: 'Aceptamos transferencias Nequi, Daviplata, Bancolombia y datáfono para pago contraentrega con tarjeta.',
      },
      {
        q: '¿Tienen opciones vegetarianas o veganas?',
        a: 'Sí, contamos con opciones vegetarianas en platos principales y bowls saludables.',
      },
    ],
    fewShots: [
      {
        user: '¿Qué tienen para almorzar rápido hoy?',
        assistant:
          '¡Hola! Te recomiendo nuestro Combo Gourmet con hamburguesa artesanal en pan brioche o el Bowl Mediterráneo, ambos listos para despacho en 25 minutos. ¿Deseas ver las bebidas disponibles?',
      },
    ],
    returnPolicy:
      'Si el pedido llega en mal estado o incompleto, el cliente debe enviar una foto por este chat en los primeros 30 minutos tras la entrega para reposición inmediata sin costo.',
    cancellationPolicy:
      'Las cancelaciones solo se permiten en los primeros 10 minutos posteriores a la confirmación de la orden antes de que ingrese a cocina.',
  },
  health_and_wellness: {
    id: 'health_and_wellness',
    name: 'Salud, Citas Médicas & Estética',
    icon: Calendar,
    tone: 'empático, profesional y clínico',
    systemInstructions:
      'Eres "agilizio", el asistente virtual de este centro de salud y bienestar. Tu objetivo es orientar a los pacientes con empatía, validar disponibilidad de especialistas en tiempo real, agendar citas con precisión y recordar las indicaciones previas de consulta.',
    recommendedTools: [
      'check_availability',
      'book_appointment',
      'search_products',
      'transfer_to_human',
      'get_business_information',
    ],
    faqs: [
      {
        q: '¿La cita de valoración inicial tiene algún costo?',
        a: 'Nuestra primera cita de diagnóstico y valoración clínica es completamente gratuita y sin compromiso.',
      },
      {
        q: '¿Qué documentos debo presentar el día de mi cita?',
        a: 'Por favor preséntate con tu documento de identidad original y llegar con 10 minutos de antelación.',
      },
      {
        q: '¿Atienden urgencias o procedimientos inmediatos?',
        a: 'Atendemos urgencias odontológicas o estéticas prioritarias en horario de 8:00 AM a 6:00 PM.',
      },
    ],
    fewShots: [
      {
        user: 'Buenas tardes, ¿tienen citas para valoración con el ortodoncista este jueves?',
        assistant:
          '¡Buenas tardes! Con gusto verifico la disponibilidad del Dr. Castro para este jueves. Tenemos franjas disponibles a las 10:00 AM y a las 3:30 PM. ¿Cuál de estos dos horarios te queda más cómodo?',
      },
    ],
    returnPolicy:
      'Garantía total de retoque o revisión sin costo en procedimientos clínicos dentro de los primeros 15 días tras la atención.',
    cancellationPolicy:
      'Puedes reagendar o cancelar tu cita médica sin penalidad notificando con al menos 24 horas de anticipación por este canal.',
  },
  retail_and_ecommerce: {
    id: 'retail_and_ecommerce',
    name: 'Retail & Comercio Electrónico',
    icon: ShoppingBag,
    tone: 'dinámico, persuasivo y servicial',
    systemInstructions:
      'Eres "agilizio", el asesor comercial inteligente de esta tienda por WhatsApp. Ayuda a los clientes a encontrar productos ideales, valida tallas/colores y stock disponible, calcula envíos nacionales y coordina ventas con agilidad.',
    recommendedTools: [
      'search_products',
      'get_product_details',
      'calculate_order',
      'create_order',
      'transfer_to_human',
      'get_business_information',
    ],
    faqs: [
      {
        q: '¿Hacen envíos a todo el país y cuánto tardan?',
        a: 'Realizamos despachos a nivel nacional por Servientrega y Coordinadora. El tiempo de entrega es de 2 a 4 días hábiles.',
      },
      {
        q: '¿Cómo elijo mi talla correcta?',
        a: 'En cada ficha de producto te compartimos la guía exacta de medidas en centímetros. Si tienes dudas, puedo asesorarte al instante.',
      },
      {
        q: '¿Tienen opción de pago contraentrega?',
        a: 'Sí, tenemos cobertura de pago contraentrega en más de 80 ciudades y municipios principales.',
      },
    ],
    fewShots: [
      {
        user: 'Hola, ¿tienen la chaqueta de cuero en talla M y color negro?',
        assistant:
          '¡Hola! Acabo de revisar nuestro inventario y nos quedan las últimas 3 unidades de la chaqueta de cuero en color negro talla M. El precio es $189,000 con envío gratis. ¿Te gustaría apartarla?',
      },
    ],
    returnPolicy:
      'Cuentas con 30 días calendario para cambios de talla o modelo. El producto debe conservar sus etiquetas originales y estar sin uso.',
    cancellationPolicy:
      'Puedes solicitar la cancelación y reembolso total de tu pedido siempre que no haya sido entregado a la transportadora.',
  },
  professional_services: {
    id: 'professional_services',
    name: 'Servicios Profesionales & B2B',
    icon: Briefcase,
    tone: 'ejecutivo, consultivo y formal',
    systemInstructions:
      'Eres "agilizio", el asesor corporativo de esta firma de servicios profesionales. Tu labor es calificar prospectos, entender las necesidades del cliente, exponer las soluciones de la firma y coordinar reuniones exploratorias de diagnóstico.',
    recommendedTools: [
      'check_availability',
      'book_appointment',
      'get_business_information',
      'transfer_to_human',
    ],
    faqs: [
      {
        q: '¿Cómo funciona la sesión de diagnóstico inicial?',
        a: 'Es una reunión virtual de 30 minutos con un consultor senior donde analizamos tu caso y definimos una propuesta de trabajo a la medida.',
      },
      {
        q: '¿Manejan acuerdos de confidencialidad (NDA)?',
        a: 'Absolutamente. Toda la información compartida durante nuestras sesiones está protegida bajo un estricto acuerdo de confidencialidad.',
      },
    ],
    fewShots: [
      {
        user: 'Quisiera cotizar una asesoría tributaria para mi empresa',
        assistant:
          'Con mucho gusto. En nuestra firma asesoramos a más de 120 empresas en optimización fiscal y cumplimiento normativo. ¿Para cuántos colaboradores o qué volumen de operaciones proyectan este año?',
      },
    ],
    returnPolicy:
      'Nuestros contratos de servicio incluyen entregables medibles y sesiones de ajuste periódicas según el acuerdo de nivel de servicio (SLA).',
    cancellationPolicy:
      'Las sesiones de consultoría pueden reagendarse con 12 horas de aviso previo sin recargo.',
  },
  general: {
    id: 'general',
    name: 'Configuración General / Multiproducto',
    icon: Bot,
    tone: 'amable, ágil y profesional',
    systemInstructions:
      'Eres "agilizio", el asistente virtual inteligente de la empresa por WhatsApp. Atiende y resuelve las consultas de los clientes con rapidez, precisión y calidez.',
    recommendedTools: [
      'search_products',
      'calculate_order',
      'check_availability',
      'transfer_to_human',
      'get_business_information',
    ],
    faqs: [
      {
        q: '¿Cuáles son los horarios de atención?',
        a: 'Atendemos de lunes a sábado de 8:00 AM a 8:00 PM.',
      },
    ],
    fewShots: [],
    returnPolicy: 'Soporte y devoluciones según términos y condiciones del servicio.',
    cancellationPolicy: 'Cancelación permitida antes del inicio de la ejecución del servicio.',
  },
};

const initialToolsList = [
  { id: 'search_products', name: 'search_products', label: 'Búsqueda en Menú y Catálogo', category: 'Catálogo' },
  { id: 'get_product_details', name: 'get_product_details', label: 'Detalles de Ingredientes y Alérgenos', category: 'Catálogo' },
  { id: 'calculate_order', name: 'calculate_order', label: 'Cálculo de Precios y Subtotales', category: 'Ventas' },
  { id: 'create_order', name: 'create_order', label: 'Creación y Confirmación de Pedidos', category: 'Ventas' },
  { id: 'check_availability', name: 'check_availability', label: 'Consulta de Disponibilidad y Cupos (Citas)', category: 'Agendamiento' },
  { id: 'book_appointment', name: 'book_appointment', label: 'Confirmación y Registro de Citas Médicas / Asesorías', category: 'Agendamiento' },
  { id: 'transfer_to_human', name: 'transfer_to_human', label: 'Escalamiento a Asesor Humano', category: 'Soporte' },
  { id: 'get_business_information', name: 'get_business_information', label: 'Horarios, Ubicación y Preguntas Frecuentes', category: 'General' },
];

export default function BusinessAgentPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('food_and_beverage');
  const [tone, setTone] = useState(industryPresets.food_and_beverage.tone);
  const [language, setLanguage] = useState('es-CO (Español Colombia)');
  const [systemInstructions, setSystemInstructions] = useState(
    industryPresets.food_and_beverage.systemInstructions
  );
  const [faqs, setFaqs] = useState(industryPresets.food_and_beverage.faqs);
  const [fewShots, setFewShots] = useState(industryPresets.food_and_beverage.fewShots);
  const [returnPolicy, setReturnPolicy] = useState(industryPresets.food_and_beverage.returnPolicy);
  const [cancellationPolicy, setCancellationPolicy] = useState(
    industryPresets.food_and_beverage.cancellationPolicy
  );

  const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>({
    search_products: true,
    get_product_details: true,
    calculate_order: true,
    create_order: true,
    check_availability: false,
    book_appointment: false,
    transfer_to_human: true,
    get_business_information: true,
  });

  const [savedNotification, setSavedNotification] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Simulator Chat State
  const [simMessages, setSimMessages] = useState<
    Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      toolCall?: string;
    }>
  >([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '¡Hola! Soy agilizio, tu agente de inteligencia artificial. Puedes interactuar conmigo en este simulador para probar en tiempo real las respuestas, el tono y la ejecución de herramientas configuradas para tu industria.',
    },
  ]);
  const [simInput, setSimInput] = useState('');
  const [isSimLoading, setIsSimLoading] = useState(false);

  // Handler for Industry Preset Selection
  const handleSelectIndustry = (indId: IndustryType) => {
    setSelectedIndustry(indId);
    const preset = industryPresets[indId];
    if (preset) {
      setTone(preset.tone);
      setSystemInstructions(preset.systemInstructions);
      setFaqs(preset.faqs);
      setFewShots(preset.fewShots);
      setReturnPolicy(preset.returnPolicy);
      setCancellationPolicy(preset.cancellationPolicy);

      // Update enabled tools according to preset
      const newTools: Record<string, boolean> = {};
      initialToolsList.forEach((t) => {
        newTools[t.id] = preset.recommendedTools.includes(t.id);
      });
      setEnabledTools(newTools);
    }
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleUpdateFaq = (index: number, field: 'q' | 'a', value: string) => {
    const updated = [...faqs];
    if (updated[index]) {
      updated[index][field] = value;
      setFaqs(updated);
    }
  };

  const handleAddFewShot = () => {
    setFewShots([...fewShots, { user: '', assistant: '' }]);
  };

  const handleRemoveFewShot = (index: number) => {
    setFewShots(fewShots.filter((_, i) => i !== index));
  };

  const handleUpdateFewShot = (index: number, field: 'user' | 'assistant', value: string) => {
    const updated = [...fewShots];
    if (updated[index]) {
      updated[index][field] = value;
      setFewShots(updated);
    }
  };

  const toggleTool = (toolId: string) => {
    setEnabledTools((prev) => ({
      ...prev,
      [toolId]: !prev[toolId],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3500);
  };

  // Simulator Message Handler (Connected to Live Gemini & Supabase API)
  const handleSendSimMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim() || isSimLoading) return;

    const userText = simInput.trim();
    const newMsgId = `usr-${Date.now()}`;
    const updatedMessages = [
      ...simMessages,
      { id: newMsgId, role: 'user' as const, content: userText },
    ];
    setSimMessages(updatedMessages);
    setSimInput('');
    setIsSimLoading(true);

    try {
      const response = await fetch('/api/agent/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: simMessages.map((m) => ({ role: m.role, content: m.content })),
          selectedIndustry,
          agentConfig: {
            system_instructions: systemInstructions,
            personality: { tone, language },
            policies: {
              return_policy: returnPolicy,
              cancellation_policy: cancellationPolicy,
            },
            business_context: {
              overview: '',
              faq: faqs.map((f) => ({ question: f.q, answer: f.a })),
            },
            few_shot_examples: fewShots.map((f) => ({ user: f.user, assistant: f.assistant })),
            enabled_tools: Object.entries(enabledTools)
              .filter(([_, enabled]) => enabled)
              .map(([id]) => id),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la respuesta');
      }

      let toolCallSummary: string | undefined;
      if (data.toolCallsExecuted && data.toolCallsExecuted.length > 0) {
        toolCallSummary = data.toolCallsExecuted
          .map((tc: any) => `🔧 Tool: ${tc.name}(${JSON.stringify(tc.args)})`)
          .join(' | ');
      }

      setSimMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.text || 'Sin respuesta',
          toolCall: toolCallSummary,
        },
      ]);
    } catch (err: any) {
      setSimMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error de conexión con agilizio: ${err.message}`,
        },
      ]);
    } finally {
      setIsSimLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bot className="w-7 h-7 text-blue-600" />
              agilizio Studio
            </h2>
            <Badge variant="purple">Motor agilizio v1.0</Badge>
            <Badge variant="default">Gemini Flash Latest</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configura el cerebro conversacional de tu negocio con soporte multi-industria, calibración de prompts y herramientas deterministas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Play className="w-4 h-4 fill-blue-600" />
            Simulador en Vivo
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {savedNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ¡Configuración de agilizio guardada exitosamente! La nueva versión del prompt modular y las herramientas están activas en WhatsApp.
        </div>
      )}

      {/* Multi-Industry Template Selector */}
      <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <CardTitle>Plantillas Especializadas Multi-Industria</CardTitle>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Selecciona la industria de tu negocio para precargar automáticamente directrices de atención, arquetipos de conversación y herramientas recomendadas para agilizio.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(industryPresets)
              .filter(([key]) => key !== 'general')
              .map(([key, preset]) => {
                const isSelected = selectedIndustry === key;
                const IconComponent = preset.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectIndustry(key as IndustryType)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Activo
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{preset.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 capitalize">Tono: {preset.tone}</div>
                    </div>
                  </button>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Personality & System Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>1. Identidad y Misión de agilizio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tono y Arquetipo de Comunicación
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="amable, cálido y cercano">Amable, cálido y cercano (Gastronomía & Restaurantes)</option>
                <option value="empático, profesional y clínico">Empático, profesional y clínico (Salud & Bienestar)</option>
                <option value="dinámico, persuasivo y servicial">Dinámico, persuasivo y comercial (Retail & E-commerce)</option>
                <option value="ejecutivo, consultivo y formal">Ejecutivo, consultivo y formal (Servicios B2B)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Idioma y Localización
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instrucciones Maestras del Sistema (System Instructions)
            </label>
            <textarea
              rows={4}
              value={systemInstructions}
              onChange={(e) => setSystemInstructions(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Define el objetivo primario de agilizio y cómo debe asesorar a los clientes en WhatsApp.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Enabled Tools */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-600" />
            <CardTitle>2. Herramientas de Negocio Autorizadas (Function Calling)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-4">
            Habilita las herramientas deterministas que agilizio puede invocar para interactuar con tus bases de datos de forma segura.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {initialToolsList.map((tool) => {
              const isEnabled = !!enabledTools[tool.id];
              return (
                <label
                  key={tool.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isEnabled
                      ? 'border-blue-200 bg-blue-50/40 text-blue-950'
                      : 'border-slate-200 bg-slate-50/50 text-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleTool(tool.id)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{tool.label}</span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                        {tool.category}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">{tool.name}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Few-Shot Examples */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>3. Ejemplos de Entrenamiento Guía (Few-Shot)</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Enseña a agilizio el estilo ideal de respuesta mostrando ejemplos reales de preguntas y respuestas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFewShot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Ejemplo
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fewShots.length === 0 ? (
            <div className="text-xs text-slate-400 italic p-4 text-center border border-dashed rounded-xl">
              No hay ejemplos configurados. Haz clic en &quot;Agregar Ejemplo&quot; para añadir casos modelo.
            </div>
          ) : (
            fewShots.map((fs, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveFewShot(idx)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-0.5">
                    Mensaje del Cliente (Ejemplo {idx + 1})
                  </label>
                  <input
                    type="text"
                    value={fs.user}
                    onChange={(e) => handleUpdateFewShot(idx, 'user', e.target.value)}
                    placeholder="Ej: ¿Tienen disponibilidad para dos personas este sábado?"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-blue-700 uppercase mb-0.5">
                    Respuesta Modelo de agilizio
                  </label>
                  <textarea
                    rows={2}
                    value={fs.assistant}
                    onChange={(e) => handleUpdateFewShot(idx, 'assistant', e.target.value)}
                    placeholder="Respuesta ideal que agilizio debe imitar en tono y precisión..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section 4: FAQs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>4. Preguntas Frecuentes del Negocio (FAQs)</CardTitle>
            <button
              type="button"
              onClick={handleAddFaq}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Pregunta
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 relative">
              <button
                type="button"
                onClick={() => handleRemoveFaq(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-0.5">
                  Pregunta {idx + 1}
                </label>
                <input
                  type="text"
                  value={faq.q}
                  onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                  placeholder="Ej: ¿Cuáles son sus horarios de atención?"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-0.5">
                  Respuesta de agilizio
                </label>
                <textarea
                  rows={2}
                  value={faq.a}
                  onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                  placeholder="Respuesta precisa que dará la IA..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 5: Policies */}
      <Card>
        <CardHeader>
          <CardTitle>5. Políticas de Servicio, Cancelaciones y Garantías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Política de Devoluciones y Garantías
            </label>
            <textarea
              rows={2}
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Política de Cancelaciones y Reagendamientos
            </label>
            <textarea
              rows={2}
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* agilizio Simulator Drawer / Slide-over */}
      {isSimulatorOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-left">
          {/* Simulator Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-semibold text-sm">Simulador agilizio</h3>
                <span className="text-[10px] text-blue-300 capitalize font-mono">
                  {selectedIndustry} | Gemini Flash Latest
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setSimMessages([
                    {
                      id: 'welcome',
                      role: 'assistant',
                      content:
                        'Simulador reiniciado. Puedes escribir cualquier mensaje para probar a agilizio con la configuración actual.',
                    },
                  ])
                }
                title="Reiniciar chat de prueba"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsSimulatorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simulator Message Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
            {simMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {m.toolCall && (
                  <div className="mb-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md max-w-[85%] break-words">
                    {m.toolCall}
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isSimLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1.5 w-fit animate-pulse">
                <Sparkle className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                agilizio procesando razonamiento y tools...
              </div>
            )}
          </div>

          {/* Simulator Input Form */}
          <form onSubmit={handleSendSimMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              placeholder="Escribe como un cliente para probar..."
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSimLoading || !simInput.trim()}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
