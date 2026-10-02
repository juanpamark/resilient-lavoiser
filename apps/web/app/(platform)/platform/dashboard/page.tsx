import React from 'react';
import Link from 'next/link';
import {
  Building2,
  MessageSquare,
  ShoppingBag,
  Cpu,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PlatformDashboardPage() {
  const stats = [
    {
      title: 'Inquilinos Activos',
      value: '3',
      subtext: '+1 este mes',
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Conversaciones Totales',
      value: '1,420',
      subtext: '94% gestionadas por IA',
      icon: MessageSquare,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Pedidos Generados',
      value: '384',
      subtext: '$12,850,000 COP en ventas',
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Tokens de IA Consumidos',
      value: '485.6K',
      subtext: 'Gemini 2.5 Flash ($0.038 USD)',
      icon: Cpu,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const businesses = [
    {
      id: '018f3a5b-0001-7000-8000-000000000001',
      name: 'Restaurante Gourmet La Casona',
      industry: 'Gastronomía / Restaurante',
      status: 'active',
      plan: 'Pro Agency',
      whatsappPhone: '+57 300 999 8877',
      wabaStatus: 'connected',
      conversationsCount: 840,
    },
    {
      id: '018f3a5b-0002-7000-8000-000000000002',
      name: 'Clínica Odontológica Sonrisas',
      industry: 'Salud / Citas Médicas',
      status: 'active',
      plan: 'Growth',
      whatsappPhone: '+57 310 444 3322',
      wabaStatus: 'connected',
      conversationsCount: 460,
    },
    {
      id: '018f3a5b-0003-7000-8000-000000000003',
      name: 'Inmobiliaria Hábitat Premium',
      industry: 'Bienes Raíces',
      status: 'onboarding',
      plan: 'Trial',
      whatsappPhone: 'Pendiente registro',
      wabaStatus: 'pending',
      conversationsCount: 120,
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Resumen General de la Plataforma
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Supervisión global de empresas clientes, agentes de IA y canales WhatsApp.
          </p>
        </div>
        <Link
          href="/platform/businesses"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Building2 className="w-4 h-4" />
          Administrar Inquilinos
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
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
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{stat.subtext}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tenants Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Inquilinos Activos (Businesses)</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Empresas con agentes de IA aprovisionados y canales WhatsApp vinculados.
              </p>
            </div>
            <Link
              href="/platform/businesses"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Empresa</th>
                <th className="px-6 py-3">Sector</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">WhatsApp Conectado</th>
                <th className="px-6 py-3">Conversaciones</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {businesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {biz.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{biz.industry}</td>
                  <td className="px-6 py-4">
                    <Badge variant="purple">{biz.plan}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-medium text-slate-700">{biz.whatsappPhone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {biz.conversationsCount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href="/business/dashboard"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Impersonar <ExternalLink className="w-3 h-3" />
                    </Link>
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
