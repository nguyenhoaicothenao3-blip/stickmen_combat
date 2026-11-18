import {
  drawSketchCircle,
  drawSketchGauge,
  drawSketchGear,
  drawSketchLine,
  drawSketchPolyline,
  drawSketchSpring,
} from './sketchDraw';
import { WeaponType } from './weapons';

export type CharacterId = 'normal' | 'bucon' | 'nhoc' | 'caokieu' | 'lonsat' | 'hebongbay';

export type TauntStyle =
  | 'stickman_flex'
  | 'bucon_stomp'
  | 'nhoc_hop'
  | 'caokieu_push_glasses'
  | 'lonsat_vent_rev'
  | 'clown_juggle';

export type WeaponAffinityTier = 'strong' | 'good' | 'neutral' | 'weak';

export interface CharacterPhaseTime {
  windup: number;
  strike: number;
  recovery: number;
}

export type GagPropType = 'bananaPeel' | 'creamPie' | 'jackBox';

export interface CharacterTrait {
  id: 'none' | 'thickSkin' | 'rollDodge' | 'sweetSpot' | 'boiler' | 'gagBag';
  armorPhase?: 'windup';
  armorBelowDmg?: number;
  cooldown?: number;
  invuln?: number;
  cannotDodge?: Array<'windup' | 'aoe' | 'recovery' | 'stunned'>;
  sweetBand?: [number, number];
  sweetDamageMul?: number;
  sweetKnockbackMul?: number;
  sweetRecoveryMul?: number;
  deadBelow?: number;
  deadDamageMul?: number;
  deadWindupMul?: number;
  measureAt?: Array<'windupStart' | 'strikeStart'>;
  recoverySlide?: {
    distanceR: number;
    perStrike: number;
    blockedIfBackMarginBelow: number;
  };
  ignores?: Array<'aoe' | 'thrownShield' | 'drawnWeapon' | 'slip' | 'pieFace'>;
  triggerOn?: 'finisherHitDealtDamage';
  sequence?: GagPropType[];
  advanceOnlyWhenPlaced?: boolean;
  props?: {
    bananaPeel: {
      lifetime: number;
      max: number;
      slipDuration: number;
      damage: number;
      triggersOn: Array<'moveOnto' | 'pushedOnto'>;
    };
    creamPie: {
      damage: number;
      duration: number;
      reachMul: number;
      windupMul: number;
    };
    jackBox: {
      fuse: number;
      max: number;
      radiusR: number;
      damage: number;
      distanceR: number;
      immuneOwner: boolean;
    };
  };
  finale?: {
    belowHp: number;
    oncePerMatch: boolean;
    duration: number;
    gagOnEveryHit: boolean;
    moveSpeedMul: number;
    thenOutOfTricks: {
      duration: number;
      noGags: boolean;
      recoveryMul: number;
    };
  };
  heatPerDmg?: number;
  maxHeat?: number;
  coolDelay?: number;
  coolRate?: number;
  delayVentWhen?: Array<'stunned' | 'pinned'>;
  warmAt?: number;
  warmDmgMul?: number;
  hotAt?: number;
  hotDmgMul?: number;
  hotRecoveryMul?: number;
  ventWarnSec?: number;
  ventDamage?: number;
  ventKnockbackMul?: number;
  ventRadiusR?: number;
  ventExceptArmored?: string[];
  overheatDuration?: number;
  overheatDamageTakenMul?: number;
  overheatMoveSpeedMul?: number;
  takeoff?: {
    belowHp: number;
    oncePerMatch: boolean;
    delayWhen: Array<'stunned' | 'pinned'>;
    megaVent: {
      warnTime: number;
      radiusR: number;
      damage: number;
      knockbackDistanceR: number;
      stun: number;
      breaksCombo: boolean;
      exceptArmored: string[];
      dodgeable: boolean;
      resetHeatToZero: boolean;
      noOverheatAfter: boolean;
    };
    flight: {
      duration: number;
      hoverHeightBody: number;
      hoverDistanceR: number;
      meleeUntouchable: boolean;
      noHeatGain: boolean;
      wingHp: number;
      breakStun: number;
      breakOverheat: number;
      rockets: {
        smallCount: number;
        smallStartAt: number;
        smallInterval: number;
        smallDamage: number;
        smallBlastRadiusR: number;
        smallSpeed: number;
        smallKnockback: number;
        bigAt: number;
        bigDamage: number;
        bigBlastRadiusR: number;
        bigSpeed: number;
        bigKnockback: number;
        dodgeableByRoll: boolean;
      };
    };
    landing: {
      safeSpot: boolean;
      quake: string;
      stuck: number;
      thenOverheat: number;
    };
  };
}

export interface CharacterAIConfig {
  style: 'balanced' | 'steadyAdvance' | 'hitAndRun' | 'zoner' | 'boiler' | 'prankster';
  rageBelowHp?: number;
  preferredRange?: 'midFar' | 'sweetSpot' | number;
  aggression?: number;
  panicBelowHp?: number;
  panicCooldownMul?: number;
  maxComboBeatsInSweet?: number;
  cornerThreshold?: number;
  overreachBelowHp?: number;
  overreach?: {
    band: [number, number];
    reachMul: number;
    moveSpeedMul: number;
    duration: number;
  };
  takeoff?: {
    trigger: 'belowHp';
    waitIfPinned: boolean;
  };
  prioritizeFinisher?: boolean;
  bailOutOnHeavyWindup?: boolean;
  retreatBehindProp?: boolean;
  avoidOwnPeel?: boolean;
  punishWindow?: number;
}

export interface CharacterVisualConfig {
  bellyScale: number;
  headScale: number;
  torsoRatio: number;
  neckRatio: number;
  legRatio: number;
  armRatio: number;
  fistScale: number;
  shoeScale: number;
  footFlat: boolean;
  kneeKnobs: boolean;
  beard: boolean;
  hairTufts: number;
  hairStrands: number;
  glasses: boolean;
  cheekBandage: boolean;
  faceStyle: 'standard' | 'nhoc' | 'caokieu' | 'lonsat' | 'hebongbay';
  scarfStyle: 'headband' | 'neck' | 'tie' | 'none';
  scarfColor?: string;
  scarfTailLines: number;
  sockStripes: number;
  sockColor?: string;
  jitterFps: number;
  doublePasses: 1 | 2;
  secondPassOffsetY: number;
  waveAmp: number;
  doubleStrokeRoughness: number;
  shadowAlpha: number;
  stepShake: number;
  swordDrawScale: number;
  batDrawScale: number;
  spearDrawScale: number;
  hammerDrawScale: number;
  shieldDrawScale: number;
  boilerLook?: boolean;
  gaugeColor?: string;
  rustColor?: string;
  serialNumber?: string;
  foldedWings?: boolean;
  rocketPods?: boolean;
  wings?: { color: string };
  flame?: { color: string };
  clownLook?: boolean;
}

export interface CharacterEntranceConfig {
  duration: number;
  jumpHeight: number;
  tauntDuration: number;
  tauntText: string;
  tauntStyle: TauntStyle;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  subtitle: string;
  description: string;
  scale: number;
  limbLength: number;
  lineWidth: number;
  hitbox: number;
  jitterFps: number;
  coarseMotion?: boolean;
  hp: number;
  moveSpeed: number;
  damageDealt: number;
  knockbackDealt: number;
  knockbackTaken: number;
  phaseTime: CharacterPhaseTime;
  trait: CharacterTrait;
  affinity: Record<WeaponType | 'unarmed', WeaponAffinityTier>;
  ai: CharacterAIConfig;
  visual: CharacterVisualConfig;
  statTags: string[];
  entrance: CharacterEntranceConfig;
  drawPortrait: (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    inkColor: string,
    accentColor: string,
    boilTick: number,
    tSec: number,
  ) => void;
}

export const BASE_FIGHTER_HP = 300;

