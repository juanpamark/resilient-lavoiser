import React from 'react';
import {
  Cpu,
  BarChart3,
  TrendingDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PlatformUsagePage() {
  const usageStats = [
    {
      title: 'Tokens Totales (Este Mes)',
      value: '485,620',
      subtext: 'Input: 360K • Output: 125.6K',
      badge: 'Gemini 2.5 Flash',
    },
    {
      title: 'Costo Estimado de API',
      value: '$0.038 USD',
      subtext: 'Aprox. $152 COP',
      badge: 'Altamente Eficiente',
    },
    {
      title: 'Llamadas a Herramientas (Tools)',
      value: '1,120',
      subtext: 'search_products, create_order',
      badge: 'Function Calling',
    },
    {
      title: 'Latencia Promedio P95',
      value: '840 ms',
      subtext: 'Turno completo con Tool',
      badge: 'Tiempo Real',
    },
  ];

  const tenantBreakdown = [
    {
      name: 'Restaurante Gourmet La Casona',
      inputTokens: 245000,
      outputTokens: 82000,
      totalTokens: 327000,
      toolExecutions: 810,
      estimatedCost: '$0.026 USD',
    },
    {
      name: 'Clínica Odontológica Sonrisas',
      inputTokens: 115000,
      outputTokens: 43600,
      totalTokens: 158620,
      toolExecutions: 310,
      estimatedCost: '$0.012 USD',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Consumo de Inteligencia Artificial & Observabilidad
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Métricas consolidadas de consumo de tokens y llamadas a herramientas por cada inquilino.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {usageStats.map((item, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.title}
                </span>
                <Badge variant="purple">{item.badge}</Badge>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                <div className="text-xs text-slate-500 mt-1">{item.subtext}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Consumo por Inquilino</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Inquilino (Business)</th>
                <th className="px-6 py-3.5">Tokens Entrada (Prompt)</th>
                <th className="px-6 py-3.5">Tokens Salida (Respuestas)</th>
                <th className="px-6 py-3.5">Total Tokens</th>
                <th className="px-6 py-3.5">Tools Ejecutadas</th>
                <th className="px-6 py-3.5 text-right">Costo Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tenantBreakdown.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{t.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    {t.inputTokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    {t.outputTokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                    {t.totalTokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-blue-700">
                    {t.toolExecutions} llamadas
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 text-right">
                    {t.estimatedCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
