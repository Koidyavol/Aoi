import React from 'react';
import { Character, MapZone, PlayerStats } from '../types/game';
import {
  Backpack,
  Map,
  ShoppingBag,
  Scroll,
  Dices,
  User,
  Scissors,
  Volume2,
  VolumeX,
  Pause,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HUDProps {
  player: Character;
  stats: PlayerStats;
  zone: MapZone;
  hasUnclaimedQuests: boolean;
  onOpenInventory: () => void;
  onOpenMap: () => void;
  onOpenShop: () => void;
  onOpenQuests: () => void;
  onOpenCasino: () => void;
  onOpenProfile: () => void;
  onOpenCustomizer: () => void;
  onOpenPause: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  stats,
  zone,
  hasUnclaimedQuests,
  onOpenInventory,
  onOpenMap,
  onOpenShop,
  onOpenQuests,
  onOpenCasino,
  onOpenProfile,
  onOpenCustomizer,
  onOpenPause,
  isMuted,
  onToggleSound,
}) => {
  const getZoneLabel = (z: MapZone): string => {
    switch (z) {
      case 'taman':
        return 'Taman Kota AOI';
      case 'tani':
        return 'Kawasan Pertanian';
      case 'mancing':
        return 'Danau Pemancingan';
      case 'kasino':
        return 'Kasino & Hiburan';
      case 'rumah':
        return 'Rumah Pribadi';
    }
  };

  const expPercentage = Math.min(100, (stats.exp / stats.maxExp) * 100);
  const energyPercentage = Math.min(100, (stats.energy / stats.maxEnergy) * 100);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 select-none">
      {/* TOP PERIMETER BAR */}
      <div className="w-full flex justify-between items-start">
        {/* Top-Left: Player Status Cluster */}
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 shadow-lg flex items-center gap-3">
          {/* Avatar mini portrait */}
          <button
            onClick={onOpenProfile}
            title="Buka Profil"
            className="relative w-11 h-11 rounded-lg bg-sky-950 border border-sky-600/60 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform cursor-pointer"
          >
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: player.appearance.skinColor }}
            />
            <div
              className="absolute top-1.5 w-6 h-3 rounded-t-full"
              style={{ backgroundColor: player.appearance.hairColor }}
            />
            <span className="absolute -bottom-1 text-[8px] font-pixel text-amber-300 bg-slate-950 px-1 rounded">
              L{stats.level}
            </span>
          </button>

          {/* Info & Bars */}
          <div className="flex flex-col gap-1 min-w-[130px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white tracking-wide truncate max-w-[90px]">
                {player.name}
              </span>
              <span className="text-[10px] text-amber-400 font-pixel">Lv.{stats.level}</span>
            </div>

            {/* Stamina / Energy Bar */}
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${energyPercentage}%` }}
                />
              </div>
              <span className="text-[9px] font-mono tabular-nums text-amber-300 shrink-0">
                {stats.energy}/{stats.maxEnergy}
              </span>
            </div>

            {/* EXP Bar */}
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${expPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-Right: Currencies & Quick Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Location Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-mono text-sky-300 shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{getZoneLabel(zone)}</span>
          </div>

          {/* Coins (Xu) */}
          <div
            title="Koin Xu"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 border border-amber-600/50 rounded-lg text-xs font-mono shadow text-amber-300"
          >
            <span className="text-sm">🪙</span>
            <span className="tabular-nums font-bold">{stats.coins.toLocaleString()}</span>
            <span className="text-[10px] text-amber-400/80 font-pixel">Xu</span>
          </div>

          {/* Diamonds (Lượng) */}
          <div
            title="Diamond Lượng"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 border border-cyan-500/50 rounded-lg text-xs font-mono shadow text-cyan-300"
          >
            <span className="text-sm">💎</span>
            <span className="tabular-nums font-bold">{stats.diamonds.toLocaleString()}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleSound();
            }}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause / Menu Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenPause();
            }}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Menu & Panduan [Esc]"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM-RIGHT: ACTION QUICK TOOLBAR */}
      <div className="w-full flex justify-end items-end">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-xl shadow-2xl">
          {/* Inventory / Tas */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenInventory();
            }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 transition-transform active:scale-95 cursor-pointer"
            title="Tas & Penyimpanan [E]"
          >
            <Backpack className="w-5 h-5" />
            <span className="text-[8px] font-pixel mt-0.5">TAS</span>
          </button>

          {/* Peta / Map */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenMap();
            }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-sky-300 border border-slate-700 transition-transform active:scale-95 cursor-pointer"
            title="Peta Kota & Pindah Area [M]"
          >
            <Map className="w-5 h-5" />
            <span className="text-[8px] font-pixel mt-0.5">PETA</span>
          </button>

          {/* Toko / Shop */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenShop();
            }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 border border-slate-700 transition-transform active:scale-95 cursor-pointer"
            title="Toko Busana & Warung"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[8px] font-pixel mt-0.5">TOKO</span>
          </button>

          {/* Kasino */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenCasino();
            }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-purple-300 border border-slate-700 transition-transform active:scale-95 cursor-pointer"
            title="Kasino Dadu & Roda Hoki"
          >
            <Dices className="w-5 h-5" />
            <span className="text-[8px] font-pixel mt-0.5">KASINO</span>
          </button>

          {/* Quests / Misi */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenQuests();
            }}
            className="relative flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-yellow-300 border border-slate-700 transition-transform active:scale-95 cursor-pointer"
            title="Misi Harian AOI [Q]"
          >
            {hasUnclaimedQuests && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border border-slate-900 animate-ping" />
            )}
            <Scroll className="w-5 h-5" />
            <span className="text-[8px] font-pixel mt-0.5">MISI</span>
          </button>

          {/* Salon / Ganti Gaya */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenCustomizer();
            }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-b from-amber-600/30 to-amber-900/40 hover:from-amber-500/40 hover:to-amber-800/50 text-amber-300 border border-amber-500/50 transition-transform active:scale-95 cursor-pointer"
            title="Salon & Butik Busana AOI"
          >
            <Scissors className="w-5 h-5 text-amber-400" />
            <span className="text-[8px] font-pixel mt-0.5">SALON</span>
          </button>

          {/* Profil */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenProfile();
            }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 border border-slate-700 transition-transform active:scale-95 cursor-pointer"
            title="Profil & Biodata"
          >
            <User className="w-5 h-5" />
            <span className="text-[8px] font-pixel mt-0.5">PROFIL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
