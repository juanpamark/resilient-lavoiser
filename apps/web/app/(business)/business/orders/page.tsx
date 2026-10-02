import React from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Phone,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BusinessOrdersPage() {
  const orders = [
    {
      id: 'ORD-104',
      customerName: 'Santiago Gómez',
      phone: '+57 310 555 6677',
      items: [
        { name: 'Pizza Margarita Clásica', quantity: 2, price: 28000 },
        { name: 'Limonada de Coco', quantity: 1, price: 9000 },
      ],
      total: 65000,
      status: 'confirmed',
      deliveryAddress: 'Calle 100 #15-20, Apto 402',
      time: 'Hace 12 min',
      paymentMethod: 'Contraentrega (Datáfono)',
    },
    {
      id: 'ORD-103',
      customerName: 'Carlos Ruiz',
      phone: '+57 320 888 9900',
      items: [{ name: 'Pizza Pepperoni Supreme', quantity: 1, price: 32000 }],
      total: 32000,
      status: 'delivered',
      deliveryAddress: 'Carrera 7 #72-41',
      time: 'Hace 45 min',
      paymentMethod: 'Transferencia Nequi',
    },
    {
      id: 'ORD-102',
      customerName: 'Mariana Duarte',
      phone: '+57 301 222 3344',
      items: [{ name: 'Bowl Mediterráneo Vegano', quantity: 2, price: 26000 }],
      total: 52000,
      status: 'cancelled',
      deliveryAddress: 'Calle 85 #11-53',
      time: 'Hace 1 hora',
      paymentMethod: 'Cancelado a petición del cliente',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Pedidos (Orders)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Órdenes procesadas automáticamente por el Agente de IA a través de WhatsApp.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Órdenes Recientes ({orders.length})</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Orden</th>
                <th className="px-6 py-3.5">Cliente</th>
                <th className="px-6 py-3.5">Detalle Items</th>
                <th className="px-6 py-3.5">Dirección Entrega</th>
                <th className="px-6 py-3.5">Total (COP)</th>
                <th className="px-6 py-3.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {order.id}
                    <div className="text-[11px] font-normal text-slate-400">{order.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{order.customerName}</div>
                    <div className="text-xs text-slate-500 font-mono">{order.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                    {order.items.map((i, idx) => (
                      <div key={idx}>
                        {i.quantity}x {i.name}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div>{order.deliveryAddress}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{order.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ${order.total.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'confirmed' && (
                      <Badge variant="purple">
                        <Clock className="w-3 h-3 inline mr-1" /> En Preparación
                      </Badge>
                    )}
                    {order.status === 'delivered' && (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 inline mr-1" /> Entregado
                      </Badge>
                    )}
                    {order.status === 'cancelled' && (
                      <Badge variant="danger">
                        <XCircle className="w-3 h-3 inline mr-1" /> Cancelado
                      </Badge>
                    )}
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
