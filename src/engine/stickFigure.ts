import { sfx } from '../audio/sfx';
import {
  BASE_FIGHTER_HP,
  CharacterDef,
  CharacterId,
  getCharacterDef,
} from './characters';
import {
  drawSketchCircle,
  drawSketchGauge,
  drawSketchGear,
  drawSketchLine,
  drawSketchPaperFanWing,
  drawSketchPolyline,
  drawSketchSpring,
  hash1D,
} from './sketchDraw';
import {
  drawHeldShield,
  drawHeldWeapon,
  PrimaryWeaponType,
  WEAPON_REACH,
  WEAPONS,
} from './weapons';

export type FighterSide = 'left' | 'right';

export type FighterAction =
  | 'IDLE_WAIT'
  | 'ENTRANCE_JUMP'
  | 'TAUNT'
  | 'DRAGGED'
  | 'NOTICE'
  | 'STANCE'
  | 'DASH'
  | 'SLIDE'
  | 'JAB'
  | 'CROSS'
  | 'UPPERCUT'
  | 'SUPER_PUNCH'
  | 'KICK'
  | 'ROUNDHOUSE'
  | 'SWEEP_KICK'
  | 'JUMP_KICK'
  | 'SWORD_1'
  | 'SWORD_2'
  | 'SWORD_3'
  | 'SWORD_4'
  | 'SWORD_LUNGE'
  | 'BAT_1'
  | 'BAT_2'
  | 'BAT_3'
  | 'SPEAR_1'
  | 'SPEAR_2'
  | 'SPEAR_3'
  | 'SPEAR_BUTT'
  | 'HAMMER_1'
  | 'HAMMER_2'
  | 'HAMMER_3'
  | 'SHIELD_THROW'
  | 'PINNED'
  | 'BLOCK'
  | 'SHIELD_CROUCH'
  | 'BACKSTEP'
  | 'DODGE_BACK'
  | 'ROLL_DODGE'
  | 'VENT_WARN'
  | 'TAKEOFF_WARN'
  | 'TAKEOFF_FLIGHT'
  | 'TAKEOFF_LAND_STUCK'
  | 'SLIP'
  | 'HURT'
  | 'KNOCKDOWN'
  | 'GETUP'
  | 'KO'
  | 'VICTORY';

export interface Pose {
  hipDrop: number; // positive lowers hips toward floor
  torsoLean: number; // rad, + leans forward, - leans backward
  headTilt: number;
  upperArmL: number; // angle from down (+ = forward)
  elbowL: number; // >= 0 bends forward
  upperArmR: number;
  elbowR: number;
  thighL: number; // angle from down (+ = forward)
  kneeL: number; // >= 0 bends backward
  thighR: number;
  kneeR: number;
}

export interface JointPositions {
  hip: { x: number; y: number };
  shoulder: { x: number; y: number };
  head: { x: number; y: number };
  elbowL: { x: number; y: number };
  handL: { x: number; y: number };
  elbowR: { x: number; y: number };
  handR: { x: number; y: number };
  kneeL: { x: number; y: number };
  footL: { x: number; y: number };
  kneeR: { x: number; y: number };
  footR: { x: number; y: number };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: 'spark' | 'dust' | 'star' | 'line' | 'slash' | 'ring' | 'crack' | 'steam' | 'oil' | 'screw' | 'confetti' | 'puff' | 'cream';
  angle: number;
  spin: number;
  seed: number;
}

export interface ComicCallout {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
  tilt: number;
}

export interface MotionTrail {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface TempStatusEffect {
  id: string;
  duration: number;
  remaining: number;
  damageTakenMul?: number;
  damageDealtMul?: number;
  moveSpeedMul?: number;
  recoveryMul?: number;
  reachMul?: number;
  windupMul?: number;
  noHeatGain?: boolean;
  label?: string;
}

export interface ArenaTrapSnapshot {
  type: 'bananaPeel' | 'jackBox';
  x: number;
  radius: number;
  ownerSide: FighterSide;
  fuse?: number;
}

export interface GagSpawnRequest {
  type: 'bananaPeel' | 'creamPie' | 'jackBox';
  attackerX: number;
  attackerY: number;
  facing: 1 | -1;
  targetX: number;
  targetY: number;
  dropBehindTarget?: boolean;
  dropTwoSidePeels?: boolean;
  jackFuseOverride?: number;
}

export interface AreaBlastRequest {
  x: number;
  y: number;
  radius: number;
  damage: number;
  knockbackMult: number;
  knockbackDistanceR?: number;
  stunDuration?: number;
  weaponReach?: number;
  breaksCombo: boolean;
  exceptArmored: string[];
  dodgeable: boolean;
  color: string;
  label: string;
  attackType?: string;
}

export interface TakeHitResult {
  actualDamage: number;
  hitConnected: boolean;
  fullyBlocked: boolean;
  armored: boolean;
}

export interface HitResolvedEvent {
  attacker: StickFighter | null;
  defender: StickFighter;
  rawDamage: number;
  actualDamage: number;
  attackType: string;
  isAoe: boolean;
  isDrawnWeapon: boolean;
  isAmbient: boolean;
  isFinisher: boolean;
  fullyBlocked: boolean;
  hitConnected: boolean;
  armored: boolean;
}

export interface ResolveHitInput {
  attacker: StickFighter | null;
  defender: StickFighter;
  rawDamage: number;
  kbX: number;
  kbY: number;
  heavy: boolean;
  attackerDir: 1 | -1;
  attackType: string;
  isAoe?: boolean;
  isDrawnWeapon?: boolean;
  isAmbient?: boolean;
  isFinisher?: boolean;
  directEnvHit?: boolean;
  dodgeable?: boolean;
  breaksCombo?: boolean;
  exceptArmored?: string[];
  particles: Particle[];
  callouts: ComicCallout[];
  impactX: number;
  impactY: number;
  weaponSource?: PrimaryWeaponType | 'shield' | null;
  opts?: {
    guardBreak?: boolean;
    slow?: boolean;
    slowDuration?: number;
    pin?: boolean;
    pinDurationMul?: number;
    homeRun?: boolean;
    stunDuration?: number;
  };
}

export function resolveHit(input: ResolveHitInput): HitResolvedEvent {
  const {
    attacker,
    defender,
    rawDamage,
    kbX,
    kbY,
    heavy,
    attackerDir,
    attackType,
    isAoe = false,
    isDrawnWeapon = false,
    isAmbient = false,
    isFinisher = false,
    directEnvHit = false,
    dodgeable = true,
    breaksCombo = false,
    exceptArmored,
    particles,
    callouts,
    impactX,
    impactY,
    weaponSource = null,
    opts,
  } = input;

  if (defender.hp <= 0 || defender.action === 'KO' || defender.isDragged) {
    return {
      attacker,
      defender,
      rawDamage,
      actualDamage: 0,
      attackType,
      isAoe,
      isDrawnWeapon,
      isAmbient,
      isFinisher,
      fullyBlocked: false,
      hitConnected: false,
      armored: false,
    };
  }

  const modifiedDamage = defender.applyIncomingDamageModifier(rawDamage);
  const hpBefore = defender.hp;

  let res: TakeHitResult;
  if (directEnvHit) {
    const actual = Math.min(hpBefore, Math.max(0, modifiedDamage));
    defender.hp = Math.max(0, hpBefore - actual);
    defender.hitFlash = 0.16;
    res = {
      actualDamage: actual,
      hitConnected: true,
      fullyBlocked: false,
      armored: false,
    };
  } else {
    res = defender.takeHit(
      modifiedDamage,
      kbX,
      kbY,
      heavy,
      attackerDir,
      particles,
      callouts,
      impactX,
      impactY,
      weaponSource,
      {
        ...opts,
        ignoreDodge: !dodgeable,
        exceptArmored,
        breaksCombo,
        attackerPinStyle: attacker?.characterId === 'hebongbay' ? 'hebongbay' : 'standard',
      },
    );
  }

  const actualDamage = Math.max(0, hpBefore - defender.hp);
  const event: HitResolvedEvent = {
    attacker,
    defender,
    rawDamage,
    actualDamage,
    attackType,
    isAoe,
    isDrawnWeapon,
    isAmbient,
    isFinisher,
    fullyBlocked: res.fullyBlocked,
    hitConnected: res.hitConnected,
    armored: res.armored,
  };

  defender.onHitResolved(event);
  attacker?.onAttackHitResolved(event);
  return event;
}

const DEFAULT_POSE: Pose = {
  hipDrop: 0,
  torsoLean: 0.05,
  headTilt: 0,
  upperArmL: 0.15,
  elbowL: 0.35,
  upperArmR: -0.1,
  elbowR: 0.35,
  thighL: 0.16,
  kneeL: 0.12,
  thighR: -0.16,
  kneeR: 0.12,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function lerpPose(current: Pose, target: Pose, t: number): Pose {
  return {
    hipDrop: lerp(current.hipDrop, target.hipDrop, t),
    torsoLean: lerp(current.torsoLean, target.torsoLean, t),
    headTilt: lerp(current.headTilt, target.headTilt, t),
    upperArmL: lerp(current.upperArmL, target.upperArmL, t),
    elbowL: lerp(current.elbowL, target.elbowL, t),
    upperArmR: lerp(current.upperArmR, target.upperArmR, t),
    elbowR: lerp(current.elbowR, target.elbowR, t),
    thighL: lerp(current.thighL, target.thighL, t),
    kneeL: lerp(current.kneeL, target.kneeL, t),
    thighR: lerp(current.thighR, target.thighR, t),
    kneeR: lerp(current.kneeR, target.kneeR, t),
  };
}

export class StickFighter {
  public readonly side: FighterSide;
  public readonly color: string;
  public readonly accentColor: string;
  public readonly seedBase: number;
  public characterId: CharacterId;
  public characterDef: CharacterDef;

  public x: number;
  public y: number; // ground-projected hip reference Y or airborne Y
  public vx = 0;
  public vy = 0;
  public facing: 1 | -1;

  public hp = BASE_FIGHTER_HP;
  public maxHp = BASE_FIGHTER_HP;
  public weapon: PrimaryWeaponType | null = null;
  public hasShield = false;
  public action: FighterAction = 'IDLE_WAIT';
  public actionTime = 0;
  public actionDuration = 0;
  public hasHitThisAction = false;
  public hasPlayedWhoosh = false;
  public hasBeenPulledOut = false;

  public aiCooldown = 0.25;
  public hitFlash = 0;
  public arenaScale = 1;
  public scale = 1;
  public hitboxScale = 1;
  public consecutiveHitsTaken = 0;
  public damageTakenWithShield = 0;
  public isEnraged = false;
  public hasTriggeredRage = false;
  public pendingRageEffect = false;
  public isPanicking = false;
  public hasTriggeredPanic = false;
  public pendingPanicEffect = false;
  public rollCooldown = 0;
  public rollInvulnTimer = 0;
  public pendingRollEffect: {
    fromX: number;
    toX: number;
    y: number;
    ghosts: Array<{ x: number; y: number }>;
    accentColor: string;
  } | null = null;
  public pendingFootstepShake = 0;
  public pendingShieldThrow: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    ownerSide: FighterSide;
    damage: number;
  } | null = null;
  public slowTimer = 0;
  public bodySpin = 0;
  public bodySpinRate = 0;
  public homeRunTimer = 0;
  public terrainHitCooldown = 0;
  public pendingBopCallout = false;
  public pendingPaperTear: {
    x: number;
    y: number;
    width: number;
    ownerSide: FighterSide;
    heavy?: boolean;
  } | null = null;
  public pendingPinnedSpear: {
    x: number;
    y: number;
    facing: 1 | -1;
    scale: number;
    duration?: number;
    style?: 'standard' | 'hebongbay';
  } | null = null;
  public pendingWallBounce: { x: number; y: number } | null = null;
  public pendingTauntEffect = false;
  public pendingLandingImpact = false;
  public isOverreaching = false;
  public hasTriggeredOverreach = false;
  public overreachTimer = 0;
  public pendingOverreachEffect = false;
  public windupZone: 'sweet' | 'mid' | 'dead' = 'mid';
  public strikeZone: 'sweet' | 'mid' | 'dead' = 'mid';
  public currentRangeZone: 'sweet' | 'mid' | 'dead' = 'mid';
  public pendingVuongCallout = false;
  public hasUsedRecoverySlide = false;
  public isRecoverySliding = false;
  public lastOpponentDist = 160;
  public heat = 0;
  public heatCoolDelayTimer = 0;
  public pendingVentAfterStun = false;
  public takeoffState: 'unused' | 'warn' | 'flight' | 'landing' | 'used' = 'unused';
  public wingsBroken = false;
  public wingsCrumpled = false;
  public wingsCrossedOut = false;
  public rocketPodsOpen = false;
  public rocketPodsDetached = false;
  public wingHp = 20;
  public tempStatuses: TempStatusEffect[] = [];
  public pendingAreaBlast: AreaBlastRequest | null = null;
  public pendingVentWarnCallout = false;
  public pendingOverheatCallout = false;
  public pendingTakeoffWarnCallout = false;
  public pendingWingBreakCallout = false;
  public pendingTakeoffAfterStun = false;
  public pendingWingBreakOverheat = false;
  public pendingRocketVolley: {
    volleyIndex: number;
    isBig: boolean;
    originX: number;
    originY: number;
    damage: number;
    blastRadiusR: number;
    speed: number;
    knockback: number;
    ownerSide: FighterSide;
    weaponReach: number;
  } | null = null;
  public pendingRocketPodDrop: {
    x: number;
    y: number;
    facing: 1 | -1;
    scale: number;
  } | null = null;
  public pendingFlightTrailDot: { x: number; y: number } | null = null;
  public pendingSteamPush: { x: number; y: number; dir: 1 | -1 } | null = null;

  // Hề Bóng Bay ("Túi trò hề" + Finale) state
  public comboBeatCount = 0;
  public gagIndex = 0;
  public finaleState: 'unused' | 'active' | 'outOfTricks' | 'used' = 'unused';
  public finaleTimer = 0;
  public outOfTricksTimer = 0;
  public activeOwnPeelCount = 0;
  public activeOwnJackBoxCount = 0;
  public pendingGagSpawns: GagSpawnRequest[] = [];
  public pendingFinaleCallout = false;
  public pendingOutOfTricksCallout = false;
  public pendingSqueakCallout = false;
  public pendingHomeRunConfetti = false;
  public winkTimer = 0;
  public poppedShoeTimer = 0;
  public poppedShoeSide: 'left' | 'right' | null = null;
  private clownWalkTimer = 0;
  private finaleConfettiTimer = 0;

  private flightTimer = 0;
  private flightVolleyIndex = 0;
  private flightSmokeTimer = 0;
  private landingTargetX = 0;
  private takeoffDiveComplete = false;
  private takeoffLandStuckTimer = 0;
  private takeoffWarnSteamTimer = 0;
  private brokenWingSmokeTimer = 0;
  private coarsePoseTimer = 0;
  private chimneyEmitTimer = 0;
  private sparkEmitTimer = 0;
  private oilEmitTimer = 0;
  private mechGearAngle = 0;
  private pistonSteamFired = false;

  private entranceOriginX = 0;
  private entranceOriginY = 0;
  private entranceTargetX = 0;
  private entranceTargetY = 0;
  private lastStrideSign = 0;
  private lastHeelStrideSign = 0;
  private rollStartX = 0;
  private rollTargetX = 0;
  private shouldRetreatAfterCombo = false;
  private needsStrikeStartMeasure = false;
  private lockedDeadWindup = false;
  private lockedSweetRecovery = false;
  private zonerComboBeats = 0;

  private comboResetTimer = 0;
  private defenseCooldown = 0;
  private hasReleasedShield = false;
  private triggeredHammerJump = false;
  private triggeredHammerDive = false;
  private triggeredHammerSlam = false;
  private triggeredHammerStumble = false;
  private triggeredSpearStepBack = false;
  private triggeredLungeBurst = false;

  public pose: Pose = { ...DEFAULT_POSE };
  public joints: JointPositions;

  // Flowing headband tail (world coordinates)
  public scarfNodes: Array<{ x: number; y: number }>;

  // Dragging state
  public isDragged = false;
  public dragOffsetX = 0;
  public dragOffsetY = 0;
  private dragVelX = 0;
  private dragVelY = 0;

  // Previous attack tip for motion trail
  private prevTip: { x: number; y: number } | null = null;
  // Queued follow-up moves for multi-hit combos
  private comboQueue: FighterAction[] = [];

  constructor(
    side: FighterSide,
    startX: number,
    floorY: number,
    arenaScale = 1,
    characterId: CharacterId = 'normal',
  ) {
    this.side = side;
    this.characterId = characterId;
    this.characterDef = getCharacterDef(characterId);
    this.color = side === 'left' ? '#1E3A8A' : '#991B1B';
    this.accentColor = side === 'left' ? '#2563EB' : '#DC2626';
    this.seedBase = side === 'left' ? 101 : 707;
    this.facing = side === 'left' ? 1 : -1;
    this.arenaScale = arenaScale;
    this.scale = arenaScale * this.characterDef.scale;
    this.hitboxScale = arenaScale * this.characterDef.hitbox;
    this.maxHp = Math.round(BASE_FIGHTER_HP * this.characterDef.hp);
    this.hp = this.maxHp;
    this.x = startX;
    this.y = floorY;
    this.scarfNodes = [
      { x: startX, y: floorY - 80 * this.scale },
      { x: startX - this.facing * 10 * this.scale, y: floorY - 78 * this.scale },
      { x: startX - this.facing * 20 * this.scale, y: floorY - 75 * this.scale },
    ];
    this.joints = this.computeJoints(floorY);
  }

  public setArenaScale(arenaScale: number) {
    this.arenaScale = arenaScale;
    this.scale = arenaScale * this.characterDef.scale;
    this.hitboxScale = arenaScale * this.characterDef.hitbox;
  }

  public reset(startX: number, floorY: number, arenaScale: number, characterId?: CharacterId) {
    if (characterId) {
      this.characterId = characterId;
      this.characterDef = getCharacterDef(characterId);
    }
    this.arenaScale = arenaScale;
    this.scale = arenaScale * this.characterDef.scale;
    this.hitboxScale = arenaScale * this.characterDef.hitbox;
    this.x = startX;
    this.y = floorY;
    this.vx = 0;
    this.vy = 0;
    this.facing = this.side === 'left' ? 1 : -1;
    this.maxHp = Math.round(BASE_FIGHTER_HP * this.characterDef.hp);
    this.hp = this.maxHp;
    this.weapon = null;
    this.hasShield = false;
    this.action = 'IDLE_WAIT';
    this.actionTime = 0;
    this.actionDuration = 0;
    this.hasHitThisAction = false;
    this.hasPlayedWhoosh = false;
    this.hasBeenPulledOut = false;
    this.aiCooldown = 0.25;
    this.hitFlash = 0;
    this.consecutiveHitsTaken = 0;
    this.damageTakenWithShield = 0;
    this.isEnraged = false;
    this.hasTriggeredRage = false;
    this.pendingRageEffect = false;
    this.isPanicking = false;
    this.hasTriggeredPanic = false;
    this.pendingPanicEffect = false;
    this.rollCooldown = 0;
    this.rollInvulnTimer = 0;
    this.pendingRollEffect = null;
    this.rollStartX = startX;
    this.rollTargetX = startX;
    this.shouldRetreatAfterCombo = false;
    this.pendingFootstepShake = 0;
    this.lastStrideSign = 0;
    this.lastHeelStrideSign = 0;
    this.pendingShieldThrow = null;
    this.slowTimer = 0;
    this.bodySpin = 0;
    this.bodySpinRate = 0;
    this.homeRunTimer = 0;
    this.terrainHitCooldown = 0;
    this.pendingBopCallout = false;
    this.pendingPaperTear = null;
    this.pendingPinnedSpear = null;
    this.pendingWallBounce = null;
    this.pendingTauntEffect = false;
    this.pendingLandingImpact = false;
    this.isOverreaching = false;
    this.hasTriggeredOverreach = false;
    this.overreachTimer = 0;
    this.pendingOverreachEffect = false;
    this.windupZone = 'mid';
    this.strikeZone = 'mid';
    this.currentRangeZone = 'mid';
    this.pendingVuongCallout = false;
    this.hasUsedRecoverySlide = false;
    this.isRecoverySliding = false;
    this.lastOpponentDist = 160;
    this.needsStrikeStartMeasure = false;
    this.lockedDeadWindup = false;
    this.lockedSweetRecovery = false;
    this.zonerComboBeats = 0;
    this.heat = 0;
    this.heatCoolDelayTimer = 0;
    this.pendingVentAfterStun = false;
    this.takeoffState = 'unused';
    this.wingsBroken = false;
    this.wingsCrumpled = false;
    this.wingsCrossedOut = false;
    this.rocketPodsOpen = false;
    this.rocketPodsDetached = false;
    this.wingHp = this.characterDef.trait.takeoff?.flight.wingHp ?? 20;
    this.tempStatuses = [];
    this.pendingAreaBlast = null;
    this.pendingVentWarnCallout = false;
    this.pendingOverheatCallout = false;
    this.pendingTakeoffWarnCallout = false;
    this.pendingWingBreakCallout = false;
    this.pendingTakeoffAfterStun = false;
    this.pendingWingBreakOverheat = false;
    this.pendingRocketVolley = null;
    this.pendingRocketPodDrop = null;
    this.pendingFlightTrailDot = null;
    this.pendingSteamPush = null;
    this.comboBeatCount = 0;
    this.gagIndex = 0;
    this.finaleState = 'unused';
    this.finaleTimer = 0;
    this.outOfTricksTimer = 0;
    this.activeOwnPeelCount = 0;
    this.activeOwnJackBoxCount = 0;
    this.pendingGagSpawns = [];
    this.pendingFinaleCallout = false;
    this.pendingOutOfTricksCallout = false;
    this.pendingSqueakCallout = false;
    this.pendingHomeRunConfetti = false;
    this.winkTimer = 0;
    this.poppedShoeTimer = 0;
    this.poppedShoeSide = null;
    this.clownWalkTimer = 0;
    this.finaleConfettiTimer = 0;
    this.flightTimer = 0;
    this.flightVolleyIndex = 0;
    this.flightSmokeTimer = 0;
    this.landingTargetX = startX;
    this.takeoffDiveComplete = false;
    this.takeoffLandStuckTimer = 0;
    this.takeoffWarnSteamTimer = 0;
    this.brokenWingSmokeTimer = 0;
    this.coarsePoseTimer = 999;
    this.chimneyEmitTimer = 0;
    this.sparkEmitTimer = 0;
    this.oilEmitTimer = 0;
    this.mechGearAngle = 0;
    this.pistonSteamFired = false;
    this.comboResetTimer = 0;
    this.defenseCooldown = 0;
    this.hasReleasedShield = false;
    this.triggeredHammerJump = false;
    this.triggeredHammerDive = false;
    this.triggeredHammerSlam = false;
    this.triggeredHammerStumble = false;
    this.triggeredSpearStepBack = false;
    this.triggeredLungeBurst = false;
    this.isDragged = false;
    this.dragVelX = 0;
    this.dragVelY = 0;
    this.prevTip = null;
    this.comboQueue = [];
    this.pose = { ...DEFAULT_POSE };
    this.scarfNodes = [
      { x: startX, y: floorY - 80 * this.scale },
      { x: startX - this.facing * 10 * this.scale, y: floorY - 78 * this.scale },
      { x: startX - this.facing * 20 * this.scale, y: floorY - 75 * this.scale },
    ];
    this.joints = this.computeJoints(floorY);
  }

  public startEntranceFromCard(originX: number, originY: number, targetX: number, targetY: number) {
    this.entranceOriginX = originX;
    this.entranceOriginY = originY;
    this.entranceTargetX = targetX;
    this.entranceTargetY = targetY;
    this.x = originX;
    this.y = originY;
    this.vx = 0;
    this.vy = 0;
    this.facing = targetX >= originX ? 1 : -1;
    this.hasBeenPulledOut = false;
    this.pendingTauntEffect = false;
    this.pendingLandingImpact = false;
    this.scarfNodes = [
      { x: originX, y: originY - 80 * this.scale },
      { x: originX - this.facing * 10 * this.scale, y: originY - 78 * this.scale },
      { x: originX - this.facing * 20 * this.scale, y: originY - 75 * this.scale },
    ];
    this.startAction('ENTRANCE_JUMP', this.characterDef.entrance.duration);
    this.joints = this.computeJoints(originY);
  }

  public startAction(next: FighterAction, duration = 0) {
    const wasAttack = this.isAttacking();
    this.action = next;
    this.actionTime = 0;
    this.actionDuration = duration;
    if (this.isAttacking()) {
      this.comboBeatCount = wasAttack ? this.comboBeatCount + 1 : 1;
    } else {
      this.comboBeatCount = 0;
    }
    this.hasHitThisAction = false;
    this.hasPlayedWhoosh = false;
    this.hasReleasedShield = false;
    this.triggeredHammerJump = false;
    this.triggeredHammerDive = false;
    this.triggeredHammerSlam = false;
    this.triggeredHammerStumble = false;
    this.triggeredSpearStepBack = false;
    this.triggeredLungeBurst = false;
    this.hasUsedRecoverySlide = false;
    this.isRecoverySliding = false;
    this.needsStrikeStartMeasure = false;
    this.lockedDeadWindup = false;
    this.lockedSweetRecovery = false;
    this.pistonSteamFired = false;
    this.coarsePoseTimer = 999;

    if (this.isAttacking() && this.characterDef.trait.measureAt) {
      if (this.characterDef.trait.measureAt.includes('windupStart')) {
        this.windupZone = this.classifyRangeZone(this.lastOpponentDist);
        this.strikeZone = this.windupZone;
        if (this.windupZone === 'dead' && !this.isIgnoredBySweetSpot(next)) {
          this.lockedDeadWindup = true;
        }
      }
      if (this.characterDef.trait.measureAt.includes('strikeStart')) {
        this.needsStrikeStartMeasure = true;
      }
      if (duration > 0) {
        this.actionDuration = this.getActionDuration(next);
      }
    }

    if (
      next === 'STANCE' ||
      next === 'IDLE_WAIT' ||
      next === 'TAUNT' ||
      next === 'VICTORY' ||
      next === 'GETUP' ||
      next === 'DRAGGED' ||
      next === 'PINNED' ||
      next === 'SLIP' ||
      next === 'VENT_WARN' ||
      next === 'TAKEOFF_WARN' ||
      next === 'TAKEOFF_FLIGHT' ||
      next === 'TAKEOFF_LAND_STUCK'
    ) {
      this.bodySpin = 0;
      this.bodySpinRate = 0;
      this.zonerComboBeats = 0;
    }
    this.prevTip = null;
  }

  public isAirborne(): boolean {
    return this.action === 'TAKEOFF_FLIGHT';
  }

  public startDrag(pointerX: number, pointerY: number) {
    this.isDragged = true;
    this.hasBeenPulledOut = true;
    this.comboQueue = [];
    const anchorY = this.joints.shoulder.y;
    this.dragOffsetX = this.x - pointerX;
    this.dragOffsetY = this.y - pointerY;
    // Clamp offset so user feels like they're holding near torso/head
    if (Math.abs(pointerY - anchorY) > 65 * this.scale) {
      this.dragOffsetY = 50 * this.scale;
    }
    this.vx = 0;
    this.vy = 0;
    this.dragVelX = 0;
    this.dragVelY = 0;
    this.startAction('DRAGGED', 0);
    sfx.playGrab();
  }

  public moveDrag(pointerX: number, pointerY: number, dt: number, minX: number, maxX: number, floorY: number) {
    if (!this.isDragged) return;
    const targetX = clamp(pointerX + this.dragOffsetX, minX, maxX);
    const targetY = clamp(pointerY + this.dragOffsetY, 95 * this.scale, floorY + 8);
    const safeDt = Math.max(0.008, dt);
    this.dragVelX = lerp(this.dragVelX, (targetX - this.x) / safeDt, 0.35);
    this.dragVelY = lerp(this.dragVelY, (targetY - this.y) / safeDt, 0.35);
    this.x = targetX;
    this.y = targetY;
  }

  public endDrag(floorY: number) {
    if (!this.isDragged) return;
    this.isDragged = false;
    this.vx = clamp(this.dragVelX * 0.45, -520, 520);
    this.vy = clamp(this.dragVelY * 0.35, -450, 260);
    if (this.hp <= 0) {
      this.startAction('KO', 0);
    } else if (this.y < floorY - 12) {
      this.startAction('STANCE', 0);
    } else {
      this.y = floorY;
      this.startAction('STANCE', 0);
    }
    sfx.playDrop();
  }

  public containsPoint(px: number, py: number): boolean {
    const cx = (this.joints.hip.x + this.joints.head.x) * 0.5;
    const cy = (this.joints.hip.y + this.joints.head.y) * 0.5 + 10 * this.scale;
    const hitRx = 42 * this.hitboxScale;
    const hitRy = 68 * this.hitboxScale;
    const dx = (px - cx) / hitRx;
    const dy = (py - cy) / hitRy;
    return dx * dx + dy * dy <= 1;
  }

  public addTempStatus(effect: Omit<TempStatusEffect, 'remaining'>) {
    const existing = this.tempStatuses.find((s) => s.id === effect.id);
    if (existing) {
      existing.duration = effect.duration;
      existing.remaining = effect.duration;
      existing.damageTakenMul = effect.damageTakenMul;
      existing.damageDealtMul = effect.damageDealtMul;
      existing.moveSpeedMul = effect.moveSpeedMul;
      existing.recoveryMul = effect.recoveryMul;
      existing.reachMul = effect.reachMul;
      existing.windupMul = effect.windupMul;
      existing.noHeatGain = effect.noHeatGain;
      existing.label = effect.label;
      return;
    }
    this.tempStatuses.push({ ...effect, remaining: effect.duration });
  }

  public hasTempStatus(id: string): boolean {
    return this.tempStatuses.some((s) => s.id === id && s.remaining > 0);
  }

  public getStatusDamageTakenMul(): number {
    let mul = 1;
    for (const s of this.tempStatuses) {
      if (s.remaining > 0 && s.damageTakenMul !== undefined) mul *= s.damageTakenMul;
    }
    return mul;
  }

  public getStatusDamageDealtMul(): number {
    let mul = 1;
    for (const s of this.tempStatuses) {
      if (s.remaining > 0 && s.damageDealtMul !== undefined) mul *= s.damageDealtMul;
    }
    return mul;
  }

  public getStatusMoveSpeedMul(): number {
    let mul = 1;
    for (const s of this.tempStatuses) {
      if (s.remaining > 0 && s.moveSpeedMul !== undefined) mul *= s.moveSpeedMul;
    }
    return mul;
  }

  public getStatusRecoveryMul(): number {
    let mul = 1;
    for (const s of this.tempStatuses) {
      if (s.remaining > 0 && s.recoveryMul !== undefined) mul *= s.recoveryMul;
    }
    return mul;
  }

  public getStatusReachMul(): number {
    let mul = 1;
    for (const s of this.tempStatuses) {
      if (s.remaining > 0 && s.reachMul !== undefined) mul *= s.reachMul;
    }
    return mul;
  }

  public getStatusWindupMul(): number {
    let mul = 1;
    for (const s of this.tempStatuses) {
      if (s.remaining > 0 && s.windupMul !== undefined) mul *= s.windupMul;
    }
    return mul;
  }

  public hasNoHeatGainStatus(): boolean {
    return this.tempStatuses.some((s) => s.remaining > 0 && s.noHeatGain);
  }

  public applyIncomingDamageModifier(rawDamage: number): number {
    if (rawDamage <= 0) return 0;
    const mul = this.getStatusDamageTakenMul();
    return Math.max(1, Math.round(rawDamage * mul));
  }

  public getBoilerTier(): 'cool' | 'warm' | 'hot' | 'overheat' {
    if (this.hasTempStatus('overheat')) return 'overheat';
    const trait = this.characterDef.trait;
    if (this.heat >= (trait.hotAt ?? 75)) return 'hot';
    if (this.heat >= (trait.warmAt ?? 40)) return 'warm';
    return 'cool';
  }

  public getBoilerDamageMul(): number {
    if (this.characterDef.trait.id !== 'boiler') return 1;
    const trait = this.characterDef.trait;
    if (this.heat >= (trait.hotAt ?? 75)) return trait.hotDmgMul ?? 1.16;
    if (this.heat >= (trait.warmAt ?? 40)) return trait.warmDmgMul ?? 1.08;
    return 1;
  }

  public triggerBoilerVent() {
    if (
      this.hp <= 0 ||
      this.action === 'KO' ||
      this.action === 'VENT_WARN' ||
      this.action === 'TAKEOFF_WARN' ||
      this.action === 'TAKEOFF_FLIGHT' ||
      this.action === 'TAKEOFF_LAND_STUCK'
    ) {
      return;
    }
    this.pendingVentAfterStun = false;
    this.comboQueue = [];
    this.vx = 0;
    this.pendingVentWarnCallout = true;
    const warnSec = this.characterDef.trait.ventWarnSec ?? 0.5;
    this.startAction('VENT_WARN', warnSec);
  }

  public triggerTakeoff() {
    const takeoffCfg = this.characterDef.trait.takeoff;
    if (!takeoffCfg || this.takeoffState !== 'unused' || this.hp <= 0) return;
    this.takeoffState = 'warn';
    this.pendingTakeoffAfterStun = false;
    this.pendingVentAfterStun = false;
    this.comboQueue = [];
    this.isRecoverySliding = false;
    this.vx = 0;
    this.vy = 0;
    this.wingHp = takeoffCfg.flight.wingHp;
    this.takeoffWarnSteamTimer = 0;
    this.pendingTakeoffWarnCallout = true;
    sfx.playTakeoffCharge();
    this.startAction('TAKEOFF_WARN', takeoffCfg.megaVent.warnTime);
  }

  public onHitResolved(ev: HitResolvedEvent) {
    const trait = this.characterDef.trait;
    if (trait.id !== 'boiler') return;
    if (ev.isAmbient || ev.fullyBlocked || !ev.hitConnected || ev.actualDamage <= 0) return;

    // Airborne flight wing-HP tracking (only non-ambient hits during TAKEOFF_FLIGHT; melee is blocked in checkAttackHit)
    if (this.action === 'TAKEOFF_FLIGHT') {
      if (this.hp <= 0) {
        this.wingsCrumpled = true;
        this.rocketPodsDetached = true;
        this.takeoffState = 'used';
        this.pendingRocketPodDrop = {
          x: this.x,
          y: this.joints.hip.y,
          facing: this.facing,
          scale: this.scale,
        };
        return;
      }
      this.wingHp = Math.max(0, this.wingHp - ev.actualDamage);
      if (this.wingHp <= 0 && !this.wingsBroken) {
        this.wingsBroken = true;
        this.takeoffState = 'used';
        this.rocketPodsOpen = true;
        this.pendingWingBreakCallout = true;
        this.pendingWingBreakOverheat = true;
        sfx.playWingBreak();
        this.vx = 0;
        this.vy = 210 * this.scale;
        this.comboQueue = [];
        this.startAction('KNOCKDOWN', trait.takeoff?.flight.breakStun ?? 1.0);
      }
      return;
    }

    if (this.hasNoHeatGainStatus() || this.hp <= 0) return;

    const maxHeat = trait.maxHeat ?? 100;
    const perDmg = trait.heatPerDmg ?? 2;
    this.heat = Math.min(maxHeat, this.heat + perDmg * ev.actualDamage);
    this.heatCoolDelayTimer = trait.coolDelay ?? 2.5;

    if (this.heat >= maxHeat) {
      if (
        this.action === 'HURT' ||
        this.action === 'KNOCKDOWN' ||
        this.action === 'PINNED' ||
        this.action === 'SLIP' ||
        this.action === 'GETUP'
      ) {
        this.pendingVentAfterStun = true;
      } else if (
        this.action !== 'VENT_WARN' &&
        this.action !== 'TAKEOFF_WARN' &&
        this.action !== 'TAKEOFF_LAND_STUCK' &&
        this.action !== 'KO' &&
        !this.isDragged
      ) {
        this.triggerBoilerVent();
      }
    }
  }

  public getCurrentGagType(): 'bananaPeel' | 'creamPie' | 'jackBox' {
    const seq = this.characterDef.trait.sequence ?? ['bananaPeel', 'creamPie', 'jackBox'];
    return seq[this.gagIndex % seq.length];
  }

  public onAttackHitResolved(ev: HitResolvedEvent) {
    const trait = this.characterDef.trait;
    if (trait.id !== 'gagBag') return;
    if (ev.isAmbient || ev.fullyBlocked || !ev.hitConnected || ev.actualDamage <= 0) return;
    if (this.hp <= 0 || this.finaleState === 'outOfTricks') return;

    // BAT_3 home-run confetti burst for Hề Bóng Bay
    if (this.characterId === 'hebongbay' && ev.attackType === 'BAT_3') {
      this.pendingHomeRunConfetti = true;
    }

    const inFinale = this.finaleState === 'active' && Boolean(trait.finale?.gagOnEveryHit);
    const isUnarmedKickFinisher =
      this.characterId === 'hebongbay' &&
      !this.weapon &&
      ['ROUNDHOUSE', 'SWEEP_KICK', 'JUMP_KICK'].includes(ev.attackType);
    const isSwordFinisher =
      this.characterId === 'hebongbay' && ev.attackType === 'SWORD_3';
    const isHammerFinisher =
      this.characterId === 'hebongbay' && ev.attackType === 'HAMMER_3';

    if (!ev.isFinisher && !inFinale && !isUnarmedKickFinisher) return;

    const seq = trait.sequence ?? ['bananaPeel', 'creamPie', 'jackBox'];
    const currentGag = seq[this.gagIndex % seq.length];
    const maxPeels = inFinale ? 2 : (isSwordFinisher ? 2 : (trait.props?.bananaPeel.max ?? 1));
    const maxBoxes = inFinale ? 2 : (trait.props?.jackBox.max ?? 1);

    let placed = false;
    if (currentGag === 'bananaPeel') {
      if (this.activeOwnPeelCount < maxPeels) {
        this.pendingGagSpawns.push({
          type: 'bananaPeel',
          attackerX: this.x,
          attackerY: this.y,
          facing: this.facing,
          targetX: ev.defender.x,
          targetY: ev.defender.joints.head.y,
          dropBehindTarget: isUnarmedKickFinisher,
          dropTwoSidePeels: isSwordFinisher && this.activeOwnPeelCount === 0,
        });
        this.activeOwnPeelCount += isSwordFinisher && this.activeOwnPeelCount === 0 ? 2 : 1;
        placed = true;
      }
    } else if (currentGag === 'creamPie') {
      this.pendingGagSpawns.push({
        type: 'creamPie',
        attackerX: this.joints.handL.x,
        attackerY: this.joints.handL.y,
        facing: this.facing,
        targetX: ev.defender.x,
        targetY: ev.defender.joints.head.y,
      });
      placed = true;
    } else if (currentGag === 'jackBox') {
      if (this.activeOwnJackBoxCount < maxBoxes) {
        const baseFuse = trait.props?.jackBox.fuse ?? 1.0;
        this.pendingGagSpawns.push({
          type: 'jackBox',
          attackerX: this.x,
          attackerY: this.y,
          facing: this.facing,
          targetX: ev.defender.x,
          targetY: ev.defender.joints.head.y,
          jackFuseOverride: isHammerFinisher ? Math.max(0.35, baseFuse - 0.3) : baseFuse,
        });
        this.activeOwnJackBoxCount += 1;
        placed = true;
      }
    }

    // Unarmed kick finisher perk: if current gag wasn't bananaPeel, also drop a bonus peel behind opponent if slot open
    if (isUnarmedKickFinisher && currentGag !== 'bananaPeel' && this.activeOwnPeelCount < maxPeels) {
      this.pendingGagSpawns.push({
        type: 'bananaPeel',
        attackerX: this.x,
        attackerY: this.y,
        facing: this.facing,
        targetX: ev.defender.x,
        targetY: ev.defender.joints.head.y,
        dropBehindTarget: true,
      });
      this.activeOwnPeelCount += 1;
    }

    if (placed) {
      this.winkTimer = 0.55;
      if (trait.advanceOnlyWhenPlaced !== false) {
        this.gagIndex = (this.gagIndex + 1) % seq.length;
      }
    }
  }

  public getEffectiveMoveSpeed(): number {
    const rageBoost = this.isEnraged ? 1.2 : 1;
    const panicBoost = this.isPanicking ? 1.15 : 1;
    const overreachSpeed =
      this.isOverreaching && this.characterDef.ai.overreach
        ? this.characterDef.ai.overreach.moveSpeedMul
        : 1;
    const shieldPenalty =
      this.hasShield && this.characterDef.affinity.shield === 'weak'
        ? 0.75
        : this.hasShield && this.characterId === 'lonsat'
          ? 0.85
          : 1;
    const statusSpeed = this.getStatusMoveSpeedMul();
    return (
      this.characterDef.moveSpeed *
      rageBoost *
      panicBoost *
      overreachSpeed *
      shieldPenalty *
      statusSpeed
    );
  }

  public getWeaponReach(weaponKey?: PrimaryWeaponType | null): number {
    const key = weaponKey ?? this.weapon ?? 'unarmed';
    const base = WEAPON_REACH[key] ?? WEAPON_REACH.unarmed;
    const overreachMul =
      this.isOverreaching && this.characterDef.ai.overreach
        ? this.characterDef.ai.overreach.reachMul
        : 1;
    const batNeutralBonus =
      key === 'bat' && this.characterId === 'caokieu' ? 1.12 : 1;
    const unarmedLonSatBonus =
      key === 'unarmed' && this.characterId === 'lonsat' ? 1.1 : 1;
    const spearClownWeak =
      key === 'spear' && this.characterId === 'hebongbay' ? 0.9 : 1;
    const statusReachMul = this.getStatusReachMul();
    return (
      base *
      this.scale *
      this.characterDef.limbLength *
      overreachMul *
      batNeutralBonus *
      unarmedLonSatBonus *
      spearClownWeak *
      statusReachMul
    );
  }

  public getActiveSweetBand(): [number, number] {
    if (this.isOverreaching && this.characterDef.ai.overreach) {
      return this.characterDef.ai.overreach.band;
    }
    const baseBand = this.characterDef.trait.sweetBand ?? [0.8, 1.0];
    if (this.weapon === 'spear' && this.characterDef.affinity.spear === 'strong') {
      return [Math.min(0.7, baseBand[0]), baseBand[1]];
    }
    return baseBand;
  }

  public classifyRangeZone(dist: number): 'sweet' | 'mid' | 'dead' {
    const reach = Math.max(1, this.getWeaponReach());
    const ratio = dist / reach;
    const deadBelow = this.characterDef.trait.deadBelow ?? 0.5;
    if (ratio < deadBelow) return 'dead';
    const [sweetMin, sweetMax] = this.getActiveSweetBand();
    if (ratio >= sweetMin && ratio <= sweetMax) return 'sweet';
    return 'mid';
  }

  public isIgnoredBySweetSpot(act: FighterAction): boolean {
    const ignores = this.characterDef.trait.ignores;
    if (!ignores || ignores.length === 0) return false;
    if (ignores.includes('aoe') && (act === 'SWORD_3' || act === 'HAMMER_2')) {
      return true;
    }
    if (ignores.includes('thrownShield') && act === 'SHIELD_THROW') {
      return true;
    }
    return false;
  }

  public getEffectiveWindupMult(): number {
    const base = this.isEnraged ? 1.0 : this.characterDef.phaseTime.windup;
    return base * this.getStatusWindupMul();
  }

  public getBaseRollCooldown(): number {
    if (!this.weapon && this.characterDef.affinity.unarmed === 'strong') {
      return 3.0;
    }
    return this.characterDef.trait.cooldown ?? 4.0;
  }

  private scaleAttackTiming(
    act: FighterAction,
    baseStart: number,
    baseEnd: number,
    baseDuration: number,
  ): { activeStart: number; activeEnd: number; duration: number } {
    let wMult = this.getEffectiveWindupMult();
    // Bat affinity on Bự Con & Lon Sắt: feint hesitation at BAT_2 lasts 0.20s instead of 0.15s
    if (act === 'BAT_2' && (this.characterId === 'bucon' || this.characterId === 'lonsat')) {
      wMult = Math.max(wMult, 1.33);
    }
    // Bat affinity on Nhóc: feint hesitation pause ~0.10s; on Hề Bóng Bay slightly more playful (~0.12s)
    if (act === 'BAT_2' && this.characterId === 'nhoc') {
      wMult *= 0.76;
    } else if (act === 'BAT_2' && this.characterId === 'hebongbay') {
      wMult *= 0.88;
    }
    // Hammer weak affinity: Nhóc extra 1.5x windup, Cao Kều extra 1.35x windup
    if (this.weapon === 'hammer' && this.characterDef.affinity.hammer === 'weak') {
      wMult *= this.characterId === 'caokieu' ? 1.35 : 1.5;
    }
    // SweetSpot trait ("Đánh ở cự li gần < 0.5R"): locked 1.2x slower windup measured at windupStart
    if (this.lockedDeadWindup && this.characterDef.trait.deadWindupMul) {
      wMult *= this.characterDef.trait.deadWindupMul;
    }

    let sMult = this.characterDef.phaseTime.strike;
    let rMult = this.characterDef.phaseTime.recovery;
    // Unarmed strong affinity (Nhóc): kicks are 15% faster
    if (
      !this.weapon &&
      this.characterDef.affinity.unarmed === 'strong' &&
      this.characterId === 'nhoc' &&
      (act === 'KICK' ||
        act === 'SWEEP_KICK' ||
        act === 'ROUNDHOUSE' ||
        act === 'JUMP_KICK' ||
        act === 'SLIDE')
    ) {
      wMult *= 0.85;
      sMult *= 0.85;
      rMult *= 0.85;
    }
    // Hề Bóng Bay unarmed tempo: rhythmic, telegraphed circus moves rather than blitzing punches
    if (!this.weapon && this.characterId === 'hebongbay') {
      wMult *= 1;
      rMult *= 1;
    }
    // Spear weak affinity (Bự Con, Lon Sắt): 25% slower spear pull-back on SPEAR_2
    if (act === 'SPEAR_2' && this.characterDef.affinity.spear === 'weak') {
      rMult *= 1.25;
    }
    // Spear good affinity (Nhóc): fumbles slightly when caught close (20% slower pull-back/butt recovery)
    if (
      (act === 'SPEAR_2' || act === 'SPEAR_BUTT') &&
      this.characterDef.affinity.spear === 'good'
    ) {
      rMult *= 1.2;
    }
    // Cao Kều Hammer weak affinity (+20% recovery) & Bat BAT_3 (+10% recovery)
    if (this.characterId === 'caokieu') {
      if (this.weapon === 'hammer') {
        rMult *= 1.2;
      } else if (act === 'BAT_3') {
        rMult *= 1.1;
      }
    }
    // Lon Sắt Sword neutral affinity: SWORD_3 spin slightly slower & +10% recovery
    if (this.characterId === 'lonsat' && act === 'SWORD_3') {
      sMult *= 1.08;
      rMult *= 1.1;
    }
    // Lon Sắt Boiler Hot tier: 0.9x shorter recovery at >= 75 Heat
    if (
      this.characterDef.trait.id === 'boiler' &&
      this.heat >= (this.characterDef.trait.hotAt ?? 75)
    ) {
      rMult *= this.characterDef.trait.hotRecoveryMul ?? 0.9;
    }
    // Generic temporary status recovery multiplier
    rMult *= this.getStatusRecoveryMul();
    // SweetSpot trait ("Đánh đúng tầm ngọt"): 0.85x shorter recovery measured at strikeStart
    if (this.lockedSweetRecovery && this.characterDef.trait.sweetRecoveryMul) {
      rMult *= this.characterDef.trait.sweetRecoveryMul;
    }

    const activeStart = baseStart * wMult;
    const activeEnd = activeStart + (baseEnd - baseStart) * sMult;
    const duration = activeEnd + Math.max(0.02, baseDuration - baseEnd) * rMult;
    return { activeStart, activeEnd, duration };
  }

  public isInWindupPhase(): boolean {
    if (!this.isAttacking() || this.hasHitThisAction) return false;
    const spec = this.getAttackSpecs();
    return Boolean(spec && this.actionTime < spec.activeStart);
  }

  public isInRecoveryPhase(): boolean {
    if (!this.isAttacking()) return false;
    const spec = this.getAttackSpecs();
    return Boolean(spec && this.actionTime > spec.activeEnd);
  }

  public isAttacking(): boolean {
    return (
      this.action === 'JAB' ||
      this.action === 'CROSS' ||
      this.action === 'UPPERCUT' ||
      this.action === 'SUPER_PUNCH' ||
      this.action === 'KICK' ||
      this.action === 'ROUNDHOUSE' ||
      this.action === 'SWEEP_KICK' ||
      this.action === 'JUMP_KICK' ||
      this.action === 'SLIDE' ||
      this.action === 'SWORD_1' ||
      this.action === 'SWORD_2' ||
      this.action === 'SWORD_3' ||
      this.action === 'SWORD_4' ||
      this.action === 'SWORD_LUNGE' ||
      this.action === 'BAT_1' ||
      this.action === 'BAT_2' ||
      this.action === 'BAT_3' ||
      this.action === 'SPEAR_1' ||
      this.action === 'SPEAR_2' ||
      this.action === 'SPEAR_3' ||
      this.action === 'SPEAR_BUTT' ||
      this.action === 'HAMMER_1' ||
      this.action === 'HAMMER_2' ||
      this.action === 'HAMMER_3'
    );
  }

  /**
   * Deterministic Roll-Dodge ("Lộn né") check during an enemy's active strike window.
   */
  public tryTriggerRollDodge(
    attacker: StickFighter,
    minX: number,
    maxX: number,
  ): boolean {
    const trait = this.characterDef.trait;
    if (trait.id !== 'rollDodge') return false;
    if (this.rollCooldown > 0 || this.hp <= 0 || this.isDragged) return false;

    // Cannot dodge AoE 360-degree spins
    if (attacker.action === 'SWORD_3' || attacker.action === 'HAMMER_2') {
      return false;
    }

    // Forbidden character states: windup, recovery, stunned/pinned/knockdown/KO/already rolling
    if (
      this.isInWindupPhase() ||
      this.isInRecoveryPhase() ||
      this.action === 'HURT' ||
      this.action === 'KNOCKDOWN' ||
      this.action === 'PINNED' ||
      this.action === 'SLIP' ||
      this.action === 'KO' ||
      this.action === 'GETUP' ||
      this.action === 'ROLL_DODGE' ||
      this.action === 'ENTRANCE_JUMP' ||
      this.action === 'TAUNT'
    ) {
      return false;
    }

    // Choose landing spot behind or beside the attacker inside paper margins
    const dirToAttacker: 1 | -1 = attacker.x >= this.x ? 1 : -1;
    const rollDist = 66 * this.scale + 16 * attacker.scale;
    const behindX = attacker.x + dirToAttacker * rollDist;
    const safeMin = minX + 10 * this.scale;
    const safeMax = maxX - 10 * this.scale;

    let targetX: number;
    if (behindX >= safeMin && behindX <= safeMax) {
      targetX = behindX;
    } else {
      // Blocked by paper margin -> roll to open flank beside attacker
      const flankX = attacker.x - dirToAttacker * Math.max(46 * this.scale, rollDist * 0.72);
      targetX = clamp(flankX, safeMin, safeMax);
    }

    attacker.hasHitThisAction = true;
    this.rollStartX = this.x;
    this.rollTargetX = targetX;
    this.rollInvulnTimer = trait.invuln ?? 0.25;
    const panicMul = this.isPanicking ? (this.characterDef.ai.panicCooldownMul ?? 0.5) : 1;
    this.rollCooldown = this.getBaseRollCooldown() * panicMul;
    this.comboQueue = [];
    this.shouldRetreatAfterCombo = false;
    this.facing = targetX <= attacker.x ? 1 : -1;
    this.aiCooldown = 0; // Immediate counter readiness upon landing
    this.vx = 0;
    this.pendingRollEffect = {
      fromX: this.x,
      toX: targetX,
      y: this.joints.shoulder.y,
      ghosts: [
        { x: lerp(this.x, targetX, 0.34), y: this.y },
        { x: lerp(this.x, targetX, 0.68), y: this.y },
      ],
      accentColor: this.accentColor,
    };
    this.startAction('ROLL_DODGE', trait.invuln ?? 0.25);
    sfx.playDodge();
    return true;
  }

  public getWeaponVector(): { dx: number; dy: number } {
    const f = this.facing;
    const foreAngle = this.pose.upperArmR + this.pose.elbowR;
    const p = this.actionDuration > 0 ? clamp(this.actionTime / this.actionDuration, 0, 1) : 0;

    if (this.weapon === 'spear') {
      if (this.action === 'SPEAR_1') {
        const angle = lerp(1.32, 1.15, clamp(p * 1.6, 0, 1));
        return { dx: Math.sin(angle) * f, dy: Math.cos(angle) };
      }
      if (this.action === 'SPEAR_2') {
        const angle = p < 0.5 ? 1.56 : lerp(1.56, 2.05, (p - 0.5) / 0.5);
        return { dx: Math.sin(angle) * f, dy: Math.cos(angle) };
      }
      if (this.action === 'SPEAR_3') {
        const angle = p < 0.25 ? lerp(2.05, 1.57, p / 0.25) : 1.57;
        return { dx: Math.sin(angle) * f, dy: Math.cos(angle) };
      }
      if (this.action === 'SPEAR_BUTT') {
        const angle = lerp(0.55, 1.88, clamp(p * 1.5, 0, 1));
        return { dx: Math.sin(angle) * f, dy: Math.cos(angle) };
      }
      if (this.action === 'JAB' || this.action === 'CROSS') {
        const angle = Math.PI * 0.5;
        return { dx: Math.sin(angle) * f, dy: Math.cos(angle) };
      }
      if (this.characterId === 'nhoc' && (this.action === 'STANCE' || this.action === 'IDLE_WAIT' || this.action === 'DASH')) {
        // Carried diagonally rested like a tall pole
        const angle = 2.08;
        return { dx: Math.sin(angle) * f, dy: Math.cos(angle) };
      }
      if (this.characterId === 'caokieu' && (this.action === 'STANCE' || this.action === 'IDLE_WAIT')) {
        // Held forward calmly like a long fishing rod
        const angle = 1.46;
        return { dx: Math.sin(angle) * f, dy: Math.cos(angle) };
      }
    }

    if (this.weapon === 'hammer') {
      if (this.action === 'HAMMER_1') {
        const sweep = lerp(0.82, 1.52, clamp(p * 1.5, 0, 1));
        return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
      }
      if (this.action === 'HAMMER_2') {
        return { dx: Math.sin(1.52) * f, dy: Math.cos(1.52) };
      }
      if (this.action === 'HAMMER_3') {
        const sweep =
          p < 0.36 ? lerp(1.2, 2.88, p / 0.36) : lerp(2.88, 0.52, clamp((p - 0.36) / 0.22, 0, 1));
        return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
      }
      if (this.action === 'CROSS' || this.action === 'UPPERCUT') {
        const sweep = p < 0.38 ? lerp(0.55, 2.55, p / 0.38) : lerp(2.55, 0.9, clamp((p - 0.38) / 0.35, 0, 1));
        return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
      }
      if (this.characterId === 'nhoc' && (this.action === 'STANCE' || this.action === 'IDLE_WAIT' || this.action === 'DASH')) {
        // Comically huge hammer drags along behind on the paper floor!
        const angle = -0.68;
        return { dx: Math.sin(angle) * f, dy: Math.cos(angle) };
      }
    }

    if (this.weapon === 'sword') {
      if (this.action === 'SWORD_1') {
        // Quick downward diagonal slash
        const sweep = lerp(2.4, 0.7, clamp(p * 1.6, 0, 1));
        return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
      }
      if (this.action === 'SWORD_2') {
        // Immediate upward reverse slash
        const sweep = lerp(0.45, 2.58, clamp(p * 1.6, 0, 1));
        return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
      }
      if (this.action === 'SWORD_3') {
        // Close spinning horizontal cleave
        const sweep = lerp(2.15, 1.48, clamp(p * 1.4, 0, 1));
        return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
      }
      if (this.action === 'SWORD_4') {
        // Nhóc's extra super-fast upward flash follow-up slash
        const sweep = lerp(0.65, 2.52, clamp(p * 1.8, 0, 1));
        return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
      }
      if (this.action === 'SWORD_LUNGE') {
        // Forward thrust pierce
        return { dx: f, dy: 0 };
      }
      if (this.action === 'JAB' || this.action === 'CROSS') {
        const tilt = p < 0.25 ? 1.15 : lerp(1.15, -0.25, clamp((p - 0.25) / 0.45, 0, 1));
        const worldAngle = foreAngle + tilt;
        return { dx: Math.sin(worldAngle) * f, dy: Math.cos(worldAngle) };
      }
    }

    if (this.weapon === 'bat') {
      const stiffBat = this.characterId === 'lonsat';
      if (this.action === 'BAT_1') {
        // Quick hip-height horizontal sweep (stiffer narrower arc for Lon Sắt)
        const sweep = lerp(stiffBat ? 1.94 : 2.1, stiffBat ? 1.48 : 1.42, clamp(p * 1.6, 0, 1));
        return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
      }
      if (this.action === 'BAT_2') {
        // Feint pause at 0.22..0.56 (0.15s hesitation), then snap upward from below!
        if (p < 0.22) {
          const sweep = lerp(stiffBat ? 1.5 : 1.6, stiffBat ? 0.86 : 0.72, p / 0.22);
          return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
        }
        if (p < 0.56) {
          const baseH = stiffBat ? 0.86 : 0.72;
          const jitter = Math.sin(p * 65) * 0.05;
          return { dx: Math.sin(baseH + jitter) * f, dy: Math.cos(baseH + jitter) };
        }
        const sweep = lerp(stiffBat ? 0.86 : 0.72, stiffBat ? 2.36 : 2.68, clamp((p - 0.56) / 0.26, 0, 1));
        return { dx: Math.sin(sweep) * f, dy: Math.cos(sweep) };
      }
      if (this.action === 'BAT_3') {
        // Rotates behind back, long charge (0..0.46), huge horizontal swing!
        const tilt = p < 0.46 ? (stiffBat ? -1.12 : -1.45) : lerp(stiffBat ? -1.12 : -1.45, stiffBat ? 0.26 : 0.42, clamp((p - 0.46) / 0.26, 0, 1));
        const worldAngle = foreAngle + tilt;
        return { dx: Math.sin(worldAngle) * f, dy: Math.cos(worldAngle) };
      }
      if (this.action === 'CROSS') {
        const tilt = p < 0.3 ? -0.7 : lerp(-0.7, 0.45, clamp((p - 0.3) / 0.4, 0, 1));
        const worldAngle = foreAngle + tilt;
        return { dx: Math.sin(worldAngle) * f, dy: Math.cos(worldAngle) };
      }
    }

    let tilt = 0.38;
    if (this.action === 'CROSS' || this.action === 'UPPERCUT') {
      tilt = 0.08;
    } else if (this.action === 'STANCE' || this.action === 'IDLE_WAIT') {
      tilt = 0.55;
    }
    const worldAngle = foreAngle + tilt;
    return {
      dx: Math.sin(worldAngle) * f,
      dy: Math.cos(worldAngle),
    };
  }

  public getAttackSpecs(): {
    activeStart: number;
    activeEnd: number;
    damage: number;
    knockbackX: number;
    knockbackY: number;
    heavy: boolean;
    limb: 'handR' | 'handL' | 'footR' | 'footL';
    reach: number;
    useWeapon: boolean;
    weaponType: PrimaryWeaponType | null;
    hitstop: number;
    shake: number;
    guardBreak?: boolean;
    slow?: boolean;
    slowDuration?: number;
    pin?: boolean;
    homeRun?: boolean;
    longRecovery?: boolean;
  } | null {
    const armed = this.weapon !== null;
    const wDef = this.weapon ? WEAPONS[this.weapon] : null;
    const limbScale = this.characterDef.limbLength;
    const overreachReachMul =
      this.isOverreaching && this.characterDef.ai.overreach
        ? this.characterDef.ai.overreach.reachMul
        : 1;
    const reachScale = limbScale * overreachReachMul;
    const extraReach = wDef ? wDef.extraReach * this.scale * reachScale : 0;
    const dmgScale = this.characterDef.damageDealt;
    const kbScale = this.characterDef.knockbackDealt;
    const hammerStrongBonus =
      this.weapon === 'hammer' && this.characterDef.affinity.hammer === 'strong' ? 1.1 : 1;
    const unarmedGoodBonus =
      !armed && this.characterDef.affinity.unarmed === 'good'
        ? 1.12
        : !armed && this.characterId === 'lonsat'
          ? 1.1
          : 1;
    const unarmedLonSatReach = !armed && this.characterId === 'lonsat' ? 1.1 : 1;
    const unarmedLonSatKb = !armed && this.characterId === 'lonsat' ? 1.15 : 1;
    const batWeakKb = this.characterId === 'lonsat' && this.action === 'BAT_3' ? 0.85 : 1;
    const boilerDmgMul = this.getBoilerDamageMul();
    const statusDmgMul = this.getStatusDamageDealtMul();
    const swordCleaveMult =
      this.characterDef.visual.swordDrawScale < 1 ? 1.28 : 1;

    // SweetSpot deterministic damage & knockback multipliers (measured at strikeStart)
    const trait = this.characterDef.trait;
    let sweetDmgMult = 1;
    let sweetKbMult = 1;
    if (trait.id === 'sweetSpot' && !this.isIgnoredBySweetSpot(this.action)) {
      if (this.strikeZone === 'sweet') {
        sweetDmgMult = trait.sweetDamageMul ?? 1.25;
        sweetKbMult = trait.sweetKnockbackMul ?? 1.15;
      } else if (this.strikeZone === 'dead') {
        sweetDmgMult = trait.deadDamageMul ?? 0.85;
      }
    }

    // Cao Kều per-weapon reach tweaks
    const caoKieuStraightPunchBonus =
      this.characterId === 'caokieu' &&
      !armed &&
      (this.action === 'JAB' ||
        this.action === 'CROSS' ||
        this.action === 'UPPERCUT' ||
        this.action === 'SUPER_PUNCH')
        ? 1.2
        : 1;
    const caoKieuKickSweetBonus =
      this.characterId === 'caokieu' &&
      !armed &&
      (this.action === 'KICK' ||
        this.action === 'SWEEP_KICK' ||
        this.action === 'ROUNDHOUSE' ||
        this.action === 'JUMP_KICK')
        ? 1.15
        : 1;
    const caoKieuBatReach =
      this.characterId === 'caokieu' && this.weapon === 'bat' ? 1.12 : 1;
    const caoKieuSwordLungeReach =
      this.characterId === 'caokieu' && this.action === 'SWORD_LUNGE' ? 1.25 : 1;

    const finalize = (
      baseStart: number,
      baseEnd: number,
      baseDur: number,
      rawDmg: number,
      rawKbX: number,
      rawKbY: number,
      rest: {
        heavy: boolean;
        limb: 'handR' | 'handL' | 'footR' | 'footL';
        reach: number;
        useWeapon: boolean;
        weaponType: PrimaryWeaponType | null;
        hitstop: number;
        shake: number;
        guardBreak?: boolean;
        slow?: boolean;
        slowDuration?: number;
        pin?: boolean;
        homeRun?: boolean;
        longRecovery?: boolean;
      },
    ) => {
      const t = this.scaleAttackTiming(this.action, baseStart, baseEnd, baseDur);
      const clownSpearReach =
        this.characterId === 'hebongbay' && rest.weaponType === 'spear' ? 0.9 : 1;
      const clownSwordKb =
        this.characterId === 'hebongbay' && rest.weaponType === 'sword' ? 0.9 : 1;
      const clownHammerDmg =
        this.characterId === 'hebongbay' && rest.weaponType === 'hammer' ? 0.9 : 1;
      let finalReach =
        rest.reach *
        reachScale *
        unarmedLonSatReach *
        caoKieuStraightPunchBonus *
        caoKieuKickSweetBonus *
        caoKieuBatReach *
        caoKieuSwordLungeReach *
        clownSpearReach *
        this.getStatusReachMul();
      if (this.characterId === 'caokieu' && rest.useWeapon && wDef) {
        // getStrikeTip() already places the tip at the end of Cao Kều's 1.3x arm + scaled weapon;
        // remove extraReach double-counting so the hitbox tracks the actual weaponhead instead of a huge bubble.
        const weaponPad =
          this.weapon === 'spear' ? 0 : wDef.extraReach * 0.22 * this.scale;
        const strippedBase = Math.max(
          22 * this.scale,
          rest.reach - wDef.extraReach * this.scale + weaponPad,
        );
        finalReach =
          strippedBase *
          overreachReachMul *
          caoKieuBatReach *
          caoKieuSwordLungeReach *
          this.getStatusReachMul();
      }
      return {
        activeStart: t.activeStart,
        activeEnd: t.activeEnd,
        damage: Math.max(
          1,
          Math.round(
            rawDmg *
              dmgScale *
              hammerStrongBonus *
              unarmedGoodBonus *
              clownHammerDmg *
              sweetDmgMult *
              boilerDmgMul *
              statusDmgMul,
          ),
        ),
        knockbackX: Math.round(rawKbX * kbScale * sweetKbMult * unarmedLonSatKb * batWeakKb * clownSwordKb),
        knockbackY: Math.round(rawKbY * kbScale * sweetKbMult * unarmedLonSatKb * batWeakKb * clownSwordKb),
        ...rest,
        reach: finalReach,
      };
    };

    switch (this.action) {
      case 'JAB':
        return finalize(
          this.weapon === 'sword' ? 0.07 : 0.08,
          this.weapon === 'sword' ? 0.19 : 0.21,
          this.weapon === 'sword' ? 0.27 : 0.25,
          wDef ? wDef.lightDamage : 6,
          wDef ? Math.round(wDef.knockbackX * 0.65) : 150,
          wDef ? Math.round(wDef.knockbackY * 0.6) : -55,
          {
            heavy: this.weapon === 'hammer',
            limb: armed ? 'handR' : 'handL',
            reach: 20 * this.scale + (armed ? extraReach / reachScale * 0.85 : 0),
            useWeapon: armed,
            weaponType: this.weapon,
            hitstop: wDef ? wDef.hitstop * 0.65 : 0.018,
            shake: wDef ? wDef.shake * 0.65 : 2.2,
          },
        );
      case 'CROSS': {
        const isHammer = this.weapon === 'hammer';
        return finalize(
          isHammer ? 0.18 : 0.12,
          isHammer ? 0.32 : 0.28,
          isHammer ? 0.54 : 0.36,
          wDef ? wDef.heavyDamage : 11,
          wDef ? wDef.knockbackX : 270,
          wDef ? wDef.knockbackY : -115,
          {
            heavy: wDef ? wDef.heavyOverride : true,
            limb: 'handR',
            reach: 22 * this.scale + extraReach / reachScale,
            useWeapon: armed,
            weaponType: this.weapon,
            hitstop: wDef ? wDef.hitstop : 0.04,
            shake: wDef ? wDef.shake : 5.5,
            longRecovery: isHammer,
          },
        );
      }
      case 'UPPERCUT':
        return finalize(
          0.14,
          0.31,
          0.42,
          wDef ? Math.round(wDef.heavyDamage * 1.05) : 13,
          wDef ? Math.round(wDef.knockbackX * 0.78) : 190,
          this.weapon === 'bat' ? -380 : -310,
          {
            heavy: true,
            limb: 'handR',
            reach: 23 * this.scale + (extraReach / reachScale) * 0.85,
            useWeapon: armed,
            weaponType: this.weapon,
            hitstop: wDef ? wDef.hitstop : 0.042,
            shake: wDef ? wDef.shake : 5.8,
          },
        );
      case 'SUPER_PUNCH':
        return finalize(0.22, 0.42, 0.52, 22, 460, -220, {
          heavy: true,
          limb: 'handR',
          reach: 26 * this.scale,
          useWeapon: false,
          weaponType: null,
          hitstop: 0.068,
          shake: 9.5,
        });
      case 'SWORD_1':
        return finalize(0.07, 0.19, 0.28, WEAPONS.sword.lightDamage, 125, -35, {
          heavy: false,
          limb: 'handR',
          reach: 22 * this.scale + WEAPONS.sword.extraReach * this.scale,
          useWeapon: true,
          weaponType: 'sword',
          hitstop: 0.02,
          shake: 2.8,
        });
      case 'SWORD_2':
        return finalize(0.07, 0.2, 0.3, WEAPONS.sword.lightDamage + 1, 140, -70, {
          heavy: false,
          limb: 'handR',
          reach: 23 * this.scale + WEAPONS.sword.extraReach * this.scale,
          useWeapon: true,
          weaponType: 'sword',
          hitstop: 0.022,
          shake: 3.2,
        });
      case 'SWORD_3':
        return finalize(0.15, 0.31, 0.48, WEAPONS.sword.heavyDamage + 2, 330, -170, {
          heavy: true,
          limb: 'handR',
          reach: (25 * this.scale + WEAPONS.sword.extraReach * this.scale * 1.1) * swordCleaveMult,
          useWeapon: true,
          weaponType: 'sword',
          hitstop: 0.05,
          shake: 6.5,
          longRecovery: true,
        });
      case 'SWORD_4':
        return finalize(0.05, 0.15, 0.24, 6, 150, -75, {
          heavy: false,
          limb: 'handR',
          reach: 24 * this.scale + WEAPONS.sword.extraReach * this.scale,
          useWeapon: true,
          weaponType: 'sword',
          hitstop: 0.018,
          shake: 2.8,
        });
      case 'SWORD_LUNGE':
        return finalize(0.13, 0.28, 0.45, WEAPONS.sword.heavyDamage + 1, 360, -115, {
          heavy: true,
          limb: 'handR',
          reach: 26 * this.scale + WEAPONS.sword.extraReach * this.scale * 1.12,
          useWeapon: true,
          weaponType: 'sword',
          hitstop: 0.048,
          shake: 6.2,
          longRecovery: true,
        });
      case 'BAT_1':
        return finalize(0.06, 0.19, 0.23, WEAPONS.bat.lightDamage, 140, -40, {
          heavy: false,
          limb: 'handR',
          reach: 22 * this.scale + WEAPONS.bat.extraReach * this.scale,
          useWeapon: true,
          weaponType: 'bat',
          hitstop: 0.024,
          shake: 3,
        });
      case 'BAT_2':
        return finalize(0.26, 0.39, 0.44, WEAPONS.bat.lightDamage + 4, 185, -395, {
          heavy: false,
          limb: 'handR',
          reach: 24 * this.scale + WEAPONS.bat.extraReach * this.scale,
          useWeapon: true,
          weaponType: 'bat',
          hitstop: 0.036,
          shake: 5,
          guardBreak: true,
        });
      case 'BAT_3':
        return finalize(0.27, 0.45, 0.56, WEAPONS.bat.heavyDamage + 5, 670, -335, {
          heavy: true,
          limb: 'handR',
          reach: 27 * this.scale + WEAPONS.bat.extraReach * this.scale * 1.15,
          useWeapon: true,
          weaponType: 'bat',
          hitstop: 0.072,
          shake: 10,
          homeRun: true,
        });
      case 'SPEAR_1':
        return finalize(0.06, 0.18, 0.22, WEAPONS.spear.lightDamage - 1, 115, -25, {
          heavy: false,
          limb: 'handR',
          reach:
            24 * this.scale +
            WEAPONS.spear.extraReach * this.scale +
            (this.characterDef.affinity.spear === 'good' ? 10 * this.scale : 0),
          useWeapon: true,
          weaponType: 'spear',
          hitstop: 0.022,
          shake: 2.6,
          slow: true,
          slowDuration: this.characterDef.affinity.spear === 'strong' ? 1.8 : 1.65,
        });
      case 'SPEAR_2':
        return finalize(0.06, 0.16, 0.28, WEAPONS.spear.lightDamage + 2, 170, -45, {
          heavy: false,
          limb: 'handR',
          reach: 26 * this.scale + WEAPONS.spear.extraReach * this.scale,
          useWeapon: true,
          weaponType: 'spear',
          hitstop: 0.025,
          shake: 3.2,
        });
      case 'SPEAR_3':
        return finalize(0.12, 0.31, 0.42, WEAPONS.spear.heavyDamage + 4, 290, -95, {
          heavy: true,
          limb: 'handR',
          reach: 29 * this.scale + WEAPONS.spear.extraReach * this.scale * 1.18,
          useWeapon: true,
          weaponType: 'spear',
          hitstop: 0.05,
          shake: 6,
          pin: true,
        });
      case 'SPEAR_BUTT':
        return finalize(0.06, 0.18, 0.24, 9, 280, -95, {
          heavy: false,
          limb: 'handR',
          reach: 24 * this.scale,
          useWeapon: false,
          weaponType: 'spear',
          hitstop: 0.028,
          shake: 3.8,
        });
      case 'HAMMER_1':
        return finalize(0.12, 0.25, 0.34, 4, 245, -50, {
          heavy: false,
          limb: 'handR',
          reach: 24 * this.scale + WEAPONS.hammer.extraReach * 0.55 * this.scale,
          useWeapon: false,
          weaponType: 'hammer',
          hitstop: 0.026,
          shake: 3.8,
        });
      case 'HAMMER_2':
        return finalize(0.15, 0.36, 0.46, WEAPONS.hammer.lightDamage + 3, 255, -120, {
          heavy: false,
          limb: 'handR',
          reach: 26 * this.scale + WEAPONS.hammer.extraReach * this.scale,
          useWeapon: true,
          weaponType: 'hammer',
          hitstop: 0.042,
          shake: 6.5,
        });
      case 'HAMMER_3':
        return finalize(0.33, 0.5, 0.86, WEAPONS.hammer.heavyDamage + 5, 430, -250, {
          heavy: true,
          limb: 'handR',
          reach: 30 * this.scale + WEAPONS.hammer.extraReach * this.scale * 1.15,
          useWeapon: true,
          weaponType: 'hammer',
          hitstop: 0.082,
          shake: 12,
          longRecovery: true,
        });
      case 'KICK': {
        const kickShoeBonus = !armed && this.characterDef.affinity.unarmed === 'strong' ? 7 * this.scale : 0;
        return finalize(0.11, 0.25, 0.33, 9, 230, -85, {
          heavy: false,
          limb: 'footR',
          reach: 22 * this.scale + kickShoeBonus,
          useWeapon: false,
          weaponType: null,
          hitstop: 0.018,
          shake: 2.2,
        });
      }
      case 'SWEEP_KICK': {
        const kickShoeBonus = !armed && this.characterDef.affinity.unarmed === 'strong' ? 7 * this.scale : 0;
        return finalize(0.13, 0.3, 0.38, 11, 160, -220, {
          heavy: true,
          limb: 'footR',
          reach: 26 * this.scale + kickShoeBonus,
          useWeapon: false,
          weaponType: null,
          hitstop: 0.036,
          shake: 4.5,
        });
      }
      case 'ROUNDHOUSE': {
        const kickShoeBonus = !armed && this.characterDef.affinity.unarmed === 'strong' ? 8 * this.scale : 0;
        return finalize(0.16, 0.34, 0.44, 14, 350, -180, {
          heavy: true,
          limb: 'footR',
          reach: 25 * this.scale + kickShoeBonus,
          useWeapon: false,
          weaponType: null,
          hitstop: 0.04,
          shake: 5.5,
        });
      }
      case 'JUMP_KICK': {
        const kickShoeBonus = !armed && this.characterDef.affinity.unarmed === 'strong' ? 7 * this.scale : 0;
        return finalize(0.16, 0.48, 0.54, 13, 330, -165, {
          heavy: true,
          limb: 'footR',
          reach: 26 * this.scale + kickShoeBonus,
          useWeapon: false,
          weaponType: null,
          hitstop: 0.038,
          shake: 5.2,
        });
      }
      case 'SLIDE': {
        const kickShoeBonus = !armed && this.characterDef.affinity.unarmed === 'strong' ? 7 * this.scale : 0;
        return finalize(0.08, 0.28, 0.32, 8, 190, -140, {
          heavy: false,
          limb: 'footL',
          reach: 22 * this.scale + kickShoeBonus,
          useWeapon: false,
          weaponType: null,
          hitstop: 0.02,
          shake: 2.5,
        });
      }
      default:
        return null;
    }
  }

  public getStrikeTip(spec: NonNullable<ReturnType<StickFighter['getAttackSpecs']>>): {
    x: number;
    y: number;
  } {
    const base = this.joints[spec.limb];
    if (spec.useWeapon && this.weapon) {
      const vec = this.getWeaponVector();
      const visual = this.characterDef.visual;
      const drawMult =
        this.characterId === 'caokieu'
          ? this.weapon === 'sword'
            ? visual.swordDrawScale
            : this.weapon === 'bat'
              ? visual.batDrawScale
              : this.weapon === 'spear'
                ? visual.spearDrawScale
                : this.weapon === 'hammer'
                  ? visual.hammerDrawScale
                  : 1
          : 1;
      const len = WEAPONS[this.weapon].length * this.scale * drawMult * 0.82;
      return {
        x: base.x + vec.dx * len,
        y: base.y + vec.dy * len,
      };
    }
    return base;
  }

  public takeHit(
    damage: number,
    kbX: number,
    kbY: number,
    heavy: boolean,
    attackerDir: 1 | -1,
    particles: Particle[],
    callouts: ComicCallout[],
    impactX: number,
    impactY: number,
    weaponSource: PrimaryWeaponType | 'shield' | null = null,
    opts?: {
      guardBreak?: boolean;
      slow?: boolean;
      slowDuration?: number;
      pin?: boolean;
      pinDurationMul?: number;
      attackerPinStyle?: 'standard' | 'hebongbay';
      homeRun?: boolean;
      ignoreDodge?: boolean;
      exceptArmored?: string[];
      breaksCombo?: boolean;
      stunDuration?: number;
    },
  ): TakeHitResult {
    if (
      this.action === 'KO' ||
      this.action === 'KNOCKDOWN' ||
      this.action === 'DRAGGED' ||
      (!opts?.ignoreDodge &&
        (this.action === 'DODGE_BACK' ||
          this.action === 'ROLL_DODGE' ||
          this.rollInvulnTimer > 0))
    ) {
      return { actualDamage: 0, hitConnected: false, fullyBlocked: false, armored: false };
    }

    const wDef = weaponSource ? WEAPONS[weaponSource] : null;
    const effKbX = kbX * this.characterDef.knockbackTaken;
    const effKbY = kbY * this.characterDef.knockbackTaken;

    // 0. HAMMER_2 spinning sweep grants Super Armor against knockback & combo interruption!
    const hammer2Armored =
      this.action === 'HAMMER_2' &&
      !opts?.homeRun &&
      !opts?.pin &&
      ((this.actionTime >= 0.08 && this.actionTime <= 0.38) ||
        (opts?.exceptArmored?.includes('hammerBeat2') &&
          this.actionTime >= 0.04 &&
          this.actionTime <= this.actionDuration * 0.9));
    if (hammer2Armored) {
      const armoredDmg = Math.max(1, Math.round(damage * 0.65));
      this.hp = Math.max(0, this.hp - armoredDmg);
      if (this.hasShield) this.damageTakenWithShield += armoredDmg;
      this.hitFlash = 0.09;
      sfx.playShieldClang(false);
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * 120,
          vy: Math.sin(ang) * 120,
          life: 0.2,
          maxLife: 0.2,
          size: 7 * this.scale,
          color: '#334155',
          kind: 'spark',
          angle: ang,
          spin: 4,
          seed: Math.random() * 100,
        });
      }
      callouts.push({
        x: impactX,
        y: impactY - 26 * this.scale,
        vy: -36,
        text: `GIÁP NẶNG! -${armoredDmg}`,
        color: '#334155',
        life: 0.5,
        maxLife: 0.5,
        scale: 0.9,
        tilt: (Math.random() - 0.5) * 0.16,
      });
      if (this.hp <= 0) {
        this.comboQueue = [];
        this.startAction('KNOCKDOWN', 0.9);
      }
      return { actualDamage: armoredDmg, hitConnected: true, fullyBlocked: false, armored: true };
    }

    // 0a. VENT_WARN / TAKEOFF_WARN charge phase: takes damage normally but immune to knockback & hitstun!
    if (this.action === 'VENT_WARN' || this.action === 'TAKEOFF_WARN') {
      const warnDmg = Math.max(1, Math.round(damage));
      this.hp = Math.max(0, this.hp - warnDmg);
      if (this.hasShield) this.damageTakenWithShield += warnDmg;
      this.hitFlash = 0.12;
      sfx.playMetalPotClang(false);
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * 140,
          vy: Math.sin(ang) * 140 - 20,
          life: 0.22,
          maxLife: 0.22,
          size: 7.5 * this.scale,
          color: i % 2 === 0 ? '#F97316' : '#475569',
          kind: 'spark',
          angle: ang,
          spin: 4,
          seed: Math.random() * 100,
        });
      }
      if (this.hp <= 0) {
        this.comboQueue = [];
        this.startAction('KNOCKDOWN', 0.9);
      }
      return { actualDamage: warnDmg, hitConnected: true, fullyBlocked: false, armored: true };
    }

    // 0b. Thick Skin trait ("Da dày"): light hits (<12) during windup subtract HP without breaking combo or knocking back!
    const trait = this.characterDef.trait;
    if (
      trait.id === 'thickSkin' &&
      this.isInWindupPhase() &&
      damage < (trait.armorBelowDmg ?? 12) &&
      !opts?.homeRun &&
      !opts?.pin
    ) {
      this.hp = Math.max(0, this.hp - damage);
      if (this.hasShield) this.damageTakenWithShield += damage;
      this.hitFlash = 0.08;
      sfx.playBlock();
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.35;
        particles.push({
          x: impactX + Math.cos(ang) * 8 * this.scale,
          y: impactY + Math.sin(ang) * 8 * this.scale,
          vx: Math.cos(ang) * 75,
          vy: Math.sin(ang) * 75,
          life: 0.2,
          maxLife: 0.2,
          size: 6.5 * this.scale,
          color: '#334155',
          kind: 'line',
          angle: ang,
          spin: 0,
          seed: Math.random() * 120,
        });
      }
      callouts.push({
        x: this.joints.head.x,
        y: this.joints.head.y - 24 * this.scale,
        vy: -26,
        text: 'HỪ!',
        color: '#334155',
        life: 0.44,
        maxLife: 0.44,
        scale: 0.85,
        tilt: (Math.random() - 0.5) * 0.15,
      });
      if (this.hp <= 0) {
        this.comboQueue = [];
        this.startAction('KNOCKDOWN', 0.9);
      }
      return { actualDamage: damage, hitConnected: true, fullyBlocked: false, armored: true };
    }

    // Check if victim was mid-combo / mid-windup so strong hits break their combo visibly
    const wasMidCombo =
      this.comboQueue.length > 0 || (this.isAttacking() && !this.hasHitThisAction);

    // 1. Active shield crouch defense (unless broken by BAT_2 feint guard-break!)
    if (this.action === 'SHIELD_CROUCH' && !opts?.guardBreak) {
      const negateProb =
        this.characterDef.affinity.shield === 'strong'
          ? 0.68
          : this.characterId === 'lonsat'
            ? 0.63
            : this.characterId === 'hebongbay'
              ? 0.5
              : this.characterId === 'caokieu'
                ? 0.42
                : 0.58;
      const fullNegate = Math.random() < negateProb;
      if (this.characterId === 'lonsat') {
        sfx.playMetalPotClang(fullNegate);
      } else {
        sfx.playShieldClang(fullNegate);
      }
      this.hitFlash = 0.08;

      for (let i = 0; i < (fullNegate ? 9 : 6); i++) {
        const ang = (Math.PI * 2 * i) / (fullNegate ? 9 : 6) + Math.random() * 0.4;
        const spd = 110 + Math.random() * 140;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 20,
          life: 0.24,
          maxLife: 0.24,
          size: (fullNegate ? 8.5 : 6.5) * this.scale,
          color: i % 2 === 0 ? '#1E3A8A' : '#92400E',
          kind: fullNegate ? 'spark' : 'line',
          angle: ang,
          spin: 4,
          seed: Math.random() * 120,
        });
      }

      if (fullNegate) {
        particles.push({
          x: impactX,
          y: impactY,
          vx: 0,
          vy: 0,
          life: 0.22,
          maxLife: 0.22,
          size: 13 * this.scale,
          color: '#1E3A8A',
          kind: 'ring',
          angle: 0,
          spin: 0,
          seed: Math.random() * 100,
        });
        this.vx = attackerDir * effKbX * 0.2;
        callouts.push({
          x: impactX,
          y: impactY - 24 * this.scale,
          vy: -36,
          text: 'CHẮN HẾT!',
          color: '#1E3A8A',
          life: 0.5,
          maxLife: 0.5,
          scale: 0.94,
          tilt: (Math.random() - 0.5) * 0.2,
        });
        return { actualDamage: 0, hitConnected: true, fullyBlocked: true, armored: false };
      }

      const reduced = Math.max(1, Math.round(damage * 0.22));
      this.hp = Math.max(0, this.hp - reduced);
      if (this.hasShield) this.damageTakenWithShield += reduced;
      this.vx = attackerDir * effKbX * (weaponSource === 'hammer' ? 0.45 : 0.28);
      callouts.push({
        x: impactX,
        y: impactY - 24 * this.scale,
        vy: -34,
        text: `ĐỠ! -${reduced}`,
        color: '#334155',
        life: 0.46,
        maxLife: 0.46,
        scale: 0.88,
        tilt: (Math.random() - 0.5) * 0.2,
      });
      if (this.hp <= 0) {
        this.startAction('KNOCKDOWN', 0.9);
      }
      return { actualDamage: reduced, hitConnected: true, fullyBlocked: false, armored: false };
    }

    // 2. Standard forearm block (broken by BAT_2 feint guard-break!)
    const blocked = this.action === 'BLOCK' && !opts?.guardBreak;
    if (blocked) {
      const blockMult = wDef ? wDef.blockPenetration : 0.22;
      const actualDamage = Math.max(1, Math.round(damage * blockMult));
      this.hp = Math.max(0, this.hp - actualDamage);
      if (this.hasShield) this.damageTakenWithShield += actualDamage;
      this.hitFlash = 0.1;
      this.vx = attackerDir * effKbX * (weaponSource === 'hammer' ? 0.6 : 0.35);
      if (this.characterId === 'lonsat') {
        sfx.playMetalPotClang(false);
      } else {
        sfx.playBlock();
      }
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
        const spd = 90 + Math.random() * 110;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0.22,
          maxLife: 0.22,
          size: 7 * this.scale,
          color: '#475569',
          kind: 'line',
          angle: ang,
          spin: 0,
          seed: Math.random() * 100,
        });
      }
      callouts.push({
        x: impactX,
        y: impactY - 22 * this.scale,
        vy: -32,
        text: weaponSource === 'spear' ? 'XUYÊN!' : 'CẠCH!',
        color: '#475569',
        life: 0.42,
        maxLife: 0.42,
        scale: 0.85,
        tilt: (Math.random() - 0.5) * 0.25,
      });
      if (this.hp <= 0) {
        this.startAction('KNOCKDOWN', 0.9);
      }
      return { actualDamage, hitConnected: true, fullyBlocked: false, armored: false };
    }

    if (opts?.guardBreak && (this.action === 'BLOCK' || this.action === 'SHIELD_CROUCH')) {
      callouts.push({
        x: impactX,
        y: impactY - 38 * this.scale,
        vy: -44,
        text: 'PHÁ ĐỠ!',
        color: '#D97706',
        life: 0.62,
        maxLife: 0.62,
        scale: 1.05,
        tilt: -0.15,
      });
    }

    // 3. Passive shield glance chance even if caught mid-swing or mid-step (skipped on guardBreak/homeRun)
    if (this.hasShield && !opts?.guardBreak && !opts?.homeRun && Math.random() < 0.26) {
      const glancedDamage = Math.max(1, Math.round(damage * 0.5));
      this.hp = Math.max(0, this.hp - glancedDamage);
      this.damageTakenWithShield += glancedDamage;
      this.hitFlash = 0.11;
      this.consecutiveHitsTaken += 1;
      this.comboResetTimer = 1.35;
      if (this.characterId === 'lonsat') {
        sfx.playMetalPotClang(false);
      } else {
        sfx.playShieldClang(false);
      }
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * 140,
          vy: Math.sin(ang) * 140,
          life: 0.22,
          maxLife: 0.22,
          size: 7 * this.scale,
          color: '#1E3A8A',
          kind: 'spark',
          angle: ang,
          spin: 4,
          seed: Math.random() * 100,
        });
      }
      callouts.push({
        x: impactX,
        y: impactY - 24 * this.scale,
        vy: -38,
        text: `LƯỚT KHIÊN! -${glancedDamage}`,
        color: '#1E3A8A',
        life: 0.48,
        maxLife: 0.48,
        scale: 0.86,
        tilt: (Math.random() - 0.5) * 0.2,
      });
      this.vx = attackerDir * effKbX * 0.55;
      this.vy = effKbY * 0.45;
      this.comboQueue = [];
      if (this.hp <= 0) {
        this.startAction('KNOCKDOWN', 0.9);
      } else {
        this.startAction('HURT', 0.2);
      }
      return { actualDamage: glancedDamage, hitConnected: true, fullyBlocked: false, armored: false };
    }

    // 4. Clean unblocked hit
    this.hp = Math.max(0, this.hp - damage);
    if (this.hasShield) this.damageTakenWithShield += damage;
    this.hitFlash = 0.18;
    this.consecutiveHitsTaken += 1;
    this.comboResetTimer = 1.35;

    if (weaponSource === 'shield') {
      sfx.playShieldClang(true);
    } else if (weaponSource) {
      sfx.playWeaponHit(weaponSource);
    } else {
      sfx.playHit(heavy || this.hp <= 0);
    }

    // Distinct per-weapon visual impact effects!
    if (weaponSource === 'sword') {
      // Crisp diagonal ink slash marks + bright slash sparks
      for (let i = 0; i < 3; i++) {
        const slashAng = -0.75 + (Math.random() - 0.5) * 0.65;
        particles.push({
          x: impactX + (Math.random() - 0.5) * 14 * this.scale,
          y: impactY + (Math.random() - 0.5) * 14 * this.scale,
          vx: attackerDir * (45 + i * 25),
          vy: (Math.random() - 0.5) * 35,
          life: 0.26,
          maxLife: 0.26,
          size: (22 + Math.random() * 12) * this.scale,
          color: i === 0 ? '#DC2626' : '#0F172A',
          kind: 'slash',
          angle: slashAng,
          spin: 0,
          seed: Math.random() * 150,
        });
      }
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * 170 + attackerDir * 70,
          vy: Math.sin(ang) * 170,
          life: 0.22,
          maxLife: 0.22,
          size: 9 * this.scale,
          color: i % 2 === 0 ? '#EF4444' : '#1E293B',
          kind: 'line',
          angle: ang,
          spin: 0,
          seed: Math.random() * 100,
        });
      }
    } else if (weaponSource === 'bat') {
      // Home-run shock ring + spinning dizzy stars + heavy knockback lines
      particles.push({
        x: impactX,
        y: impactY,
        vx: 0,
        vy: 0,
        life: 0.28,
        maxLife: 0.28,
        size: 16 * this.scale,
        color: '#92400E',
        kind: 'ring',
        angle: 0,
        spin: 0,
        seed: Math.random() * 100,
      });
      for (let i = 0; i < 5; i++) {
        const ang = (Math.PI * 2 * i) / 5;
        particles.push({
          x: impactX,
          y: impactY - 12 * this.scale,
          vx: attackerDir * (140 + Math.random() * 120) + Math.cos(ang) * 70,
          vy: -110 + Math.sin(ang) * 70,
          life: 0.48,
          maxLife: 0.48,
          size: 7 * this.scale,
          color: '#D97706',
          kind: 'star',
          angle: ang,
          spin: 9,
          seed: Math.random() * 100,
        });
      }
      this.spawnDust(particles, 5);
    } else if (weaponSource === 'spear') {
      // High-velocity horizontal piercing needle streaks shooting through victim
      for (let i = 0; i < 8; i++) {
        const spread = (Math.random() - 0.5) * 0.38;
        const spd = 250 + Math.random() * 190;
        particles.push({
          x: impactX,
          y: impactY + (Math.random() - 0.5) * 12 * this.scale,
          vx: attackerDir * Math.cos(spread) * spd,
          vy: Math.sin(spread) * spd,
          life: 0.22,
          maxLife: 0.22,
          size: (14 + Math.random() * 10) * this.scale,
          color: i % 3 === 0 ? '#DC2626' : '#334155',
          kind: 'line',
          angle: attackerDir === 1 ? spread : Math.PI - spread,
          spin: 0,
          seed: Math.random() * 100,
        });
      }
    } else if (weaponSource === 'hammer') {
      // Big expanding shockwave ring + jagged impact cracks + dust eruption
      particles.push({
        x: impactX,
        y: impactY,
        vx: 0,
        vy: 0,
        life: 0.36,
        maxLife: 0.36,
        size: 24 * this.scale,
        color: '#1E293B',
        kind: 'ring',
        angle: 0,
        spin: 0,
        seed: Math.random() * 100,
      });
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.3;
        particles.push({
          x: this.x,
          y: this.y - 2,
          vx: Math.cos(ang) * 40,
          vy: 0,
          life: 0.55,
          maxLife: 0.55,
          size: (18 + Math.random() * 12) * this.scale,
          color: '#334155',
          kind: 'crack',
          angle: ang * 0.25,
          spin: 0,
          seed: Math.random() * 200,
        });
      }
      for (let i = 0; i < 12; i++) {
        const ang = (Math.PI * 2 * i) / 12 + Math.random() * 0.3;
        const spd = 160 + Math.random() * 160;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 45,
          life: 0.34,
          maxLife: 0.34,
          size: 11 * this.scale,
          color: i % 2 === 0 ? '#B91C1C' : '#1E293B',
          kind: 'spark',
          angle: ang,
          spin: 5,
          seed: Math.random() * 200,
        });
      }
      this.spawnDust(particles, 7);
    } else if (weaponSource === 'shield') {
      // Thrown shield impact ring + metallic sparks
      particles.push({
        x: impactX,
        y: impactY,
        vx: 0,
        vy: 0,
        life: 0.28,
        maxLife: 0.28,
        size: 16 * this.scale,
        color: '#1E3A8A',
        kind: 'ring',
        angle: 0,
        spin: 0,
        seed: Math.random() * 100,
      });
      for (let i = 0; i < 9; i++) {
        const ang = (Math.PI * 2 * i) / 9 + Math.random() * 0.4;
        const spd = 140 + Math.random() * 140;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 35,
          life: 0.28,
          maxLife: 0.28,
          size: 8.5 * this.scale,
          color: i % 2 === 0 ? '#1E3A8A' : '#92400E',
          kind: 'spark',
          angle: ang,
          spin: 6,
          seed: Math.random() * 150,
        });
      }
    } else {
      // Unarmed standard impact sparks
      const sparkCount = heavy ? 12 : 7;
      for (let i = 0; i < sparkCount; i++) {
        const ang = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5;
        const spd = (heavy ? 180 : 120) + Math.random() * 150;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * spd + attackerDir * 40,
          vy: Math.sin(ang) * spd - 30,
          life: 0.26 + Math.random() * 0.12,
          maxLife: 0.35,
          size: (heavy ? 11 : 7) * this.scale,
          color: i % 2 === 0 ? '#DC2626' : '#1E293B',
          kind: i % 3 === 0 ? 'spark' : 'line',
          angle: ang,
          spin: (Math.random() - 0.5) * 8,
          seed: Math.random() * 200,
        });
      }
    }

    const words = wDef
      ? wDef.callouts
      : heavy
        ? ['BỐP!', 'CHÁT!', 'RẦM!']
        : ['BỤP!', 'HỰ!', 'BỐP!'];
    callouts.push({
      x: impactX + (Math.random() - 0.5) * 18,
      y: impactY - 26 * this.scale,
      vy: -45,
      text: opts?.homeRun ? 'HOME RUN!' : words[Math.floor(Math.random() * words.length)],
      color: opts?.homeRun ? '#D97706' : weaponSource === 'hammer' || heavy ? '#B91C1C' : '#1E293B',
      life: opts?.homeRun ? 0.92 : heavy ? 0.65 : 0.46,
      maxLife: opts?.homeRun ? 0.92 : heavy ? 0.65 : 0.46,
      scale: opts?.homeRun ? 1.38 : weaponSource === 'hammer' ? 1.3 : heavy ? 1.15 : 0.92,
      tilt: (Math.random() - 0.5) * 0.3,
    });

    if (opts?.slow) {
      this.slowTimer = Math.max(this.slowTimer, opts.slowDuration ?? 1.65);
      callouts.push({
        x: this.joints.head.x,
        y: this.joints.head.y - 30 * this.scale,
        vy: -30,
        text: 'CHẬM!',
        color: '#0369A1',
        life: 0.58,
        maxLife: 0.58,
        scale: 0.86,
        tilt: 0.1,
      });
    }

    if (opts?.homeRun) {
      this.homeRunTimer = 1.15;
      this.bodySpinRate = attackerDir * 19;
    }

    // Metallic sparks & occasional loose screw on Lon Sắt impact!
    if (this.characterId === 'lonsat') {
      sfx.playMetalPotClang(heavy);
      for (let mi = 0; mi < (heavy ? 6 : 4); mi++) {
        const ang = (Math.PI * 2 * mi) / (heavy ? 6 : 4) + (Math.random() - 0.5) * 0.5;
        const spd = 120 + Math.random() * 130;
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(ang) * spd + attackerDir * 35,
          vy: Math.sin(ang) * spd - 35,
          life: 0.28,
          maxLife: 0.28,
          size: 7.5 * this.scale,
          color: mi % 2 === 0 ? '#F97316' : '#334155',
          kind: 'spark',
          angle: ang,
          spin: 5,
          seed: Math.random() * 140,
        });
      }
      if (heavy || Math.random() < 0.45) {
        particles.push({
          x: impactX,
          y: impactY - 4 * this.scale,
          vx: -attackerDir * (65 + Math.random() * 60),
          vy: -145 - Math.random() * 75,
          life: 0.65,
          maxLife: 0.65,
          size: 5.5 * this.scale,
          color: '#334155',
          kind: 'screw',
          angle: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 18,
          seed: Math.random() * 200,
        });
      }
    }

    this.vx = attackerDir * effKbX;
    this.vy = effKbY;

    if (this.hp <= 0) {
      if (this.action === 'TAKEOFF_FLIGHT') {
        this.wingsCrumpled = true;
        this.rocketPodsDetached = true;
        this.takeoffState = 'used';
        this.pendingRocketPodDrop = {
          x: this.x,
          y: this.joints.hip.y,
          facing: this.facing,
          scale: this.scale,
        };
      }
      this.comboQueue = [];
      this.isRecoverySliding = false;
      this.startAction('KNOCKDOWN', 0.9);
      return { actualDamage: damage, hitConnected: true, fullyBlocked: false, armored: false };
    }

    // While flying in TAKEOFF_FLIGHT, ranged hits hurt HP & wingHp without cancelling flight unless wingHp <= 0 (handled in onHitResolved)
    if (this.action === 'TAKEOFF_FLIGHT') {
      return { actualDamage: damage, hitConnected: true, fullyBlocked: false, armored: false };
    }

    // Light hit during Cao Kều's controlled recovery slide subtracts HP & knockback WITHOUT cancelling the slide!
    if (this.isRecoverySliding && !heavy && !opts?.pin && !opts?.homeRun) {
      return { actualDamage: damage, hitConnected: true, fullyBlocked: false, armored: false };
    }

    this.comboQueue = [];

    if (opts?.pin) {
      const basePin = this.characterDef.affinity.spear === 'weak' ? 1.4 : 0.95;
      const pinDuration = opts.pinDurationMul ? Math.max(0.45, basePin * opts.pinDurationMul) : basePin;
      this.vx = 0;
      this.vy = 0;
      this.pendingPinnedSpear = {
        x: this.x,
        y: this.joints.shoulder.y + 4 * this.scale,
        facing: attackerDir,
        scale: this.scale,
        duration: pinDuration,
        style: opts.attackerPinStyle ?? 'standard',
      };
      this.startAction('PINNED', pinDuration);
      callouts.push({
        x: this.joints.head.x,
        y: this.joints.head.y - 34 * this.scale,
        vy: -32,
        text: 'GHIM CHẶT!',
        color: '#991B1B',
        life: 0.72,
        maxLife: 0.72,
        scale: 1.0,
        tilt: -0.1,
      });
      return { actualDamage: damage, hitConnected: true, fullyBlocked: false, armored: false };
    }

    // Hề Bóng Bay comedic hit reaction: pops a shoe briefly + emits balloon deflation puffs & confetti!
    if (this.characterId === 'hebongbay' && damage >= 7 && !this.isDragged) {
      this.poppedShoeSide = Math.random() < 0.5 ? 'left' : 'right';
      this.poppedShoeTimer = 0.55;
      sfx.playBalloonDeflate();
      if (particles.length < 64) {
        for (let pi = 0; pi < 4; pi++) {
          const ang = -Math.PI * 0.5 + (Math.random() - 0.5) * 2.2;
          particles.push({
            x: this.x + (Math.random() - 0.5) * 14 * this.scale,
            y: this.joints.shoulder.y + Math.random() * 14 * this.scale,
            vx: Math.cos(ang) * (75 + Math.random() * 65),
            vy: Math.sin(ang) * 75 - 25,
            life: 0.48,
            maxLife: 0.48,
            size: (4.5 + Math.random() * 2.5) * this.scale,
            color: pi % 2 === 0 ? '#7C3AED' : '#F59E0B',
            kind: pi < 2 ? 'puff' : 'confetti',
            angle: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 10,
            seed: Math.random() * 120,
          });
        }
      }
    }

    if (wasMidCombo && (!heavy || opts?.breaksCombo)) {
      callouts.push({
        x: this.joints.head.x,
        y: this.joints.head.y - 30 * this.scale,
        vy: -36,
        text: 'NGẮT ĐÒN!',
        color: '#B91C1C',
        life: 0.56,
        maxLife: 0.56,
        scale: 0.9,
        tilt: -0.12,
      });
    }

    if (opts?.stunDuration !== undefined) {
      const kdDur = Math.max(0.45, opts.stunDuration - 0.25);
      this.startAction(heavy ? 'KNOCKDOWN' : 'HURT', heavy ? kdDur : opts.stunDuration);
      if (opts.stunDuration >= 1.0) {
        callouts.push({
          x: this.joints.head.x,
          y: this.joints.head.y - 42 * this.scale,
          vy: -28,
          text: 'CHOÁNG!',
          color: '#0D9488',
          life: 0.72,
          maxLife: 0.72,
          scale: 0.98,
          tilt: 0.08,
        });
      }
    } else if (heavy) {
      this.startAction('KNOCKDOWN', opts?.homeRun ? 0.85 : 0.65);
    } else {
      this.startAction('HURT', wasMidCombo ? 0.34 : 0.24);
    }
    return { actualDamage: damage, hitConnected: true, fullyBlocked: false, armored: false };
  }

  public update(
    dt: number,
    opponent: StickFighter,
    fightingActive: boolean,
    minX: number,
    maxX: number,
    floorY: number,
    particles: Particle[],
    trails: MotionTrail[],
    timeNow: number,
    looseShieldX: number | null = null,
    arenaTraps: ArenaTrapSnapshot[] = [],
  ) {
    this.actionTime += dt;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.winkTimer > 0) this.winkTimer = Math.max(0, this.winkTimer - dt);
    if (this.poppedShoeTimer > 0) {
      this.poppedShoeTimer = Math.max(0, this.poppedShoeTimer - dt);
      if (this.poppedShoeTimer <= 0) this.poppedShoeSide = null;
    }
    if (this.defenseCooldown > 0) this.defenseCooldown = Math.max(0, this.defenseCooldown - dt);
    if (this.rollCooldown > 0) this.rollCooldown = Math.max(0, this.rollCooldown - dt);
    if (this.rollInvulnTimer > 0) this.rollInvulnTimer = Math.max(0, this.rollInvulnTimer - dt);
    if (this.slowTimer > 0) this.slowTimer = Math.max(0, this.slowTimer - dt);
    if (this.homeRunTimer > 0) this.homeRunTimer = Math.max(0, this.homeRunTimer - dt);
    if (this.terrainHitCooldown > 0) this.terrainHitCooldown = Math.max(0, this.terrainHitCooldown - dt);
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboResetTimer = 0;
        this.consecutiveHitsTaken = 0;
      }
    }

    // Check Rage trigger (once per match when below rageBelowHp)
    const rageThreshold = this.characterDef.ai.rageBelowHp;
    if (
      rageThreshold !== undefined &&
      !this.hasTriggeredRage &&
      this.hp > 0 &&
      this.hp <= this.maxHp * rageThreshold
    ) {
      this.hasTriggeredRage = true;
      this.isEnraged = true;
      this.pendingRageEffect = true;
    }

    // Check Panic trigger ("HOẢNG LOẠN", once per match when below panicBelowHp)
    const panicThreshold = this.characterDef.ai.panicBelowHp;
    if (
      panicThreshold !== undefined &&
      !this.hasTriggeredPanic &&
      this.hp > 0 &&
      this.hp <= this.maxHp * panicThreshold
    ) {
      this.hasTriggeredPanic = true;
      this.isPanicking = true;
      this.pendingPanicEffect = true;
      this.rollCooldown *= this.characterDef.ai.panicCooldownMul ?? 0.5;
    }

    if (this.overreachTimer > 0) {
      this.overreachTimer = Math.max(0, this.overreachTimer - dt);
      if (this.overreachTimer <= 0) {
        this.isOverreaching = false;
      }
    }

    // Check Overreach trigger ("VƯƠN TỚI", once per match when below overreachBelowHp)
    const overreachCfg = this.characterDef.ai.overreach;
    const overreachThresh = this.characterDef.ai.overreachBelowHp;
    if (
      overreachCfg &&
      overreachThresh !== undefined &&
      !this.hasTriggeredOverreach &&
      this.hp > 0 &&
      this.hp <= this.maxHp * overreachThresh
    ) {
      this.hasTriggeredOverreach = true;
      this.isOverreaching = true;
      this.overreachTimer = overreachCfg.duration;
      this.pendingOverreachEffect = true;
    }

    // Generic temporary status ticking
    if (this.tempStatuses.length > 0) {
      for (const st of this.tempStatuses) {
        st.remaining -= dt;
      }
      this.tempStatuses = this.tempStatuses.filter((st) => st.remaining > 0);
    }

    // Hề Bóng Bay Finale ("MÀN CUỐI!") & Out-of-tricks ("HẾT TRÒ") lifecycle + confetti trail
    if (this.characterDef.trait.id === 'gagBag' && this.characterDef.trait.finale) {
      const fin = this.characterDef.trait.finale;
      if (
        this.finaleState === 'unused' &&
        fightingActive &&
        this.hp > 0 &&
        !this.isDragged &&
        this.hp < this.maxHp * fin.belowHp
      ) {
        this.finaleState = 'active';
        this.finaleTimer = fin.duration;
        this.pendingFinaleCallout = true;
        sfx.playClownFinale();
        this.addTempStatus({
          id: 'clownFinale',
          duration: fin.duration,
          moveSpeedMul: fin.moveSpeedMul,
          label: 'MÀN CUỐI!',
        });
        // Celebratory confetti pop
        for (let ci = 0; ci < 12; ci++) {
          const ang = (Math.PI * 2 * ci) / 12;
          const cols = ['#DC2626', '#F59E0B', '#7C3AED', '#2563EB'];
          particles.push({
            x: this.x,
            y: this.joints.shoulder.y,
            vx: Math.cos(ang) * (120 + Math.random() * 80),
            vy: Math.sin(ang) * 90 - 75,
            life: 0.72,
            maxLife: 0.72,
            size: 5 * this.scale,
            color: cols[ci % cols.length],
            kind: 'confetti',
            angle: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 14,
            seed: Math.random() * 180,
          });
        }
      } else if (this.finaleState === 'active') {
        this.finaleTimer -= dt;
        this.finaleConfettiTimer -= dt;
        if (this.finaleConfettiTimer <= 0 && particles.length < 64 && this.hp > 0) {
          this.finaleConfettiTimer = 0.14;
          const cols = ['#DC2626', '#F59E0B', '#7C3AED', '#16A34A'];
          particles.push({
            x: this.x + (Math.random() - 0.5) * 18 * this.scale,
            y: this.joints.shoulder.y - 6 * this.scale,
            vx: -this.facing * 24 + (Math.random() - 0.5) * 40,
            vy: -35 - Math.random() * 35,
            life: 0.58,
            maxLife: 0.58,
            size: 4.5 * this.scale,
            color: cols[Math.floor(Math.random() * cols.length)],
            kind: 'confetti',
            angle: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 12,
            seed: Math.random() * 140,
          });
        }
        if (this.finaleTimer <= 0) {
          this.finaleState = 'outOfTricks';
          this.outOfTricksTimer = fin.thenOutOfTricks.duration;
          this.pendingOutOfTricksCallout = true;
          sfx.playBalloonDeflate();
          this.addTempStatus({
            id: 'outOfTricks',
            duration: fin.thenOutOfTricks.duration,
            recoveryMul: fin.thenOutOfTricks.recoveryMul,
            label: 'HẾT TRÒ',
          });
        }
      } else if (this.finaleState === 'outOfTricks') {
        this.outOfTricksTimer -= dt;
        if (this.outOfTricksTimer <= 0) {
          this.finaleState = 'used';
        }
      }
    }

    // Lon Sắt Boiler heat decay, delayed stun vent & Takeoff ("CẤT CÁNH") trigger
    if (this.characterDef.trait.id === 'boiler') {
      const trait = this.characterDef.trait;
      if (
        !this.hasTempStatus('overheat') &&
        this.hp > 0 &&
        this.action !== 'VENT_WARN' &&
        this.action !== 'TAKEOFF_WARN' &&
        this.action !== 'TAKEOFF_FLIGHT' &&
        this.action !== 'TAKEOFF_LAND_STUCK'
      ) {
        if (this.heatCoolDelayTimer > 0) {
          this.heatCoolDelayTimer = Math.max(0, this.heatCoolDelayTimer - dt);
        } else if (this.heat > 0) {
          this.heat = Math.max(0, this.heat - (trait.coolRate ?? 5) * dt);
        }
      }

      const isStunnedOrPinned = ['HURT', 'KNOCKDOWN', 'PINNED', 'SLIP', 'GETUP'].includes(this.action);
      const isTakeoffBusy = ['VENT_WARN', 'TAKEOFF_WARN', 'TAKEOFF_FLIGHT', 'TAKEOFF_LAND_STUCK', 'KO', 'ENTRANCE_JUMP', 'TAUNT', 'IDLE_WAIT'].includes(this.action);

      const takeoffCfg = trait.takeoff;
      if (
        takeoffCfg &&
        this.takeoffState === 'unused' &&
        this.hp > 0 &&
        !this.isDragged &&
        fightingActive &&
        this.hp < this.maxHp * takeoffCfg.belowHp
      ) {
        if (isStunnedOrPinned || this.action === 'VENT_WARN') {
          this.pendingTakeoffAfterStun = true;
        } else if (!isTakeoffBusy) {
          this.triggerTakeoff();
        }
      }

      if (
        this.pendingTakeoffAfterStun &&
        this.takeoffState === 'unused' &&
        this.hp > 0 &&
        !this.isDragged &&
        !isStunnedOrPinned &&
        !isTakeoffBusy
      ) {
        this.triggerTakeoff();
      } else if (
        this.pendingVentAfterStun &&
        this.hp > 0 &&
        !this.isDragged &&
        !isStunnedOrPinned &&
        !isTakeoffBusy
      ) {
        this.triggerBoilerVent();
      }
    }

    // Lon Sắt cosmetic chimney steam, broken-wing black smoke, gear rotation & overheat oil drips
    if (this.characterDef.visual.boilerLook && this.hp > 0 && this.action !== 'KO') {
      this.mechGearAngle += dt * (Math.abs(this.vx) > 20 ? 3.4 : 0.8) * this.facing;
      const tier = this.getBoilerTier();
      const chimX = this.joints.shoulder.x - this.facing * 10 * this.scale;
      const chimY = this.joints.shoulder.y - 11 * this.scale;

      if (this.wingsBroken) {
        this.brokenWingSmokeTimer -= dt;
        if (this.brokenWingSmokeTimer <= 0 && particles.length < 60) {
          this.brokenWingSmokeTimer = 0.22;
          particles.push({
            x: this.joints.shoulder.x - this.facing * 6 * this.scale,
            y: this.joints.shoulder.y - 2 * this.scale,
            vx: -this.facing * 14 + (Math.random() - 0.5) * 18,
            vy: -34 - Math.random() * 18,
            life: 0.48,
            maxLife: 0.48,
            size: 5.5 * this.scale,
            color: '#1E293B',
            kind: 'steam',
            angle: 0,
            spin: (Math.random() - 0.5) * 2,
            seed: Math.random() * 100,
          });
        }
      }

      if (tier === 'overheat') {
        this.oilEmitTimer -= dt;
        if (this.oilEmitTimer <= 0 && particles.length < 60) {
          this.oilEmitTimer = 0.32;
          particles.push({
            x: this.joints.hip.x + (Math.random() - 0.5) * 14 * this.scale,
            y: this.joints.hip.y - 4 * this.scale,
            vx: -this.facing * 12 + (Math.random() - 0.5) * 16,
            vy: 25 + Math.random() * 25,
            life: 0.42,
            maxLife: 0.42,
            size: 3.4 * this.scale,
            color: '#334155',
            kind: 'oil',
            angle: 0,
            spin: 0,
            seed: Math.random() * 100,
          });
          particles.push({
            x: chimX,
            y: chimY,
            vx: -this.facing * 10,
            vy: -24,
            life: 0.45,
            maxLife: 0.45,
            size: 4.5 * this.scale,
            color: '#64748B',
            kind: 'steam',
            angle: 0,
            spin: 1,
            seed: Math.random() * 100,
          });
        }
      } else {
        const steamInterval = tier === 'hot' ? 0.16 : tier === 'warm' ? 0.34 : 0.62;
        this.chimneyEmitTimer -= dt;
        if (this.chimneyEmitTimer <= 0 && particles.length < 60) {
          this.chimneyEmitTimer = steamInterval;
          particles.push({
            x: chimX + (Math.random() - 0.5) * 4 * this.scale,
            y: chimY - 2 * this.scale,
            vx: -this.facing * 16 + (Math.random() - 0.5) * 14,
            vy: -36 - Math.random() * 18,
            life: tier === 'hot' ? 0.52 : 0.44,
            maxLife: 0.52,
            size: (tier === 'hot' ? 6.2 : 4.4) * this.scale,
            color: tier === 'hot' ? '#F97316' : '#64748B',
            kind: 'steam',
            angle: 0,
            spin: (Math.random() - 0.5) * 2,
            seed: Math.random() * 100,
          });
        }
        if (tier === 'hot') {
          this.sparkEmitTimer -= dt;
          if (this.sparkEmitTimer <= 0 && particles.length < 60) {
            this.sparkEmitTimer = 0.26;
            const ang = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.8;
            particles.push({
              x: lerp(this.joints.hip.x, this.joints.shoulder.x, 0.55) + (Math.random() - 0.5) * 10 * this.scale,
              y: lerp(this.joints.hip.y, this.joints.shoulder.y, 0.55),
              vx: Math.cos(ang) * 75,
              vy: Math.sin(ang) * 75 - 15,
              life: 0.24,
              maxLife: 0.24,
              size: 6.5 * this.scale,
              color: '#F97316',
              kind: 'spark',
              angle: ang,
              spin: 4,
              seed: Math.random() * 100,
            });
          }
        }
      }
    }

    // 1. Dragged state overrides AI & normal physics
    if (this.isDragged) {
      const targetPose = this.buildDraggedPose(timeNow);
      this.pose = lerpPose(this.pose, targetPose, clamp(dt * 14, 0, 1));
      this.joints = this.computeJoints(this.y);
      this.updateScarf(dt);
      return;
    }

    const dist = opponent.x - this.x;
    const absDist = Math.abs(dist);
    const dirToOpp: 1 | -1 = dist >= 0 ? 1 : -1;
    this.lastOpponentDist = absDist;
    this.currentRangeZone = this.classifyRangeZone(absDist);

    // 2. AI decision making & combo-escape / shield defense when fighting is active
    if (fightingActive && this.hp > 0) {
      // Combo escape while in HURT hitstun when taking consecutive hits or opponent winds up next strike
      const canDodge = this.characterDef.ai.style !== 'steadyAdvance';
      if (
        this.action === 'HURT' &&
        this.actionTime >= 0.05 &&
        this.defenseCooldown <= 0 &&
        opponent.hp > 0 &&
        absDist < 118 * this.scale &&
        (opponent.isAttacking() || this.consecutiveHitsTaken >= 1)
      ) {
        this.defenseCooldown = 0.22;
        const escapeChance = Math.min(
          0.65,
          0.2 + this.consecutiveHitsTaken * 0.16 + (this.hasShield ? 0.12 : 0),
        );
        if (Math.random() < escapeChance) {
          this.facing = dirToOpp;
          this.comboQueue = [];
          if (this.hasShield && Math.random() < 0.65) {
            this.vx = -dirToOpp * 65 * this.scale * this.characterDef.knockbackTaken;
            this.startAction('SHIELD_CROUCH', 0.46);
            this.defenseCooldown = 0.52;
          } else if (canDodge) {
            const dodgeMult = this.characterDef.affinity.unarmed === 'good' ? 0.5 : 1;
            if (Math.random() < dodgeMult) {
              this.vx = -dirToOpp * 345 * this.scale * this.getEffectiveMoveSpeed();
              this.vy = -215 * this.scale;
              this.startAction('DODGE_BACK', 0.36);
              this.spawnDust(particles, 4);
              sfx.playDodge();
              this.defenseCooldown = 0.52;
            }
          }
        }
      }

      this.updateAI(dt, opponent, absDist, dirToOpp, minX, maxX, particles, looseShieldX, arenaTraps);
    } else if (
      !fightingActive &&
      this.action !== 'IDLE_WAIT' &&
      this.action !== 'ENTRANCE_JUMP' &&
      this.action !== 'TAUNT' &&
      this.action !== 'KO' &&
      this.action !== 'VICTORY'
    ) {
      // Waiting / settled on paper before fight starts
      if (this.y >= floorY - 1) {
        this.vx *= Math.pow(0.001, dt);
      }
    }

    // 3. Action progression & combo chaining
    this.progressAction(dt, dirToOpp, absDist, opponent, minX, maxX, floorY, particles);

    // 4. Gravity & horizontal motion
    if (
      this.action === 'ENTRANCE_JUMP' ||
      this.action === 'ROLL_DODGE' ||
      this.action === 'TAKEOFF_FLIGHT' ||
      this.action === 'TAKEOFF_LAND_STUCK'
    ) {
      // Guided trajectory / hover / dive handled in progressAction
    } else if (this.action === 'PINNED') {
      this.vx = 0;
      this.vy = 0;
      this.y = floorY;
    } else {
      const gravity = 1280 * this.scale;
      const onGround = this.y >= floorY - 0.5 && this.vy >= 0;

      if (!onGround) {
        this.vy += gravity * dt;
      }

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      if (this.bodySpinRate !== 0) {
        this.bodySpin += this.bodySpinRate * dt;
      }
    }

    // Ground collision & bounce
    if (
      this.action !== 'ENTRANCE_JUMP' &&
      this.action !== 'ROLL_DODGE' &&
      this.action !== 'TAKEOFF_FLIGHT' &&
      this.action !== 'TAKEOFF_LAND_STUCK' &&
      this.y >= floorY
    ) {
      const impactVy = this.vy;
      this.y = floorY;
      if (this.action === 'KNOCKDOWN' && impactVy > 180) {
        this.vy = -impactVy * 0.34;
        this.bodySpinRate *= 0.45;
        this.spawnDust(particles, 5);
        sfx.playDrop();
      } else {
        if (impactVy > 220) {
          this.spawnDust(particles, 4);
        }
        this.vy = 0;
        if (this.action !== 'HAMMER_2' && this.action !== 'SWORD_3' && this.homeRunTimer <= 0.15) {
          this.bodySpin = 0;
          this.bodySpinRate = 0;
        }
      }

      // Ground friction
      if (
        this.action === 'HURT' ||
        this.action === 'KNOCKDOWN' ||
        this.action === 'KO' ||
        this.action === 'IDLE_WAIT' ||
        this.action === 'VICTORY' ||
        this.action === 'BLOCK' ||
        this.action === 'SHIELD_CROUCH' ||
        this.action === 'NOTICE' ||
        this.action === 'PINNED'
      ) {
        this.vx *= Math.pow(0.004, dt);
      } else if (this.action === 'SLIP') {
        this.vx *= Math.pow(0.08, dt);
      } else if (this.action === 'STANCE') {
        this.vx *= Math.pow(0.05, dt);
      }
    }

    // Arena boundary clamp & Home-Run red-margin / paper-edge bounce!
    if (this.x < minX) {
      this.x = minX;
      if (this.vx < 0) {
        if (this.homeRunTimer > 0 && Math.abs(this.vx) > 95 * this.scale) {
          this.vx = -this.vx * 0.68;
          this.vy = -210 * this.scale;
          this.bodySpinRate = -this.bodySpinRate * 0.85;
          this.homeRunTimer = 0.22;
          this.pendingWallBounce = { x: minX, y: this.joints.shoulder.y };
        } else {
          this.vx = -this.vx * 0.35;
        }
      }
    } else if (this.x > maxX) {
      this.x = maxX;
      if (this.vx > 0) {
        if (this.homeRunTimer > 0 && Math.abs(this.vx) > 95 * this.scale) {
          this.vx = -this.vx * 0.68;
          this.vy = -210 * this.scale;
          this.bodySpinRate = -this.bodySpinRate * 0.85;
          this.homeRunTimer = 0.22;
          this.pendingWallBounce = { x: maxX, y: this.joints.shoulder.y };
        } else {
          this.vx = -this.vx * 0.35;
        }
      }
    }

    // Heavy footstep thud shake (for heavy characters like Bự Con)
    if (
      this.characterDef.visual.stepShake > 0 &&
      this.y >= floorY - 1 &&
      ((this.action === 'STANCE' && Math.abs(this.vx) > 25 * this.scale) || this.action === 'DASH')
    ) {
      const stride = Math.sin(timeNow * 10 + this.seedBase);
      const sign = stride >= 0 ? 1 : -1;
      if (this.lastStrideSign !== 0 && sign !== this.lastStrideSign) {
        this.pendingFootstepShake = Math.max(
          this.pendingFootstepShake,
          this.characterDef.visual.stepShake,
        );
        this.spawnDust(particles, 2);
        if (this.characterId === 'lonsat') {
          sfx.playGearCreak();
        }
      }
      this.lastStrideSign = sign;
    } else {
      this.lastStrideSign = 0;
    }

    // Playful clown shoe "chút chít" squeak callout when Hề Bóng Bay walks briskly
    if (
      this.characterId === 'hebongbay' &&
      this.y >= floorY - 1 &&
      ((this.action === 'STANCE' && Math.abs(this.vx) > 55 * this.scale) || this.action === 'DASH')
    ) {
      this.clownWalkTimer -= dt;
      if (this.clownWalkTimer <= 0) {
        this.clownWalkTimer = 0.42;
        sfx.playClownSqueak(0.95 + Math.random() * 0.25);
        if (Math.random() < 0.35) {
          this.pendingSqueakCallout = true;
        }
      }
    } else {
      this.clownWalkTimer = Math.min(this.clownWalkTimer, 0.12);
    }

    // Light rapid heel "tạch" marks when Nhóc sprints on paper
    if (
      this.characterId === 'nhoc' &&
      this.y >= floorY - 1 &&
      ((this.action === 'STANCE' && Math.abs(this.vx) > 90 * this.scale) || this.action === 'DASH')
    ) {
      const stride = Math.sin(timeNow * 22 + this.seedBase);
      const sign = stride >= 0 ? 1 : -1;
      if (this.lastHeelStrideSign !== 0 && sign !== this.lastHeelStrideSign && particles.length < 48) {
        const moveDir = this.vx >= 0 ? 1 : -1;
        const hx = this.x - moveDir * 7 * this.scale;
        for (let k = 0; k < 2; k++) {
          const ang = -Math.PI * (0.65 + k * 0.18) * moveDir;
          particles.push({
            x: hx + (k - 0.5) * 4 * this.scale,
            y: floorY - 2 * this.scale,
            vx: -moveDir * (28 + k * 14),
            vy: -18 - k * 10,
            life: 0.16,
            maxLife: 0.16,
            size: 4.5 * this.scale,
            color: '#334155',
            kind: 'line',
            angle: ang,
            spin: 0,
            seed: Math.random() * 100,
          });
        }
      }
      this.lastHeelStrideSign = sign;
    } else {
      this.lastHeelStrideSign = 0;
    }

    // Gentle body push-apart so stickmen don't sit on top of each other endlessly
    const minSep = 17 * this.hitboxScale + 17 * opponent.hitboxScale;
    if (
      fightingActive &&
      this.hp > 0 &&
      opponent.hp > 0 &&
      !opponent.isDragged &&
      !this.isAirborne() &&
      !opponent.isAirborne() &&
      absDist < minSep &&
      Math.abs(this.y - opponent.y) < 55 * Math.max(this.hitboxScale, opponent.hitboxScale)
    ) {
      const push = (minSep - absDist) * 0.5;
      const sign = this.x <= opponent.x ? -1 : 1;
      this.x = clamp(this.x + sign * push * 0.5, minX, maxX);
    }

    // 5. Update pose smoothly (or stepped coarseMotion for mechanical fighters like Lon Sắt)
    const targetPose = this.buildActionPose(timeNow);
    if (this.characterDef.coarseMotion) {
      const stepInterval = 1 / Math.max(1, this.characterDef.jitterFps || 5);
      this.coarsePoseTimer += dt;
      if (this.coarsePoseTimer >= stepInterval || this.action === 'HURT' || this.actionTime <= dt * 1.5) {
        this.coarsePoseTimer = 0;
        const stepAlpha = this.isAttacking() || this.action === 'HURT' ? 0.85 : 0.72;
        this.pose = lerpPose(this.pose, targetPose, stepAlpha);
      }
    } else {
      const blendSpeed =
        this.isAttacking() || this.action === 'HURT' || this.action === 'KNOCKDOWN'
          ? this.characterId === 'nhoc'
            ? 30
            : 22
          : 13;
      this.pose = lerpPose(this.pose, targetPose, clamp(dt * blendSpeed, 0, 1));
    }

    // 6. Compute skeleton joints
    this.joints = this.computeJoints(this.y);
    this.updateScarf(dt);

    // 7. Motion trails during active attack frames
    const spec = this.getAttackSpecs();
    if (spec && this.actionTime >= spec.activeStart * 0.7 && this.actionTime <= spec.activeEnd) {
      const tip = this.getStrikeTip(spec);
      if (this.prevTip) {
        const moved = Math.hypot(tip.x - this.prevTip.x, tip.y - this.prevTip.y);
        if (moved > 4) {
          trails.push({
            x1: this.prevTip.x,
            y1: this.prevTip.y,
            x2: tip.x,
            y2: tip.y,
            color: spec.useWeapon ? '#475569' : this.accentColor,
            life: 0.14,
            maxLife: 0.14,
          });
        }
      }
      this.prevTip = { x: tip.x, y: tip.y };
    } else {
      this.prevTip = null;
    }
  }

  private updateAI(
    dt: number,
    opponent: StickFighter,
    absDist: number,
    dirToOpp: 1 | -1,
    minX: number,
    maxX: number,
    particles: Particle[],
    looseShieldX: number | null,
    arenaTraps: ArenaTrapSnapshot[] = [],
  ) {
    if (opponent.hp <= 0) {
      if (this.action === 'STANCE' || this.action === 'DASH' || this.action === 'BACKSTEP') {
        this.startAction('VICTORY', 0);
      }
      return;
    }

    // Can only decide new moves from STANCE (and never cancel VENT_WARN / TAKEOFF phases!)
    if (
      this.action === 'VENT_WARN' ||
      this.action === 'TAKEOFF_WARN' ||
      this.action === 'TAKEOFF_FLIGHT' ||
      this.action === 'TAKEOFF_LAND_STUCK' ||
      this.action !== 'STANCE'
    ) {
      return;
    }

    // If opponent is airborne ("trên không"), melee can't reach; throw shield if holding one, otherwise weave below
    if (opponent.isAirborne()) {
      this.facing = dirToOpp;
      this.aiCooldown -= dt;
      if (this.hasShield && this.aiCooldown <= 0 && absDist < 420 * this.scale) {
        this.vx = dirToOpp * 40 * this.scale;
        this.startAction('SHIELD_THROW', this.getActionDuration('SHIELD_THROW'));
        this.aiCooldown = 0.45;
      } else {
        const paceX = Math.sin(this.actionTime * 2.4 + this.seedBase) * 145 * this.scale * this.getEffectiveMoveSpeed();
        this.vx = lerp(this.vx, paceX, clamp(dt * 6, 0, 1));
      }
      return;
    }

    this.facing = dirToOpp;
    const slowMult = this.slowTimer > 0 ? 0.62 : 1;
    const spdMult = this.getEffectiveMoveSpeed() * slowMult;
    const steady = this.characterDef.ai.style === 'steadyAdvance';
    const hitAndRun = this.characterDef.ai.style === 'hitAndRun';
    const zoner = this.characterDef.ai.style === 'zoner';
    const boilerAI = this.characterDef.ai.style === 'boiler';
    const pranksterAI = this.characterDef.ai.style === 'prankster';
    this.aiCooldown -= dt * (this.slowTimer > 0 ? 0.72 : 1);

    const wDef = this.weapon ? WEAPONS[this.weapon] : null;
    const reachBonus = wDef ? wDef.extraReach * 0.65 * this.scale : 0;
    const cdMult = wDef ? wDef.cooldownMult : 1;

    const idealRange = 54 * this.scale + reachBonus;
    const kickRange = 68 * this.scale + reachBonus * 0.85;

    // Move toward unclaimed shield if nearby and shieldless, otherwise engage opponent
    if (!this.hasShield && looseShieldX !== null && Math.abs(looseShieldX - this.x) < 210 * this.scale) {
      const shieldDir = looseShieldX >= this.x ? 1 : -1;
      this.vx = lerp(this.vx, shieldDir * 225 * this.scale * spdMult, clamp(dt * 9, 0, 1));
    } else if (pranksterAI) {
      const R = this.getWeaponReach();
      const oppSlipped = opponent.action === 'SLIP' || opponent.action === 'KNOCKDOWN' || opponent.action === 'PINNED';
      const ownTrapBetween = arenaTraps.find(
        (tr) =>
          tr.ownerSide === this.side &&
          ((this.x < tr.x && opponent.x > tr.x) || (this.x > tr.x && opponent.x < tr.x)),
      );
      const ownPeelNear = arenaTraps.find(
        (tr) => tr.type === 'bananaPeel' && tr.ownerSide === this.side && Math.abs(this.x - tr.x) < tr.radius + 24 * this.scale,
      );
      const prefRatio =
        typeof this.characterDef.ai.preferredRange === 'number'
          ? this.characterDef.ai.preferredRange
          : 1.2;
      const prefDist = Math.max(92 * this.scale, prefRatio * R);

      let desiredVx = 0;
      if (oppSlipped) {
        // Capitalize when enemy actually slips/falls!
        desiredVx = absDist > R * 0.82 ? dirToOpp * 235 * this.scale * spdMult : 0;
      } else if (this.characterDef.ai.retreatBehindProp && ownTrapBetween && absDist < R * 1.85) {
        // Tease behind own active peel/jackBox so opponent walks onto it
        const safeAnchorX = ownTrapBetween.x - dirToOpp * (ownTrapBetween.radius + 42 * this.scale);
        desiredVx = clamp((safeAnchorX - this.x) * 4.2, -165 * this.scale * spdMult, 165 * this.scale * spdMult);
      } else if (absDist > prefDist + 24 * this.scale) {
        // Casual playful approach rather than relentless rushdown
        desiredVx = dirToOpp * 150 * this.scale * spdMult;
      } else if (absDist < prefDist * 0.72) {
        // Hop/step back out of point-blank range when not actively punishing
        desiredVx = -dirToOpp * 155 * this.scale * spdMult;
      } else {
        desiredVx = Math.sin(this.actionTime * 5.2 + this.seedBase) * 76 * this.scale * spdMult;
      }

      // Avoid stepping onto own banana peel if trying to move across it
      if (this.characterDef.ai.avoidOwnPeel && ownPeelNear && !oppSlipped) {
        const towardPeel = (ownPeelNear.x - this.x) * desiredVx > 0;
        if (towardPeel) {
          desiredVx = -Math.sign(ownPeelNear.x - this.x || dirToOpp) * 140 * this.scale * spdMult;
        }
      }
      this.vx = lerp(this.vx, desiredVx, clamp(dt * 8, 0, 1));
    } else if (boilerAI) {
      const R = this.getWeaponReach();
      const prefDist = 0.6 * R;
      if (this.hasTempStatus('overheat')) {
        // Cautious defensive crawl back while overheated
        if (absDist < 1.3 * R) {
          this.vx = lerp(this.vx, -dirToOpp * 125 * this.scale * spdMult, clamp(dt * 7, 0, 1));
        } else {
          this.vx = lerp(this.vx, 0, clamp(dt * 8, 0, 1));
        }
      } else if (this.heat >= 75 && absDist <= 1.5 * R) {
        // High heat pressure: holds center & leans in so vent blast catches opponent!
        this.vx = lerp(this.vx, dirToOpp * 48 * this.scale * spdMult, clamp(dt * 7, 0, 1));
      } else if (absDist > prefDist + 10 * this.scale) {
        this.vx = lerp(this.vx, dirToOpp * 168 * this.scale * spdMult, clamp(dt * 7, 0, 1));
      } else if (absDist < prefDist * 0.6) {
        this.vx = lerp(this.vx, 0, clamp(dt * 7, 0, 1));
      } else {
        this.vx = lerp(this.vx, dirToOpp * 45 * this.scale * spdMult, clamp(dt * 6, 0, 1));
      }
    } else if (zoner) {
      // Zoner ("GIỮ THƯỚC"): calmly keeps ~0.90 R, never walks into < 0.70 R voluntarily
      const R = this.getWeaponReach();
      const oppVulnerable =
        opponent.action === 'PINNED' ||
        opponent.action === 'HURT' ||
        opponent.action === 'KNOCKDOWN' ||
        opponent.action === 'GETUP' ||
        opponent.isInRecoveryPhase();
      const targetRange = oppVulnerable ? 0.88 * R : 0.90 * R;
      const retreatLimit = 0.72 * R;
      const backSpace = dirToOpp === 1 ? this.x - minX : maxX - this.x;
      const cornered = backSpace < (maxX - minX) * (this.characterDef.ai.cornerThreshold ?? 0.1);

      if (absDist > targetRange + 10 * this.scale) {
        this.vx = lerp(this.vx, dirToOpp * 138 * this.scale * spdMult, clamp(dt * 8, 0, 1));
      } else if (absDist < retreatLimit && !cornered) {
        this.vx = lerp(this.vx, -dirToOpp * 128 * this.scale * spdMult, clamp(dt * 9, 0, 1));
      } else {
        // Subtle tall-pole sway in the sweet spot
        const sway = Math.sin(this.actionTime * 3.1 + this.seedBase) * 26 * this.scale * spdMult;
        this.vx = lerp(this.vx, sway, clamp(dt * 6, 0, 1));
      }
    } else if (hitAndRun) {
      // Hit-and-Run spacing ("Nhảy nhót quấy rối"): bait closer when rollDodge is ready, stay mid-far when on cooldown
      const oppVulnerable =
        opponent.action === 'PINNED' ||
        opponent.action === 'HURT' ||
        opponent.action === 'KNOCKDOWN' ||
        opponent.action === 'GETUP' ||
        opponent.isInRecoveryPhase();
      const targetMin = oppVulnerable ? 44 * this.scale : this.rollCooldown <= 0 ? 92 * this.scale + reachBonus : 148 * this.scale + reachBonus;
      const targetMax = oppVulnerable ? 78 * this.scale : this.rollCooldown <= 0 ? 132 * this.scale + reachBonus : 206 * this.scale + reachBonus;

      if (absDist > targetMax) {
        this.vx = lerp(this.vx, dirToOpp * 225 * this.scale * spdMult, clamp(dt * 10, 0, 1));
      } else if (absDist < targetMin) {
        this.vx = lerp(this.vx, -dirToOpp * 185 * this.scale * spdMult, clamp(dt * 10, 0, 1));
      } else {
        // Nervous agile circling / bouncing in place
        const jitterMove = Math.sin(this.actionTime * 7.8 + this.seedBase) * 95 * this.scale * spdMult;
        this.vx = lerp(this.vx, jitterMove, clamp(dt * 9, 0, 1));
      }
    } else if (steady) {
      // Steady advance: marches steadily toward enemy, never retreats or circles backward
      const marchSpeed = absDist > kickRange ? 185 : 115;
      this.vx = lerp(this.vx, dirToOpp * marchSpeed * this.scale * spdMult, clamp(dt * 7, 0, 1));
    } else if (absDist > kickRange + 18 * this.scale) {
      this.vx = lerp(this.vx, dirToOpp * 185 * this.scale * spdMult, clamp(dt * 8, 0, 1));
    } else if (absDist < 36 * this.scale + reachBonus * 0.3) {
      this.vx = lerp(this.vx, -dirToOpp * 95 * this.scale * spdMult, clamp(dt * 7, 0, 1));
    } else {
      this.vx = lerp(
        this.vx,
        Math.sin(this.actionTime * 4.5 + this.seedBase) * 55 * this.scale * spdMult,
        clamp(dt * 6, 0, 1),
      );
    }

    if (this.aiCooldown > 0) return;

    // Prankster AI ("CHƠI XỎ") for Hề Bóng Bay
    if (pranksterAI) {
      const R = this.getWeaponReach();
      const oppSlipped = opponent.action === 'SLIP' || opponent.action === 'KNOCKDOWN' || opponent.action === 'PINNED';
      const oppVulnerable =
        oppSlipped ||
        opponent.action === 'HURT' ||
        opponent.action === 'GETUP' ||
        opponent.isInRecoveryPhase();
      const aggression = this.characterDef.ai.aggression ?? 0.42;
      const ownTrapBetween = arenaTraps.some(
        (tr) =>
          tr.ownerSide === this.side &&
          ((this.x < tr.x && opponent.x > tr.x) || (this.x > tr.x && opponent.x < tr.x)),
      );
      const oppHeavyWindup =
        opponent.isAttacking() &&
        !opponent.hasHitThisAction &&
        ['SUPER_PUNCH', 'HAMMER_3', 'BAT_3', 'SWORD_3', 'SWORD_LUNGE', 'SPEAR_3', 'ROUNDHOUSE', 'SWEEP_KICK'].includes(opponent.action);

      // 1. Bail out on enemy heavy windups (or close-range attacks when keeping distance)
      if (
        ((this.characterDef.ai.bailOutOnHeavyWindup && oppHeavyWindup) ||
          (opponent.isAttacking() && !opponent.hasHitThisAction && absDist < 88 * this.scale && Math.random() < 0.45)) &&
        !oppSlipped &&
        absDist < Math.max(115 * this.scale, R * 1.15) &&
        this.defenseCooldown <= 0
      ) {
        this.defenseCooldown = 0.52;
        if (this.hasShield && Math.random() < 0.65) {
          this.vx = -dirToOpp * 30 * this.scale;
          this.startAction('SHIELD_CROUCH', 0.45);
          this.aiCooldown = 0.24;
          return;
        }
        this.vx = -dirToOpp * 245 * this.scale * spdMult;
        this.vy = -125 * this.scale;
        this.startAction('BACKSTEP', 0.28);
        this.aiCooldown = 0.26;
        return;
      }

      // 2. Throw silver waiter tray when bruised
      if (
        this.hasShield &&
        this.damageTakenWithShield >= 32 &&
        absDist > 55 * this.scale &&
        absDist < 340 * this.scale &&
        Math.random() < 0.36
      ) {
        this.vx = dirToOpp * 75 * this.scale * spdMult;
        this.startAction('SHIELD_THROW', this.getActionDuration('SHIELD_THROW'));
        this.aiCooldown = 0.38;
        return;
      }

      // 3. Long gap: dash/jump-kick ONLY to punish slipped victim or occasionally ambush when no trap is waiting
      if (absDist > Math.max(150 * this.scale, R * 1.45)) {
        if (oppSlipped) {
          this.vx = dirToOpp * 340 * this.scale * spdMult;
          this.startAction('DASH', 0.24);
          this.spawnDust(particles, 4);
          sfx.playWhoosh();
          this.aiCooldown = 0.08;
        } else if (!ownTrapBetween && Math.random() < 0.28) {
          if (Math.random() < 0.6) {
            this.vx = dirToOpp * 300 * this.scale * spdMult;
            this.startAction('DASH', 0.22);
            this.spawnDust(particles, 3);
            sfx.playWhoosh();
            this.aiCooldown = 0.28;
          } else {
            this.vx = dirToOpp * 290 * this.scale * spdMult;
            this.vy = -295 * this.scale;
            this.startAction('JUMP_KICK', this.getActionDuration('JUMP_KICK'));
            this.spawnDust(particles, 3);
            this.aiCooldown = 0.45;
          }
        } else {
          // Wait & tease from range instead of blindly rushing in
          this.aiCooldown = ownTrapBetween ? 0.4 : 0.3;
        }
        return;
      }

      // 4. Mid-range baiting: wait behind traps / dance in and out instead of nonstop gap-closing
      if (absDist > Math.max(kickRange + 16 * this.scale, R * 1.08)) {
        const shouldClose = oppSlipped || oppVulnerable || (!ownTrapBetween && Math.random() < aggression);
        if (!shouldClose) {
          this.aiCooldown = ownTrapBetween ? 0.38 : 0.26;
          return;
        }
        if (this.weapon === 'sword') {
          this.vx = dirToOpp * 175 * this.scale * spdMult;
          this.comboQueue = ['SWORD_LUNGE'];
          this.shouldRetreatAfterCombo = !oppSlipped && Math.random() < 0.72;
          this.startAction('SWORD_2', this.getActionDuration('SWORD_2'));
          this.aiCooldown = 0.42 * cdMult;
        } else if (!this.weapon && Math.random() < 0.4) {
          this.vx = dirToOpp * 335 * this.scale * spdMult;
          this.comboQueue = ['ROUNDHOUSE'];
          this.shouldRetreatAfterCombo = !oppSlipped && Math.random() < 0.78;
          this.startAction('SLIDE', this.getActionDuration('SLIDE'));
          this.spawnDust(particles, 3);
          this.aiCooldown = 0.36;
        } else {
          this.vx = dirToOpp * 185 * this.scale * spdMult;
          this.aiCooldown = 0.22;
        }
        return;
      }

      // 5. Strike decision: prankster doesn't mash nonstop at close range; backs off or feints between tricks!
      const shouldAttack = oppSlipped || oppVulnerable || Math.random() < aggression + 0.14;
      if (!shouldAttack) {
        if (absDist < 0.9 * R && this.defenseCooldown <= 0 && Math.random() < 0.65) {
          this.defenseCooldown = 0.45;
          this.vx = -dirToOpp * 225 * this.scale * spdMult;
          this.vy = -115 * this.scale;
          this.startAction('BACKSTEP', 0.26);
          this.aiCooldown = 0.32;
        } else {
          this.aiCooldown = 0.28;
        }
        return;
      }

      // Execute trick combos that still reach finishers for Gag Bag, then hop back to bait into props!
      const r = Math.random();
      const punishPace = oppSlipped ? 0.62 : 1;
      this.shouldRetreatAfterCombo = !oppSlipped && Math.random() < 0.78;
      if (this.weapon === 'sword') {
        const fin: FighterAction = absDist < 84 * this.scale ? 'SWORD_3' : 'SWORD_LUNGE';
        this.vx = dirToOpp * 115 * this.scale * spdMult;
        this.comboQueue = r < 0.55 ? ['SWORD_2', fin] : [fin];
        this.startAction('SWORD_1', this.getActionDuration('SWORD_1'));
        this.aiCooldown = 0.44 * cdMult * punishPace;
      } else if (this.weapon === 'bat') {
        this.vx = dirToOpp * 118 * this.scale * spdMult;
        if (oppSlipped || r < 0.48) {
          this.comboQueue = ['BAT_3'];
          this.startAction('BAT_2', this.getActionDuration('BAT_2'));
        } else {
          this.comboQueue = ['BAT_2', 'BAT_3'];
          this.startAction('BAT_1', this.getActionDuration('BAT_1'));
        }
        this.aiCooldown = 0.42 * cdMult * punishPace;
      } else if (this.weapon === 'spear') {
        if (absDist < 48 * this.scale) {
          this.vx = -dirToOpp * 75 * this.scale;
          this.comboQueue = ['SPEAR_2', 'SPEAR_3'];
          this.startAction('SPEAR_BUTT', this.getActionDuration('SPEAR_BUTT'));
        } else {
          this.vx = dirToOpp * 105 * this.scale * spdMult;
          this.comboQueue = r < 0.5 ? ['SPEAR_2', 'SPEAR_3'] : ['SPEAR_3'];
          this.startAction('SPEAR_1', this.getActionDuration('SPEAR_1'));
        }
        this.aiCooldown = 0.44 * cdMult * punishPace;
      } else if (this.weapon === 'hammer') {
        this.vx = dirToOpp * 105 * this.scale * spdMult;
        this.comboQueue = oppSlipped || r < 0.45 ? ['HAMMER_3'] : ['HAMMER_2', 'HAMMER_3'];
        this.startAction('HAMMER_1', this.getActionDuration('HAMMER_1'));
        this.aiCooldown = 0.48 * cdMult * punishPace;
      } else {
        // Unarmed Prankster: playful 2-hit trick pokes & occasional 3-hit finisher kick, never endless brawling
        this.vx = dirToOpp * 118 * this.scale * spdMult;
        if (r < 0.36) {
          this.comboQueue = ['ROUNDHOUSE'];
          this.startAction('JAB', this.getActionDuration('JAB'));
        } else if (r < 0.64) {
          this.comboQueue = ['SWEEP_KICK'];
          this.startAction('CROSS', this.getActionDuration('CROSS'));
        } else if (r < 0.86) {
          this.comboQueue = ['CROSS', 'ROUNDHOUSE'];
          this.startAction('JAB', this.getActionDuration('JAB'));
        } else {
          this.comboQueue = [];
          this.startAction('ROUNDHOUSE', this.getActionDuration('ROUNDHOUSE'));
        }
        this.aiCooldown = 0.44 * punishPace;
      }
      return;
    }

    // Boiler AI ("LÒ HƠI") for Lon Sắt
    if (boilerAI) {
      const R = this.getWeaponReach();
      const overheated = this.hasTempStatus('overheat');
      const hotOrFull = this.heat >= 75;
      const oppHeavyStrike =
        opponent.isAttacking() &&
        !opponent.hasHitThisAction &&
        ['SUPER_PUNCH', 'HAMMER_3', 'BAT_3', 'SWORD_3', 'SWORD_LUNGE', 'SPEAR_3', 'ROUNDHOUSE', 'SWEEP_KICK'].includes(opponent.action);

      // 1. Overheated: prioritize blocking / pot-lid crouching over attacking
      if (overheated) {
        if (opponent.isAttacking() && absDist < Math.max(108 * this.scale, R * 1.15) && this.defenseCooldown <= 0) {
          this.defenseCooldown = 0.42;
          if (this.hasShield) {
            this.vx = -dirToOpp * 25 * this.scale;
            this.startAction('SHIELD_CROUCH', 0.48);
          } else {
            this.startAction('BLOCK', 0.42);
          }
          this.aiCooldown = 0.22;
          return;
        }
        if (absDist > R * 0.95) {
          this.aiCooldown = 0.16;
          return;
        }
      }

      // 2. Heavy-strike response depends on Boiler Heat: dodge/guard when <= 40, tank/trade when >= 60!
      if (oppHeavyStrike && absDist < 120 * this.scale && this.defenseCooldown <= 0) {
        if (this.heat <= 40) {
          this.defenseCooldown = 0.55;
          if (this.hasShield && Math.random() < 0.72) {
            this.vx = 0;
            this.startAction('SHIELD_CROUCH', 0.46);
          } else {
            this.vx = -dirToOpp * 205 * this.scale * spdMult;
            this.vy = -105 * this.scale;
            this.startAction('BACKSTEP', 0.28);
          }
          this.aiCooldown = 0.22;
          return;
        }
      } else if (
        opponent.isAttacking() &&
        !opponent.hasHitThisAction &&
        absDist < 104 * this.scale &&
        this.defenseCooldown <= 0 &&
        this.heat < 60
      ) {
        this.defenseCooldown = 0.34;
        if (this.hasShield && Math.random() < 0.65) {
          this.vx = 0;
          this.startAction('SHIELD_CROUCH', 0.44);
          this.aiCooldown = 0.18;
          return;
        } else if (Math.random() < 0.32) {
          this.startAction('BLOCK', 0.34);
          this.aiCooldown = 0.18;
          return;
        }
      }

      // 3. Throw pot-lid shield when sufficiently bruised
      if (
        this.hasShield &&
        this.damageTakenWithShield >= 44 &&
        absDist > 60 * this.scale &&
        absDist < 340 * this.scale &&
        Math.random() < 0.34
      ) {
        this.vx = dirToOpp * 65 * this.scale * spdMult;
        this.startAction('SHIELD_THROW', this.getActionDuration('SHIELD_THROW'));
        this.aiCooldown = 0.32;
        return;
      }

      // 4. Close gap cleanly (dash only when far)
      if (absDist > Math.max(135 * this.scale, R * 1.35)) {
        if (!overheated && Math.random() < 0.52) {
          this.vx = dirToOpp * 315 * this.scale * spdMult;
          this.startAction('DASH', 0.28);
          this.spawnDust(particles, 4);
          sfx.playWhoosh();
          this.aiCooldown = 0.18;
        } else {
          this.aiCooldown = 0.14;
        }
        return;
      }

      // 5. Within combat range (~0.6 R .. 1.15 R): execute heavy boiler strikes!
      if (absDist > Math.max(kickRange + 12 * this.scale, R * 1.05)) {
        if (this.weapon === 'sword') {
          this.vx = dirToOpp * 180 * this.scale * spdMult;
          this.comboQueue = ['SWORD_LUNGE'];
          this.startAction('SWORD_2', this.getActionDuration('SWORD_2'));
          this.aiCooldown = 0.32 * cdMult;
        } else if (this.weapon === 'spear') {
          this.vx = dirToOpp * 145 * this.scale * spdMult;
          this.comboQueue = hotOrFull ? ['SPEAR_2', 'SPEAR_3'] : ['SPEAR_2'];
          this.startAction('SPEAR_1', this.getActionDuration('SPEAR_1'));
          this.aiCooldown = 0.28 * cdMult;
        } else {
          this.vx = dirToOpp * 185 * this.scale * spdMult;
          this.aiCooldown = 0.14;
        }
        return;
      }

      const r = Math.random();
      if (this.weapon === 'sword') {
        const fin: FighterAction = absDist < 82 * this.scale ? 'SWORD_3' : 'SWORD_LUNGE';
        this.vx = dirToOpp * 120 * this.scale * spdMult;
        this.comboQueue = hotOrFull || r < 0.45 ? ['SWORD_2', fin] : r < 0.8 ? [fin] : ['SWORD_2'];
        this.startAction('SWORD_1', this.getActionDuration('SWORD_1'));
        this.aiCooldown = 0.32 * cdMult;
      } else if (this.weapon === 'bat') {
        this.vx = dirToOpp * 125 * this.scale * spdMult;
        this.comboQueue = hotOrFull || r < 0.6 ? ['BAT_2', 'BAT_3'] : ['BAT_3'];
        this.startAction('BAT_1', this.getActionDuration('BAT_1'));
        this.aiCooldown = 0.3 * cdMult;
      } else if (this.weapon === 'spear') {
        if (absDist < 48 * this.scale && r < 0.62) {
          this.vx = 0;
          this.comboQueue = ['SPEAR_3'];
          this.startAction('SPEAR_BUTT', this.getActionDuration('SPEAR_BUTT'));
        } else {
          this.vx = dirToOpp * 105 * this.scale * spdMult;
          this.comboQueue = hotOrFull || r < 0.6 ? ['SPEAR_2', 'SPEAR_3'] : ['SPEAR_2'];
          this.startAction('SPEAR_1', this.getActionDuration('SPEAR_1'));
        }
        this.aiCooldown = 0.28 * cdMult;
      } else if (this.weapon === 'hammer') {
        this.vx = dirToOpp * 115 * this.scale * spdMult;
        this.comboQueue = hotOrFull || r < 0.65 ? ['HAMMER_2', 'HAMMER_3'] : ['HAMMER_3'];
        this.startAction('HAMMER_1', this.getActionDuration('HAMMER_1'));
        this.aiCooldown = 0.34 * cdMult;
      } else {
        // Unarmed strong boiler: heavy piston punches & steam-finisher push!
        this.vx = dirToOpp * 130 * this.scale * spdMult;
        if (r < 0.38) {
          this.comboQueue = ['CROSS', 'UPPERCUT'];
          this.startAction('JAB', this.getActionDuration('JAB'));
          this.aiCooldown = 0.24;
        } else if (r < 0.72) {
          this.comboQueue = ['UPPERCUT', 'SUPER_PUNCH'];
          this.startAction('JAB', this.getActionDuration('JAB'));
          this.aiCooldown = 0.26;
        } else if (r < 0.88) {
          this.comboQueue = [];
          this.startAction('SUPER_PUNCH', this.getActionDuration('SUPER_PUNCH'));
          this.aiCooldown = 0.34;
        } else {
          this.comboQueue = [];
          this.startAction('ROUNDHOUSE', this.getActionDuration('ROUNDHOUSE'));
          this.aiCooldown = 0.28;
        }
      }
      return;
    }

    // Zoner AI decision tree ("GIỮ THƯỚC") for Cao Kều
    if (zoner) {
      const R = this.getWeaponReach();
      const [sweetMin, sweetMax] = this.getActiveSweetBand();
      const oppVulnerable =
        opponent.action === 'PINNED' ||
        opponent.action === 'HURT' ||
        opponent.action === 'KNOCKDOWN' ||
        opponent.action === 'GETUP' ||
        opponent.isInRecoveryPhase();
      const oppSpec = opponent.isAttacking() ? opponent.getAttackSpecs() : null;
      const oppLongRecovery = Boolean(
        oppSpec && opponent.actionTime > oppSpec.activeEnd && oppSpec.longRecovery,
      );
      const backSpace = dirToOpp === 1 ? this.x - minX : maxX - this.x;
      const arenaWidth = Math.max(200, maxX - minX);
      const cornered = backSpace < arenaWidth * (this.characterDef.ai.cornerThreshold ?? 0.1);

      // 1. Reactive guard if opponent swings close
      if (
        opponent.isAttacking() &&
        !opponent.hasHitThisAction &&
        absDist < Math.max(92 * this.scale, R * 0.92) &&
        this.defenseCooldown <= 0
      ) {
        this.defenseCooldown = 0.28;
        if (this.hasShield && Math.random() < 0.62) {
          this.vx = -dirToOpp * 35 * this.scale;
          this.startAction('SHIELD_CROUCH', 0.44);
          this.aiCooldown = 0.18;
          this.defenseCooldown = 0.5;
          return;
        }
        if (!cornered && Math.random() < 0.55) {
          this.vx = -dirToOpp * 205 * this.scale * spdMult;
          this.vy = -115 * this.scale;
          this.startAction('BACKSTEP', 0.28);
          this.aiCooldown = 0.24;
          this.defenseCooldown = 0.68;
          return;
        }
      }

      // 2. Shield throw when damaged
      if (
        this.hasShield &&
        this.damageTakenWithShield >= 36 &&
        absDist > 60 * this.scale &&
        absDist < 380 * this.scale &&
        Math.random() < 0.32
      ) {
        this.vx = dirToOpp * 65 * this.scale * spdMult;
        this.startAction('SHIELD_THROW', this.getActionDuration('SHIELD_THROW'));
        this.aiCooldown = 0.28;
        return;
      }

      // 3. Corner escape or close-range pushback when opponent gets < 0.72 R
      if (absDist < 0.72 * R && !oppLongRecovery) {
        if (cornered) {
          // Near corner (< 10% margin): either leap past toward center or push opponent off!
          if (Math.random() < 0.54) {
            this.vx = dirToOpp * 310 * this.scale * spdMult;
            this.vy = -305 * this.scale;
            this.startAction('JUMP_KICK', this.getActionDuration('JUMP_KICK'));
            this.spawnDust(particles, 4);
            this.aiCooldown = 0.32;
            return;
          }
          if (this.weapon === 'spear' && absDist < 0.5 * R) {
            this.comboQueue = ['SPEAR_2'];
            this.zonerComboBeats = 1;
            this.startAction('SPEAR_BUTT', this.getActionDuration('SPEAR_BUTT'));
            this.aiCooldown = 0.28 * cdMult;
            return;
          }
        } else if (this.defenseCooldown <= 0) {
          // Open room behind (gated by defenseCooldown so he can't spam infinite backsteps)
          this.vx = -dirToOpp * 195 * this.scale * spdMult;
          this.vy = -105 * this.scale;
          this.startAction('BACKSTEP', 0.28);
          this.aiCooldown = 0.28;
          this.defenseCooldown = 0.85;
          return;
        }
      }

      // 4. Outside max sweet spot: patient approach (never charges blindly into dead zone)
      if (absDist > (sweetMax + 0.08) * R) {
        if (oppVulnerable && absDist < 1.38 * R && this.weapon === 'sword') {
          this.vx = dirToOpp * 225 * this.scale * spdMult;
          this.comboQueue = [];
          this.zonerComboBeats = 1;
          this.startAction('SWORD_LUNGE', this.getActionDuration('SWORD_LUNGE'));
          this.aiCooldown = 0.28 * cdMult;
          return;
        }
        // Calm measured step toward sweet spot
        this.vx = dirToOpp * 138 * this.scale * spdMult;
        this.aiCooldown = 0.14;
        return;
      }

      // 5. Within firing band [~0.72 R, ~1.08 R] — probe calmly or strike cleanly on opening!
      const aggression = this.characterDef.ai.aggression ?? 0.45;
      const inSweet = absDist >= sweetMin * R && absDist <= sweetMax * R;
      const shouldFire = oppVulnerable || oppLongRecovery || Math.random() < (inSweet ? aggression + 0.2 : aggression);
      if (!shouldFire) {
        this.aiCooldown = 0.18;
        return;
      }

      this.zonerComboBeats = 1;
      const r = Math.random();
      if (this.weapon === 'spear') {
        if (absDist < 0.5 * R) {
          this.comboQueue = ['SPEAR_2'];
          this.startAction('SPEAR_BUTT', this.getActionDuration('SPEAR_BUTT'));
        } else {
          this.vx = dirToOpp * 55 * this.scale * spdMult;
          this.comboQueue = r < 0.5 ? ['SPEAR_2', 'SPEAR_3'] : r < 0.8 ? ['SPEAR_2'] : ['SPEAR_3'];
          this.startAction('SPEAR_1', this.getActionDuration('SPEAR_1'));
        }
        this.aiCooldown = 0.34 * cdMult;
      } else if (this.weapon === 'sword') {
        this.vx = dirToOpp * 105 * this.scale * spdMult;
        // Sword affinity 'good': ALWAYS finishes with SWORD_LUNGE, never SWORD_3 spin
        this.comboQueue = r < 0.45 ? ['SWORD_2', 'SWORD_LUNGE'] : ['SWORD_LUNGE'];
        this.startAction(r < 0.45 ? 'SWORD_1' : 'SWORD_2', this.getActionDuration(r < 0.45 ? 'SWORD_1' : 'SWORD_2'));
        this.aiCooldown = 0.3 * cdMult;
      } else if (this.weapon === 'bat') {
        this.vx = dirToOpp * 95 * this.scale * spdMult;
        this.comboQueue = r < 0.55 ? ['BAT_2', 'BAT_3'] : ['BAT_3'];
        this.startAction(r < 0.55 ? 'BAT_1' : 'BAT_2', this.getActionDuration(r < 0.55 ? 'BAT_1' : 'BAT_2'));
        this.aiCooldown = 0.28 * cdMult;
      } else if (this.weapon === 'hammer') {
        this.vx = dirToOpp * 90 * this.scale * spdMult;
        this.comboQueue = r < 0.5 ? ['HAMMER_2', 'HAMMER_3'] : ['HAMMER_3'];
        this.startAction('HAMMER_1', this.getActionDuration('HAMMER_1'));
        this.aiCooldown = 0.36 * cdMult;
      } else {
        // Unarmed zoner: long telescopic jabs, crosses, and long kicks at sweet spot
        this.vx = dirToOpp * 90 * this.scale * spdMult;
        if (r < 0.38) {
          this.comboQueue = ['CROSS', 'KICK'];
          this.startAction('JAB', this.getActionDuration('JAB'));
        } else if (r < 0.72) {
          this.comboQueue = ['ROUNDHOUSE'];
          this.startAction('CROSS', this.getActionDuration('CROSS'));
        } else {
          this.comboQueue = [];
          this.startAction('KICK', this.getActionDuration('KICK'));
        }
        this.aiCooldown = 0.24;
      }
      return;
    }

    // Hit-and-Run AI decision tree for Nhóc
    if (hitAndRun) {
      const oppVulnerable =
        opponent.action === 'PINNED' ||
        opponent.action === 'HURT' ||
        opponent.action === 'KNOCKDOWN' ||
        opponent.action === 'GETUP' ||
        opponent.isInRecoveryPhase();
      const aggression = this.characterDef.ai.aggression ?? 0.6;

      // Never trade head-on at point-blank while enemy is active and rollDodge is on cooldown
      if (
        absDist < 54 * this.scale &&
        !oppVulnerable &&
        this.rollCooldown > 0 &&
        Math.random() < 0.72
      ) {
        this.vx = -dirToOpp * 270 * this.scale * spdMult;
        this.vy = -145 * this.scale;
        this.startAction('BACKSTEP', 0.25);
        this.aiCooldown = 0.14;
        return;
      }

      // Reactive block/crouch only when rollDodge is on cooldown (since rollDodge handles active strikes when ready!)
      if (
        this.rollCooldown > 0 &&
        opponent.isAttacking() &&
        !opponent.hasHitThisAction &&
        absDist < 105 * this.scale &&
        this.defenseCooldown <= 0
      ) {
        this.defenseCooldown = 0.26;
        if (this.hasShield && Math.random() < 0.68) {
          this.vx = -dirToOpp * 50 * this.scale;
          this.startAction('SHIELD_CROUCH', 0.44);
          this.aiCooldown = 0.15;
          this.defenseCooldown = 0.48;
          return;
        } else if (Math.random() < 0.5) {
          this.vx = -dirToOpp * 275 * this.scale * spdMult;
          this.vy = -150 * this.scale;
          this.startAction('BACKSTEP', 0.25);
          this.aiCooldown = 0.15;
          this.defenseCooldown = 0.44;
          return;
        }
      }

      // Shield throw when damaged
      if (
        this.hasShield &&
        this.damageTakenWithShield >= 32 &&
        absDist > 55 * this.scale &&
        absDist < 340 * this.scale &&
        Math.random() < 0.35
      ) {
        this.vx = dirToOpp * 80 * this.scale * spdMult;
        this.startAction('SHIELD_THROW', this.getActionDuration('SHIELD_THROW'));
        this.aiCooldown = 0.26;
        return;
      }

      // Decide whether to dash in to punish / poke vs keep probing at mid-far range
      const shouldEngage = oppVulnerable || Math.random() < aggression;
      if (!shouldEngage) {
        // Probe hop ("THĂM DÒ") — stay nimble at distance
        const hopDir = absDist < 125 * this.scale ? -dirToOpp : Math.random() < 0.5 ? 1 : -1;
        this.vx = hopDir * 165 * this.scale * spdMult;
        this.aiCooldown = 0.16;
        return;
      }

      // Long/mid gap close for punish or quick poke
      if (absDist > kickRange + 14 * this.scale) {
        if (absDist < 165 * this.scale && !this.weapon && Math.random() < 0.52) {
          this.vx = dirToOpp * 400 * this.scale * spdMult;
          this.comboQueue = ['KICK'];
          this.shouldRetreatAfterCombo = true;
          this.startAction('SLIDE', this.getActionDuration('SLIDE'));
          this.spawnDust(particles, 3);
          this.aiCooldown = 0.18;
        } else {
          this.vx = dirToOpp * 390 * this.scale * spdMult;
          this.startAction('DASH', 0.22);
          this.spawnDust(particles, 3);
          sfx.playWhoosh();
          this.aiCooldown = 0.04;
        }
        return;
      }

      // Execute crisp 1-2 hit hit-and-run combo then disengage!
      this.shouldRetreatAfterCombo = !oppVulnerable || Math.random() < 0.72;
      const r = Math.random();
      if (this.weapon === 'sword') {
        const fin: FighterAction = absDist < 82 * this.scale ? 'SWORD_3' : 'SWORD_LUNGE';
        this.vx = dirToOpp * 140 * this.scale * spdMult;
        this.comboQueue = r < 0.3 ? [] : r < 0.65 ? ['SWORD_2'] : [fin];
        this.startAction('SWORD_1', this.getActionDuration('SWORD_1'));
        this.aiCooldown = 0.28 * cdMult;
      } else if (this.weapon === 'spear') {
        if (absDist < 48 * this.scale) {
          this.vx = -dirToOpp * 85 * this.scale;
          this.comboQueue = ['SPEAR_2'];
          this.startAction('SPEAR_BUTT', this.getActionDuration('SPEAR_BUTT'));
        } else {
          this.vx = dirToOpp * 130 * this.scale * spdMult;
          this.comboQueue = ['SPEAR_2'];
          this.startAction('SPEAR_1', this.getActionDuration('SPEAR_1'));
        }
        this.aiCooldown = 0.2 * cdMult;
      } else if (this.weapon === 'bat') {
        this.vx = dirToOpp * 145 * this.scale * spdMult;
        this.comboQueue = r < 0.5 ? ['BAT_2'] : ['BAT_3'];
        this.startAction('BAT_1', this.getActionDuration('BAT_1'));
        this.aiCooldown = 0.22 * cdMult;
      } else if (this.weapon === 'hammer') {
        this.vx = dirToOpp * 135 * this.scale * spdMult;
        this.comboQueue = r < 0.45 ? ['HAMMER_3'] : ['HAMMER_2'];
        this.startAction('HAMMER_1', this.getActionDuration('HAMMER_1'));
        this.aiCooldown = 0.3 * cdMult;
      } else {
        // Unarmed fast hits & kicks with crisp forward lunge
        this.vx = dirToOpp * 190 * this.scale * spdMult;
        if (r < 0.45) {
          this.comboQueue = ['KICK'];
          this.startAction('JAB', this.getActionDuration('JAB'));
        } else if (r < 0.8) {
          this.comboQueue = ['SWEEP_KICK'];
          this.startAction('CROSS', this.getActionDuration('CROSS'));
        } else {
          this.comboQueue = [];
          this.startAction('ROUNDHOUSE', this.getActionDuration('ROUNDHOUSE'));
        }
        this.aiCooldown = 0.2;
      }
      return;
    }

    // Reactive defense if opponent is mid-attack nearby
    if (
      opponent.isAttacking() &&
      !opponent.hasHitThisAction &&
      absDist < 104 * this.scale &&
      this.defenseCooldown <= 0
    ) {
      this.defenseCooldown = 0.24;
      const reactProb = steady ? (this.hasShield ? 0.55 : 0.22) : this.hasShield ? 0.62 : 0.48;
      if (Math.random() < reactProb) {
        if (this.hasShield && Math.random() < 0.78) {
          this.vx = steady ? 0 : -dirToOpp * 45 * this.scale;
          this.startAction('SHIELD_CROUCH', 0.45);
          this.aiCooldown = 0.16;
          this.defenseCooldown = 0.5;
        } else if (!steady && Math.random() < 0.58 * (this.characterDef.affinity.unarmed === 'good' ? 0.5 : 1)) {
          this.vx = -dirToOpp * 335 * this.scale * spdMult;
          this.vy = -205 * this.scale;
          this.startAction('DODGE_BACK', 0.35);
          this.spawnDust(particles, 4);
          sfx.playDodge();
          this.aiCooldown = 0.18;
          this.defenseCooldown = 0.5;
        } else {
          this.startAction('BLOCK', 0.34);
          this.aiCooldown = 0.18;
          this.defenseCooldown = 0.42;
        }
        return;
      }
    }

    // Shield Throw chance once fighter has lost enough HP while holding shield!
    const shieldThrowThresh = this.characterDef.affinity.shield === 'strong' ? 58 : 36;
    if (
      this.hasShield &&
      this.damageTakenWithShield >= shieldThrowThresh &&
      absDist > 52 * this.scale &&
      absDist < 360 * this.scale &&
      Math.random() < 0.36
    ) {
      this.vx = dirToOpp * 85 * this.scale * spdMult;
      this.startAction('SHIELD_THROW', this.getActionDuration('SHIELD_THROW'));
      this.aiCooldown = 0.32;
      return;
    }

    // Long range gap-closer: Dash, Slide, or Jump Kick
    if (absDist > 135 * this.scale + reachBonus) {
      const gapR = Math.random();
      if (gapR < 0.4 || steady) {
        this.vx = dirToOpp * 365 * this.scale * spdMult;
        this.startAction('DASH', 0.28);
        this.spawnDust(particles, 4);
        sfx.playWhoosh();
        this.aiCooldown = 0.14;
      } else if (gapR < 0.72) {
        this.vx = dirToOpp * 420 * this.scale * spdMult;
        this.comboQueue = ['KICK', 'ROUNDHOUSE'];
        this.startAction('SLIDE', this.getActionDuration('SLIDE'));
        this.spawnDust(particles, 5);
        sfx.playWhoosh();
        this.aiCooldown = 0.2;
      } else {
        this.vx = dirToOpp * 330 * this.scale * spdMult;
        this.vy = -340 * this.scale;
        this.startAction('JUMP_KICK', this.getActionDuration('JUMP_KICK'));
        this.spawnDust(particles, 4);
        this.aiCooldown = 0.3;
      }
      return;
    }

    const lowHp = this.hp < this.maxHp * 0.52;

    // Mid-long range (each weapon picks between 2 distance/HP-aware combo variants)
    if (absDist > kickRange) {
      const r = Math.random();
      if (this.weapon === 'spear' && r < 0.72) {
        this.vx = dirToOpp * 175 * this.scale * spdMult;
        if (steady || lowHp || r < 0.44) {
          this.comboQueue = ['SPEAR_2', 'SPEAR_3'];
          this.startAction('SPEAR_1', this.getActionDuration('SPEAR_1'));
        } else {
          this.comboQueue = ['SPEAR_1', 'SPEAR_3'];
          this.startAction('SPEAR_2', this.getActionDuration('SPEAR_2'));
        }
        this.aiCooldown = 0.22 * cdMult;
      } else if (this.weapon === 'sword' && r < 0.58) {
        this.vx = dirToOpp * 200 * this.scale * spdMult;
        this.comboQueue =
          r < 0.25 ? ['SWORD_2', 'SWORD_LUNGE'] : ['SWORD_LUNGE'];
        this.startAction(r < 0.25 ? 'SWORD_1' : 'SWORD_2', this.getActionDuration(r < 0.25 ? 'SWORD_1' : 'SWORD_2'));
        this.aiCooldown = 0.3 * cdMult;
      } else if (this.weapon === 'bat' && r < 0.58) {
        this.vx = dirToOpp * 220 * this.scale * spdMult;
        if (steady || lowHp || r < 0.35) {
          this.comboQueue = ['BAT_2', 'BAT_3'];
          this.startAction('BAT_1', this.getActionDuration('BAT_1'));
        } else {
          this.comboQueue = ['BAT_3'];
          this.startAction('BAT_2', this.getActionDuration('BAT_2'));
        }
        this.aiCooldown = 0.26 * cdMult;
      } else if (this.weapon === 'hammer' && r < 0.65) {
        this.vx = dirToOpp * 210 * this.scale * spdMult;
        if (!steady && (lowHp || r < 0.3)) {
          this.comboQueue = ['HAMMER_3'];
          this.startAction('HAMMER_2', this.getActionDuration('HAMMER_2'));
        } else {
          this.comboQueue = ['HAMMER_2', 'HAMMER_3'];
          this.startAction('HAMMER_1', this.getActionDuration('HAMMER_1'));
        }
        this.aiCooldown = 0.32 * cdMult;
      } else if (r < 0.4 && !steady) {
        this.vx = dirToOpp * 310 * this.scale * spdMult;
        this.vy = -320 * this.scale;
        this.startAction('JUMP_KICK', this.getActionDuration('JUMP_KICK'));
        this.spawnDust(particles, 3);
        this.aiCooldown = 0.3;
      } else if (r < 0.75 && !steady) {
        this.vx = dirToOpp * 390 * this.scale * spdMult;
        this.comboQueue = ['SWEEP_KICK'];
        this.startAction('SLIDE', this.getActionDuration('SLIDE'));
        this.spawnDust(particles, 4);
        this.aiCooldown = 0.18;
      } else {
        this.vx = dirToOpp * 150 * this.scale * spdMult;
        this.startAction('ROUNDHOUSE', this.getActionDuration('ROUNDHOUSE'));
        this.aiCooldown = 0.28;
      }
      return;
    }

    // Close / Strike range! Execute weapon-specific combos
    const r = Math.random();

    if (this.weapon === 'sword') {
      const finisher: FighterAction = absDist < 82 * this.scale ? 'SWORD_3' : 'SWORD_LUNGE';
      if (steady) {
        this.vx = dirToOpp * 125 * this.scale * spdMult;
        this.comboQueue = r < 0.55 ? ['SWORD_2', finisher] : [finisher];
        this.startAction('SWORD_1', this.getActionDuration('SWORD_1'));
        this.aiCooldown = 0.3 * cdMult;
      } else if (r < 0.34) {
        this.vx = dirToOpp * 120 * this.scale * spdMult;
        this.comboQueue = ['SWORD_2', finisher];
        this.startAction('SWORD_1', this.getActionDuration('SWORD_1'));
        this.aiCooldown = 0.32 * cdMult;
      } else if (r < 0.58) {
        this.vx = dirToOpp * 115 * this.scale * spdMult;
        this.comboQueue = ['SWORD_2'];
        this.startAction('SWORD_1', this.getActionDuration('SWORD_1'));
        this.aiCooldown = 0.28 * cdMult;
      } else if (r < 0.78) {
        this.vx = dirToOpp * 125 * this.scale * spdMult;
        this.comboQueue = [finisher];
        this.startAction('SWORD_2', this.getActionDuration('SWORD_2'));
        this.aiCooldown = 0.3 * cdMult;
      } else {
        this.vx = -dirToOpp * 240 * this.scale;
        this.vy = -135 * this.scale;
        this.startAction('BACKSTEP', 0.26);
        this.aiCooldown = 0.18;
      }
      return;
    }

    if (this.weapon === 'bat') {
      if (steady || r < 0.48) {
        this.vx = dirToOpp * 135 * this.scale * spdMult;
        this.comboQueue = ['BAT_2', 'BAT_3'];
        this.startAction('BAT_1', this.getActionDuration('BAT_1'));
        this.aiCooldown = 0.28 * cdMult;
      } else if (r < 0.8) {
        this.vx = dirToOpp * 140 * this.scale * spdMult;
        this.comboQueue = ['BAT_3'];
        this.startAction('BAT_2', this.getActionDuration('BAT_2'));
        this.aiCooldown = 0.28 * cdMult;
      } else {
        this.vx = -dirToOpp * 235 * this.scale;
        this.vy = -130 * this.scale;
        this.startAction('BACKSTEP', 0.26);
        this.aiCooldown = 0.16;
      }
      return;
    }

    if (this.weapon === 'spear') {
      if (absDist < 48 * this.scale && r < (steady ? 0.5 : 0.72)) {
        this.vx = steady ? 0 : -dirToOpp * 90 * this.scale;
        this.comboQueue = ['SPEAR_3'];
        this.startAction('SPEAR_BUTT', this.getActionDuration('SPEAR_BUTT'));
        this.aiCooldown = 0.26 * cdMult;
        return;
      }
      if (steady || r < 0.48) {
        this.vx = dirToOpp * 105 * this.scale * spdMult;
        this.comboQueue = ['SPEAR_2', 'SPEAR_3'];
        this.startAction('SPEAR_1', this.getActionDuration('SPEAR_1'));
        this.aiCooldown = 0.24 * cdMult;
      } else if (r < 0.78) {
        this.vx = dirToOpp * 115 * this.scale * spdMult;
        this.comboQueue = ['SPEAR_1', 'SPEAR_3'];
        this.startAction('SPEAR_2', this.getActionDuration('SPEAR_2'));
        this.aiCooldown = 0.25 * cdMult;
      } else {
        this.vx = -dirToOpp * 255 * this.scale;
        this.vy = -135 * this.scale;
        this.startAction('BACKSTEP', 0.26);
        this.aiCooldown = 0.16;
      }
      return;
    }

    if (this.weapon === 'hammer') {
      if (steady || r < 0.46) {
        this.vx = dirToOpp * 110 * this.scale * spdMult;
        this.comboQueue = ['HAMMER_2', 'HAMMER_3'];
        this.startAction('HAMMER_1', this.getActionDuration('HAMMER_1'));
        this.aiCooldown = 0.34 * cdMult;
      } else if (r < 0.72) {
        this.vx = dirToOpp * 135 * this.scale * spdMult;
        this.comboQueue = ['HAMMER_3'];
        this.startAction('HAMMER_2', this.getActionDuration('HAMMER_2'));
        this.aiCooldown = 0.34 * cdMult;
      } else if (r < 0.86) {
        this.vx = dirToOpp * 145 * this.scale * spdMult;
        this.startAction('CROSS', this.getActionDuration('CROSS'));
        this.aiCooldown = 0.36 * cdMult;
      } else {
        this.vx = -dirToOpp * 235 * this.scale;
        this.vy = -130 * this.scale;
        this.startAction('BACKSTEP', 0.26);
        this.aiCooldown = 0.16;
      }
      return;
    }

    // Unarmed Combos (steadyAdvance prioritizes full 3-hit combos & heavy finishers, never backsteps)
    if (steady) {
      if (r < 0.42) {
        this.vx = dirToOpp * 110 * this.scale * spdMult;
        this.comboQueue = ['CROSS', 'SWEEP_KICK'];
        this.startAction('JAB', this.getActionDuration('JAB'));
        this.aiCooldown = 0.22;
      } else if (r < 0.76) {
        this.vx = dirToOpp * 115 * this.scale * spdMult;
        this.comboQueue = ['UPPERCUT', 'SUPER_PUNCH'];
        this.startAction('JAB', this.getActionDuration('JAB'));
        this.aiCooldown = 0.24;
      } else {
        this.vx = dirToOpp * 95 * this.scale * spdMult;
        this.startAction('SUPER_PUNCH', this.getActionDuration('SUPER_PUNCH'));
        this.aiCooldown = 0.34;
      }
      return;
    }

    if (absDist <= idealRange && r < 0.28) {
      this.vx = dirToOpp * 105 * this.scale * spdMult;
      this.comboQueue = ['CROSS', 'SWEEP_KICK'];
      this.startAction('JAB', this.getActionDuration('JAB'));
      this.aiCooldown = 0.22;
    } else if (absDist <= idealRange && r < 0.5) {
      this.vx = dirToOpp * 115 * this.scale * spdMult;
      this.comboQueue = ['UPPERCUT', 'JUMP_KICK'];
      this.startAction('JAB', this.getActionDuration('JAB'));
      this.aiCooldown = 0.26;
    } else if (r < 0.66) {
      this.vx = dirToOpp * 140 * this.scale * spdMult;
      this.startAction('SWEEP_KICK', this.getActionDuration('SWEEP_KICK'));
      this.spawnDust(particles, 3);
      this.aiCooldown = 0.26;
    } else if (r < 0.8) {
      this.vx = dirToOpp * 60 * this.scale * spdMult;
      this.startAction('SUPER_PUNCH', this.getActionDuration('SUPER_PUNCH'));
      this.aiCooldown = 0.36;
    } else if (r < 0.92) {
      this.vx = dirToOpp * 120 * this.scale * spdMult;
      this.startAction('ROUNDHOUSE', this.getActionDuration('ROUNDHOUSE'));
      this.aiCooldown = 0.28;
    } else {
      this.vx = -dirToOpp * 240 * this.scale;
      this.vy = -135 * this.scale;
      this.startAction('BACKSTEP', 0.26);
      this.aiCooldown = 0.16;
    }
  }

  private getActionDuration(act: FighterAction): number {
    switch (act) {
      case 'JAB':
        return this.scaleAttackTiming(
          act,
          this.weapon === 'sword' ? 0.07 : 0.08,
          this.weapon === 'sword' ? 0.19 : 0.21,
          this.weapon === 'sword' ? 0.27 : 0.25,
        ).duration;
      case 'CROSS':
        return this.scaleAttackTiming(
          act,
          this.weapon === 'hammer' ? 0.18 : 0.12,
          this.weapon === 'hammer' ? 0.32 : 0.28,
          this.weapon === 'hammer' ? 0.54 : 0.36,
        ).duration;
      case 'UPPERCUT':
        return this.scaleAttackTiming(act, 0.14, 0.31, 0.42).duration;
      case 'SUPER_PUNCH':
        return this.scaleAttackTiming(act, 0.22, 0.42, 0.52).duration;
      case 'KICK':
        return this.scaleAttackTiming(act, 0.11, 0.25, 0.33).duration;
      case 'SWEEP_KICK':
        return this.scaleAttackTiming(act, 0.13, 0.3, 0.38).duration;
      case 'ROUNDHOUSE':
        return this.scaleAttackTiming(act, 0.16, 0.34, 0.44).duration;
      case 'JUMP_KICK':
        return this.scaleAttackTiming(act, 0.16, 0.48, 0.54).duration;
      case 'SWORD_1':
        return this.scaleAttackTiming(act, 0.07, 0.19, 0.28).duration;
      case 'SWORD_2':
        return this.scaleAttackTiming(act, 0.07, 0.2, 0.3).duration;
      case 'SWORD_3':
        return this.scaleAttackTiming(act, 0.15, 0.31, 0.48).duration;
      case 'SWORD_4':
        return this.scaleAttackTiming(act, 0.05, 0.15, 0.24).duration;
      case 'SWORD_LUNGE':
        return this.scaleAttackTiming(act, 0.13, 0.28, 0.45).duration;
      case 'BAT_1':
        return this.scaleAttackTiming(act, 0.06, 0.19, 0.23).duration;
      case 'BAT_2':
        return this.scaleAttackTiming(act, 0.26, 0.39, 0.44).duration;
      case 'BAT_3':
        return this.scaleAttackTiming(act, 0.27, 0.45, 0.56).duration;
      case 'SPEAR_1':
        return this.scaleAttackTiming(act, 0.06, 0.18, 0.22).duration;
      case 'SPEAR_2':
        return this.scaleAttackTiming(act, 0.06, 0.16, 0.28).duration;
      case 'SPEAR_3':
        return this.scaleAttackTiming(act, 0.12, 0.31, 0.42).duration;
      case 'SPEAR_BUTT':
        return this.scaleAttackTiming(act, 0.06, 0.18, 0.24).duration;
      case 'HAMMER_1':
        return this.scaleAttackTiming(act, 0.12, 0.25, 0.34).duration;
      case 'HAMMER_2':
        return this.scaleAttackTiming(act, 0.15, 0.36, 0.46).duration;
      case 'HAMMER_3':
        return this.scaleAttackTiming(act, 0.33, 0.5, 0.86).duration;
      case 'SHIELD_THROW':
        return 0.38;
      case 'ROLL_DODGE':
        return this.characterDef.trait.invuln ?? 0.25;
      case 'SLIDE':
        return this.scaleAttackTiming(act, 0.08, 0.28, 0.32).duration;
      case 'PINNED':
        return this.characterDef.affinity.spear === 'weak' ? 1.4 : 0.95;
      case 'SLIP':
        return 0.8;
      default:
        return 0.3;
    }
  }

  private progressAction(
    dt: number,
    dirToOpp: 1 | -1,
    absDist: number,
    opponent: StickFighter,
    minX: number,
    maxX: number,
    floorY: number,
    particles: Particle[],
  ) {
    // Guided leap from selected card onto arena turf -> character-specific intimidation taunt
    if (this.action === 'ENTRANCE_JUMP') {
      const dur = Math.max(0.18, this.actionDuration);
      const p = clamp(this.actionTime / dur, 0, 1);
      const easeX = 1 - Math.pow(1 - p, 1.7);
      const baseY = lerp(this.entranceOriginY, this.entranceTargetY, p);
      const lift = Math.sin(p * Math.PI) * this.characterDef.entrance.jumpHeight * this.scale;

      this.x = clamp(lerp(this.entranceOriginX, this.entranceTargetX, easeX), minX, maxX);
      this.y = Math.min(this.entranceTargetY, baseY - lift);

      const spinDir = this.entranceTargetX >= this.entranceOriginX ? 1 : -1;
      this.bodySpin = p < 0.86 ? (p / 0.86) * Math.PI * 2 * spinDir : 0;

      if (p >= 1) {
        this.x = clamp(this.entranceTargetX, minX, maxX);
        this.y = this.entranceTargetY;
        this.vx = 0;
        this.vy = 0;
        this.bodySpin = 0;
        this.bodySpinRate = 0;
        this.facing = this.side === 'left' ? 1 : -1;
        this.pendingLandingImpact = true;
        this.pendingTauntEffect = true;
        this.spawnDust(particles, 7);
        sfx.playDrop();
        sfx.playTaunt(this.characterId);
        this.startAction('TAUNT', this.characterDef.entrance.tauntDuration);
      }
      return;
    }

    if (this.action === 'TAUNT') {
      if (this.actionTime >= this.actionDuration) {
        this.facing = this.side === 'left' ? 1 : -1;
        this.startAction('IDLE_WAIT', 0);
      }
      return;
    }

    if (this.action === 'SLIP') {
      if (Math.floor((this.actionTime - dt) * 6) !== Math.floor(this.actionTime * 6) && particles.length < 52) {
        const ang = this.actionTime * 7;
        particles.push({
          x: this.joints.head.x + Math.cos(ang) * 14 * this.scale,
          y: this.joints.head.y - 14 * this.scale + Math.sin(ang) * 4 * this.scale,
          vx: 0,
          vy: -12,
          life: 0.34,
          maxLife: 0.34,
          size: 4.5 * this.scale,
          color: '#F59E0B',
          kind: 'star',
          angle: ang,
          spin: 6,
          seed: Math.random() * 80,
        });
      }
      if (this.actionTime >= this.actionDuration) {
        if (this.hp <= 0) {
          this.startAction('KO', 0);
        } else {
          this.startAction('STANCE', 0);
        }
      }
      return;
    }

    // Lon Sắt Boiler Vent Warn (0.5s braced charge -> expanding radial steam blast)
    if (this.action === 'VENT_WARN') {
      this.vx *= Math.pow(0.002, dt);
      if (this.actionTime >= this.actionDuration) {
        if (this.hp > 0) {
          const trait = this.characterDef.trait;
          const bodyH = 105 * this.scale;
          const radius = Math.max(bodyH, this.getWeaponReach() * (trait.ventRadiusR ?? 1.0));
          this.pendingAreaBlast = {
            x: this.x,
            y: (this.joints.hip.y + this.joints.shoulder.y) * 0.5,
            radius,
            damage: trait.ventDamage ?? 12,
            knockbackMult: trait.ventKnockbackMul ?? 1.5,
            breaksCombo: true,
            exceptArmored: trait.ventExceptArmored ?? ['hammerBeat2'],
            dodgeable: false,
            color: '#F97316',
            label: 'PHỤT!',
            attackType: 'BOILER_VENT',
          };
          this.heat = 0;
          this.heatCoolDelayTimer = 0;
          this.addTempStatus({
            id: 'overheat',
            duration: trait.overheatDuration ?? 3.0,
            damageTakenMul: trait.overheatDamageTakenMul ?? 1.3,
            moveSpeedMul: trait.overheatMoveSpeedMul ?? 0.6,
            noHeatGain: true,
            label: 'QUÁ NHIỆT',
          });
          this.pendingOverheatCallout = true;
          sfx.playSteamVent();
        }
        this.startAction('STANCE', 0);
      }
      return;
    }

    // Lon Sắt Takeoff Phase 1: TAKEOFF_WARN (0.5s wings unfold, heavy steam, max gauge -> megaVent blast -> flight)
    if (this.action === 'TAKEOFF_WARN') {
      this.vx *= Math.pow(0.002, dt);
      this.y = floorY;
      this.takeoffWarnSteamTimer -= dt;
      if (this.takeoffWarnSteamTimer <= 0 && particles.length < 64) {
        this.takeoffWarnSteamTimer = 0.055;
        for (let si = 0; si < 3; si++) {
          const ang = -Math.PI * 0.9 + Math.random() * Math.PI * 0.8;
          const spd = 85 + Math.random() * 95;
          particles.push({
            x: this.x + (Math.random() - 0.5) * 20 * this.scale,
            y: lerp(this.joints.hip.y, this.joints.shoulder.y, Math.random()),
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - 20,
            life: 0.36,
            maxLife: 0.36,
            size: (5.5 + Math.random() * 3) * this.scale,
            color: si === 0 ? '#0D9488' : '#64748B',
            kind: 'steam',
            angle: 0,
            spin: (Math.random() - 0.5) * 3,
            seed: Math.random() * 100,
          });
        }
      }

      if (this.actionTime >= this.actionDuration) {
        const takeoffCfg = this.characterDef.trait.takeoff;
        if (this.hp > 0 && takeoffCfg) {
          const mega = takeoffCfg.megaVent;
          const R = this.getWeaponReach();
          this.pendingAreaBlast = {
            x: this.x,
            y: (this.joints.hip.y + this.joints.shoulder.y) * 0.5,
            radius: R * mega.radiusR,
            damage: mega.damage,
            knockbackMult: 1,
            knockbackDistanceR: mega.knockbackDistanceR,
            stunDuration: mega.stun,
            weaponReach: R,
            breaksCombo: mega.breaksCombo,
            exceptArmored: mega.exceptArmored,
            dodgeable: mega.dodgeable,
            color: '#0D9488',
            label: 'BÙMMM!',
            attackType: 'TAKEOFF_MEGA_VENT',
          };
          if (mega.resetHeatToZero) {
            this.heat = 0;
            this.heatCoolDelayTimer = 0;
            this.pendingVentAfterStun = false;
          }
          // Radiating steam streaks
          for (let ri = 0; ri < 10; ri++) {
            const ang = (Math.PI * 2 * ri) / 10;
            particles.push({
              x: this.x + Math.cos(ang) * 18 * this.scale,
              y: (this.joints.hip.y + this.joints.shoulder.y) * 0.5 + Math.sin(ang) * 18 * this.scale,
              vx: Math.cos(ang) * 230 * this.scale,
              vy: Math.sin(ang) * 230 * this.scale,
              life: 0.34,
              maxLife: 0.34,
              size: 13 * this.scale,
              color: ri % 2 === 0 ? '#0D9488' : '#64748B',
              kind: 'line',
              angle: ang,
              spin: 0,
              seed: Math.random() * 120,
            });
          }
          this.takeoffState = 'flight';
          this.rocketPodsOpen = true;
          this.wingHp = takeoffCfg.flight.wingHp;
          this.flightTimer = 0;
          this.flightVolleyIndex = 0;
          this.flightSmokeTimer = 0;
          this.vy = -260 * this.scale;
          sfx.playSteamVent();
          sfx.playMissileExplosion(true);
          this.startAction('TAKEOFF_FLIGHT', takeoffCfg.flight.duration);
        } else {
          this.startAction('STANCE', 0);
        }
      }
      return;
    }

    // Lon Sắt Takeoff Phase 2: TAKEOFF_FLIGHT (5s hover, 3 missile volleys, no heat gain, wingHp 20)
    if (this.action === 'TAKEOFF_FLIGHT') {
      const takeoffCfg = this.characterDef.trait.takeoff;
      if (!takeoffCfg || this.hp <= 0) {
        this.startAction('KNOCKDOWN', 0.9);
        return;
      }
      const flightCfg = takeoffCfg.flight;
      const R = this.getWeaponReach();
      this.heat = 0;
      this.flightTimer += dt;

      // Target hover height: ~2.5 body heights above floor (clamped safely under top HUD)
      const bodyH = 105 * this.scale;
      const hoverTargetY =
        Math.max(134 * this.scale, floorY - flightCfg.hoverHeightBody * bodyH) +
        Math.sin(this.flightTimer * 4.4) * 5 * this.scale;
      this.y = lerp(this.y, hoverTargetY, clamp(dt * 6.5, 0, 1));
      this.vy = 0;

      // Keep horizontal distance ~2.0 R from nearest enemy inside paper margins
      const pad = 42 * this.scale;
      const distPref = R * flightCfg.hoverDistanceR;
      const candLeft = opponent.x - distPref;
      const candRight = opponent.x + distPref;
      const leftFits = candLeft >= minX + pad && candLeft <= maxX - pad;
      const rightFits = candRight >= minX + pad && candRight <= maxX - pad;
      let desiredX: number;
      if (leftFits && rightFits) {
        desiredX = this.x <= opponent.x ? candLeft : candRight;
      } else if (leftFits) {
        desiredX = candLeft;
      } else if (rightFits) {
        desiredX = candRight;
      } else {
        const distToLeftBound = Math.abs(opponent.x - (minX + pad));
        const distToRightBound = Math.abs(maxX - pad - opponent.x);
        desiredX = distToRightBound >= distToLeftBound ? maxX - pad : minX + pad;
      }
      const desiredVx = clamp((desiredX - this.x) * 4.4, -310 * this.scale, 310 * this.scale);
      this.vx = lerp(this.vx, desiredVx, clamp(dt * 7, 0, 1));
      this.x = clamp(this.x + this.vx * dt, minX, maxX);
      this.facing = opponent.x >= this.x ? 1 : -1;

      // Dotted trajectory smoke trail
      this.flightSmokeTimer += dt;
      if (this.flightSmokeTimer >= 0.07) {
        this.flightSmokeTimer = 0;
        this.pendingFlightTrailDot = {
          x: (this.joints.hip.x + this.joints.shoulder.x) * 0.5 - this.facing * 6 * this.scale,
          y: (this.joints.hip.y + this.joints.shoulder.y) * 0.5 + 4 * this.scale,
        };
      }

      // Fire 3 small direct missiles (0.75s, 1.60s, 2.45s) + 1 big heavy missile at the end (3.55s)
      const rCfg = flightCfg.rockets;
      const totalShots = rCfg.smallCount + 1;
      if (this.flightVolleyIndex < totalShots) {
        const isBig = this.flightVolleyIndex >= rCfg.smallCount;
        const nextFireAt = isBig
          ? rCfg.bigAt
          : rCfg.smallStartAt + this.flightVolleyIndex * rCfg.smallInterval;
        if (this.flightTimer >= nextFireAt) {
          const podX = this.joints.hip.x - this.facing * 8 * this.scale;
          const podY = this.joints.hip.y - 6 * this.scale;
          this.pendingRocketVolley = {
            volleyIndex: this.flightVolleyIndex,
            isBig,
            originX: podX,
            originY: podY,
            damage: isBig ? rCfg.bigDamage : rCfg.smallDamage,
            blastRadiusR: isBig ? rCfg.bigBlastRadiusR : rCfg.smallBlastRadiusR,
            speed: isBig ? rCfg.bigSpeed : rCfg.smallSpeed,
            knockback: isBig ? rCfg.bigKnockback : rCfg.smallKnockback,
            ownerSide: this.side,
            weaponReach: R,
          };
          this.flightVolleyIndex += 1;
          sfx.playMissileLaunch();
          if (isBig) {
            sfx.playSteamVent();
            this.vx -= this.facing * 75 * this.scale;
          }
          const puffCount = isBig ? 9 : 5;
          for (let pi = 0; pi < puffCount; pi++) {
            particles.push({
              x: podX,
              y: podY,
              vx: -this.facing * (40 + Math.random() * (isBig ? 75 : 45)),
              vy: -30 - Math.random() * (isBig ? 70 : 45),
              life: isBig ? 0.44 : 0.34,
              maxLife: isBig ? 0.44 : 0.34,
              size: (isBig ? 7 : 5) * this.scale,
              color: isBig ? (pi % 2 === 0 ? '#DC2626' : '#F97316') : pi % 2 === 0 ? '#0D9488' : '#64748B',
              kind: 'steam',
              angle: 0,
              spin: 2,
              seed: Math.random() * 100,
            });
          }
        }
      }

      // Finish 5s flight -> dive down to safe empty spot
      if (this.flightTimer >= flightCfg.duration) {
        const edgePad = Math.max(54 * this.scale, (maxX - minX) * 0.1);
        const safeMin = minX + edgePad;
        const safeMax = Math.max(safeMin, maxX - edgePad);
        const minOppClear = 98 * this.scale;
        let landX = clamp(this.x, safeMin, safeMax);
        if (Math.abs(landX - opponent.x) < minOppClear) {
          const optL = clamp(opponent.x - 125 * this.scale, safeMin, safeMax);
          const optR = clamp(opponent.x + 125 * this.scale, safeMin, safeMax);
          landX = Math.abs(optL - opponent.x) >= Math.abs(optR - opponent.x) ? optL : optR;
        }
        this.landingTargetX = landX;
        this.takeoffDiveComplete = false;
        this.takeoffLandStuckTimer = takeoffCfg.landing.stuck;
        this.takeoffState = 'landing';
        this.startAction('TAKEOFF_LAND_STUCK', 2.4);
      }
      return;
    }

    // Lon Sắt Takeoff Phase 3: TAKEOFF_LAND_STUCK (dive -> impact quake -> 0.8s stuck -> 4s overheat)
    if (this.action === 'TAKEOFF_LAND_STUCK') {
      if (!this.takeoffDiveComplete) {
        this.x = lerp(this.x, this.landingTargetX, clamp(dt * 12, 0, 1));
        this.y += 980 * this.scale * dt;
        if (this.y >= floorY) {
          this.y = floorY;
          this.x = clamp(this.landingTargetX, minX, maxX);
          this.vx = 0;
          this.vy = 0;
          this.takeoffDiveComplete = true;
          this.takeoffLandStuckTimer = this.characterDef.trait.takeoff?.landing.stuck ?? 0.8;
          this.pendingLandingImpact = true;
          this.pendingFootstepShake = 5.5;
          this.spawnDust(particles, 7);
          sfx.playMetalPotClang(true);
          sfx.playDrop();
        }
      } else {
        this.vx = 0;
        this.vy = 0;
        this.y = floorY;
        this.takeoffLandStuckTimer -= dt;
        if (this.takeoffLandStuckTimer <= 0) {
          const trait = this.characterDef.trait;
          const ohDur = trait.takeoff?.landing.thenOverheat ?? 4.0;
          this.takeoffState = 'used';
          this.wingsCrossedOut = true;
          this.rocketPodsOpen = true;
          this.heat = 0;
          this.addTempStatus({
            id: 'overheat',
            duration: ohDur,
            damageTakenMul: trait.overheatDamageTakenMul ?? 1.3,
            moveSpeedMul: trait.overheatMoveSpeedMul ?? 0.6,
            noHeatGain: true,
            label: 'QUÁ NHIỆT',
          });
          this.pendingOverheatCallout = true;
          this.startAction('STANCE', 0);
        }
      }
      return;
    }

    // Nhóc Roll-Dodge ("Lộn né") trajectory across/behind attacker
    if (this.action === 'ROLL_DODGE') {
      const dur = Math.max(0.12, this.actionDuration);
      const p = clamp(this.actionTime / dur, 0, 1);
      const ease = 1 - Math.pow(1 - p, 1.5);
      this.x = clamp(lerp(this.rollStartX, this.rollTargetX, ease), minX, maxX);
      const lift = Math.sin(p * Math.PI) * 18 * this.scale;
      this.y = floorY - lift;
      const rollDir = this.rollTargetX >= this.rollStartX ? 1 : -1;
      this.bodySpin = p * Math.PI * 2 * rollDir;
      if (p >= 1) {
        this.x = clamp(this.rollTargetX, minX, maxX);
        this.y = floorY;
        this.vx = 0;
        this.vy = 0;
        this.bodySpin = 0;
        this.facing = dirToOpp;
        this.spawnDust(particles, 3);
        this.aiCooldown = 0;
        this.startAction('STANCE', 0);
      }
      return;
    }

    const spec = this.getAttackSpecs();
    if (spec && !this.hasPlayedWhoosh && this.actionTime >= spec.activeStart * 0.6) {
      this.hasPlayedWhoosh = true;
      sfx.playWhoosh();
    }

    // Phần 0 Hook: Measure distance at strikeStart (deterministic, no RNG)
    if (spec && this.needsStrikeStartMeasure && this.actionTime >= spec.activeStart) {
      this.needsStrikeStartMeasure = false;
      this.strikeZone = this.classifyRangeZone(absDist);
      if (!this.isIgnoredBySweetSpot(this.action)) {
        if (this.strikeZone === 'sweet') {
          this.lockedSweetRecovery = true;
          this.actionDuration = this.getActionDuration(this.action);
        } else if (this.strikeZone === 'dead') {
          this.pendingVuongCallout = true;
        }
      }
    }

    // Phần 0 Hook: Controlled recovery slide ("Sải bước lùi" in recovery phase, once per strike)
    const slideCfg = this.characterDef.trait.recoverySlide;
    if (
      spec &&
      slideCfg &&
      !this.hasUsedRecoverySlide &&
      this.actionTime >= spec.activeEnd &&
      this.hp > 0 &&
      !this.isDragged
    ) {
      this.hasUsedRecoverySlide = true;
      const backSpace = dirToOpp === 1 ? this.x - minX : maxX - this.x;
      const arenaWidth = Math.max(200, maxX - minX);
      if (backSpace >= arenaWidth * slideCfg.blockedIfBackMarginBelow) {
        const slideDist = this.getWeaponReach() * slideCfg.distanceR;
        const remRec = Math.max(0.12, this.actionDuration - spec.activeEnd);
        this.isRecoverySliding = true;
        this.vx = -dirToOpp * (slideDist / remRec);
        // Leave 2 crisp short "xẹt" heel lines on the notebook paper
        if (particles.length < 52) {
          for (let k = 0; k < 2; k++) {
            particles.push({
              x: this.x + (k - 0.5) * 6 * this.scale,
              y: floorY - 2 * this.scale,
              vx: dirToOpp * (35 + k * 14),
              vy: -14 - k * 8,
              life: 0.22,
              maxLife: 0.22,
              size: (7 + k * 2) * this.scale,
              color: '#334155',
              kind: 'line',
              angle: dirToOpp === 1 ? -0.18 : Math.PI + 0.18,
              spin: 0,
              seed: Math.random() * 100,
            });
          }
        }
      }
    }

    // Release thrown shield at the snap frame of SHIELD_THROW!
    if (
      this.action === 'SHIELD_THROW' &&
      this.actionTime >= 0.14 &&
      !this.hasReleasedShield &&
      this.hasShield
    ) {
      this.hasReleasedShield = true;
      this.hasShield = false;
      this.damageTakenWithShield = 0;
      const throwDmg = this.characterDef.affinity.shield === 'strong' ? 26 : 18;
      const sx = this.joints.handL.x + this.facing * 12 * this.scale;
      const sy = this.joints.handL.y - 4 * this.scale;
      let throwVx = this.facing * 590 * this.scale;
      let throwVy = -36 * this.scale;
      if (opponent.isAirborne()) {
        const dx = opponent.x - sx;
        const dy = opponent.joints.shoulder.y - sy;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = 640 * this.scale;
        const tFlight = dist / speed;
        throwVx = (dx / dist) * speed;
        throwVy = (dy / dist) * speed - 0.5 * 220 * this.scale * tFlight;
      }
      this.pendingShieldThrow = {
        x: sx,
        y: sy,
        vx: throwVx,
        vy: throwVy,
        ownerSide: this.side,
        damage: Math.round(throwDmg * this.characterDef.damageDealt),
      };
      sfx.playShieldThrow();
      this.spawnDust(particles, 3);
    }

    const wMult = this.getEffectiveWindupMult();

    // SWORD_LUNGE burst dash forward (Cao Kều sword 'good' affinity: +25% lunge reach/speed)
    if (this.action === 'SWORD_LUNGE' && !this.triggeredLungeBurst && this.actionTime >= 0.08 * wMult) {
      this.triggeredLungeBurst = true;
      const swordGoodMult = this.characterId === 'caokieu' ? 1.25 : 1;
      this.vx = this.facing * 365 * swordGoodMult * this.scale * this.getEffectiveMoveSpeed();
      this.spawnDust(particles, 4);
    }

    // SWORD_3 360 horizontal spin cleave
    if (this.action === 'SWORD_3' && this.actionDuration > 0) {
      const p = clamp(this.actionTime / this.actionDuration, 0, 1);
      this.bodySpin = p * Math.PI * 2 * this.facing;
    }

    // SPEAR_2 automatic half-step pull back after thrust (skipped if trait.recoverySlide already handles retreat)
    const spearWeak = this.characterDef.affinity.spear === 'weak';
    if (
      this.action === 'SPEAR_2' &&
      !this.triggeredSpearStepBack &&
      !this.characterDef.trait.recoverySlide &&
      this.actionTime >= (spearWeak ? 0.19 : 0.15) * wMult
    ) {
      this.triggeredSpearStepBack = true;
      this.vx = -this.facing * (spearWeak ? 184 : 245) * this.scale;
      this.spawnDust(particles, 3);
    }

    // BAT_2 feint pause -> upward burst snap
    const batWind =
      this.characterId === 'bucon' || this.characterId === 'lonsat'
        ? Math.max(wMult, 1.33)
        : this.characterId === 'nhoc' || this.characterId === 'hebongbay'
          ? wMult * 0.76
          : wMult;
    if (this.action === 'BAT_2' && !this.triggeredLungeBurst && this.actionTime >= 0.25 * batWind) {
      this.triggeredLungeBurst = true;
      this.vx = this.facing * 175 * this.scale * this.getEffectiveMoveSpeed();
      sfx.playWhoosh();
    }

    // HAMMER_2 full 360 spinning horizontal sweep!
    if (this.action === 'HAMMER_2' && this.actionDuration > 0) {
      const p = clamp(this.actionTime / this.actionDuration, 0, 1);
      this.bodySpin = p * Math.PI * 2 * this.facing;
      if (p < 0.78) {
        this.vx = this.facing * 118 * this.scale * this.getEffectiveMoveSpeed();
      } else {
        this.vx *= Math.pow(0.08, dt);
      }
    }

    // HAMMER_3 offscreen leap -> "BỐP!" -> downward slam & rip paper!
    if (this.action === 'HAMMER_3') {
      const hammerStrong = this.characterDef.affinity.hammer === 'strong';
      const hammerWeak = this.characterDef.affinity.hammer === 'weak';
      const jumpMult = hammerWeak ? wMult * (this.characterId === 'caokieu' ? 1.35 : 1.5) : wMult;
      if (!this.triggeredHammerJump && this.actionTime >= 0.04 * jumpMult) {
        this.triggeredHammerJump = true;
        // Light body (Nhóc) flies higher; Cao Kều (weak hammer) & heavy Lon Sắt jump lower
        const jumpVel =
          this.characterId === 'caokieu'
            ? 1120
            : this.characterId === 'lonsat'
              ? 1160
              : hammerStrong
                ? 1320
                : hammerWeak
                  ? 1720
                  : 1460;
        this.vy = -jumpVel * this.scale;
        this.vx = dirToOpp * 165 * this.scale * this.getEffectiveMoveSpeed();
        this.spawnDust(particles, hammerStrong ? 10 : 6);
        sfx.playWhoosh();
      }
      if (!this.triggeredHammerDive && this.actionTime >= 0.24 * jumpMult) {
        this.triggeredHammerDive = true;
        this.pendingBopCallout = true;
        this.x = clamp(opponent.x - dirToOpp * 34 * this.scale, minX, maxX);
        this.vy = (hammerStrong ? 1280 : 1140) * this.scale;
        this.vx = dirToOpp * 30 * this.scale;
      }
      if (!this.triggeredHammerSlam && this.actionTime >= 0.34 * jumpMult && this.y >= floorY - 2) {
        this.triggeredHammerSlam = true;
        const boilerHotTear =
          this.characterDef.trait.id === 'boiler' &&
          this.heat >= (this.characterDef.trait.hotAt ?? 75)
            ? 1.15
            : 1;
        this.pendingPaperTear = {
          x: clamp(this.x + this.facing * 28 * this.scale, minX + 20, maxX - 20),
          y: floorY,
          width: (hammerStrong ? 162 : 112) * boilerHotTear * this.scale,
          ownerSide: this.side,
          heavy: hammerStrong,
        };
        this.spawnDust(particles, hammerStrong ? 16 : 9);
        sfx.playWeaponHit('hammer');
      }
      if (this.actionTime >= 0.5 * jumpMult && !this.isRecoverySliding) {
        this.vx *= Math.pow(0.01, dt);
      }
    }

    // Hammer weak affinity: heavy swing momentum pulls Nhóc forward a step / pitches Cao Kều slightly forward
    if (
      this.weapon === 'hammer' &&
      this.characterDef.affinity.hammer === 'weak' &&
      !this.triggeredHammerStumble &&
      !this.isRecoverySliding &&
      spec &&
      this.actionTime >= spec.activeEnd &&
      (this.action === 'HAMMER_2' ||
        this.action === 'HAMMER_3' ||
        this.action === 'CROSS' ||
        this.action === 'JAB')
    ) {
      this.triggeredHammerStumble = true;
      this.vx = this.facing * (this.characterId === 'caokieu' ? 125 : 215) * this.scale;
      if (this.characterId !== 'caokieu' && this.y >= floorY - 2) {
        this.vy = -85 * this.scale;
      }
    }

    // Super Punch mid-lunge burst!
    if (
      this.action === 'SUPER_PUNCH' &&
      this.actionTime >= 0.2 * wMult &&
      this.actionTime - dt < 0.2 * wMult
    ) {
      this.vx = this.facing * 420 * this.scale * this.getEffectiveMoveSpeed();
      this.spawnDust(particles, 5);
    }

    // Lon Sắt Unarmed strong affinity: piston steam puff from elbow + finisher steam burst push!
    if (
      !this.weapon &&
      this.characterId === 'lonsat' &&
      spec &&
      !this.pistonSteamFired &&
      this.actionTime >= spec.activeStart
    ) {
      this.pistonSteamFired = true;
      const elb = spec.limb === 'handL' ? this.joints.elbowL : this.joints.elbowR;
      if (particles.length < 56) {
        for (let si = 0; si < 3; si++) {
          particles.push({
            x: elb.x - this.facing * 4 * this.scale,
            y: elb.y + (si - 1) * 3 * this.scale,
            vx: -this.facing * (70 + si * 28),
            vy: -18 + (si - 1) * 18,
            life: 0.34,
            maxLife: 0.34,
            size: 5 * this.scale,
            color: '#64748B',
            kind: 'steam',
            angle: 0,
            spin: 1,
            seed: Math.random() * 100,
          });
        }
      }
      if (
        this.comboQueue.length === 0 &&
        (this.action === 'CROSS' ||
          this.action === 'UPPERCUT' ||
          this.action === 'SUPER_PUNCH' ||
          this.action === 'ROUNDHOUSE' ||
          this.action === 'SWEEP_KICK')
      ) {
        const hitJoint = this.joints[spec.limb];
        this.pendingSteamPush = { x: hitJoint.x, y: hitJoint.y, dir: this.facing };
      }
    }

    if (this.action === 'KO') {
      if (Math.floor((this.actionTime - dt) * 4) !== Math.floor(this.actionTime * 4) && particles.length < 40) {
        const ang = this.actionTime * 4;
        particles.push({
          x: this.joints.head.x + Math.cos(ang) * 16 * this.scale,
          y: this.joints.head.y - 16 * this.scale + Math.sin(ang) * 5 * this.scale,
          vx: 0,
          vy: -8,
          life: 0.45,
          maxLife: 0.45,
          size: 5 * this.scale,
          color: '#D97706',
          kind: 'star',
          angle: ang,
          spin: 4,
          seed: Math.random() * 50,
        });
      }
      return;
    }

    if (this.action === 'KNOCKDOWN') {
      if (this.actionTime >= this.actionDuration && this.y >= floorY - 1) {
        if (this.hp <= 0) {
          this.startAction('KO', 0);
        } else {
          if (this.pendingWingBreakOverheat) {
            this.pendingWingBreakOverheat = false;
            const trait = this.characterDef.trait;
            const ohDur = trait.takeoff?.flight.breakOverheat ?? 4.0;
            this.heat = 0;
            this.addTempStatus({
              id: 'overheat',
              duration: ohDur,
              damageTakenMul: trait.overheatDamageTakenMul ?? 1.3,
              moveSpeedMul: trait.overheatMoveSpeedMul ?? 0.6,
              noHeatGain: true,
              label: 'QUÁ NHIỆT',
            });
            this.pendingOverheatCallout = true;
          }
          this.startAction('GETUP', 0.3);
        }
      }
      return;
    }

    if (this.actionDuration > 0 && this.actionTime >= this.actionDuration) {
      if (this.hp <= 0) {
        this.comboQueue = [];
        this.shouldRetreatAfterCombo = false;
        this.startAction('KO', 0);
      } else if (
        this.characterDef.affinity.sword === 'strong' &&
        this.weapon === 'sword' &&
        (this.action === 'SWORD_3' || this.action === 'SWORD_LUNGE') &&
        this.hasHitThisAction &&
        opponent.hp > 0 &&
        !opponent.isDragged &&
        absDist < 95 * this.scale
      ) {
        // Nhóc Sword affinity: quick follow-up slash SWORD_4 only when finisher connected close!
        this.facing = dirToOpp;
        this.vx = dirToOpp * 165 * this.scale * this.getEffectiveMoveSpeed();
        this.startAction('SWORD_4', this.getActionDuration('SWORD_4'));
      } else if (
        this.characterDef.ai.style === 'zoner' &&
        (this.classifyRangeZone(absDist) === 'dead' ||
          (this.zonerComboBeats >= (this.characterDef.ai.maxComboBeatsInSweet ?? 2) &&
            this.classifyRangeZone(absDist) !== 'sweet'))
      ) {
        // Zoner combo discipline: cut combo immediately if enemy rushed < 0.5 R, or cap at 2 beats outside sweet spot!
        this.comboQueue = [];
        this.shouldRetreatAfterCombo = false;
        this.zonerComboBeats = 0;
        this.facing = dirToOpp;
        this.aiCooldown = Math.max(this.aiCooldown, this.weapon === 'spear' ? 0.34 : 0.28);
        this.startAction('STANCE', 0);
      } else if (
        this.weapon === 'sword' &&
        (this.action === 'SWORD_1' || this.action === 'SWORD_2') &&
        !this.hasHitThisAction &&
        (absDist > 78 * this.scale || Math.random() < 0.65)
      ) {
        // Sword whiff discipline: missing a light slash does not vacuum-chain endlessly
        this.comboQueue = [];
        this.shouldRetreatAfterCombo = false;
        this.zonerComboBeats = 0;
        this.facing = dirToOpp;
        this.aiCooldown = Math.max(this.aiCooldown, 0.28);
        this.startAction('STANCE', 0);
      } else if (
        this.comboQueue.length > 0 &&
        opponent.hp > 0 &&
        !opponent.isDragged &&
        absDist <
          (this.weapon === 'sword'
            ? Math.max(122 * this.scale, this.getWeaponReach() * 1.08)
            : Math.max(180 * this.scale, this.getWeaponReach() * 1.25))
      ) {
        // Chain immediately into next combo hit (adaptive mid-combo checks!)
        let nextMove = this.comboQueue.shift()!;
        this.facing = dirToOpp;
        this.zonerComboBeats += 1;

        // Sword dynamic finisher adaptation by current distance (Cao Kều always chooses SWORD_LUNGE!)
        if (this.characterId === 'caokieu' && nextMove === 'SWORD_3') {
          nextMove = 'SWORD_LUNGE';
        } else if (this.characterId !== 'caokieu') {
          if (nextMove === 'SWORD_3' && absDist >= 82 * this.scale) {
            nextMove = 'SWORD_LUNGE';
          } else if (nextMove === 'SWORD_LUNGE' && absDist < 66 * this.scale) {
            nextMove = 'SWORD_3';
          }
        }

        // Spear close-range safety counter
        if (this.weapon === 'spear' && absDist < 46 * this.scale && nextMove !== 'SPEAR_BUTT') {
          nextMove = 'SPEAR_BUTT';
        }

        const spd = this.getEffectiveMoveSpeed();
        if (nextMove === 'JUMP_KICK') {
          this.vx = dirToOpp * 240 * this.scale * spd;
          this.vy = -310 * this.scale;
        } else if (nextMove === 'SWORD_1' || nextMove === 'SWORD_2') {
          this.vx = dirToOpp * 115 * this.scale * spd;
        } else if (nextMove === 'SWORD_3') {
          this.vx = dirToOpp * 135 * this.scale * spd;
        } else if (nextMove === 'SWORD_LUNGE') {
          const lungeBoost = this.characterId === 'caokieu' ? 1.25 : 1;
          this.vx = dirToOpp * 220 * lungeBoost * this.scale * spd;
        } else if (nextMove === 'HAMMER_3') {
          this.vx = dirToOpp * 150 * this.scale * spd;
        } else if (nextMove === 'SPEAR_3') {
          // Cao Kều spear affinity: 60% dash; Lon Sắt weak spear affinity: 75% dash
          const spearDashMult =
            this.characterId === 'caokieu'
              ? 0.6
              : this.characterId === 'lonsat'
                ? 0.75
                : 1;
          this.vx = dirToOpp * 315 * spearDashMult * this.scale * spd;
        } else if (nextMove === 'SPEAR_BUTT') {
          this.vx = -dirToOpp * 75 * this.scale * spd;
        } else if (nextMove === 'BAT_3') {
          this.vx = dirToOpp * 195 * this.scale * spd;
        } else {
          this.vx = dirToOpp * 145 * this.scale * spd;
        }
        this.startAction(nextMove, this.getActionDuration(nextMove));
      } else if (
        this.shouldRetreatAfterCombo &&
        opponent.hp > 0 &&
        !opponent.isDragged &&
        absDist < 145 * this.scale
      ) {
        this.comboQueue = [];
        this.shouldRetreatAfterCombo = false;
        this.zonerComboBeats = 0;
        this.facing = dirToOpp;
        this.vx = -dirToOpp * 265 * this.scale * this.getEffectiveMoveSpeed();
        this.vy = -135 * this.scale;
        this.startAction('BACKSTEP', 0.25);
        this.aiCooldown = this.characterDef.ai.style === 'prankster' ? 0.38 : 0.22;
      } else {
        const finishedAction = this.action;
        const wasAttack = this.isAttacking();
        this.comboQueue = [];
        this.shouldRetreatAfterCombo = false;
        this.zonerComboBeats = 0;
        this.facing = dirToOpp;
        if (this.characterDef.ai.style === 'prankster' && wasAttack) {
          const isHeavyFin = ['ROUNDHOUSE', 'SWEEP_KICK', 'SWORD_3', 'SWORD_LUNGE', 'BAT_3', 'SPEAR_3', 'HAMMER_3'].includes(finishedAction);
          this.aiCooldown = Math.max(this.aiCooldown, isHeavyFin ? 0.44 : 0.32);
        } else if (this.characterDef.ai.style === 'zoner' && wasAttack) {
          const postCd =
            finishedAction === 'SPEAR_3'
              ? 0.52
              : this.weapon === 'spear'
                ? 0.34
                : 0.3;
          this.aiCooldown = Math.max(this.aiCooldown, postCd);
        } else if (this.weapon === 'sword' && wasAttack) {
          // Fair post-combo recovery gap so sword fighters cannot spam back-to-back combos endlessly
          const swordPostCd =
            finishedAction === 'SWORD_3' || finishedAction === 'SWORD_LUNGE'
              ? 0.4
              : finishedAction === 'SWORD_4'
                ? 0.42
                : 0.28;
          this.aiCooldown = Math.max(this.aiCooldown, swordPostCd);
        }
        this.startAction('STANCE', 0);
      }
    }
  }

  private spawnDust(particles: Particle[], count: number) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: this.x + (Math.random() - 0.5) * 24 * this.scale,
        y: this.y - 2,
        vx: (Math.random() - 0.5) * 90,
        vy: -25 - Math.random() * 45,
        life: 0.28 + Math.random() * 0.14,
        maxLife: 0.4,
        size: (4 + Math.random() * 4) * this.scale,
        color: '#64748B',
        kind: 'dust',
        angle: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 4,
        seed: Math.random() * 100,
      });
    }
  }

  private buildDraggedPose(t: number): Pose {
    const swing = clamp(-this.dragVelX * 0.0018, -0.75, 0.75);
    const kick = Math.sin(t * 14 + this.seedBase) * 0.42;
    return {
      hipDrop: -4,
      torsoLean: swing * 0.7,
      headTilt: swing * 0.4,
      upperArmL: 2.35 + Math.sin(t * 11) * 0.25,
      elbowL: 0.25,
      upperArmR: 2.1 - Math.sin(t * 11) * 0.25,
      elbowR: 0.3,
      thighL: swing * 0.9 + kick,
      kneeL: 0.45 + Math.max(0, Math.sin(t * 14)) * 0.5,
      thighR: swing * 0.9 - kick,
      kneeR: 0.45 + Math.max(0, -Math.sin(t * 14)) * 0.5,
    };
  }

  private buildActionPose(t: number): Pose {
    const p = this.actionDuration > 0 ? clamp(this.actionTime / this.actionDuration, 0, 1) : 0;

    switch (this.action) {
      case 'ENTRANCE_JUMP': {
        const tucked = Math.sin(p * Math.PI);
        return {
          hipDrop: -4,
          torsoLean: 0.42 * tucked,
          headTilt: -0.15,
          upperArmL: 1.95,
          elbowL: 0.8,
          upperArmR: 1.55,
          elbowR: 0.9,
          thighL: 0.95 * tucked + 0.25,
          kneeL: 1.55 * tucked + 0.4,
          thighR: 0.65 * tucked,
          kneeR: 1.45 * tucked + 0.35,
        };
      }

      case 'TAUNT': {
        if (this.characterDef.entrance.tauntStyle === 'bucon_stomp') {
          // Bự Con heavy chest thump & stomp taunt!
          if (p < 0.35) {
            const g = p / 0.35;
            return {
              hipDrop: lerp(14, 22, g),
              torsoLean: 0.2,
              headTilt: -0.05,
              upperArmL: lerp(0.5, 1.3, g),
              elbowL: 1.5,
              upperArmR: lerp(0.5, 1.3, g),
              elbowR: 1.5,
              thighL: 0.58,
              kneeL: 0.9,
              thighR: -0.48,
              kneeR: 0.78,
            };
          }
          const pump = Math.sin((p - 0.35) * 18) * 0.25;
          return {
            hipDrop: 10,
            torsoLean: -0.12,
            headTilt: -0.14,
            upperArmL: Math.PI * 0.74 + pump,
            elbowL: 0.52,
            upperArmR: Math.PI * 0.72 - pump,
            elbowR: 0.55,
            thighL: 0.44,
            kneeL: 0.44,
            thighR: -0.4,
            kneeR: 0.4,
          };
        } else if (this.characterDef.entrance.tauntStyle === 'nhoc_hop') {
          // Nhóc playful rapid double-hop + cheeky beckon wave!
          const hop = Math.abs(Math.sin(p * Math.PI * 2));
          const wave = Math.sin(p * Math.PI * 4) * 0.35;
          return {
            hipDrop: lerp(10, -10, hop),
            torsoLean: 0.22 + Math.sin(p * Math.PI * 2) * 0.08,
            headTilt: -0.14 + Math.sin(p * 18) * 0.08,
            upperArmL: Math.PI * 0.72 + wave,
            elbowL: 0.6,
            upperArmR: 0.55 - wave * 0.7,
            elbowR: 1.35,
            thighL: 0.48 + hop * 0.35,
            kneeL: 0.72 + hop * 0.65,
            thighR: -0.34 - hop * 0.2,
            kneeR: 0.65 + hop * 0.65,
          };
        } else if (this.characterDef.entrance.tauntStyle === 'caokieu_push_glasses') {
          // Cao Kều cool two-finger glasses-push + calm nod!
          const push = Math.sin(p * Math.PI);
          return {
            hipDrop: 3,
            torsoLean: 0.08 - push * 0.04,
            headTilt: push > 0.6 ? 0.14 : -0.04,
            upperArmL: lerp(0.25, 2.28, push),
            elbowL: lerp(0.55, 1.55, push),
            upperArmR: -0.18,
            elbowR: 0.35,
            thighL: 0.18,
            kneeL: 0.18,
            thighR: -0.16,
            kneeR: 0.16,
          };
        } else if (this.characterDef.entrance.tauntStyle === 'lonsat_vent_rev') {
          // Lon Sắt heavy mechanical piston-clank + steam rev taunt!
          const clank = Math.sin(p * Math.PI * 3);
          return {
            hipDrop: 9 + Math.abs(clank) * 4,
            torsoLean: 0.04,
            headTilt: clank * 0.08,
            upperArmL: 0.85 + clank * 0.38,
            elbowL: 1.48,
            upperArmR: 0.85 - clank * 0.38,
            elbowR: 1.48,
            thighL: 0.32,
            kneeL: 0.34,
            thighR: -0.3,
            kneeR: 0.34,
          };
        } else if (this.characterDef.entrance.tauntStyle === 'clown_juggle') {
          // Hề Bóng Bay juggling bounce & cheeky bow
          const jug = Math.sin(p * Math.PI * 6);
          const bow = p > 0.75 ? Math.sin(((p - 0.75) / 0.25) * Math.PI) * 0.24 : 0;
          return {
            hipDrop: 8 - Math.abs(jug) * 5,
            torsoLean: 0.06 + bow,
            headTilt: Math.sin(p * Math.PI * 4) * 0.14,
            upperArmL: 1.15 + jug * 0.42,
            elbowL: 1.35,
            upperArmR: 1.15 - jug * 0.42,
            elbowR: 1.35,
            thighL: 0.34,
            kneeL: 0.44,
            thighR: -0.32,
            kneeR: 0.42,
          };
        }
        // Stickman normal: gather crouch -> sharp martial fist-pump beckon
        if (p < 0.3) {
          const gather = p / 0.3;
          return {
            hipDrop: lerp(14, 18, gather),
            torsoLean: lerp(0.18, 0.28, gather),
            headTilt: -0.06,
            upperArmL: lerp(0.4, 0.95, gather),
            elbowL: 1.65,
            upperArmR: lerp(0.1, -0.45, gather),
            elbowR: 1.55,
            thighL: 0.56,
            kneeL: 0.92,
            thighR: -0.42,
            kneeR: 0.72,
          };
        }
        if (p < 0.78) {
          const snap = clamp((p - 0.3) / 0.18, 0, 1);
          const tremor = Math.sin(p * 42) * 0.04;
          return {
            hipDrop: lerp(18, 4, snap),
            torsoLean: lerp(0.28, -0.14, snap),
            headTilt: -0.12,
            upperArmL: lerp(0.95, Math.PI * 0.78 + tremor, snap),
            elbowL: lerp(1.65, 0.42, snap),
            upperArmR: lerp(-0.45, 0.55, snap),
            elbowR: 1.45,
            thighL: lerp(0.56, 0.32, snap),
            kneeL: lerp(0.92, 0.28, snap),
            thighR: lerp(-0.42, -0.28, snap),
            kneeR: lerp(0.72, 0.26, snap),
          };
        }
        const settle = (p - 0.78) / 0.22;
        return {
          hipDrop: lerp(4, 3, settle),
          torsoLean: lerp(-0.14, 0.05, settle),
          headTilt: lerp(-0.12, 0, settle),
          upperArmL: lerp(Math.PI * 0.78, 0.22, settle),
          elbowL: lerp(0.42, 0.55, settle),
          upperArmR: lerp(0.55, -0.1, settle),
          elbowR: lerp(1.45, 0.45, settle),
          thighL: lerp(0.32, 0.22, settle),
          kneeL: lerp(0.28, 0.22, settle),
          thighR: lerp(-0.28, -0.2, settle),
          kneeR: lerp(0.26, 0.2, settle),
        };
      }

      case 'IDLE_WAIT': {
        if (this.characterId === 'nhoc') {
          // Energetic tiptoe bounce, rhythmic head bob, and mini-hop every ~3s
          const hopCycle = ((t + this.seedBase * 0.01) % 3.0) / 3.0;
          const hop = hopCycle > 0.9 ? Math.sin(((hopCycle - 0.9) / 0.1) * Math.PI) : 0;
          const tiptoe = Math.abs(Math.sin(t * 7.2 + this.seedBase)) * 2.2;
          return {
            hipDrop: 7 - tiptoe - hop * 12,
            torsoLean: 0.2 + Math.sin(t * 3.6) * 0.05,
            headTilt: Math.sin(t * 7.2 + 0.5) * 0.09,
            upperArmL: 0.65 + hop * 0.75 + Math.sin(t * 7.2) * 0.08,
            elbowL: 1.42,
            upperArmR: 0.35 + hop * 0.55 - Math.sin(t * 7.2) * 0.08,
            elbowR: 1.48,
            thighL: 0.38 + hop * 0.25,
            kneeL: 0.52 + hop * 0.55,
            thighR: -0.32 - hop * 0.15,
            kneeR: 0.48 + hop * 0.55,
          };
        }
        if (this.characterId === 'caokieu') {
          // Relaxed tall pole sway, crossed-ankle lean, occasional glasses push every ~3.4s
          const pushCycle = ((t + this.seedBase * 0.013) % 3.4) / 3.4;
          const pushGlass = pushCycle > 0.84 ? Math.sin(((pushCycle - 0.84) / 0.16) * Math.PI) : 0;
          const sway = Math.sin(t * 1.45 + this.seedBase) * 0.065;
          return {
            hipDrop: 2 + Math.sin(t * 2.1 + this.seedBase) * 1.2,
            torsoLean: 0.08 + sway,
            headTilt: 0.05 + Math.sin(t * 1.1) * 0.04,
            upperArmL: lerp(0.14 + sway, 2.26, pushGlass),
            elbowL: lerp(0.32, 1.56, pushGlass),
            upperArmR: -0.14 - sway,
            elbowR: 0.28,
            thighL: 0.24,
            kneeL: 0.16,
            thighR: -0.12,
            kneeR: 0.14,
          };
        }
        if (this.characterId === 'lonsat') {
          if (this.hasTempStatus('overheat')) {
            return {
              hipDrop: 12,
              torsoLean: 0.24,
              headTilt: 0.44,
              upperArmL: 0.18,
              elbowL: 0.25,
              upperArmR: -0.08,
              elbowR: 0.22,
              thighL: 0.26,
              kneeL: 0.32,
              thighR: -0.22,
              kneeR: 0.28,
            };
          }
          const scanCycle = ((t + this.seedBase * 0.01) % 2.8) / 2.8;
          const headScan = scanCycle > 0.72 ? Math.sin(((scanCycle - 0.72) / 0.28) * Math.PI) * 0.26 : 0;
          return {
            hipDrop: 4,
            torsoLean: 0.02,
            headTilt: headScan,
            upperArmL: 0.36,
            elbowL: 1.05,
            upperArmR: 0.08,
            elbowR: 1.15,
            thighL: 0.24,
            kneeL: 0.2,
            thighR: -0.22,
            kneeR: 0.2,
          };
        }
        if (this.characterId === 'hebongbay') {
          const jug = Math.sin(t * 7.5 + this.seedBase);
          return {
            hipDrop: 5 - Math.abs(jug) * 2.5,
            torsoLean: 0.06 + jug * 0.05,
            headTilt: -jug * 0.1,
            upperArmL: 0.95 + jug * 0.32,
            elbowL: 1.45,
            upperArmR: 0.95 - jug * 0.32,
            elbowR: 1.45,
            thighL: 0.28,
            kneeL: 0.34,
            thighR: -0.24,
            kneeR: 0.32,
          };
        }
        const breathe = Math.sin(t * 3.4 + this.seedBase) * 1.8;
        const sway = Math.sin(t * 1.7 + this.seedBase) * 0.06;
        return {
          hipDrop: 3 + breathe,
          torsoLean: 0.04 + sway,
          headTilt: Math.sin(t * 1.1) * 0.05,
          upperArmL: 0.18 + sway,
          elbowL: 0.55,
          upperArmR: -0.12 - sway,
          elbowR: 0.45,
          thighL: 0.22,
          kneeL: 0.22,
          thighR: -0.2,
          kneeR: 0.2,
        };
      }

      case 'NOTICE': {
        return {
          hipDrop: 7,
          torsoLean: -0.1,
          headTilt: -0.1,
          upperArmL: 1.1,
          elbowL: 1.1,
          upperArmR: 0.65,
          elbowR: 1.2,
          thighL: 0.35,
          kneeL: 0.35,
          thighR: -0.32,
          kneeR: 0.3,
        };
      }

      case 'STANCE': {
        const moveRatio = clamp(Math.abs(this.vx) / (180 * this.scale), 0, 1);
        if (this.characterId === 'nhoc') {
          const tiptoe = Math.abs(Math.sin(t * 11 + this.seedBase)) * 3.2;
          const stride = Math.sin(t * 16) * 0.56 * moveRatio;
          return {
            hipDrop: 10 - tiptoe,
            torsoLean: 0.26 + moveRatio * 0.18,
            headTilt: -0.06 + Math.sin(t * 11) * 0.06,
            upperArmL: 0.88 + Math.sin(t * 11) * 0.12,
            elbowL: 1.42,
            upperArmR: 0.52 - Math.sin(t * 11) * 0.12,
            elbowR: 1.52,
            thighL: 0.44 + stride,
            kneeL: 0.58 + Math.max(0, -stride) * 0.55,
            thighR: -0.36 - stride,
            kneeR: 0.52 + Math.max(0, stride) * 0.55,
          };
        }
        if (this.characterId === 'caokieu') {
          // Long unhurried strides, dangling arms, slightly hunched forward (+ extra hunch with hammer)
          const hammerHunch = this.weapon === 'hammer' ? 0.16 : 0;
          const slowStride = Math.sin(t * 7.5) * 0.52 * moveRatio;
          const sway = Math.sin(t * 2.2 + this.seedBase) * 0.04;
          return {
            hipDrop: 3 + moveRatio * 2,
            torsoLean: 0.18 + hammerHunch + sway + moveRatio * 0.08,
            headTilt: 0.04,
            upperArmL: 0.42 - slowStride * 0.35,
            elbowL: 0.62,
            upperArmR: 0.15 + slowStride * 0.35,
            elbowR: 0.72,
            thighL: 0.28 + slowStride,
            kneeL: 0.24 + Math.max(0, -slowStride) * 0.4,
            thighR: -0.24 - slowStride,
            kneeR: 0.2 + Math.max(0, slowStride) * 0.4,
          };
        }
        if (this.characterId === 'lonsat') {
          const overheated = this.hasTempStatus('overheat');
          const mechStride = Math.sin(t * (overheated ? 5.5 : 8.5)) * 0.44 * moveRatio;
          return {
            hipDrop: overheated ? 13 : 5,
            torsoLean: overheated ? 0.26 : 0.04 + moveRatio * 0.06,
            headTilt: overheated ? 0.42 : 0,
            upperArmL: overheated ? 0.22 : 0.58 - mechStride * 0.2,
            elbowL: overheated ? 0.3 : 1.28,
            upperArmR: overheated ? -0.06 : 0.24 + mechStride * 0.2,
            elbowR: overheated ? 0.28 : 1.38,
            thighL: 0.28 + mechStride,
            kneeL: 0.3 + Math.max(0, -mechStride) * 0.35,
            thighR: -0.26 - mechStride,
            kneeR: 0.26 + Math.max(0, mechStride) * 0.35,
          };
        }
        if (this.characterId === 'hebongbay') {
          const hop = Math.abs(Math.sin(t * 10 + this.seedBase)) * (2.5 + moveRatio * 3.2);
          const duckStride = Math.sin(t * 12) * 0.52 * moveRatio;
          return {
            hipDrop: 8 - hop,
            torsoLean: 0.14 + Math.sin(t * 6) * 0.05,
            headTilt: Math.sin(t * 8) * 0.09,
            upperArmL: 0.85 + Math.sin(t * 10) * 0.16,
            elbowL: 1.28,
            upperArmR: 0.58 - Math.sin(t * 10) * 0.16,
            elbowR: 1.38,
            thighL: 0.38 + duckStride,
            kneeL: 0.48 + Math.max(0, -duckStride) * 0.48,
            thighR: -0.32 - duckStride,
            kneeR: 0.42 + Math.max(0, duckStride) * 0.48,
          };
        }
        const bounce = Math.sin(t * 9 + this.seedBase) * 2.5;
        const stride = Math.sin(t * 13) * 0.48 * moveRatio;
        return {
          hipDrop: 7 + bounce,
          torsoLean: 0.16 + moveRatio * 0.14,
          headTilt: -0.05,
          upperArmL: 0.72 + Math.sin(t * 9) * 0.08,
          elbowL: 1.35,
          upperArmR: 0.35 - Math.sin(t * 9) * 0.08,
          elbowR: 1.55,
          thighL: 0.34 + stride,
          kneeL: 0.42 + Math.max(0, -stride) * 0.5,
          thighR: -0.28 - stride,
          kneeR: 0.35 + Math.max(0, stride) * 0.5,
        };
      }

      case 'DASH': {
        return {
          hipDrop: 10,
          torsoLean: 0.52,
          headTilt: -0.25,
          upperArmL: -0.55,
          elbowL: 0.85,
          upperArmR: 0.45,
          elbowR: 1.2,
          thighL: 0.75,
          kneeL: 0.85,
          thighR: -0.68,
          kneeR: 0.3,
        };
      }

      case 'BACKSTEP': {
        if (this.characterId === 'nhoc') {
          // Curled C-shape hop backward with both arms flung forward for balance
          return {
            hipDrop: 13,
            torsoLean: 0.48,
            headTilt: -0.18,
            upperArmL: 1.45,
            elbowL: 0.28,
            upperArmR: 1.32,
            elbowR: 0.35,
            thighL: 0.85,
            kneeL: 1.25,
            thighR: 0.45,
            kneeR: 1.15,
          };
        }
        if (this.characterId === 'caokieu') {
          // Tall un-crouched double step back with long arms raised in guard
          const stepAlt = Math.sin(p * Math.PI * 2) * 0.35;
          return {
            hipDrop: 4,
            torsoLean: -0.14,
            headTilt: 0.1,
            upperArmL: 1.38,
            elbowL: 0.92,
            upperArmR: 1.12,
            elbowR: 0.95,
            thighL: 0.45 + stepAlt,
            kneeL: 0.35,
            thighR: -0.45 - stepAlt,
            kneeR: 0.35,
          };
        }
        if (this.characterId === 'lonsat') {
          return {
            hipDrop: 8,
            torsoLean: -0.1,
            headTilt: 0.04,
            upperArmL: 1.25,
            elbowL: 1.55,
            upperArmR: 0.72,
            elbowR: 1.42,
            thighL: 0.38,
            kneeL: 0.42,
            thighR: -0.36,
            kneeR: 0.38,
          };
        }
        if (this.characterId === 'hebongbay') {
          const hopArc = Math.sin(p * Math.PI);
          return {
            hipDrop: 10 - hopArc * 5,
            torsoLean: -0.18,
            headTilt: 0.16,
            upperArmL: 1.45,
            elbowL: 0.65,
            upperArmR: -0.75,
            elbowR: 0.7,
            thighL: 0.62,
            kneeL: 0.95,
            thighR: -0.35,
            kneeR: 0.85,
          };
        }
        return {
          hipDrop: 8,
          torsoLean: -0.24,
          headTilt: 0.1,
          upperArmL: 0.9,
          elbowL: 1.1,
          upperArmR: 0.5,
          elbowR: 1.1,
          thighL: 0.48,
          kneeL: 0.65,
          thighR: -0.45,
          kneeR: 0.55,
        };
      }

      case 'DODGE_BACK': {
        const arch = Math.sin(p * Math.PI);
        if (this.characterId === 'nhoc') {
          return {
            hipDrop: 8 * arch,
            torsoLean: 0.56 * arch + 0.18,
            headTilt: -0.2,
            upperArmL: 1.55,
            elbowL: 0.25,
            upperArmR: 1.42,
            elbowR: 0.3,
            thighL: 1.15 * arch + 0.3,
            kneeL: 1.65 * arch + 0.4,
            thighR: 0.6 * arch + 0.15,
            kneeR: 1.5 * arch + 0.35,
          };
        }
        return {
          hipDrop: -6 * arch,
          torsoLean: -0.62 * arch - 0.15,
          headTilt: 0.25,
          upperArmL: 1.45,
          elbowL: 0.95,
          upperArmR: -0.65,
          elbowR: 1.15,
          thighL: 1.05 * arch + 0.25,
          kneeL: 1.55 * arch + 0.3,
          thighR: -0.25,
          kneeR: 1.4 * arch + 0.3,
        };
      }

      case 'ROLL_DODGE': {
        return {
          hipDrop: 18,
          torsoLean: 1.02,
          headTilt: 0.38,
          upperArmL: 1.38,
          elbowL: 1.75,
          upperArmR: 1.38,
          elbowR: 1.75,
          thighL: 1.48,
          kneeL: 2.08,
          thighR: 1.28,
          kneeR: 2.08,
        };
      }

      case 'SHIELD_CROUCH': {
        const brace = Math.sin(Math.min(1, p * 3.2) * (Math.PI * 0.5));
        return {
          hipDrop: 21 * brace + 6 * (1 - brace),
          torsoLean: 0.34,
          headTilt: 0.22,
          upperArmL: 1.12,
          elbowL: 0.68,
          upperArmR: -0.22,
          elbowR: 1.55,
          thighL: 1.02,
          kneeL: 1.55,
          thighR: -0.58,
          kneeR: 1.05,
        };
      }

      case 'BLOCK': {
        return {
          hipDrop: 9,
          torsoLean: -0.08,
          headTilt: 0.14,
          upperArmL: 1.05,
          elbowL: 1.65,
          upperArmR: 0.88,
          elbowR: 1.75,
          thighL: 0.32,
          kneeL: 0.42,
          thighR: -0.35,
          kneeR: 0.4,
        };
      }

      case 'JAB': {
        const snap = p < 0.25 ? p / 0.25 : p < 0.65 ? 1 : 1 - (p - 0.65) / 0.35;
        if (this.weapon !== null) {
          // Weapon strike with handR (slash for sword, thrust for spear, bash for bat/hammer)
          return {
            hipDrop: 8,
            torsoLean: 0.26 * snap + 0.08,
            headTilt: -0.05,
            upperArmL: 0.35,
            elbowL: 1.45,
            upperArmR: this.weapon === 'sword' ? lerp(1.3, 0.45, snap) : lerp(0.55, Math.PI * 0.5, snap),
            elbowR: lerp(1.1, 0.05, snap),
            thighL: 0.42,
            kneeL: 0.45,
            thighR: -0.38,
            kneeR: 0.25,
          };
        }
        return {
          hipDrop: 8,
          torsoLean: 0.24 * snap + 0.1,
          headTilt: -0.05,
          upperArmL: lerp(0.65, Math.PI * 0.52, snap),
          elbowL: lerp(1.4, 0.04, snap),
          upperArmR: 0.2,
          elbowR: 1.65,
          thighL: 0.4,
          kneeL: 0.45,
          thighR: -0.38,
          kneeR: 0.25,
        };
      }

      case 'SLIDE': {
        return {
          hipDrop: 24,
          torsoLean: -0.68,
          headTilt: 0.25,
          upperArmL: -0.5,
          elbowL: 0.5,
          upperArmR: 0.7,
          elbowR: 0.85,
          thighL: 1.32,
          kneeL: 0.08,
          thighR: -0.25,
          kneeR: 1.45,
        };
      }

      case 'SUPER_PUNCH': {
        const charge = p < 0.36 ? p / 0.36 : 1;
        const punch = p < 0.36 ? 0 : clamp((p - 0.36) / 0.22, 0, 1);
        const hold = p > 0.78 ? (p - 0.78) / 0.22 : 0;
        const ext = punch * (1 - hold * 0.4);
        return {
          hipDrop: lerp(15, 7, punch),
          torsoLean: p < 0.36 ? lerp(0.1, -0.32, charge) : lerp(-0.32, 0.56, ext),
          headTilt: -0.1,
          upperArmL: lerp(0.8, -0.35, punch),
          elbowL: 1.2,
          upperArmR: p < 0.36 ? lerp(0.2, -1.05, charge) : lerp(-1.05, Math.PI * 0.53, ext),
          elbowR: p < 0.36 ? 1.55 : lerp(1.55, 0.02, ext),
          thighL: lerp(0.4, 0.65, punch),
          kneeL: 0.55,
          thighR: lerp(-0.3, -0.62, punch),
          kneeR: 0.14,
        };
      }

      case 'SWEEP_KICK': {
        const snap = p < 0.28 ? p / 0.28 : p < 0.72 ? 1 : 1 - (p - 0.72) / 0.28;
        return {
          hipDrop: lerp(12, 26, snap),
          torsoLean: lerp(0.1, -0.56, snap),
          headTilt: 0.2,
          upperArmL: -0.45,
          elbowL: 0.65,
          upperArmR: 0.65,
          elbowR: 0.9,
          thighL: -0.22,
          kneeL: 1.25,
          thighR: lerp(-0.15, Math.PI * 0.44, snap),
          kneeR: lerp(1.1, 0.04, snap),
        };
      }

      case 'SWORD_1': {
        const snap = p < 0.25 ? p / 0.25 : clamp((p - 0.25) / 0.45, 0, 1);
        return {
          hipDrop: 9,
          torsoLean: lerp(-0.08, 0.38, snap),
          headTilt: -0.05,
          upperArmL: -0.3,
          elbowL: 1.2,
          upperArmR: lerp(2.15, 0.75, snap),
          elbowR: lerp(0.75, 0.08, snap),
          thighL: 0.48,
          kneeL: 0.5,
          thighR: -0.44,
          kneeR: 0.2,
        };
      }

      case 'SWORD_2': {
        const snap = p < 0.25 ? p / 0.25 : clamp((p - 0.25) / 0.45, 0, 1);
        return {
          hipDrop: 8,
          torsoLean: lerp(0.32, -0.14, snap),
          headTilt: -0.05,
          upperArmL: 0.4,
          elbowL: 1.35,
          upperArmR: lerp(0.45, 2.25, snap),
          elbowR: lerp(0.5, 0.08, snap),
          thighL: 0.46,
          kneeL: 0.45,
          thighR: -0.4,
          kneeR: 0.22,
        };
      }

      case 'SWORD_3': {
        // Spinning horizontal cleave!
        const snap = clamp(p * 1.4, 0, 1);
        return {
          hipDrop: 10,
          torsoLean: lerp(0.15, 0.42, snap),
          headTilt: -0.08,
          upperArmL: -0.35,
          elbowL: 1.0,
          upperArmR: lerp(1.1, Math.PI * 0.54, snap),
          elbowR: 0.08,
          thighL: 0.56,
          kneeL: 0.6,
          thighR: -0.52,
          kneeR: 0.18,
        };
      }

      case 'SWORD_4': {
        // Nhóc's super-fast upward flash follow-up slash!
        const snap = clamp(p * 1.9, 0, 1);
        return {
          hipDrop: 7,
          torsoLean: lerp(0.32, -0.18, snap),
          headTilt: -0.06,
          upperArmL: 0.42,
          elbowL: 1.25,
          upperArmR: lerp(0.55, 2.38, snap),
          elbowR: lerp(0.45, 0.05, snap),
          thighL: 0.48,
          kneeL: 0.46,
          thighR: -0.44,
          kneeR: 0.22,
        };
      }

      case 'SWORD_LUNGE': {
        const thrust = clamp(p * 1.8, 0, 1);
        return {
          hipDrop: 12,
          torsoLean: lerp(0.15, 0.62, thrust),
          headTilt: -0.14,
          upperArmL: -0.55,
          elbowL: 0.8,
          upperArmR: lerp(0.45, Math.PI * 0.52, thrust),
          elbowR: lerp(0.8, 0.02, thrust),
          thighL: 0.66,
          kneeL: 0.65,
          thighR: -0.68,
          kneeR: 0.12,
        };
      }

      case 'BAT_1': {
        const snap = clamp(p * 1.7, 0, 1);
        return {
          hipDrop: 10,
          torsoLean: lerp(-0.1, 0.34, snap),
          headTilt: -0.06,
          upperArmL: lerp(0.85, 0.35, snap),
          elbowL: 1.2,
          upperArmR: lerp(1.75, 0.95, snap),
          elbowR: lerp(0.9, 0.08, snap),
          thighL: 0.46,
          kneeL: 0.48,
          thighR: -0.42,
          kneeR: 0.22,
        };
      }

      case 'BAT_2': {
        // Feint pause at 0.22..0.56, then violent upward scoop!
        if (p < 0.22) {
          const w = p / 0.22;
          return {
            hipDrop: 11,
            torsoLean: lerp(0.1, 0.28, w),
            headTilt: -0.04,
            upperArmL: 0.5,
            elbowL: 1.3,
            upperArmR: lerp(1.2, 0.45, w),
            elbowR: 0.95,
            thighL: 0.48,
            kneeL: 0.5,
            thighR: -0.44,
            kneeR: 0.25,
          };
        }
        if (p < 0.56) {
          return {
            hipDrop: 13,
            torsoLean: 0.26,
            headTilt: -0.04,
            upperArmL: 0.5,
            elbowL: 1.3,
            upperArmR: 0.42,
            elbowR: 0.95,
            thighL: 0.52,
            kneeL: 0.54,
            thighR: -0.44,
            kneeR: 0.28,
          };
        }
        const snap = clamp((p - 0.56) / 0.26, 0, 1);
        return {
          hipDrop: lerp(13, 6, snap),
          torsoLean: lerp(0.26, -0.22, snap),
          headTilt: -0.06,
          upperArmL: 0.45,
          elbowL: 1.3,
          upperArmR: lerp(0.42, 2.35, snap),
          elbowR: lerp(0.85, 0.06, snap),
          thighL: 0.5,
          kneeL: 0.44,
          thighR: -0.44,
          kneeR: 0.22,
        };
      }

      case 'BAT_3': {
        const charge = p < 0.46 ? p / 0.46 : 1;
        const swing = p < 0.46 ? 0 : clamp((p - 0.46) / 0.26, 0, 1);
        return {
          hipDrop: lerp(14, 7, swing),
          torsoLean: p < 0.46 ? lerp(0.05, -0.46, charge) : lerp(-0.46, 0.56, swing),
          headTilt: -0.1,
          upperArmL: p < 0.46 ? lerp(0.4, -0.85, charge) : lerp(-0.85, 1.45, swing),
          elbowL: lerp(1.2, 0.1, swing),
          upperArmR: p < 0.46 ? lerp(0.2, -1.35, charge) : lerp(-1.35, Math.PI * 0.56, swing),
          elbowR: lerp(1.3, 0.04, swing),
          thighL: 0.62,
          kneeL: 0.56,
          thighR: -0.58,
          kneeR: 0.16,
        };
      }

      case 'SPEAR_1': {
        const snap = p < 0.28 ? p / 0.28 : p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
        return {
          hipDrop: 14,
          torsoLean: lerp(0.05, 0.32, snap),
          headTilt: -0.05,
          upperArmL: lerp(0.6, 0.95, snap),
          elbowL: lerp(1.3, 0.5, snap),
          upperArmR: lerp(-0.1, 1.15, snap),
          elbowR: lerp(1.45, 0.05, snap),
          thighL: 0.48,
          kneeL: 0.56,
          thighR: -0.56,
          kneeR: 0.28,
        };
      }

      case 'SPEAR_2': {
        const poke = p < 0.38 ? p / 0.38 : 1;
        const back = p > 0.52 ? clamp((p - 0.52) / 0.42, 0, 1) : 0;
        const ext = poke * (1 - back * 0.75);
        return {
          hipDrop: lerp(8, 11, back),
          torsoLean: lerp(0.15, 0.42, ext) - back * 0.35,
          headTilt: -0.06,
          upperArmL: lerp(0.75, 1.22, ext),
          elbowL: lerp(1.2, 0.35, ext),
          upperArmR: lerp(0.1, Math.PI * 0.56, ext),
          elbowR: lerp(1.35, 0.04, ext),
          thighL: 0.54,
          kneeL: 0.5,
          thighR: -0.52,
          kneeR: 0.2,
        };
      }

      case 'SPEAR_3': {
        const prep = p < 0.26 ? p / 0.26 : 1;
        const thrust = p < 0.26 ? 0 : clamp((p - 0.26) / 0.32, 0, 1);
        return {
          hipDrop: lerp(6, 13, thrust),
          torsoLean: p < 0.26 ? lerp(0.1, -0.22, prep) : lerp(-0.22, 0.58, thrust),
          headTilt: -0.1,
          upperArmL: p < 0.26 ? 0.5 : lerp(0.5, 1.38, thrust),
          elbowL: lerp(1.3, 0.18, thrust),
          upperArmR: p < 0.26 ? lerp(0.2, -0.65, prep) : lerp(-0.65, Math.PI * 0.52, thrust),
          elbowR: lerp(1.4, 0.02, thrust),
          thighL: 0.66,
          kneeL: 0.62,
          thighR: -0.66,
          kneeR: 0.14,
        };
      }

      case 'SPEAR_BUTT': {
        const snap = p < 0.32 ? p / 0.32 : clamp(1 - (p - 0.32) / 0.68, 0, 1);
        return {
          hipDrop: 10,
          torsoLean: lerp(-0.1, 0.28, snap),
          headTilt: -0.05,
          upperArmL: lerp(0.5, 1.32, snap),
          elbowL: lerp(1.2, 0.25, snap),
          upperArmR: lerp(0.2, 1.38, snap),
          elbowR: lerp(1.2, 0.18, snap),
          thighL: 0.45,
          kneeL: 0.5,
          thighR: -0.45,
          kneeR: 0.25,
        };
      }

      case 'HAMMER_1': {
        const snap = p < 0.32 ? p / 0.32 : clamp(1 - (p - 0.32) / 0.68, 0, 1);
        return {
          hipDrop: 10,
          torsoLean: lerp(0.05, 0.34, snap),
          headTilt: -0.05,
          upperArmL: lerp(0.5, 1.28, snap),
          elbowL: lerp(1.2, 0.35, snap),
          upperArmR: lerp(0.35, 1.38, snap),
          elbowR: lerp(1.15, 0.2, snap),
          thighL: 0.45,
          kneeL: 0.5,
          thighR: -0.4,
          kneeR: 0.25,
        };
      }

      case 'HAMMER_2': {
        return {
          hipDrop: 11,
          torsoLean: 0.32,
          headTilt: -0.08,
          upperArmL: 1.35,
          elbowL: 0.2,
          upperArmR: 1.48,
          elbowR: 0.08,
          thighL: 0.56,
          kneeL: 0.56,
          thighR: -0.52,
          kneeR: 0.2,
        };
      }

      case 'HAMMER_3': {
        const up = p < 0.34 ? p / 0.34 : 1;
        const slam = p < 0.34 ? 0 : clamp((p - 0.34) / 0.22, 0, 1);
        const recov = p > 0.62 ? (p - 0.62) / 0.38 : 0;
        const armAng =
          p < 0.34
            ? lerp(0.7, Math.PI * 0.99, up)
            : lerp(Math.PI * 0.99, Math.PI * 0.28, slam) + recov * 0.2;
        const elb = lerp(0.75, 0.08, slam);
        return {
          hipDrop: p < 0.34 ? lerp(6, -5, up) : lerp(-5, 18, slam),
          torsoLean: p < 0.34 ? lerp(0, -0.32, up) : lerp(-0.32, 0.62, slam) - recov * 0.22,
          headTilt: -0.1,
          upperArmL: armAng - 0.12,
          elbowL: elb + 0.08,
          upperArmR: armAng,
          elbowR: elb,
          thighL: 0.62,
          kneeL: 0.66,
          thighR: -0.58,
          kneeR: 0.16,
        };
      }

      case 'PINNED': {
        const shiver = Math.sin(t * 42) * 0.04;
        return {
          hipDrop: 11,
          torsoLean: -0.22 + shiver,
          headTilt: -0.25,
          upperArmL: 0.95 + shiver,
          elbowL: 1.1,
          upperArmR: -0.45 - shiver,
          elbowR: 0.95,
          thighL: 0.38,
          kneeL: 0.48,
          thighR: -0.38,
          kneeR: 0.35,
        };
      }

      case 'SLIP': {
        const flail = Math.sin(t * 28) * 0.35;
        const kickLift = p < 0.25 ? p / 0.25 : 1;
        return {
          hipDrop: lerp(14, 34, kickLift),
          torsoLean: lerp(-0.2, -Math.PI * 0.42, kickLift),
          headTilt: -0.22,
          upperArmL: 1.95 + flail,
          elbowL: 0.35,
          upperArmR: -1.15 - flail,
          elbowR: 0.4,
          thighL: lerp(0.4, Math.PI * 0.68, kickLift) + flail * 0.25,
          kneeL: 0.22,
          thighR: lerp(0.2, Math.PI * 0.56, kickLift) - flail * 0.25,
          kneeR: 0.34,
        };
      }

      case 'SHIELD_THROW': {
        const wind = p < 0.34 ? p / 0.34 : 1;
        const whip = p < 0.34 ? 0 : clamp((p - 0.34) / 0.32, 0, 1);
        return {
          hipDrop: 9,
          torsoLean: p < 0.34 ? lerp(0.05, -0.28, wind) : lerp(-0.28, 0.42, whip),
          headTilt: -0.06,
          upperArmL: p < 0.34 ? lerp(0.7, -0.95, wind) : lerp(-0.95, Math.PI * 0.54, whip),
          elbowL: p < 0.34 ? 1.25 : lerp(1.25, 0.06, whip),
          upperArmR: 0.25,
          elbowR: 1.45,
          thighL: 0.48,
          kneeL: 0.5,
          thighR: -0.45,
          kneeR: 0.22,
        };
      }

      case 'CROSS': {
        if (this.weapon === 'hammer') {
          // 2-handed sledgehammer lift & downward slam!
          const up = p < 0.38 ? p / 0.38 : 1;
          const slam = p < 0.38 ? 0 : clamp((p - 0.38) / 0.32, 0, 1);
          const recover = p > 0.78 ? (p - 0.78) / 0.22 : 0;
          const armAngle =
            p < 0.38 ? lerp(0.4, Math.PI * 0.96, up) : lerp(Math.PI * 0.96, Math.PI * 0.34, slam);
          const elb = lerp(0.85, 0.12, slam);
          return {
            hipDrop: lerp(6, 15, slam) * (1 - recover) + 7 * recover,
            torsoLean: lerp(-0.22, 0.52, slam),
            headTilt: -0.1,
            upperArmL: armAngle - 0.12,
            elbowL: elb + 0.1,
            upperArmR: armAngle,
            elbowR: elb,
            thighL: 0.56,
            kneeL: 0.6,
            thighR: -0.52,
            kneeR: 0.18,
          };
        }

        if (this.weapon === 'bat') {
          const snap = p < 0.32 ? p / 0.32 : p < 0.72 ? 1 : 1 - (p - 0.72) / 0.28;
          return {
            hipDrop: 10,
            torsoLean: lerp(-0.25, 0.46, snap),
            headTilt: -0.1,
            upperArmL: 0.2,
            elbowL: 1.4,
            upperArmR: lerp(-0.85, Math.PI * 0.62, snap),
            elbowR: lerp(1.1, 0.06, snap),
            thighL: 0.54,
            kneeL: 0.55,
            thighR: -0.52,
            kneeR: 0.16,
          };
        }

        const snap = p < 0.32 ? p / 0.32 : p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
        return {
          hipDrop: 10,
          torsoLean: lerp(-0.1, 0.44, snap),
          headTilt: -0.1,
          upperArmL: -0.2,
          elbowL: 1.3,
          upperArmR: lerp(-0.35, Math.PI * 0.54, snap),
          elbowR: lerp(1.5, 0.03, snap),
          thighL: 0.52,
          kneeL: 0.55,
          thighR: -0.5,
          kneeR: 0.16,
        };
      }

      case 'UPPERCUT': {
        const snap = p < 0.32 ? p / 0.32 : p < 0.74 ? 1 : 1 - (p - 0.74) / 0.26;
        return {
          hipDrop: lerp(14, 2, snap),
          torsoLean: lerp(0.32, -0.18, snap),
          headTilt: -0.15,
          upperArmL: 0.3,
          elbowL: 1.5,
          upperArmR: lerp(-0.2, Math.PI * 0.92, snap),
          elbowR: lerp(1.4, 0.35, snap),
          thighL: 0.45,
          kneeL: 0.45,
          thighR: -0.35,
          kneeR: 0.3,
        };
      }

      case 'KICK': {
        const snap = p < 0.3 ? p / 0.3 : p < 0.68 ? 1 : 1 - (p - 0.68) / 0.32;
        return {
          hipDrop: 5,
          torsoLean: lerp(0.1, -0.34, snap),
          headTilt: 0.15,
          upperArmL: 0.6,
          elbowL: 1.3,
          upperArmR: -0.3,
          elbowR: 1.1,
          thighL: -0.06,
          kneeL: 0.12,
          thighR: lerp(-0.2, Math.PI * 0.56, snap),
          kneeR: lerp(1.3, 0.04, snap),
        };
      }

      case 'ROUNDHOUSE': {
        const snap = p < 0.35 ? p / 0.35 : p < 0.72 ? 1 : 1 - (p - 0.72) / 0.28;
        return {
          hipDrop: 6,
          torsoLean: lerp(0.15, -0.52, snap),
          headTilt: 0.22,
          upperArmL: 0.9,
          elbowL: 1.1,
          upperArmR: -0.5,
          elbowR: 0.8,
          thighL: -0.12,
          kneeL: 0.1,
          thighR: lerp(-0.3, Math.PI * 0.66, snap),
          kneeR: lerp(1.45, 0.03, snap),
        };
      }

      case 'JUMP_KICK': {
        const snap = clamp(p * 2.2, 0, 1);
        return {
          hipDrop: -4,
          torsoLean: lerp(0.2, -0.46, snap),
          headTilt: 0.18,
          upperArmL: 0.95,
          elbowL: 0.85,
          upperArmR: -0.6,
          elbowR: 0.7,
          thighL: 0.85,
          kneeL: 1.45,
          thighR: lerp(0.2, Math.PI * 0.54, snap),
          kneeR: lerp(1.1, 0.04, snap),
        };
      }

      case 'HURT': {
        if (this.characterId === 'nhoc') {
          // Exaggerated rubbery vertical squash & bounce
          const bounceDrop = p < 0.42 ? lerp(16, 4, p / 0.42) : lerp(4, -5, (p - 0.42) / 0.58);
          return {
            hipDrop: bounceDrop,
            torsoLean: -0.55,
            headTilt: -0.42,
            upperArmL: -0.6,
            elbowL: 0.45,
            upperArmR: -0.75,
            elbowR: 0.4,
            thighL: 0.35,
            kneeL: 0.55,
            thighR: -0.42,
            kneeR: 0.45,
          };
        }
        if (this.characterId === 'caokieu') {
          // Bamboo-in-wind bend backward then two rebounds!
          const wobble = -0.62 * Math.sin(p * Math.PI * 2.5) * (1 - p * 0.45);
          return {
            hipDrop: 4,
            torsoLean: wobble - 0.25,
            headTilt: wobble * 0.6,
            upperArmL: -0.45 + wobble,
            elbowL: 0.4,
            upperArmR: -0.65 + wobble,
            elbowR: 0.35,
            thighL: 0.25,
            kneeL: 0.25,
            thighR: -0.35,
            kneeR: 0.22,
          };
        }
        if (this.characterId === 'lonsat') {
          return {
            hipDrop: 6,
            torsoLean: -0.26,
            headTilt: -0.16,
            upperArmL: 0.42,
            elbowL: 1.25,
            upperArmR: -0.15,
            elbowR: 1.2,
            thighL: 0.24,
            kneeL: 0.28,
            thighR: -0.28,
            kneeR: 0.26,
          };
        }
        if (this.characterId === 'hebongbay') {
          const squash = Math.sin(p * Math.PI);
          return {
            hipDrop: 11 - squash * 4,
            torsoLean: -0.52,
            headTilt: -0.38,
            upperArmL: -0.55,
            elbowL: 0.4,
            upperArmR: -0.78,
            elbowR: 0.4,
            thighL: 0.42,
            kneeL: 0.55,
            thighR: -0.45,
            kneeR: 0.45,
          };
        }
        return {
          hipDrop: 6,
          torsoLean: -0.45,
          headTilt: -0.35,
          upperArmL: -0.4,
          elbowL: 0.5,
          upperArmR: -0.6,
          elbowR: 0.4,
          thighL: 0.25,
          kneeL: 0.35,
          thighR: -0.35,
          kneeR: 0.3,
        };
      }

      case 'VENT_WARN': {
        const rattle = Math.sin(p * Math.PI * 10) * 0.08;
        return {
          hipDrop: 10,
          torsoLean: -0.08 + rattle,
          headTilt: -0.14,
          upperArmL: 1.65,
          elbowL: 0.25,
          upperArmR: -1.55,
          elbowR: 0.25,
          thighL: 0.42,
          kneeL: 0.44,
          thighR: -0.38,
          kneeR: 0.42,
        };
      }

      case 'TAKEOFF_WARN': {
        const tremble = Math.sin(p * Math.PI * 14) * 0.07;
        return {
          hipDrop: 14,
          torsoLean: 0.12 + tremble,
          headTilt: -0.18,
          upperArmL: -0.78,
          elbowL: 0.38,
          upperArmR: -0.95,
          elbowR: 0.34,
          thighL: 0.48,
          kneeL: 0.56,
          thighR: -0.44,
          kneeR: 0.52,
        };
      }

      case 'TAKEOFF_FLIGHT': {
        const sway = Math.sin(t * 5.2) * 0.1;
        return {
          hipDrop: 0,
          torsoLean: 0.08 + clamp(this.vx * 0.0005 * this.facing, -0.14, 0.14),
          headTilt: 0.06,
          upperArmL: 0.55 + sway * 0.5,
          elbowL: 0.65,
          upperArmR: -0.48 - sway * 0.5,
          elbowR: 0.55,
          thighL: 0.14 + sway,
          kneeL: 0.34,
          thighR: -0.14 - sway,
          kneeR: 0.38,
        };
      }

      case 'TAKEOFF_LAND_STUCK': {
        if (!this.takeoffDiveComplete) {
          return {
            hipDrop: 8,
            torsoLean: 0.35,
            headTilt: 0.18,
            upperArmL: 1.25,
            elbowL: 0.5,
            upperArmR: -0.85,
            elbowR: 0.45,
            thighL: 0.62,
            kneeL: 1.15,
            thighR: -0.25,
            kneeR: 1.05,
          };
        }
        return {
          hipDrop: 24,
          torsoLean: 0.38,
          headTilt: 0.22,
          upperArmL: 0.88,
          elbowL: 0.55,
          upperArmR: -0.65,
          elbowR: 0.48,
          thighL: 0.78,
          kneeL: 1.35,
          thighR: -0.48,
          kneeR: 1.22,
        };
      }

      case 'KNOCKDOWN': {
        const tumble = clamp(p * 1.4, 0, 1);
        return {
          hipDrop: lerp(6, 36, tumble),
          torsoLean: lerp(-0.65, -Math.PI * 0.48, tumble),
          headTilt: -0.2,
          upperArmL: lerp(-0.5, -1.2, tumble),
          elbowL: 0.4,
          upperArmR: lerp(-0.8, -1.6, tumble),
          elbowR: 0.3,
          thighL: lerp(0.4, -Math.PI * 0.35, tumble),
          kneeL: 0.35,
          thighR: lerp(-0.3, -Math.PI * 0.45, tumble),
          kneeR: 0.25,
        };
      }

      case 'GETUP': {
        return {
          hipDrop: lerp(28, 7, p),
          torsoLean: lerp(-0.7, 0.25, p),
          headTilt: 0.1,
          upperArmL: 0.7,
          elbowL: 0.7,
          upperArmR: 0.5,
          elbowR: 0.9,
          thighL: 0.55,
          kneeL: 0.95,
          thighR: -0.25,
          kneeR: 0.8,
        };
      }

      case 'KO': {
        return {
          hipDrop: 40,
          torsoLean: -Math.PI * 0.49,
          headTilt: -0.1,
          upperArmL: -1.35,
          elbowL: 0.35,
          upperArmR: -1.75,
          elbowR: 0.25,
          thighL: -Math.PI * 0.42,
          kneeL: 0.22,
          thighR: -Math.PI * 0.47,
          kneeR: 0.15,
        };
      }

      case 'VICTORY': {
        const pump = Math.sin(t * 6) * 0.18;
        return {
          hipDrop: 2 + Math.abs(Math.sin(t * 5)) * 3,
          torsoLean: -0.05,
          headTilt: -0.1,
          upperArmL: Math.PI * 0.88 + pump,
          elbowL: 0.28,
          upperArmR: -0.25,
          elbowR: 0.5,
          thighL: 0.22,
          kneeL: 0.15,
          thighR: -0.22,
          kneeR: 0.15,
        };
      }
      default:
        return { ...DEFAULT_POSE };
    }
  }

  private computeJoints(baseY: number): JointPositions {
    const s = this.scale;
    const f = this.facing;
    const visual = this.characterDef.visual;
    const reachMul = this.characterDef.limbLength * (this.isOverreaching ? 1.07 : 1);
    const thighLen = 23 * s * visual.legRatio * reachMul;
    const shinLen = 23 * s * visual.legRatio * reachMul;
    const legStandingHeight = thighLen + shinLen;
    const hipX = this.x;
    const hipY = baseY - legStandingHeight + this.pose.hipDrop * s;

    const torsoLen = 33 * s * visual.torsoRatio;
    const shoulderX = hipX + Math.sin(this.pose.torsoLean) * torsoLen * f;
    const shoulderY = hipY - Math.cos(this.pose.torsoLean) * torsoLen;

    const springBounce =
      visual.boilerLook &&
      this.y >= baseY - 2 &&
      ((this.action === 'STANCE' && Math.abs(this.vx) > 20 * s) || this.action === 'DASH')
        ? Math.abs(Math.sin(this.actionTime * 9)) * 2.8 * s
        : 0;
    const neckHeadDist =
      (visual.neckRatio > 1
        ? (8.5 * visual.neckRatio + 13 * visual.headScale) * s
        : (5 + 13) * s + (visual.faceStyle === 'nhoc' ? 4 * s : 0)) + springBounce;
    const headAngle =
      this.pose.torsoLean * (visual.neckRatio > 1 ? 0.85 : 0.65) +
      (visual.neckRatio > 1 ? 0.12 : 0) +
      this.pose.headTilt;
    const headX = shoulderX + Math.sin(headAngle) * neckHeadDist * f;
    const headY = shoulderY - Math.cos(headAngle) * neckHeadDist;

    const uArm = 20 * s * visual.armRatio * reachMul;
    const fArm = 19 * s * visual.armRatio * reachMul;

    let elbowLX = shoulderX + Math.sin(this.pose.upperArmL) * uArm * f;
    let elbowLY = shoulderY + Math.cos(this.pose.upperArmL) * uArm;
    const foreAngleL = this.pose.upperArmL + this.pose.elbowL;
    let handLX = elbowLX + Math.sin(foreAngleL) * fArm * f;
    let handLY = elbowLY + Math.cos(foreAngleL) * fArm;

    const elbowRX = shoulderX + Math.sin(this.pose.upperArmR) * uArm * f;
    const elbowRY = shoulderY + Math.cos(this.pose.upperArmR) * uArm;
    const foreAngleR = this.pose.upperArmR + this.pose.elbowR;
    const handRX = elbowRX + Math.sin(foreAngleR) * fArm * f;
    const handRY = elbowRY + Math.cos(foreAngleR) * fArm;

    // Nhóc grips the oversized sword with both hands like a short spear when no shield is held
    if (
      this.characterId === 'nhoc' &&
      this.weapon === 'sword' &&
      !this.hasShield &&
      (this.action === 'STANCE' ||
        this.action === 'IDLE_WAIT' ||
        this.action === 'SWORD_1' ||
        this.action === 'SWORD_2' ||
        this.action === 'SWORD_3' ||
        this.action === 'SWORD_4' ||
        this.action === 'SWORD_LUNGE' ||
        this.action === 'JAB' ||
        this.action === 'CROSS')
    ) {
      const vec = this.getWeaponVector();
      handLX = handRX + vec.dx * 5.2 * s;
      handLY = handRY + vec.dy * 5.2 * s;
      elbowLX = lerp(shoulderX, handLX, 0.48);
      elbowLY = lerp(shoulderY, handLY, 0.48) + 3.5 * s;
    }

    const kneeLX = hipX + Math.sin(this.pose.thighL) * thighLen * f;
    const kneeLY = hipY + Math.cos(this.pose.thighL) * thighLen;
    const shinAngleL = this.pose.thighL - this.pose.kneeL;
    const footLX = kneeLX + Math.sin(shinAngleL) * shinLen * f;
    const footLY = kneeLY + Math.cos(shinAngleL) * shinLen;

    const kneeRX = hipX + Math.sin(this.pose.thighR) * thighLen * f;
    const kneeRY = hipY + Math.cos(this.pose.thighR) * thighLen;
    const shinAngleR = this.pose.thighR - this.pose.kneeR;
    const footRX = kneeRX + Math.sin(shinAngleR) * shinLen * f;
    const footRY = kneeRY + Math.cos(shinAngleR) * shinLen;

    // Ground foot clamping when not knocked down / dragged / jumping / rolling
    if (
      !this.isDragged &&
      this.action !== 'ENTRANCE_JUMP' &&
      this.action !== 'ROLL_DODGE' &&
      this.action !== 'TAKEOFF_FLIGHT' &&
      !(this.action === 'TAKEOFF_LAND_STUCK' && !this.takeoffDiveComplete) &&
      this.action !== 'KNOCKDOWN' &&
      this.action !== 'SLIP' &&
      this.action !== 'KO' &&
      this.action !== 'JUMP_KICK' &&
      this.action !== 'DODGE_BACK' &&
      this.vy === 0
    ) {
      const lowestFoot = Math.max(footLY, footRY);
      const adjust = baseY - lowestFoot;
      if (Math.abs(adjust) > 0.2) {
        return {
          hip: { x: hipX, y: hipY + adjust },
          shoulder: { x: shoulderX, y: shoulderY + adjust },
          head: { x: headX, y: headY + adjust },
          elbowL: { x: elbowLX, y: elbowLY + adjust },
          handL: { x: handLX, y: handLY + adjust },
          elbowR: { x: elbowRX, y: elbowRY + adjust },
          handR: { x: handRX, y: handRY + adjust },
          kneeL: { x: kneeLX, y: kneeLY + adjust },
          footL: { x: footLX, y: footLY + adjust },
          kneeR: { x: kneeRX, y: kneeRY + adjust },
          footR: { x: footRX, y: footRY + adjust },
        };
      }
    }

    return {
      hip: { x: hipX, y: hipY },
      shoulder: { x: shoulderX, y: shoulderY },
      head: { x: headX, y: headY },
      elbowL: { x: elbowLX, y: elbowLY },
      handL: { x: handLX, y: handLY },
      elbowR: { x: elbowRX, y: elbowRY },
      handR: { x: handRX, y: handRY },
      kneeL: { x: kneeLX, y: kneeLY },
      footL: { x: footLX, y: footLY },
      kneeR: { x: kneeRX, y: kneeRY },
      footR: { x: footRX, y: footRY },
    };
  }

  private updateScarf(dt: number) {
    const visual = this.characterDef.visual;
    const isNeckScarf = visual.scarfStyle === 'neck';
    const isTie = visual.scarfStyle === 'tie';
    const anchorX = isTie
      ? lerp(this.joints.shoulder.x, this.joints.head.x, 0.14)
      : isNeckScarf
        ? lerp(this.joints.shoulder.x, this.joints.head.x, 0.34)
        : this.joints.head.x - this.facing * 9 * this.scale;
    const anchorY = isTie
      ? lerp(this.joints.shoulder.y, this.joints.head.y, 0.14)
      : isNeckScarf
        ? lerp(this.joints.shoulder.y, this.joints.head.y, 0.34)
        : this.joints.head.y - 3 * this.scale;
    this.scarfNodes[0] = { x: anchorX, y: anchorY };

    const segLen = (isTie ? 14.5 : isNeckScarf ? 7.8 : 9.5) * this.scale;
    const rollReady = this.rollCooldown <= 0;
    const nowSec = performance.now() * 0.001;
    for (let i = 1; i < this.scarfNodes.length; i++) {
      const prev = this.scarfNodes[i - 1];
      const curr = this.scarfNodes[i];
      if (isTie) {
        if (this.isRecoverySliding) {
          // Jerks sharply forward toward opponent during recoverySlide!
          curr.x += (this.facing * 170 * this.scale - this.vx * 0.25) * dt;
          curr.y += 14 * this.scale * dt;
        } else if (this.currentRangeZone === 'sweet') {
          // Stiff & straight horizontally toward opponent in sweet spot!
          curr.x = lerp(curr.x, anchorX + this.facing * segLen * i, clamp(dt * 16, 0, 1));
          curr.y = lerp(curr.y, anchorY + 1.2 * i * this.scale, clamp(dt * 16, 0, 1));
        } else if (this.currentRangeZone === 'dead') {
          // Tangled / whipping wildly upward & around near hand in dead zone!
          curr.x += (Math.sin(nowSec * 21 + i * 2.1) * 140 * this.scale + this.facing * 35 * this.scale) * dt;
          curr.y += (Math.cos(nowSec * 19 + i * 1.7) * 115 * this.scale - 22 * this.scale) * dt;
        } else {
          // Natural drape down to waist
          curr.x += (this.facing * 12 * this.scale - this.vx * 0.14) * dt;
          curr.y += (92 * this.scale + Math.sin(nowSec * 5 + i) * 12 * this.scale) * dt;
        }
      } else if (isNeckScarf) {
        if (rollReady) {
          // Vivid scarf streams out horizontally behind Nhóc when Roll Dodge is ready
          curr.x += (-this.facing * 75 * this.scale - this.vx * 0.2) * dt;
          curr.y += (8 * this.scale + Math.sin(performance.now() * 0.016 + i * 1.6) * 20) * dt;
        } else {
          // Cooldown active: scarf droops down limply
          curr.x += (-this.facing * 12 * this.scale - this.vx * 0.06) * dt;
          curr.y += (88 * this.scale + Math.sin(performance.now() * 0.008 + i) * 6) * dt;
        }
      } else {
        // Slight backward flutter + gravity
        curr.x += (-this.facing * 25 * this.scale - this.vx * 0.14) * dt;
        curr.y += (38 * this.scale + Math.sin(performance.now() * 0.012 + i * 1.4) * 18) * dt;
      }

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const d = Math.hypot(dx, dy) || 1;
      curr.x = prev.x + (dx / d) * segLen;
      curr.y = prev.y + (dy / d) * segLen;
    }
  }

  public draw(ctx: CanvasRenderingContext2D, floorY: number, boilTick: number, nowMs?: number) {
    const j = this.joints;
    const s = this.scale;
    const visual = this.characterDef.visual;
    const charBoilTick =
      visual.jitterFps !== 8 && nowMs !== undefined
        ? Math.floor((nowMs * visual.jitterFps) / 1000)
        : boilTick;
    const seed = this.seedBase + charBoilTick * 13.7;
    const rageLwMult = this.isEnraged ? 1.24 : 1;
    const rageRoughMult = this.isEnraged ? 1.5 : 1;
    const lw = 2.8 * this.arenaScale * this.characterDef.lineWidth * rageLwMult;
    const rough = 1.4 * visual.doubleStrokeRoughness * rageRoughMult;
    const strokePasses = visual.doublePasses;

    // 1. Scribbled pencil shadow on the ruled line
    const heightAboveFloor = Math.max(0, floorY - this.y);
    const shadowScale = clamp(1 - heightAboveFloor / 220, 0.35, 1);
    const shadowWidth = (this.action === 'KO' ? 38 : 22) * s * shadowScale;
    const shadowX = (j.hip.x + j.head.x) * 0.5;
    for (let i = -1; i <= 1; i++) {
      drawSketchLine(
        ctx,
        shadowX - shadowWidth,
        floorY + 2 + i * 1.4,
        shadowX + shadowWidth,
        floorY + 2 + i * 1.4,
        {
          color: visual.shadowAlpha > 0.3 ? '#475569' : '#64748B',
          lineWidth: (visual.shadowAlpha > 0.3 ? 1.9 : 1.3) * s,
          roughness: 1.2,
          seed: seed + 90 + i,
          passes: visual.shadowAlpha > 0.3 ? 2 : 1,
          alpha: visual.shadowAlpha * shadowScale,
        },
      );
    }

    const inkColor =
      this.hitFlash > 0
        ? '#F59E0B'
        : this.isEnraged
          ? this.side === 'left'
            ? '#1E3A8A'
            : '#7F1D1D'
          : this.color;
    const hasSpin = Math.abs(this.bodySpin) > 0.001;
    if (hasSpin) {
      const pivotX = j.hip.x;
      const pivotY = (j.hip.y + j.shoulder.y) * 0.5;
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(this.bodySpin);
      ctx.translate(-pivotX, -pivotY);
    }

    if (visual.boilerLook) {
      this.drawLonSatFigure(ctx, floorY, seed, charBoilTick, nowMs, inkColor, lw, rough, strokePasses);
      if (hasSpin) {
        ctx.restore();
      }
      return;
    }

    if (visual.clownLook) {
      this.drawHeBongBayFigure(ctx, floorY, seed, charBoilTick, nowMs, inkColor, lw, rough, strokePasses);
      if (hasSpin) {
        ctx.restore();
      }
      return;
    }

    // 2. Flowing headband tail OR Nhóc's 3-tail orange neck scarf OR Cao Kều's green status tie
    const passOffY = visual.secondPassOffsetY * s;
    const waveA = visual.waveAmp * s;

    if (visual.scarfStyle === 'tie') {
      const tieCol = visual.scarfColor ?? '#16A34A';
      const tip = this.scarfNodes[this.scarfNodes.length - 1];
      const mid = this.scarfNodes[1];
      const dirX = tip.x - this.scarfNodes[0].x;
      const dirY = tip.y - this.scarfNodes[0].y;
      const len = Math.hypot(dirX, dirY) || 1;
      const perpX = (-dirY / len) * 2.4 * s;
      const perpY = (dirX / len) * 2.4 * s;
      const tieOutline: Array<{ x: number; y: number }> = [
        this.scarfNodes[0],
        { x: mid.x + perpX, y: mid.y + perpY },
        { x: tip.x + (dirX / len) * 4 * s, y: tip.y + (dirY / len) * 4 * s },
        { x: mid.x - perpX, y: mid.y - perpY },
        this.scarfNodes[0],
      ];
      ctx.save();
      ctx.fillStyle = tieCol;
      ctx.globalAlpha = 0.24;
      ctx.beginPath();
      ctx.moveTo(tieOutline[0].x, tieOutline[0].y);
      for (let ti = 1; ti < tieOutline.length; ti++) {
        ctx.lineTo(tieOutline[ti].x, tieOutline[ti].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      drawSketchPolyline(ctx, tieOutline, {
        color: tieCol,
        lineWidth: 2.0 * this.arenaScale,
        roughness: 0.55,
        seed: seed + 51,
        passes: 1,
        alpha: 0.94,
      });
      // Tie collar knot
      drawSketchCircle(ctx, this.scarfNodes[0].x, this.scarfNodes[0].y, 2.3 * s, {
        color: tieCol,
        lineWidth: 1.8 * this.arenaScale,
        roughness: 0.4,
        seed: seed + 52,
        passes: 1,
      });
    } else if (visual.scarfStyle === 'neck') {
      const rollReady = this.rollCooldown <= 0;
      const scarfCol = rollReady ? (visual.scarfColor ?? '#F97316') : '#FDBA74';
      const scarfAlpha = rollReady ? 0.95 : 0.52;
      const tailCount = Math.max(1, visual.scarfTailLines);
      for (let tIdx = 0; tIdx < tailCount; tIdx++) {
        const fan = (tIdx - (tailCount - 1) * 0.5) * 3.8 * s;
        const tailPts = this.scarfNodes.map((pt, idx) => ({
          x: pt.x + (idx === 0 ? 0 : fan * 0.25 * idx),
          y: pt.y + (idx === 0 ? 0 : fan * (idx * 0.65)),
        }));
        drawSketchPolyline(ctx, tailPts, {
          color: scarfCol,
          lineWidth: (rollReady ? 2.3 : 1.8) * this.arenaScale * this.characterDef.lineWidth,
          roughness: 0.75,
          seed: seed + 50 + tIdx * 3.1,
          passes: 1,
          alpha: scarfAlpha,
        });
      }
      // Small scarf collar knot around neck
      const collarX = this.scarfNodes[0].x;
      const collarY = this.scarfNodes[0].y;
      drawSketchLine(
        ctx,
        collarX - 4.2 * s,
        collarY - 0.8 * s,
        collarX + 4.2 * s,
        collarY + 0.8 * s,
        {
          color: scarfCol,
          lineWidth: 3.2 * this.arenaScale * this.characterDef.lineWidth,
          roughness: 0.6,
          seed: seed + 54,
          passes: 1,
          alpha: scarfAlpha,
        },
      );
    } else {
      drawSketchPolyline(ctx, this.scarfNodes, {
        color: this.accentColor,
        lineWidth: 2.6 * this.arenaScale * this.characterDef.lineWidth * rageLwMult,
        roughness: 1.1 * rageRoughMult,
        seed: seed + 50,
        passes: 2,
        alpha: 0.85,
      });
    }

    // 3. Back arm & back leg (drawn slightly fainter for depth)
    drawSketchLine(ctx, j.hip.x, j.hip.y, j.kneeR.x, j.kneeR.y, {
      color: inkColor,
      lineWidth: lw,
      roughness: rough,
      seed: seed + 1,
      passes: strokePasses,
      alpha: 0.78,
      secondPassOffsetY: passOffY,
      waveAmp: waveA,
    });
    drawSketchLine(ctx, j.kneeR.x, j.kneeR.y, j.footR.x, j.footR.y, {
      color: inkColor,
      lineWidth: lw,
      roughness: rough,
      seed: seed + 2,
      passes: strokePasses,
      alpha: 0.78,
      secondPassOffsetY: passOffY,
      waveAmp: waveA,
    });
    drawSketchLine(ctx, j.shoulder.x, j.shoulder.y, j.elbowR.x, j.elbowR.y, {
      color: inkColor,
      lineWidth: lw * 0.92,
      roughness: rough,
      seed: seed + 3,
      passes: strokePasses,
      alpha: 0.78,
      secondPassOffsetY: passOffY,
      waveAmp: waveA,
    });
    drawSketchLine(ctx, j.elbowR.x, j.elbowR.y, j.handR.x, j.handR.y, {
      color: inkColor,
      lineWidth: lw * 0.92,
      roughness: rough,
      seed: seed + 4,
      passes: strokePasses,
      alpha: 0.78,
      secondPassOffsetY: passOffY,
      waveAmp: waveA,
    });

    // Equipped hand-drawn weapon held in handR (with per-character scale multipliers!)
    if (this.weapon) {
      const vec = this.getWeaponVector();
      const weaponDrawMult =
        this.weapon === 'sword'
          ? visual.swordDrawScale
          : this.weapon === 'bat'
            ? visual.batDrawScale
            : this.weapon === 'spear'
              ? visual.spearDrawScale
              : this.weapon === 'hammer'
                ? visual.hammerDrawScale
                : 1;
      drawHeldWeapon(
        ctx,
        this.weapon,
        j.handR.x,
        j.handR.y,
        vec.dx,
        vec.dy,
        s * weaponDrawMult,
        seed + 62,
      );
    }

    // 4. Torso + giraffe neck (when neckRatio > 1) & optional round scribbled belly loop
    drawSketchLine(ctx, j.hip.x, j.hip.y, j.shoulder.x, j.shoulder.y, {
      color: inkColor,
      lineWidth: lw * 1.08,
      roughness: rough * 1.06,
      seed: seed + 5,
      passes: strokePasses,
      alpha: 0.94,
      secondPassOffsetY: passOffY,
      waveAmp: waveA,
    });

    if (visual.neckRatio > 1) {
      const neckTopX = lerp(j.shoulder.x, j.head.x, 0.56);
      const neckTopY = lerp(j.shoulder.y, j.head.y, 0.56);
      drawSketchLine(ctx, j.shoulder.x, j.shoulder.y, neckTopX, neckTopY, {
        color: inkColor,
        lineWidth: lw * 0.95,
        roughness: rough * 0.9,
        seed: seed + 58,
        passes: strokePasses,
        alpha: 0.95,
        secondPassOffsetY: passOffY,
        waveAmp: waveA * 0.6,
      });
    }

    if (visual.bellyScale > 0) {
      const bellyX = lerp(j.hip.x, j.shoulder.x, 0.44) + this.facing * 5.2 * s;
      const bellyY = lerp(j.hip.y, j.shoulder.y, 0.44) + 1.5 * s;
      const bellyR = 12.2 * s * visual.bellyScale;
      drawSketchCircle(ctx, bellyX, bellyY, bellyR, {
        color: inkColor,
        lineWidth: lw * 0.88,
        roughness: rough * 1.12,
        seed: seed + 55,
        passes: 2,
        alpha: 0.9,
      });
    }

    // 5. Front leg & front arm
    drawSketchLine(ctx, j.hip.x, j.hip.y, j.kneeL.x, j.kneeL.y, {
      color: inkColor,
      lineWidth: lw,
      roughness: rough,
      seed: seed + 6,
      passes: strokePasses,
      alpha: 0.95,
      secondPassOffsetY: passOffY,
      waveAmp: waveA,
    });
    drawSketchLine(ctx, j.kneeL.x, j.kneeL.y, j.footL.x, j.footL.y, {
      color: inkColor,
      lineWidth: lw,
      roughness: rough,
      seed: seed + 7,
      passes: strokePasses,
      alpha: 0.95,
      secondPassOffsetY: passOffY,
      waveAmp: waveA,
    });
    drawSketchLine(ctx, j.shoulder.x, j.shoulder.y, j.elbowL.x, j.elbowL.y, {
      color: inkColor,
      lineWidth: lw * 0.94,
      roughness: rough,
      seed: seed + 8,
      passes: strokePasses,
      alpha: 0.95,
      secondPassOffsetY: passOffY,
      waveAmp: waveA,
    });
    drawSketchLine(ctx, j.elbowL.x, j.elbowL.y, j.handL.x, j.handL.y, {
      color: inkColor,
      lineWidth: lw * 0.94,
      roughness: rough,
      seed: seed + 9,
      passes: strokePasses,
      alpha: 0.95,
      secondPassOffsetY: passOffY,
      waveAmp: waveA,
    });

    // Bamboo-joint knobs on knees & elbows (for Cao Kều)
    if (visual.kneeKnobs) {
      for (const [kIdx, kp] of [j.kneeL, j.kneeR, j.elbowL, j.elbowR].entries()) {
        drawSketchCircle(ctx, kp.x, kp.y, 1.9 * s, {
          color: inkColor,
          lineWidth: lw * 0.72,
          roughness: 0.35,
          seed: seed + 250 + kIdx,
          passes: 1,
          alpha: kIdx % 2 === 1 ? 0.78 : 0.92,
        });
      }
    }

    // Pale-yellow horizontal sock stripes near ankles (for Cao Kều)
    if (visual.sockStripes > 0) {
      const sockCol = visual.sockColor ?? '#FDE047';
      for (const [legIdx, knee, foot] of [
        [0, j.kneeL, j.footL] as const,
        [1, j.kneeR, j.footR] as const,
      ]) {
        const dx = foot.x - knee.x;
        const dy = foot.y - knee.y;
        const d = Math.hypot(dx, dy) || 1;
        const nx = (-dy / d) * 3.1 * s;
        const ny = (dx / d) * 3.1 * s;
        for (let st = 0; st < visual.sockStripes; st++) {
          const tPos = 0.56 + (st / Math.max(1, visual.sockStripes - 1)) * 0.34;
          const sx = lerp(knee.x, foot.x, tPos);
          const sy = lerp(knee.y, foot.y, tPos);
          drawSketchLine(ctx, sx - nx, sy - ny, sx + nx, sy + ny, {
            color: sockCol,
            lineWidth: 2.0 * this.arenaScale,
            roughness: 0.3,
            seed: seed + 260 + legIdx * 10 + st,
            passes: 1,
            alpha: legIdx === 1 ? 0.78 : 0.95,
          });
        }
      }
    }

    // Flat horizontal feet (for Cao Kều)
    if (visual.footFlat) {
      for (const [fIdx, fp] of [j.footR, j.footL].entries()) {
        drawSketchLine(
          ctx,
          fp.x - this.facing * 1.5 * s,
          fp.y,
          fp.x + this.facing * 7.2 * s,
          fp.y,
          {
            color: inkColor,
            lineWidth: lw * 0.95,
            roughness: 0.45,
            seed: seed + 280 + fIdx,
            passes: 1,
            alpha: fIdx === 0 ? 0.78 : 0.95,
          },
        );
      }
    }

    // Oversized sneakers with dark dense pencil spiral scribbles (for Nhóc)
    if (visual.shoeScale > 0) {
      const shoeR = 4.6 * s * visual.shoeScale;
      const shoes = [
        { x: j.footR.x + this.facing * 2.2 * s, y: j.footR.y - 1.5 * s, alpha: 0.82, off: 210 },
        { x: j.footL.x + this.facing * 2.5 * s, y: j.footL.y - 1.5 * s, alpha: 0.96, off: 220 },
      ];
      for (const sh of shoes) {
        drawSketchCircle(ctx, sh.x, sh.y, shoeR, {
          color: inkColor,
          lineWidth: lw * 0.82,
          roughness: rough * 0.85,
          seed: seed + sh.off,
          passes: 1,
          alpha: sh.alpha,
        });
        const spiralPts: Array<{ x: number; y: number }> = [];
        for (let k = 0; k <= 8; k++) {
          const ang = k * 1.45;
          const rr = (k / 8) * shoeR * 0.78;
          spiralPts.push({
            x: sh.x + Math.cos(ang) * rr,
            y: sh.y + Math.sin(ang) * rr * 0.72,
          });
        }
        drawSketchPolyline(ctx, spiralPts, {
          color: '#1E293B',
          lineWidth: Math.max(1.2, lw * 0.65),
          roughness: 0.5,
          seed: seed + sh.off + 2,
          passes: 1,
          alpha: 0.78 * sh.alpha,
        });
      }
    }

    // Scribbled fists
    const fistR = 2.7 * this.arenaScale * visual.fistScale;
    drawSketchCircle(ctx, j.handL.x, j.handL.y, fistR, {
      color: inkColor,
      lineWidth: lw * 0.72,
      roughness: 0.6 * rageRoughMult,
      seed: seed + 10,
      passes: 1,
    });
    drawSketchCircle(ctx, j.handR.x, j.handR.y, fistR, {
      color: inkColor,
      lineWidth: lw * 0.72,
      roughness: 0.6 * rageRoughMult,
      seed: seed + 11,
      passes: 1,
    });

    // Equipped hand-drawn Shield held on front hand (handL)
    if (this.hasShield) {
      drawHeldShield(
        ctx,
        j.handL.x,
        j.handL.y,
        this.facing,
        this.action === 'SHIELD_CROUCH',
        s * visual.shieldDrawScale,
        seed + 72,
      );
    }

    // 6. Head (imperfect overlapping hand-drawn circle + features)
    const headR = 13.5 * s * visual.headScale;
    drawSketchCircle(ctx, j.head.x, j.head.y, headR, {
      color: inkColor,
      lineWidth: lw * 1.02,
      roughness: rough,
      seed: seed + 12,
      passes: strokePasses,
      alpha: 0.95,
    });

    if (visual.faceStyle === 'caokieu') {
      // Bald head with 2 thin upright hair strands swaying slower than body
      const tSecNow = (nowMs ?? performance.now()) * 0.001;
      const slowSway = Math.sin(tSecNow * 3.1 + this.seedBase) * 2.2 * s - clamp(this.vx * 0.009, -4 * s, 4 * s);
      const crownX = j.head.x;
      const crownY = j.head.y - headR * 0.92;
      drawSketchPolyline(
        ctx,
        [
          { x: crownX - 1.5 * s, y: crownY + 0.5 * s },
          { x: crownX - 2.2 * s + slowSway * 0.5, y: crownY - 6.5 * s },
          { x: crownX - 0.6 * s + slowSway, y: crownY - 12.2 * s },
        ],
        {
          color: inkColor,
          lineWidth: lw * 0.72,
          roughness: 0.45,
          seed: seed + 320,
          passes: 1,
        },
      );
      drawSketchPolyline(
        ctx,
        [
          { x: crownX + 1.8 * s, y: crownY + 0.8 * s },
          { x: crownX + 2.5 * s + slowSway * 0.4, y: crownY - 5.2 * s },
          { x: crownX + 4.2 * s + slowSway * 0.85, y: crownY - 9.8 * s },
        ],
        {
          color: inkColor,
          lineWidth: lw * 0.68,
          roughness: 0.45,
          seed: seed + 321,
          passes: 1,
        },
      );

      // Thick round glasses with live status indicators (slide down in dead zone, crack at <45% HP, glint in sweet spot, askew on hurt)
      const trackShift = this.facing * headR * 0.28;
      const isHurtFace = this.action === 'HURT' || this.action === 'PINNED' || this.action === 'KNOCKDOWN';
      const deadSlideY = this.currentRangeZone === 'dead' ? 2.6 * s : 0;
      const glassCenterX = j.head.x + trackShift;
      const glassCenterY = j.head.y - 0.5 * s + deadSlideY;
      const lensR = 3.6 * s;
      const lensOffset = 3.7 * s;

      ctx.save();
      if (isHurtFace) {
        ctx.translate(glassCenterX, glassCenterY);
        ctx.rotate(this.facing * 0.24);
        ctx.translate(-glassCenterX, -glassCenterY);
      }

      const lX = glassCenterX - lensOffset;
      const rX = glassCenterX + lensOffset;
      for (const [idx, lx] of [lX, rX].entries()) {
        drawSketchCircle(ctx, lx, glassCenterY, lensR, {
          color: '#0F172A',
          lineWidth: Math.max(1.5, lw * 0.88),
          roughness: 0.35,
          seed: seed + 325 + idx,
          passes: 1,
        });
      }
      // Nose bridge
      drawSketchLine(ctx, lX + lensR * 0.85, glassCenterY - 0.4 * s, rX - lensR * 0.85, glassCenterY - 0.4 * s, {
        color: '#0F172A',
        lineWidth: Math.max(1.3, lw * 0.72),
        roughness: 0.25,
        seed: seed + 327,
        passes: 1,
      });

      // Zigzag crack on lens when HP < 45%
      if (this.hp > 0 && this.hp < this.maxHp * 0.45) {
        drawSketchPolyline(
          ctx,
          [
            { x: rX - lensR * 0.55, y: glassCenterY - lensR * 0.65 },
            { x: rX + 0.5 * s, y: glassCenterY - 0.4 * s },
            { x: rX - 0.8 * s, y: glassCenterY + 0.9 * s },
            { x: rX + lensR * 0.5, y: glassCenterY + lensR * 0.65 },
          ],
          {
            color: '#475569',
            lineWidth: 1.0 * s,
            roughness: 0.25,
            seed: seed + 328,
            passes: 1,
          },
        );
      }

      // Pupils inside lenses looking slightly downward at opponent (or X on KO)
      if (this.action === 'KO') {
        for (const [idx, lx] of [lX, rX].entries()) {
          drawSketchLine(ctx, lx - 1.6 * s, glassCenterY - 1.6 * s, lx + 1.6 * s, glassCenterY + 1.6 * s, {
            color: inkColor,
            lineWidth: 1.3 * s,
            roughness: 0.3,
            seed: seed + 330 + idx,
            passes: 1,
          });
          drawSketchLine(ctx, lx + 1.6 * s, glassCenterY - 1.6 * s, lx - 1.6 * s, glassCenterY + 1.6 * s, {
            color: inkColor,
            lineWidth: 1.3 * s,
            roughness: 0.3,
            seed: seed + 332 + idx,
            passes: 1,
          });
        }
      } else {
        ctx.fillStyle = inkColor;
        const pOffX = this.facing * 1.15 * s;
        const pOffY = 0.85 * s;
        for (const lx of [lX, rX]) {
          ctx.beginPath();
          ctx.arc(lx + pOffX, glassCenterY + pOffY, 1.3 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Glasses glint sparkles in sweet spot OR sweat drops in dead zone!
      if (this.currentRangeZone === 'sweet' && this.hp > 0) {
        const gx = rX + lensR * 0.72;
        const gy = glassCenterY - lensR * 0.72;
        const gl = 2.8 * s;
        drawSketchLine(ctx, gx - gl, gy, gx + gl, gy, {
          color: '#0284C7',
          lineWidth: 1.2 * s,
          roughness: 0.2,
          seed: seed + 335,
          passes: 1,
        });
        drawSketchLine(ctx, gx, gy - gl, gx, gy + gl, {
          color: '#0284C7',
          lineWidth: 1.2 * s,
          roughness: 0.2,
          seed: seed + 336,
          passes: 1,
        });
      } else if (this.currentRangeZone === 'dead' && this.hp > 0) {
        const sx = j.head.x - this.facing * headR * 0.75;
        const sy = j.head.y - headR * 0.32;
        drawSketchLine(ctx, sx, sy, sx - this.facing * 1.5 * s, sy + 3.8 * s, {
          color: '#0284C7',
          lineWidth: 1.4 * s,
          roughness: 0.3,
          seed: seed + 337,
          passes: 1,
        });
      }
      ctx.restore();

      // Expressive mouth (tight straight on windup, 'o' on strike, wavy on hurt, skewed horizontal default)
      const mouthX = j.head.x + trackShift * 0.85;
      const mouthY = j.head.y + headR * 0.54;
      const inActiveStrike = this.isAttacking() && !this.isInWindupPhase() && !this.isInRecoveryPhase();
      if (inActiveStrike) {
        drawSketchCircle(ctx, mouthX, mouthY, 1.7 * s, {
          color: inkColor,
          lineWidth: 1.2 * s,
          roughness: 0.3,
          seed: seed + 340,
          passes: 1,
        });
      } else if (isHurtFace) {
        drawSketchPolyline(
          ctx,
          [
            { x: mouthX - 3.0 * s, y: mouthY - 0.6 * s },
            { x: mouthX - 1.0 * s, y: mouthY + 1.0 * s },
            { x: mouthX + 1.0 * s, y: mouthY - 0.8 * s },
            { x: mouthX + 3.0 * s, y: mouthY + 0.8 * s },
          ],
          { color: inkColor, lineWidth: 1.2 * s, roughness: 0.3, seed: seed + 341, passes: 1 },
        );
      } else if (this.isInWindupPhase()) {
        drawSketchLine(ctx, mouthX - 3.2 * s, mouthY, mouthX + 3.2 * s, mouthY, {
          color: inkColor,
          lineWidth: 1.4 * s,
          roughness: 0.2,
          seed: seed + 342,
          passes: 1,
        });
      } else {
        drawSketchLine(ctx, mouthX - 2.6 * s, mouthY + 0.3 * s, mouthX + 2.8 * s, mouthY - 0.5 * s, {
          color: inkColor,
          lineWidth: 1.25 * s,
          roughness: 0.25,
          seed: seed + 343,
          passes: 1,
        });
      }

      // Overreach ("VƯƠN TỚI") taut aura streaks on long limbs
      if (this.isOverreaching && this.hp > 0) {
        for (let oi = 0; oi < 3; oi++) {
          const ox = j.shoulder.x + (oi - 1) * 9 * s;
          const oy = j.shoulder.y - 12 * s;
          drawSketchLine(ctx, ox, oy, ox + this.facing * 12 * s, oy - 6 * s, {
            color: '#16A34A',
            lineWidth: 1.4 * s,
            roughness: 0.6,
            seed: seed + 345 + oi,
            passes: 1,
            alpha: 0.72,
          });
        }
      }
    } else if (visual.faceStyle === 'nhoc') {
      // 3 spiky hair tufts on top of head (one '?' curl), swaying with velocity & perking up on jump!
      const hairLag = clamp(-this.vx * 0.014, -7 * s, 7 * s);
      const jumpLift = this.vy < -25 || this.y < floorY - 6 * s ? 1.32 : 1;
      const topX = j.head.x;
      const topY = j.head.y - headR * 0.9;
      // Back spike
      drawSketchPolyline(
        ctx,
        [
          { x: topX - 6 * s, y: topY + 1.5 * s },
          { x: topX - 10 * s + hairLag * 0.9, y: topY - 9.5 * s * jumpLift },
          { x: topX - 3.5 * s + hairLag * 0.5, y: topY - 3 * s },
        ],
        {
          color: inkColor,
          lineWidth: lw * 0.88,
          roughness: rough * 0.85,
          seed: seed + 301,
          passes: 1,
        },
      );
      // Center '?' curl tuft
      drawSketchPolyline(
        ctx,
        [
          { x: topX - 1 * s, y: topY },
          { x: topX + 1.5 * s + hairLag * 0.6, y: topY - 12.5 * s * jumpLift },
          { x: topX + 6.5 * s + hairLag, y: topY - 11.5 * s * jumpLift },
          { x: topX + 5 * s + hairLag * 0.8, y: topY - 6.5 * s * jumpLift },
        ],
        {
          color: inkColor,
          lineWidth: lw * 0.9,
          roughness: rough * 0.85,
          seed: seed + 302,
          passes: 1,
        },
      );
      // Front short tuft
      drawSketchPolyline(
        ctx,
        [
          { x: topX + 5 * s, y: topY + 2 * s },
          { x: topX + 10.5 * s + hairLag * 0.7, y: topY - 7 * s * jumpLift },
        ],
        {
          color: inkColor,
          lineWidth: lw * 0.82,
          roughness: rough * 0.85,
          seed: seed + 303,
          passes: 1,
        },
      );

      // Pale-yellow cheek band-aid with tiny X mark
      if (visual.cheekBandage) {
        const bx = j.head.x - this.facing * headR * 0.42;
        const by = j.head.y + headR * 0.28;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(-this.facing * 0.22);
        ctx.fillStyle = '#FEF08A';
        ctx.strokeStyle = '#CA8A04';
        ctx.lineWidth = Math.max(1, 1.1 * s);
        const bw = 7.4 * s;
        const bh = 3.8 * s;
        ctx.beginPath();
        ctx.rect(-bw * 0.5, -bh * 0.5, bw, bh);
        ctx.fill();
        ctx.stroke();
        // Little X cross on bandage
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = Math.max(0.9, 0.9 * s);
        ctx.beginPath();
        ctx.moveTo(-1.3 * s, -1.1 * s);
        ctx.lineTo(1.3 * s, 1.1 * s);
        ctx.moveTo(1.3 * s, -1.1 * s);
        ctx.lineTo(-1.3 * s, 1.1 * s);
        ctx.stroke();
        ctx.restore();
      }

      // Big expressive dot eyes placed slightly low, tracking opponent horizontally
      const trackShift = this.facing * headR * 0.24;
      const eyeY = j.head.y + headR * 0.14;
      const eyeL = { x: j.head.x + trackShift - 4.4 * s, y: eyeY };
      const eyeR = { x: j.head.x + trackShift + 4.4 * s, y: eyeY };

      if (this.action === 'KO') {
        for (const [idx, ep] of [eyeL, eyeR].entries()) {
          drawSketchLine(ctx, ep.x - 2.4 * s, ep.y - 2.4 * s, ep.x + 2.4 * s, ep.y + 2.4 * s, {
            color: inkColor,
            lineWidth: 1.5 * s,
            roughness: 0.4,
            seed: seed + 15 + idx * 2,
            passes: 1,
          });
          drawSketchLine(ctx, ep.x + 2.4 * s, ep.y - 2.4 * s, ep.x - 2.4 * s, ep.y + 2.4 * s, {
            color: inkColor,
            lineWidth: 1.5 * s,
            roughness: 0.4,
            seed: seed + 16 + idx * 2,
            passes: 1,
          });
        }
      } else if (this.action === 'HURT' || this.action === 'PINNED' || this.action === 'KNOCKDOWN') {
        // Squeezed shut > < eyes!
        drawSketchPolyline(
          ctx,
          [
            { x: eyeL.x - 2.5 * s, y: eyeL.y - 2.2 * s },
            { x: eyeL.x + 1.5 * s, y: eyeL.y },
            { x: eyeL.x - 2.5 * s, y: eyeL.y + 2.2 * s },
          ],
          { color: inkColor, lineWidth: 1.6 * s, roughness: 0.4, seed: seed + 19, passes: 1 },
        );
        drawSketchPolyline(
          ctx,
          [
            { x: eyeR.x + 2.5 * s, y: eyeR.y - 2.2 * s },
            { x: eyeR.x - 1.5 * s, y: eyeR.y },
            { x: eyeR.x + 2.5 * s, y: eyeR.y + 2.2 * s },
          ],
          { color: inkColor, lineWidth: 1.6 * s, roughness: 0.4, seed: seed + 20, passes: 1 },
        );
      } else if (this.isPanicking) {
        // Swirling panic spiral eyes under 30% HP!
        const spinPhase = charBoilTick * 0.9;
        for (const [idx, ep] of [eyeL, eyeR].entries()) {
          const swirl: Array<{ x: number; y: number }> = [];
          for (let k = 0; k <= 7; k++) {
            const ang = spinPhase + k * 1.15;
            const rr = (k / 7) * 3.4 * s;
            swirl.push({ x: ep.x + Math.cos(ang) * rr, y: ep.y + Math.sin(ang) * rr });
          }
          drawSketchPolyline(ctx, swirl, {
            color: inkColor,
            lineWidth: 1.3 * s,
            roughness: 0.35,
            seed: seed + 22 + idx,
            passes: 1,
          });
        }
      } else {
        // Two big black tracking dot eyes
        ctx.save();
        ctx.fillStyle = inkColor;
        for (const ep of [eyeL, eyeR]) {
          ctx.beginPath();
          ctx.arc(ep.x, ep.y, 2.35 * s, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Expressive mouth (small 'o' during windup, zigzag when hurt, cheeky curve otherwise)
      const mouthX = j.head.x + trackShift;
      const mouthY = j.head.y + headR * 0.52;
      if (this.isInWindupPhase()) {
        drawSketchCircle(ctx, mouthX, mouthY, 2.2 * s, {
          color: inkColor,
          lineWidth: 1.3 * s,
          roughness: 0.35,
          seed: seed + 29,
          passes: 1,
        });
      } else if (this.action === 'HURT' || this.action === 'PINNED' || this.action === 'KNOCKDOWN') {
        drawSketchPolyline(
          ctx,
          [
            { x: mouthX - 4.2 * s, y: mouthY - 1 * s },
            { x: mouthX - 1.5 * s, y: mouthY + 1.6 * s },
            { x: mouthX + 1.5 * s, y: mouthY - 1.4 * s },
            { x: mouthX + 4.2 * s, y: mouthY + 1.2 * s },
          ],
          {
            color: inkColor,
            lineWidth: 1.4 * s,
            roughness: 0.4,
            seed: seed + 30,
            passes: 1,
          },
        );
      } else {
        drawSketchPolyline(
          ctx,
          [
            { x: mouthX - 3.6 * s, y: mouthY - 0.6 * s },
            { x: mouthX, y: mouthY + 1.5 * s },
            { x: mouthX + 3.8 * s, y: mouthY - 0.8 * s },
          ],
          {
            color: inkColor,
            lineWidth: 1.4 * s,
            roughness: 0.35,
            seed: seed + 31,
            passes: 1,
          },
        );
      }
    } else {
      // Colored headband across forehead (Normal & Bự Con)
      drawSketchLine(
        ctx,
        j.head.x - headR * 0.85,
        j.head.y - headR * 0.35,
        j.head.x + headR * 0.85,
        j.head.y - headR * 0.35,
        {
          color: this.accentColor,
          lineWidth: 3.1 * this.arenaScale * this.characterDef.lineWidth,
          roughness: 0.8 * rageRoughMult,
          seed: seed + 14,
          passes: 2,
          alpha: 0.9,
        },
      );

      // Bushy spiral scribble beard
      if (visual.beard) {
        const bx = j.head.x + this.facing * headR * 0.18;
        const by = j.head.y + headR * 0.78;
        drawSketchPolyline(
          ctx,
          [
            { x: bx - 8.5 * s, y: by - 2.5 * s },
            { x: bx - 4.5 * s, y: by + 5.5 * s },
            { x: bx - 1.2 * s, y: by - 0.5 * s },
            { x: bx + 2.2 * s, y: by + 6.2 * s },
            { x: bx + 5.5 * s, y: by + 0.5 * s },
            { x: bx + 8.5 * s, y: by + 4.2 * s },
          ],
          {
            color: inkColor,
            lineWidth: lw * 0.75,
            roughness: rough * 0.9,
            seed: seed + 66,
            passes: 2,
            alpha: 0.92,
          },
        );
      }

      // Rage aura scribbles when under 30% HP ("CUỒNG NỘ")
      if (this.isEnraged && this.hp > 0) {
        for (let i = 0; i < 4; i++) {
          const ang = -Math.PI * 0.85 + (Math.PI * 0.7 * i) / 3 + (charBoilTick % 3) * 0.12;
          const r1 = 18 * s;
          const r2 = 27 * s;
          drawSketchLine(
            ctx,
            j.shoulder.x + Math.cos(ang) * r1,
            j.shoulder.y + Math.sin(ang) * r1,
            j.shoulder.x + Math.cos(ang) * r2,
            j.shoulder.y + Math.sin(ang) * r2,
            {
              color: '#DC2626',
              lineWidth: 1.9 * this.arenaScale * this.characterDef.lineWidth,
              roughness: 1.4,
              seed: seed + 180 + i,
              passes: 1,
              alpha: 0.82,
            },
          );
        }
      }

      // Expressive eyes!
      const eyeOffsetX = this.facing * 4.5 * s;
      const eyeY = j.head.y + 0.5 * s;
      if (this.action === 'KO') {
        // X eyes
        const ex = j.head.x + eyeOffsetX;
        drawSketchLine(ctx, ex - 3 * s, eyeY - 3 * s, ex + 3 * s, eyeY + 3 * s, {
          color: inkColor,
          lineWidth: 1.6 * s,
          roughness: 0.5,
          seed: seed + 15,
          passes: 1,
        });
        drawSketchLine(ctx, ex + 3 * s, eyeY - 3 * s, ex - 3 * s, eyeY + 3 * s, {
          color: inkColor,
          lineWidth: 1.6 * s,
          roughness: 0.5,
          seed: seed + 16,
          passes: 1,
        });
      } else if (this.action !== 'IDLE_WAIT') {
        // Determined angry eyebrow + dot eye
        const ex = j.head.x + eyeOffsetX;
        drawSketchLine(
          ctx,
          ex - 3.5 * s * this.facing,
          eyeY - 3.5 * s,
          ex + 3.5 * s * this.facing,
          eyeY - 1.2 * s,
          {
            color: inkColor,
            lineWidth: 1.7 * s,
            roughness: 0.4,
            seed: seed + 17,
            passes: 1,
          },
        );
        ctx.save();
        ctx.fillStyle = inkColor;
        ctx.beginPath();
        ctx.arc(ex + hash1D(seed + 18) * 0.4, eyeY + 1.2 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Relaxed dot eye
        const ex = j.head.x + eyeOffsetX;
        ctx.save();
        ctx.fillStyle = inkColor;
        ctx.beginPath();
        ctx.arc(ex, eyeY, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Notice "!" doodle pop above head
    if (this.action === 'NOTICE') {
      ctx.save();
      ctx.font = `bold ${Math.round(24 * s)}px "Patrick Hand", cursive, sans-serif`;
      ctx.fillStyle = this.accentColor;
      ctx.textAlign = 'center';
      ctx.fillText('!', j.head.x, j.head.y - 22 * s);
      ctx.restore();
    }

    // Coiled pencil spiral ring around tucked body during ROLL_DODGE
    if (this.action === 'ROLL_DODGE') {
      const rcx = (j.hip.x + j.head.x) * 0.5;
      const rcy = (j.hip.y + j.head.y) * 0.5;
      const coilPts: Array<{ x: number; y: number }> = [];
      for (let k = 0; k <= 14; k++) {
        const ang = k * 0.95 + charBoilTick * 0.8;
        const rr = (8 + k * 1.45) * s;
        coilPts.push({
          x: rcx + Math.cos(ang) * rr,
          y: rcy + Math.sin(ang) * rr,
        });
      }
      drawSketchPolyline(ctx, coilPts, {
        color: visual.scarfColor ?? this.accentColor,
        lineWidth: 1.9 * s,
        roughness: 0.9,
        seed: seed + 340,
        passes: 1,
        alpha: 0.78,
      });
    }

    // Block or Shield Crouch protective doodle arc
    if (this.action === 'BLOCK' || this.action === 'SHIELD_CROUCH') {
      const isShieldCrouch = this.action === 'SHIELD_CROUCH';
      const bx = j.handL.x + this.facing * (isShieldCrouch ? 16 : 8) * s;
      const by = isShieldCrouch ? j.handL.y - 2 * s : (j.handL.y + j.handR.y) * 0.5;
      const arcHalf = (isShieldCrouch ? 22 : 16) * s;
      const arcColor = isShieldCrouch ? '#1E3A8A' : '#475569';
      drawSketchLine(ctx, bx, by - arcHalf, bx + this.facing * 5 * s, by, {
        color: arcColor,
        lineWidth: (isShieldCrouch ? 2.4 : 2) * s,
        roughness: 1.1,
        seed: seed + 25,
        passes: 2,
        alpha: isShieldCrouch ? 0.85 : 0.7,
      });
      drawSketchLine(ctx, bx + this.facing * 5 * s, by, bx, by + arcHalf, {
        color: arcColor,
        lineWidth: (isShieldCrouch ? 2.4 : 2) * s,
        roughness: 1.1,
        seed: seed + 26,
        passes: 2,
        alpha: isShieldCrouch ? 0.85 : 0.7,
      });
    }

    // Super Punch windup charge lines around cocked fist
    if (this.action === 'SUPER_PUNCH' && this.actionTime < 0.22) {
      for (let i = 0; i < 4; i++) {
        const ang = (Math.PI * 2 * i) / 4 + charBoilTick * 0.7;
        const r1 = 6 * s;
        const r2 = 14 * s;
        drawSketchLine(
          ctx,
          j.handR.x + Math.cos(ang) * r1,
          j.handR.y + Math.sin(ang) * r1,
          j.handR.x + Math.cos(ang) * r2,
          j.handR.y + Math.sin(ang) * r2,
          {
            color: '#DC2626',
            lineWidth: 1.6 * s,
            roughness: 0.7,
            seed: seed + 30 + i,
            passes: 1,
            alpha: 0.8,
          },
        );
      }
    }

    // Slow status indicator scribbles around legs
    if (this.slowTimer > 0) {
      drawSketchCircle(ctx, j.hip.x, j.footL.y - 6 * s, 14 * s, {
        color: '#0369A1',
        lineWidth: 1.4 * s,
        roughness: 1.2,
        seed: seed + 44,
        passes: 1,
        alpha: 0.55,
      });
    }

    // Dash, Slide & Dodge Back pencil speed streaks
    if (this.action === 'DASH' || this.action === 'SLIDE' || this.action === 'DODGE_BACK') {
      const streakDir = this.action === 'DODGE_BACK' ? -this.facing : this.facing;
      for (let i = 0; i < 3; i++) {
        const ly = j.shoulder.y + i * 11 * s;
        const lx = j.shoulder.x - streakDir * (12 + i * 5) * s;
        drawSketchLine(ctx, lx, ly, lx - streakDir * 20 * s, ly, {
          color: this.action === 'DODGE_BACK' ? this.accentColor : '#64748B',
          lineWidth: 1.5 * s,
          roughness: 0.8,
          seed: seed + 40 + i,
          passes: 1,
          alpha: 0.6,
        });
      }
    }

    if (this.hasTempStatus('creamPie')) {
      this.drawCreamPieSmear(ctx, j, s, seed);
    }

    if (hasSpin) {
      ctx.restore();
    }
  }

  private drawLonSatFigure(
    ctx: CanvasRenderingContext2D,
    floorY: number,
    seed: number,
    charBoilTick: number,
    nowMs: number | undefined,
    inkColor: string,
    lw: number,
    rough: number,
    strokePasses: number,
  ) {
    const j = this.joints;
    const s = this.scale;
    const f = this.facing;
    const visual = this.characterDef.visual;
    const tier = this.getBoilerTier();
    const isOverheat = tier === 'overheat';
    const isHot = tier === 'hot';
    const isWarm = tier === 'warm';
    const isTakeoffWarn = this.action === 'TAKEOFF_WARN';
    const isFlying = this.action === 'TAKEOFF_FLIGHT';
    const nowSec = (nowMs ?? performance.now()) * 0.001;

    const drawCylLimb = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      halfThick: number,
      limbSeed: number,
      alpha: number,
    ) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * halfThick;
      const ny = (dx / len) * halfThick;
      drawSketchLine(ctx, x0 - nx, y0 - ny, x1 - nx, y1 - ny, {
        color: inkColor,
        lineWidth: lw * 0.72,
        roughness: rough * 0.65,
        seed: limbSeed,
        passes: 1,
        alpha,
      });
      drawSketchLine(ctx, x0 + nx, y0 + ny, x1 + nx, y1 + ny, {
        color: inkColor,
        lineWidth: lw * 0.72,
        roughness: rough * 0.65,
        seed: limbSeed + 10,
        passes: 1,
        alpha,
      });
      // Mid rivet dot
      ctx.save();
      ctx.fillStyle = '#475569';
      ctx.globalAlpha = alpha * 0.78;
      ctx.beginPath();
      ctx.arc((x0 + x1) * 0.5, (y0 + y1) * 0.5, 1.35 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawPlierHand = (
      hx: number,
      hy: number,
      ex: number,
      ey: number,
      handSeed: number,
      alpha: number,
    ) => {
      const dx = hx - ex;
      const dy = hy - ey;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const px = -uy;
      const py = ux;
      const pinch = this.isAttacking() ? 0.58 : 0.92;
      const clawLen = 5.4 * s * visual.fistScale;
      const spread = 3.2 * s * pinch;
      drawSketchLine(ctx, hx, hy, hx + ux * clawLen + px * spread, hy + uy * clawLen + py * spread, {
        color: inkColor,
        lineWidth: lw * 0.74,
        roughness: 0.4,
        seed: handSeed,
        passes: 1,
        alpha,
      });
      drawSketchLine(ctx, hx, hy, hx + ux * clawLen - px * spread, hy + uy * clawLen - py * spread, {
        color: inkColor,
        lineWidth: lw * 0.74,
        roughness: 0.4,
        seed: handSeed + 1,
        passes: 1,
        alpha,
      });
    };

    const drawSteelFoot = (fx: number, fy: number, footSeed: number, alpha: number) => {
      drawSketchLine(ctx, fx - f * 3.5 * s, fy - 0.5 * s, fx + f * 9.5 * s, fy - 0.5 * s, {
        color: inkColor,
        lineWidth: lw * 1.05,
        roughness: 0.35,
        seed: footSeed,
        passes: 1,
        alpha,
      });
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(fx - f * 1.5 * s, fy - 2.2 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    ctx.save();
    if (isOverheat) {
      ctx.setLineDash([6 * s, 4 * s]);
    }

    // 0. Takeoff wings behind back (unused folded / unfolding / flying 4-rib paper fan / broken / crumpled / crossed-out)
    const tdx0 = j.shoulder.x - j.hip.x;
    const tdy0 = j.shoulder.y - j.hip.y;
    const tLen0 = Math.hypot(tdx0, tdy0) || 1;
    const tpx0 = -tdy0 / tLen0;
    const tpy0 = tdx0 / tLen0;
    const backSign = -f;
    const backShX = j.shoulder.x + backSign * 12 * s;
    const backShY = j.shoulder.y + 5 * s;
    const wingSpanHalf = 62 * s; // ~1.2 body heights total span across both fan wings

    if (this.wingsCrumpled) {
      drawSketchPaperFanWing(ctx, backShX, backShY, wingSpanHalf * 0.8, backSign > 0 ? 0.35 : Math.PI - 0.35, 1.05, {
        color: inkColor,
        edgeColor: '#64748B',
        lineWidth: 1.5 * s,
        seed: seed + 510,
        crumpled: true,
      });
    } else if (this.wingsBroken) {
      // Broken drooping paper fan wings with one bent & torn rib
      drawSketchPaperFanWing(
        ctx,
        backShX,
        backShY + 2 * s,
        wingSpanHalf * 0.9,
        backSign > 0 ? 0.68 : Math.PI - 0.68,
        0.95,
        {
          color: inkColor,
          edgeColor: '#0D9488',
          lineWidth: 1.65 * s,
          seed: seed + 515,
          broken: true,
          ribs: 4,
        },
      );
      drawSketchPaperFanWing(
        ctx,
        j.shoulder.x - backSign * 4 * s,
        backShY + 4 * s,
        wingSpanHalf * 0.72,
        backSign > 0 ? 0.95 : Math.PI - 0.95,
        0.82,
        {
          color: inkColor,
          edgeColor: '#0D9488',
          lineWidth: 1.45 * s,
          seed: seed + 518,
          broken: true,
          ribs: 4,
          alpha: 0.78,
        },
      );
    } else if (isTakeoffWarn || isFlying || this.takeoffState === 'landing') {
      const unfoldRatio = isTakeoffWarn
        ? clamp(this.actionTime / Math.max(0.15, this.actionDuration * 0.8), 0.25, 1)
        : 1;
      const flap = isFlying ? Math.sin(nowSec * 12) * 0.08 : 0;
      const baseAngleMain = backSign > 0 ? -0.34 + flap : Math.PI + 0.34 - flap;
      const baseAngleOpp = backSign > 0 ? -0.95 - flap : Math.PI + 0.95 + flap;
      drawSketchPaperFanWing(ctx, j.shoulder.x - backSign * 3 * s, backShY, wingSpanHalf * 0.92, baseAngleOpp, 1.02, {
        color: inkColor,
        edgeColor: '#0D9488',
        lineWidth: 1.6 * s,
        seed: seed + 522,
        ribs: 4,
        openRatio: unfoldRatio,
        alpha: 0.82,
      });
      drawSketchPaperFanWing(ctx, backShX, backShY, wingSpanHalf, baseAngleMain, 1.18, {
        color: inkColor,
        edgeColor: '#0D9488',
        lineWidth: 1.85 * s,
        seed: seed + 525,
        ribs: 4,
        openRatio: unfoldRatio,
        alpha: 0.96,
      });
    } else if (visual.foldedWings) {
      // Folded wings tight behind shoulders (3 short angled strokes per wing)
      for (let wi = 0; wi < 3; wi++) {
        drawSketchLine(
          ctx,
          backShX,
          backShY + wi * 3.8 * s,
          backShX + backSign * (10.5 - wi * 1.6) * s,
          backShY + (-5.5 + wi * 4.2) * s,
          {
            color: '#334155',
            lineWidth: 1.55 * s,
            roughness: 0.35,
            seed: seed + 530 + wi,
            passes: 1,
            alpha: 0.86,
          },
        );
      }
      if (this.wingsCrossedOut) {
        // Crossed out with a red slash once takeoff is spent
        drawSketchLine(
          ctx,
          backShX - 2 * s,
          backShY - 7 * s,
          backShX + backSign * 12 * s,
          backShY + 10 * s,
          {
            color: '#DC2626',
            lineWidth: 2.2 * s,
            roughness: 0.45,
            seed: seed + 536,
            passes: 2,
            alpha: 0.95,
          },
        );
      }
    }

    // 0b. Twin rocket pods recessed on lower back sides (unless detached on flying KO)
    if (visual.rocketPods && !this.rocketPodsDetached) {
      const podY = lerp(j.hip.y, j.shoulder.y, 0.25);
      for (const sideSign of [-1, 1] as const) {
        const podX = lerp(j.hip.x, j.shoulder.x, 0.25) + tpx0 * sideSign * 11.5 * s;
        const podYc = podY + tpy0 * sideSign * 11.5 * s;
        const podAlpha = sideSign * f < 0 ? 0.94 : 0.72;
        drawSketchCircle(ctx, podX, podYc, 3.6 * s, {
          color: inkColor,
          lineWidth: 1.35 * s,
          roughness: 0.28,
          seed: seed + 540 + sideSign,
          passes: 1,
          alpha: podAlpha,
        });
        drawSketchCircle(ctx, podX, podYc, 2.0 * s, {
          color: this.rocketPodsOpen ? '#475569' : '#0D9488',
          lineWidth: 1.15 * s,
          roughness: 0.22,
          seed: seed + 543 + sideSign,
          passes: 1,
          alpha: podAlpha,
        });

        if (this.rocketPodsOpen) {
          // Hinged open cap swinging upward
          drawSketchLine(
            ctx,
            podX - sideSign * 1.5 * s,
            podYc - 3.6 * s,
            podX + sideSign * 3.8 * s,
            podYc - 7.5 * s,
            {
              color: '#334155',
              lineWidth: 1.45 * s,
              roughness: 0.25,
              seed: seed + 546 + sideSign,
              passes: 1,
              alpha: podAlpha,
            },
          );
          // Spiraling lead-smoke trail from each open pod during takeoff warn / flight
          if (isTakeoffWarn || isFlying) {
            const smokePts: Array<{ x: number; y: number }> = [];
            for (let si = 0; si <= 5; si++) {
              const dist = si * 4.5 * s;
              const sw = Math.sin(nowSec * 14 + si * 1.2 + sideSign) * 2.8 * s;
              smokePts.push({
                x: podX - f * dist * 0.45 + sw,
                y: podYc - dist * 0.9,
              });
            }
            drawSketchPolyline(ctx, smokePts, {
              color: '#475569',
              lineWidth: 1.4 * s,
              roughness: 0.45,
              seed: seed + 550 + sideSign,
              passes: 1,
              alpha: 0.72,
            });
          }
        } else {
          // Closed pod lid line
          drawSketchLine(ctx, podX - 2.6 * s, podYc, podX + 2.6 * s, podYc, {
            color: '#334155',
            lineWidth: 1.4 * s,
            roughness: 0.2,
            seed: seed + 548 + sideSign,
            passes: 1,
            alpha: podAlpha,
          });
        }
      }
    }

    // 1. Heat shimmer waves around boiler at Warm / Hot
    if ((isWarm || isHot) && this.hp > 0 && this.action !== 'KO') {
      const waveCount = isHot ? 4 : 2;
      const waveCol = isHot ? '#F97316' : '#EAB308';
      const cxB = (j.hip.x + j.shoulder.x) * 0.5;
      const cyB = (j.hip.y + j.shoulder.y) * 0.5;
      for (let wi = 0; wi < waveCount; wi++) {
        const sideSign = wi % 2 === 0 ? -1 : 1;
        const wx = cxB + sideSign * (18 + Math.floor(wi / 2) * 5) * s;
        const wy = cyB + ((wi - waveCount * 0.5) * 6) * s;
        const shim = Math.sin(nowSec * 11 + wi * 1.9) * 2.4 * s;
        drawSketchPolyline(
          ctx,
          [
            { x: wx, y: wy + 7 * s },
            { x: wx + shim, y: wy },
            { x: wx - shim, y: wy - 7 * s },
          ],
          {
            color: waveCol,
            lineWidth: 1.5 * s,
            roughness: 0.5,
            seed: seed + 410 + wi,
            passes: 1,
            alpha: isHot ? 0.78 : 0.52,
          },
        );
      }
    }

    // 2. Back leg & back arm (cylindrical + gear joints + steel foot + pliers hand)
    drawCylLimb(j.hip.x, j.hip.y, j.kneeR.x, j.kneeR.y, 2.2 * s, seed + 1, 0.78);
    drawCylLimb(j.kneeR.x, j.kneeR.y, j.footR.x, j.footR.y, 2.0 * s, seed + 2, 0.78);
    drawSteelFoot(j.footR.x, j.footR.y, seed + 15, 0.78);
    drawSketchGear(ctx, j.kneeR.x, j.kneeR.y, 4.0 * s, 6, this.mechGearAngle, {
      color: inkColor,
      lineWidth: lw * 0.65,
      seed: seed + 16,
      alpha: 0.78,
    });

    // Spiraling orange-lead thruster flames under heels during flight!
    if (isFlying) {
      for (const [fx, fy, fIdx] of [
        [j.footR.x, j.footR.y, 0],
        [j.footL.x, j.footL.y, 1],
      ] as const) {
        const flamePts: Array<{ x: number; y: number }> = [];
        for (let fi = 0; fi <= 6; fi++) {
          const dyF = fi * 4.5 * s;
          const wig = Math.sin(nowSec * 24 + fi * 1.3 + fIdx * 2) * (2.6 + fi * 0.35) * s;
          flamePts.push({ x: fx + wig, y: fy + 2 * s + dyF });
        }
        drawSketchPolyline(ctx, flamePts, {
          color: '#F97316',
          lineWidth: 2.3 * s,
          roughness: 0.55,
          seed: seed + 560 + fIdx,
          passes: 1,
          alpha: 0.92,
        });
        drawSketchPolyline(
          ctx,
          flamePts.map((pt, idx) => ({ x: pt.x + (idx % 2 === 0 ? 1.8 : -1.8) * s, y: pt.y })),
          {
            color: '#475569',
            lineWidth: 1.35 * s,
            roughness: 0.45,
            seed: seed + 564 + fIdx,
            passes: 1,
            alpha: 0.76,
          },
        );
      }
    }

    drawCylLimb(j.shoulder.x, j.shoulder.y, j.elbowR.x, j.elbowR.y, 2.0 * s, seed + 3, 0.78);
    drawCylLimb(j.elbowR.x, j.elbowR.y, j.handR.x, j.handR.y, 1.9 * s, seed + 4, 0.78);
    drawSketchGear(ctx, j.elbowR.x, j.elbowR.y, 3.6 * s, 6, -this.mechGearAngle, {
      color: inkColor,
      lineWidth: lw * 0.62,
      seed: seed + 17,
      alpha: 0.78,
    });
    drawPlierHand(j.handR.x, j.handR.y, j.elbowR.x, j.elbowR.y, seed + 18, 0.8);

    // Held weapon in handR (giant wrench for hammer!)
    if (this.weapon) {
      const vec = this.getWeaponVector();
      const weaponDrawMult =
        this.weapon === 'sword'
          ? visual.swordDrawScale
          : this.weapon === 'bat'
            ? visual.batDrawScale
            : this.weapon === 'spear'
              ? visual.spearDrawScale
              : this.weapon === 'hammer'
                ? visual.hammerDrawScale
                : 1;
      drawHeldWeapon(
        ctx,
        this.weapon,
        j.handR.x,
        j.handR.y,
        vec.dx,
        vec.dy,
        s * weaponDrawMult,
        seed + 62,
        'lonsat',
      );
    }

    // 3. Inverted-trapezoid Boiler Torso (wide shoulders -> narrow hip)
    const tdx = j.shoulder.x - j.hip.x;
    const tdy = j.shoulder.y - j.hip.y;
    const tLen = Math.hypot(tdx, tdy) || 1;
    const tux = tdx / tLen;
    const tuy = tdy / tLen;
    const tpx = -tuy;
    const tpy = tux;
    const shHalf = 14.5 * s;
    const waHalf = 9.5 * s;

    const tl = { x: j.shoulder.x - tpx * shHalf, y: j.shoulder.y - tpy * shHalf };
    const tr = { x: j.shoulder.x + tpx * shHalf, y: j.shoulder.y + tpy * shHalf };
    const br = { x: j.hip.x + tpx * waHalf, y: j.hip.y + tpy * waHalf };
    const bl = { x: j.hip.x - tpx * waHalf, y: j.hip.y - tpy * waHalf };

    // Light steel fill wash inside boiler body
    ctx.save();
    ctx.fillStyle = isHot || isTakeoffWarn ? '#FFEDD5' : '#E2E8F0';
    ctx.globalAlpha = 0.56;
    ctx.beginPath();
    ctx.moveTo(tl.x, tl.y);
    ctx.lineTo(tr.x, tr.y);
    ctx.lineTo(br.x, br.y);
    ctx.lineTo(bl.x, bl.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Horizontal grey pencil shading lines across boiler plates
    for (let hi = 0; hi < 5; hi++) {
      const frac = 0.16 + hi * 0.17;
      const cxH = lerp(j.shoulder.x, j.hip.x, frac);
      const cyH = lerp(j.shoulder.y, j.hip.y, frac);
      const hw = lerp(shHalf, waHalf, frac) - 2 * s;
      drawSketchLine(ctx, cxH - tpx * hw, cyH - tpy * hw, cxH + tpx * hw, cyH + tpy * hw, {
        color: '#64748B',
        lineWidth: 0.95 * s,
        roughness: 0.35,
        seed: seed + 420 + hi,
        passes: 1,
        alpha: 0.45,
      });
    }

    // Outer boiler frame
    drawSketchPolyline(ctx, [tl, tr, br, bl, tl], {
      color: inkColor,
      lineWidth: lw * 0.98,
      roughness: rough * 0.7,
      seed: seed + 5,
      passes: strokePasses,
      alpha: 0.96,
    });

    // Double central weld seam
    const midX = (j.hip.x + j.shoulder.x) * 0.5;
    const midY = (j.hip.y + j.shoulder.y) * 0.5;
    const midHalf = (shHalf + waHalf) * 0.48;
    drawSketchLine(ctx, midX - tpx * midHalf, midY - tpy * midHalf, midX + tpx * midHalf, midY + tpy * midHalf, {
      color: '#334155',
      lineWidth: 1.25 * s,
      roughness: 0.25,
      seed: seed + 426,
      passes: 1,
    });
    drawSketchLine(
      ctx,
      midX - tux * 2.2 * s - tpx * midHalf,
      midY - tuy * 2.2 * s - tpy * midHalf,
      midX - tux * 2.2 * s + tpx * midHalf,
      midY - tuy * 2.2 * s + tpy * midHalf,
      {
        color: '#334155',
        lineWidth: 1.25 * s,
        roughness: 0.25,
        seed: seed + 427,
        passes: 1,
      },
    );

    // Rust spots
    ctx.save();
    ctx.fillStyle = visual.rustColor ?? '#B45309';
    ctx.globalAlpha = 0.68;
    ctx.beginPath();
    ctx.arc(j.shoulder.x - tpx * 8 * s - tux * 5 * s, j.shoulder.y - tpy * 8 * s - tuy * 5 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.arc(j.hip.x + tpx * 6 * s + tux * 6 * s, j.hip.y + tpy * 6 * s + tuy * 6 * s, 2.0 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Serial label "LS-01" on lower boiler belly
    const labelX = lerp(j.hip.x, j.shoulder.x, 0.22);
    const labelY = lerp(j.hip.y, j.shoulder.y, 0.22);
    ctx.save();
    ctx.translate(labelX, labelY);
    ctx.rotate(Math.atan2(tpy, tpx));
    ctx.font = `bold ${Math.round(7.4 * s)}px "Patrick Hand", cursive, sans-serif`;
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.fillText(visual.serialNumber ?? 'LS-01', 0, 2.5 * s);
    ctx.restore();

    // Chest pressure gauge (shows Heat 0..100, hits max scale during TAKEOFF_WARN, cracked in Overheat)
    const gaugeX = lerp(j.hip.x, j.shoulder.x, 0.72) + f * 2.2 * s;
    const gaugeY = lerp(j.hip.y, j.shoulder.y, 0.72);
    drawSketchGauge(ctx, gaugeX, gaugeY, 6.2 * s, isTakeoffWarn ? 1 : clamp(this.heat / 100, 0, 1), {
      color: inkColor,
      gaugeColor: visual.gaugeColor ?? '#0D9488',
      lineWidth: 1.45 * s,
      seed: seed + 430,
      cracked: isOverheat,
      blinkingRed:
        (this.action === 'VENT_WARN' || isTakeoffWarn) && Math.floor(nowSec * 12) % 2 === 0,
    });

    // Right-shoulder chimney pipe
    const chimBaseX = j.shoulder.x - f * 9.5 * s;
    const chimBaseY = j.shoulder.y - 1 * s;
    drawSketchPolyline(
      ctx,
      [
        { x: chimBaseX - 2.6 * s, y: chimBaseY },
        { x: chimBaseX - 2.6 * s, y: chimBaseY - 9.5 * s },
        { x: chimBaseX + 2.6 * s, y: chimBaseY - 9.5 * s },
        { x: chimBaseX + 2.6 * s, y: chimBaseY },
      ],
      {
        color: '#334155',
        lineWidth: 1.9 * s,
        roughness: 0.35,
        seed: seed + 435,
        passes: 1,
      },
    );

    // 4. Front leg & front arm + pot-lid shield
    drawCylLimb(j.hip.x, j.hip.y, j.kneeL.x, j.kneeL.y, 2.3 * s, seed + 6, 0.96);
    drawCylLimb(j.kneeL.x, j.kneeL.y, j.footL.x, j.footL.y, 2.1 * s, seed + 7, 0.96);
    drawSteelFoot(j.footL.x, j.footL.y, seed + 25, 0.96);
    drawSketchGear(ctx, j.kneeL.x, j.kneeL.y, 4.2 * s, 6, this.mechGearAngle, {
      color: inkColor,
      lineWidth: lw * 0.68,
      seed: seed + 26,
      alpha: 0.95,
    });

    drawCylLimb(j.shoulder.x, j.shoulder.y, j.elbowL.x, j.elbowL.y, 2.1 * s, seed + 8, 0.96);
    drawCylLimb(j.elbowL.x, j.elbowL.y, j.handL.x, j.handL.y, 2.0 * s, seed + 9, 0.96);
    drawSketchGear(ctx, j.elbowL.x, j.elbowL.y, 3.8 * s, 6, -this.mechGearAngle, {
      color: inkColor,
      lineWidth: lw * 0.65,
      seed: seed + 27,
      alpha: 0.95,
    });
    drawPlierHand(j.handL.x, j.handL.y, j.elbowL.x, j.elbowL.y, seed + 28, 0.96);

    if (this.hasShield) {
      drawHeldShield(
        ctx,
        j.handL.x,
        j.handL.y,
        f,
        this.action === 'SHIELD_CROUCH',
        s * visual.shieldDrawScale,
        seed + 72,
        'lonsat',
      );
    }

    // 5. Zigzag spring neck (4 coils)
    drawSketchSpring(
      ctx,
      j.shoulder.x,
      j.shoulder.y - 1.5 * s,
      j.head.x,
      j.head.y + 8.5 * s,
      4,
      6.4 * s,
      {
        color: inkColor,
        lineWidth: lw * 0.72,
        seed: seed + 440,
      },
    );

    // 6. Tin-can rectangular head + coiled antenna + cyclops lens + LED + grille mouth
    const headTiltAng = this.pose.torsoLean * 0.65 + this.pose.headTilt;
    const hw = 13.5 * s * visual.headScale;
    const hh = 10.2 * s * visual.headScale;

    ctx.save();
    ctx.translate(j.head.x, j.head.y);
    ctx.rotate(headTiltAng * f);

    // Coiled antenna on top of tin-can head (leans back against wind during flight!)
    const windLean = isFlying ? -5.5 * s : 0;
    const antLag = clamp(-this.vx * 0.014 * f + windLean, -7.5 * s, 5 * s);
    drawSketchSpring(ctx, -3 * s, -hh, -3 * s + antLag, -hh - 10.5 * s, 3, 3.5 * s, {
      color: '#334155',
      lineWidth: 1.5 * s,
      seed: seed + 445,
    });
    ctx.fillStyle = isFlying ? '#0D9488' : isHot || isTakeoffWarn ? '#F97316' : '#334155';
    ctx.beginPath();
    ctx.arc(-3 * s + antLag, -hh - 11.5 * s, 2.0 * s, 0, Math.PI * 2);
    ctx.fill();

    // Tin-can wash & boxy outline
    ctx.fillStyle = '#F1F5F9';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
    ctx.globalAlpha = 1;

    drawSketchPolyline(
      ctx,
      [
        { x: -hw, y: -hh },
        { x: hw, y: -hh },
        { x: hw, y: hh },
        { x: -hw, y: hh },
        { x: -hw, y: -hh },
      ],
      {
        color: inkColor,
        lineWidth: lw * 0.94,
        roughness: rough * 0.6,
        seed: seed + 12,
        passes: strokePasses,
      },
    );

    // Cyclops eye lens shifted slightly toward facing
    const eyeX = f * 3.0 * s;
    const eyeY = -1.2 * s;
    const eyeR = 4.6 * s;
    drawSketchCircle(ctx, eyeX, eyeY, eyeR, {
      color: inkColor,
      lineWidth: 1.6 * s,
      roughness: 0.35,
      seed: seed + 450,
      passes: 1,
    });
    if (this.action === 'KO') {
      drawSketchLine(ctx, eyeX - 2.3 * s, eyeY - 2.3 * s, eyeX + 2.3 * s, eyeY + 2.3 * s, {
        color: '#DC2626',
        lineWidth: 1.6 * s,
        roughness: 0.3,
        seed: seed + 451,
        passes: 1,
      });
      drawSketchLine(ctx, eyeX + 2.3 * s, eyeY - 2.3 * s, eyeX - 2.3 * s, eyeY + 2.3 * s, {
        color: '#DC2626',
        lineWidth: 1.6 * s,
        roughness: 0.3,
        seed: seed + 452,
        passes: 1,
      });
    } else if (this.hitFlash <= 0 || charBoilTick % 2 === 0) {
      ctx.fillStyle = isOverheat ? '#64748B' : isHot || isFlying ? '#0D9488' : '#0F172A';
      ctx.beginPath();
      ctx.arc(eyeX + f * 1.2 * s, eyeY, 2.0 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Status LED on forehead corner
    const ledX = -f * (hw * 0.55);
    const ledY = -hh * 0.55;
    let ledCol: string | null = '#0D9488';
    if (this.action === 'KO' || isOverheat) {
      ledCol = null;
    } else if (this.action === 'VENT_WARN' || isTakeoffWarn) {
      ledCol = Math.floor(nowSec * 12) % 2 === 0 ? '#DC2626' : '#FCA5A5';
    } else if (isHot) {
      ledCol = '#F97316';
    } else if (isWarm) {
      ledCol = '#EAB308';
    }
    drawSketchCircle(ctx, ledX, ledY, 2.1 * s, {
      color: '#1E293B',
      lineWidth: 1.1 * s,
      roughness: 0.25,
      seed: seed + 455,
      passes: 1,
    });
    if (ledCol) {
      ctx.fillStyle = ledCol;
      ctx.beginPath();
      ctx.arc(ledX, ledY, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4-slot speaker-grille mouth
    const mY = hh * 0.52;
    for (let gi = -1; gi <= 2; gi++) {
      const gx = f * 2.0 * s + (gi - 0.5) * 2.8 * s;
      drawSketchLine(ctx, gx, mY - 2.0 * s, gx, mY + 2.0 * s, {
        color: '#334155',
        lineWidth: 1.2 * s,
        roughness: 0.2,
        seed: seed + 460 + gi,
        passes: 1,
      });
    }
    ctx.restore();

    ctx.setLineDash([]);

    // 7. Notice "!" / Block / Shield Crouch / Vent Warn / Takeoff Warn / Slow / Speed lines
    if (this.action === 'NOTICE') {
      ctx.save();
      ctx.font = `bold ${Math.round(24 * s)}px "Patrick Hand", cursive, sans-serif`;
      ctx.fillStyle = this.accentColor;
      ctx.textAlign = 'center';
      ctx.fillText('!', j.head.x, j.head.y - 24 * s);
      ctx.restore();
    }

    if (this.action === 'VENT_WARN' || isTakeoffWarn) {
      for (let vi = 0; vi < 6; vi++) {
        const ang = (Math.PI * 2 * vi) / 6 + nowSec * 6;
        const r1 = 18 * s;
        const r2 = (isTakeoffWarn ? 32 : 27) * s;
        drawSketchLine(
          ctx,
          j.shoulder.x + Math.cos(ang) * r1,
          j.shoulder.y + Math.sin(ang) * r1,
          j.shoulder.x + Math.cos(ang) * r2,
          j.shoulder.y + Math.sin(ang) * r2,
          {
            color: isTakeoffWarn ? (vi % 2 === 0 ? '#0D9488' : '#F97316') : vi % 2 === 0 ? '#DC2626' : '#F97316',
            lineWidth: 2.0 * s,
            roughness: 0.7,
            seed: seed + 470 + vi,
            passes: 1,
            alpha: 0.88,
          },
        );
      }
    }

    if (this.action === 'BLOCK' || this.action === 'SHIELD_CROUCH') {
      const isShieldCrouch = this.action === 'SHIELD_CROUCH';
      const bx = j.handL.x + f * (isShieldCrouch ? 16 : 8) * s;
      const by = isShieldCrouch ? j.handL.y - 2 * s : (j.handL.y + j.handR.y) * 0.5;
      const arcHalf = (isShieldCrouch ? 22 : 16) * s;
      const arcColor = isShieldCrouch ? '#1E3A8A' : '#475569';
      drawSketchLine(ctx, bx, by - arcHalf, bx + f * 5 * s, by, {
        color: arcColor,
        lineWidth: (isShieldCrouch ? 2.4 : 2) * s,
        roughness: 1.1,
        seed: seed + 25,
        passes: 2,
        alpha: isShieldCrouch ? 0.85 : 0.7,
      });
      drawSketchLine(ctx, bx + f * 5 * s, by, bx, by + arcHalf, {
        color: arcColor,
        lineWidth: (isShieldCrouch ? 2.4 : 2) * s,
        roughness: 1.1,
        seed: seed + 26,
        passes: 2,
        alpha: isShieldCrouch ? 0.85 : 0.7,
      });
    }

    if (this.slowTimer > 0) {
      drawSketchCircle(ctx, j.hip.x, j.footL.y - 6 * s, 14 * s, {
        color: '#0369A1',
        lineWidth: 1.4 * s,
        roughness: 1.2,
        seed: seed + 44,
        passes: 1,
        alpha: 0.55,
      });
    }

    if (this.action === 'DASH' || this.action === 'BACKSTEP') {
      const streakDir = this.action === 'BACKSTEP' ? -f : f;
      for (let i = 0; i < 3; i++) {
        const ly = j.shoulder.y + i * 11 * s;
        const lx = j.shoulder.x - streakDir * (14 + i * 5) * s;
        drawSketchLine(ctx, lx, ly, lx - streakDir * 20 * s, ly, {
          color: '#64748B',
          lineWidth: 1.6 * s,
          roughness: 0.8,
          seed: seed + 40 + i,
          passes: 1,
          alpha: 0.6,
        });
      }
    }

    if (this.hasTempStatus('creamPie')) {
      this.drawCreamPieSmear(ctx, j, s, seed);
    }

    // Touch ground shadow parameter subtly used so TS never flags unused floorY
    void floorY;

    ctx.restore();
  }

  private drawCreamPieSmear(
    ctx: CanvasRenderingContext2D,
    j: JointPositions,
    s: number,
    seed: number,
  ) {
    const cx = j.head.x + this.facing * 2.5 * s;
    const cy = j.head.y + 1.0 * s;
    const r = 10.5 * s * this.characterDef.visual.headScale;
    ctx.save();
    // Fluffy white meringue pie cream splat over face
    ctx.fillStyle = '#FFFDF7';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.95, r * 0.72, -0.15 * this.facing, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FDE68A';
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.arc(cx + this.facing * 2 * s, cy - 2 * s, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    // Dripping cream blobs
    for (let di = -1; di <= 1; di++) {
      const dx = cx + di * 4.5 * s;
      ctx.fillStyle = '#FFFBEB';
      ctx.beginPath();
      ctx.ellipse(dx, cy + r * 0.75 + (di === 0 ? 4 : 1.5) * s, 2.2 * s, (3.8 + (di === 0 ? 2 : 0)) * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    drawSketchCircle(ctx, cx, cy, r * 0.85, {
      color: '#D97706',
      lineWidth: 1.3 * s,
      roughness: 1.5,
      seed: seed + 712,
      passes: 1,
      alpha: 0.8,
    });
  }

  private drawHeBongBayFigure(
    ctx: CanvasRenderingContext2D,
    floorY: number,
    seed: number,
    charBoilTick: number,
    nowMs: number | undefined,
    inkColor: string,
    lw: number,
    rough: number,
    strokePasses: number,
  ) {
    const j = this.joints;
    const s = this.scale;
    const f = this.facing;
    const visual = this.characterDef.visual;
    const nowSec = (nowMs ?? performance.now()) * 0.001;
    const isFinale = this.finaleState === 'active';
    const isOutOfTricks = this.finaleState === 'outOfTricks';

    // Finale rainbow confetti aura streaks
    if (isFinale && this.hp > 0) {
      const auraCols = ['#DC2626', '#F59E0B', '#7C3AED', '#2563EB'];
      for (let ai = 0; ai < 6; ai++) {
        const ang = (Math.PI * 2 * ai) / 6 + nowSec * 4.5;
        const r1 = 22 * s;
        const r2 = 32 * s;
        drawSketchLine(
          ctx,
          j.shoulder.x + Math.cos(ang) * r1,
          j.shoulder.y + Math.sin(ang) * r1,
          j.shoulder.x + Math.cos(ang) * r2,
          j.shoulder.y + Math.sin(ang) * r2,
          {
            color: auraCols[ai % auraCols.length],
            lineWidth: 2.0 * s,
            roughness: 0.9,
            seed: seed + 601 + ai,
            passes: 1,
            alpha: 0.86,
          },
        );
      }
    }

    const drawClownShoe = (foot: { x: number; y: number }, side: 'left' | 'right', shoeSeed: number, alpha: number) => {
      if (this.poppedShoeTimer > 0 && this.poppedShoeSide === side) {
        // Bare hopped sock foot while shoe briefly popped off on big hit!
        drawSketchCircle(ctx, foot.x, foot.y - 1.5 * s, 3.2 * s, {
          color: inkColor,
          lineWidth: lw * 0.72,
          roughness: 0.5,
          seed: shoeSeed,
          passes: 1,
          alpha,
        });
        return;
      }
      // Oversized curved circus shoe (~1.5x foot length, visual only; hitbox stays 1.0!)
      const shoeLen = 19 * s * Math.max(1, visual.shoeScale * 0.82);
      const pts = [
        { x: foot.x - f * 4 * s, y: foot.y },
        { x: foot.x + f * shoeLen * 0.82, y: foot.y },
        { x: foot.x + f * shoeLen, y: foot.y - 5.2 * s },
        { x: foot.x + f * shoeLen * 0.65, y: foot.y - 8.2 * s },
        { x: foot.x + f * 3 * s, y: foot.y - 5.5 * s },
        { x: foot.x - f * 4 * s, y: foot.y - 3.2 * s },
        { x: foot.x - f * 4 * s, y: foot.y },
      ];
      ctx.save();
      ctx.fillStyle = side === 'left' ? '#DC2626' : '#B91C1C';
      ctx.globalAlpha = 0.82 * alpha;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let pi = 1; pi < pts.length; pi++) ctx.lineTo(pts[pi].x, pts[pi].y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      drawSketchPolyline(ctx, pts, {
        color: inkColor,
        lineWidth: lw * 0.82,
        roughness: rough * 0.65,
        seed: shoeSeed,
        passes: 1,
        alpha,
      });
      // Gold toe highlight
      drawSketchCircle(ctx, foot.x + f * shoeLen * 0.75, foot.y - 4.5 * s, 2.2 * s, {
        color: '#F59E0B',
        lineWidth: 1.3 * s,
        roughness: 0.3,
        seed: shoeSeed + 3,
        passes: 1,
        alpha,
      });
    };

    const drawClownGlove = (hand: { x: number; y: number }, gloveSeed: number, alpha: number) => {
      const gr = 4.6 * s * visual.fistScale;
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.92 * alpha;
      ctx.beginPath();
      ctx.arc(hand.x, hand.y, gr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawSketchCircle(ctx, hand.x, hand.y, gr, {
        color: inkColor,
        lineWidth: lw * 0.75,
        roughness: 0.5,
        seed: gloveSeed,
        passes: 1,
        alpha,
      });
    };

    // 1. Back leg & back arm + oversized shoe
    drawSketchLine(ctx, j.hip.x, j.hip.y, j.kneeR.x, j.kneeR.y, {
      color: inkColor,
      lineWidth: lw,
      roughness: rough,
      seed: seed + 1,
      passes: strokePasses,
      alpha: 0.78,
    });
    drawSketchLine(ctx, j.kneeR.x, j.kneeR.y, j.footR.x, j.footR.y, {
      color: inkColor,
      lineWidth: lw,
      roughness: rough,
      seed: seed + 2,
      passes: strokePasses,
      alpha: 0.78,
    });
    drawClownShoe(j.footR, 'right', seed + 610, 0.8);

    drawSketchLine(ctx, j.shoulder.x, j.shoulder.y, j.elbowR.x, j.elbowR.y, {
      color: inkColor,
      lineWidth: lw * 0.92,
      roughness: rough,
      seed: seed + 3,
      passes: strokePasses,
      alpha: 0.78,
    });
    drawSketchLine(ctx, j.elbowR.x, j.elbowR.y, j.handR.x, j.handR.y, {
      color: inkColor,
      lineWidth: lw * 0.92,
      roughness: rough,
      seed: seed + 4,
      passes: strokePasses,
      alpha: 0.78,
    });
    drawClownGlove(j.handR, seed + 615, 0.82);

    // Held weapon in clown style!
    if (this.weapon) {
      const vec = this.getWeaponVector();
      const weaponDrawMult =
        this.weapon === 'sword'
          ? visual.swordDrawScale
          : this.weapon === 'bat'
            ? visual.batDrawScale
            : this.weapon === 'spear'
              ? visual.spearDrawScale
              : this.weapon === 'hammer'
                ? visual.hammerDrawScale
                : 1;
      drawHeldWeapon(
        ctx,
        this.weapon,
        j.handR.x,
        j.handR.y,
        vec.dx,
        vec.dy,
        s * weaponDrawMult,
        seed + 62,
        'hebongbay',
      );
    }

    // 2. Balloon-oval clown torso with ruffled collar & pocket showing next Gag Prop!
    const midX = (j.hip.x + j.shoulder.x) * 0.5;
    const midY = (j.hip.y + j.shoulder.y) * 0.5;
    const torsoAng = Math.atan2(j.shoulder.y - j.hip.y, j.shoulder.x - j.hip.x) + Math.PI * 0.5;
    const bodyRx = 11.5 * s;
    const bodyRy = 17.5 * s;

    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(torsoAng);
    // Striped clown suit tint (purple & gold polka dot)
    ctx.fillStyle = isOutOfTricks ? '#E2E8F0' : '#F3E8FF';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyRx, bodyRy, 0, 0, Math.PI * 2);
    ctx.fill();
    // Polka dots on belly
    ctx.fillStyle = this.side === 'left' ? '#2563EB' : '#DC2626';
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.arc(-4.5 * s, -5 * s, 2.1 * s, 0, Math.PI * 2);
    ctx.arc(4.8 * s, 4 * s, 2.1 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(-3.5 * s, 6.5 * s, 1.9 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Hand-drawn outline of oval clown torso
    const ovalPts: Array<{ x: number; y: number }> = [];
    for (let oi = 0; oi <= 14; oi++) {
      const a = (Math.PI * 2 * oi) / 14;
      const lx = Math.cos(a) * bodyRx;
      const ly = Math.sin(a) * bodyRy;
      ovalPts.push({
        x: midX + lx * Math.cos(torsoAng) - ly * Math.sin(torsoAng),
        y: midY + lx * Math.sin(torsoAng) + ly * Math.cos(torsoAng),
      });
    }
    drawSketchPolyline(ctx, ovalPts, {
      color: inkColor,
      lineWidth: lw * 0.98,
      roughness: rough * 0.8,
      seed: seed + 5,
      passes: strokePasses,
    });

    // Pocket badge on torso showing next Gag Prop (bananaPeel / creamPie / jackBox) or empty inside-out pocket when outOfTricks!
    const pockX = midX + f * 3.5 * s;
    const pockY = midY + 3.0 * s;
    if (isOutOfTricks) {
      // Flopped empty white inside-out pocket flap
      drawSketchPolyline(
        ctx,
        [
          { x: pockX - 5 * s, y: pockY - 2 * s },
          { x: pockX - 3.5 * s, y: pockY + 7 * s },
          { x: pockX + 4 * s, y: pockY + 6 * s },
          { x: pockX + 5 * s, y: pockY - 2 * s },
        ],
        { color: '#64748B', lineWidth: 1.3 * s, roughness: 0.4, seed: seed + 622, passes: 1 },
      );
    } else {
      const nextGag = this.getCurrentGagType();
      drawSketchCircle(ctx, pockX, pockY, 5.2 * s, {
        color: '#7C3AED',
        lineWidth: 1.2 * s,
        roughness: 0.3,
        seed: seed + 623,
        passes: 1,
      });
      if (nextGag === 'bananaPeel') {
        drawSketchPolyline(
          ctx,
          [
            { x: pockX - 3.2 * s, y: pockY - 1.2 * s },
            { x: pockX, y: pockY + 2.2 * s },
            { x: pockX + 3.2 * s, y: pockY - 1.2 * s },
          ],
          { color: '#EAB308', lineWidth: 2.2 * s, roughness: 0.25, seed: seed + 624, passes: 1 },
        );
      } else if (nextGag === 'creamPie') {
        ctx.save();
        ctx.fillStyle = '#FFFDF7';
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.1 * s;
        ctx.beginPath();
        ctx.arc(pockX, pockY + 1.2 * s, 3.0 * s, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(pockX - 2.6 * s, pockY - 2.4 * s, 5.2 * s, 4.8 * s);
        ctx.restore();
      }
    }

    // Ruffled bow-tie collar around neck
    const bowX = lerp(j.shoulder.x, j.head.x, 0.28);
    const bowY = lerp(j.shoulder.y, j.head.y, 0.28);
    drawSketchPolyline(
      ctx,
      [
        { x: bowX - 6.5 * s, y: bowY - 3.2 * s },
        { x: bowX + 6.5 * s, y: bowY + 3.2 * s },
        { x: bowX + 6.5 * s, y: bowY - 3.2 * s },
        { x: bowX - 6.5 * s, y: bowY + 3.2 * s },
        { x: bowX - 6.5 * s, y: bowY - 3.2 * s },
      ],
      {
        color: this.accentColor,
        lineWidth: 2.1 * s,
        roughness: 0.4,
        seed: seed + 626,
        passes: 1,
      },
    );

    // 3. Front leg & front arm + oversized clown shoe & waiter tray shield
    drawSketchLine(ctx, j.hip.x, j.hip.y, j.kneeL.x, j.kneeL.y, {
      color: inkColor,
      lineWidth: lw,
      roughness: rough,
      seed: seed + 6,
      passes: strokePasses,
      alpha: 0.95,
    });
    drawSketchLine(ctx, j.kneeL.x, j.kneeL.y, j.footL.x, j.footL.y, {
      color: inkColor,
      lineWidth: lw,
      roughness: rough,
      seed: seed + 7,
      passes: strokePasses,
      alpha: 0.95,
    });
    drawClownShoe(j.footL, 'left', seed + 630, 0.96);

    drawSketchLine(ctx, j.shoulder.x, j.shoulder.y, j.elbowL.x, j.elbowL.y, {
      color: inkColor,
      lineWidth: lw * 0.94,
      roughness: rough,
      seed: seed + 8,
      passes: strokePasses,
      alpha: 0.95,
    });
    drawSketchLine(ctx, j.elbowL.x, j.elbowL.y, j.handL.x, j.handL.y, {
      color: inkColor,
      lineWidth: lw * 0.94,
      roughness: rough,
      seed: seed + 9,
      passes: strokePasses,
      alpha: 0.95,
    });
    drawClownGlove(j.handL, seed + 635, 0.96);

    if (this.hasShield) {
      drawHeldShield(
        ctx,
        j.handL.x,
        j.handL.y,
        f,
        this.action === 'SHIELD_CROUCH',
        s * visual.shieldDrawScale,
        seed + 72,
        'hebongbay',
      );
    }

    // 4. Head + clown curls + cone party hat + red round nose + wide painted grin
    const headR = 13.5 * s * visual.headScale;
    ctx.save();
    ctx.fillStyle = '#FFFDF9';
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.arc(j.head.x, j.head.y, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawSketchCircle(ctx, j.head.x, j.head.y, headR, {
      color: inkColor,
      lineWidth: lw * 1.02,
      roughness: rough,
      seed: seed + 12,
      passes: strokePasses,
      alpha: 0.96,
    });

    // Curly colorful side hair tufts
    for (const dir of [-1, 1] as const) {
      const tx = j.head.x + dir * headR * 0.98;
      const ty = j.head.y - 2 * s;
      drawSketchCircle(ctx, tx, ty, 3.6 * s, {
        color: '#7C3AED',
        lineWidth: lw * 0.72,
        roughness: 1.0,
        seed: seed + 640 + dir,
        passes: 1,
      });
      drawSketchCircle(ctx, tx + dir * 1.2 * s, ty + 4 * s, 3.1 * s, {
        color: '#F59E0B',
        lineWidth: lw * 0.68,
        roughness: 1.0,
        seed: seed + 644 + dir,
        passes: 1,
      });
    }

    // Tilted party cone hat with gold pom-pom
    const hatBaseX = j.head.x - f * 1.5 * s;
    const hatBaseY = j.head.y - headR * 0.78;
    const hatTipX = hatBaseX - f * 7.5 * s;
    const hatTipY = hatBaseY - 15.5 * s;
    ctx.save();
    ctx.fillStyle = '#7C3AED';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(hatBaseX - 7 * s, hatBaseY + 1 * s);
    ctx.lineTo(hatTipX, hatTipY);
    ctx.lineTo(hatBaseX + 7 * s, hatBaseY - 1 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSketchPolyline(
      ctx,
      [
        { x: hatBaseX - 7 * s, y: hatBaseY + 1 * s },
        { x: hatTipX, y: hatTipY },
        { x: hatBaseX + 7 * s, y: hatBaseY - 1 * s },
        { x: hatBaseX - 7 * s, y: hatBaseY + 1 * s },
      ],
      { color: inkColor, lineWidth: 1.6 * s, roughness: 0.45, seed: seed + 650, passes: 1 },
    );
    ctx.save();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(hatTipX, hatTipY, 3.1 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eyes & cheek wink
    const trackShift = f * headR * 0.22;
    const eyeY = j.head.y - 2.2 * s;
    const eyeL = { x: j.head.x + trackShift - 4.2 * s, y: eyeY };
    const eyeR = { x: j.head.x + trackShift + 4.2 * s, y: eyeY };

    if (this.action === 'KO') {
      for (const [idx, ep] of [eyeL, eyeR].entries()) {
        drawSketchLine(ctx, ep.x - 2.2 * s, ep.y - 2.2 * s, ep.x + 2.2 * s, ep.y + 2.2 * s, {
          color: inkColor,
          lineWidth: 1.5 * s,
          roughness: 0.3,
          seed: seed + 655 + idx * 2,
          passes: 1,
        });
        drawSketchLine(ctx, ep.x + 2.2 * s, ep.y - 2.2 * s, ep.x - 2.2 * s, ep.y + 2.2 * s, {
          color: inkColor,
          lineWidth: 1.5 * s,
          roughness: 0.3,
          seed: seed + 656 + idx * 2,
          passes: 1,
        });
      }
    } else if (this.winkTimer > 0) {
      // Cheeky wink after pulling a gag!
      drawSketchPolyline(
        ctx,
        [
          { x: eyeL.x - 2.4 * s, y: eyeL.y + 0.8 * s },
          { x: eyeL.x, y: eyeL.y - 1.4 * s },
          { x: eyeL.x + 2.4 * s, y: eyeL.y + 0.8 * s },
        ],
        { color: inkColor, lineWidth: 1.5 * s, roughness: 0.25, seed: seed + 659, passes: 1 },
      );
      ctx.save();
      ctx.fillStyle = inkColor;
      ctx.beginPath();
      ctx.arc(eyeR.x, eyeR.y, 2.0 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = inkColor;
      for (const ep of [eyeL, eyeR]) {
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, 2.0 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Bright red clown ball nose
    const noseX = j.head.x + trackShift + f * 1.4 * s;
    const noseY = j.head.y + 1.4 * s;
    ctx.save();
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(noseX, noseY, 3.3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawSketchCircle(ctx, noseX, noseY, 3.3 * s, {
      color: '#7F1D1D',
      lineWidth: 1.1 * s,
      roughness: 0.25,
      seed: seed + 662,
      passes: 1,
    });

    // Expressive painted clown smile (or panicked 'O' when hurt/slipped/low-HP)
    const mouthX = j.head.x + trackShift;
    const mouthY = j.head.y + 6.4 * s;
    if (
      this.action === 'HURT' ||
      this.action === 'SLIP' ||
      this.action === 'KNOCKDOWN' ||
      this.action === 'PINNED' ||
      isOutOfTricks
    ) {
      drawSketchCircle(ctx, mouthX, mouthY, 2.4 * s, {
        color: '#DC2626',
        lineWidth: 1.5 * s,
        roughness: 0.35,
        seed: seed + 665,
        passes: 1,
      });
    } else {
      drawSketchPolyline(
        ctx,
        [
          { x: mouthX - 5.2 * s, y: mouthY - 1.6 * s },
          { x: mouthX - 2.2 * s, y: mouthY + 2.0 * s },
          { x: mouthX + 2.2 * s, y: mouthY + 2.0 * s },
          { x: mouthX + 5.2 * s, y: mouthY - 1.6 * s },
        ],
        {
          color: '#DC2626',
          lineWidth: 2.1 * s,
          roughness: 0.35,
          seed: seed + 666,
          passes: 1,
        },
      );
    }

    // Juggling balls orbiting hands during TAUNT or IDLE_WAIT!
    if (this.action === 'TAUNT' || this.action === 'IDLE_WAIT') {
      const ballCols = ['#DC2626', '#F59E0B', '#2563EB'];
      for (let bi = 0; bi < 3; bi++) {
        const phase = nowSec * 4.8 + (bi * Math.PI * 2) / 3;
        const bx = j.head.x + Math.cos(phase) * 20 * s;
        const by = j.shoulder.y - 26 * s - Math.abs(Math.sin(phase)) * 22 * s;
        ctx.save();
        ctx.fillStyle = ballCols[bi];
        ctx.beginPath();
        ctx.arc(bx, by, 3.6 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawSketchCircle(ctx, bx, by, 3.6 * s, {
          color: inkColor,
          lineWidth: 1.1 * s,
          roughness: 0.3,
          seed: seed + 670 + bi,
          passes: 1,
        });
      }
    }

    // Block / Shield Crouch arc
    if (this.action === 'BLOCK' || this.action === 'SHIELD_CROUCH') {
      const isShieldCrouch = this.action === 'SHIELD_CROUCH';
      const bx = j.handL.x + f * (isShieldCrouch ? 16 : 8) * s;
      const by = isShieldCrouch ? j.handL.y - 2 * s : (j.handL.y + j.handR.y) * 0.5;
      const arcHalf = (isShieldCrouch ? 22 : 16) * s;
      const arcColor = isShieldCrouch ? '#7C3AED' : '#475569';
      drawSketchLine(ctx, bx, by - arcHalf, bx + f * 5 * s, by, {
        color: arcColor,
        lineWidth: (isShieldCrouch ? 2.4 : 2) * s,
        roughness: 1.1,
        seed: seed + 25,
        passes: 2,
        alpha: 0.82,
      });
      drawSketchLine(ctx, bx + f * 5 * s, by, bx, by + arcHalf, {
        color: arcColor,
        lineWidth: (isShieldCrouch ? 2.4 : 2) * s,
        roughness: 1.1,
        seed: seed + 26,
        passes: 2,
        alpha: 0.82,
      });
    }

    // Notice "!" doodle pop above head
    if (this.action === 'NOTICE') {
      ctx.save();
      ctx.font = `bold ${Math.round(24 * s)}px "Patrick Hand", cursive, sans-serif`;
      ctx.fillStyle = this.accentColor;
      ctx.textAlign = 'center';
      ctx.fillText('!', j.head.x, j.head.y - 26 * s);
      ctx.restore();
    }

    if (this.hasTempStatus('creamPie')) {
      this.drawCreamPieSmear(ctx, j, s, seed);
    }

    if (this.action === 'DASH' || this.action === 'SLIDE' || this.action === 'BACKSTEP') {
      const streakDir = this.action === 'BACKSTEP' ? -f : f;
      for (let i = 0; i < 3; i++) {
        const ly = j.shoulder.y + i * 11 * s;
        const lx = j.shoulder.x - streakDir * (12 + i * 5) * s;
        drawSketchLine(ctx, lx, ly, lx - streakDir * 20 * s, ly, {
          color: '#7C3AED',
          lineWidth: 1.5 * s,
          roughness: 0.8,
          seed: seed + 40 + i,
          passes: 1,
          alpha: 0.6,
        });
      }
    }

    void charBoilTick;
    void floorY;
  }
}
