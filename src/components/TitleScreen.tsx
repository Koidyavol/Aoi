import React, { useState } from 'react';
import { AvatarAppearance } from '../types/game';
import {
  SKIN_COLORS,
  FACE_SHAPES,
  EYE_STYLES,
  HAIR_STYLES,
  HAIR_COLORS,
  OUTFITS,
} from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { Volume2, VolumeX, Sparkles, ShieldCheck, Scissors } from 'lucide-react';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';

interface TitleScreenProps {
  onStartGame: (name: string, server: 'Venus' | 'Apollo', appearance: AvatarAppearance) => void;
  defaultAppearance: AvatarAppearance;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, defaultAppearance }) => {
  const [playerName, setPlayerName] = useState('AvatarGaul');
  const [server, setServer] = useState<'Venus' | 'Apollo'>('Venus');
  const [appearance, setAppearance] = useState<AvatarAppearance>(defaultAppearance);
  const [isMuted, setIsMuted] = useState(false);
  const [showFullStudio, setShowFullStudio] = useState(false);

  const handleStart = () => {
    soundEngine.ensureAudio();
    soundEngine.playCoin();
    const finalName = playerName.trim() || 'WargaAOI';
    onStartGame(finalName, server, appearance);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  const toggleSound = () => {
    const active = soundEngine.toggleBgm();
    soundEngine.toggleSfx(active);
    setIsMuted(!active);
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-radial from-slate-900 via-sky-950 to-slate-950 text-slate-100 overflow-y-auto select-none"
    >
      {/* Sound toggle top-right */}
      <div className="w-full max-w-4xl flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-xs text-sky-400 font-mono tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>TEAMOBI NOSTALGIA REMAKE · BUILD 2026</span>
        </div>
        <button
          onClick={toggleSound}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? 'MUTE' : 'AUDIO ON'}</span>
        </button>
      </div>

      {/* Main Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto py-3 z-10">
        <div className="relative mb-2">
          <svg className="w-64 sm:w-80 md:w-[460px] h-auto drop-shadow-[0_10px_20px_rgba(2,132,199,0.5)]" viewBox="0 0 500 110">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <text
              x="250"
              y="55"
              textAnchor="middle"
              className="font-pixel text-[46px] font-extrabold tracking-wider"
              fill="url(#goldGrad)"
              stroke="#451a03"
              strokeWidth="6"
              paintOrder="stroke fill"
            >
              AVATAR
            </text>
            <text
              x="250"
              y="98"
              textAnchor="middle"
              className="font-pixel text-[26px] font-bold tracking-widest"
              fill="url(#cyanGrad)"
              stroke="#0f172a"
              strokeWidth="4"
              paintOrder="stroke fill"
            >
              ONLINE INDONESIA
            </text>
          </svg>
          <div className="absolute -top-3 -right-2 rotate-12 bg-amber-500 text-slate-950 font-pixel text-[9px] px-2 py-0.5 rounded shadow">
            AOI 2D
          </div>
        </div>

        <p className="text-xs sm:text-sm text-sky-200/90 max-w-lg mb-4 leading-relaxed">
          Nostalgia dunia maya Java legendaris! Berkebun sayur, mancing lele babon di danau, adu dadu di kasino, dan nongkrong cari gebetan di taman kota.
        </p>

        {/* Character Quick Setup Card */}
        <div className="w-full max-w-md bg-slate-900/90 border border-sky-800/60 rounded-xl p-4 shadow-xl backdrop-blur-sm text-left mb-4">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="text-xs font-pixel text-amber-400">BIODATA AVATAR</span>
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowFullStudio(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-amber-300 text-[11px] font-mono cursor-pointer transition-colors"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Buka Salon Penuh ✂️</span>
            </button>
          </div>

          {/* Nickname input */}
          <div className="mb-2.5">
            <label className="text-[11px] text-slate-300 font-medium block mb-1">Nama Karakter:</label>
            <input
              type="text"
              value={playerName}
              maxLength={14}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Contoh: Bocah_Venus"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>

          {/* Server Choice */}
          <div className="mb-2.5">
            <label className="text-[11px] text-slate-300 font-medium block mb-1">Pilih Server:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setServer('Venus')}
                className={`py-1.5 px-3 rounded text-xs font-mono font-medium transition-all text-center cursor-pointer ${
                  server === 'Venus'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ★ Venus (Populer)
              </button>
              <button
                type="button"
                onClick={() => setServer('Apollo')}
                className={`py-1.5 px-3 rounded text-xs font-mono font-medium transition-all text-center cursor-pointer ${
                  server === 'Apollo'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ✦ Apollo (Event Baru)
              </button>
            </div>
          </div>

          {/* Skin & Face Shape */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">Warna Kulit:</label>
              <div className="flex gap-1.5">
                {SKIN_COLORS.slice(0, 5).map((sk) => (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => setAppearance({ ...appearance, skinColor: sk.id })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      appearance.skinColor === sk.id ? 'scale-110 border-white shadow' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: sk.id }}
                    title={sk.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">Bentuk Wajah:</label>
              <div className="flex gap-1">
                {FACE_SHAPES.map((fs) => (
                  <button
                    key={fs.id}
                    type="button"
                    onClick={() => setAppearance({ ...appearance, faceShape: fs.id })}
                    className={`flex-1 py-1 text-[10px] rounded font-mono cursor-pointer transition-colors ${
                      appearance.faceShape === fs.id
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {fs.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Eye Expression */}
          <div className="mb-2.5">
            <label className="text-[11px] text-slate-300 font-medium block mb-1">Ekspresi Mata:</label>
            <div className="grid grid-cols-3 gap-1">
              {EYE_STYLES.map((ey) => (
                <button
                  key={ey.id}
                  type="button"
                  onClick={() => setAppearance({ ...appearance, eyeStyle: ey.id })}
                  className={`py-1 px-1.5 text-[10px] rounded font-mono truncate transition-colors cursor-pointer ${
                    appearance.eyeStyle === ey.id
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ey.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hairstyle selector */}
          <div className="mb-2.5">
            <label className="text-[11px] text-slate-300 font-medium block mb-1">Gaya Rambut:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {HAIR_STYLES.slice(0, 6).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setAppearance({ ...appearance, hairStyle: h.id })}
                  className={`py-1 px-1.5 text-[10px] rounded font-mono truncate transition-colors cursor-pointer ${
                    appearance.hairStyle === h.id
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outfit selector */}
          <div className="mb-1">
            <label className="text-[11px] text-slate-300 font-medium block mb-1">Pakaian Awal:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {OUTFITS.slice(0, 6).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setAppearance({ ...appearance, outfit: o.id })}
                  className={`py-1 px-1.5 text-[10px] rounded font-mono truncate transition-colors cursor-pointer ${
                    appearance.outfit === o.id
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Game CTA */}
        <button
          onClick={handleStart}
          className="group relative px-10 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-pixel text-xs sm:text-sm font-bold rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-900 animate-spin" />
          <span>MASUK KOTA SEKARANG</span>
          <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono">[SPACE / ENTER]</span>
        </button>
      </div>

      {/* Control Hint Line */}
      <div className="w-full text-center py-2 text-xs font-mono text-slate-400 z-10 border-t border-slate-800/80">
        <span>WASD / Panah Gerak</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Spasi Aksi / Interaksi</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Enter Buka Chat</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Esc Pause</span>
      </div>

      {/* Full Studio Modal Popup if opened from Title Screen */}
      {showFullStudio && (
        <AvatarCustomizerModal
          currentAppearance={appearance}
          playerName={playerName}
          onSaveAppearance={(newApp) => {
            setAppearance(newApp);
            setShowFullStudio(false);
          }}
          onClose={() => setShowFullStudio(false)}
        />
      )}
    </div>
  );
};
