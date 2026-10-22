import React from 'react';
import { MapZone } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { X, Map, MapPin } from 'lucide-react';

interface MapModalProps {
  currentZone: MapZone;
  onSelectZone: (zone: MapZone) => void;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({ currentZone, onSelectZone, onClose }) => {
  const zones: { id: MapZone; name: string; desc: string; icon: string; color: string }[] = [
    {
      id: 'taman',
      name: 'Taman Kota AOI',
      desc: 'Pusat tongkrongan, air mancur, pohon cinta, dan warung makan.',
      icon: '🌳',
      color: 'border-emerald-500',
    },
    {
      id: 'tani',
      name: 'Kawasan Pertanian',
      desc: '12 petak sawah komoditas padi, sayur buah, serta peternakan ayam & sapi.',
      icon: '🌾',
      color: 'border-amber-500',
    },
    {
      id: 'mancing',
      name: 'Danau Pemancingan',
      desc: 'Dermaga kayu dengan kolam lele babon, nila merah, dan arwana langka.',
      icon: '🎣',
      color: 'border-sky-500',
    },
    {
      id: 'kasino',
      name: 'Kasino & Game Zone',
      desc: 'Gedung hiburan karpet merah, permainan tebak dadu dan roda hoki.',
      icon: '🎲',
      color: 'border-purple-500',
    },
    {
      id: 'rumah',
      name: 'Rumah Pribadi',
      desc: 'Kosan santai dengan kasur nyaman untuk pulihkan stamina penuh.',
      icon: '🏠',
      color: 'border-rose-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-sky-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border-b border-sky-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-sky-300">PETA KOTA & TELEPORT AOI</h2>
              <p className="text-[11px] text-slate-400 font-mono">Pilih area tujuan untuk berpindah seketika</p>
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

        {/* Zones Grid */}
        <div className="p-4 space-y-2.5 overflow-y-auto max-h-[70vh]">
          {zones.map((z) => {
            const isCurrent = currentZone === z.id;

            return (
              <div
                key={z.id}
                onClick={() => {
                  if (isCurrent) return;
                  soundEngine.playCoin();
                  onSelectZone(z.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-sky-950/50 border-sky-400 shadow-md ring-1 ring-sky-400'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                    {z.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{z.name}</h4>
                      {isCurrent && (
                        <span className="text-[9px] font-pixel text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-600">
                          LOKASI SEKARANG
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 max-w-xs">{z.desc}</p>
                  </div>
                </div>

                {!isCurrent && (
                  <button className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs rounded-lg transition-colors flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Pergi</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
