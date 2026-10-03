'use client';

import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { deleteProductAction } from '@/lib/actions/catalog.actions';

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  isAvailable: boolean;
}

const initialProducts: ProductItem[] = [
  {
    id: 'prod_1',
    name: 'Pizza Margarita Clásica',
    sku: 'PIZ-MAR-01',
    category: 'Pizzas Artesanales',
    price: 28000,
    description: 'Masa madre, salsa pomodoro italiana, mozzarella de búfala fresca y albahaca.',
    isAvailable: true,
  },
  {
    id: 'prod_2',
    name: 'Pizza Pepperoni Supreme',
    sku: 'PIZ-PEP-02',
    category: 'Pizzas Artesanales',
    price: 32000,
    description: 'Doble porción de pepperoni curado, queso mozzarella y orégano fresco.',
    isAvailable: true,
  },
  {
    id: 'prod_3',
    name: 'Bowl Mediterráneo Vegano',
    sku: 'BWL-MED-03',
    category: 'Ensaladas & Bowls',
    price: 26000,
    description: 'Quinoa, garbanzos crocantes, aguacate, tomates cherry y aderezo tahini.',
    isAvailable: true,
  },
  {
    id: 'prod_4',
    name: 'Limonada de Coco Natural',
    sku: 'BEB-LIM-04',
    category: 'Bebidas',
    price: 9000,
    description: 'Leche de coco cremosa, jugo de limón fresco y hielo frappé.',
    isAvailable: false,
  },
];

export default function BusinessCatalogPage() {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Pizzas Artesanales',
    price: '',
    description: '',
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const toggleAvailability = (id: string) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
      )
    );
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteProductAction(productToDelete.id);
      if (res.success) {
        setProducts(products.filter((p) => p.id !== productToDelete.id));
        showNotification(`Producto "${productToDelete.name}" eliminado exitosamente del catálogo y de agilizio.`);
      } else {
        showNotification(res.error || 'Error al eliminar el producto', 'error');
      }
    } catch {
      showNotification('Error de conexión al eliminar el producto', 'error');
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const item: ProductItem = {
      id: `prod_${Date.now()}`,
      name: newProduct.name,
      sku: newProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
      category: newProduct.category,
      price: Number(newProduct.price),
      description: newProduct.description,
      isAvailable: true,
    };

    setProducts([...products, item]);
    setIsModalOpen(false);
    setNewProduct({ name: '', sku: '', category: 'Pizzas Artesanales', price: '', description: '' });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Menú y Catálogo de Productos
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Los productos y precios registrados aquí son consultados en tiempo real por el Agente de IA.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
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
            <CardTitle>Artículos del Menú ({products.length})</CardTitle>
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar artículo..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Producto</th>
                <th className="px-6 py-3.5">Categoría</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Precio (COP)</th>
                <th className="px-6 py-3.5">Disponibilidad</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((prod) => (
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
                    ${prod.price.toLocaleString('es-CO')}
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
            <h3 className="font-bold text-slate-900 text-lg mb-1">Agregar Nuevo Producto</h3>
            <p className="text-xs text-slate-500 mb-5">
              Ingresa los datos para que el Agente de IA pueda ofrecer este plato a los clientes.
            </p>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Plato / Producto
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ej: Pasta Carbonara Artesanal"
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
                    placeholder="25000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="PAS-CARB-05"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción e Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Menciona ingredientes clave para que la IA responda preguntas de alérgenos..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  Crear Producto
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
              ¿Eliminar producto del catálogo?
            </h3>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Estás a punto de eliminar permanentemente <span className="font-semibold text-slate-900">&quot;{productToDelete.name}&quot;</span> ({productToDelete.sku}).
            </p>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6">
              ⚠️ <strong>Impacto en agilizio:</strong> El agente de IA dejará de recomendar u ofrecer este plato inmediatamente en las conversaciones activas de WhatsApp.
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
                    Sí, Eliminar Producto
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
