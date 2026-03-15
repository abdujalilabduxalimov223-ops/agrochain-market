'use client';

import { useState } from 'react';
import api from '@/lib/api';
import {
  QrCode, Search, Package, MapPin,
  Calendar, Warehouse, Truck, Star,
  ChevronDown, ChevronUp, Shield
} from 'lucide-react';

export default function ScanPage() {
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTimeline, setShowTimeline] = useState(true);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError("QR kod yoki batch raqam kiritilishi shart");
      return;
    }
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const res = await api.get(`/scan/qr/${qrCode.trim()}`);
      setResult(res.data.data);
    } catch {
      try {
        const res = await api.get(`/scan/batch/${qrCode.trim()}`);
        setResult(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Mahsulot topilmadi');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      PACKAGED: 'bg-blue-100 text-blue-600',
      STORED: 'bg-green-100 text-green-600',
      ORDERED: 'bg-yellow-100 text-yellow-600',
      IN_TRANSIT: 'bg-orange-100 text-orange-600',
      DELIVERED: 'bg-emerald-100 text-emerald-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Yaratildi',
      PACKAGED: 'Qadoqlandi',
      STORED: 'Omborda',
      ORDERED: 'Buyurtma berildi',
      IN_TRANSIT: "Yo'lda",
      DELIVERED: 'Yetkazildi',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-2xl mb-3">
            <QrCode size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AgroChain Scan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Mahsulotning to'liq tarixini tekshiring
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Qidiruv */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR kod yoki Batch raqam
          </label>
          <div className="flex gap-3">
            <input
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="QR-... yoki BATCH-..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <button
              onClick={handleScan}
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:bg-emerald-300 transition flex items-center gap-2 font-medium"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={20} />
              )}
              Qidirish
            </button>
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Test uchun */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Test uchun:</p>
            <button
              onClick={() => setQrCode('QR-1773066179740-122')}
              className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
            >
              QR-1773066179740-122
            </button>
          </div>
        </div>

        {/* Natija */}
        {result && (
          <div className="space-y-4">

            {/* Mahsulot asosiy */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{result.product.name}</h2>
                    <p className="text-emerald-100 mt-1">{result.product.category}</p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getStatusColor(result.product.status)}`}>
                    {getStatusLabel(result.product.status)}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-emerald-200 text-xs">Miqdori</p>
                    <p className="text-white font-semibold">
                      {result.product.quantity} {result.product.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-200 text-xs">Narxi</p>
                    <p className="text-white font-semibold">
                      {Number(result.product.price).toLocaleString()} so'm
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-200 text-xs">Batch</p>
                    <p className="text-white font-semibold text-xs break-all">
                      {result.product.batchNumber}
                    </p>
                  </div>
                </div>
              </div>

              {result.product.expiresAt && (
                <div className="px-6 py-3 bg-orange-50 border-t border-orange-100 flex items-center gap-2">
                  <Calendar size={16} className="text-orange-500" />
                  <p className="text-sm text-orange-700">
                    Yaroqlilik muddati: <span className="font-semibold">{formatDate(result.product.expiresAt)}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Ishonchlilik */}
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Shield size={24} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Haqiqiy mahsulot</p>
                <p className="text-sm text-gray-500">AgroChain tizimida ro'yxatdan o'tgan</p>
              </div>
              <div className="ml-auto">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  ✓ Tasdiqlangan
                </span>
              </div>
            </div>

            {/* Fermer */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🌾 Fermer ma'lumotlari
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Xo'jalik nomi</span>
                  <span className="text-gray-900 font-medium text-sm">{result.fermer.farmName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Hudud</span>
                  <span className="text-gray-900 text-sm flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-600" />
                    {result.fermer.region}
                    {result.fermer.district && `, ${result.fermer.district}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Reyting</span>
                  <span className="text-gray-900 text-sm flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    {result.fermer.rating} ({result.fermer.ratingCount} ta baho)
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <h3 className="font-semibold text-gray-800">Mahsulot tarixi</h3>
                {showTimeline ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showTimeline && (
                <div className="px-5 pb-5 space-y-3">

                  {/* Yaratildi */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <Package size={14} className="text-emerald-600" />
                      </div>
                      <div className="w-0.5 h-full bg-gray-100 mt-1" />
                    </div>
                    <div className="pb-3">
                      <p className="font-medium text-gray-900 text-sm">Mahsulot yaratildi</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(result.timeline.yaratildi)}</p>
                    </div>
                  </div>

                  {/* Qadoqlandi */}
                  {result.timeline.qadoqlandi && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <Package size={14} className="text-blue-600" />
                        </div>
                        <div className="w-0.5 h-full bg-gray-100 mt-1" />
                      </div>
                      <div className="pb-3">
                        <p className="font-medium text-gray-900 text-sm">Qadoqlandi</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(result.timeline.qadoqlandi)}</p>
                      </div>
                    </div>
                  )}

                  {/* Ombor */}
                  {result.timeline.omborga_joylandi && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                          <Warehouse size={14} className="text-purple-600" />
                        </div>
                        <div className="w-0.5 h-full bg-gray-100 mt-1" />
                      </div>
                      <div className="pb-3">
                        <p className="font-medium text-gray-900 text-sm">Omborga joylandi</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(result.timeline.omborga_joylandi)}</p>
                        {result.timeline.ombor && (
                          <div className="mt-1 bg-purple-50 rounded-lg px-3 py-2">
                            <p className="text-xs text-purple-700 font-medium">{result.timeline.ombor.name}</p>
                            <p className="text-xs text-purple-500">{result.timeline.ombor.location} • {result.timeline.ombor.shelfCode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Yetkazish */}
                  {result.yetkazish && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                          <Truck size={14} className="text-orange-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Yetkazib berish</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {result.yetkazish.deliveredAt
                            ? formatDate(result.yetkazish.deliveredAt)
                            : 'Jarayonda'}
                        </p>
                        <div className="mt-1 bg-orange-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-orange-700">📍 {result.yetkazish.deliveryAddress}</p>
                          <p className="text-xs text-orange-500 mt-0.5">{result.yetkazish.status}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reyting */}
            {result.reyting && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Star size={18} className="text-yellow-400" />
                  Mijoz bahosi
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={star <= result.reyting.score
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-200'}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{result.reyting.score}/5</span>
                </div>
                {result.reyting.comment && (
                  <p className="text-gray-600 text-sm mt-2 italic">"{result.reyting.comment}"</p>
                )}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}