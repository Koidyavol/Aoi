import React from 'react';
import { Character, PlayerStats, AvatarAppearance } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { X, User, Award, Scissors } from 'lucide-react';

interface ProfileModalProps {
  player: Character;
  stats: PlayerStats;
  onUpdateAppearance: (app: AvatarAppearance) => void;
  onUpdateTitle: (title: string) => void;
  onOpenCustomizer: () => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  player,
  stats,
  onUpdateAppearance,
  onUpdateTitle,
  onOpenCustomizer,
  onClose,
}) => {
  const titles = [
    'Warga Baru AOI',
    'Petani Teladan',
    'Pendekar Venus',
    'Jawara Mancing',
    'Sultan Kasino',
    'Bocah Tongkrongan',
  ];

  const hairColors = [
    { label: 'Hitam', hex: '#1e293b' },
    { label: 'Coklat', hex: '#78350f' },
    { label: 'Pirang', hex: '#facc15' },
    { label: 'Merah', hex: '#ef4444' },
    { label: 'Biru Neon', hex: '#06b6d4' },
    { label: 'Perak', hex: '#cbd5e1' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-b border-cyan-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-cyan-300">PROFIL & BIODATA AVATAR</h2>
              <p className="text-[11px] text-slate-400 font-mono">Status sosial, gelar kehormatan, dan penataan gaya</p>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Top Card: Avatar Portrait & Stats */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl bg-sky-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg">
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: player.appearance.skinColor }}
              />
              <div
                className="absolute top-3 w-9 h-4 rounded-t-full"
                style={{ backgroundColor: player.appearance.hairColor }}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{player.name}</h3>
                <span className="text-[9px] font-pixel text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600">
                  SERVER {stats.server}
                </span>
              </div>
              <p className="text-xs text-yellow-300 font-mono mt-0.5">&lt;{player.title}&gt;</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-2">
                <span>Level {stats.level}</span>
                <span>·</span>
                <span>Tani Lv.{stats.farmLevel}</span>
                <span>·</span>
                <span>Mancing Lv.{stats.fishLevel}</span>
              </div>
            </div>
          </div>

          {/* Full Customizer Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenCustomizer();
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-pixel text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Scissors className="w-4 h-4" />
            <span>BUKA SALON & KUSTOMISASI PENUH</span>
          </button>

          {/* Change Title */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Gelar Kehormatan Avatar:</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {titles.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateTitle(t);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer truncate ${
                    player.title === t
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color Switcher */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 mb-2">
              <Scissors className="w-4 h-4 text-cyan-400" />
              <span>Ganti Cepat Warna Rambut:</span>
            </label>
            <div className="flex items-center gap-2">
              {hairColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateAppearance({ ...player.appearance, hairColor: c.hex });
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    player.appearance.hairColor === c.hex ? 'scale-110 border-white shadow-lg' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
