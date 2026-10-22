import React, { useState } from 'react';
import { FarmPlot, CropInfo, InventoryItem } from '../types/game';
import { CROPS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { X, Sparkles, Droplets, CheckCircle, Sprout } from 'lucide-react';

interface FarmModalProps {
  plots: FarmPlot[];
  seedsInBag: InventoryItem[];
  playerEnergy: number;
  onPlantPlot: (plotId: number, cropId: string) => void;
  onWaterPlot: (plotId: number) => void;
  onHarvestPlot: (plotId: number) => void;
  onWaterAll: () => void;
  onHarvestAll: () => void;
  onFeedAnimals: (type: 'chicken' | 'cow') => void;
  onClose: () => void;
}

export const FarmModal: React.FC<FarmModalProps> = ({
  plots,
  seedsInBag,
  playerEnergy,
  onPlantPlot,
  onWaterPlot,
  onHarvestPlot,
  onWaterAll,
  onHarvestAll,
  onFeedAnimals,
  onClose,
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>('padi');
  const [animalFeedMsg, setAnimalFeedMsg] = useState<string | null>(null);

  const availableSeeds = Object.values(CROPS);

  const readyToHarvestCount = plots.filter((p) => {
    if (!p.cropId || !p.plantedAt) return false;
    const crop = CROPS[p.cropId];
    return (Date.now() - p.plantedAt) / 1000 >= crop.growTimeSeconds;
  }).length;

  const unwateredCount = plots.filter((p) => p.cropId && !p.watered).length;

  const handleFeed = (type: 'chicken' | 'cow') => {
    if (playerEnergy < 5) {
      setAnimalFeedMsg('Stamina tidak cukup! Butuh 5 stamina.');
      return;
    }
    soundEngine.playHarvest();
    onFeedAnimals(type);
    setAnimalFeedMsg(
      type === 'chicken'
        ? 'Kamu memberi makan ayam! Mendapat 1 Telur Emas (+80 Xu).'
        : 'Kamu memberi makan sapi! Mendapat 1 Susu Murni (+150 Xu).'
    );
    setTimeout(() => setAnimalFeedMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-600/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-amber-400">PENGELOLAAN LADANG PERTANIAN</h2>
              <p className="text-[11px] text-slate-400 font-mono">Tanam bibit, siram air, dan panen komoditas untuk cuan!</p>
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

        {/* Action Controls Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Seed Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-mono text-[11px]">Pilih Bibit:</span>
            {availableSeeds.map((crop) => (
              <button
                key={crop.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCropId(crop.id);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                  selectedCropId === crop.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{crop.icon}</span>
                <span>{crop.name}</span>
                <span className="text-[9px] opacity-75">({crop.growTimeSeconds}d)</span>
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playWater();
                onWaterAll();
              }}
              disabled={unwateredCount === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                unwateredCount > 0
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Siram Semua ({unwateredCount})</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playHarvest();
                onHarvestAll();
              }}
              disabled={readyToHarvestCount === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-pixel text-[10px] transition-all cursor-pointer ${
                readyToHarvestCount > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold animate-pulse shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Panen Semua ({readyToHarvestCount})</span>
            </button>
          </div>
        </div>

        {/* 12 Soil Plots Grid */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {plots.map((plot, idx) => {
              const crop = plot.cropId ? CROPS[plot.cropId] : null;
              let isMature = false;
              let progress = 0;
              let secondsLeft = 0;

              if (crop && plot.plantedAt) {
                const elapsedSec = (Date.now() - plot.plantedAt) / 1000;
                progress = Math.min(1, elapsedSec / crop.growTimeSeconds);
                isMature = progress >= 1;
                secondsLeft = Math.max(0, Math.ceil(crop.growTimeSeconds - elapsedSec));
              }

              return (
                <div
                  key={plot.id}
                  className={`relative p-3 rounded-xl border flex flex-col items-center justify-between min-h-[120px] transition-all ${
                    plot.cropId
                      ? isMature
                        ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950 border-amber-900/60'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Plot Index */}
                  <span className="absolute top-1.5 left-2 text-[9px] font-mono text-slate-400">
                    #{idx + 1}
                  </span>

                  {/* Water badge */}
                  {plot.watered && (
                    <span className="absolute top-1.5 right-2 text-[10px]" title="Sudah Disiram">
                      💧
                    </span>
                  )}

                  {/* Crop Content */}
                  <div className="flex flex-col items-center my-auto">
                    {crop ? (
                      <>
                        <span className="text-3xl mb-1">{crop.icon}</span>
                        <span className="text-xs font-bold text-white text-center">{crop.name}</span>
                        {isMature ? (
                          <span className="text-[10px] font-pixel text-emerald-400 mt-1">SIAP PANEN!</span>
                        ) : (
                          <div className="flex flex-col items-center w-full mt-1">
                            <span className="text-[9px] font-mono text-slate-400">{secondsLeft}s lagi</span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${progress * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center py-2 text-slate-400">
                        <Sprout className="w-8 h-8 text-amber-700/60 mb-1" />
                        <span className="text-[11px] font-mono">Tanah Kosong</span>
                      </div>
                    )}
                  </div>

                  {/* Action on this single plot */}
                  <div className="w-full mt-2">
                    {plot.cropId ? (
                      isMature ? (
                        <button
                          onClick={() => {
                            soundEngine.playHarvest();
                            onHarvestPlot(plot.id);
                          }}
                          className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-[9px] font-bold rounded cursor-pointer transition-colors"
                        >
                          PANEN
                        </button>
                      ) : !plot.watered ? (
                        <button
                          onClick={() => {
                            soundEngine.playWater();
                            onWaterPlot(plot.id);
                          }}
                          className="w-full py-1 bg-sky-600 hover:bg-sky-500 text-white font-mono text-[10px] rounded cursor-pointer transition-colors"
                        >
                          Siram 💧
                        </button>
                      ) : (
                        <div className="text-center text-[9px] font-mono text-slate-400 py-1">Tumbuh...</div>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          soundEngine.playWater();
                          onPlantPlot(plot.id, selectedCropId);
                        }}
                        className="w-full py-1 bg-amber-600 hover:bg-amber-500 text-white font-mono text-[10px] rounded cursor-pointer transition-colors"
                      >
                        + Tanam
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Animal Farm Section (Kandang Ternak) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <h3 className="font-pixel text-xs text-amber-400 mb-3 flex items-center gap-2">
              <span>🐔</span>
              <span>KANDANG TERNAK AOI</span>
            </h3>

            {animalFeedMsg && (
              <div className="mb-3 p-2 bg-emerald-950/80 border border-emerald-600 rounded text-xs text-emerald-300 font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{animalFeedMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Chicken */}
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700/80 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐔</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Ayam Petelur Emas</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Beri makan jagung (-5 Stamina)</p>
                    <p className="text-[10px] text-amber-400 font-mono">Hasil: Telur Emas (+80 Xu)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleFeed('chicken')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Beri Pakan
                </button>
              </div>

              {/* Cow */}
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700/80 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐄</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Sapi Perah Segar</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Beri makan rumput (-5 Stamina)</p>
                    <p className="text-[10px] text-amber-400 font-mono">Hasil: Susu Murni (+150 Xu)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleFeed('cow')}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Beri Pakan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
