'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PlatformBusinessesPage() {
  const businesses = [
    {
      id: '018f3a5b-0001-7000-8000-000000000001',
      name: 'Restaurante Gourmet La Casona',
      slug: 'la-casona',
      industry: 'Gastronomía / Restaurante',
      status: 'active',
      plan: 'Pro Agency',
      wabaId: '109876543210987',
      phoneNumberId: '105551234567890',
      billingType: 'client_direct_meta',
      createdAt: '2026-01-15',
    },
    {
      id: '018f3a5b-0002-7000-8000-000000000002',
      name: 'Clínica Odontológica Sonrisas',
      slug: 'sonrisas-dental',
      industry: 'Salud & Citas',
      status: 'active',
      plan: 'Growth',
      wabaId: '109876543210999',
      phoneNumberId: '105551234567899',
      billingType: 'client_direct_meta',
      createdAt: '2026-02-01',
    },
    {
      id: '018f3a5b-0003-7000-8000-000000000003',
      name: 'Inmobiliaria Hábitat Premium',
      slug: 'habitat-premium',
      industry: 'Bienes Raíces',
      status: 'trial',
      plan: 'Trial 14 días',
      wabaId: 'Pendiente',
      phoneNumberId: 'Pendiente',
      billingType: 'client_direct_meta',
      createdAt: '2026-03-10',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Inquilinos (Businesses)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Aprovisiona nuevos clientes, administra cuentas y monitorea el estado del Embedded Signup.
          </p>
        </div>

        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
          onClick={() => {
            alert('Formulario de aprovisionamiento de nuevo inquilino (Business)');
          }}
        >
          <Plus className="w-4 h-4" />
          Aprovisionar Nuevo Inquilino
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, industria o ID..."
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
                <th className="px-6 py-3.5">Empresa / Tenant</th>
                <th className="px-6 py-3.5">Sector</th>
                <th className="px-6 py-3.5">Facturación WhatsApp</th>
                <th className="px-6 py-3.5">Plan SaaS</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {businesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{biz.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{biz.id}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{biz.industry}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded inline-block">
                      Meta Directa (client_direct_meta)
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="purple">{biz.plan}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={biz.status === 'active' ? 'success' : 'warning'}>
                      {biz.status === 'active' ? 'Activo' : 'Onboarding'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href="/business/dashboard"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      Abrir Tenant <ExternalLink className="w-3.5 h-3.5" />
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
