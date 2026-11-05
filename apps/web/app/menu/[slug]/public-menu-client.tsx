'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  MapPin,
  Clock,
  Phone,
  Search,
  MessageCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  Share2,
  ChefHat,
  Flame,
} from 'lucide-react';
import type { PublicMenuData, CatalogProduct } from '@/lib/actions/catalog.actions';

interface PublicMenuClientProps {
  menuData: PublicMenuData;
  slug: string;
}

export default function PublicMenuClient({ menuData, slug }: PublicMenuClientProps) {
  const { business, categories, products } = menuData;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const phoneRaw = business.location?.phone || '+573001234567';
  const phoneClean = phoneRaw.replace(/[^0-9]/g, '');

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all' || prod.category.toLowerCase() === selectedCategory.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      prod.name.toLowerCase().includes(q) ||
      prod.description.toLowerCase().includes(q) ||
      prod.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const availableCount = products.filter((p) => p.isAvailable).length;
  const unavailableCount = products.filter((p) => !p.isAvailable).length;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Menú Digital — ${business.name}`,
        text: `Consulta los platos, carnes a la brasa y precios en vivo de ${business.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace del menú copiado al portapapeles!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner / Restaurant Header */}
      <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800 pb-8 pt-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Top Navbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white uppercase">
                Menú Digital en Vivo
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                title="Compartir Menú"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartir
              </button>
            </div>
          </div>

          {/* Restaurant Main Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                <ChefHat className="w-3.5 h-3.5" />
                Parrilla Campestre & Cocina Tradicional
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {business.name}
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 max-w-xl leading-relaxed">
                {business.description}
              </p>
            </div>

            {/* Live Availability Stats Badge */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-semibold shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{availableCount} Platos Disponibles</span>
              </div>
              {unavailableCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/50 border border-rose-900/60 text-rose-300 font-medium text-[11px]">
                  <XCircle className="w-3 h-3 text-rose-400" />
                  <span>{unavailableCount} Agotados por hoy</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Hours Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{business.location?.address || 'Sede Campestre Km 4'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Todos los días: 11:30 AM – 8:30 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>WhatsApp Oficial: {business.location?.phone || '+57 300 123 4567'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Search & Category Filter Bar */}
        <div className="space-y-4 sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md pt-2 pb-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por plato, ingrediente o corte..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              Todos ({products.length})
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              const count = products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((prod) => {
            const orderMessage = encodeURIComponent(
              `¡Hola ${business.name}! Me gustaría ordenar el plato: *${prod.name}* ($${Number(prod.price).toLocaleString('es-CO')} COP). ¿Está disponible para entrega o reserva?`
            );
            const waOrderUrl = `https://wa.me/${phoneClean}?text=${orderMessage}`;

            return (
              <div
                key={prod.id}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  prod.isAvailable
                    ? 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/80 hover:shadow-xl'
                    : 'bg-slate-900/60 border-rose-950/60 opacity-75'
                }`}
              >
                <div>
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                      {prod.category}
                    </span>

                    {prod.isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/90 border border-rose-800/80 px-2.5 py-0.5 rounded-full animate-pulse">
                        <XCircle className="w-3 h-3 text-rose-400" /> Agotado por hoy
                      </span>
                    )}
                  </div>

                  {/* Dish Name */}
                  <h3
                    className={`text-lg font-bold tracking-tight ${
                      prod.isAvailable ? 'text-white' : 'text-slate-400 line-through'
                    }`}
                  >
                    {prod.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                {/* Footer: Price and Order Button */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Precio Oficial
                    </span>
                    <span
                      className={`text-lg font-extrabold ${
                        prod.isAvailable ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      ${Number(prod.price || 0).toLocaleString('es-CO')}
                      <span className="text-xs font-normal text-slate-400 ml-1">COP</span>
                    </span>
                  </div>

                  {prod.isAvailable ? (
                    <a
                      href={waOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all hover:scale-102"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Pedir por WhatsApp
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-500 font-medium text-xs cursor-not-allowed">
                      No disponible hoy
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 border border-slate-800 rounded-2xl bg-slate-800/20 p-8">
            <UtensilsCrossed className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-white">No encontramos platos con esa búsqueda</h4>
            <p className="text-xs text-slate-400 mt-1">
              Prueba cambiando los términos o selecciona otra categoría arriba.
            </p>
          </div>
        )}
      </main>

      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-6 z-40 animate-bounce-subtle">
        <a
          href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(
            `¡Hola! Estoy visitando el menú oficial de ${business.name} y quisiera consultar con agilizio sobre reservas y pedidos.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-2xl shadow-emerald-600/40 border border-emerald-400/30 transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
          <span>Chatear con el Agente de IA</span>
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {business.name}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Potenciado por</span>
            <span className="font-bold text-amber-400">agilizio</span>
            <span>— Agente de IA para WhatsApp</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
