'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Product, Order } from '@/types';
import {
  ShoppingCart, Package, TrendingUp,
  LogOut, Search, User, Star, MapPin, Clock, CheckCircle
} from 'lucide-react';

export default function SellerDashboard() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedUser, setSavedUser] = useState<any>({});

  const [orderModal, setOrderModal] = useState<{ open: boolean; product: any | null }>({
    open: false, product: null
  });
  const [orderForm, setOrderForm] = useState({
    quantity: '',
    buyerFullName: '',
    buyerPhone: '',
    deliveryAddress: '',
    paymentMethod: 'CASH',
  });
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setSavedUser(JSON.parse(user));
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catalogRes, ordersRes] = await Promise.all([
        api.get('/catalog/products'),
        api.get('/orders/my'),
      ]);
      setCatalog(catalogRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await api.get(`/catalog/products?search=${search}`);
      setCatalog(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const openOrderModal = (product: any) => {
    setOrderForm({
      quantity: '',
      buyerFullName: savedUser.fullName || '',
      buyerPhone: savedUser.phone || '',
      deliveryAddress: '',
      paymentMethod: 'CASH',
    });
    setOrderModal({ open: true, product });
  };

  const submitOrder = async () => {
    if (!orderModal.product) return;
    if (!orderForm.quantity || !orderForm.buyerFullName ||
        !orderForm.buyerPhone || !orderForm.deliveryAddress) {
      alert("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    try {
      setOrderLoading(true);
      await api.post('/orders', {
        productId: orderModal.product.id,
        quantity: Number(orderForm.quantity),
        buyerFullName: orderForm.buyerFullName,
        buyerPhone: orderForm.buyerPhone,
        deliveryAddress: orderForm.deliveryAddress,
        paymentMethod: orderForm.paymentMethod,
      });
      setOrderModal({ open: false, product: null });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik');
    } finally {
      setOrderLoading(false);
    }
  };

  const confirmReceived = async (orderId: string) => {
    if (!confirm("Mahsulotni oldingizmi? To'lov fermanga o'tadi.")) return;
    try {
      await api.patch(`/orders/${orderId}/confirm-received`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik');
    }
  };

  const getOrderStatusConfig = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      PENDING:   { color: 'bg-amber-100 text-amber-700',     label: 'Kutilmoqda' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-700',       label: 'Tasdiqlandi' },
      PREPARING: { color: 'bg-orange-100 text-orange-700',   label: 'Tayyorlanmoqda' },
      SHIPPED:   { color: 'bg-purple-100 text-purple-700',   label: "Yo'lda" },
      DELIVERED: { color: 'bg-emerald-100 text-emerald-700', label: 'Yetkazildi' },
      CANCELLED: { color: 'bg-red-100 text-red-700',         label: 'Bekor' },
    };
    return config[status] || { color: 'bg-gray-100 text-gray-600', label: status };
  };

  const getPaymentConfig = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      UNPAID:   { color: 'text-red-500',     label: "To'lanmagan" },
      LOCKED:   { color: 'text-amber-500',   label: 'Muzlatilgan' },
      RELEASED: { color: 'text-emerald-500', label: "To'langan" },
      REFUNDED: { color: 'text-gray-500',    label: 'Qaytarilgan' },
    };
    return config[status] || { color: 'text-gray-500', label: status };
  };

  const stats = [
    { label: "Katalogdagi",   value: catalog.length, icon: Package,      gradient: "from-blue-500 to-indigo-500",   text: "text-blue-700" },
    { label: "Buyurtmalarim", value: orders.length,  icon: ShoppingCart, gradient: "from-amber-500 to-orange-500",  text: "text-amber-700" },
    { label: "Tasdiqlangan",  value: orders.filter(o => o.status === 'CONFIRMED').length, icon: TrendingUp, gradient: "from-emerald-500 to-teal-500", text: "text-emerald-700" },
    { label: "Yetkazilgan",   value: orders.filter(o => o.status === 'DELIVERED').length, icon: Star,       gradient: "from-purple-500 to-pink-500",  text: "text-purple-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base">AgroChain</h1>
              <p className="text-xs text-blue-600 font-medium">Seller kabineti</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <User size={14} className="text-blue-700" />
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

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Xush kelibsiz, {savedUser.fullName?.split(' ')[0]}! 🛒
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

          {/* Katalog */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-900">Mahsulot katalogi</h2>
              <p className="text-xs text-gray-400 mt-0.5">{catalog.length} ta mahsulot mavjud</p>
            </div>
            <div className="px-6 py-3 border-b border-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Mahsulot qidirish..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                />
                <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                  <Search size={18} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : catalog.length === 0 ? (
              <div className="text-center py-16">
                <Package size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-gray-400 font-medium">Mahsulotlar yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {catalog.map((product) => (
                  <div key={product.id} className="flex gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors duration-150">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 flex-shrink-0 border border-gray-100">
                      {product.imageUrl ? (
                        <img
                          src={`http://localhost:3000${product.imageUrl}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={22} className="text-blue-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                          <p className="text-sm font-bold text-blue-600 mt-1">
                            {Number(product.price).toLocaleString()} so'm
                            <span className="text-gray-400 font-normal">/{product.unit}</span>
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Package size={10} />{product.quantity} {product.unit} mavjud
                            </span>
                            {product.originRegion && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin size={10} />{product.originRegion}
                              </span>
                            )}
                          </div>
                          {product.farmer && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-400">🌾 {product.farmer.farmName}</span>
                              <span className="text-xs text-amber-500 flex items-center gap-0.5">
                                <Star size={10} className="fill-amber-400" />{product.farmer.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => openOrderModal(product)}
                          className="bg-blue-600 text-white text-xs px-3 py-2 rounded-xl hover:bg-blue-700 transition flex-shrink-0 font-medium"
                        >
                          Buyurtma
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buyurtmalar */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-900">Mening buyurtmalarim</h2>
              <p className="text-xs text-gray-400 mt-0.5">{orders.length} ta buyurtma</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-gray-400 font-medium">Buyurtmalar yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 overflow-y-auto max-h-[600px]">
                {orders.map((order) => {
                  const statusCfg = getOrderStatusConfig(order.status);
                  const paymentCfg = getPaymentConfig(order.paymentStatus);
                  return (
                    <div key={order.id} className="px-6 py-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          {order.product?.imageUrl && (
                            <img
                              src={`http://localhost:3000${order.product.imageUrl}`}
                              alt={order.product?.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{order.product?.name}</p>
                            <p className="text-xs text-gray-400">{order.quantity} {order.product?.unit}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-sm font-bold text-blue-600">
                            {Number(order.totalPrice).toLocaleString()} so'm
                          </span>
                          <span className={`text-xs font-medium ${paymentCfg.color}`}>
                            {paymentCfg.label}
                          </span>
                        </div>
                      </div>

                      {order.delivery && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-xs">🚚</span>
                          <span className="text-xs text-purple-600 font-medium">{order.delivery.status}</span>
                          {order.delivery.deliveryAddress && (
                            <span className="text-xs text-gray-400 truncate">→ {order.delivery.deliveryAddress}</span>
                          )}
                        </div>
                      )}

                      {order.status === 'DELIVERED' && order.paymentStatus === 'LOCKED' && (
                        <button
                          onClick={() => confirmReceived(order.id)}
                          className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 rounded-xl transition font-medium"
                        >
                          <CheckCircle size={14} />
                          Oldim — to'lovni tasdiqlash
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Order Modal */}
      {orderModal.open && orderModal.product && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-blue-50 flex-shrink-0">
                {orderModal.product.imageUrl ? (
                  <img
                    src={`http://localhost:3000${orderModal.product.imageUrl}`}
                    alt={orderModal.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-blue-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{orderModal.product.name}</h3>
                <p className="text-sm text-blue-600 font-medium">
                  {Number(orderModal.product.price).toLocaleString()} so'm/{orderModal.product.unit}
                </p>
              </div>
            </div>

            <div className="space-y-4">

              {/* Miqdor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miqdor ({orderModal.product.unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={orderModal.product.quantity}
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder={`Max: ${orderModal.product.quantity} ${orderModal.product.unit}`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {orderForm.quantity && Number(orderForm.quantity) > 0 && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    Jami: {(Number(orderForm.quantity) * Number(orderModal.product.price)).toLocaleString()} so'm
                  </p>
                )}
              </div>

              {/* Ism */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ism familiya <span className="text-red-500">*</span>
                </label>
                <input
                  value={orderForm.buyerFullName}
                  onChange={(e) => setOrderForm(f => ({ ...f, buyerFullName: e.target.value }))}
                  placeholder="To'liq ismingiz"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon raqam <span className="text-red-500">*</span>
                </label>
                <input
                  value={orderForm.buyerPhone}
                  onChange={(e) => setOrderForm(f => ({ ...f, buyerPhone: e.target.value }))}
                  placeholder="+998901234567"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Manzil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yetkazib berish manzili <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={orderForm.deliveryAddress}
                  onChange={(e) => setOrderForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                  placeholder="Shahar, tuman, ko'cha, uy raqami"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* To'lov usuli */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To'lov usuli <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                  
                    { value: 'CARD',     label: 'Karta',   icon: '💳' },
                   
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setOrderForm(f => ({ ...f, paymentMethod: method.value }))}
                      className={`py-3 rounded-xl border text-sm font-medium transition flex flex-col items-center gap-1 ${
                        orderForm.paymentMethod === method.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <span>{method.icon}</span>
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Escrow eslatma */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium">🔒 Escrow to'lov tizimi</p>
                <p className="text-xs text-amber-600 mt-1">
                  To'lov muzlatiladi. Mahsulot qo'lingizga yetgach "Oldim" tugmasini
                  bosganingizda fermanga avtomatik o'tadi.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOrderModal({ open: false, product: null })}
                className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition text-sm"
              >
                Bekor qilish
              </button>
              <button
                onClick={submitOrder}
                disabled={orderLoading}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition text-sm flex items-center justify-center gap-2"
              >
                {orderLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  '🛒 Buyurtma berish'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}