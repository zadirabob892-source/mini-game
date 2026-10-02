/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Flame, 
  Shield, 
  Sword, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Users, 
  Target, 
  Zap, 
  Droplets, 
  Snowflake, 
  HelpCircle,
  Play
} from 'lucide-react';

// ==========================================
// 1. ЕДИНЫЙ КОНФИГ БАЛАНСА (BALANCE_CONFIG)
// ==========================================
export const BALANCE_CONFIG = {
  arena: {
    radius: 360,
    center: { x: 450, y: 380 },
  },
  player: {
    radius: 22,
    baseSpeed: 3.8,
    baseHp: 100,
    baseStamina: 100,
    staminaRegen: 32, // в секунду
    staminaDelay: 0.45, // задержка перед восстановлением после расхода
    dashSpeed: 14,
    dashDuration: 0.18, // секунды
    dashStaminaCost: 22,
    dashCooldown: 0.75,
    blockStaminaCostPerSec: 10,
    blockStaminaHitCost: 15,
    parryWindowMs: 250, // окно идеального парирования для Защитного стиля
  },
  weapons: {
    katana: {
      id: 'katana',
      name: 'Катана',
      desc: 'Быстрые дуговые взмахи со средним уроном',
      damage: 18,
      reach: 72,
      arc: Math.PI * 0.85, // угол удара в радианах
      speed: 1.25, // множитель скорости атаки
      staminaCost: 14,
      comboLength: 3,
      color: '#e2e8f0',
      trailColor: 'rgba(226, 232, 240, 0.7)',
    },
    claymore: {
      id: 'claymore',
      name: 'Клеймор',
      desc: 'Медленный гигантский двуручник с сокрушительным уроном',
      damage: 38,
      reach: 100,
      arc: Math.PI * 1.15,
      speed: 0.7,
      staminaCost: 28,
      comboLength: 3,
      color: '#94a3b8',
      trailColor: 'rgba(245, 158, 11, 0.7)',
    },
    rapier: {
      id: 'rapier',
      name: 'Рапира',
      desc: 'Длинный колющий выпад вперед с высокой точностью',
      damage: 22,
      reach: 110,
      arc: Math.PI * 0.28,
      speed: 1.4,
      staminaCost: 12,
      comboLength: 3,
      color: '#38bdf8',
      trailColor: 'rgba(56, 189, 248, 0.75)',
    },
    daggers: {
      id: 'daggers',
      name: 'Парные кинжалы',
      desc: 'Сверхбыстрая серия из 4 стремительных режущих ударов',
      damage: 12,
      reach: 55,
      arc: Math.PI * 0.9,
      speed: 1.85,
      staminaCost: 9,
      comboLength: 4,
      color: '#a855f7',
      trailColor: 'rgba(168, 85, 247, 0.75)',
    },
  },
  styles: {
    aggressive: {
      id: 'aggressive',
      name: 'Агрессивный',
      desc: '+25% урона и +15% скорости, но снижена защита блоков',
      damageMod: 1.25,
      speedMod: 1.15,
      defenseMod: 0.75,
      specialDesc: 'Берсерк: яростный рывок с вихревым ударом (Space)',
      specialCooldown: 6,
    },
    defensive: {
      id: 'defensive',
      name: 'Защитный',
      desc: 'Идеальный блок парирует 100% урона и дает +80% контрудар',
      damageMod: 1.0,
      speedMod: 1.0,
      defenseMod: 1.4,
      specialDesc: 'Бастион: силовое поле с отталкиванием и регеном стойкости',
      specialCooldown: 7,
    },
    dancing: {
      id: 'dancing',
      name: 'Танцующий',
      desc: 'Удары продвигают вперед, рывок быстрее перезаряжается',
      damageMod: 1.05,
      speedMod: 1.25,
      defenseMod: 0.9,
      specialDesc: 'Танец клинков: мгновенная вспышка-телепорт за спину врага',
      specialCooldown: 5,
    },
    heavy: {
      id: 'heavy',
      name: 'Тяжёлый',
      desc: 'Пробивает блок врага и отбрасывает его назад',
      damageMod: 1.2,
      speedMod: 0.85,
      defenseMod: 1.2,
      specialDesc: 'Землетрясение: сокрушительный удар в землю с ударной волной',
      specialCooldown: 8,
    },
  },
  modifiers: {
    fire: {
      id: 'fire',
      name: 'Огонь',
      desc: 'Поджигает цель (DoT урон в течение 3 сек)',
      color: '#f97316',
      burnDamagePerTick: 3,
      burnTicks: 5,
    },
    ice: {
      id: 'ice',
      name: 'Лёд',
      desc: 'Замедляет скорость передвижения и атак цели на 40%',
      color: '#38bdf8',
      slowFactor: 0.6,
      slowDuration: 2.5,
    },
    bleed: {
      id: 'bleed',
      name: 'Кровотечение',
      desc: 'Стакает кровотечение; на 3 стаке наносит мощный разрыв',
      color: '#ef4444',
      burstDamage: 24,
    },
    vampirism: {
      id: 'vampirism',
      name: 'Вампиризм',
      desc: 'Похищает 25% нанесенного урона в виде здоровья',
      color: '#ec4899',
      leechPercent: 0.25,
    },
  },
  dummy: {
    radius: 26,
    maxHp: 300,
    counterAttackInterval: 2.8, // интервал ударов в режиме ответа
    attackWindup: 0.8, // время замаха (красный круг предупреждения)
    attackDamage: 20,
    attackReach: 80,
  },
};

// ==========================================
// 2. ЗВУКОВОЙ ДВИЖОК (WEB AUDIO API)
// ==========================================
class SoundSynth {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSwing(pitch = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(260 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(80 * pitch, now + 0.12);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  playClash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Металлический звон (parry/block)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.28);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  playHit(isCrit = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isCrit ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isCrit ? 220 : 150, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);

      gain.gain.setValueAtTime(isCrit ? 0.35 : 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  playDash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  playSpecial() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  playDeath() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [90, 120, 160].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.1);
        gain.gain.setValueAtTime(0.25, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 1.15);
      });
    } catch {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.6);
      });
    } catch {}
  }
}

const audio = new SoundSynth();

// ==========================================
// 3. ТИПЫ
// ==========================================
type WeaponKey = keyof typeof BALANCE_CONFIG.weapons;
type StyleKey = keyof typeof BALANCE_CONFIG.styles;
type ModifierKey = keyof typeof BALANCE_CONFIG.modifiers;

interface BuildState {
  weapon: WeaponKey;
  style: StyleKey;
  modifier: ModifierKey;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  subText?: string;
  color: string;
  alpha: number;
  scale: number;
}

interface PlayerEntity {
  id: string;
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  staminaDelayTimer: number;
  isBlocking: boolean;
  blockTimer: number;
  isDashing: boolean;
  dashTimer: number;
  dashCooldownTimer: number;
  dashDir: { x: number; y: number };
  attackTimer: number;
  attackDuration: number;
  attackComboStep: number;
  comboResetTimer: number;
  hasHitInCurrentAttack: boolean;
  specialCooldownTimer: number;
  counterReady: boolean;
  counterTimer: number;
  burnTicksRemaining: number;
  burnTimer: number;
  slowTimer: number;
  bleedStacks: number;
  build: BuildState;
  isDead: boolean;
  deathTimer: number;
}

interface DummyEntity {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  comboCount: number;
  comboTimer: number;
  lastHitType: string;
  burnTicksRemaining: number;
  burnTimer: number;
  slowTimer: number;
  bleedStacks: number;
  isCounterAttacking: boolean;
  counterCooldownTimer: number;
  windupTimer: number;
  isStriking: boolean;
  strikeTimer: number;
  strikeAngle: number;
  isDead: boolean;
  respawnTimer: number;
}

// Предустановленные билды
const PRESET_BUILDS: { name: string; desc: string; build: BuildState }[] = [
  {
    name: 'Пламенный Самурай',
    desc: 'Катана + Агрессивный + Огонь: стремительный напор и сжигающий урон',
    build: { weapon: 'katana', style: 'aggressive', modifier: 'fire' },
  },
  {
    name: 'Ледяной Бастион',
    desc: 'Клеймор + Защитный + Лёд: непробиваемая защита, контратаки и заморозка',
    build: { weapon: 'claymore', style: 'defensive', modifier: 'ice' },
  },
  {
    name: 'Кровавый Танцор',
    desc: 'Рапира + Танцующий + Кровотечение: мобильность, дистанция и разрывы вен',
    build: { weapon: 'rapier', style: 'dancing', modifier: 'bleed' },
  },
  {
    name: 'Теневой Вампир',
    desc: 'Парные кинжалы + Агрессивный + Вампиризм: вихрь ударов и высасывание жизни',
    build: { weapon: 'daggers', style: 'aggressive', modifier: 'vampirism' },
  },
];

