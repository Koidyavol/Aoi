import React, { useState, useEffect, useCallback } from 'react';
import {
  Character,
  PlayerStats,
  MapZone,
  FarmPlot,
  InventoryItem,
  Quest,
  AvatarAppearance,
  FishInfo,
} from './types/game';
import {
  CROPS,
  FISH_LIST,
  SHOP_ITEMS,
  INITIAL_QUESTS,
  NPC_LIST,
} from './game/constants';
import { soundEngine } from './audio/soundEngine';
import { GameCanvas } from './game/GameCanvas';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { ChatOverlay } from './components/ChatOverlay';
import { TouchControls } from './components/TouchControls';
import { FarmModal } from './components/FarmModal';
import { FishingModal } from './components/FishingModal';
import { CasinoModal } from './components/CasinoModal';
import { InventoryModal } from './components/InventoryModal';
import { ShopModal } from './components/ShopModal';
import { QuestsModal } from './components/QuestsModal';
import { MapModal } from './components/MapModal';
import { ProfileModal } from './components/ProfileModal';
import { PauseModal } from './components/PauseModal';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';

type ActiveModal =
  | null
  | 'FARM'
  | 'FISHING'
  | 'CASINO'
  | 'SHOP'
  | 'INVENTORY'
  | 'MAP'
  | 'QUESTS'
  | 'PROFILE'
  | 'CUSTOMIZER'
  | 'PAUSE';

const DEFAULT_APPEARANCE: AvatarAppearance = {
  gender: 'male',
  skinColor: '#fbd38d',
  faceShape: 'round',
  eyeStyle: 'normal',
  blush: false,
  hairStyle: 'sasuke',
  hairColor: '#1e293b',
  outfit: 'kaos_aoi',
  hat: 'none',
  backAccessory: 'none',
  faceAccessory: 'none',
};

const INITIAL_PLOTS: FarmPlot[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  cropId: i < 2 ? 'padi' : null,
  plantedAt: i < 2 ? Date.now() - 6000 : null,
  watered: i < 2,
  hasWeeds: false,
  isHarvestable: false,
}));

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'seed_padi', name: 'Bibit Padi', category: 'seed', count: 6, buyPrice: 15, icon: '🌱', desc: 'Bibit padi komoditas utama.' },
  { id: 'seed_tomat', name: 'Bibit Tomat', category: 'seed', count: 3, buyPrice: 35, icon: '🌱', desc: 'Bibit tomat merah.' },
  { id: 'food_esteh', name: 'Es Teh Manis', category: 'food', count: 3, buyPrice: 20, icon: '🧋', desc: 'Memulihkan +25 Stamina.' },
  { id: 'outfit_kaos_aoi', name: 'Kaos Merah AOI', category: 'outfit', count: 1, equipped: true, icon: '👕', desc: 'Kaos legendaris.' },
];

