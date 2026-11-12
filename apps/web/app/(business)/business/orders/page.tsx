'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { Switch } from '@/components/ui/switch';

type OrderStage = 'pending' | 'preparing' | 'dispatched' | 'delivered';
type OrderFilter = 'active' | 'pending' | 'preparing' | 'dispatched' | 'delivered';
type OrderModality = 'Domicilio' | 'Mesa' | 'Para recoger';

interface OrderLineItem {
  id: string;
  quantity: number;
  name: string;
  unitPriceCop: number;
  doneness?: 'Azul' | '1/2 (Medio)' | '3/4' | 'Bien asado';
  sides: string[];
  modifiers?: string[];
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  destinationLabel: string;
  modality: OrderModality;
  paymentMethod: 'Nequi / Daviplata' | 'Transferencia Bancolombia' | 'Efectivo contraentrega' | 'Datáfono';
  paymentConfirmed: boolean;
  stage: OrderStage;
  elapsedMinutes: number;
  createdAtTime: string;
  deliveryFeeCop: number;
  whatsappSynced: boolean;
  items: OrderLineItem[];
}

interface QuickCatalogProduct {
  id: string;
  name: string;
  category: 'Cortes de Res' | 'Cerdo y Aves' | 'Entradas' | 'Bebidas';
  priceCop: number;
  available: boolean;
}

const INITIAL_ORDERS: KitchenOrder[] = [
  {
    id: 'ord-211',
    orderNumber: '#ORD-211',
    customerName: 'Santiago Morales',
    customerPhone: '+57 315 892 3301',
    destinationLabel: 'Cra 77A #64B-18 · Villa Luz',
    modality: 'Domicilio',
    paymentMethod: 'Nequi / Daviplata',
    paymentConfirmed: true,
    stage: 'pending',
    elapsedMinutes: 3,
    createdAtTime: '19:51',
    deliveryFeeCop: 5000,
    whatsappSynced: true,
    items: [
      {
        id: 'li-1',
        quantity: 2,
        name: 'Punta de Anca Madurada 400g',
        unitPriceCop: 58000,
        doneness: '3/4',
        sides: ['Papa criolla al romero', 'Arepa con queso'],
        modifiers: ['🚫 Sin cebolla en el chimichurri'],
      },
      {
        id: 'li-2',
        quantity: 1,
        name: 'Chorizo Santarrosano Artesanal',
        unitPriceCop: 16000,
        sides: ['Arepa boyacense', 'Limón'],
      },
    ],
  },
  {
    id: 'ord-209',
    orderNumber: '#ORD-209',
    customerName: 'Carlos Eduardo Ramírez',
    customerPhone: '+57 314 289 4410',
    destinationLabel: 'Calle 57B #82-14 Apto 402 · Santa Cecilia',
    modality: 'Domicilio',
    paymentMethod: 'Transferencia Bancolombia',
    paymentConfirmed: true,
    stage: 'preparing',
    elapsedMinutes: 14,
    createdAtTime: '19:40',
    deliveryFeeCop: 4000,
    whatsappSynced: true,
    items: [
      {
        id: 'li-3',
        quantity: 1,
        name: 'Punta de Anca Madurada 400g',
        unitPriceCop: 58000,
        doneness: '3/4',
        sides: ['Yuca al vapor', 'Ensalada de la casa'],
        modifiers: ['🔥 Corte grueso', 'Chimichurri aparte'],
      },
      {
        id: 'li-4',
        quantity: 1,
        name: 'Chorizo Santarrosano Artesanal',
        unitPriceCop: 16000,
        sides: ['Papa criolla'],
      },
      {
        id: 'li-5',
        quantity: 2,
        name: 'Cerveza Club Colombia Dorada',
        unitPriceCop: 8000,
        sides: ['Bien frías'],
      },
    ],
  },
  {
    id: 'ord-208',
    orderNumber: '#ORD-208',
    customerName: 'Mesa 6 · Familia Pineda',
    customerPhone: '+57 310 442 8890',
    destinationLabel: 'Salón Principal · Mesa 06',
    modality: 'Mesa',
    paymentMethod: 'Datáfono',
    paymentConfirmed: false,
    stage: 'preparing',
    elapsedMinutes: 23,
    createdAtTime: '19:31',
    deliveryFeeCop: 0,
    whatsappSynced: true,
    items: [
      {
        id: 'li-6',
        quantity: 1,
        name: 'Picada Santa Cruz Familiar (4 Pers)',
        unitPriceCop: 86000,
        doneness: '1/2 (Medio)',
        sides: ['Papa criolla', 'Mazorca asada', 'Guacamole fresco'],
        modifiers: ['⚠️ Prioridad: Niños en mesa', 'Ají picante aparte'],
      },
      {
        id: 'li-7',
        quantity: 1,
        name: 'Baby Beef 350g',
        unitPriceCop: 54000,
        doneness: 'Bien asado',
        sides: ['Papa a la francesa'],
      },
      {
        id: 'li-8',
        quantity: 1,
        name: 'Jarra de Sangría Artesanal 1L',
        unitPriceCop: 32000,
        sides: ['4 copas con hielo'],
      },
    ],
  },
  {
    id: 'ord-205',
    orderNumber: '#ORD-205',
    customerName: 'Juliana Martínez',
    customerPhone: '+57 320 491 7762',
    destinationLabel: 'Av. Boyacá #53-29 · Normandía',
    modality: 'Domicilio',
    paymentMethod: 'Efectivo contraentrega',
    paymentConfirmed: true,
    stage: 'dispatched',
    elapsedMinutes: 26,
    createdAtTime: '19:28',
    deliveryFeeCop: 6000,
    whatsappSynced: true,
    items: [
      {
        id: 'li-9',
        quantity: 1,
        name: 'Churrasco Argentino 350g',
        unitPriceCop: 52000,
        doneness: '1/2 (Medio)',
        sides: ['Papa criolla', 'Ensalada fresca'],
        modifiers: ['🚫 Alergia al maní (Sin trazas)'],
      },
      {
        id: 'li-10',
        quantity: 1,
        name: 'Limonada de Coco Natural',
        unitPriceCop: 10000,
        sides: ['Baja en azúcar'],
      },
    ],
  },
];

