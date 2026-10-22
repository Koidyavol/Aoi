import React, { useState } from 'react';
import { InventoryItem, AvatarAppearance } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { X, Backpack, Sparkles, Utensils, Shirt, Sprout, Fish } from 'lucide-react';

interface InventoryModalProps {
  items: InventoryItem[];
  appearance: AvatarAppearance;
  onEquipItem: (item: InventoryItem) => void;
  onSellItem: (item: InventoryItem, quantity: number) => void;
  onEatFood: (item: InventoryItem) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  items,
  appearance,
  onEquipItem,
  onSellItem,
  onEatFood,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'crop' | 'fish' | 'outfit' | 'food'>('all');

  const filteredItems = items.filter((it) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'crop') return it.category === 'crop' || it.category === 'seed';
    if (activeTab === 'fish') return it.category === 'fish';
    if (activeTab === 'outfit') return it.category === 'outfit' || it.category === 'hat' || it.category === 'wing';
    if (activeTab === 'food') return it.category === 'food';
    return true;
  });

  const totalCropsValue = items
    .filter((it) => it.category === 'crop')
    .reduce((sum, it) => sum + (it.sellPrice || 0) * it.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Backpack className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-amber-300">TAS & PENYIMPANAN AVATAR</h2>
              <p className="text-[11px] text-slate-400 font-mono">Kelola hasil tani, tangkapan ikan, dan pakaian</p>
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

        {/* Tab Filters */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('crop')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'crop' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Hasil Tani</span>
          </button>
          <button
            onClick={() => setActiveTab('fish')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'fish' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Fish className="w-3.5 h-3.5" />
            <span>Ikan</span>
          </button>
          <button
            onClick={() => setActiveTab('outfit')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'outfit' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Busana</span>
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'food' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Makanan</span>
          </button>
        </div>

        {/* Item List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-mono text-xs">
              Tas kategori ini masih kosong. Silakan berkebun, memancing, atau beli di toko!
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-800">
                    {item.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-300">
                        x{item.count}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.desc || 'Barang koleksi avatar.'}</p>
                    {item.sellPrice && (
                      <span className="text-[10px] text-amber-400 font-mono">
                        Harga Jual: {item.sellPrice} Xu/buah
                      </span>
                    )}
                  </div>
                </div>

                {/* Contextual actions */}
                <div className="flex items-center gap-2">
                  {item.category === 'crop' || item.category === 'fish' ? (
                    <button
                      onClick={() => {
                        soundEngine.playCoin();
                        onSellItem(item, 1);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs rounded-lg cursor-pointer transition-colors"
                    >
                      Jual ({item.sellPrice} Xu)
                    </button>
                  ) : null}

                  {item.category === 'food' ? (
                    <button
                      onClick={() => {
                        soundEngine.playHarvest();
                        onEatFood(item);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Makan (+Energi)
                    </button>
                  ) : null}

                  {item.category === 'outfit' || item.category === 'hat' || item.category === 'wing' ? (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onEquipItem(item);
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs rounded-lg cursor-pointer transition-colors"
                    >
                      Pakai Baju
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Bulk Sell for crops if available */}
        {totalCropsValue > 0 && activeTab === 'crop' && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Total Hasil Panen: <strong className="text-amber-400">{totalCropsValue} Xu</strong>
            </span>
            <button
              onClick={() => {
                soundEngine.playCoin();
                const cropItems = items.filter((it) => it.category === 'crop');
                cropItems.forEach((c) => onSellItem(c, c.count));
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Jual Semua Hasil Panen ({totalCropsValue} Xu)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
