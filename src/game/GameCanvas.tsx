import React, { useEffect, useRef } from 'react';
import { Character, FarmPlot, MapZone } from '../types/game';
import { drawWorld } from './renderers';
import { soundEngine } from '../audio/soundEngine';

interface GameCanvasProps {
  zone: MapZone;
  player: Character;
  npcs: Character[];
  farmPlots: FarmPlot[];
  onPlayerMove: (x: number, y: number, facing: 'down' | 'up' | 'left' | 'right', isMoving: boolean) => void;
  onInteract: (hotspot: string) => void;
  onZoneChange: (zone: MapZone) => void;
  joystickVector: { x: number; y: number } | null;
  actionTriggered: boolean;
  onClearActionTrigger: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  zone,
  player,
  npcs,
  farmPlots,
  onPlayerMove,
  onInteract,
  onZoneChange,
  joystickVector,
  actionTriggered,
  onClearActionTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable refs for simulation loop without React re-renders
  const stateRef = useRef({
    zone,
    player: { ...player },
    npcs: [...npcs],
    farmPlots: [...farmPlots],
    keysHeld: new Set<string>(),
    mouseTarget: null as { x: number; y: number } | null,
    activeHotspot: null as string | null,
    lastTime: performance.now(),
    stepTimer: 0,
    npcWanderTimer: 0,
    width: 800,
    height: 540,
  });

  // Keep stateRef up to date with prop updates
  useEffect(() => {
    stateRef.current.zone = zone;
    stateRef.current.farmPlots = farmPlots;
    stateRef.current.npcs = npcs;
  }, [zone, farmPlots, npcs]);

  // Sync external position changes (e.g. teleporting zones)
  useEffect(() => {
    stateRef.current.player.x = player.x;
    stateRef.current.player.y = player.y;
    stateRef.current.player.appearance = player.appearance;
    stateRef.current.player.chatBubble = player.chatBubble;
    stateRef.current.player.emoteBubble = player.emoteBubble;
    stateRef.current.player.isFishing = player.isFishing;
  }, [player]);

  // Trigger action from touch button
  useEffect(() => {
    if (actionTriggered) {
      if (stateRef.current.activeHotspot) {
        onInteract(stateRef.current.activeHotspot);
      }
      onClearActionTrigger();
    }
  }, [actionTriggered, onInteract, onClearActionTrigger]);

  // Window keyboard and blur events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      stateRef.current.keysHeld.add(e.code);

      if (e.code === 'Space') {
        e.preventDefault();
        soundEngine.playClick();
        if (stateRef.current.activeHotspot) {
          onInteract(stateRef.current.activeHotspot);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keysHeld.delete(e.code);
    };

    const handleBlur = () => {
      stateRef.current.keysHeld.clear();
      stateRef.current.mouseTarget = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onInteract]);

  // Main 60fps Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle canvas sizing
    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const w = Math.min(parent.clientWidth, 960);
        const h = Math.min(parent.clientHeight, 640);
        canvas.width = w;
        canvas.height = h;
        stateRef.current.width = w;
        stateRef.current.height = h;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - stateRef.current.lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling
      stateRef.current.lastTime = currentTime;

      const st = stateRef.current;
      const p = st.player;
      const keys = st.keysHeld;
      const w = st.width;
      const h = st.height;

      // 1. INPUT PROCESSING
      let moveX = 0;
      let moveY = 0;

