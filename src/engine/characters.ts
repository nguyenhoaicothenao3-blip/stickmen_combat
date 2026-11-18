import {
  drawSketchCircle,
  drawSketchGauge,
  drawSketchGear,
  drawSketchLine,
  drawSketchPolyline,
  drawSketchSpring,
} from './sketchDraw';
import { WeaponType } from './weapons';

export type CharacterId = 'normal' | 'bucon' | 'nhoc' | 'caokieu' | 'lonsat' | 'hebongbay' | 'ninja' | 'kysilon' | 'lon' | 'nguoisoi';

export type TauntStyle =
  | 'stickman_flex'
  | 'bucon_stomp'
  | 'nhoc_hop'
  | 'caokieu_push_glasses'
  | 'lonsat_vent_rev'
  | 'clown_juggle'
  | 'ninja_hand_seal'
  | 'kysilon_oink'
  | 'howl';

export type WeaponAffinityTier = 'strong' | 'good' | 'neutral' | 'weak';

export interface CharacterPhaseTime {
  windup: number;
  strike: number;
  recovery: number;
}

export type GagPropType = 'bananaPeel' | 'creamPie' | 'jackBox';

export interface CharacterTrait {
  id: 'none' | 'thickSkin' | 'rollDodge' | 'sweetSpot' | 'boiler' | 'gagBag' | 'escapeLeap' | 'pigMount' | 'pigCompanion' | 'moonForm';
  splitBelowHp?: number;
  splitOnKnockdown?: boolean;
  splitOnThrownShield?: boolean;
  neverEquipWeapon?: boolean;
  armorPhase?: 'windup';
  armorBelowDmg?: number;
  cooldown?: number;
  invuln?: number;
  cannotDodge?: Array<'windup' | 'aoe' | 'recovery' | 'stunned'>;
  nearEdge?: number;
  minConsecutiveHits?: number;
  needsLandingRoom?: boolean;
  leap?: {
    duration: number;
    landDistance: number;
    arcHeight?: number;
    clearsComboQueue: boolean;
    invulnerable: boolean;
  };
  shuriken?: {
    damage: number;
    knockback: number;
    hitOnce: boolean;
    blockable: boolean;
    throwAt: 'leapApex';
  };
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
  ignores?: Array<
    'aoe' | 'thrownShield' | 'drawnWeapon' | 'slip' | 'pieFace' | 'knockdown' | 'getup' | 'pinned' | 'homeRun' | 'noLandingRoom'
  >;
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
    duration?: number;
    gagOnEveryHit?: boolean;
    moveSpeedMul?: number;
    aiOnly?: boolean;
    thenOutOfTricks?: {
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
  moonForm?: {
    maxGauge: number;
    gainPerDamage: number;
    excludes: Array<'shieldThrow'>;
    transformDuration: number;
    transformAction: 'TAUNT';
    transformInterruptible: boolean;
    drainDuration: number;
    weaponStashOnTransform: boolean;
    wolfStats: {
      scale: number;
      hitbox: number;
      lineWidth: number;
      jitterFps: number;
      moveSpeed: number;
      damageDealt: number;
      knockbackDealt: number;
      knockbackTaken: number;
      phaseTime: CharacterPhaseTime;
    };
  };
}

export interface CharacterAIConfig {
  style:
    | 'balanced'
    | 'steadyAdvance'
    | 'hitAndRun'
    | 'zoner'
    | 'boiler'
    | 'prankster'
    | 'skirmisher'
    | 'gladiatorRider'
    | 'frontliner'
    | 'weaponUser'
    | 'moonHunter';
  rageBelowHp?: number;
  preferredRange?: 'midFar' | 'sweetSpot' | number;
  aggression?: number;
  aggressionByForm?: { human: number; wolf: number };
  pushWhenMoonHalfFull?: boolean;
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
  holdInPlaceBounce?: boolean;
  avoidEdgeWhenTraitCooling?: boolean;
  waitBelowHp?: number;
  holdBelowHp?: number;
  pigHeadbuttCooldown?: number;
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
  faceStyle: 'standard' | 'nhoc' | 'caokieu' | 'lonsat' | 'hebongbay' | 'ninja' | 'kysilon' | 'lon' | 'nguoisoi';
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
  ninjaLook?: boolean;
  pigRiderLook?: boolean;
  pigLook?: boolean;
  brownHelmet?: boolean;
  wolfLook?: boolean;
  moonIcon?: boolean;
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

function drawKySiLonCardPortrait(
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
  const tick8 = Math.floor(tSec * 8);
  const seed = 7731 + tick8 * 13.7;
  const bounce = Math.sin(tSec * 7.2) * 1.1 * s;
  const pigX = cx - 2 * s;
  const pigY = cy + 12 * s + bounce * 0.5;
  const lw = 1.85 * s;

  // Pig plump belly wash + outline
  ctx.save();
  ctx.fillStyle = 'rgba(253, 164, 175, 0.25)';
  ctx.beginPath();
  ctx.ellipse(pigX, pigY, 17.5 * s, 11.5 * s, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawSketchPolyline(
    ctx,
    [
      { x: pigX - 16.5 * s, y: pigY - 2 * s },
      { x: pigX - 10 * s, y: pigY - 10.5 * s },
      { x: pigX + 6 * s, y: pigY - 11 * s },
      { x: pigX + 16.5 * s, y: pigY - 4.5 * s },
      { x: pigX + 17.5 * s, y: pigY + 4.5 * s },
      { x: pigX + 8 * s, y: pigY + 10.5 * s },
      { x: pigX - 10 * s, y: pigY + 10 * s },
      { x: pigX - 16.5 * s, y: pigY + 3 * s },
      { x: pigX - 16.5 * s, y: pigY - 2 * s },
    ],
    { color: inkColor, lineWidth: lw, roughness: 0.55, seed: seed + 1, passes: 2 },
  );

  // Curly tail
  drawSketchPolyline(
    ctx,
    [
      { x: pigX - 16 * s, y: pigY - 3 * s },
      { x: pigX - 21 * s, y: pigY - 7 * s },
      { x: pigX - 19 * s, y: pigY - 11 * s },
      { x: pigX - 23 * s, y: pigY - 9 * s },
    ],
    { color: inkColor, lineWidth: 1.5 * s, roughness: 0.45, seed: seed + 2, passes: 1 },
  );

  // Four pig legs with dark hooves
  const legSwing = Math.sin(tSec * 7.2) * 2.2 * s;
  const legs = [
    { x: pigX - 10 * s, dx: legSwing * 0.7 },
    { x: pigX - 4 * s, dx: -legSwing * 0.6 },
    { x: pigX + 7 * s, dx: -legSwing * 0.7 },
    { x: pigX + 12 * s, dx: legSwing * 0.8 },
  ];
  for (let i = 0; i < legs.length; i++) {
    const lx = legs[i].x;
    const ly = pigY + 8 * s;
    const fx = lx + legs[i].dx;
    const fy = cy + 29 * s;
    drawSketchLine(ctx, lx, ly, fx, fy, {
      color: inkColor,
      lineWidth: 1.75 * s,
      roughness: 0.4,
      seed: seed + 10 + i,
      passes: 1,
    });
    drawSketchLine(ctx, fx - 1.5 * s, fy, fx + 2.2 * s, fy, {
      color: '#451A03',
      lineWidth: 2.3 * s,
      roughness: 0.25,
      seed: seed + 20 + i,
      passes: 1,
    });
  }

  // Pig snout + nostrils + ear + eye
  const snoutX = pigX + 20.5 * s;
  const snoutY = pigY - 1.5 * s;
  ctx.save();
  ctx.fillStyle = 'rgba(244, 114, 182, 0.22)';
  ctx.beginPath();
  ctx.ellipse(snoutX, snoutY, 4.2 * s, 5.2 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawSketchCircle(ctx, snoutX, snoutY, 4.4 * s, {
    color: inkColor,
    lineWidth: 1.6 * s,
    roughness: 0.4,
    seed: seed + 30,
    passes: 1,
  });
  ctx.save();
  ctx.fillStyle = inkColor;
  ctx.beginPath();
  ctx.arc(snoutX - 0.8 * s, snoutY - 1.1 * s, 0.9 * s, 0, Math.PI * 2);
  ctx.arc(snoutX + 1.2 * s, snoutY - 0.7 * s, 0.9 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Pig ear
  drawSketchPolyline(
    ctx,
    [
      { x: pigX + 10 * s, y: pigY - 9.5 * s },
      { x: pigX + 13.5 * s, y: pigY - 15.5 * s },
      { x: pigX + 16 * s, y: pigY - 8 * s },
    ],
    { color: inkColor, lineWidth: 1.5 * s, roughness: 0.4, seed: seed + 31, passes: 1 },
  );
  // Pig eye
  ctx.save();
  ctx.fillStyle = inkColor;
  ctx.beginPath();
  ctx.arc(pigX + 13.5 * s, pigY - 5 * s, 1.3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Saddle strap on pig back
  drawSketchPolyline(
    ctx,
    [
      { x: pigX - 5 * s, y: pigY - 10.5 * s },
      { x: pigX - 4 * s, y: pigY - 2 * s },
      { x: pigX + 3 * s, y: pigY - 2 * s },
      { x: pigX + 4 * s, y: pigY - 10.5 * s },
    ],
    { color: '#92400E', lineWidth: 1.7 * s, roughness: 0.35, seed: seed + 35, passes: 1 },
  );

  // Rider sitting on saddle (0.8x mini stickman + curved brown helmet)
  const riderHipX = pigX - 1 * s;
  const riderHipY = pigY - 10.5 * s + bounce * 0.8;
  const riderShoulderX = riderHipX + 1.5 * s;
  const riderShoulderY = riderHipY - 11.5 * s;
  const riderHeadX = riderShoulderX + 0.5 * s;
  const riderHeadY = riderShoulderY - 6.5 * s;

  // Rider torso + seated leg gripping pig side
  drawSketchLine(ctx, riderHipX, riderHipY, riderShoulderX, riderShoulderY, {
    color: inkColor,
    lineWidth: 1.7 * s,
    roughness: 0.4,
    seed: seed + 40,
    passes: 2,
  });
  drawSketchPolyline(
    ctx,
    [
      { x: riderHipX, y: riderHipY },
      { x: riderHipX + 5 * s, y: riderHipY + 3.5 * s },
      { x: riderHipX + 3.5 * s, y: riderHipY + 8.5 * s },
    ],
    { color: inkColor, lineWidth: 1.6 * s, roughness: 0.4, seed: seed + 41, passes: 1 },
  );

  // Rider arm holding taut reins to pig snout
  const handX = riderShoulderX + 6.5 * s;
  const handY = riderShoulderY + 4.5 * s;
  drawSketchLine(ctx, riderShoulderX, riderShoulderY, handX, handY, {
    color: inkColor,
    lineWidth: 1.55 * s,
    roughness: 0.35,
    seed: seed + 42,
    passes: 1,
  });
  // Taut rein
  drawSketchLine(ctx, handX, handY, pigX + 15.5 * s, snoutY - 3 * s, {
    color: '#92400E',
    lineWidth: 1.35 * s,
    roughness: 0.25,
    seed: seed + 43,
    passes: 1,
  });

  // Mini spear held upright behind
  drawSketchLine(ctx, riderShoulderX - 5 * s, riderHipY + 2 * s, riderShoulderX + 9 * s, riderHeadY - 11 * s, {
    color: '#78350F',
    lineWidth: 1.5 * s,
    roughness: 0.3,
    seed: seed + 44,
    passes: 1,
  });

  // Rider head + curved brown helmet (#92400E)
  drawSketchCircle(ctx, riderHeadX, riderHeadY, 4.8 * s, {
    color: inkColor,
    lineWidth: 1.65 * s,
    roughness: 0.38,
    seed: seed + 45,
    passes: 2,
  });
  ctx.save();
  ctx.fillStyle = 'rgba(146, 64, 14, 0.28)';
  ctx.beginPath();
  ctx.arc(riderHeadX, riderHeadY - 0.5 * s, 5.5 * s, Math.PI * 1.02, Math.PI * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  drawSketchPolyline(
    ctx,
    [
      { x: riderHeadX - 5.5 * s, y: riderHeadY - 0.5 * s },
      { x: riderHeadX - 3.5 * s, y: riderHeadY - 6 * s },
      { x: riderHeadX + 2.5 * s, y: riderHeadY - 6.2 * s },
      { x: riderHeadX + 5.8 * s, y: riderHeadY - 0.5 * s },
      { x: riderHeadX - 5.5 * s, y: riderHeadY - 0.5 * s },
    ],
    { color: '#92400E', lineWidth: 1.65 * s, roughness: 0.32, seed: seed + 46, passes: 2 },
  );
  // Rider determined dot eye
  ctx.save();
  ctx.fillStyle = inkColor;
  ctx.beginPath();
  ctx.arc(riderHeadX + 2.2 * s, riderHeadY + 1.2 * s, 0.9 * s, 0, Math.PI * 2);
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

function drawNinjaCardPortrait(
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
  const seed = 680 + boilTick * 11.7;
  const bob = Math.abs(Math.sin(tSec * 6.5)) * 2.2 * s;
  const hipX = cx - 2 * s;
  const hipY = cy + 16 * s - bob * 0.6;
  const shX = hipX + 6 * s;
  const shY = hipY - 22 * s;
  const headX = shX + 2.5 * s;
  const headY = shY - 12 * s;

  // 3 flowing black headband tails
  for (let ti = 0; ti < 3; ti++) {
    const wave = Math.sin(tSec * 7.2 + ti * 1.1) * 2.2 * s;
    drawSketchPolyline(
      ctx,
      [
        { x: headX - 6 * s, y: headY - 4 * s },
        { x: headX - 18 * s, y: headY - 6 * s + (ti - 1) * 3.2 * s + wave * 0.5 },
        { x: headX - 30 * s, y: headY - 3 * s + (ti - 1) * 4.5 * s + wave },
      ],
      { color: '#0F172A', lineWidth: 1.5 * s, roughness: 0.45, seed: seed + 1 + ti, passes: 1 },
    );
  }

  // Low crouched ninja stance legs
  drawSketchLine(ctx, hipX, hipY, hipX - 11 * s, hipY + 9 * s, { color: inkColor, lineWidth: 2.1 * s, roughness: 0.45, seed: seed + 5, passes: 1, alpha: 0.78 });
  drawSketchLine(ctx, hipX - 11 * s, hipY + 9 * s, hipX - 15 * s, hipY + 23 * s, { color: inkColor, lineWidth: 2.1 * s, roughness: 0.45, seed: seed + 6, passes: 1, alpha: 0.78 });
  drawSketchLine(ctx, hipX, hipY, hipX + 10 * s, hipY + 8 * s, { color: inkColor, lineWidth: 2.1 * s, roughness: 0.45, seed: seed + 7, passes: 1 });
  drawSketchLine(ctx, hipX + 10 * s, hipY + 8 * s, hipX + 11 * s, hipY + 23 * s, { color: inkColor, lineWidth: 2.1 * s, roughness: 0.45, seed: seed + 8, passes: 1 });

  // Torso + black diagonal sash
  drawSketchLine(ctx, hipX, hipY, shX, shY, { color: inkColor, lineWidth: 2.3 * s, roughness: 0.45, seed: seed + 9, passes: 1 });
  drawSketchLine(ctx, shX - 2 * s, shY + 2 * s, hipX + 2.5 * s, hipY - 2 * s, { color: '#0F172A', lineWidth: 2.8 * s, roughness: 0.35, seed: seed + 10, passes: 1 });

  // Purple shuriken peeking out of hip pouch
  const pouchX = hipX - 5 * s;
  const pouchY = hipY - 3 * s;
  drawSketchCircle(ctx, pouchX, pouchY, 3.2 * s, { color: '#0F172A', lineWidth: 1.3 * s, roughness: 0.3, seed: seed + 11, passes: 1 });
  drawSketchLine(ctx, pouchX - 5 * s, pouchY, pouchX + 5 * s, pouchY, { color: '#7C3AED', lineWidth: 1.7 * s, roughness: 0.25, seed: seed + 12, passes: 1 });
  drawSketchLine(ctx, pouchX, pouchY - 5 * s, pouchX, pouchY + 5 * s, { color: '#7C3AED', lineWidth: 1.7 * s, roughness: 0.25, seed: seed + 13, passes: 1 });

  // Back arm tucked behind + front low guard arm
  drawSketchLine(ctx, shX, shY, shX - 10 * s, shY + 7 * s, { color: inkColor, lineWidth: 1.9 * s, roughness: 0.4, seed: seed + 14, passes: 1, alpha: 0.78 });
  drawSketchLine(ctx, shX, shY, shX + 12 * s, shY + 6 * s, { color: inkColor, lineWidth: 1.9 * s, roughness: 0.4, seed: seed + 15, passes: 1 });
  drawSketchLine(ctx, shX + 12 * s, shY + 6 * s, shX + 19 * s, shY + 1 * s, { color: inkColor, lineWidth: 1.9 * s, roughness: 0.4, seed: seed + 16, passes: 1 });

  // Head + black headband + triangle mask + purple slanted eye glint
  const headR = 9.2 * s;
  drawSketchCircle(ctx, headX, headY, headR, { color: inkColor, lineWidth: 2.1 * s, roughness: 0.42, seed: seed + 18, passes: 1 });
  drawSketchLine(ctx, headX - headR * 0.95, headY - 3.6 * s, headX + headR * 0.95, headY - 3.6 * s, { color: '#0F172A', lineWidth: 2.9 * s, roughness: 0.3, seed: seed + 19, passes: 1 });
  drawSketchPolyline(
    ctx,
    [
      { x: headX - headR * 0.85, y: headY + 0.5 * s },
      { x: headX + 1.5 * s, y: headY + headR * 1.02 },
      { x: headX + headR * 0.88, y: headY + 0.5 * s },
      { x: headX - headR * 0.85, y: headY + 0.5 * s },
    ],
    { color: '#0F172A', lineWidth: 1.6 * s, roughness: 0.3, seed: seed + 20, passes: 1 },
  );
  // Slanted eyes + purple glint
  drawSketchLine(ctx, headX - 1 * s, headY - 1.4 * s, headX + 2.6 * s, headY - 0.5 * s, { color: '#0F172A', lineWidth: 1.4 * s, roughness: 0.2, seed: seed + 21, passes: 1 });
  drawSketchLine(ctx, headX + 4.0 * s, headY - 0.5 * s, headX + 7.4 * s, headY - 1.4 * s, { color: '#0F172A', lineWidth: 1.4 * s, roughness: 0.2, seed: seed + 22, passes: 1 });
  ctx.save();
  ctx.fillStyle = '#9333EA';
  ctx.beginPath();
  ctx.arc(headX + 5.3 * s, headY - 0.7 * s, 1.45 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawNguoiSoiCardPortrait(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  inkColor: string,
  _accentColor: string,
  boilTick: number,
  tSec: number,
) {
  const s = scale * 0.94;
  const seed = 740 + boilTick * 11.3;
  const breathe = Math.sin(tSec * 4.2) * 1.3 * s;
  const hipX = cx - 4 * s;
  const hipY = cy + 16 * s + breathe * 0.4;
  const shX = hipX + 5 * s;
  const shY = hipY - 21 * s + breathe * 0.5;
  const headX = shX + 3.5 * s;
  const headY = shY - 12 * s;

  // Bushy wolf tail peeking out behind ragged cloak
  drawSketchPolyline(
    ctx,
    [
      { x: hipX - 3 * s, y: hipY - 2 * s },
      { x: hipX - 15 * s, y: hipY - 5 * s },
      { x: hipX - 24 * s, y: hipY - 14 * s },
      { x: hipX - 18 * s, y: hipY - 8 * s },
      { x: hipX - 21 * s, y: hipY - 2 * s },
      { x: hipX - 9 * s, y: hipY + 1 * s },
      { x: hipX - 3 * s, y: hipY - 2 * s },
    ],
    { color: inkColor, lineWidth: 1.9 * s, roughness: 0.55, seed: seed + 1, passes: 1 },
  );

  // Hunched wolf stance legs
  drawSketchLine(ctx, hipX, hipY, hipX - 8 * s, hipY + 11 * s, { color: inkColor, lineWidth: 2.0 * s, roughness: 0.45, seed: seed + 2, passes: 1, alpha: 0.78 });
  drawSketchLine(ctx, hipX - 8 * s, hipY + 11 * s, hipX - 11 * s, hipY + 23 * s, { color: inkColor, lineWidth: 2.0 * s, roughness: 0.45, seed: seed + 3, passes: 1, alpha: 0.78 });
  drawSketchLine(ctx, hipX, hipY, hipX + 9 * s, hipY + 10 * s, { color: inkColor, lineWidth: 2.2 * s, roughness: 0.45, seed: seed + 4, passes: 1 });
  drawSketchLine(ctx, hipX + 9 * s, hipY + 10 * s, hipX + 10 * s, hipY + 23 * s, { color: inkColor, lineWidth: 2.2 * s, roughness: 0.45, seed: seed + 5, passes: 1 });

  // Ragged plaid cloak drape behind torso
  const cloakPts = [
    { x: shX - 4 * s, y: shY - 3 * s },
    { x: hipX - 14 * s, y: hipY + 8 * s },
    { x: hipX - 7 * s, y: hipY + 4 * s },
    { x: hipX - 2 * s, y: hipY + 9 * s },
    { x: hipX + 4 * s, y: hipY + 3 * s },
    { x: shX + 3 * s, y: shY + 2 * s },
  ];
  ctx.save();
  ctx.fillStyle = inkColor;
  ctx.globalAlpha = 0.14;
  ctx.beginPath();
  ctx.moveTo(cloakPts[0].x, cloakPts[0].y);
  for (let i = 1; i < cloakPts.length; i++) ctx.lineTo(cloakPts[i].x, cloakPts[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  drawSketchPolyline(ctx, cloakPts, { color: inkColor, lineWidth: 1.9 * s, roughness: 0.5, seed: seed + 6, passes: 1 });
  // Plaid check lines on cloak
  drawSketchLine(ctx, shX - 6 * s, shY + 7 * s, hipX + 1 * s, shY + 9 * s, { color: inkColor, lineWidth: 1.1 * s, roughness: 0.3, seed: seed + 7, passes: 1, alpha: 0.55 });
  drawSketchLine(ctx, shX - 8 * s, shY + 13 * s, hipX + 2 * s, shY + 15 * s, { color: inkColor, lineWidth: 1.1 * s, roughness: 0.3, seed: seed + 8, passes: 1, alpha: 0.55 });
  drawSketchLine(ctx, shX - 5 * s, shY + 3 * s, hipX - 9 * s, hipY + 4 * s, { color: inkColor, lineWidth: 1.1 * s, roughness: 0.3, seed: seed + 9, passes: 1, alpha: 0.55 });

  // Torso & forward arms with broken iron wrist cuffs
  drawSketchLine(ctx, hipX, hipY, shX, shY, { color: inkColor, lineWidth: 2.3 * s, roughness: 0.45, seed: seed + 10, passes: 1 });
  const rElbX = shX + 10 * s;
  const rElbY = shY + 8 * s;
  const rHandX = shX + 18 * s;
  const rHandY = shY + 4 * s;
  drawSketchLine(ctx, shX, shY, rElbX, rElbY, { color: inkColor, lineWidth: 2.0 * s, roughness: 0.4, seed: seed + 11, passes: 1 });
  drawSketchLine(ctx, rElbX, rElbY, rHandX, rHandY, { color: inkColor, lineWidth: 2.0 * s, roughness: 0.4, seed: seed + 12, passes: 1 });
  // Broken cuff & dangling chain link
  drawSketchCircle(ctx, rHandX - 2 * s, rHandY + 1 * s, 2.7 * s, { color: '#334155', lineWidth: 1.5 * s, roughness: 0.3, seed: seed + 13, passes: 1 });
  drawSketchLine(ctx, rHandX - 2 * s, rHandY + 3.7 * s, rHandX - 3 * s, rHandY + 8.5 * s, { color: '#334155', lineWidth: 1.4 * s, roughness: 0.35, seed: seed + 14, passes: 1 });

  // Head + pointed wolf ears poking out of hood + shaggy mane tufts
  const headR = 9.5 * s;
  drawSketchCircle(ctx, headX, headY, headR, { color: inkColor, lineWidth: 2.1 * s, roughness: 0.45, seed: seed + 15, passes: 1 });
  // Pointed wolf ears poking above hood
  drawSketchPolyline(
    ctx,
    [
      { x: headX - 6 * s, y: headY - headR * 0.78 },
      { x: headX - 9 * s, y: headY - headR * 1.78 },
      { x: headX - 1.5 * s, y: headY - headR * 0.98 },
    ],
    { color: inkColor, lineWidth: 1.9 * s, roughness: 0.35, seed: seed + 16, passes: 1 },
  );
  drawSketchPolyline(
    ctx,
    [
      { x: headX + 0.5 * s, y: headY - headR * 0.96 },
      { x: headX + 3.5 * s, y: headY - headR * 1.82 },
      { x: headX + 6.5 * s, y: headY - headR * 0.78 },
    ],
    { color: inkColor, lineWidth: 1.9 * s, roughness: 0.35, seed: seed + 17, passes: 1 },
  );
  // Hood frame & shaggy mane tufts
  drawSketchPolyline(
    ctx,
    [
      { x: headX - headR * 1.15, y: headY + 4 * s },
      { x: headX - headR * 1.05, y: headY - headR * 0.92 },
      { x: headX + headR * 0.65, y: headY - headR * 1.02 },
    ],
    { color: inkColor, lineWidth: 2.1 * s, roughness: 0.48, seed: seed + 18, passes: 1 },
  );
  drawSketchPolyline(
    ctx,
    [
      { x: headX - 4 * s, y: headY + headR * 0.85 },
      { x: headX - 7 * s, y: headY + headR * 1.25 },
      { x: headX - 1 * s, y: headY + headR * 1.1 },
      { x: headX + 3 * s, y: headY + headR * 1.28 },
      { x: headX + 6 * s, y: headY + headR * 0.85 },
    ],
    { color: inkColor, lineWidth: 1.6 * s, roughness: 0.4, seed: seed + 19, passes: 1 },
  );

  // Diagonal cheek scar + glowing yellow eye
  drawSketchLine(ctx, headX + 0.8 * s, headY + 1.5 * s, headX + 5.8 * s, headY + 4.8 * s, { color: '#DC2626', lineWidth: 1.4 * s, roughness: 0.25, seed: seed + 20, passes: 1 });
  ctx.save();
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.ellipse(headX + 4.2 * s, headY - 1.2 * s, 2.3 * s, 1.45 * s, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.1 * s;
  ctx.stroke();
  ctx.restore();

  // Yellow crescent moon badge beside head
  const moonX = headX + 18.5 * s;
  const moonY = headY - 8.5 * s;
  const moonR = 5.4 * s;
  ctx.save();
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(moonX - moonR * 0.45, moonY - moonR * 0.12, moonR * 0.78, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawSketchCircle(ctx, moonX, moonY, moonR, { color: '#0F172A', lineWidth: 1.3 * s, roughness: 0.3, seed: seed + 21, passes: 1 });
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

  ninja: {
    id: 'ninja',
    name: 'Ninja',
    subtitle: 'Bóng lướt mép giấy',
    description: 'Nhanh nhẹn, giữ kiếm sắc bén; bị ép góc 2 đòn liền sẽ nhảy qua đầu đối thủ và phóng phi tiêu.',
    scale: 0.9,
    limbLength: 1,
    lineWidth: 1.1,
    hitbox: 0.8,
    jitterFps: 10,
    hp: 0.75,
    moveSpeed: 1.2,
    damageDealt: 0.9,
    knockbackDealt: 0.75,
    knockbackTaken: 1.25,
    phaseTime: { windup: 0.8, strike: 0.85, recovery: 1.1 },
    trait: {
      id: 'escapeLeap',
      cooldown: 8.0,
      nearEdge: 60,
      minConsecutiveHits: 2,
      needsLandingRoom: true,
      leap: {
        duration: 0.62,
        landDistance: 190,
        arcHeight: 165,
        clearsComboQueue: true,
        invulnerable: false,
      },
      shuriken: {
        damage: 7,
        knockback: 0,
        hitOnce: true,
        blockable: true,
        throwAt: 'leapApex',
      },
      ignores: ['knockdown', 'getup', 'pinned', 'homeRun', 'noLandingRoom'],
      finale: {
        belowHp: 0.3,
        oncePerMatch: true,
        aiOnly: true,
      },
    },
    affinity: {
      sword: 'strong',
      unarmed: 'good',
      spear: 'neutral',
      bat: 'neutral',
      hammer: 'weak',
      shield: 'weak',
    },
    ai: {
      style: 'skirmisher',
      preferredRange: 0.6,
      aggression: 0.55,
      holdInPlaceBounce: true,
      avoidEdgeWhenTraitCooling: true,
      waitBelowHp: 0.3,
    },
    visual: {
      bellyScale: 0,
      headScale: 0.95,
      torsoRatio: 1.0,
      neckRatio: 1,
      legRatio: 1.05,
      armRatio: 1.05,
      fistScale: 0.9,
      shoeScale: 0,
      footFlat: false,
      kneeKnobs: false,
      beard: false,
      hairTufts: 0,
      hairStrands: 0,
      glasses: false,
      cheekBandage: false,
      faceStyle: 'ninja',
      scarfStyle: 'headband',
      scarfColor: '#0F172A',
      scarfTailLines: 3,
      sockStripes: 0,
      jitterFps: 10,
      doublePasses: 1,
      secondPassOffsetY: 0,
      waveAmp: 0,
      doubleStrokeRoughness: 0.48,
      shadowAlpha: 0.14,
      stepShake: 0,
      swordDrawScale: 1.1,
      batDrawScale: 0.98,
      spearDrawScale: 0.96,
      hammerDrawScale: 1.0,
      shieldDrawScale: 0.9,
      ninjaLook: true,
    },
    statTags: ['225 Máu', 'Nhảy Thoát Góc', 'Kiếm & Tay không'],
    entrance: {
      duration: 0.42,
      jumpHeight: 138,
      tauntDuration: 0.66,
      tauntText: 'XOẸT!',
      tauntStyle: 'ninja_hand_seal',
    },
    drawPortrait: drawNinjaCardPortrait,
  },
  kysilon: {
    id: 'kysilon',
    name: 'Kỵ Sĩ Lợn',
    subtitle: 'Cưỡi Heo Chiến',
    description:
      'Cưỡi lợn lao thẳng vào đối thủ. Khi bị đánh gục xuống dưới 40% máu sẽ đứt cương tách làm đôi: lợn húc tuyến đầu, kỵ sĩ giữ khoảng cách bọc sau.',
    scale: 0.8,
    limbLength: 1.0,
    lineWidth: 1.2,
    hitbox: 1.3,
    jitterFps: 8,
    hp: 1.15,
    moveSpeed: 1.1,
    damageDealt: 0.95,
    knockbackDealt: 1.1,
    knockbackTaken: 0.75,
    phaseTime: { windup: 1.1, strike: 1.0, recovery: 1.15 },
    trait: {
      id: 'pigMount',
      splitBelowHp: 0.4,
      splitOnKnockdown: true,
      splitOnThrownShield: true,
    },
    affinity: {
      unarmed: 'strong',
      spear: 'good',
      sword: 'neutral',
      bat: 'neutral',
      hammer: 'weak',
      shield: 'weak',
    },
    ai: {
      style: 'gladiatorRider',
      preferredRange: 0.7,
      aggression: 0.65,
      holdInPlaceBounce: true,
      holdBelowHp: 0.3,
      pigHeadbuttCooldown: 3.2,
    },
    visual: {
      bellyScale: 0,
      headScale: 0.95,
      torsoRatio: 0.96,
      neckRatio: 1,
      legRatio: 0.96,
      armRatio: 1.0,
      fistScale: 0.92,
      shoeScale: 0.85,
      footFlat: false,
      kneeKnobs: false,
      beard: false,
      hairTufts: 0,
      hairStrands: 0,
      glasses: false,
      cheekBandage: false,
      faceStyle: 'kysilon',
      scarfStyle: 'none',
      scarfTailLines: 0,
      sockStripes: 0,
      jitterFps: 8,
      doublePasses: 2,
      secondPassOffsetY: 0,
      waveAmp: 0,
      doubleStrokeRoughness: 0.52,
      shadowAlpha: 0.16,
      stepShake: 0,
      swordDrawScale: 0.95,
      batDrawScale: 0.95,
      spearDrawScale: 0.98,
      hammerDrawScale: 0.92,
      shieldDrawScale: 0.9,
      pigRiderLook: true,
      brownHelmet: true,
    },
    statTags: ['345 Máu', 'Đứt Cương Tách Đôi', 'Tay Không & Giáo'],
    entrance: {
      duration: 0.56,
      jumpHeight: 118,
      tauntDuration: 0.68,
      tauntText: 'ỤT ỊT!',
      tauntStyle: 'kysilon_oink',
    },
    drawPortrait: drawKySiLonCardPortrait,
  },
  lon: {
    id: 'lon',
    name: 'Lợn Chiến',
    subtitle: 'Heo Tuyến Đầu',
    description: 'Lao thẳng về phía trước, húc đầu, giậm chân và hích nhẹ không bao giờ lùi bước.',
    scale: 0.8,
    limbLength: 1.0,
    lineWidth: 1.25,
    hitbox: 1.2,
    jitterFps: 8,
    hp: 0.575,
    moveSpeed: 1.2,
    damageDealt: 1.0,
    knockbackDealt: 1.3,
    knockbackTaken: 0.75,
    phaseTime: { windup: 1.0, strike: 0.9, recovery: 1.2 },
    trait: {
      id: 'pigCompanion',
      neverEquipWeapon: true,
    },
    affinity: {
      unarmed: 'strong',
      sword: 'weak',
      bat: 'weak',
      spear: 'weak',
      hammer: 'weak',
      shield: 'weak',
    },
    ai: {
      style: 'frontliner',
      preferredRange: 0.5,
      aggression: 0.9,
    },
    visual: {
      bellyScale: 0,
      headScale: 1.0,
      torsoRatio: 1.0,
      neckRatio: 1,
      legRatio: 1.0,
      armRatio: 1.0,
      fistScale: 1.0,
      shoeScale: 0,
      footFlat: false,
      kneeKnobs: false,
      beard: false,
      hairTufts: 0,
      hairStrands: 0,
      glasses: false,
      cheekBandage: false,
      faceStyle: 'lon',
      scarfStyle: 'none',
      scarfTailLines: 0,
      sockStripes: 0,
      jitterFps: 8,
      doublePasses: 2,
      secondPassOffsetY: 0,
      waveAmp: 0,
      doubleStrokeRoughness: 0.52,
      shadowAlpha: 0.16,
      stepShake: 0,
      swordDrawScale: 1.0,
      batDrawScale: 1.0,
      spearDrawScale: 1.0,
      hammerDrawScale: 1.0,
      shieldDrawScale: 1.0,
      pigLook: true,
    },
    statTags: ['Lao Húc Đầu', 'Không Lùi Bước'],
    entrance: {
      duration: 0.35,
      jumpHeight: 60,
      tauntDuration: 0.45,
      tauntText: 'ÉC!',
      tauntStyle: 'kysilon_oink',
    },
    drawPortrait: drawKySiLonCardPortrait,
  },
  nguoisoi: {
    id: 'nguoisoi',
    name: 'Người Sói',
    subtitle: 'Ác Thú Trăng Tròn',
    description:
      'Gây sát thương tích trăng (0-80). Đủ 80 điểm tự động gầm hú biến hình 8 giây thành Sói Khổng Lồ hung hãn, cất vũ khí và cào xé áp đảo bằng tay không.',
    scale: 1.0,
    limbLength: 1.0,
    lineWidth: 1.0,
    hitbox: 1.0,
    jitterFps: 8,
    hp: 0.9,
    moveSpeed: 1.0,
    damageDealt: 0.85,
    knockbackDealt: 0.9,
    knockbackTaken: 1.0,
    phaseTime: { windup: 1.0, strike: 1.0, recovery: 1.0 },
    trait: {
      id: 'moonForm',
      moonForm: {
        maxGauge: 80,
        gainPerDamage: 1,
        excludes: ['shieldThrow'],
        transformDuration: 0.5,
        transformAction: 'TAUNT',
        transformInterruptible: true,
        drainDuration: 8.0,
        weaponStashOnTransform: true,
        wolfStats: {
          scale: 1.1,
          hitbox: 1.15,
          lineWidth: 1.3,
          jitterFps: 12,
          moveSpeed: 1.3,
          damageDealt: 1.25,
          knockbackDealt: 1.1,
          knockbackTaken: 0.9,
          phaseTime: { windup: 0.85, strike: 0.9, recovery: 1.0 },
        },
      },
    },
    affinity: {
      unarmed: 'strong',
      spear: 'good',
      sword: 'neutral',
      bat: 'neutral',
      hammer: 'weak',
      shield: 'weak',
    },
    ai: {
      style: 'moonHunter',
      preferredRange: 0.75,
      aggression: 0.5,
      aggressionByForm: { human: 0.5, wolf: 0.85 },
      pushWhenMoonHalfFull: true,
      holdBelowHp: 0.3,
    },
    visual: {
      bellyScale: 0,
      headScale: 1.0,
      torsoRatio: 1.0,
      neckRatio: 1.0,
      legRatio: 1.0,
      armRatio: 1.0,
      fistScale: 1.05,
      shoeScale: 0,
      footFlat: false,
      kneeKnobs: false,
      beard: false,
      hairTufts: 2,
      hairStrands: 0,
      glasses: false,
      cheekBandage: false,
      faceStyle: 'nguoisoi',
      scarfStyle: 'none',
      scarfTailLines: 0,
      sockStripes: 0,
      jitterFps: 8,
      doublePasses: 2,
      secondPassOffsetY: 0,
      waveAmp: 0,
      doubleStrokeRoughness: 0.68,
      shadowAlpha: 0.24,
      stepShake: 0,
      swordDrawScale: 1.0,
      batDrawScale: 1.0,
      spearDrawScale: 1.0,
      hammerDrawScale: 1.0,
      shieldDrawScale: 0.95,
      wolfLook: true,
      moonIcon: true,
    },
    statTags: ['270 Máu', 'Hóa Sói Trăng Tròn', 'Tay Không & Giáo'],
    entrance: {
      duration: 0.48,
      jumpHeight: 132,
      tauntDuration: 0.72,
      tauntText: 'ÚÚÚ!',
      tauntStyle: 'howl',
    },
    drawPortrait: drawNguoiSoiCardPortrait,
  },
};

export const CHARACTER_LIST: CharacterDef[] = [
  CHARACTERS.normal,
  CHARACTERS.bucon,
  CHARACTERS.nhoc,
  CHARACTERS.caokieu,
  CHARACTERS.lonsat,
  CHARACTERS.hebongbay,
  CHARACTERS.ninja,
  CHARACTERS.kysilon,
  CHARACTERS.nguoisoi,
];

export function getCharacterDef(id: CharacterId): CharacterDef {
  return CHARACTERS[id] ?? CHARACTERS.normal;
}
