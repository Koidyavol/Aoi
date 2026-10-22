import { Character, FarmPlot, MapZone, AvatarAppearance } from '../types/game';
import { CROPS } from './constants';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  zone: MapZone;
  time: number;
  player: Character;
  npcs: Character[];
  farmPlots: FarmPlot[];
  viewportWidth: number;
  viewportHeight: number;
  activeHotspot: string | null;
}

export function drawWorld(rc: RenderContext) {
  const { ctx, zone, time, viewportWidth, viewportHeight } = rc;

  // Clear background
  ctx.save();

  switch (zone) {
    case 'taman':
      drawTamanKota(ctx, time, viewportWidth, viewportHeight);
      break;
    case 'tani':
      drawKawasanTani(ctx, time, rc.farmPlots, viewportWidth, viewportHeight);
      break;
    case 'mancing':
      drawDanauMancing(ctx, time, viewportWidth, viewportHeight);
      break;
    case 'kasino':
      drawKasino(ctx, time, viewportWidth, viewportHeight);
      break;
    case 'rumah':
      drawRumah(ctx, time, viewportWidth, viewportHeight);
      break;
  }

  // Draw hotspots indicator highlights
  drawHotspots(rc);

  // Draw all characters (sorted by Y coordinate for correct depth layering)
  const allCharacters = [rc.player, ...rc.npcs].sort((a, b) => a.y - b.y);
  for (const char of allCharacters) {
    drawCharacter(ctx, char, time);
  }

  ctx.restore();
}

/**
 * TAMAN KOTA (City Park)
 */
function drawTamanKota(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
  // Vibrant grass field
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(0, 0, w, h);

  // Subtle checkered grass pattern for retro pixel feel
  ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
  const tileSize = 32;
  for (let x = 0; x < w; x += tileSize) {
    for (let y = 0; y < h; y += tileSize) {
      if ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) {
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
  }

  // Cobblestone Main Pathways (Cross shape with center plaza)
  ctx.fillStyle = '#cbd5e1';
  // Horizontal path
  ctx.fillRect(40, 260, w - 80, 80);
  // Vertical path
  ctx.fillRect(w / 2 - 40, 60, 80, h - 120);

  // Path borders
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(40, 258, w - 80, 2);
  ctx.fillRect(40, 340, w - 80, 2);
  ctx.fillRect(w / 2 - 42, 60, 2, h - 120);
  ctx.fillRect(w / 2 + 40, 60, 2, h - 120);

  // Central Fountain Plaza (Circular stone)
  const cx = w / 2;
  const cy = 300;
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(cx, cy, 64, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Fountain Outer Basin (Water)
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.fill();

  // Animated Water ripples
  const rippleR = 10 + ((time * 0.03) % 36);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
  ctx.stroke();

  // Fountain Center Pillar & Cherub Spout
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(cx - 10, cy - 25, 20, 25);
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(cx, cy - 28, 12, 0, Math.PI * 2);
  ctx.fill();

  // Water jets
  const sprayOffset = Math.sin(time * 0.008) * 4;
  ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
    const sx = cx + Math.cos(angle + time * 0.002) * (20 + sprayOffset);
    const sy = cy + Math.sin(angle + time * 0.002) * (20 + sprayOffset);
    ctx.fillRect(sx - 2, sy - 2, 4, 4);
  }

  // Wooden Park Benches
  drawBench(ctx, cx - 140, 230);
  drawBench(ctx, cx + 90, 230);
  drawBench(ctx, cx - 140, 360);
  drawBench(ctx, cx + 90, 360);

  // Romantic Love Tree (Bunga Sakura / Mawar) on the top right
  drawRomanticTree(ctx, w - 160, 140, time);

  // Street Lamps
  drawStreetLamp(ctx, cx - 180, 220);
  drawStreetLamp(ctx, cx + 180, 220);
  drawStreetLamp(ctx, cx - 180, 380);
  drawStreetLamp(ctx, cx + 180, 380);

  // Warung Pak Somat (Bottom Left)
  drawWarung(ctx, 70, 360);

  // Portals / Gateways with Signs
  drawPortalSign(ctx, cx, 65, 'KAWASAN PERTANIAN 🌾', '#eab308');
  drawPortalSign(ctx, w - 60, 300, 'DANAU MANCING 🎣', '#3b82f6');
  drawPortalSign(ctx, cx + 220, 80, 'KASINO HIBURAN 🎲', '#a855f7');
  drawPortalSign(ctx, cx, h - 50, 'RUMAH PRIBADI 🏠', '#10b981');
  drawPortalSign(ctx, 100, 110, 'MALL BUSANA AOI 👗', '#ec4899');
}

/**
 * KAWASAN PERTANIAN (FARM)
 */
function drawKawasanTani(
  ctx: CanvasRenderingContext2D,
  time: number,
  plots: FarmPlot[],
  w: number,
  h: number
) {
  // Rich grassy background
  ctx.fillStyle = '#65a30d';
  ctx.fillRect(0, 0, w, h);

  // Farm dirt perimeter
  ctx.fillStyle = '#78350f';
  ctx.fillRect(80, 100, w - 160, 340);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(84, 104, w - 168, 332);

  // Wooden fence along top and bottom
  drawFence(ctx, 60, 90, w - 120);
  drawFence(ctx, 60, 440, w - 120);

  // Red Barn Silo on the right
  drawBarn(ctx, w - 180, 130);

  // Chicken Coop & Cow Pasture on the left
  drawAnimalPen(ctx, 100, 120, time);

  // Draw 12 Farm Plots (2 rows of 6)
  const plotW = 60;
  const plotH = 50;
  const startX = 220;
  const startY = 220;
  const gapX = 14;
  const gapY = 16;

  plots.forEach((plot, idx) => {
    const col = idx % 6;
    const row = Math.floor(idx / 6);
    const px = startX + col * (plotW + gapX);
    const py = startY + row * (plotH + gapY);

    // Soil
    ctx.fillStyle = plot.watered ? '#451a03' : '#78350f';
    ctx.fillRect(px, py, plotW, plotH);
    ctx.strokeStyle = plot.watered ? '#78350f' : '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, plotW, plotH);

    // Furrows
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(px + 4, py + 12, plotW - 8, 3);
    ctx.fillRect(px + 4, py + 26, plotW - 8, 3);
    ctx.fillRect(px + 4, py + 38, plotW - 8, 3);

    // Plot Number
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '8px monospace';
    ctx.fillText(`${idx + 1}`, px + 4, py + 10);

    // Crop rendering
    if (plot.cropId) {
      const crop = CROPS[plot.cropId];
      if (crop && plot.plantedAt) {
        const elapsedSec = (Date.now() - plot.plantedAt) / 1000;
        const progress = Math.min(1, elapsedSec / crop.growTimeSeconds);
        drawCropPlant(ctx, px + plotW / 2, py + plotH / 2 + 8, crop, progress, time);

        // Progress bar if still growing
        if (progress < 1) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(px + 6, py + plotH - 8, plotW - 12, 4);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(px + 6, py + plotH - 8, (plotW - 12) * progress, 4);
        } else {
          // Ready to harvest icon & bounce
          const bounce = Math.sin(time * 0.01 + idx) * 3;
          ctx.fillStyle = '#facc15';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✨', px + plotW / 2, py + 14 + bounce);
          ctx.textAlign = 'left';
        }
      }
    } else {
      // Empty plot indicator
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+Tanam', px + plotW / 2, py + plotH / 2 + 4);
      ctx.textAlign = 'left';
    }

    // Water droplet icon if watered
    if (plot.watered) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px sans-serif';
      ctx.fillText('💧', px + plotW - 14, py + 12);
    }
  });

  // Well for water (Bottom Center)
  drawWaterWell(ctx, startX + 180, startY + 130);

  // Portal sign back to City Park
  drawPortalSign(ctx, w / 2, h - 40, 'KEMBALI KE TAMAN KOTA 🏙️', '#22c55e');
}

