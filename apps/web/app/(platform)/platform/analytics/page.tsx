'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Cpu,
  MessageSquare,
  BarChart3,
  Percent,
  Calendar,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const dailyVolumeData = [
  { day: 'Lun', conversaciones: 540, tokens: 48000, costo: 0.42 },
  { day: 'Mar', conversaciones: 620, tokens: 55000, costo: 0.48 },
  { day: 'Mié', conversaciones: 590, tokens: 52000, costo: 0.45 },
  { day: 'Jue', conversaciones: 710, tokens: 68000, costo: 0.58 },
  { day: 'Vie', conversaciones: 940, tokens: 89000, costo: 0.79 },
  { day: 'Sáb', conversaciones: 1120, tokens: 104000, costo: 0.92 },
  { day: 'Dom', conversaciones: 880, tokens: 79000, costo: 0.71 },
];

export default function PlatformAnalyticsPage() {
  const financialStats = [
    {
      title: 'Facturación SaaS Estimada',
      value: '$1,450 USD',
      subtext: '3 inquilinos en planes Pro/Growth',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Costo API de Google Gemini',
      value: '$4.18 USD',
      subtext: '485.6K tokens consumidos',
      icon: Cpu,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Margen Operativo Bruto',
      value: '99.7%',
      subtext: 'Excelente eficiencia económica',
      icon: Percent,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Tasa de Automatización Global',
      value: '92.4%',
      subtext: '4,454 / 4,820 chats resueltos 100% por IA',
      icon: MessageSquare,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Métricas Financieras y Observabilidad de IA (Platform Level)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Análisis de rentabilidad por inquilino, costos directos de modelos de lenguaje y rendimiento de la plataforma.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {financialStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.subtext}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Conversations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Volumen de Conversaciones Diarias (WhatsApp)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="conversaciones" fill="#2563eb" radius={[6, 6, 0, 0]} name="Conversaciones" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Cost Curve */}
        <Card>
          <CardHeader>
            <CardTitle>Costo Diario Acumulado de Tokens Gemini ($ USD)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" unit="$" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="costo" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Costo USD" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Distribution Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Distribución de Modelos en Producción
            </h4>
            <p className="text-xs text-slate-500">
              Gemini 2.5 Flash atiende el 96% de consultas rápidas ($0.075 / 1M tokens). Gemini 2.5 Pro atiende el 4% para análisis de menús complejos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">96% Gemini 2.5 Flash</Badge>
          <Badge variant="default">4% Gemini 2.5 Pro</Badge>
        </div>
      </div>
    </div>
  );
}
