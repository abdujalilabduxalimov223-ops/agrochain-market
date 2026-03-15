'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Product } from '@/types';
import {
  Warehouse, Package, CheckCircle, LogOut,
  User, Archive, MapPin, Calendar, ArrowLeft
} from 'lucide-react';

export default function WarehouseDashboard() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [draftProducts, setDraftProducts] = useState<Product[]>([]);
  const [packagedProducts, setPackagedProducts] = useState<Product[]>([]);
  const [storedProducts, setStoredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedUser, setSavedUser] = useState<any>({});

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setSavedUser(JSON.parse(user));
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allRes, packagedRes, storedRes] = await Promise.all([
        api.get('/products/my'),
        api.get('/warehouse/packaged'),
        api.get('/warehouse/stored'),
      ]);
      const all = allRes.data.data || [];
      setDraftProducts(all.filter((p: Product) => p.status === 'DRAFT'));
      setPackagedProducts(packagedRes.data.data || []);
      setStoredProducts(storedRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const packageProduct = async (productId: string) => {
    try {
      await api.patch('/warehouse/package', { productId });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik');
    }
  };

  const storeProduct = async (productId: string) => {
    const warehouseName = prompt('Ombor nomi:');
    if (!warehouseName) return;
    const warehouseLocation = prompt('Ombor manzili:');
    if (!warehouseLocation) return;
    const shelfCode = prompt('Shelf kodi (masalan: A-01-12):');
    if (!shelfCode) return;

    try {
      await api.patch('/warehouse/store', {
        productId,
        warehouseName,
        warehouseLocation,
        shelfCode,
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik');
    }
  };

  const stats = [
    {
      label: "Draft",
      value: draftProducts.length,
      icon: Package,
      gradient: "from-gray-400 to-gray-500",
      text: "text-gray-600"
    },
    {
      label: "Qadoqlangan",
      value: packagedProducts.length,
      icon: Archive,
      gradient: "from-blue-500 to-indigo-500",
      text: "text-blue-700"
    },
    {
      label: "Omborda",
      value: storedProducts.length,
      icon: Warehouse,
      gradient: "from-teal-500 to-emerald-500",
      text: "text-teal-700"
    },
    {
      label: "Jami",
      value: draftProducts.length + packagedProducts.length + storedProducts.length,
      icon: CheckCircle,
      gradient: "from-emerald-500 to-green-500",
      text: "text-emerald-700"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base">AgroChain</h1>
              <p className="text-xs text-teal-600 font-medium">Ombor kabineti</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                <User size={14} className="text-teal-700" />
              </div>
              <span className="text-sm font-medium text-gray-700">{savedUser.fullName}</span>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-xl transition-all duration-200"
            >
              <LogOut size={15} />
              Chiqish
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-6 py-2 flex gap-2 border-t border-gray-50">
          <button
            onClick={() => router.push('/farmer')}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition"
          >
            <ArrowLeft size={15} />
            Fermer kabineti
          </button>
          <button
            className="flex items-center gap-2 text-sm font-medium text-teal-600 bg-teal-50 px-4 py-2 rounded-xl"
          >
            <Warehouse size={15} />
            Ombor
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Ombor boshqaruvi 🏭</h2>
          <p className="text-gray-500 mt-1 text-sm">Mahsulotlarni qadoqlang va omborga joylashtiring</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <div className={`text-3xl font-bold ${stat.text}`}>{stat.value}</div>
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Jarayon ko'rsatkichi */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Package size={16} className="text-gray-500" />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                <div className="h-full bg-gray-300 rounded-full" style={{ width: '33%' }} />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Archive size={16} className="text-blue-500" />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '66%' }} />
              </div>
            </div>
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <Warehouse size={16} className="text-teal-500" />
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">DRAFT</span>
            <span className="text-xs text-blue-400">PACKAGED</span>
            <span className="text-xs text-teal-500">STORED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Draft */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <h2 className="font-bold text-gray-900">Draft mahsulotlar</h2>
              <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {draftProducts.length}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : draftProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-gray-400 text-sm">Draft mahsulotlar yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {draftProducts.map((product) => (
                  <div key={product.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={`http://localhost:3000${product.imageUrl}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">
                          {product.quantity} {product.unit} • {Number(product.price).toLocaleString()} so'm
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => packageProduct(product.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-xl transition font-medium"
                    >
                      Qadoqlash
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Qadoqlangan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h2 className="font-bold text-gray-900">Qadoqlangan</h2>
              <span className="ml-auto text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                {packagedProducts.length}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : packagedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Archive size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-gray-400 text-sm">Qadoqlangan mahsulot yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {packagedProducts.map((product) => (
                  <div key={product.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={`http://localhost:3000${product.imageUrl}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Archive size={16} className="text-blue-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">
                          {product.quantity} {product.unit}
                        </p>
                        {product.packagedAt && (
                          <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            {new Date(product.packagedAt).toLocaleDateString('uz-UZ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => storeProduct(product.id)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-xl transition font-medium"
                    >
                      Omborga joylash
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Omborda */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              <h2 className="font-bold text-gray-900">Omborda saqlangan</h2>
              <span className="ml-auto text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                {storedProducts.length}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : storedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Warehouse size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-gray-400 text-sm">Omborda mahsulot yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {storedProducts.map((product) => (
                  <div key={product.id} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-teal-50 border border-teal-100 flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={`http://localhost:3000${product.imageUrl}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Warehouse size={16} className="text-teal-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">
                          {product.quantity} {product.unit}
                        </p>
                      </div>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-3 space-y-1">
                      <p className="text-xs text-teal-700 font-medium flex items-center gap-1">
                        🏭 {product.warehouseName}
                      </p>
                      <p className="text-xs text-teal-600 flex items-center gap-1">
                        <MapPin size={10} />
                        {product.warehouseLocation}
                      </p>
                      <p className="text-xs text-gray-500">📦 {product.shelfCode}</p>
                      {product.expiresAt && (
                        <p className="text-xs text-orange-500 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(product.expiresAt).toLocaleDateString('uz-UZ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}