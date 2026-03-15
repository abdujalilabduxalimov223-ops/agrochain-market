'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  phone: z.string().min(1, 'Telefon raqam kiritish majburiy'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login', data);
      const { access_token, user } = res.data.data;
      setAuth(user, access_token);

      switch (user.role) {
        case 'FARMER': router.push('/farmer'); break;
        case 'SELLER': router.push('/seller'); break;
        case 'WAREHOUSE': router.push('/warehouse'); break;
        case 'TRANSPORT': router.push('/transport'); break;
        case 'SUPER_ADMIN':
        case 'ADMIN': router.push('/admin'); break;
        default: router.push('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AgroChain</h1>
          <p className="text-gray-500 mt-1">Qishloq xo'jaligi savdo platformasi</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Tizimga kirish</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon raqam
              </label>
              <input
                {...register('phone')}
                type="text"
                placeholder="+998901234567"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parol
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-3 rounded-xl transition duration-200"
            >
              {loading ? 'Kirish...' : 'Kirish'}
            </button>

          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Hisobingiz yo'qmi?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-emerald-600 font-medium hover:underline"
            >
              Ro'yxatdan o'tish
            </button>
          </p>

          {/* Roles info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Test foydalanuvchilar</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { role: 'Fermer', phone: '+998901234567' },
                { role: 'Seller', phone: '+998901111111' },
                { role: 'Transport', phone: '+998907777777' },
                { role: 'Admin', phone: '+998900000000' },
              ].map((u) => (
                <div key={u.role} className="bg-gray-50 rounded-lg p-2">
                  <p className="font-medium text-gray-700">{u.role}</p>
                  <p className="text-gray-400">{u.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}