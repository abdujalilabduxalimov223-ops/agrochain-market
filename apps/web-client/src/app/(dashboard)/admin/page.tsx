'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import {
  Users, Package, ShoppingCart, Truck,
  TrendingUp, LogOut, User, Star, DollarSign
} from 'lucide-react';

export default function AdminDashboard() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
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
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=10'),
        api.get('/admin/orders?limit=10'),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data?.data || []);
      setOrders(ordersRes.data.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik');
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      FARMER: 'bg-green-100 text-green-700',
      SELLER: 'bg-blue-100 text-blue-700',
      TRANSPORT: 'bg-orange-100 text-orange-700',
      ADMIN: 'bg-purple-100 text-purple-700',
      SUPER_ADMIN: 'bg-red-100 text-red-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-600';
  };

  const getOrderStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      DELIVERED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">AgroChain</h1>
              <p className="text-xs text-gray-500">Admin panel</p>
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

        {loading ? (
          <div className="text-center py-20 text-gray-400">Yuklanmoqda...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mb-3">
                  <Users size={20} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.foydalanuvchilar?.jami}</p>
                <p className="text-sm text-gray-500">Foydalanuvchilar</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-3">
                  <Package size={20} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.mahsulotlar?.jami}</p>
                <p className="text-sm text-gray-500">Mahsulotlar</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center mb-3">
                  <ShoppingCart size={20} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.buyurtmalar?.jami}</p>
                <p className="text-sm text-gray-500">Buyurtmalar</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-3">
                  <DollarSign size={20} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Number(stats?.tolovlar?.jami_tushumdagi || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Jami tushum (so'm)</p>
              </div>
            </div>

            {/* Buyurtmalar statistikasi */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Pending', value: stats?.buyurtmalar?.pending, color: 'border-yellow-400' },
                { label: 'Confirmed', value: stats?.buyurtmalar?.confirmed, color: 'border-blue-400' },
                { label: 'Delivered', value: stats?.buyurtmalar?.delivered, color: 'border-emerald-400' },
                { label: 'Cancelled', value: stats?.buyurtmalar?.cancelled, color: 'border-red-400' },
              ].map((item) => (
                <div key={item.label} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${item.color}`}>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Foydalanuvchilar */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Foydalanuvchilar</h2>
                <div className="space-y-2">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => updateUserStatus(user.id, 'BLOCKED')}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                            className="text-xs text-green-500 hover:text-green-700"
                          >
                            Faollashtir
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Oxirgi buyurtmalar */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Oxirgi buyurtmalar</h2>
                <div className="space-y-2">
                  {orders.map((order: any) => (
                    <div key={order.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-gray-900">{order.orderNumber}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {order.product?.name} — {order.seller?.fullName}
                      </p>
                      <p className="text-xs font-semibold text-gray-700">
                        {Number(order.totalPrice).toLocaleString()} so'm
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}