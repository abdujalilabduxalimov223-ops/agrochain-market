'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import {
  Eye, EyeOff, ArrowLeft, ArrowRight,
  User, Phone, Lock, CreditCard, Briefcase, CheckCircle, Loader2
} from 'lucide-react';

const ROLES = [
  { value: 'FARMER',    label: 'Fermer',    emoji: '🌾', desc: "Qishloq xo'jaligi mahsulot yetishtiraman" },
  { value: 'SELLER',    label: 'Sotuvchi',  emoji: '🛒', desc: 'Mahsulotlarni sotib olib tarqataman' },
  { value: 'TRANSPORT', label: 'Transport', emoji: '🚚', desc: 'Mahsulotlarni yetkazib beraman' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const { register, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      password: '',
      passportSeries: '',
      jshir: '',
      farmName: '',
      region: '',
    }
  });

  const watchAll = watch();

  const submitRegister = async () => {
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/register', {
        fullName: watchAll.fullName,
        phone: watchAll.phone.startsWith('+') ? watchAll.phone : `+${watchAll.phone}`,
        password: watchAll.password,
        role: selectedRole,
        passportSeries: watchAll.passportSeries.toUpperCase(),
        jshir: watchAll.jshir,
        farmName: watchAll.farmName || undefined,
        region: watchAll.region || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const nextStep1 = () => {
    if (!watchAll.fullName.trim()) { setError("Ism familiya kiritilishi shart"); return; }
    if (!watchAll.phone.trim()) { setError("Telefon raqam kiritilishi shart"); return; }
    if (watchAll.password.length < 6) { setError("Parol kamida 6 ta belgi bo'lishi kerak"); return; }
    setError(''); setStep(2);
  };

  const nextStep2 = () => {
    if (!watchAll.passportSeries.trim()) { setError("Pasport seriyasi kiritilishi shart"); return; }
    if (!/^[A-Za-z]{2}[0-9]{7}$/.test(watchAll.passportSeries)) {
      setError("Pasport seriyasi AA1234567 formatida bo'lishi kerak"); return;
    }
    if (!watchAll.jshir.trim()) { setError("JSHIR kiritilishi shart"); return; }
    if (!/^[0-9]{14}$/.test(watchAll.jshir)) {
      setError("JSHIR 14 ta raqamdan iborat bo'lishi kerak"); return;
    }
    setError(''); setStep(3);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ro'yxatdan o'tdingiz!</h2>
          <p className="text-gray-500 mb-2 text-sm">
            Hisobingiz admin tomonidan tasdiqlanishini kuting.
          </p>
          <p className="text-gray-400 mb-6 text-xs">
            Tasdiqlangach tizimga kirishingiz mumkin bo'ladi.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            Kirish sahifasiga o'tish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="font-bold text-lg">A</span>
            </div>
            <div>
              <p className="font-bold">AgroChain</p>
              <p className="text-xs text-emerald-100">Ro'yxatdan o'tish</p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-3">
            {[
              { n: 1, label: "Shaxsiy" },
              { n: 2, label: "Pasport" },
              { n: 3, label: "Rol" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition ${
                  step > s.n
                    ? 'bg-white text-emerald-600'
                    : step === s.n
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/20 text-white'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className={`text-xs hidden sm:block ${step === s.n ? 'text-white' : 'text-emerald-200'}`}>
                  {s.label}
                </span>
                {i < 2 && <div className={`flex-1 h-0.5 ${step > s.n ? 'bg-white' : 'bg-white/30'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* ===== STEP 1 ===== */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Shaxsiy ma'lumotlar</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ism familiya <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('fullName')}
                    placeholder="Alisher Valiyev"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon raqam <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('phone')}
                    placeholder="+998901234567"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parol <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Kamida 6 ta belgi"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={nextStep1}
                className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                Davom etish <ArrowRight size={18} />
              </button>

              <p className="text-center text-sm text-gray-500">
                Hisobingiz bormi?{' '}
                <button onClick={() => router.push('/login')} className="text-emerald-600 font-medium hover:underline">
                  Kirish
                </button>
              </p>
            </div>
          )}

          {/* ===== STEP 2 ===== */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Pasport ma'lumotlari</h3>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 font-medium">Muhim</p>
                <p className="text-xs text-blue-600 mt-1">
                  Bir pasport orqali faqat 1 ta hisob yaratish mumkin.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pasport seriyasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('passportSeries')}
                    placeholder="AB1234567"
                    maxLength={9}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition uppercase"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Format: 2 harf + 7 raqam (AB1234567)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  JSHIR <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('jshir')}
                    placeholder="12345678901234"
                    maxLength={14}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">14 ta raqam — pasport orqasida</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setError(''); setStep(1); }}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} /> Orqaga
                </button>
                <button
                  onClick={nextStep2}
                  className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  Davom etish <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 3 ===== */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Rolingizni tanlang</h3>

              <div className="space-y-2">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition text-left ${
                      selectedRole === role.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{role.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{role.label}</p>
                      <p className="text-xs text-gray-500">{role.desc}</p>
                    </div>
                    {selectedRole === role.value && (
                      <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {selectedRole === 'FARMER' && (
                <div className="bg-green-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <Briefcase size={16} />
                    Fermer ma'lumotlari (ixtiyoriy)
                  </p>
                  <input
                    {...register('farmName')}
                    placeholder="Xo'jalik nomi"
                    className="w-full px-4 py-2.5 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                  <input
                    {...register('region')}
                    placeholder="Viloyat"
                    className="w-full px-4 py-2.5 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setError(''); setStep(2); }}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} /> Orqaga
                </button>
                <button
                  onClick={submitRegister}
                  disabled={loading || !selectedRole}
                  className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 disabled:bg-emerald-300 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Saqlanmoqda...</>
                  ) : (
                    <><CheckCircle size={18} /> Ro'yxatdan o'tish</>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}