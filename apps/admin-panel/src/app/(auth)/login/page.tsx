'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Shield } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { phone: '', password: '' }
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login', data);
      const { access_token, user } = res.data.data;

      if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
        setError('Faqat adminlar kirishi mumkin');
        return;
      }

      setAuth(user, access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
            <Shield size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AgroChain</h1>
          <p className="text-purple-300 mt-1">Admin boshqaruv paneli</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6">Tizimga kirish</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">
                Telefon raqam
              </label>
              <input
                {...register('phone', { required: true })}
                placeholder="+998900000000"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">
                Parol
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: true })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 rounded-xl transition duration-200"
            >
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/40 text-center mb-2">Admin hisob:</p>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white/70 text-sm font-medium">Bosh Admin</p>
              <p className="text-white/40 text-xs">+998900000000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}