/**
 * DANAU MANCING (FISHING LAKE)
 */
function drawDanauMancing(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
  // Grassy shoreline
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, 0, 180, h);

  // Sandy beach edge
  ctx.fillStyle = '#fde047';
  ctx.fillRect(170, 0, 25, h);

  // Deep Blue Sparkling Water
  const waterGrad = ctx.createLinearGradient(190, 0, w, 0);
  waterGrad.addColorStop(0, '#0284c7');
  waterGrad.addColorStop(0.5, '#0369a1');
  waterGrad.addColorStop(1, '#075985');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(195, 0, w - 195, h);

  // Animated Water Wave Highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  for (let y = 30; y < h - 30; y += 45) {
    const waveOffset = Math.sin(time * 0.003 + y) * 20;
    ctx.fillRect(230 + waveOffset, y, 70, 3);
    ctx.fillRect(360 + waveOffset * 0.7, y + 18, 90, 2);
    ctx.fillRect(520 + waveOffset * 1.2, y + 8, 110, 3);
  }

  // Swimming fish silhouettes in water
  for (let i = 0; i < 4; i++) {
    const fishX = 260 + ((time * (0.04 + i * 0.01) + i * 140) % (w - 300));
    const fishY = 80 + i * 90 + Math.sin(time * 0.005 + i) * 15;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(fishX, fishY, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(fishX - 10, fishY);
    ctx.lineTo(fishX - 18, fishY - 5);
    ctx.lineTo(fishX - 18, fishY + 5);
    ctx.fill();
  }

  // Lily Pads with Flowers
  drawLilyPad(ctx, 280, 160, true);
  drawLilyPad(ctx, 380, 320, false);
  drawLilyPad(ctx, 480, 110, true);
  drawLilyPad(ctx, 420, 460, false);

  // Wooden Fishing Pier / Dock
  ctx.fillStyle = '#78350f';
  // Main pier walkway stretching into lake
  ctx.fillRect(150, 220, 240, 60);
  ctx.fillStyle = '#92400e';
  // Wooden planks
  for (let px = 150; px < 390; px += 16) {
    ctx.fillRect(px, 220, 14, 60);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px + 14, 220, 2, 60);
    ctx.fillStyle = '#92400e';
  }

  // Pier support posts in water
  ctx.fillStyle = '#451a03';
  ctx.fillRect(220, 280, 12, 25);
  ctx.fillRect(300, 280, 12, 25);
  ctx.fillRect(380, 280, 12, 25);

  // Fisherman NPC Hut & Bait Shop (Top Left)
  drawFishShack(ctx, 40, 70);

  // Fishing area hotspot indicator
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('⚓ SPOT MANCING (TEKAN SPASI)', 210, 210);

  // Portal sign back to City Park
  drawPortalSign(ctx, 50, h / 2, 'KEMBALI KE TAMAN 🏙️', '#22c55e');
}

/**
 * KASINO & GAME HALL
 */
