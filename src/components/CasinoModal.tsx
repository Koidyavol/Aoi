import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { X, Dices, RotateCcw, Sparkles } from 'lucide-react';

interface CasinoModalProps {
  playerCoins: number;
  playerDiamonds: number;
  onBetResult: (payoutXu: number, diffXu: number) => void;
  onSpinWheelResult: (rewardText: string, xu: number, diamonds: number) => void;
  onClose: () => void;
}

export const CasinoModal: React.FC<CasinoModalProps> = ({
  playerCoins,
  playerDiamonds,
  onBetResult,
  onSpinWheelResult,
  onClose,
}) => {
  const [tab, setTab] = useState<'dadu' | 'roda'>('dadu');

  // DADU (SIC BO) STATE
  const [betType, setBetType] = useState<'besar' | 'kecil' | 'triple'>('besar');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResults, setDiceResults] = useState<[number, number, number]>([3, 4, 5]);
  const [lastDaduOutcome, setLastDaduOutcome] = useState<string | null>(null);

  // RODA STATE
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [wheelOutcome, setWheelOutcome] = useState<string | null>(null);

  const betAmounts = [50, 100, 250, 500, 1000];

  const rollDice = () => {
    if (isRolling || playerCoins < betAmount) return;

    soundEngine.playDiceRoll();
    setIsRolling(true);
    setLastDaduOutcome(null);

    // Roll animation interval
    let ticks = 0;
    const interval = setInterval(() => {
      setDiceResults([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      ticks++;
      if (ticks > 12) {
        clearInterval(interval);
        // Final outcomes
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        setDiceResults([d1, d2, d3]);

        const sum = d1 + d2 + d3;
        const isTriple = d1 === d2 && d2 === d3;
        const isBesar = !isTriple && sum >= 11 && sum <= 17;
        const isKecil = !isTriple && sum >= 4 && sum <= 10;

        let won = false;
        let payout = 0;

        if (betType === 'besar' && isBesar) {
          won = true;
          payout = betAmount * 2;
        } else if (betType === 'kecil' && isKecil) {
          won = true;
          payout = betAmount * 2;
        } else if (betType === 'triple' && isTriple) {
          won = true;
          payout = betAmount * 10; // 10x jackpot!
        }

        if (won) {
          soundEngine.playFishSuccess();
          const profit = payout - betAmount;
          setLastDaduOutcome(`MENANG! Dadu: ${d1}+${d2}+${d3}=${sum}. Mendapat +${payout} Xu!`);
          onBetResult(payout, profit);
        } else {
          soundEngine.playClick();
          setLastDaduOutcome(`KALAH! Dadu: ${d1}+${d2}+${d3}=${sum} (${isTriple ? 'KEMBAR 3' : sum >= 11 ? 'BESAR' : 'KECIL'}).`);
          onBetResult(0, -betAmount);
        }

        setIsRolling(false);
      }
    }, 80);
  };

  const spinWheel = () => {
    if (isSpinning || playerCoins < 100) return;

    soundEngine.playDiceRoll();
    setIsSpinning(true);
    setWheelOutcome(null);

    // Charge 100 Xu for a spin
    const targetSector = Math.floor(Math.random() * 6);
    const degreesPerSector = 60;
    const extraSpins = 5 * 360;
    const finalAngle = wheelAngle + extraSpins + (targetSector * degreesPerSector) + 30;

    setWheelAngle(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const sectors = [
        { label: '500 Xu!', xu: 500, dia: 0 },
        { label: '3 Diamond 💎', xu: 0, dia: 3 },
        { label: '250 Xu!', xu: 250, dia: 0 },
        { label: '1000 Xu JACKPOT! 💰', xu: 1000, dia: 0 },
        { label: '5 Diamond SULTAN! 💎', xu: 0, dia: 5 },
        { label: 'Zonk! Coba Lagi 😜', xu: 0, dia: 0 },
      ];
      const win = sectors[targetSector];
      soundEngine.playFishSuccess();
      setWheelOutcome(`Selamat! Kamu mendapatkan ${win.label}`);
      onSpinWheelResult(win.label, win.xu - 100, win.dia);
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-purple-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-purple-300">KASINO & PERMAINAN AOI</h2>
              <p className="text-[11px] text-slate-400 font-mono">Tebak dadu keberuntungan & putar roda hadiah</p>
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

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setTab('dadu')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              tab === 'dadu'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            🎲 Tebak Dadu (Sic Bo)
          </button>
          <button
            onClick={() => setTab('roda')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              tab === 'roda'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            🎡 Roda Keberuntungan
          </button>
        </div>

        {/* TAB 1: DADU (SIC BO) */}
        {tab === 'dadu' && (
          <div className="p-6 flex flex-col items-center">
            {/* Dice Visual Cup */}
            <div className="w-full max-w-sm bg-emerald-950/70 border-2 border-emerald-600 rounded-2xl p-5 mb-5 flex flex-col items-center shadow-inner">
              <span className="text-[10px] font-pixel text-emerald-400 uppercase tracking-widest mb-3">
                MANGKUK DADU AOI
              </span>

              {/* 3 Dice Blocks */}
              <div className="flex items-center gap-4 mb-3">
                {diceResults.map((val, idx) => (
                  <div
                    key={idx}
                    className={`w-14 h-14 bg-white rounded-xl shadow-xl flex items-center justify-center font-pixel text-2xl font-bold text-slate-900 border-2 border-slate-300 ${
                      isRolling ? 'animate-bounce' : ''
                    }`}
                  >
                    {val}
                  </div>
                ))}
              </div>

              {/* Total sum indicator */}
              <div className="text-xs font-mono text-emerald-300">
                Total Angka:{' '}
                <strong className="text-amber-400 text-sm">
                  {diceResults[0] + diceResults[1] + diceResults[2]}
                </strong>
              </div>
            </div>

            {/* Outcome message */}
            {lastDaduOutcome && (
              <div
                className={`w-full max-w-sm mb-4 p-2.5 rounded-lg text-xs font-mono text-center border ${
                  lastDaduOutcome.includes('MENANG')
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500 text-rose-300'
                }`}
              >
                {lastDaduOutcome}
              </div>
            )}

            {/* Bet Type Selection */}
            <div className="w-full max-w-sm mb-4">
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5 text-left">
                Pilih Taruhan:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBetType('kecil')}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                    betType === 'kecil'
                      ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div>KECIL</div>
                  <div className="text-[9px] font-normal opacity-80">4 - 10 (1:1)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBetType('besar')}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                    betType === 'besar'
                      ? 'bg-amber-600 border-amber-400 text-white shadow-lg'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div>BESAR</div>
                  <div className="text-[9px] font-normal opacity-80">11 - 17 (1:1)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBetType('triple')}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                    betType === 'triple'
                      ? 'bg-rose-600 border-rose-400 text-white shadow-lg'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div>KEMBAR 3</div>
                  <div className="text-[9px] font-normal opacity-80">3-3-3 (10:1)</div>
                </button>
              </div>
            </div>

            {/* Bet Amount Selection */}
            <div className="w-full max-w-sm mb-5">
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5 text-left">
                Jumlah Taruhan Xu:
              </label>
              <div className="flex gap-1.5">
                {betAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBetAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                      betAmount === amt
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Roll CTA */}
            <button
              onClick={rollDice}
              disabled={isRolling || playerCoins < betAmount}
              className={`w-full max-w-sm py-3.5 rounded-xl font-pixel text-xs font-bold transition-all cursor-pointer ${
                playerCoins < betAmount
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg active:scale-95'
              }`}
            >
              {isRolling ? 'MENGOCOK DADU...' : `KOCOK DADU (${betAmount} Xu)`}
            </button>
          </div>
        )}

        {/* TAB 2: RODA KEBERUNTUNGAN */}
        {tab === 'roda' && (
          <div className="p-6 flex flex-col items-center">
            {/* Spinning Wheel */}
            <div className="relative w-48 h-48 mb-5">
              {/* Top pointer arrow */}
              <div className="absolute -top-3 left-1/2 -ml-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-amber-400 z-10 drop-shadow" />

              <div
                className="w-full h-full rounded-full border-4 border-amber-500 shadow-2xl relative overflow-hidden transition-transform duration-[3000ms] ease-out"
                style={{
                  transform: `rotate(${wheelAngle}deg)`,
                  background: 'conic-gradient(#ef4444 0deg 60deg, #3b82f6 60deg 120deg, #10b981 120deg 180deg, #f59e0b 180deg 240deg, #8b5cf6 240deg 300deg, #ec4899 300deg 360deg)',
                }}
              >
                {/* Center Hub */}
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center font-pixel text-[8px] text-amber-300">
                  AOI
                </div>
              </div>
            </div>

            {/* Outcome message */}
            {wheelOutcome && (
              <div className="w-full max-w-sm mb-4 p-2.5 rounded-lg text-xs font-mono text-center bg-purple-950/80 border border-purple-500 text-purple-300">
                {wheelOutcome}
              </div>
            )}

            <p className="text-xs text-slate-400 font-mono mb-4 text-center">
              Biaya putar: 100 Xu per putaran. Menangkan ribuan Xu dan Diamond!
            </p>

            <button
              onClick={spinWheel}
              disabled={isSpinning || playerCoins < 100}
              className={`w-full max-w-sm py-3.5 rounded-xl font-pixel text-xs font-bold transition-all cursor-pointer ${
                playerCoins < 100
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg active:scale-95'
              }`}
            >
              {isSpinning ? 'MEMUTAR RODA...' : 'PUTAR RODA (100 Xu)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
