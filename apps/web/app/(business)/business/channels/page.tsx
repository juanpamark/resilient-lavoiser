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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BusinessChannelsPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const handleLaunchEmbeddedSignup = () => {
    setConnecting(true);
    // Simulates FB.login({ scope: 'whatsapp_business_management,whatsapp_business_messaging' })
    setTimeout(() => {
      setConnecting(false);
      setIsConnected(true);
      alert(
        'Flujo Meta Embedded Signup completado exitosamente: WABA ID y Phone Number ID vinculados con facturación directa a Meta.'
      );
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Canales de Comunicación — WhatsApp Cloud API
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Gestiona la conexión oficial de tu empresa con Meta y el registro de tu número de teléfono.
        </p>
      </div>

      {/* Meta Direct Billing Explanatory Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Modelo de Facturación Directa con Meta (client_direct_meta)
            </h3>
            <p className="text-xs text-emerald-200/80">
              Transparencia total: Nuestra plataforma no cobra comisiones por mensaje.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Al usar el <strong>Embedded Signup (Registro Integrado de Meta)</strong>, tu empresa conecta su propia
          cuenta de WhatsApp Business (WABA). Todos los costos oficiales de mensajes y conversaciones de WhatsApp
          son facturados directamente por Meta a tu tarjeta de crédito corporativa.
        </p>
      </div>

      {/* WhatsApp Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Conexión WhatsApp Cloud API</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Número activo y webhook configurado para la ingesta de mensajes.
                </p>
              </div>
            </div>
            <Badge variant="success">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Conectado y Verificado
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                Número de WhatsApp Vinculado
              </span>
              <div className="text-base font-bold text-slate-900 mt-1">+57 300 999 8877</div>
              <div className="text-xs text-emerald-700 font-medium mt-0.5">
                Calidad de Número: Alta (Tier 1K conversaciones/día)
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                WhatsApp Business Account ID (WABA ID)
              </span>
              <div className="text-base font-mono font-bold text-slate-900 mt-1">
                109876543210987
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Phone Number ID: 105551234567890
              </div>
            </div>
          </div>

          {/* Embedded Signup Action */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Reconectar o Cambiar de Número (Meta Embedded Signup)
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Abre la ventana emergente oficial de Facebook Login para delegar permisos de WhatsApp Business
                y actualizar el token de acceso del sistema.
              </p>
            </div>

            <button
              onClick={handleLaunchEmbeddedSignup}
              disabled={connecting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-sm shadow-sm transition-colors shrink-0"
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Conectando con Meta...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> Conectar con Facebook
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