function drawNormalCardPortrait(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  inkColor: string,
  accentColor: string,
  boilTick: number,
  tSec: number,
) {
  const s = scale;
  const seed = 311 + boilTick * 7.3;
  const bob = Math.sin(tSec * 4.2) * 2.2 * s;
  const fistPulse = Math.sin(tSec * 4.2) * 1.8 * s;

  const hipX = cx;
  const hipY = cy + 12 * s + bob;
  const shoulderX = cx + 2.5 * s;
  const shoulderY = hipY - 26 * s;
  const headX = shoulderX + 2 * s;
  const headY = shoulderY - 15 * s;

  // Pencil shadow under feet
  drawSketchLine(ctx, cx - 18 * s, cy + 46 * s, cx + 18 * s, cy + 46 * s, {
    color: '#64748B',
    lineWidth: 1.5 * s,
    roughness: 1,
    seed: seed + 1,
    passes: 1,
    alpha: 0.3,
  });

  // Flowing headband tail
  const flutter = Math.sin(tSec * 7.5) * 3 * s;
  drawSketchPolyline(
    ctx,
    [
      { x: headX - 8 * s, y: headY - 2 * s },
      { x: headX - 18 * s, y: headY + 1 * s + flutter * 0.5 },
      { x: headX - 27 * s, y: headY + 4 * s + flutter },
    ],
    {
      color: accentColor,
      lineWidth: 2.5 * s,
      roughness: 1,
      seed: seed + 2,
      passes: 2,
      alpha: 0.9,
    },
  );

  // Back leg & back arm
  drawSketchLine(ctx, hipX, hipY, hipX - 9 * s, hipY + 16 * s, {
    color: inkColor,
    lineWidth: 2.5 * s,
    roughness: 1.1,
    seed: seed + 3,
    passes: 2,
    alpha: 0.78,
  });
  drawSketchLine(ctx, hipX - 9 * s, hipY + 16 * s, hipX - 14 * s, cy + 44 * s, {
    color: inkColor,
    lineWidth: 2.5 * s,
    roughness: 1.1,
    seed: seed + 4,
    passes: 2,
    alpha: 0.78,
  });
  drawSketchLine(ctx, shoulderX, shoulderY, shoulderX + 13 * s, shoulderY + 6 * s, {
    color: inkColor,
    lineWidth: 2.3 * s,
    roughness: 1,
    seed: seed + 5,
    passes: 2,
    alpha: 0.78,
  });
  drawSketchLine(
    ctx,
    shoulderX + 13 * s,
    shoulderY + 6 * s,
    shoulderX + 18 * s,
    shoulderY - 6 * s + fistPulse,
    {
      color: inkColor,
      lineWidth: 2.3 * s,
      roughness: 1,
      seed: seed + 6,
      passes: 2,
      alpha: 0.78,
    },
  );

  // Torso
  drawSketchLine(ctx, hipX, hipY, shoulderX, shoulderY, {
    color: inkColor,
    lineWidth: 2.8 * s,
    roughness: 1.2,
    seed: seed + 7,
    passes: 2,
    alpha: 0.95,
  });

  // Front leg
  drawSketchLine(ctx, hipX, hipY, hipX + 10 * s, hipY + 15 * s, {
    color: inkColor,
    lineWidth: 2.6 * s,
    roughness: 1.1,
    seed: seed + 8,
    passes: 2,
  });
  drawSketchLine(ctx, hipX + 10 * s, hipY + 15 * s, hipX + 13 * s, cy + 44 * s, {
    color: inkColor,
    lineWidth: 2.6 * s,
    roughness: 1.1,
    seed: seed + 9,
    passes: 2,
  });

  // Front guard arm raised
  const handLX = shoulderX + 12 * s;
  const handLY = shoulderY - 11 * s - fistPulse;
  drawSketchLine(ctx, shoulderX, shoulderY, shoulderX + 6 * s, shoulderY + 4 * s, {
    color: inkColor,
    lineWidth: 2.5 * s,
    roughness: 1,
    seed: seed + 10,
    passes: 2,
  });
  drawSketchLine(ctx, shoulderX + 6 * s, shoulderY + 4 * s, handLX, handLY, {
    color: inkColor,
    lineWidth: 2.5 * s,
    roughness: 1,
    seed: seed + 11,
    passes: 2,
  });
  drawSketchCircle(ctx, handLX, handLY, 2.5 * s, {
    color: inkColor,
    lineWidth: 1.6 * s,
    roughness: 0.6,
    seed: seed + 12,
    passes: 2,
  });

  // Head & headband
  drawSketchCircle(ctx, headX, headY, 10.5 * s, {
    color: inkColor,
    lineWidth: 2.6 * s,
    roughness: 1.1,
    seed: seed + 13,
    passes: 2,
  });
  drawSketchLine(ctx, headX - 9.5 * s, headY - 2.5 * s, headX + 9.5 * s, headY - 3.5 * s, {
    color: accentColor,
    lineWidth: 2.6 * s,
    roughness: 0.7,
    seed: seed + 14,
    passes: 2,
  });

  // Confident battle eyes
  drawSketchLine(ctx, headX + 2.5 * s, headY - 0.5 * s, headX + 6 * s, headY - 1.5 * s, {
    color: inkColor,
    lineWidth: 1.5 * s,
    roughness: 0.4,
    seed: seed + 15,
    passes: 1,
  });
}

function drawBuConCardPortrait(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  inkColor: string,
  accentColor: string,
  boilTick: number,
  tSec: number,
) {
  const s = scale * 1.12;
  const seed = 911 + boilTick * 9.7;
  const bob = Math.sin(tSec * 2.8) * 1.6 * s;

  const hipX = cx - 2 * s;
  const hipY = cy + 16 * s + bob;
  const shoulderX = cx + 1 * s;
  const shoulderY = hipY - 28 * s;
  const headX = shoulderX + 2 * s;
  const headY = shoulderY - 16 * s;

  // Heavy ground shadow
  drawSketchLine(ctx, cx - 25 * s, cy + 47 * s, cx + 25 * s, cy + 47 * s, {
    color: '#475569',
    lineWidth: 2.2 * s,
    roughness: 1.2,
    seed: seed + 1,
    passes: 2,
    alpha: 0.45,
  });

  // Thick double-pass legs
  drawSketchLine(ctx, hipX, hipY, hipX - 11 * s, hipY + 15 * s, {
    color: inkColor,
    lineWidth: 3.6 * s,
    roughness: 1.6,
    seed: seed + 2,
    passes: 2,
    alpha: 0.82,
  });
  drawSketchLine(ctx, hipX - 11 * s, hipY + 15 * s, hipX - 14 * s, cy + 45 * s, {
    color: inkColor,
    lineWidth: 3.6 * s,
    roughness: 1.6,
    seed: seed + 3,
    passes: 2,
    alpha: 0.82,
  });
  drawSketchLine(ctx, hipX, hipY, hipX + 12 * s, hipY + 15 * s, {
    color: inkColor,
    lineWidth: 3.7 * s,
    roughness: 1.6,
    seed: seed + 4,
    passes: 2,
  });
  drawSketchLine(ctx, hipX + 12 * s, hipY + 15 * s, hipX + 15 * s, cy + 45 * s, {
    color: inkColor,
    lineWidth: 3.7 * s,
    roughness: 1.6,
    seed: seed + 5,
    passes: 2,
  });

  // Torso + round scribbled belly
  drawSketchLine(ctx, hipX, hipY, shoulderX, shoulderY, {
    color: inkColor,
    lineWidth: 4.1 * s,
    roughness: 1.8,
    seed: seed + 6,
    passes: 2,
  });
  drawSketchCircle(
    ctx,
    (hipX + shoulderX) * 0.5 + 4.5 * s,
    (hipY + shoulderY) * 0.5 + 3 * s,
    12.5 * s,
    {
      color: inkColor,
      lineWidth: 3.0 * s,
      roughness: 1.7,
      seed: seed + 7,
      passes: 2,
      alpha: 0.94,
    },
  );

  // Heavy crossed/flexed arms + big fists
  drawSketchLine(ctx, shoulderX, shoulderY, shoulderX + 14 * s, shoulderY + 8 * s, {
    color: inkColor,
    lineWidth: 3.5 * s,
    roughness: 1.5,
    seed: seed + 8,
    passes: 2,
  });
  drawSketchLine(ctx, shoulderX + 14 * s, shoulderY + 8 * s, shoulderX + 18 * s, shoulderY - 3 * s, {
    color: inkColor,
    lineWidth: 3.5 * s,
    roughness: 1.5,
    seed: seed + 9,
    passes: 2,
  });
  drawSketchCircle(ctx, shoulderX + 18 * s, shoulderY - 3 * s, 3.8 * s, {
    color: inkColor,
    lineWidth: 2.3 * s,
    roughness: 0.9,
    seed: seed + 10,
    passes: 2,
  });

  drawSketchLine(ctx, shoulderX, shoulderY, shoulderX - 11 * s, shoulderY + 9 * s, {
    color: inkColor,
    lineWidth: 3.4 * s,
    roughness: 1.5,
    seed: seed + 11,
    passes: 2,
  });
  drawSketchLine(ctx, shoulderX - 11 * s, shoulderY + 9 * s, shoulderX - 5 * s, shoulderY + 18 * s, {
    color: inkColor,
    lineWidth: 3.4 * s,
    roughness: 1.5,
    seed: seed + 12,
    passes: 2,
  });

  // Big head + headband + scruffy coiled beard
  drawSketchCircle(ctx, headX, headY, 12.2 * s, {
    color: inkColor,
    lineWidth: 3.6 * s,
    roughness: 1.7,
    seed: seed + 13,
    passes: 2,
  });
  drawSketchLine(ctx, headX - 11 * s, headY - 3.5 * s, headX + 11 * s, headY - 4 * s, {
    color: accentColor,
    lineWidth: 3.4 * s,
    roughness: 0.9,
    seed: seed + 14,
    passes: 2,
  });

  // Coiled bushy beard scribble under chin
  const bx = headX + 2.5 * s;
  const by = headY + 9.5 * s;
  drawSketchPolyline(
    ctx,
    [
      { x: bx - 8 * s, y: by - 2 * s },
      { x: bx - 4 * s, y: by + 5 * s },
      { x: bx - 1 * s, y: by },
      { x: bx + 2 * s, y: by + 6 * s },
      { x: bx + 5 * s, y: by + 1 * s },
      { x: bx + 8 * s, y: by + 4 * s },
    ],
    {
      color: inkColor,
      lineWidth: 2.3 * s,
      roughness: 1.2,
      seed: seed + 15,
      passes: 2,
    },
  );

  // Stern brow
  drawSketchLine(ctx, headX + 1.5 * s, headY - 1 * s, headX + 7 * s, headY + 0.5 * s, {
    color: inkColor,
    lineWidth: 2.1 * s,
    roughness: 0.4,
    seed: seed + 16,
    passes: 1,
  });
}

