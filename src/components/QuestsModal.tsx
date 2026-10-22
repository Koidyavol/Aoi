import React from 'react';
import { Quest } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { X, Scroll, Award, CheckCircle } from 'lucide-react';

interface QuestsModalProps {
  quests: Quest[];
  onClaimQuest: (questId: string) => void;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({ quests, onClaimQuest, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-yellow-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-yellow-950 via-slate-900 to-yellow-950 border-b border-yellow-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scroll className="w-5 h-5 text-yellow-400" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-yellow-300">MISI HARIAN AOI</h2>
              <p className="text-[11px] text-slate-400 font-mono">Selesaikan misi untuk mendapatkan bonus Xu, Lượng & EXP!</p>
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

        {/* Quests List */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[70vh]">
          {quests.map((q) => {
            const isFinished = q.current >= q.target;
            const progressPct = Math.min(100, (q.current / q.target) * 100);

            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  q.claimed
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : isFinished
                    ? 'bg-yellow-950/30 border-yellow-500 shadow-md'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {q.claimed && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{q.title}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {q.current} / {q.target}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-mono mb-2.5">{q.description}</p>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Rewards & Claim CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-amber-300">
                    <span>Hadiah:</span>
                    <span>+{q.rewardXu} Xu</span>
                    <span>+{q.rewardDiamonds} 💎</span>
                    <span>+{q.rewardExp} EXP</span>
                  </div>

                  {q.claimed ? (
                    <span className="text-[10px] font-pixel text-slate-500">SUDAH KLAIM</span>
                  ) : isFinished ? (
                    <button
                      onClick={() => {
                        soundEngine.playCoin();
                        onClaimQuest(q.id);
                      }}
                      className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-pixel text-[9px] font-bold rounded-lg cursor-pointer transition-colors shadow"
                    >
                      KLAIM HADIAH!
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Belum Selesai</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