function drawKasino(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
  // Royal Luxury Red Carpet
  ctx.fillStyle = '#881337';
  ctx.fillRect(0, 0, w, h);

  // Gold Diamond Carpet Pattern
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  const sz = 40;
  for (let x = 0; x < w; x += sz) {
    for (let y = 0; y < h; y += sz) {
      ctx.strokeRect(x + 5, y + 5, sz - 10, sz - 10);
    }
  }

  // Velvet Back Walls
  ctx.fillStyle = '#4c0519';
  ctx.fillRect(0, 0, w, 80);

  // Neon Marquee "KASINO AOI INDONESIA"
  const neonGlow = Math.sin(time * 0.008) > 0 ? '#fbbf24' : '#f59e0b';
  ctx.fillStyle = neonGlow;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('★ KASINO & GAME ZONE AOI ★', w / 2, 45);
  ctx.font = '10px monospace';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('TEBAK DADU · RODA KEBERUNTUNGAN · JACKPOT XU', w / 2, 65);
  ctx.textAlign = 'left';

  // Game Table 1: TEBAK DADU (Sic Bo) - Green Felt Table
  const tableX = w / 2 - 200;
  const tableY = 160;
  ctx.fillStyle = '#065f46';
  ctx.fillRect(tableX, tableY, 180, 120);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;
  ctx.strokeRect(tableX, tableY, 180, 120);

  // Table graphics
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('🎲 TEBAK DADU AOI', tableX + 15, tableY + 28);
  ctx.fillStyle = '#facc15';
  ctx.font = '10px monospace';
  ctx.fillText('BESAR (11-17) | KECIL (4-10)', tableX + 10, tableY + 55);
  ctx.fillText('KEMBAR 3 (Bayar 10x!)', tableX + 15, tableY + 80);

  // Wooden Dice Cup in center
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(tableX + 90, tableY + 100, 14, 0, Math.PI * 2);
  ctx.fill();

  // Game Table 2: RODA KEBERUNTUNGAN (Lucky Wheel)
  const wheelX = w / 2 + 110;
  const wheelY = 220;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(wheelX, wheelY, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Spinning Wheel wedges
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  for (let i = 0; i < 6; i++) {
    const angle1 = (i * Math.PI) / 3 + time * 0.001;
    const angle2 = ((i + 1) * Math.PI) / 3 + time * 0.001;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(wheelX, wheelY);
    ctx.arc(wheelX, wheelY, 52, angle1, angle2);
    ctx.closePath();
    ctx.fill();
  }

  // Wheel center hub
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(wheelX, wheelY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SPIN', wheelX, wheelY + 3);
  ctx.textAlign = 'left';

  // Hotspot labels
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('▶ TEKAN SPASI: MAIN DADU', tableX + 8, tableY + 145);
  ctx.fillText('▶ TEKAN SPASI: PUTAR RODA', wheelX - 70, wheelY + 75);

  // Portal back to City Park
  drawPortalSign(ctx, w / 2, h - 45, 'KEMBALI KE TAMAN KOTA 🏙️', '#22c55e');
}

/**
 * RUMAH PRIBADI / KOSAN (PLAYER ROOM)
 */
function drawRumah(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
  // Cozy Wooden Floor
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, w, h);

  // Planks
  ctx.fillStyle = '#92400e';
  for (let y = 0; y < h; y += 24) {
    ctx.fillRect(0, y, w, 2);
  }

  // Wallpaper Upper Wall
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(0, 0, w, 90);
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(0, 88, w, 4);

  // Big Comfy Bed (Top Left)
  const bedX = 80;
  const bedY = 60;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(bedX, bedY, 90, 110);
  // Mattress & Sheet
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(bedX + 4, bedY + 25, 82, 80);
  // Pillows
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bedX + 10, bedY + 10, 30, 20);
  ctx.fillRect(bedX + 50, bedY + 10, 30, 20);
  // Bed tag
  ctx.fillStyle = '#f8fafc';
  ctx.font = '9px monospace';
  ctx.fillText('KASUR TIDUR', bedX + 12, bedY + 60);
  ctx.font = '8px monospace';
  ctx.fillText('(Pulihkan Stamina)', bedX + 6, bedY + 75);

  // Vintage CRT TV & Console
  const tvX = w - 170;
  const tvY = 60;
  ctx.fillStyle = '#334155';
  ctx.fillRect(tvX, tvY, 70, 50);
  // Screen
  const tvFlicker = Math.sin(time * 0.05) > 0 ? '#38bdf8' : '#0284c7';
  ctx.fillStyle = tvFlicker;
  ctx.fillRect(tvX + 6, tvY + 6, 58, 38);

  // Sofa Lounge
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(tvX - 30, tvY + 90, 130, 45);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(tvX - 25, tvY + 95, 120, 35);

  // Cozy Carpet in center
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.ellipse(w / 2, 280, 100, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fb7185';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Wardrobe / Lemari Pakaian
  ctx.fillStyle = '#78350f';
  ctx.fillRect(w / 2 - 40, 35, 80, 55);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(w / 2 - 2, 35, 4, 55);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(w / 2 - 12, 60, 4, 8);
  ctx.fillRect(w / 2 + 8, 60, 4, 8);

  // Door sign back to City Park
  drawPortalSign(ctx, w / 2, h - 45, 'KELUAR KE TAMAN KOTA 🏙️', '#22c55e');
}

/**
 * HOTSPOTS INDICATOR HIGHLIGHTS
 */
function drawHotspots(rc: RenderContext) {
  const { ctx, activeHotspot } = rc;
  if (!activeHotspot) return;

  // Floating interaction hint near player
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  const text = `[SPASI] ${activeHotspot.toUpperCase()}`;
  ctx.font = 'bold 11px monospace';
  const width = ctx.measureText(text).width + 16;
  const hx = rc.player.x - width / 2;
  const hy = rc.player.y - 50;

  ctx.fillRect(hx, hy, width, 22);
  ctx.strokeRect(hx, hy, width, 22);

  ctx.fillStyle = '#facc15';
  ctx.fillText(text, hx + 8, hy + 15);
  ctx.restore();
}

/**
 * CHARACTER SPRITE RENDERER (Chibi Retro AOI Style)
 */
export function drawCharacter(ctx: CanvasRenderingContext2D, char: Character, time: number, customScale = 1) {
  const { x, y, facing, isMoving, appearance } = char;
  const bounce = isMoving ? Math.abs(Math.sin(time * 0.015)) * 4 : 0;
  const drawY = y - bounce;

  ctx.save();
  if (customScale !== 1) {
    ctx.translate(x, y);
    ctx.scale(customScale, customScale);
    ctx.translate(-x, -y);
  }

  // Shadow under character
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // BACK ACCESSORIES (Rendered behind body)
  drawBackAccessory(ctx, x, drawY, appearance.backAccessory, time, facing);

  // BODY & OUTFIT
  drawOutfitBody(ctx, x, drawY, appearance.outfit, isMoving, time, facing);

  // HEAD & FACE SHAPE
  drawHeadBase(ctx, x, drawY - 24, appearance.faceShape || 'round', appearance.skinColor);

  // EYES, CHEEKS, BLUSH & MOUTH
  if (facing !== 'up') {
    const eyeShift = facing === 'left' ? -3 : facing === 'right' ? 3 : 0;
    drawFaceFeatures(ctx, x, drawY, eyeShift, appearance);
  }

  // FACE ACCESSORIES
  if (appearance.faceAccessory && appearance.faceAccessory !== 'none' && facing !== 'up') {
    const eyeShift = facing === 'left' ? -3 : facing === 'right' ? 3 : 0;
    drawFaceAccessory(ctx, x, drawY, eyeShift, appearance.faceAccessory);
  }

  // HAIR STYLES
  drawHair(ctx, x, drawY - 24, appearance.hairStyle, appearance.hairColor, facing);

  // HATS & HEADWEAR
  if (appearance.hat && appearance.hat !== 'none') {
    drawHat(ctx, x, drawY - 24, appearance.hat, facing);
  }

  // FISHING ROD (If fishing)
  if (char.isFishing) {
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 6, drawY - 12);
    ctx.lineTo(x + 26, drawY - 32);
    ctx.stroke();

    // Fishing line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 26, drawY - 32);
    ctx.lineTo(x + 36, drawY);
    ctx.stroke();

    // Floating bobber
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + 36, drawY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // NAME & TITLE OVER HEAD (Skip if in isolated studio view)
  if (char.name && customScale === 1) {
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    if (char.title) {
      ctx.fillStyle = '#fde047';
      ctx.fillText(`<${char.title}>`, x, drawY - 44);
    }
    ctx.fillStyle = char.isPlayer ? '#38bdf8' : '#ffffff';
    ctx.fillText(char.name, x, drawY - 35);
    ctx.textAlign = 'left';
  }

  // CHAT BUBBLE FLOATING ABOVE HEAD
  if (char.chatBubble && Date.now() - char.chatBubble.timestamp < char.chatBubble.duration) {
    drawChatBubble(ctx, x, drawY - 56, char.chatBubble.text);
  }

  // EMOTE BUBBLE
  if (char.emoteBubble && Date.now() - char.emoteBubble.timestamp < char.emoteBubble.duration) {
    drawEmoteBubble(ctx, x, drawY - 56, char.emoteBubble.icon);
  }

  ctx.restore();
}

function drawHeadBase(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  shape: 'round' | 'oval' | 'sharp',
  skinColor: string
) {
  ctx.fillStyle = skinColor;
  ctx.beginPath();

  if (shape === 'oval') {
    ctx.ellipse(hx, hy, 12, 14, 0, 0, Math.PI * 2);
  } else if (shape === 'sharp') {
    // Anime tapered jaw
    ctx.moveTo(hx - 12, hy - 4);
    ctx.quadraticCurveTo(hx - 12, hy + 7, hx, hy + 13);
    ctx.quadraticCurveTo(hx + 12, hy + 7, hx + 12, hy - 4);
    ctx.arc(hx, hy - 4, 12, 0, Math.PI, true);
  } else {
    // Round
    ctx.arc(hx, hy, 13, 0, Math.PI * 2);
  }

  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawFaceFeatures(
  ctx: CanvasRenderingContext2D,
  x: number,
  drawY: number,
  eyeShift: number,
  app: AvatarAppearance
) {
  const eyeStyle = app.eyeStyle || 'normal';

  // 1. EYES
  if (eyeStyle === 'normal') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 5 + eyeShift, drawY - 26, 3, 4);
    ctx.fillRect(x + 2 + eyeShift, drawY - 26, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 5 + eyeShift, drawY - 26, 1, 2);
    ctx.fillRect(x + 2 + eyeShift, drawY - 26, 1, 2);
  } else if (eyeStyle === 'anime_sparkle') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 6 + eyeShift, drawY - 27, 4, 5);
    ctx.fillRect(x + 2 + eyeShift, drawY - 27, 4, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x - 5 + eyeShift, drawY - 25, 2, 2);
    ctx.fillRect(x + 3 + eyeShift, drawY - 25, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6 + eyeShift, drawY - 27, 2, 2);
    ctx.fillRect(x + 2 + eyeShift, drawY - 27, 2, 2);
    ctx.fillRect(x - 4 + eyeShift, drawY - 24, 1, 1);
    ctx.fillRect(x + 4 + eyeShift, drawY - 24, 1, 1);
  } else if (eyeStyle === 'cool') {
    // Narrow sharp slit
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 6 + eyeShift, drawY - 26, 4, 2);
    ctx.fillRect(x + 2 + eyeShift, drawY - 26, 4, 2);
    // Sharp brow
    ctx.fillRect(x - 6 + eyeShift, drawY - 28, 4, 1);
    ctx.fillRect(x + 2 + eyeShift, drawY - 28, 4, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 4 + eyeShift, drawY - 26, 1, 1);
    ctx.fillRect(x + 4 + eyeShift, drawY - 26, 1, 1);
  } else if (eyeStyle === 'sleepy') {
    // Half closed chill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 5 + eyeShift, drawY - 25, 3, 2);
    ctx.fillRect(x + 2 + eyeShift, drawY - 25, 3, 2);
    ctx.fillRect(x - 5 + eyeShift, drawY - 27, 3, 1);
    ctx.fillRect(x + 2 + eyeShift, drawY - 27, 3, 1);
  } else if (eyeStyle === 'wink') {
    // Left open, right winking ^
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 5 + eyeShift, drawY - 26, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 5 + eyeShift, drawY - 26, 1, 2);
    // Winking right eye
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 1 + eyeShift, drawY - 24);
    ctx.lineTo(x + 3 + eyeShift, drawY - 26);
    ctx.lineTo(x + 5 + eyeShift, drawY - 24);
    ctx.stroke();
  } else if (eyeStyle === 'cute') {
    // Happy curved crescents ^ ^
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 6 + eyeShift, drawY - 24);
    ctx.lineTo(x - 4 + eyeShift, drawY - 26);
    ctx.lineTo(x - 2 + eyeShift, drawY - 24);
    ctx.moveTo(x + 2 + eyeShift, drawY - 24);
    ctx.lineTo(x + 4 + eyeShift, drawY - 26);
    ctx.lineTo(x + 6 + eyeShift, drawY - 24);
    ctx.stroke();
  }

  // 2. CHEEKS & BLUSH
  if (app.blush) {
    ctx.fillStyle = 'rgba(244, 63, 94, 0.65)';
    ctx.fillRect(x - 9 + eyeShift, drawY - 22, 4, 3);
    ctx.fillRect(x + 5 + eyeShift, drawY - 22, 4, 3);
    // Diagonal blush lines
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(x - 8 + eyeShift, drawY - 22, 1, 2);
    ctx.fillRect(x - 6 + eyeShift, drawY - 22, 1, 2);
    ctx.fillRect(x + 6 + eyeShift, drawY - 22, 1, 2);
    ctx.fillRect(x + 8 + eyeShift, drawY - 22, 1, 2);
  } else {
    ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.fillRect(x - 8 + eyeShift, drawY - 22, 3, 2);
    ctx.fillRect(x + 5 + eyeShift, drawY - 22, 3, 2);
  }

  // 3. MOUTH
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(x - 1 + eyeShift, drawY - 20, 2, 1);
}

