import React, { useState } from 'react';
import { InventoryItem } from '../types/game';
import { SHOP_ITEMS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { X, ShoppingBag, Sprout, Utensils, Shirt, CheckCircle } from 'lucide-react';

interface ShopModalProps {
  playerCoins: number;
  playerDiamonds: number;
  onBuyItem: (item: InventoryItem) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  playerCoins,
  playerDiamonds,
  onBuyItem,
  onClose,
}) => {
  const [category, setCategory] = useState<'all' | 'seed' | 'food' | 'fashion'>('all');
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const filteredItems = SHOP_ITEMS.filter((it) => {
    if (category === 'all') return true;
    if (category === 'seed') return it.category === 'seed';
    if (category === 'food') return it.category === 'food';
    if (category === 'fashion') return it.category === 'outfit' || it.category === 'hat' || it.category === 'wing';
    return true;
  });

  const handleBuy = (item: InventoryItem) => {
    if (item.buyPriceDiamonds) {
      if (playerDiamonds < item.buyPriceDiamonds) {
        setPurchaseMsg(`Diamond tidak cukup! Butuh ${item.buyPriceDiamonds} 💎`);
        setTimeout(() => setPurchaseMsg(null), 2500);
        return;
      }
    } else if (item.buyPrice) {
      if (playerCoins < item.buyPrice) {
        setPurchaseMsg(`Koin Xu tidak cukup! Butuh ${item.buyPrice} Xu`);
        setTimeout(() => setPurchaseMsg(null), 2500);
        return;
      }
    }

    soundEngine.playCoin();
    onBuyItem(item);
    setPurchaseMsg(`Berhasil membeli ${item.name}! Cek tasmu.`);
    setTimeout(() => setPurchaseMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-emerald-300">PUSAT PERBELANJAAN & WARUNG AOI</h2>
              <p className="text-[11px] text-slate-400 font-mono">Beli bibit ladang, jajanan warung, dan busana gaul</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency balances reminder */}
        <div className="px-5 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-amber-400">🪙 {playerCoins.toLocaleString()} Xu</span>
            <span className="text-cyan-400">💎 {playerDiamonds.toLocaleString()} Lượng</span>
          </div>
          {purchaseMsg && (
            <span className="text-emerald-400 text-[11px] font-bold animate-pulse">
              {purchaseMsg}
            </span>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 text-xs font-mono">
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              category === 'all' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Semua Barang
          </button>
          <button
            onClick={() => setCategory('seed')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              category === 'seed' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Bibit Tani</span>
          </button>
          <button
            onClick={() => setCategory('food')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              category === 'food' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Warung Makanan</span>
          </button>
          <button
            onClick={() => setCategory('fashion')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              category === 'fashion' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Mall Busana & Sayap</span>
          </button>
        </div>

        {/* Items Grid */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-800">
                  {item.icon}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.desc}</p>
                </div>
              </div>

              {/* Price & Buy CTA */}
              <div className="flex items-center gap-3">
                {item.buyPriceDiamonds ? (
                  <button
                    onClick={() => handleBuy(item)}
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>{item.buyPriceDiamonds}</span>
                    <span>💎 Beli</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>{item.buyPrice}</span>
                    <span>Xu Beli</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