      // Continuous keyboard
      if (keys.has('KeyW') || keys.has('ArrowUp')) moveY -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) moveY += 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) moveX -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) moveX += 1;

      // Virtual Joystick input
      if (joystickVector && (joystickVector.x !== 0 || joystickVector.y !== 0)) {
        moveX = joystickVector.x;
        moveY = joystickVector.y;
      }

      // Mouse tap-to-move
      if (st.mouseTarget) {
        const dx = st.mouseTarget.x - p.x;
        const dy = st.mouseTarget.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 8) {
          moveX = dx / dist;
          moveY = dy / dist;
        } else {
          st.mouseTarget = null;
        }
      }

      // Normalize diagonal speed
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      if (len > 1) {
        moveX /= len;
        moveY /= len;
      }

      const isMoving = len > 0.05 && !p.isFishing;
      const speed = 140; // pixels per sec

      if (isMoving) {
        p.x += moveX * speed * dt;
        p.y += moveY * speed * dt;

        // Facing direction
        if (Math.abs(moveX) > Math.abs(moveY)) {
          p.facing = moveX > 0 ? 'right' : 'left';
        } else {
          p.facing = moveY > 0 ? 'down' : 'up';
        }

        // Footstep sound
        st.stepTimer += dt;
        if (st.stepTimer > 0.3) {
          soundEngine.playStep();
          st.stepTimer = 0;
        }
      } else {
        st.stepTimer = 0.2;
      }

      p.isMoving = isMoving;

      // 2. BOUNDARY COLLISION
      p.x = Math.max(30, Math.min(w - 30, p.x));
      p.y = Math.max(60, Math.min(h - 30, p.y));

      // Zone-specific obstacles
      if (st.zone === 'taman') {
        // Fountain collision in center
        const fcx = w / 2;
        const fcy = 300;
        const fdx = p.x - fcx;
        const fdy = p.y - fcy;
        const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
        if (fdist < 56) {
          const overlap = 56 - fdist;
          p.x += (fdx / fdist) * overlap;
          p.y += (fdy / fdist) * overlap;
        }
      } else if (st.zone === 'mancing') {
        // Water collision: Can only walk on shoreline and the wooden pier!
        const onPier = p.x >= 140 && p.x <= 390 && p.y >= 210 && p.y <= 290;
        if (!onPier && p.x > 185) {
          p.x = 185;
        }
      }

      // 3. HOTSPOTS DETECTION
      let currentHotspot: string | null = null;

      if (st.zone === 'taman') {
        if (p.y < 85 && Math.abs(p.x - w / 2) < 50) currentHotspot = 'Kawasan Pertanian';
        else if (p.x > w - 85 && Math.abs(p.y - 300) < 50) currentHotspot = 'Danau Mancing';
        else if (p.x > w / 2 + 170 && p.y < 110) currentHotspot = 'Kasino Hiburan';
        else if (p.y > h - 70 && Math.abs(p.x - w / 2) < 50) currentHotspot = 'Rumah Pribadi';
        else if (p.x < 150 && p.y < 140) currentHotspot = 'Mall Busana';
        else if (p.x < 170 && p.y > 340) currentHotspot = 'Warung Somat';
        else {
          // Check near benches
          const nearBench =
            (Math.abs(p.x - (w / 2 - 116)) < 30 && Math.abs(p.y - 240) < 25) ||
            (Math.abs(p.x - (w / 2 + 114)) < 30 && Math.abs(p.y - 240) < 25);
          if (nearBench) currentHotspot = 'Duduk Santai';
        }
      } else if (st.zone === 'tani') {
        if (p.y > h - 65 && Math.abs(p.x - w / 2) < 80) currentHotspot = 'Kembali ke Taman';
        else if (p.x > 210 && p.x < 680 && p.y > 210 && p.y < 350) currentHotspot = 'Urus Kebun & Panen';
        else if (p.x < 190 && p.y < 200) currentHotspot = 'Kandang Ayam & Sapi';
        else if (p.x > w - 190 && p.y < 200) currentHotspot = 'Lumbung & Jual Hasil Tani';
      } else if (st.zone === 'mancing') {
        if (p.x < 80 && Math.abs(p.y - h / 2) < 60) currentHotspot = 'Kembali ke Taman';
        else if (p.x >= 200 && p.y >= 210 && p.y <= 290) currentHotspot = 'Mulai Mancing';
        else if (p.x < 120 && p.y < 130) currentHotspot = 'Toko Umpan Pak Kumis';
      } else if (st.zone === 'kasino') {
        if (p.y > h - 65 && Math.abs(p.x - w / 2) < 80) currentHotspot = 'Kembali ke Taman';
        else if (p.x < w / 2 && p.y >= 140 && p.y <= 300) currentHotspot = 'Meja Tebak Dadu';
        else if (p.x >= w / 2 && p.y >= 150 && p.y <= 310) currentHotspot = 'Roda Keberuntungan';
      } else if (st.zone === 'rumah') {
        if (p.y > h - 65 && Math.abs(p.x - w / 2) < 80) currentHotspot = 'Keluar Rumah';
        else if (p.x < 180 && p.y < 180) currentHotspot = 'Tidur di Kasur (+Stamina)';
        else if (p.x > w - 180 && p.y < 180) currentHotspot = 'Nonton TV Santai';
        else if (Math.abs(p.x - w / 2) < 60 && p.y < 110) currentHotspot = 'Lemari Baju';
      }

      // Check if near any NPC
      for (const npc of st.npcs) {
        const ndx = p.x - npc.x;
        const ndy = p.y - npc.y;
        if (Math.sqrt(ndx * ndx + ndy * ndy) < 36) {
          currentHotspot = `Bicara dengan ${npc.name}`;
          break;
        }
      }

      st.activeHotspot = currentHotspot;

      // 4. NPC IDLE SIMULATION
      st.npcWanderTimer += dt;
      if (st.npcWanderTimer > 2.5) {
        st.npcWanderTimer = 0;
        // Randomly nudge NPCs
        for (const npc of st.npcs) {
          if (Math.random() < 0.4) {
            npc.facing = (['down', 'up', 'left', 'right'] as const)[Math.floor(Math.random() * 4)];
            if (Math.random() < 0.5) {
              npc.x += (Math.random() - 0.5) * 30;
              npc.y += (Math.random() - 0.5) * 20;
              npc.x = Math.max(100, Math.min(w - 100, npc.x));
              npc.y = Math.max(100, Math.min(h - 100, npc.y));
            }
          }
        }
      }

      // 5. RENDER WORLD & CHARACTERS
      drawWorld({
        ctx,
        zone: st.zone,
        time: currentTime,
        player: p,
        npcs: st.npcs,
        farmPlots: st.farmPlots,
        viewportWidth: w,
        viewportHeight: h,
        activeHotspot: st.activeHotspot,
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [joystickVector]);

  // Click / Tap on canvas to move or trigger hotspot
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    stateRef.current.mouseTarget = { x: clickX, y: clickY };

    // If already close to hotspot, interact immediately!
    if (stateRef.current.activeHotspot) {
      soundEngine.playClick();
      onInteract(stateRef.current.activeHotspot);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="pixel-art rounded-lg shadow-2xl border-2 border-slate-800 cursor-crosshair max-w-full max-h-full aspect-[4/3]"
      />
    </div>
  );
};