function drawFaceAccessory(
  ctx: CanvasRenderingContext2D,
  x: number,
  drawY: number,
  eyeShift: number,
  acc: string
) {
  if (acc === 'kacamata_hitam') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 8, drawY - 27, 16, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6, drawY - 26, 3, 1);
  } else if (acc === 'kacamata_bulat') {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 7 + eyeShift, drawY - 27, 5, 5);
    ctx.strokeRect(x + 2 + eyeShift, drawY - 27, 5, 5);
    // Bridge
    ctx.beginPath();
    ctx.moveTo(x - 2 + eyeShift, drawY - 25);
    ctx.lineTo(x + 2 + eyeShift, drawY - 25);
    ctx.stroke();
    // Glass shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(x - 6 + eyeShift, drawY - 26, 2, 2);
    ctx.fillRect(x + 3 + eyeShift, drawY - 26, 2, 2);
  } else if (acc === 'masker') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 6 + eyeShift, drawY - 21, 12, 6);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 6 + eyeShift, drawY - 21, 12, 6);
  } else if (acc === 'mawar') {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 2 + eyeShift, drawY - 20, 4, 3);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x - 2 + eyeShift, drawY - 19, 4, 2);
  } else if (acc === 'plester') {
    // Anime adhesive plaster on bridge of nose
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(x - 3 + eyeShift, drawY - 23, 6, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 1 + eyeShift, drawY - 23, 2, 3);
  } else if (acc === 'kumis') {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x - 5 + eyeShift, drawY - 20);
    ctx.lineTo(x + eyeShift, drawY - 19);
    ctx.lineTo(x + 5 + eyeShift, drawY - 20);
    ctx.lineTo(x + 4 + eyeShift, drawY - 18);
    ctx.lineTo(x + eyeShift, drawY - 18);
    ctx.lineTo(x - 4 + eyeShift, drawY - 18);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBackAccessory(
  ctx: CanvasRenderingContext2D,
  x: number,
  drawY: number,
  acc: string,
  time: number,
  facing: string
) {
  if (!acc || acc === 'none') return;

  if (acc === 'sayap_putih' || acc === 'sayap_hitam') {
    const isDark = acc === 'sayap_hitam';
    const flap = Math.sin(time * 0.01) * 4;
    ctx.fillStyle = isDark ? '#1e1b4b' : '#ffffff';
    ctx.strokeStyle = isDark ? '#4338ca' : '#cbd5e1';
    ctx.lineWidth = 1.5;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(x - 6, drawY - 14);
    ctx.quadraticCurveTo(x - 22, drawY - 26 - flap, x - 26, drawY - 14);
    ctx.quadraticCurveTo(x - 16, drawY - 8, x - 6, drawY - 10);
    ctx.fill();
    ctx.stroke();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(x + 6, drawY - 14);
    ctx.quadraticCurveTo(x + 22, drawY - 26 - flap, x + 26, drawY - 14);
    ctx.quadraticCurveTo(x + 16, drawY - 8, x + 6, drawY - 10);
    ctx.fill();
    ctx.stroke();

    // Glow effect
    if (!isDark) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.fillRect(x - 18, drawY - 22 - flap, 2, 2);
      ctx.fillRect(x + 16, drawY - 22 - flap, 2, 2);
    }
  } else if (acc === 'sayap_peri') {
    const flap = Math.sin(time * 0.015) * 5;
    ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.2;

    // Translucent Fairy wings
    ctx.beginPath();
    ctx.ellipse(x - 14, drawY - 18 - flap, 10, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(x + 14, drawY - 18 - flap, 10, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sparkles
    ctx.fillStyle = '#6ee7b7';
    ctx.fillRect(x - 18, drawY - 20, 2, 2);
    ctx.fillRect(x + 16, drawY - 20, 2, 2);
  } else if (acc === 'gitar') {
    ctx.fillStyle = '#b45309';
    ctx.save();
    ctx.translate(x + 10, drawY - 12);
    ctx.rotate(0.5);
    ctx.fillRect(-4, -14, 8, 20);
    ctx.beginPath();
    ctx.arc(0, 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (acc === 'pedang_buster') {
    // Cloud Buster Sword
    ctx.save();
    ctx.translate(x - 4, drawY - 14);
    ctx.rotate(-0.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-4, -20, 8, 30);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(2, -20, 2, 30); // Blade edge
    // Materia slots
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, -10, 2, 0, Math.PI * 2);
    ctx.arc(0, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    // Guard & Hilt
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-6, 10, 12, 3);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-2, 13, 4, 8);
    ctx.restore();
  } else if (acc === 'tas_sekolah') {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 7, drawY - 16, 14, 12);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x - 5, drawY - 14, 10, 5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x - 3, drawY - 9, 2, 2);
    ctx.fillRect(x + 1, drawY - 9, 2, 2);
  } else if (acc === 'jubah') {
    const billow = Math.sin(time * 0.008) * 3;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(x - 8, drawY - 15);
    ctx.lineTo(x + 8, drawY - 15);
    ctx.lineTo(x + 10 + billow, drawY - 1);
    ctx.lineTo(x - 10 - billow, drawY - 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 3, drawY - 16, 6, 2); // Clasp
  } else if (acc === 'balon') {
    const sway = Math.sin(time * 0.006) * 4;
    // Strings
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, drawY - 12);
    ctx.lineTo(x + 16 + sway, drawY - 36);
    ctx.moveTo(x + 8, drawY - 12);
    ctx.lineTo(x + 8 + sway, drawY - 42);
    ctx.moveTo(x + 8, drawY - 12);
    ctx.lineTo(x + 22 + sway, drawY - 40);
    ctx.stroke();

    // 3 Balloons
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(x + 8 + sway, drawY - 46, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(x + 16 + sway, drawY - 40, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(x + 22 + sway, drawY - 44, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOutfitBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  drawY: number,
  outfit: string,
  isMoving: boolean,
  time: number,
  facing: string
) {
  // Legs & Shoes
  ctx.fillStyle = '#1e293b';
  const legOffset = isMoving ? Math.sin(time * 0.015) * 3 : 0;
  ctx.fillRect(x - 6, drawY - 3, 5, 5 + legOffset);
  ctx.fillRect(x + 1, drawY - 3, 5, 5 - legOffset);

  // Main Torso base
  if (outfit === 'jersey_timnas') {
    // Red body with white collar & Garuda crest
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - 8, drawY - 16, 16, 14);
    // White collar & cuffs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 4, drawY - 16, 8, 2);
    ctx.fillRect(x - 8, drawY - 5, 2, 3);
    ctx.fillRect(x + 6, drawY - 5, 2, 3);
    // Golden Garuda badge
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x - 5, drawY - 12, 3, 3);
  } else if (outfit === 'kebaya') {
    // Elegant pink-magenta kebaya with gold buttons & batik sarong
    ctx.fillStyle = '#be185d';
    ctx.fillRect(x - 8, drawY - 16, 16, 10);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x - 1, drawY - 15, 2, 8); // Gold buttons
    // Batik pattern skirt
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x - 8, drawY - 6, 16, 5);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(x - 6, drawY - 5, 3, 3);
    ctx.fillRect(x + 3, drawY - 5, 3, 3);
  } else if (outfit === 'koko_gaul') {
    // White koko with gold vertical embroidery
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - 8, drawY - 16, 16, 15);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x - 1, drawY - 16, 2, 14);
    ctx.fillRect(x - 4, drawY - 12, 1, 6);
    ctx.fillRect(x + 3, drawY - 12, 1, 6);
  } else if (outfit === 'sma') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - 8, drawY - 16, 16, 14);
    // Grey tie / SMA badge
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - 1, drawY - 15, 2, 7);
    ctx.fillRect(x - 5, drawY - 11, 2, 2);
  } else if (outfit === 'jas_mewah') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 8, drawY - 16, 16, 14);
    // White shirt V
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x - 3, drawY - 16);
    ctx.lineTo(x + 3, drawY - 16);
    ctx.lineTo(x, drawY - 10);
    ctx.closePath();
    ctx.fill();
    // Red bow tie
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 2, drawY - 15, 4, 2);
  } else if (outfit === 'gaun') {
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(x - 8, drawY - 16, 16, 9);
    // Frilled flared skirt
    ctx.beginPath();
    ctx.moveTo(x - 7, drawY - 7);
    ctx.lineTo(x + 7, drawY - 7);
    ctx.lineTo(x + 10, drawY - 1);
    ctx.lineTo(x - 10, drawY - 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(x - 6, drawY - 12, 12, 2);
  } else if (outfit === 'hoodie') {
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x - 9, drawY - 16, 18, 14);
    // Kangaroo pocket
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(x - 5, drawY - 7, 10, 4);
  } else if (outfit === 'flanel') {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - 8, drawY - 16, 16, 14);
    // Plaid grid
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(x - 8, drawY - 11, 16, 2);
    ctx.fillRect(x - 8, drawY - 6, 16, 2);
    ctx.fillRect(x - 3, drawY - 16, 2, 14);
    ctx.fillRect(x + 2, drawY - 16, 2, 14);
  } else if (outfit === 'jaket_kulit') {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 8, drawY - 16, 16, 14);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 1, drawY - 16, 2, 14); // Silver zipper
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 6, drawY - 16, 3, 5); // Lapel
    ctx.fillRect(x + 3, drawY - 16, 3, 5);
  } else {
    // Default Kaos AOI (Merah Putih Bintang)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 8, drawY - 16, 16, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 8, drawY - 10, 16, 3);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x - 1, drawY - 9, 2, 2);
  }
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  style: string,
  color: string,
  facing: string
) {
  ctx.fillStyle = color;

  switch (style) {
    case 'sasuke':
      ctx.beginPath();
      ctx.arc(hx, hy - 3, 14, Math.PI, 0);
      ctx.lineTo(hx + 15, hy + 2);
      ctx.lineTo(hx + 11, hy - 2);
      ctx.lineTo(hx + 4, hy + 4);
      ctx.lineTo(hx - 4, hy + 4);
      ctx.lineTo(hx - 11, hy - 2);
      ctx.lineTo(hx - 15, hy + 2);
      ctx.closePath();
      ctx.fill();
      break;

    case 'landak':
      for (let s = -12; s <= 12; s += 6) {
        ctx.beginPath();
        ctx.moveTo(hx + s - 3, hy - 10);
        ctx.lineTo(hx + s, hy - 22);
        ctx.lineTo(hx + s + 3, hy - 10);
        ctx.fill();
      }
      break;

    case 'undercut':
      ctx.fillRect(hx - 12, hy - 14, 24, 7);
      ctx.fillRect(hx - 10, hy - 18, 20, 5);
      break;

    case 'belah_tengah':
      // 90s boyband curtain parted hair
      ctx.beginPath();
      ctx.arc(hx, hy - 3, 13, Math.PI, 0);
      ctx.fill();
      // Left curtain
      ctx.fillRect(hx - 13, hy - 8, 5, 12);
      // Right curtain
      ctx.fillRect(hx + 8, hy - 8, 5, 12);
      // Forehead part gap in center
      break;

    case 'harajuku':
      // Layered side swept emo bangs
      ctx.beginPath();
      ctx.arc(hx, hy - 3, 14, Math.PI, 0);
      ctx.lineTo(hx + 14, hy + 4);
      ctx.lineTo(hx + 2, hy + 6);
      ctx.lineTo(hx - 10, hy - 1);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(hx - 14, hy - 6, 6, 12);
      break;

    case 'poni':
      ctx.beginPath();
      ctx.arc(hx, hy - 2, 14, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(hx - 10, hy - 8, 20, 6);
      ctx.fillRect(hx - 13, hy - 6, 4, 10);
      ctx.fillRect(hx + 9, hy - 6, 4, 10);
      break;

    case 'kuncir':
      ctx.beginPath();
      ctx.arc(hx, hy - 2, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(hx - 16, hy - 4, 5, 12);
      ctx.fillRect(hx + 11, hy - 4, 5, 12);
      // Bows
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(hx - 15, hy - 5, 3, 3);
      ctx.fillRect(hx + 12, hy - 5, 3, 3);
      break;

    case 'bob':
      // Sleek bob curved around chin
      ctx.beginPath();
      ctx.arc(hx, hy - 2, 14, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(hx - 13, hy - 6, 5, 14);
      ctx.fillRect(hx + 8, hy - 6, 5, 14);
      break;

    case 'gelombang':
      // Long flowing luscious wavy hair
      ctx.beginPath();
      ctx.arc(hx, hy - 2, 14, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(hx - 14, hy - 6, 5, 19);
      ctx.fillRect(hx + 9, hy - 6, 5, 19);
      // Wave curves
      ctx.beginPath();
      ctx.arc(hx - 11, hy + 13, 3, 0, Math.PI);
      ctx.arc(hx + 11, hy + 13, 3, 0, Math.PI);
      ctx.fill();
      break;

    case 'kribo':
      ctx.beginPath();
      ctx.arc(hx, hy - 6, 17, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      ctx.beginPath();
      ctx.arc(hx, hy - 4, 13, Math.PI, 0);
      ctx.fill();
      break;
  }
}

function drawHat(ctx: CanvasRenderingContext2D, hx: number, hy: number, hat: string, facing: string) {
  switch (hat) {
    case 'kupluk':
      ctx.fillStyle = '#475569';
      ctx.fillRect(hx - 13, hy - 16, 26, 8);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(hx, hy - 17, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'koboi':
      ctx.fillStyle = '#78350f';
      ctx.fillRect(hx - 18, hy - 14, 36, 4);
      ctx.fillRect(hx - 10, hy - 22, 20, 10);
      break;
    case 'jerami':
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(hx, hy - 13, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(hx - 8, hy - 19, 16, 7);
      break;
    case 'helm_bogo':
      // Retro scooter helmet with curved black visor
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(hx, hy - 6, 16, Math.PI, 0);
      ctx.lineTo(hx + 15, hy + 2);
      ctx.lineTo(hx - 15, hy + 2);
      ctx.closePath();
      ctx.fill();
      // Bubble visor
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(hx, hy - 1, 12, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hx - 4, hy + 1, 3, 2); // Visor reflection
      break;
    case 'headband_ninja':
      // Konoha style forehead protector
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(hx - 13, hy - 13, 26, 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(hx - 6, hy - 12, 12, 4);
      // Small emblem mark
      ctx.fillStyle = '#334155';
      ctx.fillRect(hx - 1, hy - 11, 2, 2);
      break;
    case 'baret':
      // Chic tilted artist beret
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(hx + 2, hy - 15, 16, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(hx + 6, hy - 22, 2, 3); // Stalk
      break;
    case 'mahkota':
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(hx - 10, hy - 12);
      ctx.lineTo(hx - 10, hy - 20);
      ctx.lineTo(hx - 5, hy - 15);
      ctx.lineTo(hx, hy - 22);
      ctx.lineTo(hx + 5, hy - 15);
      ctx.lineTo(hx + 10, hy - 20);
      ctx.lineTo(hx + 10, hy - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(hx - 2, hy - 16, 4, 3);
      break;
    case 'bando_kucing':
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(hx - 10, hy - 12);
      ctx.lineTo(hx - 8, hy - 20);
      ctx.lineTo(hx - 4, hy - 13);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(hx + 4, hy - 13);
      ctx.lineTo(hx + 8, hy - 20);
      ctx.lineTo(hx + 10, hy - 12);
      ctx.fill();
      break;
  }
}

function drawChatBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string
) {
  ctx.save();
  ctx.font = '10px monospace';
  const width = Math.min(220, ctx.measureText(text).width + 16);
  const height = 22;
  const bx = x - width / 2;
  const by = y - height;

  // Bubble background
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, width, height, 6);
  ctx.fill();
  ctx.stroke();

  // Little arrow pointing to avatar
  ctx.beginPath();
  ctx.moveTo(x - 4, by + height);
  ctx.lineTo(x, by + height + 5);
  ctx.lineTo(x + 4, by + height);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, by + 14, width - 8);
  ctx.restore();
}

function drawEmoteBubble(ctx: CanvasRenderingContext2D, x: number, y: number, icon: string) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y - 10, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(icon, x, y - 5);
  ctx.restore();
}

/**
 * SCENERY PROPS
 */
function drawBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x, y, 48, 14);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(x + 2, y + 2, 44, 4);
  ctx.fillRect(x + 2, y + 8, 44, 4);
  // Legs
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 4, y + 14, 4, 10);
  ctx.fillRect(x + 40, y + 14, 4, 10);
}

function drawRomanticTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  // Tree Trunk
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x - 8, y, 16, 50);

  // Sakura Pink Foliage Canopy
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.arc(x, y - 15, 36, 0, Math.PI * 2);
  ctx.arc(x - 24, y, 26, 0, Math.PI * 2);
  ctx.arc(x + 24, y, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.arc(x - 8, y - 20, 18, 0, Math.PI * 2);
  ctx.arc(x + 12, y - 8, 16, 0, Math.PI * 2);
  ctx.fill();

  // Drifting sakura flower petals
  for (let i = 0; i < 5; i++) {
    const px = x - 30 + ((time * 0.02 + i * 25) % 80);
    const py = y - 10 + ((time * 0.03 + i * 30) % 70);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(px, py, 3, 3);
  }
}

function drawStreetLamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#334155';
  ctx.fillRect(x - 2, y - 35, 4, 35);
  // Lamp head
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(x, y - 35, 6, 0, Math.PI * 2);
  ctx.fill();
  // Warm light glow
  ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
  ctx.beginPath();
  ctx.arc(x, y - 35, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawWarung(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Warung Stall
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x, y, 90, 45);

  // Striped canopy
  for (let s = 0; s < 90; s += 15) {
    ctx.fillStyle = s % 30 === 0 ? '#ef4444' : '#ffffff';
    ctx.fillRect(x + s, y - 12, 15, 12);
  }

  // Signboard
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 5, y + 6, 80, 18);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('WARUNG SOMAT', x + 10, y + 18);
}

function drawPortalSign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string
) {
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.font = 'bold 10px monospace';
  const w = ctx.measureText(text).width + 16;
  ctx.fillRect(x - w / 2, y - 12, w, 22);
  ctx.strokeRect(x - w / 2, y - 12, w, 22);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y + 3);
  ctx.restore();
}

