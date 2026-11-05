'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Phone,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getOrdersAction,
  updateOrderStatusAction,
  type DashboardOrder,
} from '@/lib/actions/order.actions';

export default function BusinessOrdersPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_preparation' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getOrdersAction();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, nextStatus: any) => {
    setUpdatingId(orderId);
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      await updateOrderStatusAction(orderId, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders
    .filter((o) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'in_preparation') return o.status === 'in_preparation' || o.status === 'confirmed';
      return o.status === statusFilter;
    })
    .filter((o) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const prepCount = orders.filter((o) => o.status === 'in_preparation' || o.status === 'confirmed').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Pedidos & Comandas
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Órdenes de Restaurante Santa Cruz procesadas en tiempo real por el Agente de IA agilizio.
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refrescar Pedidos
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Total Pedidos</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{orders.length}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">En Cocina / Parrilla</div>
            <div className="text-2xl font-bold text-purple-700 mt-0.5">{prepCount}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Entregados</div>
            <div className="text-2xl font-bold text-emerald-700 mt-0.5">{deliveredCount}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Facturación WhatsApp</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              ${totalRevenue.toLocaleString('es-CO')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_preparation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'in_preparation'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            En Preparación ({prepCount})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'delivered'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Entregados ({deliveredCount})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'cancelled'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Cancelados ({cancelledCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por orden, cliente o plato..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Comandas ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Orden</th>
                <th className="px-6 py-3.5">Comensal</th>
                <th className="px-6 py-3.5">Platos de Parrilla</th>
                <th className="px-6 py-3.5">Destino / Pago</th>
                <th className="px-6 py-3.5">Total (COP)</th>
                <th className="px-6 py-3.5">Estado de Cocina</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No se encontraron órdenes con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {order.id}
                      <div className="text-[11px] font-normal text-slate-400">{order.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-500 font-mono">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 max-w-xs">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="font-medium">
                          <span className="font-bold text-slate-900">{i.quantity}x</span> {i.name}
                        </div>
                      ))}
                      {order.notes && (
                        <div className="text-[11px] text-amber-700 italic mt-1 bg-amber-50 px-2 py-0.5 rounded">
                          Nota: {order.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="font-medium text-slate-800">{order.deliveryAddress}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{order.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${order.total.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'in_preparation' || order.status === 'confirmed' ? (
                        <Badge variant="purple">
                          <Clock className="w-3 h-3 inline mr-1" /> En Parrilla / Preparación
                        </Badge>
                      ) : order.status === 'delivered' ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 inline mr-1" /> Entregado
                        </Badge>
                      ) : order.status === 'cancelled' ? (
                        <Badge variant="danger">
                          <XCircle className="w-3 h-3 inline mr-1" /> Cancelado
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pendiente</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                        <button
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          disabled={updatingId === order.id}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          Marcar Entregado
                        </button>
                      ) : order.status === 'delivered' ? (
                        <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completada
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Cancelada</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
