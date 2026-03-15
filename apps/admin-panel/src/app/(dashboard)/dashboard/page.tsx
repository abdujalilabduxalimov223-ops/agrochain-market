'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import {
  Users, Package, ShoppingCart, Truck,
  TrendingUp, DollarSign, Star, LogOut,
  BarChart2, Shield, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

export default function AdminDashboard() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const savedUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('admin_user') || '{}')
    : {};

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=8'),
        api.get('/admin/orders?limit=8'),
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

  const orderChartData = stats ? [
    { name: 'Pending', value: stats.buyurtmalar.pending },
    { name: 'Delivered', value: stats.buyurtmalar.delivered },
    { name: 'Cancelled', value: stats.buyurtmalar.cancelled },
  ] : [];

  const areaData = [
    { name: 'Yan', orders: 2, revenue: 80000 },
    { name: 'Fev', orders: 4, revenue: 150000 },
    { name: 'Mar', orders: stats?.buyurtmalar?.jami || 0, revenue: Number(stats?.tolovlar?.jami_tushumdagi || 0) },
  ];

  const getRoleColor = (role: string) => {
    const c: Record<string, string> = {
      FARMER: 'bg-green-100 text-green-700',
      SELLER: 'bg-blue-100 text-blue-700',
      TRANSPORT: 'bg-orange-100 text-orange-700',
      ADMIN: 'bg-purple-100 text-purple-700',
      SUPER_ADMIN: 'bg-red-100 text-red-700',
    };
    return c[role] || 'bg-gray-100 text-gray-600';
  };

  const getOrderStatusColor = (status: string) => {
    const c: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      DELIVERED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-red-100 text-red-700',
      SHIPPED: 'bg-purple-100 text-purple-700',
    };
    return c[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">AgroChain</p>
              <p className="text-slate-400 text-xs">Admin panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: BarChart2, label: 'Dashboard', href: '/dashboard', active: true },
            { icon: Users, label: 'Foydalanuvchilar', href: '/users' },
            { icon: Package, label: 'Mahsulotlar', href: '/products' },
            { icon: ShoppingCart, label: 'Buyurtmalar', href: '/orders' },
            { icon: Users, label: 'Fermerlar', href: '/farmers' },
          ].map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                item.active
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {savedUser.fullName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{savedUser.fullName}</p>
              <p className="text-slate-500 text-xs">{savedUser.role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl text-sm transition"
          >
            <LogOut size={16} />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Tizim umumiy ko'rinishi</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Foydalanuvchilar', value: stats?.foydalanuvchilar?.jami, icon: Users, color: 'bg-purple-500' },
                { label: 'Mahsulotlar', value: stats?.mahsulotlar?.jami, icon: Package, color: 'bg-emerald-500' },
                { label: 'Buyurtmalar', value: stats?.buyurtmalar?.jami, icon: ShoppingCart, color: 'bg-yellow-500' },
                { label: 'Jami tushum', value: `${Number(stats?.tolovlar?.jami_tushumdagi || 0).toLocaleString()} s`, icon: DollarSign, color: 'bg-blue-500' },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon size={20} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Order status mini cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Pending', value: stats?.buyurtmalar?.pending, color: 'border-yellow-500' },
                { label: 'Confirmed', value: stats?.buyurtmalar?.confirmed, color: 'border-blue-500' },
                { label: 'Delivered', value: stats?.buyurtmalar?.delivered, color: 'border-emerald-500' },
                { label: 'Cancelled', value: stats?.buyurtmalar?.cancelled, color: 'border-red-500' },
              ].map((item) => (
                <div key={item.label} className={`bg-slate-900 rounded-xl p-4 border-l-4 ${item.color} border-r border-t border-b border-slate-800`}>
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-slate-400 text-sm">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-6 mb-6">

              {/* Area chart */}
              <div className="col-span-2 bg-slate-900 rounded-2xl p-5 border border-slate-800">
                <h3 className="text-white font-semibold mb-4">Buyurtmalar dinamikasi</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Area type="monotone" dataKey="orders" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                <h3 className="text-white font-semibold mb-4">Buyurtma holati</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={orderChartData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {orderChartData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-2 gap-6">

              {/* Users */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                <h3 className="text-white font-semibold mb-4">Foydalanuvchilar</h3>
                <div className="space-y-2">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                      <div>
                        <p className="text-white text-sm font-medium">{user.fullName}</p>
                        <p className="text-slate-400 text-xs">{user.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => updateUserStatus(user.id, 'BLOCKED')}
                            className="text-xs text-red-400 hover:text-red-300 transition"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                          >
                            Faollashtir
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                <h3 className="text-white font-semibold mb-4">Oxirgi buyurtmalar</h3>
                <div className="space-y-2">
                  {orders.map((order: any) => (
                    <div key={order.id} className="p-3 bg-slate-800 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-sm font-medium">{order.orderNumber}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        {order.product?.name} — {order.seller?.fullName}
                      </p>
                      <p className="text-purple-400 text-xs font-medium mt-1">
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