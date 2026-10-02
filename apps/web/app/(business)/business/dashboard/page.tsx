import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  ShoppingBag,
  Users,
  Bot,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BusinessDashboardPage() {
  const stats = [
    {
      title: 'Conversaciones Hoy',
      value: '28',
      subtext: '92% automatizadas por IA',
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pedidos del Día',
      value: '12',
      subtext: '$396,000 COP generados',
      icon: ShoppingBag,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Clientes Nuevos',
      value: '9',
      subtext: 'Registrados vía WhatsApp',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Estado del Agente',
      value: 'Activo',
      subtext: 'Gemini 2.5 Flash en línea',
      icon: Bot,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  const recentConversations = [
    {
      id: 'conv_1',
      customerName: 'Santiago Gómez',
      phone: '+57 310 555 6677',
      lastMessage: '¿Qué pizzas tienen disponibles?',
      status: 'active' as const,
      statusLabel: 'IA Atendiendo',
      time: 'Hace 4 min',
    },
    {
      id: 'conv_2',
      customerName: 'Mariana Duarte',
      phone: '+57 301 222 3344',
      lastMessage: 'Necesito cancelar mi pedido de las 7pm por favor',
      status: 'waiting_for_human' as const,
      statusLabel: 'Esperando Asesor',
      time: 'Hace 8 min',
    },
    {
      id: 'conv_3',
      customerName: 'Carlos Ruiz',
      phone: '+57 320 888 9900',
      lastMessage: 'Perfecto, ya te transfiero el valor a Nequi',
      status: 'human_active' as const,
      statusLabel: 'Asesor en Control',
      time: 'Hace 15 min',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Panel de Operaciones — La Casona Gourmet
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitorea en tiempo real las conversaciones con tus clientes y la actividad del Agente de IA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/business/inbox"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Abrir Bandeja en Vivo
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
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
                  <div className="text-xs text-slate-500 mt-1">{stat.subtext}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Meta Direct Billing Notification Banner */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">
              WhatsApp Cloud API Conectado (Embedded Signup)
            </h4>
            <p className="text-xs text-emerald-700">
              Número: +57 300 999 8877 • WABA ID: 109876543210987 • Facturación directa con Meta
            </p>
          </div>
        </div>
        <Link
          href="/business/channels"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
        >
          Gestionar Conexión <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Recent Chats Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Conversaciones Recientes en WhatsApp</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Clientes que han interactuado hoy con el agente o el equipo humano.
              </p>
            </div>
            <Link
              href="/business/inbox"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver bandeja completa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Cliente</th>
                <th className="px-6 py-3.5">Teléfono</th>
                <th className="px-6 py-3.5">Último Mensaje</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5">Hora</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentConversations.map((chat) => (
                <tr key={chat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {chat.customerName}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    {chat.phone}
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                    {chat.lastMessage}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        chat.status === 'active'
                          ? 'success'
                          : chat.status === 'waiting_for_human'
                          ? 'warning'
                          : 'purple'
                      }
                    >
                      {chat.statusLabel}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {chat.time}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href="/business/inbox"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Atender →
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
