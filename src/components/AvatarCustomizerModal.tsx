import React, { useState, useEffect, useRef } from 'react';
import { Character, AvatarAppearance } from '../types/game';
import {
  SKIN_COLORS,
  FACE_SHAPES,
  EYE_STYLES,
  HAIR_STYLES,
  HAIR_COLORS,
  OUTFITS,
  HATS,
  FACE_ACCESSORIES,
  BACK_ACCESSORIES,
} from '../game/constants';
import { drawCharacter } from '../game/renderers';
import { soundEngine } from '../audio/soundEngine';
import {
  X,
  Sparkles,
  Dice5,
  RotateCcw,
  User,
  Scissors,
  Shirt,
  Crown,
  Glasses,
  Check,
  ChevronLeft,
  ChevronRight,
  Smile,
} from 'lucide-react';

interface AvatarCustomizerModalProps {
  currentAppearance: AvatarAppearance;
  playerName: string;
  onSaveAppearance: (appearance: AvatarAppearance) => void;
  onClose: () => void;
}

type TabType = 'face' | 'hair' | 'outfit' | 'hat' | 'face_acc' | 'back_acc';

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  currentAppearance,
  playerName,
  onSaveAppearance,
  onClose,
}) => {
  const [app, setApp] = useState<AvatarAppearance>({ ...currentAppearance });
  const [activeTab, setActiveTab] = useState<TabType>('face');
  const [facing, setFacing] = useState<'down' | 'left' | 'up' | 'right'>('down');
  const [testAction, setTestAction] = useState<'idle' | 'walk' | 'dance' | 'love'>('idle');
  const [backdrop, setBackdrop] = useState<'salon' | 'stage' | 'garden'>('salon');
  const [successToast, setSuccessToast] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Render Loop for Studio Viewport
  useEffect(() => {
    let animId: number;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Backdrop
      if (backdrop === 'salon') {
        // Luxury Velvet Salon Backdrop
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.65, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Mirror Frame in Background
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(30, 20, canvas.width - 60, canvas.height - 70);

        // Stage Floor
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, canvas.height - 48, canvas.width, 48);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(0, canvas.height - 48, canvas.width, 3);
      } else if (backdrop === 'stage') {
        // Spotlight Stage
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Spotlight Cone
        ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2 - 90, canvas.height);
        ctx.lineTo(canvas.width / 2 + 90, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Platform
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height - 35, 75, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Garden
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 4);

        // Sakura tree flowers
        for (let i = 0; i < 4; i++) {
          const fx = 20 + ((time * 0.02 + i * 40) % (canvas.width - 40));
          const fy = 20 + ((time * 0.03 + i * 30) % (canvas.height - 60));
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(fx, fy, 4, 4);
        }
      }

      // Studio Mock Character
      const isMoving = testAction === 'walk';
      const bounceOffset =
        testAction === 'dance' ? Math.sin(time * 0.02) * 6 : testAction === 'idle' ? Math.sin(time * 0.005) * 1.5 : 0;

      const mockChar: Character = {
        id: 'studio_preview',
        name: playerName || 'AvatarGaul',
        title: 'Model Busana',
        isPlayer: true,
        x: canvas.width / 2,
        y: canvas.height - 55 + bounceOffset,
        facing,
        isMoving,
        appearance: app,
        emoteBubble:
          testAction === 'love'
            ? { icon: '💖', timestamp: Date.now(), duration: 10000 }
            : testAction === 'dance'
            ? { icon: '💃', timestamp: Date.now(), duration: 10000 }
            : undefined,
      };

      // Draw avatar at 2.4x scale for crisp studio clarity
      drawCharacter(ctx, mockChar, time, 2.4);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [app, facing, testAction, backdrop, playerName]);

  // Rotate avatar Left/Right
  const handleRotate = (dir: 'left' | 'right') => {
    soundEngine.playClick();
    const order: ('down' | 'left' | 'up' | 'right')[] = ['down', 'left', 'up', 'right'];
    const currentIdx = order.indexOf(facing);
    if (dir === 'right') {
      setFacing(order[(currentIdx + 1) % 4]);
    } else {
      setFacing(order[(currentIdx + 3) % 4]);
    }
  };

  // Randomize Outfit / Aesthetic Generator
  const handleRandomize = () => {
    soundEngine.playCoin();
    const randSkin = SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)].id;
    const randFace = FACE_SHAPES[Math.floor(Math.random() * FACE_SHAPES.length)].id;
    const randEye = EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)].id;
    const randHair = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id;
    const randColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id;
    const randOutfit = OUTFITS[Math.floor(Math.random() * OUTFITS.length)].id;
    const randHat = HATS[Math.floor(Math.random() * HATS.length)].id;
    const randFaceAcc = FACE_ACCESSORIES[Math.floor(Math.random() * FACE_ACCESSORIES.length)].id;
    const randBack = BACK_ACCESSORIES[Math.floor(Math.random() * BACK_ACCESSORIES.length)].id;

    setApp({
      gender: Math.random() > 0.5 ? 'male' : 'female',
      skinColor: randSkin,
      faceShape: randFace,
      eyeStyle: randEye,
      blush: Math.random() > 0.5,
      hairStyle: randHair,
      hairColor: randColor,
      outfit: randOutfit,
      hat: randHat,
      faceAccessory: randFaceAcc,
      backAccessory: randBack,
    });
  };

  // Reset to original
  const handleReset = () => {
    soundEngine.playClick();
    setApp({ ...currentAppearance });
  };

  // Save changes
  const handleSave = () => {
    soundEngine.playFishSuccess();
    onSaveAppearance(app);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs select-none">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-3 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✂️</span>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-amber-300">
                SALON & BUTIK BUSANA AOI
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Kustomisasi gaya rambut, wajah, pakaian, dan sayap impianmu!
              </p>
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

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-600 text-white font-pixel text-xs py-2 text-center animate-pulse flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>TAMPILAN AVATAR BERHASIL DISIMPAN & DITERAPKAN!</span>
          </div>
        )}

        {/* Main Body: 2 Columns (Left: Studio Viewport, Right: Controls) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: 360° AVATAR STUDIO VIEWPORT */}
          <div className="w-full md:w-80 p-4 bg-slate-950/70 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-between">
            {/* Studio Canvas */}
            <div className="relative w-full aspect-square max-w-[240px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
              <canvas
                ref={previewCanvasRef}
                width={240}
                height={240}
                className="w-full h-full pixel-art block"
              />

              {/* Direction Indicator */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[9px] font-mono text-amber-400">
                Arah: {facing.toUpperCase()}
              </div>

              {/* Backdrop Toggle */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setBackdrop('salon')}
                  className={`w-5 h-5 rounded text-[10px] flex items-center justify-center border cursor-pointer ${
                    backdrop === 'salon' ? 'bg-amber-500 border-white' : 'bg-slate-900 border-slate-700'
                  }`}
                  title="Salon Mewah"
                >
                  🪞
                </button>
                <button
                  onClick={() => setBackdrop('stage')}
                  className={`w-5 h-5 rounded text-[10px] flex items-center justify-center border cursor-pointer ${
                    backdrop === 'stage' ? 'bg-amber-500 border-white' : 'bg-slate-900 border-slate-700'
                  }`}
                  title="Panggung Lampu Sorot"
                >
                  🌟
                </button>
                <button
                  onClick={() => setBackdrop('garden')}
                  className={`w-5 h-5 rounded text-[10px] flex items-center justify-center border cursor-pointer ${
                    backdrop === 'garden' ? 'bg-amber-500 border-white' : 'bg-slate-900 border-slate-700'
                  }`}
                  title="Taman Bunga"
                >
                  🌸
                </button>
              </div>
            </div>

            {/* 360° Rotation Controls */}
            <div className="w-full flex items-center justify-center gap-2 mt-3">
              <button
                onClick={() => handleRotate('left')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer"
                title="Putar Kiri"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Putar Kiri</span>
              </button>
              <button
                onClick={() => handleRotate('right')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer"
                title="Putar Kanan"
              >
                <span>Putar Kanan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pose / Action Tester Buttons */}
            <div className="w-full flex items-center justify-center gap-1.5 mt-2.5">
              <button
                onClick={() => setTestAction('idle')}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                  testAction === 'idle'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Diam
              </button>
              <button
                onClick={() => setTestAction('walk')}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                  testAction === 'walk'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Jalan
              </button>
              <button
                onClick={() => setTestAction('dance')}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                  testAction === 'dance'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Joget 💃
              </button>
              <button
                onClick={() => setTestAction('love')}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                  testAction === 'love'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Cinta ❤️
              </button>
            </div>

            {/* Quick Actions (Randomize / Reset) */}
            <div className="w-full flex gap-2 mt-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleRandomize}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold shadow cursor-pointer transition-transform active:scale-95"
              >
                <Dice5 className="w-4 h-4" />
                <span>Acak Gaya</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 cursor-pointer"
                title="Kembalikan Gaya Awal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: CUSTOMIZATION PANELS (CATEGORY TABS & SELECTORS) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
            {/* Category Navigation Bar */}
            <div className="flex border-b border-slate-800 bg-slate-950/80 p-1.5 gap-1 overflow-x-auto text-xs font-mono">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('face');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'face'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Wajah & Kulit</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('hair');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'hair'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Rambut & Warna</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('outfit');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'outfit'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Pakaian</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('hat');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'hat'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Topi & Kepala</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('face_acc');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'face_acc'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Glasses className="w-3.5 h-3.5" />
                <span>Aksesoris Wajah</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('back_acc');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'back_acc'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sayap & Punggung</span>
              </button>
            </div>

            {/* TAB CONTENTS (Scrollable area) */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              {/* 1. WAJAH & KULIT */}
              {activeTab === 'face' && (
                <div className="space-y-4">
                  {/* Skin Color Palette */}
                  <div>
                    <label className="text-xs font-pixel text-amber-400 block mb-2">
                      WARNA KULIT AVATAR:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SKIN_COLORS.map((sk) => (
                        <button
                          key={sk.id}
                          onClick={() => {
                            soundEngine.playClick();
                            setApp({ ...app, skinColor: sk.id });
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            app.skinColor === sk.id
                              ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-full border border-slate-700 shadow-inner shrink-0"
                            style={{ backgroundColor: sk.id }}
                          />
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">
                              {sk.label}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono leading-tight">
                              {sk.desc}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Face Shape */}
                  <div>
                    <label className="text-xs font-pixel text-amber-400 block mb-2">
                      BENTUK RAHANG & WAJAH:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {FACE_SHAPES.map((fs) => (
                        <button
                          key={fs.id}
                          onClick={() => {
                            soundEngine.playClick();
                            setApp({ ...app, faceShape: fs.id });
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            app.faceShape === fs.id
                              ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-white">{fs.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {fs.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Eyes Expression */}
                  <div>
                    <label className="text-xs font-pixel text-amber-400 block mb-2">
                      EKSPRESI & BENTUK MATA:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {EYE_STYLES.map((ey) => (
                        <button
                          key={ey.id}
                          onClick={() => {
                            soundEngine.playClick();
                            setApp({ ...app, eyeStyle: ey.id });
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            app.eyeStyle === ey.id
                              ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-white">{ey.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {ey.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blush & Gender Switchers */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setApp({ ...app, blush: !app.blush });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        app.blush
                          ? 'bg-pink-950/50 border-pink-400 text-pink-300'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">Perona Pipi (Blush)</div>
                        <div className="text-[10px] font-mono">Efek pipi merona menggemaskan</div>
                      </div>
                      <span className="text-lg">🌸</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setApp({ ...app, gender: app.gender === 'male' ? 'female' : 'male' });
                      }}
                      className="p-3 rounded-xl border bg-slate-950/80 border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">Gender Avatar</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {app.gender === 'male' ? 'Cowok' : 'Cewek'}
                        </div>
                      </div>
                      <span className="text-lg">{app.gender === 'male' ? '👦' : '👧'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. RAMBUT & WARNA */}
              {activeTab === 'hair' && (
                <div className="space-y-4">
                  {/* Hair Style selection */}
                  <div>
                    <label className="text-xs font-pixel text-amber-400 block mb-2">
                      PILIH GAYA RAMBUT (10 MODEL):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HAIR_STYLES.map((hs) => (
                        <button
                          key={hs.id}
                          onClick={() => {
                            soundEngine.playClick();
                            setApp({ ...app, hairStyle: hs.id });
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            app.hairStyle === hs.id
                              ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-white">{hs.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {hs.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color Palette */}
                  <div>
                    <label className="text-xs font-pixel text-amber-400 block mb-2">
                      CAT WARNA RAMBUT (9 WARNA):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {HAIR_COLORS.map((hc) => (
                        <button
                          key={hc.id}
                          onClick={() => {
                            soundEngine.playClick();
                            setApp({ ...app, hairColor: hc.id });
                          }}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            app.hairColor === hc.id
                              ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full border border-slate-700 shrink-0 shadow-inner"
                            style={{ backgroundColor: hc.id }}
                          />
                          <span className="text-xs font-bold text-slate-200">{hc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PAKAIAN */}
              {activeTab === 'outfit' && (
                <div>
                  <label className="text-xs font-pixel text-amber-400 block mb-2">
                    KOLEKSI BUSANA & OUTFIT (10 KOLEKSI):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {OUTFITS.map((ot) => (
                      <button
                        key={ot.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setApp({ ...app, outfit: ot.id });
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          app.outfit === ot.id
                            ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-800">
                          {ot.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{ot.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight">
                            {ot.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. TOPI & KEPALA */}
              {activeTab === 'hat' && (
                <div>
                  <label className="text-xs font-pixel text-amber-400 block mb-2">
                    AKSESORIS KEPALA & TOPI:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {HATS.map((ht) => (
                      <button
                        key={ht.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setApp({ ...app, hat: ht.id });
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          app.hat === ht.id
                            ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-800">
                          {ht.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{ht.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight">
                            {ht.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. AKSESORIS WAJAH */}
              {activeTab === 'face_acc' && (
                <div>
                  <label className="text-xs font-pixel text-amber-400 block mb-2">
                    AKSESORIS WAJAH & KACAMATA:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FACE_ACCESSORIES.map((fa) => (
                      <button
                        key={fa.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setApp({ ...app, faceAccessory: fa.id });
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          app.faceAccessory === fa.id
                            ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-800">
                          {fa.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{fa.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight">
                            {fa.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. SAYAP & PUNGGUNG */}
              {activeTab === 'back_acc' && (
                <div>
                  <label className="text-xs font-pixel text-amber-400 block mb-2">
                    SAYAP STATUS SULTAN & AKSESORIS PUNGGUNG:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {BACK_ACCESSORIES.map((ba) => (
                      <button
                        key={ba.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setApp({ ...app, backAccessory: ba.id });
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          app.backAccessory === ba.id
                            ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-800">
                          {ba.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{ba.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight">
                            {ba.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save & Apply Bottom Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="text-xs font-mono text-slate-400 hidden sm:block">
                Kustomisasi gratis kapan saja di Salon & Lemari Rumah!
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>

                <button
                  onClick={handleSave}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-pixel text-xs font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-transform cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>SIMPAN & PAKAI SEKARANG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
