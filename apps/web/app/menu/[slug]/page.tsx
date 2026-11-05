import React from 'react';
import type { Metadata } from 'next';
import { getPublicMenuAction } from '@/lib/actions/catalog.actions';
import PublicMenuClient from './public-menu-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPublicMenuAction(slug);
  const name = res.data?.business.name || 'Restaurante Santa Cruz';

  return {
    title: `Menú Digital & Carta Oficial — ${name}`,
    description: `Consulta la carta en tiempo real, platos a la brasa, carnes maduradas y disponibilidad al instante en ${name}.`,
  };
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await getPublicMenuAction(slug);

  const fallbackData = {
    business: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Restaurante Santa Cruz',
      description: 'Especialistas en carnes a la brasa, cortes madurados, gastronomía típica y eventos familiares.',
      location: {
        address: 'Sede Campestre Km 4 Vía Principal',
        city: 'Santa Cruz',
        country: 'Colombia',
        phone: '+57 300 123 4567',
      },
      business_hours: {
        schedule: 'Todos los días de 11:30 AM a 8:30 PM',
      },
    },
    categories: ['Parrilla & Carnes', 'Platos Típicos', 'Pescados & Mariscos', 'Para Compartir', 'Bebidas'],
    products: [],
  };

  const menuData = res.success && res.data ? res.data : fallbackData;

  return <PublicMenuClient menuData={menuData} slug={slug} />;
}
