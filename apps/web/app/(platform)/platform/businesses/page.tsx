'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  X,
  Store,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  industry: string;
  status: 'active' | 'trial' | 'suspended';
  plan: string;
  wabaId: string;
  phoneNumberId: string;
  billingType: string;
  createdAt: string;
}

const initialBusinesses: BusinessItem[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Restaurante Santa Cruz',
    slug: 'restaurante-santa-cruz',
    industry: 'Gastronomía & Parrilla',
    status: 'active',
    plan: 'Plan Gourmet Pro ($120 USD/mes)',
    wabaId: '109876543210987',
    phoneNumberId: '1412584025262699',
    billingType: 'client_direct_meta',
    createdAt: '2026-10-28',
  },
  {
    id: '018f3a5b-0002-7000-8000-000000000002',
    name: 'Clínica Odontológica Sonrisas',
    slug: 'sonrisas-dental',
    industry: 'Salud & Citas Médicas',
    status: 'active',
    plan: 'Plan Growth ($85 USD/mes)',
    wabaId: '109876543210999',
    phoneNumberId: '105551234567899',
    billingType: 'client_direct_meta',
    createdAt: '2026-09-15',
  },
  {
    id: '018f3a5b-0003-7000-8000-000000000003',
    name: 'Boutique Urbana Moda',
    slug: 'boutique-urbana',
    industry: 'Retail & Moda',
    status: 'trial',
    plan: 'Trial 14 días',
    wabaId: 'Pendiente',
    phoneNumberId: 'Pendiente',
    billingType: 'client_direct_meta',
    createdAt: '2026-10-20',
  },
];

export default function PlatformBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>(initialBusinesses);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBiz, setNewBiz] = useState({
    name: '',
    industry: 'Gastronomía / Restaurante',
    ownerEmail: '',
    plan: 'Plan Pro ($120 USD/mes)',
  });

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBiz.name.trim() || !newBiz.ownerEmail.trim()) return;

    const item: BusinessItem = {
      id: `biz_${Date.now()}`,
      name: newBiz.name.trim(),
      slug: newBiz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      industry: newBiz.industry,
      status: 'active',
      plan: newBiz.plan,
      wabaId: 'Por vincular',
      phoneNumberId: 'Por vincular',
      billingType: 'client_direct_meta',
      createdAt: new Date().toISOString().split('T')[0] || '2026-10-28',
    };

    setBusinesses([item, ...businesses]);
    setIsModalOpen(false);
    setNewBiz({
      name: '',
      industry: 'Gastronomía / Restaurante',
      ownerEmail: '',
      plan: 'Plan Pro ($120 USD/mes)',
    });
  };

  const filtered = businesses.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Gestión de Inquilinos & Clientes
            </h2>
            <Badge variant="purple">Panel Superadministrador</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Aprovisiona nuevos clientes, administra cuentas comerciales y monitorea el estado del agente de IA por empresa.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Aprovisionar Nuevo Cliente
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre de empresa o sector..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Empresa / Cliente</th>
                <th className="px-6 py-3.5">Sector</th>
                <th className="px-6 py-3.5">WhatsApp Conectado</th>
                <th className="px-6 py-3.5">Plan SaaS</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((biz) => (
                <tr key={biz.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-600" />
                      {biz.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{biz.id}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{biz.industry}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded inline-block">
                      Meta Directa (WABA Activa)
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="purple">{biz.plan}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={biz.status === 'active' ? 'success' : 'warning'}>
                      {biz.status === 'active' ? 'Activo' : 'Prueba'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href="/business/dashboard"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      Abrir Portal <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Aprovisionar Nuevo Inquilino */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg mb-1">Aprovisionar Nuevo Cliente</h3>
            <p className="text-xs text-slate-500 mb-5">
              Crea un espacio de trabajo aislado con su propio agente de IA, catálogo y bandeja en vivo.
            </p>

            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Comercial de la Empresa
                </label>
                <input
                  type="text"
                  required
                  value={newBiz.name}
                  onChange={(e) => setNewBiz({ ...newBiz, name: e.target.value })}
                  placeholder="Ej: Asadero & Parrilla El Roble"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sector / Industria
                </label>
                <select
                  value={newBiz.industry}
                  onChange={(e) => setNewBiz({ ...newBiz, industry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Gastronomía & Restaurante">Gastronomía & Restaurante</option>
                  <option value="Salud & Citas Médicas">Salud & Citas Médicas</option>
                  <option value="Retail & Comercio">Retail & Comercio</option>
                  <option value="Servicios Profesionales">Servicios Profesionales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico del Dueño / Administrador
                </label>
                <input
                  type="email"
                  required
                  value={newBiz.ownerEmail}
                  onChange={(e) => setNewBiz({ ...newBiz, ownerEmail: e.target.value })}
                  placeholder="gerencia@empresa.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan SaaS Asignado
                </label>
                <select
                  value={newBiz.plan}
                  onChange={(e) => setNewBiz({ ...newBiz, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Plan Básico ($50 USD/mes)">Plan Básico ($50 USD/mes)</option>
                  <option value="Plan Pro ($120 USD/mes)">Plan Pro ($120 USD/mes)</option>
                  <option value="Plan Enterprise ($250 USD/mes)">Plan Enterprise ($250 USD/mes)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm"
                >
                  Crear Inquilino
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
