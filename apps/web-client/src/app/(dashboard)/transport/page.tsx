'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Order, Delivery } from '@/types';
import { Truck, Package, CheckCircle, LogOut, User, MapPin } from 'lucide-react';

export default function TransportDashboard() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const savedUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {};

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, deliveriesRes] = await Promise.all([
        api.get('/transport/available-orders'),
        api.get('/transport/my-deliveries'),
      ]);
      setAvailableOrders(ordersRes.data.data || []);
      setMyDeliveries(deliveriesRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startDelivery = async (orderId: string) => {
    const address = prompt('Yetkazish manzili:');
    if (!address) return;
    try {
      await api.post('/transport/delivery', {
        orderId,
        deliveryAddress: address,
        pickupAddress: 'Fermer ombori',
      });
      alert('Yetkazish boshlandi!');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik');
    }
  };

  const updateStatus = async (deliveryId: string, status: string) => {
    try {
      await api.patch(`/transport/delivery/${deliveryId}/status`, { status });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik');
    }
  };

  const getNextStatus = (current: string) => {
    const flow: Record<string, string> = {
      ASSIGNED: 'PICKED_UP',
      PICKED_UP: 'IN_TRANSIT',
      IN_TRANSIT: 'ARRIVED',
      ARRIVED: 'DELIVERED',
    };
    return flow[current];
  };

  const getNextStatusLabel = (current: string) => {
    const labels: Record<string, string> = {
      ASSIGNED: 'Olindi',
      PICKED_UP: "Yo'lga chiqildi",
      IN_TRANSIT: 'Yetib keldi',
      ARRIVED: 'Topshirildi',
    };
    return labels[current];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ASSIGNED: 'bg-gray-100 text-gray-600',
      PICKED_UP: 'bg-blue-100 text-blue-600',
      IN_TRANSIT: 'bg-orange-100 text-orange-600',
      ARRIVED: 'bg-yellow-100 text-yellow-600',
      DELIVERED: 'bg-emerald-100 text-emerald-600',
      FAILED: 'bg-red-100 text-red-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const stats = [
    { label: "Tayyor buyurtmalar", value: availableOrders.length, icon: Package, color: "bg-orange-500" },
    { label: "Mening yetkazishlarim", value: myDeliveries.length, icon: Truck, color: "bg-blue-500" },
    { label: "Yetkazilgan", value: myDeliveries.filter((d: any) => d.status === 'DELIVERED').length, icon: CheckCircle, color: "bg-emerald-500" },
    { label: "Jarayondagi", value: myDeliveries.filter((d: any) => !['DELIVERED', 'FAILED'].includes(d.status)).length, icon: MapPin, color: "bg-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">AgroChain</h1>
              <p className="text-xs text-gray-500">Transport kabineti</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <span>{savedUser.fullName}</span>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition"
            >
              <LogOut size={16} />
              Chiqish
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tayyor buyurtmalar */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tayyor buyurtmalar</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div>
            ) : availableOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package size={40} className="mx-auto mb-2 opacity-30" />
                <p>Tayyor buyurtmalar yo'q</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableOrders.map((order: any) => (
                  <div key={order.id} className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-medium text-sm text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.product?.name} — {order.quantity} {order.product?.unit}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {order.product?.farmer?.farmName}, {order.product?.farmer?.region}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      {Number(order.totalPrice).toLocaleString()} so'm
                    </p>
                    <button
                      onClick={() => startDelivery(order.id)}
                      className="mt-2 w-full bg-orange-500 text-white text-xs py-2 rounded-xl hover:bg-orange-600 transition"
                    >
                      Yetkazishni boshlash
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mening yetkazishlarim */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mening yetkazishlarim</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div>
            ) : myDeliveries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Truck size={40} className="mx-auto mb-2 opacity-30" />
                <p>Yetkazishlar yo'q</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myDeliveries.map((delivery: any) => (
                  <div key={delivery.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-sm text-gray-900">
                        {delivery.order?.orderNumber}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {delivery.order?.product?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {delivery.deliveryAddress}
                    </p>
                    {getNextStatus(delivery.status) && (
                      <button
                        onClick={() => updateStatus(delivery.id, getNextStatus(delivery.status))}
                        className="mt-2 w-full bg-blue-600 text-white text-xs py-2 rounded-xl hover:bg-blue-700 transition"
                      >
                        {getNextStatusLabel(delivery.status)}
                      </button>
                    )}
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