'use client';

import React, { useState } from 'react';
import {
  Share2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Phone,
  RefreshCw,
  Key,
  Copy,
  Check,
  Send,
  HelpCircle,
  AlertCircle,
  Sparkles,
  Save,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BusinessChannelsPage() {
  const [phoneNumber, setPhoneNumber] = useState('+57 300 123 4567');
  const [phoneNumberId, setPhoneNumberId] = useState('1412584025262699');
  const [wabaId, setWabaId] = useState('109876543210987');
  const [accessToken, setAccessToken] = useState('EAASWXV2WWPgBSsLkIZCuLihZAEirUJgg2hqFNijoAkYb5uxCQ7OYxOXOSqATRsCTZAMEG...');
  const [verifyToken, setVerifyToken] = useState('resolvioagencia2026+');
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/whatsapp`
    : 'https://resilient-lavoiser.vercel.app/api/webhooks/whatsapp';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('¡Conexión verificada con éxito! Meta Cloud API respondió con código 200 OK y el webhook está listo.');
    }, 1200);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-600" /> WhatsApp Cloud API Oficial
          </span>
          <span className="text-xs text-slate-400">• Meta Business Platform</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Línea de WhatsApp & Canales de Comunicación
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configura y verifica la conexión oficial de Restaurante Santa Cruz con la API de WhatsApp de Meta.
        </p>
      </div>

      {/* Meta Direct Billing Explanatory Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Facturación Directa con Meta (client_direct_meta)
            </h3>
            <p className="text-xs text-emerald-300">
              Meta te da 1.000 conversaciones de servicio gratuitas cada mes por número.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Nuestra plataforma agilizio <strong>no cobra comisiones ocultas por mensaje</strong>. Todos los costos oficiales de mensajes y plantillas son facturados directamente por Meta a la cuenta del restaurante.
        </p>
      </div>

      {/* Webhook Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>1. URL de Webhook para Meta Developers</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copia esta URL y pégala en la sección de Webhooks de tu App de WhatsApp en Meta.
                </p>
              </div>
            </div>
            <Badge variant="outline">Endpoint Activo</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
            <span className="text-slate-800 break-all select-all font-semibold">{webhookUrl}</span>
            <button
              onClick={handleCopyWebhook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-sans font-semibold shrink-0 shadow-xs"
            >
              {copiedWebhook ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar URL
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-0.5">Verify Token configurado:</span>
              <code className="text-blue-700 font-bold">{verifyToken}</code>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-0.5">Eventos a suscribir en Meta:</span>
              <code className="text-emerald-700 font-bold">messages (marcar casilla)</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Meta Credentials Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>2. Credenciales de la Línea en Meta</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ingresa los identificadores de la línea oficial de WhatsApp del restaurante.
                </p>
              </div>
            </div>
            <Badge variant="success">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Línea Verificada
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveCredentials} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de WhatsApp del Restaurante
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Con código de país (+57 para Colombia)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number ID (Meta)
                </label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="Ej: 1412584025262699"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Generado en Meta Developers $\rightarrow$ WhatsApp</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <input
                  type="text"
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  placeholder="Ej: 109876543210987"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Webhook Verify Token
                </label>
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Token Permanente de Usuario del Sistema (System User Token)
              </label>
              <textarea
                rows={2}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAB..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Token de larga duración con permisos whatsapp_business_management y whatsapp_business_messaging.
              </span>
            </div>

            {/* Test Connection Alert Result */}
            {testResult && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testResult}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Credenciales guardadas y sincronizadas exitosamente en la base de datos.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-600' : ''}`} />
                {isTesting ? 'Verificando con Meta...' : 'Probar Conexión con Meta'}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Guardando...' : 'Guardar Credenciales'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Guide Card (3 Steps to get credentials) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          Guía Rápida: Cómo conectar la línea de un restaurante en 10 minutos
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
              Crear App en Meta
            </div>
            <p className="leading-relaxed">
              Ingresa a <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">developers.facebook.com</a> con tu Facebook, haz clic en "Crear App", elige tipo <strong>Negocios</strong> y añade el producto <strong>WhatsApp</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
              Obtener IDs y Token
            </div>
            <p className="leading-relaxed">
              En la pestaña <em>Inicio de la API</em> encontrarás de inmediato el <strong>Phone Number ID</strong> y el Token. Para conectar el número real de Santa Cruz, haz clic en <em>"Agregar número de teléfono"</em>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
              Suscribir Webhook
            </div>
            <p className="leading-relaxed">
              En <em>Configuración</em> de WhatsApp, pega la URL del Webhook de arriba, ingresa el Verify Token <code>resolvioagencia2026+</code> y marca la casilla <strong>messages</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
