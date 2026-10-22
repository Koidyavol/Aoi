import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { X, Play, Volume2, VolumeX, RotateCcw, Keyboard, HelpCircle } from 'lucide-react';

interface PauseModalProps {
  isMuted: boolean;
  onToggleSound: () => void;
  onResume: () => void;
  onResetGame: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isMuted,
  onToggleSound,
  onResume,
  onResetGame,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-pixel text-xs sm:text-sm text-amber-400">GAME DIJEDA (PAUSED)</h2>
            <p className="text-[11px] text-slate-400 font-mono">Avatar Online Indonesia - Teamobi Retro Remake</p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onResume();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Audio setting */}
          <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2.5">
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              <div>
                <h4 className="text-xs font-bold text-white">Audio & Musik 8-Bit</h4>
                <p className="text-[10px] text-slate-400 font-mono">BGM dan efek suara chiptune retro</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleSound();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                isMuted ? 'bg-slate-800 text-slate-300' : 'bg-emerald-600 text-white'
              }`}
            >
              {isMuted ? 'MUTE' : 'AKTIF'}
            </button>
          </div>

          {/* Controls Quick Guide */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
              <Keyboard className="w-4 h-4" />
              <span>Panduan Kontrol:</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Bergerak:</span>
              <strong className="text-amber-400">WASD / Tombol Panah / Klik Titik</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Aksi / Interaksi:</span>
              <strong className="text-amber-400">Spasi / Tombol Aksi HP</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Kirim Chat:</span>
              <strong className="text-amber-400">Enter / Tombol Kirim</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Menu / Jeda:</span>
              <strong className="text-amber-400">Esc</strong>
            </div>
          </div>

          {/* AOI Pro Tips */}
          <div className="p-3.5 bg-sky-950/30 border border-sky-800/60 rounded-xl text-[11px] font-mono text-sky-200/90 leading-relaxed">
            💡 <strong>Tips Cuan AOI:</strong> Tanam bibit padi untuk modal awal yang cepat (12 detik).
            Beli Es Teh di Warung Somat saat stamina menipis. Jika punya modal besar, jajal tebak dadu atau pancing arwana merah di danau!
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onResume();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-pixel text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>LANJUTKAN PERMAINAN</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Yakin ingin mereset progres karakter dan koin?')) {
                  soundEngine.playClick();
                  onResetGame();
                }
              }}
              className="w-full py-2 bg-slate-950 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 font-mono text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mulai Ulang Karakter Baru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