// ==========================================
// 4. ГЛАВНЫЙ КОМПОНЕНТ
// ==========================================
export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Режим: 'training' (с манекеном) или 'duel' (1 на 1 локально)
  const [gameMode, setGameMode] = useState<'training' | 'duel'>('training');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dummyStrikesBack, setDummyStrikesBack] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Счёт дуэли
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  // Экран смерти / победы
  const [deathScreen, setDeathScreen] = useState<{
    show: boolean;
    title: string;
    sub: string;
    color: string;
    type: 'training_player_died' | 'duel_winner';
    winner?: string;
  } | null>(null);

  const deathScreenRef = useRef(deathScreen);
  deathScreenRef.current = deathScreen;

  // Билды для Игрока 1 и Игрока 2
  const [p1Build, setP1Build] = useState<BuildState>({
    weapon: 'katana',
    style: 'aggressive',
    modifier: 'fire',
  });

  const [p2Build, setP2Build] = useState<BuildState>({
    weapon: 'claymore',
    style: 'defensive',
    modifier: 'ice',
  });

  // Текущий редактируемый игрок в настройках
  const [editingPlayer, setEditingPlayer] = useState<1 | 2>(1);

  // Хранилище ссылок на игровое состояние для синхронного 60fps цикла
  const gameStateRef = useRef<{
    p1: PlayerEntity;
    p2: PlayerEntity | null;
    dummy: DummyEntity;
    particles: Particle[];
    floatingTexts: FloatingText[];
    nextTextId: number;
    keys: Record<string, boolean>;
    mouse: { x: number; y: number; leftDown: boolean; rightDown: boolean };
    dummyStrikesBack: boolean;
    lastTime: number;
  }>({
    p1: createPlayer('p1', 320, 380, p1Build),
    p2: null,
    dummy: createDummy(450, 380),
    particles: [],
    floatingTexts: [],
    nextTextId: 1,
    keys: {},
    mouse: { x: 450, y: 380, leftDown: false, rightDown: false },
    dummyStrikesBack: false,
    lastTime: performance.now(),
  });

  function createPlayer(id: string, x: number, y: number, build: BuildState): PlayerEntity {
    return {
      id,
      x,
      y,
      angle: 0,
      vx: 0,
      vy: 0,
      hp: BALANCE_CONFIG.player.baseHp,
      maxHp: BALANCE_CONFIG.player.baseHp,
      stamina: BALANCE_CONFIG.player.baseStamina,
      maxStamina: BALANCE_CONFIG.player.baseStamina,
      staminaDelayTimer: 0,
      isBlocking: false,
      blockTimer: 0,
      isDashing: false,
      dashTimer: 0,
      dashCooldownTimer: 0,
      dashDir: { x: 0, y: 0 },
      attackTimer: 0,
      attackDuration: 0,
      attackComboStep: 0,
      comboResetTimer: 0,
      hasHitInCurrentAttack: false,
      specialCooldownTimer: 0,
      counterReady: false,
      counterTimer: 0,
      burnTicksRemaining: 0,
      burnTimer: 0,
      slowTimer: 0,
      bleedStacks: 0,
      build,
      isDead: false,
      deathTimer: 0,
    };
  }

  function createDummy(x: number, y: number): DummyEntity {
    return {
      x,
      y,
      hp: BALANCE_CONFIG.dummy.maxHp,
      maxHp: BALANCE_CONFIG.dummy.maxHp,
      comboCount: 0,
      comboTimer: 0,
      lastHitType: 'Ожидание',
      burnTicksRemaining: 0,
      burnTimer: 0,
      slowTimer: 0,
      bleedStacks: 0,
      isCounterAttacking: false,
      counterCooldownTimer: 2.0,
      windupTimer: 0,
      isStriking: false,
      strikeTimer: 0,
      strikeAngle: 0,
      isDead: false,
      respawnTimer: 0,
    };
  }

  // Обработка смерти игрока
  function killPlayer(player: PlayerEntity, cause: string) {
    if (player.isDead) return;
    player.isDead = true;
    player.hp = 0;
    player.vx = 0;
    player.vy = 0;
    player.attackTimer = 0;
    player.isBlocking = false;
    player.isDashing = false;

    audio.playDeath();
    spawnParticles(player.x, player.y, '#ef4444', 35, 6);
    spawnParticles(player.x, player.y, '#7f1d1d', 20, 4);
    addFloatingText(player.x, player.y - 45, 'ПОГИБ!', cause, '#ef4444');

    if (gameMode === 'duel') {
      const winnerName = player.id === 'p1' ? 'Игрок 2' : 'Игрок 1';
      if (player.id === 'p1') {
        setP2Score((s) => s + 1);
      } else {
        setP1Score((s) => s + 1);
      }
      audio.playVictory();
      setDeathScreen({
        show: true,
        title: `ПОБЕДА ${winnerName.toUpperCase()}!`,
        sub: `${player.id === 'p1' ? 'Игрок 1' : 'Игрок 2'} пал в бою (${cause})`,
        color: player.id === 'p1' ? '#f43f5e' : '#38bdf8',
        type: 'duel_winner',
        winner: winnerName,
      });
    } else {
      setDeathScreen({
        show: true,
        title: 'ВЫ ПОГИБЛИ',
        sub: `${cause}. Тренировочный манекен оказался сильнее!`,
        color: '#ef4444',
        type: 'training_player_died',
      });
    }
  }

  // Возрождение / следующий раунд
  const handleRespawn = () => {
    const s = gameStateRef.current;
    if (gameMode === 'duel') {
      s.p1.hp = s.p1.maxHp;
      s.p1.stamina = s.p1.maxStamina;
      s.p1.isDead = false;
      s.p1.x = 300;
      s.p1.y = 380;
      s.p1.vx = 0;
      s.p1.vy = 0;
      s.p1.burnTicksRemaining = 0;
      s.p1.slowTimer = 0;
      s.p1.bleedStacks = 0;

      if (s.p2) {
        s.p2.hp = s.p2.maxHp;
        s.p2.stamina = s.p2.maxStamina;
        s.p2.isDead = false;
        s.p2.x = 600;
        s.p2.y = 380;
        s.p2.vx = 0;
        s.p2.vy = 0;
        s.p2.burnTicksRemaining = 0;
        s.p2.slowTimer = 0;
        s.p2.bleedStacks = 0;
      }
      setDeathScreen(null);
      spawnParticles(s.p1.x, s.p1.y, '#38bdf8', 20, 4);
      if (s.p2) spawnParticles(s.p2.x, s.p2.y, '#f43f5e', 20, 4);
      addFloatingText(450, 380, 'НОВЫЙ РАУНД!', 'В бой!', '#f59e0b');
    } else {
      s.p1.hp = s.p1.maxHp;
      s.p1.stamina = s.p1.maxStamina;
      s.p1.isDead = false;
      s.p1.x = 280;
      s.p1.y = 380;
      s.p1.vx = 0;
      s.p1.vy = 0;
      s.p1.burnTicksRemaining = 0;
      s.p1.slowTimer = 0;
      s.p1.bleedStacks = 0;
      setDeathScreen(null);
      spawnParticles(s.p1.x, s.p1.y, '#38bdf8', 25, 4);
      addFloatingText(s.p1.x, s.p1.y - 30, 'ВОЗРОЖДЕНИЕ', 'HP восстановлено', '#38bdf8');
    }
  };

  const handleRespawnRef = useRef(handleRespawn);
  handleRespawnRef.current = handleRespawn;

  // Обновление билдов в игровом объекте при их смене
  useEffect(() => {
    gameStateRef.current.p1.build = p1Build;
  }, [p1Build]);

  useEffect(() => {
    if (gameStateRef.current.p2) {
      gameStateRef.current.p2.build = p2Build;
    }
  }, [p2Build]);

  useEffect(() => {
    gameStateRef.current.dummyStrikesBack = dummyStrikesBack;
  }, [dummyStrikesBack]);

  // Переключение режима тренировка / дуэль
  useEffect(() => {
    const s = gameStateRef.current;
    if (gameMode === 'duel') {
      s.p1.x = 300;
      s.p1.y = 380;
      s.p1.hp = s.p1.maxHp;
      s.p1.stamina = s.p1.maxStamina;
      s.p2 = createPlayer('p2', 600, 380, p2Build);
      s.dummyStrikesBack = false;
    } else {
      s.p1.x = 280;
      s.p1.y = 380;
      s.p1.hp = s.p1.maxHp;
      s.p1.stamina = s.p1.maxStamina;
      s.p2 = null;
      s.dummy = createDummy(450, 380);
      s.dummyStrikesBack = dummyStrikesBack;
    }
  }, [gameMode]);

  // Звук
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.enabled = next;
  };

  // Сброс манекена
  const handleResetDummy = () => {
    const s = gameStateRef.current;
    s.dummy = createDummy(450, 380);
    s.dummyStrikesBack = dummyStrikesBack;
    addFloatingText(450, 340, 'СБРОС', 'Манекен восстановлен', '#38bdf8');
  };

  function addFloatingText(x: number, y: number, text: string, subText: string | undefined, color: string) {
    const s = gameStateRef.current;
    s.floatingTexts.push({
      id: s.nextTextId++,
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      text,
      subText,
      color,
      alpha: 1.0,
      scale: 1.0,
    });
  }

  function spawnParticles(x: number, y: number, color: string, count = 10, speed = 3) {
    const s = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.5 + Math.random()) * speed;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        size: 2.5 + Math.random() * 3.5,
        color,
      });
    }
  }

  // ==========================================
  // 5. ИГРОВОЙ ЦИКЛ CANVAS & EVENT LISTENERS
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.code] = true;
      // Предотвращаем прокрутку стрелками / пробелом
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (deathScreenRef.current?.show && (e.code === 'Space' || e.code === 'Enter')) {
        handleRespawnRef.current();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      gameStateRef.current.mouse.x = (e.clientX - rect.left) * scaleX;
      gameStateRef.current.mouse.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) gameStateRef.current.mouse.leftDown = true;
      if (e.button === 2) gameStateRef.current.mouse.rightDown = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) gameStateRef.current.mouse.leftDown = false;
      if (e.button === 2) gameStateRef.current.mouse.rightDown = false;
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);

    // ======================================================
    // ГЛАВНЫЙ ЦИКЛ ОБНОВЛЕНИЯ И ОТРИСОВКИ (60 FPS)
    // ======================================================
    const gameLoop = (currentTime: number) => {
      const state = gameStateRef.current;
      const dt = Math.min((currentTime - state.lastTime) / 1000, 0.05); // защита от лаг-спайков
      state.lastTime = currentTime;

      // 1. Обновление сущностей
      updatePlayer(state.p1, dt, true);
      if (state.p2) {
        updatePlayer(state.p2, dt, false);
      } else {
        updateDummy(state.dummy, dt, state.p1);
      }

      // 2. Проверка коллизий атак
      checkCombatCollisions(dt);

      // 3. Обновление частиц и текста
      updateParticlesAndTexts(dt);

      // 4. Отрисовка арены, игроков, эффектов
      render(ctx);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // ----------------------------------------------------------------
  // ЛОГИКА ОБНОВЛЕНИЯ ИГРОКА (ДВИЖЕНИЕ, СТАМИНА, АТАКА, БЛОК, РЫВОК)
  // ----------------------------------------------------------------
  function updatePlayer(player: PlayerEntity, dt: number, isP1: boolean) {
    if (player.isDead) {
      player.vx = 0;
      player.vy = 0;
      return;
    }

    const keys = gameStateRef.current.keys;
    const mouse = gameStateRef.current.mouse;
    const wConf = BALANCE_CONFIG.weapons[player.build.weapon];
    const sConf = BALANCE_CONFIG.styles[player.build.style];

    // Ограничение по арене
    const arena = BALANCE_CONFIG.arena;

    // Таймеры баффов / дебаффов
    if (player.staminaDelayTimer > 0) player.staminaDelayTimer -= dt;
    else if (player.stamina < player.maxStamina && !player.isBlocking) {
      player.stamina = Math.min(player.maxStamina, player.stamina + BALANCE_CONFIG.player.staminaRegen * dt);
    }

    if (player.dashCooldownTimer > 0) player.dashCooldownTimer -= dt;
    if (player.specialCooldownTimer > 0) player.specialCooldownTimer -= dt;
    if (player.counterTimer > 0) {
      player.counterTimer -= dt;
      if (player.counterTimer <= 0) player.counterReady = false;
    }

    // Замедление ото льда
    const speedMult = player.slowTimer > 0 ? BALANCE_CONFIG.modifiers.ice.slowFactor : 1.0;
    if (player.slowTimer > 0) player.slowTimer -= dt;

    // Горение
    if (player.burnTicksRemaining > 0) {
      player.burnTimer -= dt;
      if (player.burnTimer <= 0) {
        player.burnTimer = 0.6;
        player.burnTicksRemaining--;
        player.hp = Math.max(0, player.hp - BALANCE_CONFIG.modifiers.fire.burnDamagePerTick);
        addFloatingText(player.x, player.y - 20, `-${BALANCE_CONFIG.modifiers.fire.burnDamagePerTick}`, 'Горение', '#f97316');
        spawnParticles(player.x, player.y, '#f97316', 5, 2);
        if (player.hp <= 0 && !player.isDead) {
          killPlayer(player, 'Сгорел в пламени');
          return;
        }
      }
    }

    // Комбо сброс если игрок долго не бил
    if (player.comboResetTimer > 0) {
      player.comboResetTimer -= dt;
      if (player.comboResetTimer <= 0) {
        player.attackComboStep = 0;
      }
    }

    // Управление для P1 (WASD + мышь) и P2 (Стрелки + клавиши)
    let moveX = 0;
    let moveY = 0;
    let wantAttack = false;
    let wantBlock = false;
    let wantDash = false;
    let wantSpecial = false;

    if (isP1) {
      if (keys['KeyW']) moveY -= 1;
      if (keys['KeyS']) moveY += 1;
      if (keys['KeyA']) moveX -= 1;
      if (keys['KeyD']) moveX += 1;

      // Угол поворота к мыши
      player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

      wantAttack = mouse.leftDown || keys['KeyJ'];
      wantBlock = mouse.rightDown || keys['KeyK'];
      wantDash = keys['ShiftLeft'] || keys['Space'] === false && keys['KeyL'];
      wantSpecial = keys['Space'] || keys['KeyI'];
    } else {
      // Игрок 2 (Стрелки + Numpad/Keys)
      if (keys['ArrowUp']) moveY -= 1;
      if (keys['ArrowDown']) moveY += 1;
      if (keys['ArrowLeft']) moveX -= 1;
      if (keys['ArrowRight']) moveX += 1;

      // Поворот P2 по направлению к P1
      const p1 = gameStateRef.current.p1;
      player.angle = Math.atan2(p1.y - player.y, p1.x - player.x);

      wantAttack = keys['Numpad1'] || keys['KeyU'] || keys['KeyN'];
      wantBlock = keys['Numpad2'] || keys['KeyO'] || keys['KeyM'];
      wantDash = keys['Numpad3'] || keys['KeyP'] || keys['ControlRight'];
      wantSpecial = keys['Numpad0'] || keys['Enter'] || keys['KeyH'];
    }

    // 1. РЫВОК / УКЛОН
    if (wantDash && !player.isDashing && player.dashCooldownTimer <= 0 && player.stamina >= BALANCE_CONFIG.player.dashStaminaCost) {
      player.isDashing = true;
      player.dashTimer = BALANCE_CONFIG.player.dashDuration;
      // Для стиля Танцующий кулдаун рывка на 35% меньше
      player.dashCooldownTimer = player.build.style === 'dancing' ? BALANCE_CONFIG.player.dashCooldown * 0.65 : BALANCE_CONFIG.player.dashCooldown;
      player.stamina -= BALANCE_CONFIG.player.dashStaminaCost;
      player.staminaDelayTimer = BALANCE_CONFIG.player.staminaDelay;

      // Направление рывка (по движению или по взгляду)
      const len = Math.hypot(moveX, moveY);
      if (len > 0) {
        player.dashDir = { x: moveX / len, y: moveY / len };
      } else {
        player.dashDir = { x: Math.cos(player.angle), y: Math.sin(player.angle) };
      }

      audio.playDash();
      spawnParticles(player.x, player.y, '#94a3b8', 8, 2);
    }

    if (player.isDashing) {
      player.dashTimer -= dt;
      player.vx = player.dashDir.x * BALANCE_CONFIG.player.dashSpeed;
      player.vy = player.dashDir.y * BALANCE_CONFIG.player.dashSpeed;
      if (player.dashTimer <= 0) {
        player.isDashing = false;
        player.vx = 0;
        player.vy = 0;
      }
    } else {
      // Обычное передвижение
      const len = Math.hypot(moveX, moveY);
      const curSpeed = BALANCE_CONFIG.player.baseSpeed * (player.isBlocking ? 0.45 : 1.0) * sConf.speedMod * speedMult;
      if (len > 0) {
        player.vx = (moveX / len) * curSpeed;
        player.vy = (moveY / len) * curSpeed;
      } else {
        player.vx = 0;
        player.vy = 0;
      }
    }

    // 2. БЛОКИРОВАНИЕ
    if (wantBlock && !player.isDashing && player.attackTimer <= 0 && player.stamina > 5) {
      if (!player.isBlocking) {
        player.isBlocking = true;
        player.blockTimer = 0; // начало блока для парирования
      }
      player.blockTimer += dt;
      player.stamina = Math.max(0, player.stamina - BALANCE_CONFIG.player.blockStaminaCostPerSec * dt);
      player.staminaDelayTimer = BALANCE_CONFIG.player.staminaDelay;
    } else {
      player.isBlocking = false;
      player.blockTimer = 0;
    }

    // 3. АТАКА
    if (player.attackTimer > 0) {
      player.attackTimer -= dt;
      // В танцующем стиле атака немного проталкивает вперед
      if (player.build.style === 'dancing' && player.attackTimer > player.attackDuration * 0.4) {
        player.vx += Math.cos(player.angle) * 1.5;
        player.vy += Math.sin(player.angle) * 1.5;
      }
    } else if (wantAttack && !player.isBlocking && !player.isDashing && player.stamina >= wConf.staminaCost) {
      // Инициация удара комбо-цепочки
      player.attackComboStep = (player.attackComboStep % wConf.comboLength) + 1;
      const attackSpeed = wConf.speed * sConf.speedMod * speedMult;
      player.attackDuration = 0.38 / attackSpeed;
      player.attackTimer = player.attackDuration;
      player.hasHitInCurrentAttack = false;
      player.comboResetTimer = 1.2; // окно для следующего комбо

      player.stamina -= wConf.staminaCost;
      player.staminaDelayTimer = BALANCE_CONFIG.player.staminaDelay;

      audio.playSwing(wConf.speed * (1 + player.attackComboStep * 0.1));
    }

    // 4. ОСОБОЕ УМЕНИЕ (SPACE / SPECIAL)
    if (wantSpecial && player.specialCooldownTimer <= 0 && player.stamina >= 25) {
      executeSpecial(player);
    }

    // Применение перемещения и удержание внутри круглой арены
    player.x += player.vx;
    player.y += player.vy;

    const dx = player.x - arena.center.x;
    const dy = player.y - arena.center.y;
    const distToCenter = Math.hypot(dx, dy);
    const maxRadius = arena.radius - BALANCE_CONFIG.player.radius;
    if (distToCenter > maxRadius) {
      player.x = arena.center.x + (dx / distToCenter) * maxRadius;
      player.y = arena.center.y + (dy / distToCenter) * maxRadius;
    }
  }

  // ----------------------------------------------------------------
  // ВЫПОЛНЕНИЕ ОСОБОГО УМЕНИЯ В ЗАВИСИМОСТИ ОТ СТИЛЯ
  // ----------------------------------------------------------------
  function executeSpecial(player: PlayerEntity) {
    const sConf = BALANCE_CONFIG.styles[player.build.style];
    player.specialCooldownTimer = sConf.specialCooldown;
    player.stamina -= 25;
    player.staminaDelayTimer = BALANCE_CONFIG.player.staminaDelay;
    audio.playSpecial();

    if (player.build.style === 'aggressive') {
      // Берсерк: мощный рывок с гигантским рассекающим ударом
      player.vx = Math.cos(player.angle) * 16;
      player.vy = Math.sin(player.angle) * 16;
      player.attackComboStep = 3;
      player.attackDuration = 0.3;
      player.attackTimer = 0.3;
      player.hasHitInCurrentAttack = false;
      addFloatingText(player.x, player.y - 25, 'БЕРСЕРК!', 'Вихревой рывок', '#f97316');
      spawnParticles(player.x, player.y, '#f97316', 20, 5);
    } else if (player.build.style === 'defensive') {
      // Бастион: силовое поле, мгновенный реген выносливости и контрудар готов
      player.stamina = player.maxStamina;
      player.counterReady = true;
      player.counterTimer = 4.0;
      addFloatingText(player.x, player.y - 25, 'БАСТИОН!', 'Контрудар заряжен', '#38bdf8');
      spawnParticles(player.x, player.y, '#38bdf8', 25, 4);
    } else if (player.build.style === 'dancing') {
      // Вспышка клинков: мгновенный телепорт вперед на 140px с вихревым ударом
      player.x += Math.cos(player.angle) * 130;
      player.y += Math.sin(player.angle) * 130;
      player.attackComboStep = 4;
      player.attackDuration = 0.25;
      player.attackTimer = 0.25;
      player.hasHitInCurrentAttack = false;
      addFloatingText(player.x, player.y - 25, 'ТАНЕЦ!', 'Мгновенный выпад', '#a855f7');
      spawnParticles(player.x, player.y, '#c084fc', 20, 6);
    } else if (player.build.style === 'heavy') {
      // Землетрясение: волна по области
      addFloatingText(player.x, player.y - 25, 'СОКРУШЕНИЕ!', 'Ударная волна', '#fbbf24');
      spawnParticles(player.x, player.y, '#f59e0b', 30, 7);
      triggerAoeSlam(player);
    }
  }

  function triggerAoeSlam(player: PlayerEntity) {
    const s = gameStateRef.current;
    const aoeRadius = 140;
    const targets: (PlayerEntity | DummyEntity)[] = s.p2 ? [s.p2] : [s.dummy];

    targets.forEach((target) => {
      const dist = Math.hypot(target.x - player.x, target.y - player.y);
      if (dist < aoeRadius) {
        const damage = 35;
        target.hp = Math.max(0, target.hp - damage);
        addFloatingText(target.x, target.y - 30, `-${damage}`, 'Землетрясение', '#fbbf24');
        audio.playHit(true);
        // Отталкивание
        const ang = Math.atan2(target.y - player.y, target.x - player.x);
        target.x += Math.cos(ang) * 45;
        target.y += Math.sin(ang) * 45;

        if (target.hp <= 0) {
          if ('id' in target && !(target as PlayerEntity).isDead) {
            killPlayer(target as PlayerEntity, 'Ударная волна Землетрясения');
          } else if (!('id' in target) && !(target as DummyEntity).isDead) {
            (target as DummyEntity).isDead = true;
            (target as DummyEntity).respawnTimer = 2.0;
            spawnParticles(target.x, target.y, '#b45309', 25, 5);
            addFloatingText(target.x, target.y - 40, 'МАНЕКЕН УНИЧТОЖЕН!', undefined, '#22c55e');
          }
        }
      }
    });
  }

  // ----------------------------------------------------------------
  // ОБНОВЛЕНИЕ ТРЕНИРОВОЧНОГО МАНЕКЕНА
  // ----------------------------------------------------------------
  function updateDummy(dummy: DummyEntity, dt: number, player: PlayerEntity) {
    const dConf = BALANCE_CONFIG.dummy;

    // Манекен уничтожен — таймер возрождения
    if (dummy.isDead) {
      dummy.respawnTimer -= dt;
      if (dummy.respawnTimer <= 0) {
        dummy.isDead = false;
        dummy.hp = dummy.maxHp;
        dummy.comboCount = 0;
        dummy.lastHitType = 'Ожидание';
        dummy.burnTicksRemaining = 0;
        dummy.slowTimer = 0;
        dummy.bleedStacks = 0;
        dummy.isStriking = false;
        dummy.windupTimer = 0;
        spawnParticles(dummy.x, dummy.y, '#22c55e', 25, 4);
        addFloatingText(dummy.x, dummy.y - 30, 'МАНЕКЕН ВОЗРОЖДЕН!', undefined, '#22c55e');
      }
      return;
    }

    // Сброс комбо счетчика если долго не бьют
    if (dummy.comboTimer > 0) {
      dummy.comboTimer -= dt;
      if (dummy.comboTimer <= 0) {
        dummy.comboCount = 0;
      }
    }

    // Горение манекена
    if (dummy.burnTicksRemaining > 0) {
      dummy.burnTimer -= dt;
      if (dummy.burnTimer <= 0) {
        dummy.burnTimer = 0.6;
        dummy.burnTicksRemaining--;
        dummy.hp = Math.max(0, dummy.hp - BALANCE_CONFIG.modifiers.fire.burnDamagePerTick);
        addFloatingText(dummy.x, dummy.y - 25, `-${BALANCE_CONFIG.modifiers.fire.burnDamagePerTick}`, 'Горение', '#f97316');
        spawnParticles(dummy.x, dummy.y, '#f97316', 4, 2);
        if (dummy.hp <= 0 && !dummy.isDead) {
          dummy.isDead = true;
          dummy.respawnTimer = 2.0;
          spawnParticles(dummy.x, dummy.y, '#b45309', 25, 5);
          addFloatingText(dummy.x, dummy.y - 40, 'МАНЕКЕН УНИЧТОЖЕН!', 'Возрождение...', '#22c55e');
        }
      }
    }

    if (dummy.slowTimer > 0) dummy.slowTimer -= dt;

    // Режим "Манекен бьёт в ответ"
    if (gameStateRef.current.dummyStrikesBack && !player.isDead) {
      if (!dummy.isStriking && dummy.windupTimer <= 0) {
        dummy.counterCooldownTimer -= dt;
        if (dummy.counterCooldownTimer <= 0) {
          // Начинаем замах в сторону игрока
          dummy.strikeAngle = Math.atan2(player.y - dummy.y, player.x - dummy.x);
          dummy.windupTimer = dConf.attackWindup;
        }
      } else if (dummy.windupTimer > 0) {
        // Замах (телеграфная анимация красного круга)
        dummy.windupTimer -= dt;
        if (dummy.windupTimer <= 0) {
          // Момент удара!
          dummy.isStriking = true;
          dummy.strikeTimer = 0.22;
          audio.playSwing(0.85);

          // Проверка попадания по игроку
          const dist = Math.hypot(player.x - dummy.x, player.y - dummy.y);
          const angleToPlayer = Math.atan2(player.y - dummy.y, player.x - dummy.x);
          let angleDiff = Math.abs(angleToPlayer - dummy.strikeAngle);
          if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

          if (dist < dConf.attackReach + BALANCE_CONFIG.player.radius && angleDiff < Math.PI * 0.45) {
            // Игрок в зоне удара!
            if (player.isDashing) {
              addFloatingText(player.x, player.y - 25, 'УКЛОН', 'Неуязвимость в рывке', '#38bdf8');
            } else if (player.isBlocking) {
              // Проверка парирования (Защитный стиль)
              const isParry = player.build.style === 'defensive' && player.blockTimer < (BALANCE_CONFIG.player.parryWindowMs / 1000);
              if (isParry) {
                audio.playClash();
                player.counterReady = true;
                player.counterTimer = 3.0;
                addFloatingText(player.x, player.y - 30, 'ПАРИРОВАНИЕ!', 'Контрудар +80% урона', '#fbbf24');
                spawnParticles(player.x, player.y, '#fbbf24', 16, 4);
              } else {
                audio.playClash();
                const blockedDmg = Math.round(dConf.attackDamage * 0.2);
                player.hp = Math.max(0, player.hp - blockedDmg);
                player.stamina = Math.max(0, player.stamina - BALANCE_CONFIG.player.blockStaminaHitCost);
                addFloatingText(player.x, player.y - 25, `БЛОК (-${blockedDmg})`, undefined, '#94a3b8');
                spawnParticles(player.x, player.y, '#e2e8f0', 8, 3);
                if (player.hp <= 0 && !player.isDead) {
                  killPlayer(player, 'Сокрушительный удар сквозь блок');
                }
              }
            } else {
              // Чистое попадание
              audio.playHit();
              player.hp = Math.max(0, player.hp - dConf.attackDamage);
              addFloatingText(player.x, player.y - 25, `-${dConf.attackDamage}`, 'Удар манекена', '#ef4444');
              spawnParticles(player.x, player.y, '#ef4444', 14, 4);
              // Легкое отталкивание
              player.x += Math.cos(dummy.strikeAngle) * 25;
              player.y += Math.sin(dummy.strikeAngle) * 25;
              if (player.hp <= 0 && !player.isDead) {
                killPlayer(player, 'Удар тренировочного манекена');
              }
            }
          }
        }
      } else if (dummy.isStriking) {
        dummy.strikeTimer -= dt;
        if (dummy.strikeTimer <= 0) {
          dummy.isStriking = false;
          dummy.counterCooldownTimer = dConf.counterAttackInterval;
        }
      }
    }
  }

  // ----------------------------------------------------------------
  // ПРОВЕРКА ПОПАДАНИЙ АТАК (COMBAT COLLISIONS & MODIFIERS)
  // ----------------------------------------------------------------
  function checkCombatCollisions(_dt: number) {
    const s = gameStateRef.current;
    
    // 1. Атака P1
    if (s.p1.attackTimer > 0 && !s.p1.hasHitInCurrentAttack) {
      const progress = 1 - (s.p1.attackTimer / s.p1.attackDuration);
      // Удар наносится в активном окне взмаха (от 20% до 80%)
      if (progress >= 0.2 && progress <= 0.85) {
        if (s.p2) {
          checkPlayerAttackTarget(s.p1, s.p2);
        } else {
          checkPlayerAttackDummy(s.p1, s.dummy);
        }
      }
    }

    // 2. Атака P2 (в режиме дуэли)
    if (s.p2 && s.p2.attackTimer > 0 && !s.p2.hasHitInCurrentAttack) {
      const progress = 1 - (s.p2.attackTimer / s.p2.attackDuration);
      if (progress >= 0.2 && progress <= 0.85) {
        checkPlayerAttackTarget(s.p2, s.p1);
      }
    }
  }

  function checkPlayerAttackDummy(player: PlayerEntity, dummy: DummyEntity) {
    const wConf = BALANCE_CONFIG.weapons[player.build.weapon];
    const sConf = BALANCE_CONFIG.styles[player.build.style];

    const dist = Math.hypot(dummy.x - player.x, dummy.y - player.y);
    const maxReach = wConf.reach + BALANCE_CONFIG.dummy.radius;

    if (dist <= maxReach) {
      const angleToDummy = Math.atan2(dummy.y - player.y, dummy.x - player.x);
      let angleDiff = Math.abs(angleToDummy - player.angle);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

      if (angleDiff <= wConf.arc / 2) {
        // Успешное попадание!
        player.hasHitInCurrentAttack = true;
        dummy.comboCount++;
        dummy.comboTimer = 2.0;

        // Расчет урона
        let baseDmg = wConf.damage * sConf.damageMod;
        // Множитель комбо шага (финишный удар комбо бьет больнее)
        const isFinisher = player.attackComboStep >= wConf.comboLength;
        if (isFinisher) baseDmg *= 1.4;

        let hitTypeName = `Комбо #${player.attackComboStep}`;
        if (isFinisher) hitTypeName = 'ФИНИШЕР!';

        // Проверка контрудара
        if (player.counterReady) {
          baseDmg *= 1.8;
          hitTypeName = 'КОНТРУДАР (+80%)';
          player.counterReady = false;
        }

        // Проверка стиля "Тяжёлый"
        if (player.build.style === 'heavy') {
          hitTypeName += ' [Тяжёлый]';
        }

        const finalDamage = Math.round(baseDmg);
        dummy.hp = Math.max(0, dummy.hp - finalDamage);
        dummy.lastHitType = hitTypeName;

        if (dummy.hp <= 0 && !dummy.isDead) {
          dummy.isDead = true;
          dummy.respawnTimer = 2.0;
          audio.playHit(true);
          spawnParticles(dummy.x, dummy.y, '#b45309', 30, 6);
          spawnParticles(dummy.x, dummy.y, '#f59e0b', 20, 5);
          addFloatingText(dummy.x, dummy.y - 40, 'МАНЕКЕН УНИЧТОЖЕН!', 'Возрождение через 2с...', '#22c55e');
        }

        // Звук
        audio.playHit(isFinisher);

        // Применение модификатора
        applyModifierEffects(player, dummy, finalDamage);

        // Всплывающий урон
        addFloatingText(
          dummy.x, 
          dummy.y - 30, 
          `-${finalDamage}`, 
          `${hitTypeName} (x${dummy.comboCount})`, 
          wConf.color
        );

        // Частицы удара
        spawnParticles(
          (player.x + dummy.x) / 2, 
          (player.y + dummy.y) / 2, 
          BALANCE_CONFIG.modifiers[player.build.modifier].color, 
          12, 
          4
        );
      }
    }
  }

  function checkPlayerAttackTarget(attacker: PlayerEntity, defender: PlayerEntity) {
    if (defender.isDead) return;

    const wConf = BALANCE_CONFIG.weapons[attacker.build.weapon];
    const sConf = BALANCE_CONFIG.styles[attacker.build.style];

    const dist = Math.hypot(defender.x - attacker.x, defender.y - attacker.y);
    const maxReach = wConf.reach + BALANCE_CONFIG.player.radius;

    if (dist <= maxReach) {
      const angleToDef = Math.atan2(defender.y - attacker.y, defender.x - attacker.x);
      let angleDiff = Math.abs(angleToDef - attacker.angle);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

      if (angleDiff <= wConf.arc / 2) {
        attacker.hasHitInCurrentAttack = true;

        if (defender.isDashing) {
          addFloatingText(defender.x, defender.y - 25, 'ПРОМАХ', 'Уворот в рывке', '#94a3b8');
          return;
        }

        let baseDmg = wConf.damage * sConf.damageMod;
        const isFinisher = attacker.attackComboStep >= wConf.comboLength;
        if (isFinisher) baseDmg *= 1.4;

        if (attacker.counterReady) {
          baseDmg *= 1.8;
          attacker.counterReady = false;
        }

        // Защита и блокирование
        if (defender.isBlocking) {
          const isParry = defender.build.style === 'defensive' && defender.blockTimer < (BALANCE_CONFIG.player.parryWindowMs / 1000);
          
          if (isParry) {
            audio.playClash();
            defender.counterReady = true;
            defender.counterTimer = 3.0;
            attacker.attackTimer = 0; // стаггер атакующего
            addFloatingText(defender.x, defender.y - 30, 'ПАРИРОВАНИЕ!', 'Контрудар готов!', '#fbbf24');
            spawnParticles(defender.x, defender.y, '#fbbf24', 18, 5);
            return;
          }

          // Тяжёлый стиль пробивает блок!
          if (attacker.build.style === 'heavy') {
            audio.playHit(true);
            defender.isBlocking = false;
            defender.stamina = 0;
            const dmg = Math.round(baseDmg * 0.9);
            defender.hp = Math.max(0, defender.hp - dmg);
            addFloatingText(defender.x, defender.y - 30, `-${dmg}`, 'ПРОБИТИЕ БЛОКА!', '#f59e0b');
            spawnParticles(defender.x, defender.y, '#f59e0b', 16, 4);
            if (defender.hp <= 0 && !defender.isDead) {
              killPlayer(defender, `Пробит блок ударом ${attacker.id === 'p1' ? 'Игрока 1' : 'Игрока 2'}`);
            }
            return;
          }

          // Обычный блок
          audio.playClash();
          const blockedDamage = Math.round(baseDmg * 0.2);
          defender.hp = Math.max(0, defender.hp - blockedDamage);
          defender.stamina = Math.max(0, defender.stamina - BALANCE_CONFIG.player.blockStaminaHitCost);
          addFloatingText(defender.x, defender.y - 25, `БЛОК (-${blockedDamage})`, undefined, '#94a3b8');
          spawnParticles(defender.x, defender.y, '#e2e8f0', 8, 3);
          if (defender.hp <= 0 && !defender.isDead) {
            killPlayer(defender, 'Сражен через блок');
          }
          return;
        }

        // Чистое попадание
        const finalDamage = Math.round(baseDmg);
        defender.hp = Math.max(0, defender.hp - finalDamage);
        audio.playHit(isFinisher);

        applyModifierEffects(attacker, defender, finalDamage);
        addFloatingText(defender.x, defender.y - 25, `-${finalDamage}`, undefined, wConf.color);
        spawnParticles(defender.x, defender.y, BALANCE_CONFIG.modifiers[attacker.build.modifier].color, 14, 4);

        if (defender.hp <= 0 && !defender.isDead) {
          killPlayer(defender, `Сражен ударом ${attacker.id === 'p1' ? 'Игрока 1' : 'Игрока 2'}`);
          return;
        }

        // Отбрасывание
        defender.x += Math.cos(attacker.angle) * (attacker.build.style === 'heavy' ? 35 : 15);
        defender.y += Math.sin(attacker.angle) * (attacker.build.style === 'heavy' ? 35 : 15);
      }
    }
  }

  function applyModifierEffects(attacker: PlayerEntity, target: DummyEntity | PlayerEntity, damageDealt: number) {
    const mod = attacker.build.modifier;

    if (mod === 'fire') {
      target.burnTicksRemaining = BALANCE_CONFIG.modifiers.fire.burnTicks;
      target.burnTimer = 0.5;
    } else if (mod === 'ice') {
      target.slowTimer = BALANCE_CONFIG.modifiers.ice.slowDuration;
    } else if (mod === 'bleed') {
      target.bleedStacks++;
      if (target.bleedStacks >= 3) {
        target.bleedStacks = 0;
        const burst = BALANCE_CONFIG.modifiers.bleed.burstDamage;
        target.hp = Math.max(0, target.hp - burst);
        addFloatingText(target.x, target.y - 45, `-${burst}`, 'РАЗРЫВ КРОВИ!', '#ef4444');
        spawnParticles(target.x, target.y, '#dc2626', 20, 5);
        if (target.hp <= 0) {
          if ('id' in target && !(target as PlayerEntity).isDead) {
            killPlayer(target as PlayerEntity, 'Кровавый разрыв');
          } else if (!('id' in target) && !(target as DummyEntity).isDead) {
            (target as DummyEntity).isDead = true;
            (target as DummyEntity).respawnTimer = 2.0;
            spawnParticles(target.x, target.y, '#b45309', 25, 5);
            addFloatingText(target.x, target.y - 40, 'МАНЕКЕН УНИЧТОЖЕН!', undefined, '#22c55e');
          }
        }
      }
    } else if (mod === 'vampirism') {
      const heal = Math.round(damageDealt * BALANCE_CONFIG.modifiers.vampirism.leechPercent);
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
      addFloatingText(attacker.x, attacker.y - 35, `+${heal} HP`, 'Вампиризм', '#ec4899');
      spawnParticles(attacker.x, attacker.y, '#ec4899', 8, 2);
    }
  }

  // ----------------------------------------------------------------
  // ОБНОВЛЕНИЕ ЧАСТИЦ И ТЕКСТОВ
  // ----------------------------------------------------------------
  function updateParticlesAndTexts(dt: number) {
    const s = gameStateRef.current;

    // Частицы
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        s.particles.splice(i, 1);
      }
    }

    // Тексты урона
    for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
      const t = s.floatingTexts[i];
      t.y -= 38 * dt;
      t.alpha -= 1.1 * dt;
      if (t.alpha <= 0) {
        s.floatingTexts.splice(i, 1);
      }
    }
  }

  // ----------------------------------------------------------------
  // 6. ОТРИСОВКА (RENDER CANVAS)
  // ----------------------------------------------------------------
  function render(ctx: CanvasRenderingContext2D) {
    const s = gameStateRef.current;
    const arena = BALANCE_CONFIG.arena;

    // Очистка холста
    ctx.clearRect(0, 0, 900, 760);

    // 1. Фон арены
    ctx.save();
    // Внешнее темное пространство
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, 900, 760);

    // Круглая каменная арена
    ctx.beginPath();
    ctx.arc(arena.center.x, arena.center.y, arena.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#17171d';
    ctx.fill();

    // Внутренний каменный круг
    ctx.beginPath();
    ctx.arc(arena.center.x, arena.center.y, arena.radius * 0.65, 0, Math.PI * 2);
    ctx.strokeStyle = '#262633';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Рунический крест и узоры на полу
    ctx.strokeStyle = '#222230';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arena.center.x - arena.radius + 20, arena.center.y);
    ctx.lineTo(arena.center.x + arena.radius - 20, arena.center.y);
    ctx.moveTo(arena.center.x, arena.center.y - arena.radius + 20);
    ctx.lineTo(arena.center.x, arena.center.y + arena.radius - 20);
    ctx.stroke();

    // Граница арены (массивный каменный бордюр со свечением)
    ctx.beginPath();
    ctx.arc(arena.center.x, arena.center.y, arena.radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#3b4252';
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 2. Отрисовка манекена (в режиме тренировки)
    if (!s.p2) {
      renderDummy(ctx, s.dummy);
    }

    // 3. Отрисовка Игрока 1 и Игрока 2
    renderPlayer(ctx, s.p1, '#38bdf8', 'Игрок 1');
    if (s.p2) {
      renderPlayer(ctx, s.p2, '#f43f5e', 'Игрок 2');
    }

    // 4. Отрисовка частиц
    for (const p of s.particles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size * (p.life / p.maxLife)), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fill();
      ctx.restore();
    }

    // 5. Отрисовка всплывающего урона и надписей
    for (const t of s.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.textAlign = 'center';

      // Основной урон
      ctx.font = 'bold 20px "Cinzel", Rajdhani, sans-serif';
      ctx.fillStyle = t.color;
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(t.text, t.x, t.y);

      // Подпись (тип удара)
      if (t.subText) {
        ctx.font = '600 12px Rajdhani, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(t.subText, t.x, t.y - 18);
      }
      ctx.restore();
    }
  }

  // ----------------------------------------------------------------
  // ОТРИСОВКА МАНЕКЕНА С ХП-БАРОМ И ИНДИКАТОРАМИ
  // ----------------------------------------------------------------
  function renderDummy(ctx: CanvasRenderingContext2D, dummy: DummyEntity) {
    const dConf = BALANCE_CONFIG.dummy;

    if (dummy.isDead) {
      ctx.save();
      ctx.translate(dummy.x, dummy.y);
      // Разрушенный деревянный пень
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-14, -8, 28, 16);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.strokeRect(-14, -8, 28, 16);

      // Щепки
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -8); ctx.lineTo(-15, -20);
      ctx.moveTo(4, -8); ctx.lineTo(10, -22);
      ctx.moveTo(10, 8); ctx.lineTo(18, 18);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.font = 'bold 13px Rajdhani, sans-serif';
      ctx.fillStyle = '#22c55e';
      ctx.textAlign = 'center';
      ctx.fillText(`ВОЗРОЖДЕНИЕ: ${Math.max(0, dummy.respawnTimer).toFixed(1)}с`, dummy.x, dummy.y - 32);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(dummy.x, dummy.y);

    // Телеграфная индикация замаха удара в ответ (красный конус/круг)
    if (dummy.windupTimer > 0) {
      const chargeRatio = 1 - (dummy.windupTimer / dConf.attackWindup);
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, dConf.attackReach * chargeRatio, dummy.strikeAngle - Math.PI * 0.45, dummy.strikeAngle + Math.PI * 0.45);
      ctx.lineTo(0, 0);
      ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + chargeRatio * 0.35})`;
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Дуга удара манекена
    if (dummy.isStriking) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, dConf.attackReach, dummy.strikeAngle - Math.PI * 0.45, dummy.strikeAngle + Math.PI * 0.45);
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();
    }

    // Тень под манекеном
    ctx.beginPath();
    ctx.ellipse(0, 16, 24, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Деревянная база-стойка
    ctx.beginPath();
    ctx.arc(0, 0, dConf.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Соломенное/льняное тело
    ctx.beginPath();
    ctx.arc(0, 0, dConf.radius - 6, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.fill();

    // Перекрестье мишени на груди
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();

    // Эффект горения/льда на манекене
    if (dummy.burnTicksRemaining > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, dConf.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (dummy.slowTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, dConf.radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();

    // Шкала HP манекена над головой
    const barW = 84;
    const barH = 10;
    const barX = dummy.x - barW / 2;
    const barY = dummy.y - 48;

    ctx.save();
    // Фон полоски
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Заполнение HP
    const hpRatio = Math.max(0, dummy.hp / dummy.maxHp);
    ctx.fillStyle = hpRatio > 0.4 ? '#22c55e' : hpRatio > 0.2 ? '#eab308' : '#ef4444';
    ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpRatio, barH - 2);

    // Текст HP
    ctx.font = 'bold 10px Rajdhani, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${dummy.hp} / ${dummy.maxHp}`, dummy.x, barY + 9);

    // Название манекена и комбо
    ctx.font = '600 12px Rajdhani, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('ТРЕНИРОВОЧНЫЙ МАНЕКЕН', dummy.x, barY - 6);

    // Комбо счетчик под манекеном
    if (dummy.comboCount > 0) {
      ctx.font = 'bold 14px Rajdhani, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`КОМБО: ${dummy.comboCount}x`, dummy.x, dummy.y + 45);
      ctx.font = '500 11px Rajdhani, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(dummy.lastHitType, dummy.x, dummy.y + 60);
    }
    ctx.restore();
  }

  // ----------------------------------------------------------------
  // ОТРИСОВКА ИГРОКА, ОРУЖИЯ, ВЗМАХОВ И БЛОКОВ
  // ----------------------------------------------------------------
  function renderPlayer(ctx: CanvasRenderingContext2D, p: PlayerEntity, mainColor: string, label: string) {
    if (p.isDead) {
      ctx.save();
      ctx.translate(p.x, p.y);

      // Тень падшего
      ctx.beginPath();
      ctx.ellipse(0, 6, 22, 11, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      // Упавшее тело (повернутое на бок)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 11, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Выпавший из руки меч
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(12, 10);
      ctx.lineTo(34, 20);
      ctx.stroke();

      ctx.restore();

      // Бейдж МЁРТВ над персонажем
      ctx.save();
      ctx.font = 'bold 12px Rajdhani, sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText(`${label} (ПАЛ В БОЮ)`, p.x, p.y - 28);
      ctx.restore();
      return;
    }

    const wConf = BALANCE_CONFIG.weapons[p.build.weapon];
    const sConf = BALANCE_CONFIG.styles[p.build.style];

    ctx.save();
    ctx.translate(p.x, p.y);

    // 1. Анимация удара (дуговой шлейф / клинок)
    if (p.attackTimer > 0) {
      const progress = 1 - (p.attackTimer / p.attackDuration);
      renderWeaponSwing(ctx, p, wConf, progress);
    }

    // 2. Силовое поле блока / парирования
    if (p.isBlocking) {
      ctx.save();
      const isParry = p.build.style === 'defensive' && p.blockTimer < (BALANCE_CONFIG.player.parryWindowMs / 1000);
      ctx.beginPath();
      // Полукруг щита перед лицом
      ctx.arc(0, 0, BALANCE_CONFIG.player.radius + 14, p.angle - Math.PI * 0.45, p.angle + Math.PI * 0.45);
      ctx.strokeStyle = isParry ? '#fbbf24' : '#38bdf8';
      ctx.lineWidth = isParry ? 6 : 4;
      ctx.shadowColor = isParry ? '#fbbf24' : '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Тень игрока
    ctx.beginPath();
    ctx.ellipse(0, 14, 18, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 4. Тело персонажа (поворот по направлению взгляда)
    ctx.rotate(p.angle);

    // Руки с оружием
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(14, 12, 6, 0, Math.PI * 2); // правая рука
    ctx.arc(14, -12, 6, 0, Math.PI * 2); // левая рука
    ctx.fill();

    // Оружие в руке (в покое или готовности)
    if (p.attackTimer <= 0) {
      renderIdleWeapon(ctx, p.build.weapon, wConf.color);
    }

    // Торс/доспех
    ctx.beginPath();
    ctx.arc(0, 0, BALANCE_CONFIG.player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Шлем/визор (указатель направления лица)
    ctx.beginPath();
    ctx.arc(7, 0, 8, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = mainColor;
    ctx.fill();

    // Индикатор готовности контрудара
    if (p.counterReady) {
      ctx.beginPath();
      ctx.arc(0, 0, BALANCE_CONFIG.player.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();

    // 5. Полоски HP и Стамины над головой
    renderPlayerHud(ctx, p, label);
  }

  function renderIdleWeapon(ctx: CanvasRenderingContext2D, weapon: WeaponKey, color: string) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (weapon === 'katana') {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, 12);
      ctx.quadraticCurveTo(34, 10, 52, 2);
      ctx.stroke();
    } else if (weapon === 'claymore') {
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(14, 10);
      ctx.lineTo(65, 0);
      ctx.stroke();
      // Гарда
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(22, -10);
      ctx.lineTo(22, 18);
      ctx.stroke();
    } else if (weapon === 'rapier') {
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(14, 8);
      ctx.lineTo(68, 0);
      ctx.stroke();
    } else if (weapon === 'daggers') {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, 12);
      ctx.lineTo(36, 16);
      ctx.moveTo(14, -12);
      ctx.lineTo(36, -16);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderWeaponSwing(
    ctx: CanvasRenderingContext2D, 
    p: PlayerEntity, 
    wConf: typeof BALANCE_CONFIG.weapons.katana, 
    progress: number
  ) {
    ctx.save();
    const startAngle = p.angle - wConf.arc / 2;
    const currentAngle = startAngle + wConf.arc * progress;
    const modColor = BALANCE_CONFIG.modifiers[p.build.modifier].color;

    // Световой шлейф взмаха (Trail arc)
    ctx.beginPath();
    ctx.arc(0, 0, wConf.reach, startAngle, currentAngle);
    ctx.strokeStyle = modColor;
    ctx.lineWidth = p.attackComboStep >= wConf.comboLength ? 8 : 5;
    ctx.shadowColor = modColor;
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Клинок в движении
    const tipX = Math.cos(currentAngle) * wConf.reach;
    const tipY = Math.sin(currentAngle) * wConf.reach;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = wConf.color;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  }

  function renderPlayerHud(ctx: CanvasRenderingContext2D, p: PlayerEntity, label: string) {
    const barW = 68;
    const barH = 6;
    const x = p.x - barW / 2;
    const y = p.y - 42;

    ctx.save();
    // Метка игрока
    ctx.font = '600 11px Rajdhani, sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'center';
    ctx.fillText(label, p.x, y - 10);

    // HP Bar
    ctx.fillStyle = '#111827';
    ctx.fillRect(x, y, barW, barH);
    const hpRatio = Math.max(0, p.hp / p.maxHp);
    ctx.fillStyle = hpRatio > 0.4 ? '#22c55e' : '#ef4444';
    ctx.fillRect(x, y, barW * hpRatio, barH);

    // Stamina Bar
    const stamY = y + barH + 2;
    ctx.fillStyle = '#111827';
    ctx.fillRect(x, stamY, barW, 4);
    const stamRatio = Math.max(0, p.stamina / p.maxStamina);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x, stamY, barW * stamRatio, 4);

    // Значок активного комбо
    if (p.attackComboStep > 0) {
      ctx.font = 'bold 11px Rajdhani, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Удар ${p.attackComboStep}/${BALANCE_CONFIG.weapons[p.build.weapon].comboLength}`, p.x, y + 22);
    }
    ctx.restore();
  }

  // ==========================================
  // 7. ИНТЕРФЕЙС И НАСТРОЙКИ БИЛДА
  // ==========================================
  const currentBuild = editingPlayer === 1 ? p1Build : p2Build;
  const setCurBuild = (updater: (prev: BuildState) => BuildState) => {
    if (editingPlayer === 1) setP1Build(updater);
    else setP2Build(updater);
  };

  const activeWeaponConf = BALANCE_CONFIG.weapons[currentBuild.weapon];
  const activeStyleConf = BALANCE_CONFIG.styles[currentBuild.style];
  const activeModConf = BALANCE_CONFIG.modifiers[currentBuild.modifier];

  return (
    <div className="relative w-full h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none overflow-hidden">
      {/* ВЕРХНЯЯ ПАНЕЛЬ УПРАВЛЕНИЯ (TOP HUD) */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-900/90 px-4 flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-amber-400" />
            <span className="font-bold tracking-wider text-base text-neutral-100 font-['Cinzel']">
              ДУЭЛИ НА МЕЧАХ
            </span>
          </div>

          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
            2D Canvas Arena
          </span>
        </div>

        {/* Центр: Режимы и кнопки управления тренировкой */}
        <div className="flex items-center gap-2">
          {/* Переключение режима */}
          <div className="flex items-center bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700">
            <button
              onClick={() => setGameMode('training')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                gameMode === 'training'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Тренировка
            </button>
            <button
              onClick={() => setGameMode('duel')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                gameMode === 'duel'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Дуэль 1 на 1
            </button>
          </div>

          {/* Счётчик раундов дуэли */}
          {gameMode === 'duel' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-neutral-800/90 border border-neutral-700 rounded-lg text-xs font-bold tracking-wider">
              <span className="text-sky-400">P1: {p1Score}</span>
              <span className="text-neutral-500">—</span>
              <span className="text-rose-400">P2: {p2Score}</span>
            </div>
          )}

          {/* Кнопки манекена (только в режиме тренировки) */}
          {gameMode === 'training' && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-neutral-700">
              <button
                onClick={handleResetDummy}
                className="px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded flex items-center gap-1 transition-colors"
                title="Восстановить HP манекена"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                Сброс манекена
              </button>

              <button
                onClick={() => setDummyStrikesBack(!dummyStrikesBack)}
                className={`px-2.5 py-1 text-xs border rounded flex items-center gap-1.5 font-medium transition-colors ${
                  dummyStrikesBack
                    ? 'bg-rose-950/70 border-rose-600 text-rose-300 animate-pulse'
                    : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Манекен бьёт в ответ: {dummyStrikesBack ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>
          )}
        </div>

        {/* Правая часть: Билд, Управление, Звук */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingPlayer(1);
              setShowBuildModal(true);
            }}
            className="px-3 py-1 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Билд {gameMode === 'duel' ? 'Игроков' : ''}
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded-md transition-colors"
            title="Управление и подсказки"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded-md transition-colors"
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
          </button>
        </div>
      </header>

      {/* ОСНОВНОЙ ЭКРАН ИГРЫ С АРЕНОЙ */}
      <main className="relative flex-1 flex items-center justify-center bg-neutral-950 p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={760}
          className="max-h-[92vh] max-w-[95vw] object-contain rounded-xl shadow-2xl border border-neutral-800 cursor-crosshair bg-neutral-900"
        />

        {/* ЭКРАН СМЕРТИ ИЛИ ПОБЕДЫ В ДУЭЛИ */}
        {deathScreen && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4">
            <div 
              className="bg-neutral-900 border-2 rounded-2xl p-7 max-w-md w-full text-center shadow-2xl space-y-4"
              style={{ borderColor: deathScreen.color }}
            >
              <div 
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-neutral-800 border-2 shadow-lg"
                style={{ borderColor: deathScreen.color }}
              >
                {deathScreen.type === 'duel_winner' ? (
                  <Sparkles className="w-8 h-8" style={{ color: deathScreen.color }} />
                ) : (
                  <Sword className="w-8 h-8 text-rose-500 rotate-45" />
                )}
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-wider font-['Cinzel']" style={{ color: deathScreen.color }}>
                  {deathScreen.title}
                </h2>
                <p className="text-xs text-neutral-300 mt-2">
                  {deathScreen.sub}
                </p>
              </div>

              {deathScreen.type === 'duel_winner' && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center gap-4 text-sm font-bold">
                  <span className="text-sky-400">Игрок 1: {p1Score}</span>
                  <span className="text-neutral-600">vs</span>
                  <span className="text-rose-400">Игрок 2: {p2Score}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleRespawn}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-neutral-950" />
                  {deathScreen.type === 'duel_winner' ? 'Следующий раунд' : 'Возродиться'}
                  <span className="text-xs opacity-75 font-normal">(Пробел / Enter)</span>
                </button>

                <button
                  onClick={() => setShowBuildModal(true)}
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl border border-neutral-700 transition-colors text-xs cursor-pointer"
                >
                  Изменить боевой билд
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ПЛАВАЮЩИЙ ИНФО-БЕЙДЖ ТЕКУЩЕГО БИЛДА СНИЗУ СЛЕВА */}
        <div className="absolute bottom-4 left-4 bg-neutral-900/90 border border-neutral-800 backdrop-blur-md p-3 rounded-lg shadow-xl text-xs space-y-1.5 pointer-events-none max-w-xs">
          <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <Sword className="w-3.5 h-3.5 text-amber-400" />
            <span>Билд P1: {activeWeaponConf.name}</span>
          </div>
          <div className="text-neutral-400 text-[11px] leading-tight flex flex-col gap-0.5">
            <span>• Стиль: <span className="text-neutral-200">{activeStyleConf.name}</span></span>
            <span>• Стихия: <span style={{ color: activeModConf.color }}>{activeModConf.name}</span></span>
            <span>• Комбо: <span className="text-amber-300">{activeWeaponConf.comboLength} удара подряд</span></span>
          </div>
        </div>

        {/* ПЛАВАЮЩАЯ ПЛАШКА УПРАВЛЕНИЯ СНИЗУ СПРАВА */}
        <div className="absolute bottom-4 right-4 bg-neutral-900/90 border border-neutral-800 backdrop-blur-md p-3 rounded-lg shadow-xl text-xs space-y-1 pointer-events-none text-neutral-300">
          <div className="font-semibold text-sky-400 mb-1">Управление (P1):</div>
          <div className="text-[11px] grid grid-cols-2 gap-x-3 gap-y-0.5 text-neutral-400">
            <span>WASD: движение</span>
            <span>ЛКМ / J: атака</span>
            <span>ПКМ / K: блок</span>
            <span>Shift / L: рывок</span>
            <span className="col-span-2 text-amber-300">Space / I: умение стиля</span>
          </div>
          {gameMode === 'duel' && (
            <div className="border-t border-neutral-800 pt-1 mt-1 text-[11px] text-rose-400">
              P2: Стрелки + Numpad 1 (Атака), 2 (Блок), 3 (Рывок), 0 (Умение)
            </div>
          )}
        </div>
      </main>

      {/* МОДАЛЬНОЕ ОКНО КОНСТРУКТОРА БИЛДА (СИСТЕМА КОМБИНИРОВАНИЯ) */}
      {showBuildModal && (
        <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-xl font-bold font-['Cinzel'] text-neutral-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Конструктор Боевого Билда
                </h2>
                <p className="text-xs text-neutral-400">
                  Скомбинируй оружие, стиль боя и модификатор для уникальной скорости, дальности и комбо
                </p>
              </div>

              {/* Выбор игрока если дуэль */}
              {gameMode === 'duel' && (
                <div className="flex bg-neutral-800 p-1 rounded-lg border border-neutral-700">
                  <button
                    onClick={() => setEditingPlayer(1)}
                    className={`px-3 py-1 text-xs font-semibold rounded ${
                      editingPlayer === 1 ? 'bg-sky-500 text-white' : 'text-neutral-400'
                    }`}
                  >
                    Игрок 1
                  </button>
                  <button
                    onClick={() => setEditingPlayer(2)}
                    className={`px-3 py-1 text-xs font-semibold rounded ${
                      editingPlayer === 2 ? 'bg-rose-500 text-white' : 'text-neutral-400'
                    }`}
                  >
                    Игрок 2
                  </button>
                </div>
              )}
            </div>

            {/* Быстрые пресеты */}
            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Готовые архетипы:
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PRESET_BUILDS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setCurBuild(() => preset.build)}
                    className="p-2.5 rounded-lg bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700 text-left transition-all hover:border-amber-500/60"
                  >
                    <div className="font-semibold text-xs text-amber-300">{preset.name}</div>
                    <div className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* СЛОТ 1: ВЫБОР ОРУЖИЯ */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sword className="w-3.5 h-3.5 text-amber-400" />
                Слот 1: Оружие
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {(Object.keys(BALANCE_CONFIG.weapons) as WeaponKey[]).map((wKey) => {
                  const w = BALANCE_CONFIG.weapons[wKey];
                  const isSelected = currentBuild.weapon === wKey;
                  return (
                    <button
                      key={wKey}
                      onClick={() => setCurBuild((prev) => ({ ...prev, weapon: wKey }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500 text-white'
                          : 'bg-neutral-800/40 border-neutral-700 hover:border-neutral-500 text-neutral-300'
                      }`}
                    >
                      <div className="font-bold text-sm text-neutral-100">{w.name}</div>
                      <div className="text-[11px] text-neutral-400 mt-1 leading-tight">{w.desc}</div>
                      <div className="mt-2 text-[10px] text-neutral-400 flex flex-wrap gap-x-2">
                        <span>Урон: <b className="text-neutral-200">{w.damage}</b></span>
                        <span>Дальность: <b className="text-neutral-200">{w.reach}px</b></span>
                        <span>Комбо: <b className="text-amber-400">{w.comboLength}x</b></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* СЛОТ 2: ВЫБОР СТИЛЯ */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                Слот 2: Стиль боя
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {(Object.keys(BALANCE_CONFIG.styles) as StyleKey[]).map((sKey) => {
                  const s = BALANCE_CONFIG.styles[sKey];
                  const isSelected = currentBuild.style === sKey;
                  return (
                    <button
                      key={sKey}
                      onClick={() => setCurBuild((prev) => ({ ...prev, style: sKey }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500 text-white'
                          : 'bg-neutral-800/40 border-neutral-700 hover:border-neutral-500 text-neutral-300'
                      }`}
                    >
                      <div className="font-bold text-sm text-neutral-100">{s.name}</div>
                      <div className="text-[11px] text-neutral-400 mt-1 leading-tight">{s.desc}</div>
                      <div className="mt-2 text-[10px] text-sky-400 font-medium">
                        Умение: {s.specialDesc.split(':')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* СЛОТ 3: ВЫБОР МОДИФИКАТОРА */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Слот 3: Модификатор стихии
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {(Object.keys(BALANCE_CONFIG.modifiers) as ModifierKey[]).map((mKey) => {
                  const m = BALANCE_CONFIG.modifiers[mKey];
                  const isSelected = currentBuild.modifier === mKey;
                  return (
                    <button
                      key={mKey}
                      onClick={() => setCurBuild((prev) => ({ ...prev, modifier: mKey }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500 text-white'
                          : 'bg-neutral-800/40 border-neutral-700 hover:border-neutral-500 text-neutral-300'
                      }`}
                    >
                      <div className="font-bold text-sm flex items-center gap-1.5" style={{ color: m.color }}>
                        {mKey === 'fire' && <Flame className="w-4 h-4" />}
                        {mKey === 'ice' && <Snowflake className="w-4 h-4" />}
                        {mKey === 'bleed' && <Droplets className="w-4 h-4" />}
                        {mKey === 'vampirism' && <Zap className="w-4 h-4" />}
                        {m.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1 leading-tight">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ИТОГОВЫЕ ХАРАКТЕРИСТИКИ */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-neutral-400">Итоговый урон за удар: </span>
                <span className="font-bold text-neutral-100">
                  ~{Math.round(activeWeaponConf.damage * activeStyleConf.damageMod)} ед. (финишер ~{Math.round(activeWeaponConf.damage * activeStyleConf.damageMod * 1.4)})
                </span>
                <div className="text-neutral-500 text-[11px]">
                  Скорость атаки: x{(activeWeaponConf.speed * activeStyleConf.speedMod).toFixed(2)} | Дальность: {activeWeaponConf.reach}px
                </div>
              </div>

              <button
                onClick={() => setShowBuildModal(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-neutral-950" />
                В бой!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ПОМОЩИ И УПРАВЛЕНИЯ */}
      {showHelp && (
        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              Как играть в дуэли
            </h3>

            <div className="space-y-2.5 text-xs text-neutral-300 leading-relaxed">
              <p>
                <b className="text-amber-400">Комбо-цепочка:</b> Атакуйте ритмично ЛКМ. Каждый меч имеет цепочку из 3-4 ударов с возрастающим уроном и мощным финишером.
              </p>
              <p>
                <b className="text-sky-400">Блок и Парирование:</b> Правая кнопка мыши включает блок. В <b className="text-neutral-100">Защитном стиле</b> блок, нажатый прямо перед ударом врага, совершает <b className="text-amber-300">Идеальное парирование</b> (100% блок + контрудар +80% урона!).
              </p>
              <p>
                <b className="text-rose-400">Рывок (Shift):</b> Дает кратковременную неуязвимость от ударов врага и манекена. Тратит выносливость.
              </p>
              <p>
                <b className="text-emerald-400">Особое умение (Пробел):</b> Уникальное для каждого стиля боя (Берсерк, Бастион, Телепорт, Землетрясение).
              </p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg transition-colors text-xs"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
