'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getProductsAction,
  createProductAction,
  deleteProductAction,
  toggleProductAvailabilityAction,
  type CatalogProduct,
} from '@/lib/actions/catalog.actions';

const initialSantaCruzProducts: CatalogProduct[] = [
  {
    id: 'p1',
    name: 'Parrillada Especial Santa Cruz',
    sku: 'CAR-PAR-01',
    category: 'Parrilla & Carnes',
    price: 75000,
    description: 'Punta de anca, pechuga a la brasa, costilla, chorizo artesanal, arepa de choclo y papas criollas con chimichurri casero.',
    isAvailable: true,
  },
  {
    id: 'p2',
    name: 'Churrasco a la Brasa 350g',
    sku: 'CAR-CHU-02',
    category: 'Parrilla & Carnes',
    price: 42000,
    description: 'Corte tierno de chatas maduradas al carbón, servido con yuca al vapor, ensalada fresca campesina y chimichurri.',
    isAvailable: true,
  },
  {
    id: 'p3',
    name: 'Bandeja Típica Santa Cruz',
    sku: 'TIP-BAN-03',
    category: 'Platos Típicos',
    price: 36000,
    description: 'Fríjoles campesinos, arroz, carne molida en paila, chicharrón crocante carnudo, huevo frito, tajada de maduro y aguacate.',
    isAvailable: true,
  },
  {
    id: 'p4',
    name: 'Costillas BBQ Ahumadas',
    sku: 'CAR-COS-04',
    category: 'Parrilla & Carnes',
    price: 38500,
    description: '500g de costillas tiernas bañadas en salsa BBQ artesanal con panela y especias, con papas a la francesa.',
    isAvailable: true,
  },
  {
    id: 'p5',
    name: 'Cazuela de Mariscos Tradicional',
    sku: 'PES-CAZ-05',
    category: 'Pescados & Mariscos',
    price: 48000,
    description: 'Camarones, calamares y filete de pescado en crema de coco y cilantro fresco, servida con arroz de coco y patacones.',
    isAvailable: true,
  },
  {
    id: 'p6',
    name: 'Picada Campesina Familiar (4 personas)',
    sku: 'COM-PIC-06',
    category: 'Para Compartir',
    price: 95000,
    description: 'Lomo de cerdo, carne de res, chicharrón, morcilla, plátano maduro con queso, arepitas y ají casero.',
    isAvailable: true,
  },
  {
    id: 'p7',
    name: 'Jugo Natural en Fruta Fresca',
    sku: 'BEB-JUG-07',
    category: 'Bebidas',
    price: 7500,
    description: 'Fruta 100% natural (Mango, Maracuyá, Lulo, Mora o Guanábana), en agua o leche.',
    isAvailable: true,
  },
  {
    id: 'p8',
    name: 'Limonada de Coco Frappé',
    sku: 'BEB-LIM-08',
    category: 'Bebidas',
    price: 9500,
    description: 'Cremosa leche de coco de la costa con limón fresco, hierbabuena y hielo frappé.',
    isAvailable: true,
  },
];

export default function BusinessCatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>(initialSantaCruzProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<CatalogProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Parrilla & Carnes',
    price: '',
    description: '',
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch real products from Supabase
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await getProductsAction();
      if (res.success && res.data && res.data.length > 0) {
        setProducts(res.data);
      } else {
        setProducts(initialSantaCruzProducts);
      }
    } catch {
      setProducts(initialSantaCruzProducts);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleAvailability = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const newStatus = !target.isAvailable;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: newStatus } : p))
    );

    try {
      const res = await toggleProductAvailabilityAction(id, newStatus);
      if (!res.success) {
        showNotification(res.error || 'Error al actualizar disponibilidad', 'error');
        // Rollback
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isAvailable: !newStatus } : p))
        );
      }
    } catch {
      // Rollback on network failure
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isAvailable: !newStatus } : p))
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteProductAction(productToDelete.id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        showNotification(`Plato "${productToDelete.name}" eliminado del catálogo.`);
      } else {
        showNotification(res.error || 'Error al eliminar el plato', 'error');
      }
    } catch {
      showNotification('Error de conexión al eliminar', 'error');
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) return;

    setIsSubmitting(true);
    try {
      const res = await createProductAction({
        name: newProduct.name.trim(),
        sku: newProduct.sku.trim(),
        category: newProduct.category,
        price: Number(newProduct.price),
        description: newProduct.description.trim(),
      });

      if (res.success && res.data) {
        setProducts((prev) => [res.data!, ...prev]);
        showNotification(`"${newProduct.name}" agregado exitosamente al catálogo.`);
        setIsModalOpen(false);
        setNewProduct({
          name: '',
          sku: '',
          category: 'Parrilla & Carnes',
          price: '',
          description: '',
        });
      } else {
        showNotification(res.error || 'No se pudo crear el producto', 'error');
      }
    } catch {
      showNotification('Error de conexión al registrar producto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Menú y Catálogo — Restaurante Santa Cruz
            </h2>
            <Badge variant="purple">Catálogo en Vivo</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Los platos, precios y disponibilidad registrados aquí son consultados en tiempo real por agilizio en WhatsApp y en el simulador.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            title="Recargar catálogo de base de datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Plato / Producto
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between animate-fade-in shadow-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Catalog Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Artículos del Menú ({filteredProducts.length})</CardTitle>
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por plato, ingrediente o SKU..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Plato / Producto</th>
                <th className="px-6 py-3.5">Categoría</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Precio (COP)</th>
                <th className="px-6 py-3.5">Disponibilidad</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{prod.name}</div>
                    <div className="text-xs text-slate-500 max-w-sm truncate">{prod.description}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <Badge variant="outline">{prod.category}</Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{prod.sku}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    ${Number(prod.price || 0).toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAvailability(prod.id)}
                      className="cursor-pointer"
                    >
                      {prod.isAvailable ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 inline mr-1" /> Disponible
                        </Badge>
                      ) : (
                        <Badge variant="danger">
                          <XCircle className="w-3 h-3 inline mr-1" /> Agotado
                        </Badge>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleAvailability(prod.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {prod.isAvailable ? 'Marcar Agotado' : 'Habilitar'}
                      </button>
                      <button
                        onClick={() => setProductToDelete(prod)}
                        title="Eliminar producto"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Agregar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg mb-1">Agregar Plato a la Carta</h3>
            <p className="text-xs text-slate-500 mb-5">
              Al guardar, agilizio consultará de inmediato este plato en el simulador y por WhatsApp.
            </p>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Plato / Bebida
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ej: Lomo al Trapo Santa Cruz"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="45000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Parrilla & Carnes">Parrilla & Carnes</option>
                    <option value="Platos Típicos">Platos Típicos</option>
                    <option value="Pescados & Mariscos">Pescados & Mariscos</option>
                    <option value="Para Compartir">Para Compartir</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Postres">Postres</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SKU (Código Interno)
                </label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="CAR-LOM-09"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción e Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detalla guarniciones, términos de carne y alérgenos..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    'Guardar Plato'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-2">
              ¿Eliminar plato del menú?
            </h3>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Estás a punto de eliminar <span className="font-semibold text-slate-900">&quot;{productToDelete.name}&quot;</span> ({productToDelete.sku}).
            </p>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6">
              ⚠️ <strong>Impacto en agilizio:</strong> El agente dejará de ofrecer este plato de inmediato en WhatsApp y en el simulador.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Sí, Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
