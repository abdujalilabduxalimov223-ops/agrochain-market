'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Shield, CheckCircle, XCircle, Link,
  Package, Truck, DollarSign, Search,
  ChevronDown, ChevronUp, Clock
} from 'lucide-react';

export default function BlockchainExplorer() {
  const [chain, setChain] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [chainRes, statsRes] = await Promise.all([
        api.get('/blockchain/chain'),
        api.get('/blockchain/stats'),
      ]);
      setChain(chainRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBlockIcon = (type: string) => {
    if (type?.includes('ORDER')) return <Package size={16} />;
    if (type?.includes('DELIVERY')) return <Truck size={16} />;
    if (type?.includes('PAYMENT')) return <DollarSign size={16} />;
    return <Shield size={16} />;
  };

  const getBlockColor = (type: string) => {
    if (!type) return 'from-gray-500 to-gray-600';
    if (type.includes('ORDER_CREATED')) return 'from-blue-500 to-blue-600';
    if (type.includes('ORDER_CONFIRMED')) return 'from-emerald-500 to-emerald-600';
    if (type.includes('ORDER_CANCELLED')) return 'from-red-500 to-red-600';
    if (type.includes('DELIVERY_STARTED')) return 'from-orange-500 to-orange-600';
    if (type.includes('DELIVERY_COMPLETED')) return 'from-purple-500 to-purple-600';
    if (type.includes('DELIVERY')) return 'from-amber-500 to-amber-600';
    if (type.includes('PAYMENT')) return 'from-teal-500 to-teal-600';
    return 'from-gray-500 to-gray-600';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ORDER_CREATED: 'Buyurtma yaratildi',
      ORDER_CONFIRMED: 'Buyurtma tasdiqlandi',
      ORDER_CANCELLED: 'Buyurtma bekor qilindi',
      DELIVERY_STARTED: 'Yetkazish boshlandi',
      DELIVERY_PICKED_UP: 'Mahsulot olindi',
      DELIVERY_IN_TRANSIT: "Yo'lda",
      DELIVERY_ARRIVED: 'Yetib keldi',
      DELIVERY_COMPLETED: 'Yetkazildi',
      DELIVERY_FAILED: 'Yetkazish muvaffaqiyatsiz',
      PAYMENT_RELEASED: "To'lov o'tkazildi",
    };
    return labels[type] || type;
  };

  const filteredChain = chain.filter((block) => {
    if (!search) return true;
    const data = typeof block.data === 'string'
      ? block.data
      : JSON.stringify(block.data);
    return (
      block.hash.includes(search) ||
      block.index.toString().includes(search) ||
      data.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">AgroChain Explorer</h1>
              <p className="text-xs text-slate-400">Blockchain tranzaksiyalar</p>
            </div>
          </div>
          <a href="/" className="text-slate-400 hover:text-white text-sm transition">
            ← Bosh sahifa
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <p className="text-3xl font-bold text-white">{stats.totalBlocks}</p>
              <p className="text-slate-400 text-sm mt-1">Jami bloklar</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <p className="text-3xl font-bold text-white">{stats.totalTransactions}</p>
              <p className="text-slate-400 text-sm mt-1">Tranzaksiyalar</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                {stats.isValid ? (
                  <CheckCircle size={20} className="text-emerald-400" />
                ) : (
                  <XCircle size={20} className="text-red-400" />
                )}
                <p className={`text-lg font-bold ${stats.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.isValid ? 'Tasdiqlangan' : 'Buzilgan'}
                </p>
              </div>
              <p className="text-slate-400 text-sm">Zanjir holati</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <p className="text-3xl font-bold text-white">
                {stats.transactionsByType?.length || 0}
              </p>
              <p className="text-slate-400 text-sm mt-1">Tranzaksiya turlari</p>
            </div>
          </div>
        )}

        {/* Tranzaksiya turlari */}
        {stats?.transactionsByType && (
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-8">
            <h3 className="text-white font-semibold mb-4">Tranzaksiya turlari</h3>
            <div className="flex flex-wrap gap-2">
              {stats.transactionsByType.map((tx: any) => (
                <div key={tx.type}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getBlockColor(tx.type)} text-white text-xs font-medium`}>
                  {getBlockIcon(tx.type)}
                  {getTypeLabel(tx.type)}: {tx._count.type}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Qidiruv */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hash, blok raqami yoki ma'lumot bo'yicha qidirish..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Blockchain */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChain.map((block, idx) => {
              const blockData = typeof block.data === 'string'
                ? JSON.parse(block.data)
                : block.data;
              const blockType = blockData?.type;
              const isExpanded = expandedBlock === block.id;
              const isGenesis = block.index === 0;

              return (
                <div key={block.id} className="relative">
                  {/* Connector line */}
                  {idx < filteredChain.length - 1 && (
                    <div className="absolute left-6 top-full w-0.5 h-3 bg-slate-600 z-10" />
                  )}

                  <div className={`bg-slate-800 rounded-2xl border transition ${
                    isExpanded ? 'border-emerald-500/50' : 'border-slate-700 hover:border-slate-600'
                  }`}>
                    {/* Block header */}
                    <button
                      onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                      className="w-full flex items-center gap-4 p-4 text-left"
                    >
                      {/* Block icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                        isGenesis ? 'from-yellow-500 to-amber-600' : getBlockColor(blockType)
                      } flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        {isGenesis ? (
                          <Shield size={20} className="text-white" />
                        ) : (
                          <span className="text-white">{getBlockIcon(blockType)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-400 text-xs">#{block.index}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${
                            isGenesis ? 'from-yellow-500 to-amber-500' : getBlockColor(blockType)
                          } text-white font-medium`}>
                            {isGenesis ? 'Genesis Block' : getTypeLabel(blockType)}
                          </span>
                        </div>
                        <p className="text-white font-mono text-xs truncate">
                          {block.hash}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(block.timestamp).toLocaleString('uz-UZ')}
                          </span>
                          <span className="text-slate-500 text-xs">
                            nonce: {block.nonce}
                          </span>
                          {block.transactions?.length > 0 && (
                            <span className="text-emerald-400 text-xs">
                              {block.transactions.length} tx
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-slate-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-slate-700 pt-4">

                        {/* Hash info */}
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-slate-900 rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">Hash</p>
                            <p className="text-emerald-400 font-mono text-xs break-all">{block.hash}</p>
                          </div>
                          <div className="bg-slate-900 rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">Oldingi hash</p>
                            <p className="text-blue-400 font-mono text-xs break-all">{block.prevHash}</p>
                          </div>
                        </div>

                        {/* Data */}
                        {!isGenesis && blockData?.payload && (
                          <div className="bg-slate-900 rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-2">Ma'lumotlar</p>
                            <div className="space-y-1">
                              {Object.entries(blockData.payload).map(([key, value]) => (
                                <div key={key} className="flex items-start gap-2 text-xs">
                                  <span className="text-slate-500 min-w-24">{key}:</span>
                                  <span className="text-white break-all">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Link icon */}
                        {idx > 0 && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Link size={12} />
                            <span>Oldingi blok: #{block.index - 1}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}