export default function App() {
  const [gameState, setGameState] = useState<'TITLE' | 'PLAYING'>('TITLE');
  const [currentZone, setCurrentZone] = useState<MapZone>('taman');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Player Character State
  const [player, setPlayer] = useState<Character>({
    id: 'player_main',
    name: 'Bocah_AOI',
    title: 'Warga Baru AOI',
    isPlayer: true,
    x: 400,
    y: 300,
    facing: 'down',
    isMoving: false,
    appearance: DEFAULT_APPEARANCE,
  });

  // Player Stats
  const [stats, setStats] = useState<PlayerStats>({
    level: 1,
    exp: 40,
    maxExp: 100,
    energy: 100,
    maxEnergy: 100,
    coins: 350,
    diamonds: 10,
    server: 'Venus',
    farmLevel: 1,
    fishLevel: 1,
  });

  // World Elements
  const [farmPlots, setFarmPlots] = useState<FarmPlot[]>(INITIAL_PLOTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [npcs, setNpcs] = useState<Character[]>(NPC_LIST);

  // Chat Feed
  const [chatLog, setChatLog] = useState<
    { id: string; sender: string; text: string; isPlayer: boolean; time: string }[]
  >([
    { id: '1', sender: 'Sistem', text: 'Selamat datang di Avatar Online Indonesia!', isPlayer: false, time: '01:00' },
    { id: '2', sender: 'Bocah_Warnet', text: 'WTS Sayap Malaikat 50k Xu minat PM!', isPlayer: false, time: '01:01' },
    { id: '3', sender: 'Siti_Cantik', text: 'Kuy yang mau nongkrong di taman cinta 💕', isPlayer: false, time: '01:02' },
  ]);

  // Virtual Joystick & Action
  const [joystickVector, setJoystickVector] = useState<{ x: number; y: number } | null>(null);
  const [actionTriggered, setActionTriggered] = useState(false);

  // Passive Stamina Regeneration (1 energy every 4 seconds, up to maxEnergy)
  useEffect(() => {
    if (gameState !== 'TITLE') {
      const interval = setInterval(() => {
        setStats((prev) => ({
          ...prev,
          energy: Math.min(prev.maxEnergy, prev.energy + 1),
        }));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Periodic NPC Random Chatter
  useEffect(() => {
    if (gameState !== 'TITLE') {
      const npcChatter = [
        { sender: 'Bocah_Warnet', text: 'Ada yang mau mabar mancing lele babon?' },
        { sender: 'Siti_Cantik', text: 'Panen wortelku manis banget hari ini 🥕' },
        { sender: 'Bang_Jago_AOI', text: 'Dadu kembar 3 cair 10x lipat, auto sultan!' },
        { sender: 'Pak_Kumis', text: 'Umpan cacing lagi diskon di toko dermaga!' },
        { sender: 'Petani_Gaul', text: 'Siram kebun dulu biar cepat panen.' },
      ];

      const interval = setInterval(() => {
        const pick = npcChatter[Math.floor(Math.random() * npcChatter.length)];
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        setChatLog((prev) => [
          ...prev.slice(-14),
          {
            id: String(Date.now()),
            sender: pick.sender,
            text: pick.text,
            isPlayer: false,
            time: timeStr,
          },
        ]);

        // Show bubble above matching NPC
        setNpcs((prev) =>
          prev.map((n) =>
            n.name === pick.sender
              ? {
                  ...n,
                  chatBubble: { text: pick.text, timestamp: Date.now(), duration: 5000 },
                }
              : n
          )
        );
      }, 12000);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'TITLE') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Escape') {
        e.preventDefault();
        soundEngine.playClick();
        setActiveModal((prev) => (prev ? null : 'PAUSE'));
      } else if (e.code === 'KeyE') {
        soundEngine.playClick();
        setActiveModal((prev) => (prev === 'INVENTORY' ? null : 'INVENTORY'));
      } else if (e.code === 'KeyM') {
        soundEngine.playClick();
        setActiveModal((prev) => (prev === 'MAP' ? null : 'MAP'));
      } else if (e.code === 'KeyQ') {
        soundEngine.playClick();
        setActiveModal((prev) => (prev === 'QUESTS' ? null : 'QUESTS'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Add EXP & Level Up Handler
  const addExp = useCallback((amount: number) => {
    setStats((prev) => {
      let newExp = prev.exp + amount;
      let newLevel = prev.level;
      let newMaxExp = prev.maxExp;
      let leveledUp = false;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = Math.floor(newMaxExp * 1.5);
        leveledUp = true;
      }

      if (leveledUp) {
        soundEngine.playFishSuccess();
        // Send system chat announcement
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setChatLog((log) => [
          ...log.slice(-14),
          {
            id: String(Date.now()),
            sender: 'Sistem',
            text: `SELAMAT! Kamu naik ke Level ${newLevel}! Max stamina & Xu bertambah!`,
            isPlayer: false,
            time: timeStr,
          },
        ]);
      }

      return {
        ...prev,
        level: newLevel,
        exp: newExp,
        maxExp: newMaxExp,
      };
    });
  }, []);

  // Update Quest Progress
  const updateQuestProgress = useCallback((questId: string, amount = 1) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.completed) {
          const newCurrent = Math.min(q.target, q.current + amount);
          return {
            ...q,
            current: newCurrent,
            completed: newCurrent >= q.target,
          };
        }
        return q;
      })
    );
  }, []);

  // Interaction router when pressing Space or clicking hot spots
  const handleInteract = (hotspot: string) => {
    if (hotspot === 'Kawasan Pertanian') {
      setCurrentZone('tani');
      setPlayer((p) => ({ ...p, x: 400, y: 440 }));
    } else if (hotspot === 'Danau Mancing') {
      setCurrentZone('mancing');
      setPlayer((p) => ({ ...p, x: 100, y: 250 }));
    } else if (hotspot === 'Kasino Hiburan') {
      setCurrentZone('kasino');
      setPlayer((p) => ({ ...p, x: 400, y: 440 }));
    } else if (hotspot === 'Rumah Pribadi') {
      setCurrentZone('rumah');
      setPlayer((p) => ({ ...p, x: 400, y: 440 }));
    } else if (hotspot === 'Kembali ke Taman' || hotspot === 'Keluar Rumah') {
      setCurrentZone('taman');
      setPlayer((p) => ({ ...p, x: 400, y: 300 }));
    } else if (hotspot === 'Urus Kebun & Panen') {
      setActiveModal('FARM');
    } else if (hotspot === 'Mulai Mancing') {
      setActiveModal('FISHING');
    } else if (hotspot === 'Meja Tebak Dadu' || hotspot === 'Roda Keberuntungan') {
      setActiveModal('CASINO');
    } else if (hotspot === 'Mall Busana' || hotspot === 'Lemari Baju') {
      setActiveModal('CUSTOMIZER');
    } else if (hotspot === 'Warung Somat' || hotspot === 'Toko Umpan Pak Kumis') {
      setActiveModal('SHOP');
    } else if (hotspot === 'Tidur di Kasur (+Stamina)') {
      soundEngine.playHarvest();
      setStats((prev) => ({ ...prev, energy: prev.maxEnergy }));
      setPlayer((p) => ({
        ...p,
        emoteBubble: { icon: '😴', timestamp: Date.now(), duration: 3000 },
      }));
    } else if (hotspot === 'Duduk Santai') {
      soundEngine.playClick();
      setPlayer((p) => ({
        ...p,
        emoteBubble: { icon: '☕', timestamp: Date.now(), duration: 3000 },
      }));
    } else if (hotspot.startsWith('Bicara dengan')) {
      const npcName = hotspot.replace('Bicara dengan ', '');
      const npc = npcs.find((n) => n.name === npcName);
      if (npc && npc.chatBubble) {
        soundEngine.playChatPop();
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setChatLog((log) => [
          ...log.slice(-14),
          {
            id: String(Date.now()),
            sender: npc.name,
            text: npc.chatBubble!.text,
            isPlayer: false,
            time: timeStr,
          },
        ]);
        updateQuestProgress('quest_3', 1);
      }
    }
  };

  // Chat Sending
  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setChatLog((prev) => [
      ...prev.slice(-14),
      {
        id: String(Date.now()),
        sender: player.name,
        text,
        isPlayer: true,
        time: timeStr,
      },
    ]);

    setPlayer((p) => ({
      ...p,
      chatBubble: { text, timestamp: Date.now(), duration: 5500 },
    }));

    updateQuestProgress('quest_3', 1);

    // Nearby NPC responsive chatter
    setTimeout(() => {
      const randomNpc = npcs[Math.floor(Math.random() * npcs.length)];
      const replies = [
        `Halo juga bro @${player.name}! Mau mabar kemana?`,
        `Mantap @${player.name}, gas panen padi!`,
        `Kuy mabar kasino atau mancing lele!`,
        `Wih gayamu keren bgt @${player.name} 🔥`,
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];

      setChatLog((prev) => [
        ...prev.slice(-14),
        {
          id: String(Date.now() + 1),
          sender: randomNpc.name,
          text: replyText,
          isPlayer: false,
          time: timeStr,
        },
      ]);

      setNpcs((prev) =>
        prev.map((n) =>
          n.id === randomNpc.id
            ? { ...n, chatBubble: { text: replyText, timestamp: Date.now(), duration: 5000 } }
            : n
        )
      );
    }, 1500);
  };

  const handleSendEmote = (icon: string) => {
    setPlayer((p) => ({
      ...p,
      emoteBubble: { icon, timestamp: Date.now(), duration: 3500 },
    }));
  };

  // FARMING LOGIC
  const handlePlantPlot = (plotId: number, cropId: string) => {
    // Check if player has seed
    const seedItem = inventory.find((it) => it.id === `seed_${cropId}` && it.count > 0);
    const crop = CROPS[cropId];

    if (!seedItem) {
      // Allow planting if player can afford seed cost directly
      if (stats.coins < crop.seedPrice) return;
      setStats((s) => ({ ...s, coins: s.coins - crop.seedPrice }));
    } else {
      // Deduct seed from inventory
      setInventory((inv) =>
        inv
          .map((it) => (it.id === seedItem.id ? { ...it, count: it.count - 1 } : it))
          .filter((it) => it.count > 0)
      );
    }

    setFarmPlots((plots) =>
      plots.map((p) =>
        p.id === plotId
          ? { ...p, cropId, plantedAt: Date.now(), watered: false, isHarvestable: false }
          : p
      )
    );
  };

  const handleWaterPlot = (plotId: number) => {
    if (stats.energy < 2) return;
    setStats((s) => ({ ...s, energy: Math.max(0, s.energy - 2) }));
    setFarmPlots((plots) =>
      plots.map((p) => (p.id === plotId ? { ...p, watered: true } : p))
    );
  };

  const handleWaterAll = () => {
    const unwateredCount = farmPlots.filter((p) => p.cropId && !p.watered).length;
    const energyCost = Math.min(stats.energy, unwateredCount * 2);
    setStats((s) => ({ ...s, energy: Math.max(0, s.energy - energyCost) }));
    setFarmPlots((plots) =>
      plots.map((p) => (p.cropId ? { ...p, watered: true } : p))
    );
  };

  const handleHarvestPlot = (plotId: number) => {
    const plot = farmPlots.find((p) => p.id === plotId);
    if (!plot || !plot.cropId) return;

    const crop = CROPS[plot.cropId];
    if (!crop) return;

    // Add crop to inventory
    setInventory((inv) => {
      const existing = inv.find((it) => it.id === `crop_${crop.id}`);
      if (existing) {
        return inv.map((it) =>
          it.id === existing.id ? { ...it, count: it.count + 1 } : it
        );
      }
      return [
        ...inv,
        {
          id: `crop_${crop.id}`,
          name: crop.name,
          category: 'crop',
          count: 1,
          sellPrice: crop.sellPrice,
          icon: crop.icon,
          desc: `Hasil panen ladang ${crop.name}.`,
        },
      ];
    });

    addExp(crop.expReward);
    if (crop.id === 'padi') {
      updateQuestProgress('quest_1', 1);
    }

    // Reset plot
    setFarmPlots((plots) =>
      plots.map((p) =>
        p.id === plotId
          ? { ...p, cropId: null, plantedAt: null, watered: false, isHarvestable: false }
          : p
      )
    );
  };

  const handleHarvestAll = () => {
    farmPlots.forEach((p) => {
      if (p.cropId && p.plantedAt) {
        const crop = CROPS[p.cropId];
        if ((Date.now() - p.plantedAt) / 1000 >= crop.growTimeSeconds) {
          handleHarvestPlot(p.id);
        }
      }
    });
  };

  const handleFeedAnimals = (type: 'chicken' | 'cow') => {
    setStats((s) => ({
      ...s,
      energy: Math.max(0, s.energy - 5),
      coins: s.coins + (type === 'chicken' ? 80 : 150),
    }));
    addExp(type === 'chicken' ? 30 : 50);
  };

  // FISHING LOGIC
  const handleCatchFish = (fish: FishInfo, weight: number) => {
    setInventory((inv) => {
      const existing = inv.find((it) => it.id === `fish_${fish.id}`);
      if (existing) {
        return inv.map((it) =>
          it.id === existing.id ? { ...it, count: it.count + 1 } : it
        );
      }
      return [
        ...inv,
        {
          id: `fish_${fish.id}`,
          name: `${fish.name} (${weight}kg)`,
          category: 'fish',
          count: 1,
          sellPrice: Math.floor(fish.pricePerKg * weight),
          icon: '🐟',
          desc: fish.desc,
        },
      ];
    });

    addExp(45);
    updateQuestProgress('quest_2', 1);
  };

  const handleDirectSellFish = (fish: FishInfo, weight: number, totalPrice: number) => {
    setStats((s) => ({ ...s, coins: s.coins + totalPrice }));
    addExp(50);
    updateQuestProgress('quest_2', 1);
  };

  // CASINO LOGIC
  const handleBetResult = (payoutXu: number, diffXu: number) => {
    setStats((s) => ({ ...s, coins: Math.max(0, s.coins + diffXu) }));
    if (diffXu > 0) {
      addExp(30);
    }
    updateQuestProgress('quest_4', 1);
  };

  const handleSpinWheelResult = (label: string, xuDiff: number, diamondsAdd: number) => {
    setStats((s) => ({
      ...s,
      coins: Math.max(0, s.coins + xuDiff),
      diamonds: s.diamonds + diamondsAdd,
    }));
    addExp(40);
    updateQuestProgress('quest_4', 1);
  };

  // SHOP LOGIC
  const handleBuyItem = (item: InventoryItem) => {
    if (item.buyPriceDiamonds) {
      setStats((s) => ({ ...s, diamonds: s.diamonds - item.buyPriceDiamonds! }));
    } else if (item.buyPrice) {
      setStats((s) => ({ ...s, coins: s.coins - item.buyPrice! }));
    }

    setInventory((inv) => {
      const existing = inv.find((it) => it.id === item.id);
      if (existing) {
        return inv.map((it) => (it.id === item.id ? { ...it, count: it.count + 1 } : it));
      }
      return [...inv, { ...item, count: 1 }];
    });
  };

  // INVENTORY ACTIONS
  const handleSellItem = (item: InventoryItem, quantity: number) => {
    const sellAmount = (item.sellPrice || 0) * quantity;
    setStats((s) => ({ ...s, coins: s.coins + sellAmount }));

    setInventory((inv) =>
      inv
        .map((it) => (it.id === item.id ? { ...it, count: it.count - quantity } : it))
        .filter((it) => it.count > 0)
    );
  };

  const handleEatFood = (item: InventoryItem) => {
    let restore = 25;
    if (item.id === 'food_gorengan') restore = 45;
    if (item.id === 'food_bakso') restore = 100;

    setStats((s) => ({ ...s, energy: Math.min(s.maxEnergy, s.energy + restore) }));

    setInventory((inv) =>
      inv
        .map((it) => (it.id === item.id ? { ...it, count: it.count - 1 } : it))
        .filter((it) => it.count > 0)
    );

    setPlayer((p) => ({
      ...p,
      emoteBubble: { icon: '😋', timestamp: Date.now(), duration: 2500 },
    }));
  };

  const handleEquipItem = (item: InventoryItem) => {
    const app = { ...player.appearance };

    if (item.category === 'outfit') {
      const key = item.id.replace('outfit_', '');
      app.outfit = key;
    } else if (item.category === 'hat') {
      const key = item.id.replace('hat_', '');
      app.hat = key;
    } else if (item.category === 'wing') {
      const key = item.id.replace('wing_', '');
      app.backAccessory = key;
    }

    setPlayer((p) => ({ ...p, appearance: app }));
  };

  // QUEST CLAIM
  const handleClaimQuest = (questId: string) => {
    const q = quests.find((quest) => quest.id === questId);
    if (!q || q.claimed || !q.completed) return;

    setStats((s) => ({
      ...s,
      coins: s.coins + q.rewardXu,
      diamonds: s.diamonds + q.rewardDiamonds,
    }));
    addExp(q.rewardExp);

    setQuests((prev) =>
      prev.map((quest) => (quest.id === questId ? { ...quest, claimed: true } : quest))
    );
  };

  const hasUnclaimedQuests = quests.some((q) => q.completed && !q.claimed);

  const toggleSound = () => {
    const active = soundEngine.toggleBgm();
    soundEngine.toggleSfx(active);
    setIsMuted(!active);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden font-sans select-none">
      {/* 1. TITLE SCREEN (When game not started) */}
      {gameState === 'TITLE' && (
        <TitleScreen
          defaultAppearance={DEFAULT_APPEARANCE}
          onStartGame={(name, server, appearance) => {
            setPlayer((p) => ({ ...p, name, appearance }));
            setStats((s) => ({ ...s, server }));
            setGameState('PLAYING');
          }}
        />
      )}

      {/* 2. PLAYING STATE: Full-viewport Game Shell */}
      {gameState === 'PLAYING' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Isolated 60fps Game Canvas */}
          <GameCanvas
            zone={currentZone}
            player={player}
            npcs={npcs}
            farmPlots={farmPlots}
            onPlayerMove={(x, y, facing, isMoving) => {
              setPlayer((p) => ({ ...p, x, y, facing, isMoving }));
            }}
            onInteract={handleInteract}
            onZoneChange={(newZone) => setCurrentZone(newZone)}
            joystickVector={joystickVector}
            actionTriggered={actionTriggered}
            onClearActionTrigger={() => setActionTriggered(false)}
          />

          {/* Low-Occlusion HUD Overlay (<15% viewport occlusion) */}
          <HUD
            player={player}
            stats={stats}
            zone={currentZone}
            hasUnclaimedQuests={hasUnclaimedQuests}
            onOpenInventory={() => setActiveModal('INVENTORY')}
            onOpenMap={() => setActiveModal('MAP')}
            onOpenShop={() => setActiveModal('SHOP')}
            onOpenQuests={() => setActiveModal('QUESTS')}
            onOpenCasino={() => setActiveModal('CASINO')}
            onOpenProfile={() => setActiveModal('PROFILE')}
            onOpenCustomizer={() => setActiveModal('CUSTOMIZER')}
            onOpenPause={() => setActiveModal('PAUSE')}
            isMuted={isMuted}
            onToggleSound={toggleSound}
          />

          {/* Chat Overlay (Bottom-left) */}
          <ChatOverlay
            chatLog={chatLog}
            onSendMessage={handleSendMessage}
            onSendEmote={handleSendEmote}
          />

          {/* Touch Controls (Virtual D-pad & Action button on mobile) */}
          <TouchControls
            onVectorChange={(vec) => setJoystickVector(vec)}
            onActionClick={() => setActionTriggered(true)}
          />

          {/* MODALS */}
          {activeModal === 'FARM' && (
            <FarmModal
              plots={farmPlots}
              seedsInBag={inventory.filter((it) => it.category === 'seed')}
              playerEnergy={stats.energy}
              onPlantPlot={handlePlantPlot}
              onWaterPlot={handleWaterPlot}
              onHarvestPlot={handleHarvestPlot}
              onWaterAll={handleWaterAll}
              onHarvestAll={handleHarvestAll}
              onFeedAnimals={handleFeedAnimals}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'FISHING' && (
            <FishingModal
              playerEnergy={stats.energy}
              onCatchFish={handleCatchFish}
              onDirectSellFish={handleDirectSellFish}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'CASINO' && (
            <CasinoModal
              playerCoins={stats.coins}
              playerDiamonds={stats.diamonds}
              onBetResult={handleBetResult}
              onSpinWheelResult={handleSpinWheelResult}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'INVENTORY' && (
            <InventoryModal
              items={inventory}
              appearance={player.appearance}
              onEquipItem={handleEquipItem}
              onSellItem={handleSellItem}
              onEatFood={handleEatFood}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'SHOP' && (
            <ShopModal
              playerCoins={stats.coins}
              playerDiamonds={stats.diamonds}
              onBuyItem={handleBuyItem}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'QUESTS' && (
            <QuestsModal
              quests={quests}
              onClaimQuest={handleClaimQuest}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'MAP' && (
            <MapModal
              currentZone={currentZone}
              onSelectZone={(z) => {
                setCurrentZone(z);
                if (z === 'taman') setPlayer((p) => ({ ...p, x: 400, y: 300 }));
                if (z === 'tani') setPlayer((p) => ({ ...p, x: 400, y: 440 }));
                if (z === 'mancing') setPlayer((p) => ({ ...p, x: 100, y: 250 }));
                if (z === 'kasino') setPlayer((p) => ({ ...p, x: 400, y: 440 }));
                if (z === 'rumah') setPlayer((p) => ({ ...p, x: 400, y: 440 }));
              }}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'PROFILE' && (
            <ProfileModal
              player={player}
              stats={stats}
              onUpdateAppearance={(app) => setPlayer((p) => ({ ...p, appearance: app }))}
              onUpdateTitle={(title) => setPlayer((p) => ({ ...p, title }))}
              onOpenCustomizer={() => setActiveModal('CUSTOMIZER')}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'CUSTOMIZER' && (
            <AvatarCustomizerModal
              currentAppearance={player.appearance}
              playerName={player.name}
              onSaveAppearance={(newApp) => {
                setPlayer((p) => ({ ...p, appearance: newApp }));
                updateQuestProgress('quest_5', 1);
              }}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'PAUSE' && (
            <PauseModal
              isMuted={isMuted}
              onToggleSound={toggleSound}
              onResume={() => setActiveModal(null)}
              onResetGame={() => {
                setFarmPlots(INITIAL_PLOTS);
                setInventory(INITIAL_INVENTORY);
                setQuests(INITIAL_QUESTS);
                setStats({
                  level: 1,
                  exp: 40,
                  maxExp: 100,
                  energy: 100,
                  maxEnergy: 100,
                  coins: 350,
                  diamonds: 10,
                  server: 'Venus',
                  farmLevel: 1,
                  fishLevel: 1,
                });
                setActiveModal(null);
                setGameState('TITLE');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