function drawFence(ctx: CanvasRenderingContext2D, x: number, y: number, len: number) {
  ctx.fillStyle = '#92400e';
  // Horizontal bars
  ctx.fillRect(x, y + 4, len, 3);
  ctx.fillRect(x, y + 14, len, 3);
  // Vertical posts
  for (let px = x; px <= x + len; px += 20) {
    ctx.fillRect(px, y, 4, 20);
  }
}

function drawBarn(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x, y, 80, 75);
  ctx.fillStyle = '#991b1b';
  // Roof
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 40, y - 30);
  ctx.lineTo(x + 88, y);
  ctx.closePath();
  ctx.fill();

  // White cross doors
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 25, y + 25, 30, 50);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 25, y + 25, 30, 50);
  ctx.beginPath();
  ctx.moveTo(x + 25, y + 25);
  ctx.lineTo(x + 55, y + 75);
  ctx.moveTo(x + 55, y + 25);
  ctx.lineTo(x + 25, y + 75);
  ctx.stroke();
}

function drawAnimalPen(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  // Fence for chickens and cows
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 90, 65);

  // Chicken 1 (Pecking animation)
  const peck = Math.sin(time * 0.01) > 0 ? 2 : 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 20, y + 30 + peck, 10, 8);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x + 22, y + 27 + peck, 4, 3); // Comb
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x + 28, y + 33 + peck, 3, 2); // Beak

  // Cow
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 48, y + 20, 24, 16);
  // Black spots
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 52, y + 22, 6, 6);
  ctx.fillRect(x + 62, y + 26, 6, 8);
  // Head
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 68, y + 16, 10, 10);
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(x + 72, y + 20, 6, 4); // Snout
}

