export type MapZone = 'taman' | 'tani' | 'mancing' | 'kasino' | 'rumah';

export interface AvatarAppearance {
  gender: 'male' | 'female';
  skinColor: string; // hex
  faceShape: 'round' | 'oval' | 'sharp';
  eyeStyle: 'normal' | 'anime_sparkle' | 'cool' | 'sleepy' | 'wink' | 'cute';
  blush: boolean;
  hairStyle: string; // 'sasuke' | 'landak' | 'undercut' | 'poni' | 'kuncir' | 'kribo' | 'belah_tengah' | 'harajuku' | 'bob' | 'gelombang'
  hairColor: string; // hex
  outfit: string; // 'kaos_aoi' | 'jaket_kulit' | 'sma' | 'hoodie' | 'flanel' | 'jas_mewah' | 'gaun' | 'jersey_timnas' | 'kebaya' | 'koko_gaul'
  hat: string; // 'none' | 'kupluk' | 'koboi' | 'jerami' | 'mahkota' | 'bando_kucing' | 'helm_bogo' | 'headband_ninja' | 'baret'
  backAccessory: string; // 'none' | 'sayap_putih' | 'sayap_hitam' | 'sayap_peri' | 'gitar' | 'pedang_buster' | 'tas_sekolah' | 'jubah' | 'balon'
  faceAccessory: string; // 'none' | 'kacamata_hitam' | 'kacamata_bulat' | 'masker' | 'mawar' | 'plester' | 'kumis'
}

export interface Character {
  id: string;
  name: string;
  title: string;
  isPlayer: boolean;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  facing: 'down' | 'up' | 'left' | 'right';
  isMoving: boolean;
  isSitting?: boolean;
  isFishing?: boolean;
  appearance: AvatarAppearance;
  chatBubble?: {
    text: string;
    timestamp: number;
    duration: number;
  };
  emoteBubble?: {
    icon: string;
    timestamp: number;
    duration: number;
  };
}

export interface CropInfo {
  id: string;
  name: string;
  growTimeSeconds: number;
  sellPrice: number;
  seedPrice: number;
  expReward: number;
  icon: string;
  color: string;
}

export interface FarmPlot {
  id: number;
  cropId: string | null;
  plantedAt: number | null; // timestamp
  watered: boolean;
  hasWeeds: boolean;
  isHarvestable: boolean;
}

export interface FishInfo {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  minWeight: number; // kg
  maxWeight: number;
  pricePerKg: number;
  color: string;
  desc: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'crop' | 'seed' | 'fish' | 'outfit' | 'hat' | 'wing' | 'food' | 'misc';
  count: number;
  sellPrice?: number;
  buyPrice?: number;
  buyPriceDiamonds?: number;
  equipped?: boolean;
  icon: string;
  desc?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardXu: number;
  rewardDiamonds: number;
  rewardExp: number;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerStats {
  level: number;
  exp: number;
  maxExp: number;
  energy: number;
  maxEnergy: number;
  coins: number; // Xu
  diamonds: number; // Lượng
  server: 'Venus' | 'Apollo';
  marriagePartner?: string;
  farmLevel: number;
  fishLevel: number;
}
