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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BusinessAgentPage() {
  const [tone, setTone] = useState('amable y cercano');
  const [language, setLanguage] = useState('es-CO (Español Colombia)');
  const [systemInstructions, setSystemInstructions] = useState(
    'Eres el asistente virtual oficial de "La Casona Gourmet" por WhatsApp. Tu objetivo es asesorar a los comensales, responder preguntas sobre los platos, tomar pedidos con total precisión y transferir al equipo humano cuando haya reclamos o situaciones especiales.'
  );
  const [faqs, setFaqs] = useState([
    {
      q: '¿Tienen servicio de domicilio propio o por aplicaciones?',
      a: 'Tenemos domiciliarios propios con entrega en 35 a 45 minutos. El costo de envío varía entre $4,000 y $7,000 según la zona.',
    },
    {
      q: '¿Qué medios de pago aceptan?',
      a: 'Aceptamos transferencias Nequi, Daviplata, Bancolombia y datáfono para pago contraentrega con tarjeta.',
    },
    {
      q: '¿Tienen opciones vegetarianas o veganas?',
      a: 'Sí, contamos con Pizza Vegetariana con masa madre y Bowl Mediterráneo vegano.',
    },
  ]);

  const [returnPolicy, setReturnPolicy] = useState(
    'Si el pedido llega en mal estado o incompleto, el cliente debe enviar una foto por este chat en los primeros 30 minutos tras la entrega para reposición inmediata sin costo.'
  );
  const [cancellationPolicy, setCancellationPolicy] = useState(
    'Las cancelaciones solo se permiten en los primeros 10 minutos posteriores a la confirmación de la orden antes de que ingrese a cocina.'
  );

  const [tools, setTools] = useState([
    { id: 'search_products', name: 'search_products', label: 'Búsqueda en Menú y Catálogo', enabled: true },
    { id: 'get_product_details', name: 'get_product_details', label: 'Detalles de Ingredientes y Alérgenos', enabled: true },
    { id: 'calculate_order', name: 'calculate_order', label: 'Cálculo de Precios y Subtotales', enabled: true },
    { id: 'create_order', name: 'create_order', label: 'Creación y Confirmación de Pedidos', enabled: true },
    { id: 'transfer_to_human', name: 'transfer_to_human', label: 'Escalamiento a Asesor Humano', enabled: true },
    { id: 'get_business_information', name: 'get_business_information', label: 'Horarios, Ubicación y Preguntas Frecuentes', enabled: true },
  ]);

  const [savedNotification, setSavedNotification] = useState(false);

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

  const toggleTool = (toolId: string) => {
    setTools(
      tools.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Calibración del Agente de IA
            </h2>
            <Badge variant="purple">Gemini 2.5 Flash</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configura el Prompt Modular, personalidad, preguntas frecuentes y herramientas autorizadas.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Guardar Cambios
        </button>
      </div>

      {savedNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ¡Configuración guardada exitosamente! La nueva versión del prompt modular está activa para WhatsApp.
        </div>
      )}

      {/* Section 1: Personality & System Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>1. Identidad e Instrucciones Maestras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tono y Personalidad
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="amable y cercano">Amable, cálido y cercano (Recomendado para Restaurantes)</option>
                <option value="formal y corporativo">Formal y corporativo</option>
                <option value="vendedor persuasivo">Vendedor persuasivo y enfocado en conversión</option>
                <option value="clinico y empatico">Clínico, empático y cuidadoso (Salud)</option>
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
              Instrucciones del Sistema (System Instructions)
            </label>
            <textarea
              rows={4}
              value={systemInstructions}
              onChange={(e) => setSystemInstructions(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Define el rol del agente y sus directrices principales al interactuar con comensales.
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
            Selecciona qué capacidades operativas puede invocar el agente de IA de forma autónoma.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tools.map((tool) => (
              <label
                key={tool.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  tool.enabled
                    ? 'border-blue-200 bg-blue-50/40 text-blue-950'
                    : 'border-slate-200 bg-slate-50/50 text-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={tool.enabled}
                  onChange={() => toggleTool(tool.id)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-semibold">{tool.label}</div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">{tool.name}</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: FAQs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>3. Preguntas Frecuentes del Negocio (FAQs)</CardTitle>
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
                  Respuesta del Agente
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

      {/* Section 4: Policies */}
      <Card>
        <CardHeader>
          <CardTitle>4. Políticas de Servicio y Devoluciones</CardTitle>
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
              Política de Cancelaciones
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
    </div>
  );
}
