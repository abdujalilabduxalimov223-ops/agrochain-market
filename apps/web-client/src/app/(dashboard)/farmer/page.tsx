'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Product, Order } from '@/types';
import {
  Package, ShoppingCart, Warehouse, TrendingUp,
  LogOut, Plus, User, Pencil, CheckCircle, XCircle,
  MapPin, Clock, Star
} from 'lucide-react';

export default function FarmerDashboard() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

 const [savedUser, setSavedUser] = useState<any>({});

useEffect(() => {
  const user = localStorage.getItem('user');
  if (user) setSavedUser(JSON.parse(user));
}, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products/my'),
        api.get('/orders/farmer/incoming'),
      ]);
      setProducts(productsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { color: string; label: string; dot: string }> = {
      DRAFT:      { color: 'bg-gray-100 text-gray-600',    label: 'Qoralama',  dot: 'bg-gray-400' },
      PACKAGED:   { color: 'bg-blue-100 text-blue-700',    label: 'Qadoqlandi', dot: 'bg-blue-500' },
      STORED:     { color: 'bg-emerald-100 text-emerald-700', label: 'Omborda', dot: 'bg-emerald-500' },
      ORDERED:    { color: 'bg-yellow-100 text-yellow-700', label: 'Buyurtma', dot: 'bg-yellow-500' },
      IN_TRANSIT: { color: 'bg-orange-100 text-orange-700', label: "Yo'lda",  dot: 'bg-orange-500' },
      DELIVERED:  { color: 'bg-purple-100 text-purple-700', label: 'Yetkazildi', dot: 'bg-purple-500' },
    };
    return config[status] || { color: 'bg-gray-100 text-gray-600', label: status, dot: 'bg-gray-400' };
  };

  const getOrderStatusConfig = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      PENDING:   { color: 'bg-amber-100 text-amber-700',   label: 'Kutilmoqda' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-700',     label: 'Tasdiqlandi' },
      PREPARING: { color: 'bg-orange-100 text-orange-700', label: 'Tayyorlanmoqda' },
      SHIPPED:   { color: 'bg-purple-100 text-purple-700', label: "Yo'lda" },
      DELIVERED: { color: 'bg-emerald-100 text-emerald-700', label: 'Yetkazildi' },
      CANCELLED: { color: 'bg-red-100 text-red-700',       label: 'Bekor' },
    };
    return config[status] || { color: 'bg-gray-100 text-gray-600', label: status };
  };

  const confirmOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/farmer/${orderId}/confirm`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik');
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/farmer/${orderId}/cancel`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik');
    }
  };

  const stats = [
    {
      label: "Jami mahsulotlar",
      value: products.length,
      icon: Package,
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700"
    },
    {
      label: "Yangi buyurtmalar",
      value: orders.filter(o => o.status === 'PENDING').length,
      icon: ShoppingCart,
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-700"
    },
    {
      label: "Ombordagi",
      value: products.filter(p => p.status === 'STORED').length,
      icon: Warehouse,
      gradient: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
      text: "text-blue-700"
    },
    {
      label: "Yetkazilgan",
      value: orders.filter(o => o.status === 'DELIVERED').length,
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
      text: "text-purple-700"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base">AgroChain</h1>
              <p className="text-xs text-emerald-600 font-medium">Fermer kabineti</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <User size={14} className="text-emerald-700" />
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
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation */}
<div className="max-w-7xl mx-auto px-6 py-2 flex gap-2 border-b border-gray-100">
  <button
    onClick={() => router.push('/farmer')}
    className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl"
  >
    <Package size={15} />
    Dashboard
  </button>
  <button
    onClick={() => router.push('/warehouse')}
    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition"
  >
    <Warehouse size={15} />
    Ombor
  </button>
</div>

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Xush kelibsiz, {savedUser.fullName?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Bugungi holatingiz quyida</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Mahsulotlar — 3 ustun */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div>
                <h2 className="text-base font-bold text-gray-900">Mahsulotlarim</h2>
                <p className="text-xs text-gray-400 mt-0.5">{products.length} ta mahsulot</p>
              </div>
              <button
                onClick={() => router.push('/farmer/products/new')}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-xl transition-colors duration-200 font-medium shadow-sm shadow-emerald-200"
              >
                <Plus size={16} />
                Yangi
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Mahsulotlar yo'q</p>
                <p className="text-gray-300 text-sm mt-1">Birinchi mahsulotingizni qo'shing</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {products.map((product) => {
                  const statusCfg = getStatusConfig(product.status);
                  return (
                    <div key={product.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors duration-150 group">

                      {/* Rasm */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 flex-shrink-0 border border-gray-100">
                        {product.imageUrl ? (
                          <img
                            src={`http://localhost:3000${product.imageUrl}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-emerald-300" />
                          </div>
                        )}
                      </div>

                      {/* Ma'lumot */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500">
                            {product.quantity} {product.unit}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-sm font-medium text-emerald-600">
                            {Number(product.price).toLocaleString()} so'm
                          </span>
                        </div>
                        {product.originRegion && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin size={10} className="text-gray-300" />
                            <span className="text-xs text-gray-400">{product.originRegion}</span>
                          </div>
                        )}
                      </div>

                      {/* Status va tahrir */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <button
                          onClick={() => router.push(`/farmer/products/${product.id}/edit`)}
                          className="p-2 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Tahrirlash"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buyurtmalar — 2 ustun */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-900">Kelgan buyurtmalar</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {orders.filter(o => o.status === 'PENDING').length} ta yangi
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Buyurtmalar yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 overflow-y-auto max-h-96">
                {orders.map((order) => {
                  const statusCfg = getOrderStatusConfig(order.status);
                  return (
                    <div key={order.id} className="px-6 py-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-3">
                        <p className="text-sm font-medium text-gray-700">
                          {order.product?.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">
                            {order.quantity} {order.product?.unit}
                          </span>
                          <span className="text-sm font-bold text-emerald-600">
                            {Number(order.totalPrice).toLocaleString()} so'm
                          </span>
                        </div>
                      </div>

                      {order.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmOrder(order.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 rounded-xl transition-colors duration-200 font-medium"
                          >
                            <CheckCircle size={13} />
                            Tasdiqlash
                          </button>
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs py-2 rounded-xl transition-colors duration-200 font-medium"
                          >
                            <XCircle size={13} />
                            Bekor
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}