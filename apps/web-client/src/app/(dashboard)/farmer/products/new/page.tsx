'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import {
  ArrowLeft, MapPin, Loader2, Package,
  Tag, Scale, DollarSign, Calendar, FileText,
  Navigation, CheckCircle, Image as ImageIcon
} from 'lucide-react';

const CATEGORIES = ['Sabzavot', 'Meva', 'Don', 'Dukkakli', 'Poliz', 'Ziravorlar', 'Boshqa'];
const UNITS = ['kg', 'tonna', 'dona', 'litr', 'qop'];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState({ region: '', address: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      category: '',
      description: '',
      quantity: '',
      unit: '',
      price: '',
      originRegion: '',
      originAddress: '',
      harvestDate: '',
      expiresAt: '',
    },
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=uz`
          );
          const data = await res.json();
          const region =
            data.address?.state ||
            data.address?.province ||
            data.address?.county ||
            "Noma'lum viloyat";
          const address =
            data.address?.road ||
            data.address?.suburb ||
            data.address?.city ||
            data.display_name?.split(',')[0] ||
            '';
          setValue('originRegion', region);
          setValue('originAddress', address);
          setLocation({ region, address });
        } catch {
          alert("Manzilni aniqlab bo'lmadi");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        alert("Joylashuvga ruxsat berilmadi. Qo'lda kiriting.");
      },
      { timeout: 10000 }
    );
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      const res = await api.post('/products', {
        name: data.name,
        category: data.category,
        description: data.description || undefined,
        quantity: Number(data.quantity),
        unit: data.unit,
        price: Number(data.price),
        originRegion: data.originRegion || undefined,
        harvestDate: data.harvestDate
          ? new Date(data.harvestDate).toISOString()
          : undefined,
        expiresAt: data.expiresAt
          ? new Date(data.expiresAt).toISOString()
          : undefined,
      });

      // Rasm yuklash
      if (imageFile && res.data.data?.id) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await api.post(
          `/upload/product/${res.data.data.id}/image`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      setSuccess(true);
      setTimeout(() => router.push('/farmer'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Mahsulot qo'shildi!</h2>
          <p className="text-gray-500 mt-2">Fermer kabinetiga qaytmoqdasiz...</p>
        </div>
      </div>
    );
  }

  const Required = () => <span className="text-red-500 ml-0.5">*</span>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/farmer')}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">Yangi mahsulot</h1>
            <p className="text-xs text-gray-500">
              <span className="text-red-500">*</span> — majburiy maydonlar
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Asosiy ma'lumotlar */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Package size={18} className="text-emerald-600" />
              Asosiy ma'lumotlar
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mahsulot nomi <Required />
              </label>
              <input
                {...register('name', { required: 'Mahsulot nomi kiritilishi shart' })}
                placeholder="Masalan: Pomidor, Olma, Bug'doy..."
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag size={14} className="inline mr-1 text-emerald-600" />
                Kategoriya <Required />
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const selected = watch('category') === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue('category', cat, { shouldValidate: true })}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition border ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-400'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <input
                type="hidden"
                {...register('category', { required: 'Kategoriya tanlanishi shart' })}
              />
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText size={14} className="inline mr-1 text-emerald-600" />
                Tavsif
              </label>
              <textarea
                {...register('description')}
                placeholder="Mahsulot sifati, xususiyatlari haqida..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
              />
            </div>
          </div>

          {/* Miqdor va narx */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Scale size={18} className="text-emerald-600" />
              Miqdor va narx
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miqdori <Required />
                </label>
                <input
                  {...register('quantity', {
                    required: 'Miqdor kiritilishi shart',
                    min: { value: 0.1, message: "Miqdor 0 dan katta bo'lishi kerak" },
                  })}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    errors.quantity ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O'lchov <Required />
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {UNITS.map((unit) => {
                    const selected = watch('unit') === unit;
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setValue('unit', unit, { shouldValidate: true })}
                        className={`py-2 rounded-xl text-sm font-medium transition border ${
                          selected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-400'
                        }`}
                      >
                        {unit}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="hidden"
                  {...register('unit', { required: "O'lchov tanlanishi shart" })}
                />
                {errors.unit && (
                  <p className="text-red-500 text-xs mt-1">{errors.unit.message as string}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign size={14} className="inline mr-1 text-emerald-600" />
                Narxi (so'm) <Required />
              </label>
              <div className="relative">
                <input
                  {...register('price', {
                    required: 'Narx kiritilishi shart',
                    min: { value: 1, message: "Narx 0 dan katta bo'lishi kerak" },
                  })}
                  type="number"
                  min="0"
                  placeholder="12000"
                  className={`w-full px-4 py-3 pr-16 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  so'm
                </span>
              </div>
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price.message as string}</p>
              )}
            </div>
          </div>

          {/* Rasm yuklash */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <ImageIcon size={18} className="text-emerald-600" />
              Mahsulot rasmi
            </h2>

            <div
              onClick={() => document.getElementById('image-input')?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 transition"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-gray-500">Rasm yuklash uchun bosing</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 5MB</p>
                </div>
              )}
            </div>

            <input
              id="image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>

          {/* Joylashuv */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <MapPin size={18} className="text-emerald-600" />
                Joylashuv
              </h2>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition disabled:opacity-50"
              >
                {locating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Aniqlanmoqda...
                  </>
                ) : (
                  <>
                    <Navigation size={16} />
                    Avtomatik aniqlash
                  </>
                )}
              </button>
            </div>

            {location.region && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-2">
                <MapPin size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">{location.region}</p>
                  {location.address && (
                    <p className="text-xs text-emerald-600">{location.address}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Viloyat / Hudud <Required />
              </label>
              <input
                {...register('originRegion', { required: 'Viloyat kiritilishi shart' })}
                placeholder="Masalan: Buxoro viloyati"
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.originRegion ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.originRegion && (
                <p className="text-red-500 text-xs mt-1">{errors.originRegion.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aniq manzil
              </label>
              <input
                {...register('originAddress')}
                placeholder="Masalan: G'ijduvon tumani"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Sanalar */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" />
              Sanalar
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hosil sanasi <Required />
                </label>
                <input
                  {...register('harvestDate', { required: 'Hosil sanasi kiritilishi shart' })}
                  type="date"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    errors.harvestDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.harvestDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.harvestDate.message as string}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yaroqlilik muddati <Required />
                </label>
                <input
                  {...register('expiresAt', { required: 'Yaroqlilik muddati kiritilishi shart' })}
                  type="date"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    errors.expiresAt ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.expiresAt && (
                  <p className="text-red-500 text-xs mt-1">{errors.expiresAt.message as string}</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Tugmalar */}
          <div className="flex gap-3 pb-6">
            <button
              type="button"
              onClick={() => router.push('/farmer')}
              className="flex-1 bg-white text-gray-700 font-medium py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 disabled:bg-emerald-300 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                'Saqlash'
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}