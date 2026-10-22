import React, { useState, useEffect, useRef } from 'react';
import { FishInfo } from '../types/game';
import { FISH_LIST } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { X, Sparkles, Anchor, AlertCircle } from 'lucide-react';

interface FishingModalProps {
  playerEnergy: number;
  onCatchFish: (fish: FishInfo, weight: number) => void;
  onDirectSellFish: (fish: FishInfo, weight: number, totalPrice: number) => void;
  onClose: () => void;
}

type FishingState = 'WAITING' | 'BITING' | 'REELING' | 'CAUGHT' | 'ESCAPED';

export const FishingModal: React.FC<FishingModalProps> = ({
  playerEnergy,
  onCatchFish,
  onDirectSellFish,
  onClose,
}) => {
  const [phase, setPhase] = useState<FishingState>('WAITING');
  const [biteCountdown, setBiteCountdown] = useState(3);
  const [tension, setTension] = useState(50); // 0-100
  const [reelProgress, setReelProgress] = useState(0); // 0-100
  const [caughtFish, setCaughtFish] = useState<{ fish: FishInfo; weight: number } | null>(null);

  const isReelingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  // 1. Waiting for bite
  useEffect(() => {
    if (phase !== 'WAITING') return;

    const timer = setTimeout(() => {
      soundEngine.playFishAlert();
      setPhase('BITING');
    }, 2500 + Math.random() * 2000);

    return () => clearTimeout(timer);
  }, [phase]);

  // 2. Biting countdown (Must react within 2 seconds)
  useEffect(() => {
    if (phase !== 'BITING') return;

    const timeout = setTimeout(() => {
      // If player didn't strike in time
      soundEngine.playWater();
      setPhase('ESCAPED');
    }, 2200);

    return () => clearTimeout(timeout);
  }, [phase]);

  // 3. Reeling Minigame Loop
  useEffect(() => {
    if (phase !== 'REELING') return;

    let localTension = 50;
    let localProgress = 10;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      // Tension physics: increases if holding reel button, decays towards 0 if released
      const pullForce = isReelingRef.current ? 95 : -80;
      // Add chaotic fish fight resistance
      const fishStruggle = (Math.sin(currentTime * 0.006) + Math.cos(currentTime * 0.009)) * 30;

      localTension += (pullForce + fishStruggle) * dt;
      localTension = Math.max(0, Math.min(100, localTension));

      // Sweet Spot is between 35 and 75
      const inSweetSpot = localTension >= 35 && localTension <= 75;

      if (inSweetSpot) {
        localProgress += 28 * dt; // Fill up progress
      } else {
        localProgress -= 15 * dt; // Lose progress
      }

      setTension(localTension);
      setReelProgress(Math.max(0, Math.min(100, localProgress)));

      if (localProgress >= 100) {
        // SUCCESS! Caught fish
        soundEngine.playFishSuccess();

        // Weighted fish pick
        const rand = Math.random();
        let selected: FishInfo;
        if (rand < 0.4) selected = FISH_LIST[0]; // Teri
        else if (rand < 0.7) selected = FISH_LIST[1]; // Lele
        else if (rand < 0.85) selected = FISH_LIST[2]; // Nila
        else if (rand < 0.94) selected = FISH_LIST[3]; // Mas Koki
        else if (rand < 0.98) selected = FISH_LIST[4]; // Gurame
        else selected = FISH_LIST[5]; // Arwana Super Red!

        const weight = Number(
          (selected.minWeight + Math.random() * (selected.maxWeight - selected.minWeight)).toFixed(1)
        );

        setCaughtFish({ fish: selected, weight });
        setPhase('CAUGHT');
        return;
      }

      if (localProgress <= 0) {
        // FISH ESCAPED
        soundEngine.playWater();
        setPhase('ESCAPED');
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase]);

  const handleStrike = () => {
    soundEngine.playWater();
    setPhase('REELING');
  };

  const handleHoldReel = (active: boolean) => {
    isReelingRef.current = active;
  };

  const handleRetry = () => {
    setCaughtFish(null);
    setReelProgress(0);
    setTension(50);
    setPhase('WAITING');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-sky-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border-b border-sky-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-sky-300">SPOT MEMANCING AOI</h2>
              <p className="text-[11px] text-slate-400 font-mono">Danau tenang dengan ikan langka berbobot jumbo</p>
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

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* PHASE 1: WAITING */}
          {phase === 'WAITING' && (
            <div className="flex flex-col items-center py-6">
              <div className="relative w-28 h-28 rounded-full bg-sky-950/80 border-2 border-sky-500/50 flex items-center justify-center mb-4">
                {/* Concentric ripples */}
                <div className="absolute w-24 h-24 rounded-full border border-sky-400/40 animate-ping" />
                <span className="text-4xl animate-bounce">🪱</span>
              </div>
              <h3 className="text-sm font-bold text-sky-200 mb-1">Umpan Telah Dilempar...</h3>
              <p className="text-xs text-slate-400 font-mono">
                Menunggu getaran di pelampung. Bersiaplah menekan tombol saat ada sambaran!
              </p>
            </div>
          )}

          {/* PHASE 2: BITING */}
          {phase === 'BITING' && (
            <div className="flex flex-col items-center py-6 animate-pulse">
              <div className="relative w-28 h-28 rounded-full bg-rose-950 border-4 border-rose-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(244,63,94,0.6)]">
                <span className="text-4xl">🐟</span>
              </div>
              <h3 className="font-pixel text-sm text-rose-400 mb-2">ADA SAMBARAN IKAN!</h3>
              <p className="text-xs text-slate-300 font-mono mb-4">CEPAT TARIK PANCING SEKARANG!</p>
              <button
                onClick={handleStrike}
                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-pixel text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-transform cursor-pointer"
              >
                TARIK SEKARANG! 🎣
              </button>
            </div>
          )}

          {/* PHASE 3: REELING MINIGAME */}
          {phase === 'REELING' && (
            <div className="w-full flex flex-col items-center py-3">
              <h3 className="font-pixel text-xs text-amber-400 mb-1">TARIK GULUNGAN (REEL)!</h3>
              <p className="text-[11px] text-slate-300 font-mono mb-4">
                Tahan tombol agar jarum tetap berada di area HIJAU (35-75%)!
              </p>

              {/* Progress bar (Catch percentage) */}
              <div className="w-full max-w-xs mb-4">
                <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                  <span>Progres Tangkapan:</span>
                  <span className="font-bold text-emerald-400">{Math.floor(reelProgress)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75"
                    style={{ width: `${reelProgress}%` }}
                  />
                </div>
              </div>

              {/* Tension Gauge */}
              <div className="w-full max-w-xs bg-slate-950 p-4 rounded-xl border border-slate-700 mb-5">
                <div className="text-[10px] font-mono text-slate-400 mb-2 flex justify-between">
                  <span>Kendor (0)</span>
                  <span className="text-emerald-400 font-bold">ZONA STABIL (35 - 75)</span>
                  <span>Putus (100)</span>
                </div>

                {/* Meter container */}
                <div className="relative w-full h-6 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                  {/* Sweet spot highlight */}
                  <div className="absolute left-[35%] w-[40%] h-full bg-emerald-500/40 border-x-2 border-emerald-400" />
                  {/* Indicator needle */}
                  <div
                    className="absolute top-0 bottom-0 w-3 bg-amber-400 border border-slate-950 shadow-md transition-all duration-75 -ml-1.5"
                    style={{ left: `${tension}%` }}
                  />
                </div>
              </div>

              {/* Reel Button: Hold or Click */}
              <button
                onMouseDown={() => handleHoldReel(true)}
                onMouseUp={() => handleHoldReel(false)}
                onTouchStart={() => handleHoldReel(true)}
                onTouchEnd={() => handleHoldReel(false)}
                className="w-full max-w-xs py-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-pixel text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                TAHAN UNTUK MENGGULUNG (REEL)
              </button>
            </div>
          )}

          {/* PHASE 4: CAUGHT */}
          {phase === 'CAUGHT' && caughtFish && (
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-full bg-amber-950/70 border-2 border-amber-500 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                <span className="text-4xl">🐟</span>
              </div>
              <span className="text-[10px] font-pixel text-amber-400 uppercase tracking-widest mb-1">
                BERHASIL DITANGKAP!
              </span>
              <h3 className="font-pixel text-sm sm:text-base text-white mb-1">
                {caughtFish.fish.name}
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mb-3">
                <span>Berat: <strong className="text-sky-300">{caughtFish.weight} kg</strong></span>
                <span>·</span>
                <span className="capitalize text-emerald-400">Rarity: {caughtFish.fish.rarity}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono max-w-xs mb-5">
                {caughtFish.fish.desc}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                  onClick={() => {
                    soundEngine.playCoin();
                    const totalSell = Math.floor(caughtFish.fish.pricePerKg * caughtFish.weight);
                    onDirectSellFish(caughtFish.fish, caughtFish.weight, totalSell);
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Jual Langsung ({Math.floor(caughtFish.fish.pricePerKg * caughtFish.weight)} Xu)
                </button>
                <button
                  onClick={() => {
                    soundEngine.playHarvest();
                    onCatchFish(caughtFish.fish, caughtFish.weight);
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-lg cursor-pointer transition-colors"
                >
                  Simpan di Tas
                </button>
              </div>

              <button
                onClick={handleRetry}
                className="mt-3 text-xs text-sky-400 hover:text-sky-300 underline font-mono cursor-pointer"
              >
                Pancing Ikan Lagi
              </button>
            </div>
          )}

          {/* PHASE 5: ESCAPED */}
          {phase === 'ESCAPED' && (
            <div className="flex flex-col items-center py-6">
              <AlertCircle className="w-14 h-14 text-rose-500 mb-2" />
              <h3 className="font-pixel text-xs text-rose-400 mb-1">IKAN MELEPASKAN DIRI!</h3>
              <p className="text-xs text-slate-400 font-mono mb-5 max-w-xs">
                Tarikan terlalu kuat atau kamu terlambat bereaksi. Jangan menyerah, lempar umpan lagi!
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Lempar Umpan Lagi 🎣
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