function drawNhocCardPortrait(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  inkColor: string,
  _accentColor: string,
  boilTick: number,
  tSec: number,
) {
  const s = scale * 0.92;
  const tick12 = Math.floor(tSec * 12) + boilTick * 0;
  const seed = 1411 + tick12 * 11.3;
  const hop = Math.abs(Math.sin(tSec * 5.8)) * 3.2 * s;

  const hipX = cx - 2 * s;
  const hipY = cy + 20 * s - hop;
  const shoulderX = cx + 4 * s;
  const shoulderY = hipY - 15 * s;
  const headX = shoulderX + 3.5 * s;
  const headY = shoulderY - 17 * s;
  const headR = 14.2 * s;

  // Pencil shadow on floor
  drawSketchLine(ctx, cx - 17 * s, cy + 46 * s, cx + 17 * s, cy + 46 * s, {
    color: '#64748B',
    lineWidth: 1.4 * s,
    roughness: 0.8,
    seed: seed + 1,
    passes: 1,
    alpha: 0.3,
  });

  // Back leg & big sneaker
  const kneeRX = hipX - 8 * s;
  const kneeRY = hipY + 12 * s;
  const footRX = hipX - 11 * s;
  const footRY = cy + 43 * s - hop * 0.5;
  drawSketchLine(ctx, hipX, hipY, kneeRX, kneeRY, {
    color: inkColor,
    lineWidth: 2.1 * s,
    roughness: 0.6,
    seed: seed + 2,
    passes: 1,
    alpha: 0.78,
  });
  drawSketchLine(ctx, kneeRX, kneeRY, footRX, footRY, {
    color: inkColor,
    lineWidth: 2.1 * s,
    roughness: 0.6,
    seed: seed + 3,
    passes: 1,
    alpha: 0.78,
  });

  // Back arm raised nervously
  drawSketchLine(ctx, shoulderX, shoulderY, shoulderX + 10 * s, shoulderY + 3 * s, {
    color: inkColor,
    lineWidth: 2.0 * s,
    roughness: 0.55,
    seed: seed + 4,
    passes: 1,
    alpha: 0.78,
  });
  drawSketchLine(ctx, shoulderX + 10 * s, shoulderY + 3 * s, shoulderX + 16 * s, shoulderY - 4 * s, {
    color: inkColor,
    lineWidth: 2.0 * s,
    roughness: 0.55,
    seed: seed + 5,
    passes: 1,
    alpha: 0.78,
  });

  // Vivid orange 3-tail neck scarf
  const neckX = shoulderX + 1 * s;
  const neckY = shoulderY - 3 * s;
  const sway = Math.sin(tSec * 9.5) * 3.2 * s;
  for (let i = -1; i <= 1; i++) {
    drawSketchPolyline(
      ctx,
      [
        { x: neckX - 3 * s, y: neckY + i * 1.8 * s },
        { x: neckX - 15 * s, y: neckY + i * 3.4 * s + sway * 0.45 },
        { x: neckX - 25 * s, y: neckY + i * 4.8 * s + sway },
      ],
      {
        color: '#F97316',
        lineWidth: 2.1 * s,
        roughness: 0.75,
        seed: seed + 20 + i,
        passes: 1,
        alpha: 0.95,
      },
    );
  }
  drawSketchLine(ctx, neckX - 4 * s, neckY - 1 * s, neckX + 6 * s, neckY + 1 * s, {
    color: '#F97316',
    lineWidth: 4.2 * s,
    roughness: 0.5,
    seed: seed + 24,
    passes: 1,
    alpha: 0.92,
  });

  // Hunched short torso
  drawSketchLine(ctx, hipX, hipY, shoulderX, shoulderY, {
    color: inkColor,
    lineWidth: 2.3 * s,
    roughness: 0.6,
    seed: seed + 6,
    passes: 1,
    alpha: 0.95,
  });

  // Front bent leg & oversized spiral sneakers
  const kneeLX = hipX + 9 * s;
  const kneeLY = hipY + 11 * s;
  const footLX = hipX + 10 * s;
  const footLY = cy + 43 * s - hop * 0.5;
  drawSketchLine(ctx, hipX, hipY, kneeLX, kneeLY, {
    color: inkColor,
    lineWidth: 2.2 * s,
    roughness: 0.6,
    seed: seed + 7,
    passes: 1,
  });
  drawSketchLine(ctx, kneeLX, kneeLY, footLX, footLY, {
    color: inkColor,
    lineWidth: 2.2 * s,
    roughness: 0.6,
    seed: seed + 8,
    passes: 1,
  });

  for (const [fx, fy, a] of [
    [footRX, footRY, 0.85],
    [footLX, footLY, 0.96],
  ] as const) {
    drawSketchCircle(ctx, fx + 3 * s, fy - 1 * s, 5.2 * s, {
      color: '#0F172A',
      lineWidth: 2.1 * s,
      roughness: 0.85,
      seed: seed + fx,
      passes: 2,
      alpha: a,
    });
    drawSketchCircle(ctx, fx + 3 * s, fy - 1 * s, 2.3 * s, {
      color: '#0F172A',
      lineWidth: 1.5 * s,
      roughness: 0.6,
      seed: seed + fx + 3,
      passes: 1,
      alpha: a,
    });
  }

  // Front arm with oversized fist
  const handLX = shoulderX + 13 * s;
  const handLY = shoulderY - 9 * s;
  drawSketchLine(ctx, shoulderX, shoulderY, shoulderX + 7 * s, shoulderY + 3 * s, {
    color: inkColor,
    lineWidth: 2.1 * s,
    roughness: 0.55,
    seed: seed + 9,
    passes: 1,
  });
  drawSketchLine(ctx, shoulderX + 7 * s, shoulderY + 3 * s, handLX, handLY, {
    color: inkColor,
    lineWidth: 2.1 * s,
    roughness: 0.55,
    seed: seed + 10,
    passes: 1,
  });
  drawSketchCircle(ctx, handLX, handLY, 3.3 * s, {
    color: inkColor,
    lineWidth: 1.8 * s,
    roughness: 0.5,
    seed: seed + 11,
    passes: 1,
  });

  // Big head (1/3 total height) + 3 spiky tufts (one '?' curl)
  drawSketchCircle(ctx, headX, headY, headR, {
    color: inkColor,
    lineWidth: 2.2 * s,
    roughness: 0.65,
    seed: seed + 12,
    passes: 1,
  });
  drawSketchPolyline(
    ctx,
    [
      { x: headX - 3 * s, y: headY - headR + 1 * s },
      { x: headX - 7 * s, y: headY - headR - 7 * s },
    ],
    { color: inkColor, lineWidth: 1.9 * s, roughness: 0.5, seed: seed + 13, passes: 1 },
  );
  drawSketchPolyline(
    ctx,
    [
      { x: headX + 1 * s, y: headY - headR },
      { x: headX + 4 * s, y: headY - headR - 8 * s },
      { x: headX + 8 * s, y: headY - headR - 6 * s },
    ],
    { color: inkColor, lineWidth: 1.9 * s, roughness: 0.5, seed: seed + 14, passes: 1 },
  );
  drawSketchPolyline(
    ctx,
    [
      { x: headX - 1 * s, y: headY - headR },
      { x: headX - 2 * s, y: headY - headR - 9 * s },
      { x: headX - 6 * s, y: headY - headR - 10 * s },
    ],
    { color: inkColor, lineWidth: 1.9 * s, roughness: 0.5, seed: seed + 15, passes: 1 },
  );

  // Two low dot eyes + pale-yellow X bandage on left cheek + tiny smile
  ctx.save();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(headX + 1.8 * s, headY + 2.2 * s, 2.0 * s, 0, Math.PI * 2);
  ctx.arc(headX + 8.4 * s, headY + 1.8 * s, 2.0 * s, 0, Math.PI * 2);
  ctx.fill();
  // Cheek band-aid (pale yellow rectangle + X)
  ctx.translate(headX - 5.2 * s, headY + 5.2 * s);
  ctx.rotate(-0.22);
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(-3.6 * s, -2 * s, 7.2 * s, 4 * s);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1.0 * s;
  ctx.strokeRect(-3.6 * s, -2 * s, 7.2 * s, 4 * s);
  ctx.restore();

  drawSketchLine(ctx, headX + 2 * s, headY + 7.5 * s, headX + 6.5 * s, headY + 6.5 * s, {
    color: inkColor,
    lineWidth: 1.5 * s,
    roughness: 0.35,
    seed: seed + 18,
    passes: 1,
  });
}