const INITIAL_QUICK_CATALOG: QuickCatalogProduct[] = [
  {
    id: 'prod-1',
    name: 'Punta de Anca Madurada 400g',
    category: 'Cortes de Res',
    priceCop: 58000,
    available: true,
  },
  {
    id: 'prod-2',
    name: 'Churrasco Argentino 350g',
    category: 'Cortes de Res',
    priceCop: 52000,
    available: true,
  },
  {
    id: 'prod-3',
    name: 'Baby Beef 350g',
    category: 'Cortes de Res',
    priceCop: 54000,
    available: true,
  },
  {
    id: 'prod-4',
    name: 'Costillas San Luis BBQ 500g',
    category: 'Cerdo y Aves',
    priceCop: 49000,
    available: false,
  },
  {
    id: 'prod-5',
    name: 'Chorizo Santarrosano Artesanal',
    category: 'Entradas',
    priceCop: 16000,
    available: true,
  },
  {
    id: 'prod-6',
    name: 'Morcilla Criolla al Carbón',
    category: 'Entradas',
    priceCop: 15000,
    available: false,
  },
  {
    id: 'prod-7',
    name: 'Jarra de Sangría Artesanal 1L',
    category: 'Bebidas',
    priceCop: 32000,
    available: true,
  },
];

function formatCop(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`;
}

function calculateOrderTotal(order: KitchenOrder): number {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCop,
    0
  );
  return itemsTotal + order.deliveryFeeCop;
}

function getTimerBadgeStyles(minutes: number, stage: OrderStage): {
  container: string;
  dot: string;
  label: string;
} {
  if (stage === 'delivered') {
    return {
      container: 'bg-[#F3F1EC] text-[#575653] border-[#E8E6DF]',
      dot: 'bg-[#8A8884]',
      label: `Cerrado · ${minutes}m`,
    };
  }
  if (minutes < 10) {
    return {
      container: 'bg-[#F3F1EC] text-[#141413] border-[#D5D2C8]',
      dot: 'bg-[#10B981]',
      label: `${minutes} min`,
    };
  }
  if (minutes <= 20) {
    return {
      container: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
      dot: 'bg-[#D97706]',
      label: `${minutes} min · Atención`,
    };
  }
  return {
    container: 'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]',
    dot: 'bg-[#EA580C] animate-ping',
    label: `${minutes} min · Demorado`,
  };
}

export default function BusinessOrdersKdsPage() {
  const [orders, setOrders] = React.useState<KitchenOrder[]>(INITIAL_ORDERS);
  const [filter, setFilter] = React.useState<OrderFilter>('active');
  const [is86DrawerOpen, setIs86DrawerOpen] = React.useState<boolean>(false);
  const [catalogProducts, setCatalogProducts] = React.useState<
    QuickCatalogProduct[]
  >(INITIAL_QUICK_CATALOG);
  const [catalogSearch, setCatalogSearch] = React.useState<string>('');
  const [lastWhatsAppToast, setLastWhatsAppToast] = React.useState<
    string | null
  >(null);

  // Reloj operativo en vivo que actualiza cada minuto
  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setOrders((prev) =>
        prev.map((order) =>
          order.stage === 'delivered'
            ? order
            : { ...order, elapsedMinutes: order.elapsedMinutes + 1 }
        )
      );
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const stageCounts = React.useMemo(() => {
    return {
      active: orders.filter((o) => o.stage !== 'delivered').length,
      pending: orders.filter((o) => o.stage === 'pending').length,
      preparing: orders.filter((o) => o.stage === 'preparing').length,
      dispatched: orders.filter((o) => o.stage === 'dispatched').length,
      delivered: orders.filter((o) => o.stage === 'delivered').length,
    };
  }, [orders]);

  const soldOutCount = React.useMemo(() => {
    return catalogProducts.filter((p) => !p.available).length;
  }, [catalogProducts]);

  const filteredOrders = React.useMemo(() => {
    if (filter === 'active') {
      return orders.filter((o) => o.stage !== 'delivered');
    }
    return orders.filter((o) => o.stage === filter);
  }, [orders, filter]);

  const filteredCatalog = React.useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return catalogProducts;
    return catalogProducts.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [catalogProducts, catalogSearch]);

  // Avance de estado en 1 clic con notificación simulada a WhatsApp Cloud API
  const handleAdvanceOrderStage = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const nextStageMap: Record<OrderStage, OrderStage> = {
      pending: 'preparing',
      preparing: 'dispatched',
      dispatched: 'delivered',
      delivered: 'delivered',
    };

    const nextStage = nextStageMap[targetOrder.stage];

    const notificationMessages: Record<OrderStage, string> = {
      pending: '',
      preparing: `WhatsApp enviado a ${targetOrder.customerName}: "🔥 Tu comanda ${targetOrder.orderNumber} ya está en la parrilla."`,
      dispatched: `WhatsApp enviado a ${targetOrder.customerName}: "🛵 Tu pedido ${targetOrder.orderNumber} va en camino."`,
      delivered: `Comanda ${targetOrder.orderNumber} cerrada y archivada. Solicitud de reseña programada en 45 min.`,
    };

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, stage: nextStage } : order
      )
    );

    if (notificationMessages[nextStage]) {
      setLastWhatsAppToast(notificationMessages[nextStage]);
      window.setTimeout(() => {
        setLastWhatsAppToast(null);
      }, 4000);
    }
  };

  // Agotar o reactivar plato en 1 clic (sincronizado con el Agente IA)
  const handleToggleProductAvailability = (
    productId: string,
    available: boolean
  ) => {
    setCatalogProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, available } : item
      )
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#FAF8F5] overflow-hidden relative">
      {/* =====================================================================
          CABECERA KDS: FILTROS DE COMANDA + BOTÓN RÁPIDO "AGOTAR PLATO (86)"
      ===================================================================== */}
      <header className="px-6 py-3.5 bg-white border-b border-[#E8E6DF] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-[#141413] tracking-[-0.02em]">
                Comandas en Vivo (KDS)
              </h1>
              <StatusPill
                status="ai_active"
                label="Sincronizado con WhatsApp"
                metric="Realtime"
                pulse
              />
            </div>
            <p className="text-xs text-[#575653] mt-0.5">
              Cada avance de estado notifica automáticamente al comensal por
              WhatsApp.
            </p>
          </div>
        </div>

        {/* Controles derechos: Filtros de Etapa + Botón Agotar Plato (86) */}
        <div className="flex items-center gap-3">
          {/* Segmented Control de Etapas */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#F3F1EC] border border-[#E8E6DF] select-none">
            {(
              [
                { id: 'active', label: 'Activas', count: stageCounts.active },
                { id: 'pending', label: 'Nuevas', count: stageCounts.pending },
                {
                  id: 'preparing',
                  label: 'En Parrilla',
                  count: stageCounts.preparing,
                },
                {
                  id: 'dispatched',
                  label: 'En Camino',
                  count: stageCounts.dispatched,
                },
                {
                  id: 'delivered',
                  label: 'Entregadas',
                  count: stageCounts.delivered,
                },
              ] as const
            ).map((tab) => {
              const isSelected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={[
                    'h-7 px-2.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                    isSelected
                      ? 'bg-white text-[#141413] shadow-2xs font-semibold'
                      : 'text-[#575653] hover:text-[#141413]',
                  ].join(' ')}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono metric-mono text-[10px] px-1.5 py-0.2 rounded bg-[#FAF8F5] border border-[#E8E6DF] text-[#575653]">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Botón Rápido: Agotar Plato (86) */}
          <Button
            variant={soldOutCount > 0 ? 'amber' : 'outline'}
            size="sm"
            onClick={() => setIs86DrawerOpen((prev) => !prev)}
          >
            <span>⚡ Agotar Plato (86)</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-black/15 font-mono metric-mono text-[10px]">
              {soldOutCount} agotados
            </span>
          </Button>
        </div>
      </header>

      {/* Notificación Flotante de Sincronización con WhatsApp */}
      {lastWhatsAppToast && (
        <div className="mx-6 mt-3 px-4 py-2.5 rounded-lg bg-[#0F291E] text-[#FAF8F5] border border-emerald-500/30 shadow-md flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{lastWhatsAppToast}</span>
          </div>
          <span className="font-mono metric-mono text-[11px] text-emerald-300">
            Meta Cloud API · 200 OK
          </span>
        </div>
      )}

      {/* =====================================================================
          GRILLA DE TICKETS TÉRMICOS DE COCINA (KDS)
      ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredOrders.length === 0 ? (
          <div className="h-64 rounded-lg border border-dashed border-[#D5D2C8] bg-white/50 flex flex-col items-center justify-center text-center p-6">
            <p className="text-sm font-semibold text-[#141413]">
              No hay comandas en esta etapa
            </p>
            <p className="text-xs text-[#8A8884] mt-1 max-w-sm">
              Los nuevos pedidos confirmados por el Agente IA en WhatsApp
              aparecerán aquí automáticamente en tiempo real.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
            {filteredOrders.map((order) => {
              const timerStyle = getTimerBadgeStyles(
                order.elapsedMinutes,
                order.stage
              );
              const totalCop = calculateOrderTotal(order);
              const isUrgent =
                order.elapsedMinutes > 20 && order.stage !== 'delivered';

              return (
                <article
                  key={order.id}
                  className={[
                    'rounded-lg bg-white border flex flex-col overflow-hidden transition-all',
                    isUrgent
                      ? 'border-[#EA580C] shadow-[0_0_0_1px_rgba(234,88,12,0.25),0_4px_12px_rgba(234,88,12,0.08)]'
                      : order.stage === 'pending'
                        ? 'border-[#D97706] shadow-[0_2px_8px_rgba(217,119,6,0.08)]'
                        : 'border-[#D5D2C8] shadow-2xs',
                  ].join(' ')}
                >
                  {/* Barra Superior Tipo Ticket Térmico */}
                  <div
                    className={[
                      'px-4 py-3 border-b flex items-center justify-between gap-2',
                      isUrgent
                        ? 'bg-[#FFF7ED] border-[#FED7AA]'
                        : order.stage === 'pending'
                          ? 'bg-[#FFFBEB] border-[#FDE68A]'
                          : 'bg-[#FAF8F5] border-[#E8E6DF]',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono metric-mono font-bold text-[#141413]">
                        {order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-[#D5D2C8] text-[#141413]">
                        {order.modality}
                      </span>
                    </div>

                    {/* Cronómetro Vivo con Código de Color */}
                    <span
                      className={[
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-mono metric-mono font-semibold',
                        timerStyle.container,
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'h-1.5 w-1.5 rounded-full',
                          timerStyle.dot,
                        ].join(' ')}
                      />
                      {timerStyle.label}
                    </span>
                  </div>

                  {/* Datos del Comensal y Destino */}
                  <div className="px-4 py-2.5 bg-white border-b border-[#E8E6DF] flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#141413] truncate">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-[#575653] truncate mt-0.5">
                        📍 {order.destinationLabel}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono metric-mono text-[11px] text-[#8A8884] block">
                        {order.createdAtTime}
                      </span>
                      <span
                        className={[
                          'text-[10px] font-medium px-1.5 py-0.5 rounded inline-block mt-0.5',
                          order.paymentConfirmed
                            ? 'bg-[#ECFDF5] text-[#065F46]'
                            : 'bg-[#FFFBEB] text-[#92400E]',
                        ].join(' ')}
                      >
                        {order.paymentConfirmed ? '✓ Pagado' : 'Cobrar al entregar'}
                      </span>
                    </div>
                  </div>

                  {/* Lista Detallada de Platos, Términos de Cocción y Guarniciones */}
                  <div className="p-4 divide-y divide-dashed divide-[#E8E6DF] space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="pt-3 first:pt-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="h-5 min-w-5 px-1.5 rounded bg-[#0F291E] text-[#FAF8F5] font-mono metric-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {item.quantity}x
                            </span>
                            <span className="text-[13px] font-semibold text-[#141413] leading-snug">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono metric-mono text-[#575653] shrink-0">
                            {formatCop(item.quantity * item.unitPriceCop)}
                          </span>
                        </div>

                        {/* Término de la carne y Acompañamientos */}
                        <div className="pl-7 flex flex-wrap gap-1.5">
                          {item.doneness && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF7ED] text-[#9A3412] border border-[#FED7AA]">
                              🥩 Término: {item.doneness}
                            </span>
                          )}
                          {item.sides.map((side) => (
                            <span
                              key={side}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F1EC] text-[#141413] border border-[#E8E6DF]"
                            >
                              + {side}
                            </span>
                          ))}
                        </div>

                        {/* Notas operativas / Alergias del plato */}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="pl-7 space-y-1">
                            {item.modifiers.map((note) => (
                              <p
                                key={note}
                                className="text-[11px] font-mono text-[#92400E] bg-[#FFFBEB] px-2 py-1 rounded border border-[#FDE68A]"
                              >
                                {note}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pie del Ticket: Total + Botón de Avance 1-Clic */}
                  <div className="mt-auto p-3.5 bg-[#FAF8F5] border-t border-[#E8E6DF] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#575653] font-medium">
                        {order.paymentMethod}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#575653]">Total:</span>
                        <span className="text-sm font-mono metric-mono font-bold text-[#141413]">
                          {formatCop(totalCop)}
                        </span>
                      </div>
                    </div>

                    {order.stage === 'pending' && (
                      <Button
                        variant="amber"
                        size="md"
                        className="w-full"
                        onClick={() => handleAdvanceOrderStage(order.id)}
                      >
                        Aceptar Comanda y Enviar a Parrilla →
                      </Button>
                    )}

                    {order.stage === 'preparing' && (
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full"
                        onClick={() => handleAdvanceOrderStage(order.id)}
                      >
                        Despachar Pedido (Notificar en WhatsApp) →
                      </Button>
                    )}

                    {order.stage === 'dispatched' && (
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full"
                        onClick={() => handleAdvanceOrderStage(order.id)}
                      >
                        Marcar como Entregado ✓
                      </Button>
                    )}

                    {order.stage === 'delivered' && (
                      <div className="h-9 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold flex items-center justify-center">
                        ✓ Pedido Entregado y Finalizado
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================================
          DRAWER LATERAL RÁPIDO: "⚡ AGOTAR PLATO (86)" EN 1 CLIC
      ===================================================================== */}
      {is86DrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25 backdrop-blur-[1px]">
          <div className="w-[380px] h-full bg-white border-l border-[#D5D2C8] shadow-2xl flex flex-col justify-between">
            <div className="p-4 border-b border-[#E8E6DF] bg-[#FAF8F5] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#141413]">
                    ⚡ Control Rápido de Agotados (86)
                  </h2>
                  <p className="text-[11px] text-[#575653] mt-0.5">
                    Al apagar un plato, el Agente IA deja de ofrecerlo al
                    instante en WhatsApp.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIs86DrawerOpen(false)}
                >
                  Cerrar ✕
                </Button>
              </div>

              <input
                type="search"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Buscar corte, entrada o bebida..."
                className="w-full h-8 px-3 text-xs bg-white border border-[#D5D2C8] rounded-md text-[#141413] placeholder:text-[#8A8884] focus:outline-none focus:border-[#0F291E]"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#E8E6DF] p-3">
              {filteredCatalog.map((product) => (
                <div
                  key={product.id}
                  className="py-2.5 px-2 flex items-center justify-between gap-3 rounded-md hover:bg-[#FAF8F5]"
                >
                  <div className="min-w-0">
                    <p
                      className={[
                        'text-xs font-semibold truncate',
                        product.available
                          ? 'text-[#141413]'
                          : 'text-[#8A8884] line-through',
                      ].join(' ')}
                    >
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#8A8884]">
                        {product.category}
                      </span>
                      <span className="text-[10px] font-mono metric-mono text-[#575653]">
                        {formatCop(product.priceCop)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={[
                        'text-[10px] font-mono metric-mono px-1.5 py-0.5 rounded font-semibold',
                        product.available
                          ? 'bg-[#ECFDF5] text-[#065F46]'
                          : 'bg-[#FEF2F2] text-[#991B1B]',
                      ].join(' ')}
                    >
                      {product.available ? 'DISPONIBLE' : 'AGOTADO (86)'}
                    </span>
                    <Switch
                      size="sm"
                      variant="emerald"
                      checked={product.available}
                      onCheckedChange={(checked) =>
                        handleToggleProductAvailability(product.id, checked)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border-t border-[#E8E6DF] flex items-center justify-between text-xs">
              <span className="text-[#575653]">
                Platos agotados hoy:{' '}
                <strong className="font-mono metric-mono text-[#141413]">
                  {soldOutCount}
                </strong>
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIs86DrawerOpen(false)}
              >
                Listo, sincronizar con IA
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
