'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Bot,
  ShoppingBag,
  TrendingUp,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Percent,
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
} from 'recharts';

const hourlyTraffic = [
  { hour: '08:00', mensajes: 14 },
  { hour: '10:00', mensajes: 38 },
  { hour: '12:00', mensajes: 145 },
  { hour: '13:00', mensajes: 182 },
  { hour: '14:00', mensajes: 96 },
  { hour: '16:00', mensajes: 45 },
  { hour: '18:00', mensajes: 110 },
  { hour: '19:00', mensajes: 215 },
  { hour: '20:00', mensajes: 240 },
  { hour: '21:00', mensajes: 165 },
  { hour: '22:00', mensajes: 62 },
];

const topProducts = [
  { name: 'Pizza Pepperoni Supreme', consultas: 184, porcentaje: 38 },
  { name: 'Pizza Margarita Clásica', consultas: 142, porcentaje: 29 },
  { name: 'Bowl Mediterráneo Vegano', consultas: 89, porcentaje: 18 },
  { name: 'Limonada de Coco Natural', consultas: 72, porcentaje: 15 },
];

export default function BusinessAnalyticsPage() {
  const [downloading, setDownloading] = useState(false);

  const kpis = [
    {
      title: 'Tasa de Automatización IA',
      value: '91.8%',
      subtext: '238 / 260 chats resueltos sin humanos',
      icon: Bot,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Ventas Totales por WhatsApp',
      value: '$2,890,000',
      subtext: '84 pedidos confirmados',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Conversión Chat a Venta',
      value: '32.3%',
      subtext: '1 de cada 3 conversaciones compra',
      icon: Percent,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Tiempo Promedio de Respuesta',
      value: '1.2s',
      subtext: 'Inmediata 24/7 vía Cloud API',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const handleExportCSV = () => {
    setDownloading(true);

    const headers = 'Fecha,Conversaciones_Totales,Atendidas_Solo_IA,Escaladas_Humano,Tasa_Automatizacion,Pedidos,Ventas_COP\n';
    const rows = [
      '2026-09-24,38,35,3,92.1%,12,396000',
      '2026-09-25,44,40,4,90.9%,15,482000',
      '2026-09-26,48,45,3,93.8%,16,512000',
      '2026-09-27,52,48,4,92.3%,18,620000',
      '2026-09-28,32,30,2,93.8%,9,285000',
      '2026-09-29,46,42,4,91.3%,14,475000',
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'reporte-rendimiento-la-casona.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 800);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Rendimiento del Agente & Métricas del Negocio
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Analiza el ahorro de tiempo, la tasa de autonomía de la IA y el interés de tus clientes.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generando CSV...' : 'Exportar Reporte CSV'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((stat, idx) => {
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
        {/* Hourly Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Horas Pico de Clientes en WhatsApp</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Volumen de mensajes recibidos agrupados por franja horaria.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyTraffic}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="mensajes" fill="#10b981" radius={[6, 6, 0, 0]} name="Mensajes Recibidos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Queried Dishes */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Platos y Productos Más Consultados</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Detectados por la herramienta search_products del agente.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{prod.name}</span>
                  <span className="font-bold text-slate-600">{prod.consultas} consultas ({prod.porcentaje}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${prod.porcentaje * 2.5}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Summary Box */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Ahorro de Tiempo Estimado para tu Personal
            </h4>
            <p className="text-xs text-slate-500">
              El agente ha gestionado automáticamente <strong>238 conversaciones</strong> sin intervención humana este mes, equivalente a aproximadamente <strong>29 horas de trabajo de atención al cliente</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