function drawCropPlant(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  crop: { icon: string; color: string },
  progress: number,
  time: number
) {
  if (progress < 0.3) {
    // Stage 1: Sprout
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(cx - 2, cy - 8, 4, 8);
    ctx.fillRect(cx - 5, cy - 8, 3, 3);
    ctx.fillRect(cx + 2, cy - 8, 3, 3);
  } else if (progress < 0.8) {
    // Stage 2: Growing Bush
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(cx - 3, cy - 14, 6, 14);
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 10, 6, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy - 10, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Stage 3: Fully Mature with Icon & Color
    ctx.fillStyle = crop.color;
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(crop.icon, cx, cy - 4);
    ctx.textAlign = 'left';
  }
}

function drawWaterWell(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  // Roof posts
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x - 14, y - 20, 4, 20);
  ctx.fillRect(x + 10, y - 20, 4, 20);
  // Roof
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 20);
  ctx.lineTo(x, y - 32);
  ctx.lineTo(x + 18, y - 20);
  ctx.fill();
}

function drawLilyPad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hasFlower: boolean
) {
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 1.8);
  ctx.lineTo(x, y);
  ctx.fill();

  if (hasFlower) {
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(x + 2, y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 1, y - 3, 2, 2);
  }
}

function drawFishShack(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x, y, 70, 50);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x - 6, y - 14, 82, 16);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('TOKO UMPAN', x + 6, y + 15);
  ctx.fillText('PAK KUMIS', x + 10, y + 26);
}