function drawCaoKieuCardPortrait(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  inkColor: string,
  _accentColor: string,
  _boilTick: number,
  tSec: number,
) {
  const s = scale * 0.85;
  const tick6 = Math.floor(tSec * 6);
  const seed = 2011 + tick6 * 13.7;
  const sway = Math.sin(tSec * 1.9) * 2.5 * s;

  const hipX = cx - 2 * s + sway * 0.35;
  const hipY = cy + 12 * s;
  const shoulderX = hipX + 4 * s + sway * 0.7;
  const shoulderY = hipY - 26 * s;
  const neckTopX = shoulderX + 3.5 * s + sway * 0.9;
  const neckTopY = shoulderY - 12 * s;
  const headX = neckTopX + 2.5 * s;
  const headY = neckTopY - 7 * s;
  const headR = 7.4 * s;

  // Pencil shadow on floor
  drawSketchLine(ctx, cx - 16 * s, cy + 53 * s, cx + 16 * s, cy + 53 * s, {
    color: '#64748B',
    lineWidth: 1.3 * s,
    roughness: 0.7,
    seed: seed + 1,
    passes: 1,
    alpha: 0.28,
  });

  // Crossed long legs with bamboo knee knobs & yellow striped socks
  const kneeRX = hipX - 6 * s;
  const kneeRY = hipY + 20 * s;
  const footRX = hipX + 6 * s;
  const footRY = cy + 51 * s;
  const kneeLX = hipX + 7 * s;
  const kneeLY = hipY + 19 * s;
  const footLX = hipX - 7 * s;
  const footLY = cy + 51 * s;

  drawSketchLine(ctx, hipX, hipY, kneeRX, kneeRY, {
    color: inkColor,
    lineWidth: 1.9 * s,
    roughness: 0.55,
    seed: seed + 2,
    passes: 2,
    secondPassOffsetY: -2,
    waveAmp: 1.1,
    alpha: 0.76,
  });
  drawSketchLine(ctx, kneeRX, kneeRY, footRX, footRY, {
    color: inkColor,
    lineWidth: 1.9 * s,
    roughness: 0.55,
    seed: seed + 3,
    passes: 2,
    secondPassOffsetY: -2,
    waveAmp: 1.1,
    alpha: 0.76,
  });
  drawSketchCircle(ctx, kneeRX, kneeRY, 2.2 * s, {
    color: inkColor,
    lineWidth: 1.3 * s,
    roughness: 0.35,
    seed: seed + 4,
    passes: 1,
  });

  // Back arm dangling near knee
  drawSketchLine(ctx, shoulderX, shoulderY, shoulderX - 5 * s, shoulderY + 16 * s, {
    color: inkColor,
    lineWidth: 1.8 * s,
    roughness: 0.5,
    seed: seed + 5,
    passes: 2,
    secondPassOffsetY: -2,
    alpha: 0.76,
  });
  drawSketchLine(ctx, shoulderX - 5 * s, shoulderY + 16 * s, shoulderX - 3 * s, shoulderY + 32 * s, {
    color: inkColor,
    lineWidth: 1.8 * s,
    roughness: 0.5,
    seed: seed + 6,
    passes: 2,
    secondPassOffsetY: -2,
    alpha: 0.76,
  });

  // Long slightly hunched torso & giraffe neck
  drawSketchLine(ctx, hipX, hipY, shoulderX, shoulderY, {
    color: inkColor,
    lineWidth: 2.1 * s,
    roughness: 0.55,
    seed: seed + 7,
    passes: 2,
    secondPassOffsetY: -2,
    waveAmp: 1.2,
  });
  drawSketchLine(ctx, shoulderX, shoulderY, neckTopX, neckTopY, {
    color: inkColor,
    lineWidth: 1.9 * s,
    roughness: 0.45,
    seed: seed + 8,
    passes: 2,
    secondPassOffsetY: -2,
  });

  // Long green tie hanging down to waist
  drawSketchPolyline(
    ctx,
    [
      { x: shoulderX + 2.5 * s, y: shoulderY - 2 * s },
      { x: shoulderX + 6 * s + sway * 0.4, y: hipY - 10 * s },
      { x: hipX + 4 * s + sway * 0.7, y: hipY + 1 * s },
    ],
    {
      color: '#16A34A',
      lineWidth: 2.6 * s,
      roughness: 0.45,
      seed: seed + 30,
      passes: 1,
      alpha: 0.94,
    },
  );

  // Front leg + yellow sock stripes + flat foot
  drawSketchLine(ctx, hipX, hipY, kneeLX, kneeLY, {
    color: inkColor,
    lineWidth: 2.0 * s,
    roughness: 0.55,
    seed: seed + 9,
    passes: 2,
    secondPassOffsetY: -2,
    waveAmp: 1.1,
  });
  drawSketchLine(ctx, kneeLX, kneeLY, footLX, footLY, {
    color: inkColor,
    lineWidth: 2.0 * s,
    roughness: 0.55,
    seed: seed + 10,
    passes: 2,
    secondPassOffsetY: -2,
    waveAmp: 1.1,
  });
  drawSketchCircle(ctx, kneeLX, kneeLY, 2.3 * s, {
    color: inkColor,
    lineWidth: 1.4 * s,
    roughness: 0.35,
    seed: seed + 11,
    passes: 1,
  });
  for (let i = 1; i <= 4; i++) {
    const t = 0.22 + i * 0.16;
    const sx = kneeLX + (footLX - kneeLX) * t;
    const sy = kneeLY + (footLY - kneeLY) * t;
    drawSketchLine(ctx, sx - 2.6 * s, sy, sx + 2.6 * s, sy, {
      color: '#EAB308',
      lineWidth: 1.7 * s,
      roughness: 0.25,
      seed: seed + 40 + i,
      passes: 1,
    });
  }
  drawSketchLine(ctx, footLX - 3 * s, footLY, footLX + 5 * s, footLY, {
    color: inkColor,
    lineWidth: 1.8 * s,
    roughness: 0.3,
    seed: seed + 12,
    passes: 1,
  });
  drawSketchLine(ctx, footRX - 3 * s, footRY, footRX + 5 * s, footRY, {
    color: inkColor,
    lineWidth: 1.8 * s,
    roughness: 0.3,
    seed: seed + 13,
    passes: 1,
    alpha: 0.8,
  });

  // Front arm pushing glasses periodically
  const pushPhase = (tSec % 3.2) / 3.2;
  const push = pushPhase > 0.72 ? Math.sin(((pushPhase - 0.72) / 0.28) * Math.PI) : 0;
  const elbowLX = shoulderX + 6 * s + push * 7 * s;
  const elbowLY = shoulderY + 14 * s - push * 14 * s;
  const handLX = push > 0.1 ? headX + 4 * s : shoulderX + 9 * s;
  const handLY = push > 0.1 ? headY + 1 * s : shoulderY + 30 * s;
  drawSketchLine(ctx, shoulderX, shoulderY, elbowLX, elbowLY, {
    color: inkColor,
    lineWidth: 1.9 * s,
    roughness: 0.5,
    seed: seed + 14,
    passes: 2,
    secondPassOffsetY: -2,
  });
  drawSketchLine(ctx, elbowLX, elbowLY, handLX, handLY, {
    color: inkColor,
    lineWidth: 1.9 * s,
    roughness: 0.5,
    seed: seed + 15,
    passes: 2,
    secondPassOffsetY: -2,
  });

  // Small bald head + 2 slow-swaying hair strands
  drawSketchCircle(ctx, headX, headY, headR, {
    color: inkColor,
    lineWidth: 2.0 * s,
    roughness: 0.55,
    seed: seed + 16,
    passes: 2,
    secondPassOffsetY: -2,
  });
  const hairLag = Math.sin(tSec * 1.3) * 2.2 * s;
  drawSketchLine(ctx, headX - 1.5 * s, headY - headR, headX - 3.5 * s + hairLag, headY - headR - 7.5 * s, {
    color: inkColor,
    lineWidth: 1.3 * s,
    roughness: 0.35,
    seed: seed + 17,
    passes: 1,
  });
  drawSketchLine(ctx, headX + 1.5 * s, headY - headR, headX + 2.5 * s + hairLag, headY - headR - 6.5 * s, {
    color: inkColor,
    lineWidth: 1.3 * s,
    roughness: 0.35,
    seed: seed + 18,
    passes: 1,
  });

  // Thick round glasses looking down toward opponent + star sparkle
  const gY = headY + 0.5 * s;
  const lensL = headX - 1.2 * s;
  const lensR = headX + 4.4 * s;
  drawSketchCircle(ctx, lensL, gY, 2.7 * s, {
    color: '#0F172A',
    lineWidth: 1.6 * s,
    roughness: 0.25,
    seed: seed + 19,
    passes: 2,
  });
  drawSketchCircle(ctx, lensR, gY, 2.7 * s, {
    color: '#0F172A',
    lineWidth: 1.6 * s,
    roughness: 0.25,
    seed: seed + 20,
    passes: 2,
  });
  drawSketchLine(ctx, lensL + 2.2 * s, gY, lensR - 2.2 * s, gY, {
    color: '#0F172A',
    lineWidth: 1.5 * s,
    roughness: 0.2,
    seed: seed + 21,
    passes: 1,
  });
  ctx.save();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(lensL + 0.7 * s, gY + 0.9 * s, 1.0 * s, 0, Math.PI * 2);
  ctx.arc(lensR + 0.7 * s, gY + 0.9 * s, 1.0 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLonSatCardPortrait(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  inkColor: string,
  _accentColor: string,
  _boilTick: number,
  tSec: number,
) {
  const s = scale * 1.02;
  const tick5 = Math.floor(tSec * 5);
  const seed = 2711 + tick5 * 14.3;
  const mechStep = Math.floor(tSec * 2.5) % 2 === 0 ? 0 : 1.2 * s;
  const hipX = cx;
  const hipY = cy + 16 * s;
  const shoulderY = hipY - 26 * s;
  const headX = hipX + 1.5 * s;
  const headY = shoulderY - 17 * s - mechStep * 0.5;

  // Heavy metal floor shadow
  drawSketchLine(ctx, cx - 22 * s, cy + 47 * s, cx + 22 * s, cy + 47 * s, {
    color: '#475569',
    lineWidth: 2.0 * s,
    roughness: 0.7,
    seed: seed + 1,
    passes: 2,
    alpha: 0.42,
  });

  // Back leg & steel plate foot
  const kneeRX = hipX - 8 * s;
  const kneeRY = hipY + 13 * s;
  const footRX = hipX - 9 * s;
  const footRY = cy + 45 * s;
  for (const [x0, y0, x1, y1, off, a] of [
    [hipX - 4 * s, hipY, kneeRX, kneeRY, 2, 0.76],
    [kneeRX, kneeRY, footRX, footRY, 3, 0.76],
    [hipX + 5 * s, hipY, hipX + 9 * s, hipY + 13 * s, 4, 0.96],
    [hipX + 9 * s, hipY + 13 * s, hipX + 10 * s, cy + 45 * s, 5, 0.96],
  ] as const) {
    drawSketchLine(ctx, x0 - 1.8 * s, y0, x1 - 1.8 * s, y1, {
      color: inkColor,
      lineWidth: 2.0 * s,
      roughness: 0.35,
      seed: seed + off,
      passes: 1,
      alpha: a,
    });
    drawSketchLine(ctx, x0 + 1.8 * s, y0, x1 + 1.8 * s, y1, {
      color: inkColor,
      lineWidth: 2.0 * s,
      roughness: 0.35,
      seed: seed + off + 10,
      passes: 1,
      alpha: a,
    });
  }
  drawSketchGear(ctx, kneeRX, kneeRY, 3.8 * s, 6, tick5 * 0.25, {
    color: inkColor,
    lineWidth: 1.3 * s,
    seed: seed + 15,
    alpha: 0.8,
  });
  drawSketchGear(ctx, hipX + 9 * s, hipY + 13 * s, 3.8 * s, 6, tick5 * 0.25, {
    color: inkColor,
    lineWidth: 1.3 * s,
    seed: seed + 16,
    alpha: 0.95,
  });
  // Steel plate feet
  drawSketchLine(ctx, footRX - 3 * s, footRY, footRX + 8 * s, footRY, { color: inkColor, lineWidth: 2.8 * s, roughness: 0.3, seed: seed + 17 });
  drawSketchLine(ctx, hipX + 7 * s, cy + 45 * s, hipX + 18 * s, cy + 45 * s, { color: inkColor, lineWidth: 2.8 * s, roughness: 0.3, seed: seed + 18 });

  // Inverted-trapezoid boiler torso (wide shoulders, narrower waist)
  const shHalf = 15 * s;
  const waHalf = 10.5 * s;

  // Folded paper wings (3 short angled strokes behind shoulder) + recessed rocket pod
  for (let wi = 0; wi < 3; wi++) {
    drawSketchLine(
      ctx,
      hipX - (shHalf - 1 * s),
      shoulderY + (3 + wi * 3.5) * s,
      hipX - (shHalf + 8 * s - wi * 1.4 * s),
      shoulderY + (-2 + wi * 3.8) * s,
      { color: '#334155', lineWidth: 1.4 * s, roughness: 0.3, seed: seed + 18.2 + wi, passes: 1, alpha: 0.85 },
    );
  }
  drawSketchCircle(ctx, hipX - waHalf - 2.2 * s, hipY - 5 * s, 3.2 * s, {
    color: inkColor,
    lineWidth: 1.2 * s,
    roughness: 0.25,
    seed: seed + 19,
    passes: 1,
  });
  drawSketchCircle(ctx, hipX - waHalf - 2.2 * s, hipY - 5 * s, 1.8 * s, {
    color: '#0D9488',
    lineWidth: 1.0 * s,
    roughness: 0.2,
    seed: seed + 19.5,
    passes: 1,
  });

  const torsoPts = [
    { x: hipX - shHalf, y: shoulderY - 2 * s },
    { x: hipX + shHalf, y: shoulderY - 2 * s },
    { x: hipX + waHalf, y: hipY },
    { x: hipX - waHalf, y: hipY },
    { x: hipX - shHalf, y: shoulderY - 2 * s },
  ];
  ctx.save();
  ctx.fillStyle = '#E2E8F0';
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(torsoPts[0].x, torsoPts[0].y);
  for (let i = 1; i < torsoPts.length; i++) ctx.lineTo(torsoPts[i].x, torsoPts[i].y);
  ctx.fill();
  ctx.restore();

  // Horizontal grey pencil hatching & weld seam
  for (let hi = 0; hi < 5; hi++) {
    const t = 0.16 + hi * 0.17;
    const hw = shHalf + (waHalf - shHalf) * t - 2 * s;
    const hy = shoulderY + (hipY - shoulderY) * t;
    drawSketchLine(ctx, hipX - hw, hy, hipX + hw, hy, {
      color: '#64748B',
      lineWidth: 0.9 * s,
      roughness: 0.3,
      seed: seed + 30 + hi,
      passes: 1,
      alpha: 0.45,
    });
  }
  drawSketchPolyline(ctx, torsoPts, {
    color: inkColor,
    lineWidth: 2.5 * s,
    roughness: 0.4,
    seed: seed + 20,
    passes: 2,
  });
  // Tight double weld across middle
  const weldY = (shoulderY + hipY) * 0.5 + 3 * s;
  drawSketchLine(ctx, hipX - 11 * s, weldY, hipX + 11 * s, weldY, { color: '#334155', lineWidth: 1.2 * s, roughness: 0.25, seed: seed + 22, passes: 1 });
  drawSketchLine(ctx, hipX - 11 * s, weldY + 2 * s, hipX + 11 * s, weldY + 2 * s, { color: '#334155', lineWidth: 1.2 * s, roughness: 0.25, seed: seed + 23, passes: 1 });
  // Scattered orange-brown rust spots
  ctx.save();
  ctx.fillStyle = '#B45309';
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.arc(hipX - 8 * s, shoulderY + 6 * s, 1.8 * s, 0, Math.PI * 2);
  ctx.arc(hipX + 7 * s, hipY - 5 * s, 2.0 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // "LS-01" handwritten text on belly
  ctx.save();
  ctx.font = `bold ${Math.round(7.5 * s)}px "Patrick Hand", cursive, sans-serif`;
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'center';
  ctx.fillText('LS-01', hipX, hipY - 3 * s);
  ctx.restore();

  // Chest pressure gauge (teal dial)
  drawSketchGauge(ctx, hipX + 2 * s, shoulderY + 6.5 * s, 6.2 * s, 0.28 + Math.sin(tSec * 2) * 0.08, {
    color: inkColor,
    gaugeColor: '#0D9488',
    lineWidth: 1.4 * s,
    seed: seed + 40,
  });

  // Right-shoulder chimney + small curved steam puffs
  const chimX = hipX - 11 * s;
  const chimY = shoulderY - 2 * s;
  drawSketchPolyline(
    ctx,
    [
      { x: chimX - 2.5 * s, y: chimY },
      { x: chimX - 2.5 * s, y: chimY - 9 * s },
      { x: chimX + 2.5 * s, y: chimY - 9 * s },
      { x: chimX + 2.5 * s, y: chimY },
    ],
    { color: '#334155', lineWidth: 1.8 * s, roughness: 0.3, seed: seed + 45, passes: 1 },
  );
  const puffY = chimY - 12 * s - ((tSec * 14) % 10) * s;
  drawSketchCircle(ctx, chimX, puffY, 2.6 * s, { color: '#64748B', lineWidth: 1.1 * s, roughness: 0.6, seed: seed + 46, passes: 1, alpha: 0.65 });

  // Arms + gear elbows + V-claw pliers hands
  const elbLX = hipX + 16 * s;
  const elbLY = shoulderY + 10 * s;
  const handLX = hipX + 20 * s;
  const handLY = shoulderY + 19 * s;
  drawSketchLine(ctx, hipX + shHalf - 1 * s, shoulderY + 2 * s, elbLX, elbLY, { color: inkColor, lineWidth: 2.3 * s, roughness: 0.35, seed: seed + 50, passes: 2 });
  drawSketchLine(ctx, elbLX, elbLY, handLX, handLY, { color: inkColor, lineWidth: 2.3 * s, roughness: 0.35, seed: seed + 51, passes: 2 });
  drawSketchGear(ctx, elbLX, elbLY, 3.6 * s, 6, tick5 * 0.2, { color: inkColor, lineWidth: 1.2 * s, seed: seed + 52 });
  // Pliers V-claw hand
  drawSketchLine(ctx, handLX, handLY, handLX + 4 * s, handLY - 3 * s, { color: inkColor, lineWidth: 1.8 * s, roughness: 0.3, seed: seed + 53, passes: 1 });
  drawSketchLine(ctx, handLX, handLY, handLX + 5 * s, handLY + 2.5 * s, { color: inkColor, lineWidth: 1.8 * s, roughness: 0.3, seed: seed + 54, passes: 1 });

  // Spring neck (4 coils)
  drawSketchSpring(ctx, hipX + 1 * s, shoulderY - 2 * s, headX, headY + 8 * s, 4, 6.2 * s, {
    color: inkColor,
    lineWidth: 1.7 * s,
    seed: seed + 58,
  });

  // Coiled antenna + dot tip
  const antSway = Math.sin(tSec * 2.5) * 2 * s;
  drawSketchSpring(ctx, headX - 4 * s, headY - 9 * s, headX - 5 * s + antSway, headY - 20 * s, 3, 3.6 * s, {
    color: '#334155',
    lineWidth: 1.4 * s,
    seed: seed + 60,
  });
  drawSketchCircle(ctx, headX - 5 * s + antSway, headY - 20 * s, 2 * s, { color: '#0D9488', lineWidth: 1.6 * s, seed: seed + 61 });

  // Box tin-can head (slightly tilted)
  const bw = 19 * s;
  const bh = 17 * s;
  drawSketchPolyline(
    ctx,
    [
      { x: headX - bw * 0.5, y: headY - bh * 0.5 },
      { x: headX + bw * 0.5, y: headY - bh * 0.5 },
      { x: headX + bw * 0.5, y: headY + bh * 0.5 },
      { x: headX - bw * 0.5, y: headY + bh * 0.5 },
      { x: headX - bw * 0.5, y: headY - bh * 0.5 },
    ],
    { color: inkColor, lineWidth: 2.4 * s, roughness: 0.4, seed: seed + 65, passes: 2 },
  );
  // Cyclops double-circle lens + teal LED dot + speaker-grille mouth
  drawSketchCircle(ctx, headX + 3 * s, headY - 1.5 * s, 4.3 * s, { color: '#0F172A', lineWidth: 1.5 * s, seed: seed + 67, passes: 1 });
  drawSketchCircle(ctx, headX + 3 * s, headY - 1.5 * s, 2.3 * s, { color: '#0F172A', lineWidth: 1.2 * s, seed: seed + 68, passes: 1 });
  ctx.save();
  ctx.fillStyle = '#0D9488';
  ctx.beginPath();
  ctx.arc(headX - 5.2 * s, headY - 3.5 * s, 1.8 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  for (let mi = -2; mi <= 2; mi++) {
    drawSketchLine(ctx, headX + mi * 2.1 * s, headY + 4.5 * s, headX + mi * 2.1 * s, headY + 7.2 * s, {
      color: '#334155',
      lineWidth: 1.2 * s,
      roughness: 0.2,
      seed: seed + 72 + mi,
      passes: 1,
    });
  }
}

function drawHeBongBayCardPortrait(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  inkColor: string,
  _accentColor: string,
  boilTick: number,
  tSec: number,
) {
  const s = scale * 0.96;
  const seed = 3917 + Math.floor(tSec * 10) * 11.7 + boilTick * 7.3;
  const bob = Math.sin(tSec * 3.8) * 1.8 * s;
  const hipX = cx;
  const hipY = cy + 12 * s + bob;
  const shX = cx;
  const shY = cy - 11 * s + bob;
  const headX = cx;
  const headY = cy - 23 * s + bob;

  // Oversized curved clown shoes
  drawSketchLine(ctx, hipX - 6 * s, hipY, hipX - 9 * s, hipY + 14 * s, { color: inkColor, lineWidth: 2.1 * s, seed: seed + 1 });
  drawSketchLine(ctx, hipX + 6 * s, hipY, hipX + 9 * s, hipY + 14 * s, { color: inkColor, lineWidth: 2.1 * s, seed: seed + 2 });
  drawSketchCircle(ctx, hipX - 13 * s, hipY + 15 * s, 5.2 * s, { color: '#DC2626', lineWidth: 2.1 * s, seed: seed + 3 });
  drawSketchCircle(ctx, hipX + 13 * s, hipY + 15 * s, 5.2 * s, { color: '#DC2626', lineWidth: 2.1 * s, seed: seed + 4 });

  // Ruffled waist + balloon oval torso
  ctx.save();
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 2.2 * s;
  ctx.beginPath();
  ctx.ellipse(cx, (hipY + shY) * 0.5, 11.5 * s, 12.5 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // Festive bow-tie & checkered pocket
  drawSketchCircle(ctx, shX, shY + 3 * s, 2.5 * s, { color: '#F59E0B', lineWidth: 1.8 * s, seed: seed + 6 });
  drawSketchLine(ctx, shX - 6 * s, shY + 1 * s, shX + 6 * s, shY + 5 * s, { color: '#7C3AED', lineWidth: 2 * s, seed: seed + 7 });
  drawSketchLine(ctx, shX + 6 * s, shY + 1 * s, shX - 6 * s, shY + 5 * s, { color: '#7C3AED', lineWidth: 2 * s, seed: seed + 8 });

  // Raised juggling arms + 3 floating colorful juggling balls
  const lHandX = shX - 19 * s;
  const lHandY = shY - 2 * s + Math.sin(tSec * 6) * 2.5 * s;
  const rHandX = shX + 19 * s;
  const rHandY = shY - 2 * s - Math.sin(tSec * 6) * 2.5 * s;
  drawSketchLine(ctx, shX - 8 * s, shY + 2 * s, lHandX, lHandY, { color: inkColor, lineWidth: 2 * s, seed: seed + 10 });
  drawSketchLine(ctx, shX + 8 * s, shY + 2 * s, rHandX, rHandY, { color: inkColor, lineWidth: 2 * s, seed: seed + 11 });
  drawSketchCircle(ctx, lHandX, lHandY, 3.8 * s, { color: '#475569', lineWidth: 1.8 * s, seed: seed + 12 });
  drawSketchCircle(ctx, rHandX, rHandY, 3.8 * s, { color: '#475569', lineWidth: 1.8 * s, seed: seed + 13 });

  const ballCols = ['#DC2626', '#F59E0B', '#2563EB'];
  for (let bi = 0; bi < 3; bi++) {
    const ph = tSec * 4.4 + (bi * Math.PI * 2) / 3;
    const bx = cx + Math.cos(ph) * 16 * s;
    const by = headY - 11 * s - Math.abs(Math.sin(ph)) * 12 * s;
    ctx.save();
    ctx.fillStyle = ballCols[bi];
    ctx.beginPath();
    ctx.arc(bx, by, 3.3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Head, curly side hair, red clown nose, grin & tilted purple cone hat
  drawSketchCircle(ctx, headX, headY, 9.6 * s, { color: inkColor, lineWidth: 2.3 * s, seed: seed + 16 });
  // Big red clown nose
  ctx.save();
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(headX + 4.5 * s, headY - 0.5 * s, 3.4 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawSketchCircle(ctx, headX + 4.5 * s, headY - 0.5 * s, 3.4 * s, { color: '#991B1B', lineWidth: 1.4 * s, seed: seed + 18, passes: 1 });
  // Grin
  ctx.save();
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.7 * s;
  ctx.beginPath();
  ctx.arc(headX + 1.5 * s, headY + 2 * s, 4.5 * s, 0.2, Math.PI - 0.3);
  ctx.stroke();
  ctx.restore();
  // Tilted purple party cone hat with gold pom-pom
  const hatTopX = headX - 7 * s;
  const hatTopY = headY - 22 * s;
  drawSketchPolyline(
    ctx,
    [
      { x: headX - 8 * s, y: headY - 7 * s },
      { x: hatTopX, y: hatTopY },
      { x: headX + 4 * s, y: headY - 9 * s },
    ],
    { color: '#7C3AED', lineWidth: 2.2 * s, seed: seed + 20, passes: 2 },
  );
  drawSketchCircle(ctx, hatTopX, hatTopY, 3.2 * s, { color: '#F59E0B', lineWidth: 2 * s, seed: seed + 22 });
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  normal: {
    id: 'normal',
    name: 'Thường',
    subtitle: 'Người Que chuẩn',
    description: 'Nhanh nhẹn, linh hoạt, thuần thục tay không lẫn mọi vũ khí.',
    scale: 1,
    limbLength: 1,
    lineWidth: 1,
    hitbox: 1,
    jitterFps: 8,
    hp: 1,
    moveSpeed: 1,
    damageDealt: 1,
    knockbackDealt: 1,
    knockbackTaken: 1,
    phaseTime: { windup: 1, strike: 1, recovery: 1 },
    trait: { id: 'none' },
    affinity: {
      hammer: 'neutral',
      shield: 'neutral',
      unarmed: 'neutral',
      sword: 'neutral',
      bat: 'neutral',
      spear: 'neutral',
    },
    ai: { style: 'balanced' },
    visual: {
      bellyScale: 0,
      headScale: 1,
      torsoRatio: 1,
      neckRatio: 1,
      legRatio: 1,
      armRatio: 1,
      fistScale: 1,
      shoeScale: 0,
      footFlat: false,
      kneeKnobs: false,
      beard: false,
      hairTufts: 0,
      hairStrands: 0,
      glasses: false,
      cheekBandage: false,
      faceStyle: 'standard',
      scarfStyle: 'headband',
      scarfTailLines: 1,
      sockStripes: 0,
      jitterFps: 8,
      doublePasses: 2,
      secondPassOffsetY: 0,
      waveAmp: 0,
      doubleStrokeRoughness: 1,
      shadowAlpha: 0.25,
      stepShake: 0,
      swordDrawScale: 1,
      batDrawScale: 1,
      spearDrawScale: 1,
      hammerDrawScale: 1,
      shieldDrawScale: 1,
    },
    statTags: ['300 Máu', 'Cân bằng', 'Đa năng'],
    entrance: {
      duration: 0.46,
      jumpHeight: 125,
      tauntDuration: 0.68,
      tauntText: 'CHIẾN NÀO!',
      tauntStyle: 'stickman_flex',
    },
    drawPortrait: drawNormalCardPortrait,
  },

  bucon: {
    id: 'bucon',
    name: 'Bự Con',
    subtitle: 'Hạng nặng da dày',
    description: 'Cao lớn, lì đòn không ngắt gồng nhẹ, áp sát và cuồng nộ dưới 30% máu.',
    scale: 1.35,
    limbLength: 1,
    lineWidth: 1.4,
    hitbox: 1.35,
    jitterFps: 8,
    hp: 1.6,
    moveSpeed: 0.7,
    damageDealt: 1.15,
    knockbackDealt: 1.3,
    knockbackTaken: 0.5,
    phaseTime: { windup: 1.3, strike: 1.0, recovery: 1.4 },
    trait: { id: 'thickSkin', armorPhase: 'windup', armorBelowDmg: 12 },
    affinity: {
      hammer: 'strong',
      shield: 'strong',
      unarmed: 'good',
      sword: 'neutral',
      bat: 'neutral',
      spear: 'weak',
    },
    ai: { style: 'steadyAdvance', rageBelowHp: 0.3 },
    visual: {
      bellyScale: 1,
      headScale: 1.16,
      torsoRatio: 1,
      neckRatio: 1,
      legRatio: 1,
      armRatio: 1,
      fistScale: 1.55,
      shoeScale: 0,
      footFlat: false,
      kneeKnobs: false,
      beard: true,
      hairTufts: 0,
      hairStrands: 0,
      glasses: false,
      cheekBandage: false,
      faceStyle: 'standard',
      scarfStyle: 'headband',
      scarfTailLines: 1,
      sockStripes: 0,
      jitterFps: 8,
      doublePasses: 2,
      secondPassOffsetY: 0,
      waveAmp: 0,
      doubleStrokeRoughness: 1.48,
      shadowAlpha: 0.46,
      stepShake: 1.45,
      swordDrawScale: 0.66,
      batDrawScale: 1,
      spearDrawScale: 1,
      hammerDrawScale: 1,
      shieldDrawScale: 1,
    },
    statTags: ['480 Máu', 'Da dày', 'Búa & Khiên'],
    entrance: {
      duration: 0.54,
      jumpHeight: 112,
      tauntDuration: 0.78,
      tauntText: 'HỪM!',
      tauntStyle: 'bucon_stomp',
    },
    drawPortrait: drawBuConCardPortrait,
  },

  nhoc: {
    id: 'nhoc',
    name: 'Nhóc',
    subtitle: 'Nhanh nhẹn lộn né',
    description: 'Nhỏ con, cực nhanh, lộn người ra sau né đòn active và quấy rối rỉa máu.',
    scale: 0.7,
    limbLength: 1,
    lineWidth: 0.85,
    hitbox: 0.75,
    jitterFps: 12,
    hp: 0.7,
    moveSpeed: 1.35,
    damageDealt: 0.8,
    knockbackDealt: 0.7,
    knockbackTaken: 1.5,
    phaseTime: { windup: 0.8, strike: 0.9, recovery: 0.75 },
    trait: {
      id: 'rollDodge',
      cooldown: 4.0,
      invuln: 0.25,
      cannotDodge: ['windup', 'aoe', 'recovery', 'stunned'],
    },
    affinity: {
      sword: 'strong',
      unarmed: 'strong',
      spear: 'good',
      bat: 'neutral',
      hammer: 'weak',
      shield: 'weak',
    },
    ai: {
      style: 'hitAndRun',
      preferredRange: 'midFar',
      aggression: 0.6,
      panicBelowHp: 0.3,
      panicCooldownMul: 0.5,
    },
    visual: {
      bellyScale: 0,
      headScale: 1.38,
      torsoRatio: 0.65,
      neckRatio: 1,
      legRatio: 0.9,
      armRatio: 0.86,
      fistScale: 1.45,
      shoeScale: 1.8,
      footFlat: false,
      kneeKnobs: false,
      beard: false,
      hairTufts: 3,
      hairStrands: 0,
      glasses: false,
      cheekBandage: true,
      faceStyle: 'nhoc',
      scarfStyle: 'neck',
      scarfColor: '#F97316',
      scarfTailLines: 3,
      sockStripes: 0,
      jitterFps: 12,
      doublePasses: 1,
      secondPassOffsetY: 0,
      waveAmp: 0,
      doubleStrokeRoughness: 0.48,
      shadowAlpha: 0.24,
      stepShake: 0,
      swordDrawScale: 1.15,
      batDrawScale: 1.24,
      spearDrawScale: 2.35,
      hammerDrawScale: 1.72,
      shieldDrawScale: 1.45,
    },
    statTags: ['210 Máu', 'Lộn né', 'Kiếm & Tay không'],
    entrance: {
      duration: 0.4,
      jumpHeight: 155,
      tauntDuration: 0.62,
      tauntText: 'HÊ HÊ!',
      tauntStyle: 'nhoc_hop',
    },
    drawPortrait: drawNhocCardPortrait,
  },

  caokieu: {
    id: 'caokieu',
    name: 'Cao Kều',
    subtitle: 'Giữ thước tầm xa',
    description: 'Tay chân dài ngoằng, đánh đau nhất đúng tầm ngọt và tự sải bước lùi sau mỗi đòn.',
    scale: 1.45,
    limbLength: 1.3,
    lineWidth: 0.9,
    hitbox: 1.15,
    jitterFps: 6,
    hp: 0.85,
    moveSpeed: 1.0,
    damageDealt: 0.95,
    knockbackDealt: 1.0,
    knockbackTaken: 1.25,
    phaseTime: { windup: 1.15, strike: 1.1, recovery: 1.1 },
    trait: {
      id: 'sweetSpot',
      sweetBand: [0.8, 1.0],
      sweetDamageMul: 1.25,
      sweetKnockbackMul: 1.15,
      sweetRecoveryMul: 0.85,
      deadBelow: 0.5,
      deadDamageMul: 0.85,
      deadWindupMul: 1.2,
      measureAt: ['windupStart', 'strikeStart'],
      recoverySlide: { distanceR: 0.4, perStrike: 1, blockedIfBackMarginBelow: 0.1 },
      ignores: ['aoe', 'thrownShield', 'drawnWeapon'],
    },
    affinity: {
      spear: 'strong',
      sword: 'good',
      bat: 'neutral',
      unarmed: 'neutral',
      hammer: 'weak',
      shield: 'weak',
    },
    ai: {
      style: 'zoner',
      preferredRange: 'sweetSpot',
      aggression: 0.45,
      maxComboBeatsInSweet: 2,
      cornerThreshold: 0.1,
      overreachBelowHp: 0.3,
      overreach: { band: [0.7, 1.1], reachMul: 1.1, moveSpeedMul: 0.85, duration: 6 },
    },
    visual: {
      bellyScale: 0,
      headScale: 0.62,
      torsoRatio: 1.2,
      neckRatio: 1.9,
      legRatio: 1,
      armRatio: 1,
      fistScale: 0.62,
      shoeScale: 0,
      footFlat: true,
      kneeKnobs: true,
      beard: false,
      hairTufts: 0,
      hairStrands: 2,
      glasses: true,
      cheekBandage: false,
      faceStyle: 'caokieu',
      scarfStyle: 'tie',
      scarfColor: '#16A34A',
      scarfTailLines: 1,
      sockStripes: 5,
      sockColor: '#FDE047',
      jitterFps: 6,
      doublePasses: 2,
      secondPassOffsetY: -2.4,
      waveAmp: 1.45,
      doubleStrokeRoughness: 0.52,
      shadowAlpha: 0.22,
      stepShake: 0,
      swordDrawScale: 1.18,
      batDrawScale: 1.08,
      spearDrawScale: 1.25,
      hammerDrawScale: 1.12,
      shieldDrawScale: 0.8,
    },
    statTags: ['255 Máu', 'Tầm ngọt', 'Giáo & Kiếm'],
    entrance: {
      duration: 0.52,
      jumpHeight: 118,
      tauntDuration: 0.72,
      tauntText: 'KHOAN ĐÃ.',
      tauntStyle: 'caokieu_push_glasses',
    },
    drawPortrait: drawCaoKieuCardPortrait,
  },

  lonsat: {
    id: 'lonsat',
    name: 'Lon Sắt',
    subtitle: 'Lò hơi công nghiệp',
    description: 'Thân thép lỳ đòn tích nhiệt khi chịu đòn, xả hơi diện rộng ở 100 nhiệt rồi quá nhiệt.',
    scale: 1.25,
    limbLength: 1,
    lineWidth: 1.3,
    hitbox: 1.15,
    jitterFps: 5,
    coarseMotion: true,
    hp: 1.35,
    moveSpeed: 0.75,
    damageDealt: 1.0,
    knockbackDealt: 1.15,
    knockbackTaken: 0.6,
    phaseTime: { windup: 1.15, strike: 0.9, recovery: 1.2 },
    trait: {
      id: 'boiler',
      heatPerDmg: 2,
      maxHeat: 100,
      coolDelay: 2.5,
      coolRate: 5,
      delayVentWhen: ['stunned', 'pinned'],
      warmAt: 40,
      warmDmgMul: 1.08,
      hotAt: 75,
      hotDmgMul: 1.16,
      hotRecoveryMul: 0.9,
      ventWarnSec: 0.5,
      ventDamage: 12,
      ventKnockbackMul: 1.5,
      ventRadiusR: 1.0,
      ventExceptArmored: ['hammerBeat2'],
      overheatDuration: 3.0,
      overheatDamageTakenMul: 1.3,
      overheatMoveSpeedMul: 0.6,
      takeoff: {
        belowHp: 0.3,
        oncePerMatch: true,
        delayWhen: ['stunned', 'pinned'],
        megaVent: {
          warnTime: 0.5,
          radiusR: 1.8,
          damage: 15,
          knockbackDistanceR: 3.0,
          stun: 1.5,
          breaksCombo: true,
          exceptArmored: ['hammerBeat2'],
          dodgeable: false,
          resetHeatToZero: true,
          noOverheatAfter: true,
        },
        flight: {
          duration: 5.0,
          hoverHeightBody: 2.5,
          hoverDistanceR: 2.0,
          meleeUntouchable: true,
          noHeatGain: true,
          wingHp: 20,
          breakStun: 1.0,
          breakOverheat: 4.0,
          rockets: {
            smallCount: 3,
            smallStartAt: 0.75,
            smallInterval: 0.85,
            smallDamage: 8,
            smallBlastRadiusR: 0.45,
            smallSpeed: 620,
            smallKnockback: 0.85,
            bigAt: 3.55,
            bigDamage: 22,
            bigBlastRadiusR: 1.0,
            bigSpeed: 500,
            bigKnockback: 1.85,
            dodgeableByRoll: false,
          },
        },
        landing: {
          safeSpot: true,
          quake: 'small',
          stuck: 0.8,
          thenOverheat: 4.0,
        },
      },
    },
    affinity: {
      unarmed: 'strong',
      shield: 'good',
      hammer: 'neutral',
      sword: 'neutral',
      spear: 'weak',
      bat: 'weak',
    },
    ai: {
      style: 'boiler',
      preferredRange: 0.6,
      aggression: 0.55,
      takeoff: { trigger: 'belowHp', waitIfPinned: true },
    },
    visual: {
      bellyScale: 0,
      headScale: 1.05,
      torsoRatio: 1.04,
      neckRatio: 1,
      legRatio: 1,
      armRatio: 1,
      fistScale: 1.15,
      shoeScale: 0,
      footFlat: true,
      kneeKnobs: false,
      beard: false,
      hairTufts: 0,
      hairStrands: 0,
      glasses: false,
      cheekBandage: false,
      faceStyle: 'lonsat',
      scarfStyle: 'none',
      scarfTailLines: 0,
      sockStripes: 0,
      jitterFps: 5,
      doublePasses: 2,
      secondPassOffsetY: 0,
      waveAmp: 0,
      doubleStrokeRoughness: 0.58,
      shadowAlpha: 0.42,
      stepShake: 1.1,
      swordDrawScale: 1,
      batDrawScale: 1,
      spearDrawScale: 1,
      hammerDrawScale: 1.06,
      shieldDrawScale: 1.06,
      boilerLook: true,
      gaugeColor: '#0D9488',
      rustColor: '#B45309',
      serialNumber: 'LS-01',
      foldedWings: true,
      rocketPods: true,
      wings: { color: 'teal' },
      flame: { color: 'orange' },
    },
    statTags: ['405 Máu', 'Nồi hơi', 'Tay không & Khiên'],
    entrance: {
      duration: 0.52,
      jumpHeight: 96,
      tauntDuration: 0.76,
      tauntText: 'CẠCH... XÌ!',
      tauntStyle: 'lonsat_vent_rev',
    },
    drawPortrait: drawLonSatCardPortrait,
  },

  hebongbay: {
    id: 'hebongbay',
    name: 'Hề Bóng Bay',
    subtitle: 'Túi trò hề rạp xiếc',
    description: 'Nhảy nhót tung trò: vỏ chuối, bánh kem làm chậm đòn và hộp lò xo ở đòn chốt combo.',
    scale: 1.0,
    limbLength: 1,
    lineWidth: 1.0,
    hitbox: 1.0,
    jitterFps: 10,
    hp: 0.85,
    moveSpeed: 1.05,
    damageDealt: 0.85,
    knockbackDealt: 0.9,
    knockbackTaken: 1.3,
    phaseTime: { windup: 1.0, strike: 1.0, recovery: 1.1 },
    trait: {
      id: 'gagBag',
      triggerOn: 'finisherHitDealtDamage',
      sequence: ['bananaPeel', 'creamPie', 'jackBox'],
      advanceOnlyWhenPlaced: true,
      props: {
        bananaPeel: {
          lifetime: 6.0,
          max: 1,
          slipDuration: 0.8,
          damage: 6,
          triggersOn: ['moveOnto', 'pushedOnto'],
        },
        creamPie: {
          damage: 5,
          duration: 2.5,
          reachMul: 0.85,
          windupMul: 1.2,
        },
        jackBox: {
          fuse: 1.0,
          max: 1,
          radiusR: 0.7,
          damage: 9,
          distanceR: 0.8,
          immuneOwner: true,
        },
      },
      ignores: ['slip', 'pieFace'],
      finale: {
        belowHp: 0.3,
        oncePerMatch: true,
        duration: 6.0,
        gagOnEveryHit: true,
        moveSpeedMul: 1.15,
        thenOutOfTricks: {
          duration: 4.0,
          noGags: true,
          recoveryMul: 1.15,
        },
      },
    },
    affinity: {
      unarmed: 'strong',
      bat: 'strong',
      sword: 'good',
      hammer: 'neutral',
      spear: 'weak',
      shield: 'weak',
    },
    ai: {
      style: 'prankster',
      preferredRange: 1.2,
      aggression: 0.42,
      prioritizeFinisher: true,
      bailOutOnHeavyWindup: true,
      retreatBehindProp: true,
      avoidOwnPeel: true,
      punishWindow: 0.8,
    },
    visual: {
      bellyScale: 0.48,
      headScale: 1.08,
      torsoRatio: 1,
      neckRatio: 1,
      legRatio: 1,
      armRatio: 1,
      fistScale: 1.35,
      shoeScale: 1.5,
      footFlat: false,
      kneeKnobs: false,
      beard: false,
      hairTufts: 2,
      hairStrands: 0,
      glasses: false,
      cheekBandage: false,
      faceStyle: 'hebongbay',
      scarfStyle: 'neck',
      scarfColor: '#7C3AED',
      scarfTailLines: 2,
      sockStripes: 3,
      sockColor: '#F59E0B',
      jitterFps: 10,
      doublePasses: 2,
      secondPassOffsetY: 0,
      waveAmp: 0,
      doubleStrokeRoughness: 0.85,
      shadowAlpha: 0.28,
      stepShake: 0,
      swordDrawScale: 1.06,
      batDrawScale: 1.08,
      spearDrawScale: 1.0,
      hammerDrawScale: 1.1,
      shieldDrawScale: 1.05,
      clownLook: true,
    },
    statTags: ['255 Máu', 'Túi Trò Hề', 'Tay không & Gậy'],
    entrance: {
      duration: 0.44,
      jumpHeight: 135,
      tauntDuration: 0.76,
      tauntText: 'CHÀO KHÁN GIẢ!',
      tauntStyle: 'clown_juggle',
    },
    drawPortrait: drawHeBongBayCardPortrait,
  },
};

export const CHARACTER_LIST: CharacterDef[] = [
  CHARACTERS.normal,
  CHARACTERS.bucon,
  CHARACTERS.nhoc,
  CHARACTERS.caokieu,
  CHARACTERS.lonsat,
  CHARACTERS.hebongbay,
];

export function getCharacterDef(id: CharacterId): CharacterDef {
  return CHARACTERS[id] ?? CHARACTERS.normal;
}
