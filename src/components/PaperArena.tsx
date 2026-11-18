import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, Users, Volume2, VolumeX } from 'lucide-react';
import { sfx } from '../audio/sfx';
import { CharacterId } from '../engine/characters';
import { CharacterSelectOverlay } from './CharacterSelectOverlay';
import { ComboNotebook } from './ComboNotebook';
import {
  drawDoodleZone,
  drawSketchCircle,
  drawSketchHealthBar,
  drawSketchLine,
  drawSketchPolyline,
  hash1D,
  renderNotebookPaperToCanvas,
} from '../engine/sketchDraw';
import {
  ArenaTrapSnapshot,
  ComicCallout,
  FighterSide,
  MotionTrail,
  Particle,
  resolveHit,
  StickFighter,
} from '../engine/stickFigure';
import {
  createDrawnWeaponFromStroke,
  createThrownShield,
  drawFallingWeapon,
  drawHeldShield,
  drawHeldWeapon,
  drawPaperTear,
  drawPinnedSpear,
  drawThrownShield,
  DrawnWeapon,
  PaperTear,
  PinnedSpear,
  ThrownShield,
  WEAPON_LIST,
  WEAPONS,
  WeaponType,
} from '../engine/weapons';

type ArenaPhase = 'IDLE' | 'FIGHTING' | 'KO';

interface PaperCache {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  dpr: number;
  marginX: number;
  floorY: number;
  lineSpacing: number;
}

interface TrayDragState {
  type: WeaponType;
  x: number;
  y: number;
  startX: number;
  startY: number;
  moved: boolean;
}

interface DirectMissile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  isBig: boolean;
  damage: number;
  blastRadius: number;
  knockback: number;
  ownerSide: FighterSide;
  life: number;
  trail: Array<{ x: number; y: number; r: number; life: number; maxLife: number }>;
  trailEmitTimer: number;
  seed: number;
}

interface FlightTrailDot {
  x: number;
  y: number;
  r: number;
  life: number;
  maxLife: number;
  seed: number;
}

interface DetachedRocketPod {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  life: number;
  maxLife: number;
  seed: number;
}

interface BananaPeelTrap {
  id: number;
  x: number;
  y: number;
  radius: number;
  lifetime: number;
  maxLife: number;
  ownerSide: FighterSide;
  affectsOwner: boolean;
  insideLeft: boolean;
  insideRight: boolean;
  seed: number;
}

interface FlyingCreamPie {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerSide: FighterSide;
  targetSide: FighterSide;
  damage: number;
  dodged: boolean;
  seed: number;
  life: number;
}

interface JackInTheBoxTrap {
  id: number;
  x: number;
  y: number;
  fuse: number;
  maxFuse: number;
  radius: number;
  damage: number;
  ownerSide: FighterSide;
  immuneSides: FighterSide[];
  seed: number;
}

function WeaponTrayIcon({ type }: { type: WeaponType }) {
  if (type === 'sword') {
    return (
      <svg viewBox="0 0 36 36" className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 28 L13 23" strokeWidth="2.4" stroke="#475569" />
        <path d="M10 20 L16 26" strokeWidth="2.4" stroke="#92400E" />
        <path d="M14 22 L28 8 L22 14 Z" strokeWidth="1.9" stroke="#1E293B" />
        <path d="M15 21 L28 8" strokeWidth="2.1" stroke="#1E293B" />
      </svg>
    );
  }
  if (type === 'bat') {
    return (
      <svg viewBox="0 0 36 36" className="h-7 w-7" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 28 L14 22" strokeWidth="2.2" stroke="#78350F" />
        <path d="M13 21 L25 7 L29 11 L15 23 Z" strokeWidth="2.1" stroke="#78350F" />
      </svg>
    );
  }
  if (type === 'spear') {
    return (
      <svg viewBox="0 0 36 36" className="h-7 w-7" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 30 L24 12" strokeWidth="2.2" stroke="#78350F" />
        <path d="M21 10 L30 6 L26 15 Z" strokeWidth="2" stroke="#1E293B" />
        <path d="M24 12 L30 6" strokeWidth="1.6" stroke="#DC2626" />
      </svg>
    );
  }
  if (type === 'shield') {
    return (
      <svg viewBox="0 0 36 36" className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="11" strokeWidth="2.3" stroke="#1E293B" />
        <circle cx="18" cy="18" r="7" strokeWidth="1.6" stroke="#92400E" />
        <path d="M10.5 18 H25.5 M18 10.5 V25.5" strokeWidth="1.5" stroke="#78350F" />
        <circle cx="18" cy="18" r="2.2" strokeWidth="1.8" stroke="#1E293B" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 36" className="h-7 w-7" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 28 L21 16" strokeWidth="2.4" stroke="#78350F" />
      <path d="M16 11 L24 19 L29 14 L21 6 Z" strokeWidth="2.2" stroke="#1E293B" />
      <path d="M19 10 L26 15" strokeWidth="1.4" stroke="#475569" />
    </svg>
  );
}

export const PaperArena: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<ArenaPhase>('IDLE');
  const [isCharSelectOpen, setIsCharSelectOpen] = useState(false);
  const [selectingSide, setSelectingSide] = useState<FighterSide>('left');
  const [pickedCharacters, setPickedCharacters] = useState<{
    left: CharacterId;
    right: CharacterId;
  }>({ left: 'normal', right: 'normal' });
  const [sessionPicked, setSessionPicked] = useState<{
    left: boolean;
    right: boolean;
  }>({ left: false, right: false });
  const [muted, setMuted] = useState(false);
  const [hoveringFighter, setHoveringFighter] = useState(false);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [selectedTrayWeapon, setSelectedTrayWeapon] = useState<WeaponType | null>(null);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  const phaseRef = useRef<ArenaPhase>('IDLE');
  const isCharSelectOpenRef = useRef(false);
  const pickedCharactersRef = useRef<{
    left: CharacterId;
    right: CharacterId;
  }>({ left: 'normal', right: 'normal' });
  const sessionPickedRef = useRef<{
    left: boolean;
    right: boolean;
  }>({ left: false, right: false });
  const winnerRef = useRef<'left' | 'right' | null>(null);
  const paperRef = useRef<PaperCache | null>(null);
  const leftFighterRef = useRef<StickFighter | null>(null);
  const rightFighterRef = useRef<StickFighter | null>(null);
  const draggedFighterRef = useRef<StickFighter | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(performance.now());

  // Freehand weapon drawing & falling objects
  const drawingStrokeRef = useRef<Array<{ x: number; y: number }> | null>(null);
  const drawnWeaponsRef = useRef<DrawnWeapon[]>([]);
  const thrownShieldsRef = useRef<ThrownShield[]>([]);
  const paperTearsRef = useRef<PaperTear[]>([]);
  const pinnedSpearsRef = useRef<PinnedSpear[]>([]);

  // Dragging preset weapon from bottom tray
  const trayDragRef = useRef<TrayDragState | null>(null);
  const selectedTrayRef = useRef<WeaponType | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const calloutsRef = useRef<ComicCallout[]>([]);
  const trailsRef = useRef<MotionTrail[]>([]);
  const rollGhostsRef = useRef<
    Array<{ x: number; y: number; r: number; color: string; life: number; maxLife: number; seed: number }>
  >([]);
  const areaBlastsRef = useRef<
    Array<{
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      life: number;
      maxLife: number;
      color: string;
      seed: number;
    }>
  >([]);
  const directMissilesRef = useRef<DirectMissile[]>([]);
  const flightTrailDotsRef = useRef<FlightTrailDot[]>([]);
  const detachedPodsRef = useRef<DetachedRocketPod[]>([]);
  const bananaPeelsRef = useRef<BananaPeelTrap[]>([]);
  const flyingPiesRef = useRef<FlyingCreamPie[]>([]);
  const jackBoxesRef = useRef<JackInTheBoxTrap[]>([]);
  const gagIdCounterRef = useRef(1);
  const shakeRef = useRef(0);
  const hitstopRef = useRef(0);
  const autoEnterTimerRef = useRef<number | null>(null);

  useEffect(() => {
    selectedTrayRef.current = selectedTrayWeapon;
  }, [selectedTrayWeapon]);

  useEffect(() => {
    isCharSelectOpenRef.current = isCharSelectOpen;
  }, [isCharSelectOpen]);

  const getScale = (w: number, h: number) => {
    const base = Math.min(w / 920, h / 620);
    return Math.max(0.72, Math.min(1.22, base));
  };

  const getStartPositions = (w: number, marginX: number, scale: number) => {
    const leftX = Math.max(marginX + 58 * scale, w * 0.14);
    const rightX = Math.min(w - 58 * scale, w * 0.86);
    return { leftX, rightX };
  };

  const syncPhase = useCallback((next: ArenaPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const triggerFightStart = useCallback(() => {
    if (phaseRef.current !== 'IDLE') return;
    const left = leftFighterRef.current;
    const right = rightFighterRef.current;
    if (!left || !right) return;

    left.hasBeenPulledOut = true;
    right.hasBeenPulledOut = true;

    const dirL: 1 | -1 = right.x >= left.x ? 1 : -1;
    left.facing = dirL;
    right.facing = (dirL * -1) as 1 | -1;

    if (!left.isDragged) left.startAction('NOTICE', 0.26);
    if (!right.isDragged) right.startAction('NOTICE', 0.26);

    sfx.playNotice();
    syncPhase('FIGHTING');
  }, [syncPhase]);

  const equipWeaponToFighter = useCallback((fighter: StickFighter, type: WeaponType) => {
    if (type === 'shield') {
      fighter.hasShield = true;
      fighter.damageTakenWithShield = 0;
    } else {
      fighter.weapon = type;
    }
    sfx.playGrab();
    const def = WEAPONS[type];
    calloutsRef.current.push({
      x: fighter.joints.head.x,
      y: fighter.joints.head.y - 30 * fighter.scale,
      vy: -36,
      text: `+ ${def.name}!`,
      color: fighter.accentColor,
      life: 0.72,
      maxLife: 0.72,
      scale: 0.95,
      tilt: (Math.random() - 0.5) * 0.16,
    });
  }, []);

  const findTargetFighterAt = useCallback((x: number, y: number): StickFighter | null => {
    const left = leftFighterRef.current;
    const right = rightFighterRef.current;
    if (!left || !right) return null;

    const distTo = (f: StickFighter) => {
      const cx = (f.joints.hip.x + f.joints.head.x) * 0.5;
      const cy = (f.joints.hip.y + f.joints.head.y) * 0.5;
      return Math.hypot(x - cx, y - cy);
    };

    const threshL = 92 * left.hitboxScale;
    const threshR = 92 * right.hitboxScale;
    const dL = distTo(left);
    const dR = distTo(right);

    if (dL <= threshL && dR <= threshR) {
      return dL <= dR ? left : right;
    }
    if (dL <= threshL) return left;
    if (dR <= threshR) return right;
    return null;
  }, []);

  const handleSelectCharacter = useCallback(
    (charId: CharacterId, cardRect: DOMRect) => {
      const paper = paperRef.current;
      const canvas = canvasRef.current;
      if (!paper || !canvas) return;

      sfx.unlock();
      sfx.playCardPick();
      sfx.playCardLeap();

      const canvasRect = canvas.getBoundingClientRect();
      const originX = cardRect.left + cardRect.width * 0.5 - canvasRect.left;
      const originY = cardRect.top + cardRect.height * 0.5 - canvasRect.top;

      const scale = getScale(paper.width, paper.height);
      const { leftX, rightX } = getStartPositions(paper.width, paper.marginX, scale);
      const targetX = selectingSide === 'left' ? leftX : rightX;

      // Keep the arena in clean IDLE state while choosing characters so the leap never gets interrupted
      if (phaseRef.current !== 'IDLE') {
        winnerRef.current = null;
        thrownShieldsRef.current = [];
        paperTearsRef.current = [];
        pinnedSpearsRef.current = [];
        drawnWeaponsRef.current = [];
        areaBlastsRef.current = [];
        directMissilesRef.current = [];
        flightTrailDotsRef.current = [];
        detachedPodsRef.current = [];
        bananaPeelsRef.current = [];
        flyingPiesRef.current = [];
        jackBoxesRef.current = [];
        autoEnterTimerRef.current = null;
        syncPhase('IDLE');
      }

      const otherSide: FighterSide = selectingSide === 'left' ? 'right' : 'left';
      const otherFighter = otherSide === 'left' ? leftFighterRef.current : rightFighterRef.current;
      if (otherFighter && (otherFighter.hasBeenPulledOut || otherFighter.hp < otherFighter.maxHp)) {
        const otherTargetX = otherSide === 'left' ? leftX : rightX;
        const freshOther = new StickFighter(
          otherSide,
          otherTargetX,
          paper.floorY,
          scale,
          pickedCharactersRef.current[otherSide],
        );
        if (otherSide === 'left') {
          leftFighterRef.current = freshOther;
        } else {
          rightFighterRef.current = freshOther;
        }
      }

      const fighter = new StickFighter(selectingSide, targetX, paper.floorY, scale, charId);
      fighter.startEntranceFromCard(originX, originY, targetX, paper.floorY);

      if (selectingSide === 'left') {
        leftFighterRef.current = fighter;
      } else {
        rightFighterRef.current = fighter;
      }

      // Ink card-burst particles where the character springs out of the card
      const teamAccent = selectingSide === 'left' ? '#2563EB' : '#DC2626';
      for (let i = 0; i < 10; i++) {
        const ang = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.3;
        const spd = 85 + Math.random() * 110;
        particlesRef.current.push({
          x: originX,
          y: originY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 35,
          life: 0.34,
          maxLife: 0.34,
          size: (7 + Math.random() * 5) * scale,
          color: i % 2 === 0 ? teamAccent : '#1E293B',
          kind: i % 3 === 0 ? 'spark' : 'line',
          angle: ang,
          spin: (Math.random() - 0.5) * 6,
          seed: Math.random() * 120,
        });
      }
      particlesRef.current.push({
        x: originX,
        y: originY,
        vx: 0,
        vy: 0,
        life: 0.28,
        maxLife: 0.28,
        size: 16 * scale,
        color: teamAccent,
        kind: 'ring',
        angle: 0,
        spin: 0,
        seed: Math.random() * 120,
      });

      const nextPicked = {
        ...pickedCharactersRef.current,
        [selectingSide]: charId,
      };
      pickedCharactersRef.current = nextPicked;
      setPickedCharacters(nextPicked);

      const nextSession = {
        ...sessionPickedRef.current,
        [selectingSide]: true,
      };
      sessionPickedRef.current = nextSession;
      setSessionPicked(nextSession);

      if (!nextSession[otherSide]) {
        setSelectingSide(otherSide);
      } else {
        setIsCharSelectOpen(false);
      }
    },
    [selectingSide, syncPhase],
  );

  const handleReset = useCallback(() => {
    const paper = paperRef.current;
    if (paper) {
      const scale = getScale(paper.width, paper.height);
      const { leftX, rightX } = getStartPositions(paper.width, paper.marginX, scale);
      leftFighterRef.current = new StickFighter(
        'left',
        leftX,
        paper.floorY,
        scale,
        pickedCharactersRef.current.left,
      );
      rightFighterRef.current = new StickFighter(
        'right',
        rightX,
        paper.floorY,
        scale,
        pickedCharactersRef.current.right,
      );
    } else {
      leftFighterRef.current = null;
      rightFighterRef.current = null;
    }

    particlesRef.current = [];
    calloutsRef.current = [];
    trailsRef.current = [];
    rollGhostsRef.current = [];
    areaBlastsRef.current = [];
    directMissilesRef.current = [];
    flightTrailDotsRef.current = [];
    detachedPodsRef.current = [];
    bananaPeelsRef.current = [];
    flyingPiesRef.current = [];
    jackBoxesRef.current = [];
    drawnWeaponsRef.current = [];
    thrownShieldsRef.current = [];
    paperTearsRef.current = [];
    pinnedSpearsRef.current = [];
    drawingStrokeRef.current = null;
    trayDragRef.current = null;
    setSelectedTrayWeapon(null);
    setIsCharSelectOpen(false);
    shakeRef.current = 0;
    hitstopRef.current = 0;
    autoEnterTimerRef.current = null;
    draggedFighterRef.current = null;
    activePointerIdRef.current = null;

    setIsDraggingAny(false);
    winnerRef.current = null;
    syncPhase('IDLE');
  }, [syncPhase]);

  const toggleSound = useCallback(() => {
    sfx.muted = !sfx.muted;
    setMuted(sfx.muted);
    if (!sfx.muted) {
      sfx.unlock();
      sfx.playGrab();
    }
  }, []);

  // Global pointer listeners when dragging a preset weapon from bottom tray
  useEffect(() => {
    const handleWinMove = (e: PointerEvent) => {
      const drag = trayDragRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      drag.x = x;
      drag.y = y;
      if (Math.hypot(x - drag.startX, y - drag.startY) > 8) {
        drag.moved = true;
      }
    };

    const handleWinUp = (e: PointerEvent) => {
      const drag = trayDragRef.current;
      const canvas = canvasRef.current;
      if (!drag) return;
      trayDragRef.current = null;
      setIsDraggingAny(false);

      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (drag.moved) {
        const target = findTargetFighterAt(x, y);
        if (target) {
          equipWeaponToFighter(target, drag.type);
          setSelectedTrayWeapon(null);
        }
      } else {
        setSelectedTrayWeapon((prev) => (prev === drag.type ? null : drag.type));
      }
    };

    window.addEventListener('pointermove', handleWinMove);
    window.addEventListener('pointerup', handleWinUp);
    window.addEventListener('pointercancel', handleWinUp);
    return () => {
      window.removeEventListener('pointermove', handleWinMove);
      window.removeEventListener('pointerup', handleWinUp);
      window.removeEventListener('pointercancel', handleWinUp);
    };
  }, [equipWeaponToFighter, findTargetFighterAt]);

  // Initialize & handle resize cleanly
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rebuildPaper = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width));
      const height = Math.max(320, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const rendered = renderNotebookPaperToCanvas(width, height, dpr);
      paperRef.current = {
        ...rendered,
        width,
        height,
        dpr,
      };

      const scale = getScale(width, height);
      const { leftX, rightX } = getStartPositions(width, rendered.marginX, scale);
      const minX = rendered.marginX + 26 * scale;
      const maxX = width - 26 * scale;

      if (!leftFighterRef.current) {
        leftFighterRef.current = new StickFighter(
          'left',
          leftX,
          rendered.floorY,
          scale,
          pickedCharactersRef.current.left,
        );
      } else {
        leftFighterRef.current.setArenaScale(scale);
        leftFighterRef.current.x = Math.max(minX, Math.min(maxX, leftFighterRef.current.x));
        if (
          phaseRef.current === 'IDLE' &&
          !leftFighterRef.current.hasBeenPulledOut &&
          leftFighterRef.current.action !== 'ENTRANCE_JUMP'
        ) {
          leftFighterRef.current.x = leftX;
          leftFighterRef.current.y = rendered.floorY;
        }
      }

      if (!rightFighterRef.current) {
        rightFighterRef.current = new StickFighter(
          'right',
          rightX,
          rendered.floorY,
          scale,
          pickedCharactersRef.current.right,
        );
      } else {
        rightFighterRef.current.setArenaScale(scale);
        rightFighterRef.current.x = Math.max(minX, Math.min(maxX, rightFighterRef.current.x));
        if (
          phaseRef.current === 'IDLE' &&
          !rightFighterRef.current.hasBeenPulledOut &&
          rightFighterRef.current.action !== 'ENTRANCE_JUMP'
        ) {
          rightFighterRef.current.x = rightX;
          rightFighterRef.current.y = rendered.floorY;
        }
      }
    };

    rebuildPaper();
    const ro = new ResizeObserver(rebuildPaper);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Main 60fps simulation & hand-drawn render loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const checkKO = (defender: StickFighter, attackerSide: 'left' | 'right') => {
      if (defender.hp <= 0 && phaseRef.current === 'FIGHTING') {
        syncPhase('KO');
        winnerRef.current = attackerSide;
        shakeRef.current = 8;
        hitstopRef.current = 0.075;
        sfx.playKO();
      }
    };

    const checkAttackHit = (
      attacker: StickFighter,
      defender: StickFighter,
      minX: number,
      maxX: number,
    ) => {
      if (attacker.hasHitThisAction || attacker.isDragged || defender.isDragged) return;
      if (defender.hp <= 0 || defender.action === 'KO' || defender.action === 'KNOCKDOWN') return;
      if (defender.isAirborne()) return;

      const spec = attacker.getAttackSpecs();
      if (!spec) return;
      if (attacker.actionTime < spec.activeStart || attacker.actionTime > spec.activeEnd) return;

      const tip = attacker.getStrikeTip(spec);
      const pointToSeg = (
        px: number,
        py: number,
        ax: number,
        ay: number,
        bx: number,
        by: number,
      ) => {
        const vx = bx - ax;
        const vy = by - ay;
        const lenSq = vx * vx + vy * vy;
        if (lenSq < 0.0001) return Math.hypot(px - ax, py - ay);
        const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / lenSq));
        return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
      };
      const midFootX = (defender.joints.footL.x + defender.joints.footR.x) * 0.5;
      const midFootY = (defender.joints.footL.y + defender.joints.footR.y) * 0.5;
      const distToUpper = pointToSeg(
        tip.x,
        tip.y,
        defender.joints.head.x,
        defender.joints.head.y,
        defender.joints.hip.x,
        defender.joints.hip.y,
      );
      const distToLegs = pointToSeg(
        tip.x,
        tip.y,
        defender.joints.hip.x,
        defender.joints.hip.y,
        midFootX,
        midFootY,
      );
      const hitRadius = spec.reach + 20 * defender.hitboxScale;

      if (Math.min(distToUpper, distToLegs) <= hitRadius) {
        if (defender.action === 'ROLL_DODGE' || defender.rollInvulnTimer > 0) {
          attacker.hasHitThisAction = true;
          return;
        }
        if (defender.tryTriggerRollDodge(attacker, minX, maxX)) {
          return;
        }

        attacker.hasHitThisAction = true;

        if (defender.action === 'DODGE_BACK') {
          sfx.playDodge();
          if (spec.longRecovery) {
            // Dodged a slow heavy hammer swing -> immediate punish counter window!
            defender.aiCooldown = 0;
          }
          calloutsRef.current.push({
            x: defender.joints.head.x,
            y: defender.joints.head.y - 24 * defender.scale,
            vy: -42,
            text: spec.longRecovery ? 'NÉ HỞ ĐÒN!' : 'NÉ!',
            color: defender.accentColor,
            life: 0.48,
            maxLife: 0.48,
            scale: 0.92,
            tilt: (Math.random() - 0.5) * 0.22,
          });
          return;
        }

        const dir: 1 | -1 = defender.x >= attacker.x ? 1 : -1;
        const impactX = (tip.x + defender.x) * 0.5;
        const impactY = Math.max(defender.joints.head.y, Math.min(midFootY, tip.y));
        const wasGuarding =
          defender.action === 'BLOCK' || defender.action === 'SHIELD_CROUCH';

        const isFinisher =
          ['SWORD_3', 'SWORD_LUNGE', 'BAT_3', 'SPEAR_3', 'HAMMER_3'].includes(attacker.action) ||
          (!attacker.weapon && attacker.comboBeatCount >= 3);

        resolveHit({
          attacker,
          defender,
          rawDamage: spec.damage,
          kbX: spec.knockbackX * defender.scale,
          kbY: spec.knockbackY * defender.scale,
          heavy: spec.heavy,
          attackerDir: dir,
          attackType: attacker.action,
          isFinisher,
          particles: particlesRef.current,
          callouts: calloutsRef.current,
          impactX,
          impactY,
          weaponSource: spec.weaponType,
          opts: {
            guardBreak: spec.guardBreak,
            slow: spec.slow,
            slowDuration: spec.slowDuration,
            pin: spec.pin,
            pinDurationMul: attacker.characterId === 'hebongbay' ? 0.7 : undefined,
            homeRun: spec.homeRun,
          },
        });

        if (
          attacker.characterDef.trait.id === 'sweetSpot' &&
          attacker.strikeZone === 'sweet' &&
          !attacker.isIgnoredBySweetSpot(attacker.action)
        ) {
          // Crisp ruler tick glint through impact point + small "ĐÚNG TẦM!" callout
          for (let ri = 0; ri < 2; ri++) {
            const ang = ri === 0 ? -0.35 : 1.22;
            particlesRef.current.push({
              x: impactX,
              y: impactY,
              vx: dir * 24,
              vy: -14,
              life: 0.24,
              maxLife: 0.24,
              size: (ri === 0 ? 22 : 11) * attacker.scale,
              color: '#0284C7',
              kind: 'line',
              angle: ang,
              spin: 0,
              seed: Math.random() * 100,
            });
          }
          calloutsRef.current.push({
            x: impactX,
            y: impactY - 40 * defender.scale,
            vy: -36,
            text: 'ĐÚNG TẦM!',
            color: '#0F766E',
            life: 0.56,
            maxLife: 0.56,
            scale: 0.86,
            tilt: dir * 0.08,
          });
        }

        if (!wasGuarding || spec.guardBreak) {
          shakeRef.current = spec.shake;
          hitstopRef.current = spec.hitstop;
        }

        checkKO(defender, attacker.side);
      }
    };

    const tick = (now: number) => {
      const rawDt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const paper = paperRef.current;
      const canvas = canvasRef.current;
      const left = leftFighterRef.current;
      const right = rightFighterRef.current;

      if (paper && canvas) {
        const ctx = canvas.getContext('2d');
        const scale = getScale(paper.width, paper.height);
        const minX = paper.marginX + 26 * scale;
        const maxX = paper.width - 26 * scale;

        let simDt = rawDt;
        if (hitstopRef.current > 0) {
          hitstopRef.current = Math.max(0, hitstopRef.current - rawDt);
          simDt = rawDt * 0.12;
        }

        // Handle IDLE -> FIGHTING auto-trigger only after both fighters finish landing/taunt and user pulls one out
        if (phaseRef.current === 'IDLE' && left && right) {
          const bothSettledOnPaper =
            !left.isDragged &&
            !right.isDragged &&
            left.action !== 'ENTRANCE_JUMP' &&
            right.action !== 'ENTRANCE_JUMP' &&
            left.action !== 'TAUNT' &&
            right.action !== 'TAUNT';
          const anyPulled = left.hasBeenPulledOut || right.hasBeenPulledOut;

          if (bothSettledOnPaper && anyPulled) {
            const { leftX, rightX } = getStartPositions(paper.width, paper.marginX, scale);
            const leftMoved = left.hasBeenPulledOut && Math.abs(left.x - leftX) > 75 * scale;
            const rightMoved = right.hasBeenPulledOut && Math.abs(right.x - rightX) > 75 * scale;
            const closeEnough = Math.abs(left.x - right.x) < 260 * scale;

            if ((leftMoved && rightMoved) || closeEnough) {
              autoEnterTimerRef.current = null;
              triggerFightStart();
            } else if (leftMoved || rightMoved) {
              if (autoEnterTimerRef.current === null) {
                autoEnterTimerRef.current = 0.85;
              } else {
                autoEnterTimerRef.current -= rawDt;
                if (autoEnterTimerRef.current <= 0) {
                  autoEnterTimerRef.current = null;
                  triggerFightStart();
                }
              }
            } else {
              autoEnterTimerRef.current = null;
            }
          } else {
            autoEnterTimerRef.current = null;
          }
        }

        const fightingActive = phaseRef.current === 'FIGHTING' && Boolean(left && right);
        const tSec = now / 1000;
        const looseShield = thrownShieldsRef.current.find(
          (ts) => (ts.mode === 'LOOSE_BOUNCE' || ts.mode === 'RESTING') && ts.pickupDelay <= 0,
        );
        const looseShieldX = looseShield ? looseShield.x : null;

        const arenaTraps: ArenaTrapSnapshot[] = [
          ...bananaPeelsRef.current.map((bp) => ({
            type: 'bananaPeel' as const,
            x: bp.x,
            radius: bp.radius,
            ownerSide: bp.ownerSide,
          })),
          ...jackBoxesRef.current.map((jb) => ({
            type: 'jackBox' as const,
            x: jb.x,
            radius: jb.radius,
            ownerSide: jb.ownerSide,
          })),
        ];

        if (left) {
          left.activeOwnPeelCount = bananaPeelsRef.current.filter((bp) => bp.ownerSide === 'left').length;
          left.activeOwnJackBoxCount = jackBoxesRef.current.filter((jb) => jb.ownerSide === 'left').length;
          left.update(
            simDt,
            right ?? left,
            fightingActive,
            minX,
            maxX,
            paper.floorY,
            particlesRef.current,
            trailsRef.current,
            tSec,
            looseShieldX,
            arenaTraps,
          );
        }
        if (right) {
          right.activeOwnPeelCount = bananaPeelsRef.current.filter((bp) => bp.ownerSide === 'right').length;
          right.activeOwnJackBoxCount = jackBoxesRef.current.filter((jb) => jb.ownerSide === 'right').length;
          right.update(
            simDt,
            left ?? right,
            fightingActive,
            minX,
            maxX,
            paper.floorY,
            particlesRef.current,
            trailsRef.current,
            tSec,
            looseShieldX,
            arenaTraps,
          );
        }

        // Entrance landing shockwaves & character-specific intimidation taunts
        for (const fighter of [left, right]) {
          if (!fighter) continue;
          if (fighter.pendingLandingImpact) {
            fighter.pendingLandingImpact = false;
            shakeRef.current = Math.max(shakeRef.current, 3.2);
            particlesRef.current.push({
              x: fighter.x,
              y: paper.floorY - 3 * scale,
              vx: 0,
              vy: 0,
              life: 0.28,
              maxLife: 0.28,
              size: 10 * scale,
              color: fighter.accentColor,
              kind: 'ring',
              angle: 0,
              spin: 0,
              seed: Math.random() * 100,
            });
          }
          if (fighter.pendingTauntEffect) {
            fighter.pendingTauntEffect = false;
            const cx = fighter.joints.shoulder.x;
            const cy = fighter.joints.head.y;
            for (let i = 0; i < 9; i++) {
              const ang = -Math.PI + (Math.PI * i) / 8 + (Math.random() - 0.5) * 0.2;
              const spd = 75 + Math.random() * 95;
              particlesRef.current.push({
                x: cx + Math.cos(ang) * 14 * scale,
                y: cy + Math.sin(ang) * 14 * scale,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 20,
                life: 0.36,
                maxLife: 0.36,
                size: (8 + Math.random() * 5) * scale,
                color: i % 2 === 0 ? fighter.accentColor : '#1E293B',
                kind: i % 3 === 0 ? 'spark' : 'line',
                angle: ang,
                spin: 0,
                seed: Math.random() * 200,
              });
            }
            calloutsRef.current.push({
              x: fighter.joints.head.x,
              y: fighter.joints.head.y - 34 * fighter.scale,
              vy: -32,
              text: fighter.characterDef.entrance.tauntText,
              color: fighter.accentColor,
              life: 0.8,
              maxLife: 0.8,
              scale: 1.08,
              tilt: fighter.side === 'left' ? -0.1 : 0.1,
            });
          }
          if (fighter.pendingFootstepShake > 0) {
            shakeRef.current = Math.max(shakeRef.current, fighter.pendingFootstepShake);
            fighter.pendingFootstepShake = 0;
          }
          if (fighter.pendingRageEffect) {
            fighter.pendingRageEffect = false;
            shakeRef.current = Math.max(shakeRef.current, 6.5);
            sfx.playTaunt(fighter.characterId);
            const rcx = fighter.joints.shoulder.x;
            const rcy = fighter.joints.head.y;
            particlesRef.current.push({
              x: rcx,
              y: rcy,
              vx: 0,
              vy: 0,
              life: 0.36,
              maxLife: 0.36,
              size: 16 * fighter.scale,
              color: '#DC2626',
              kind: 'ring',
              angle: 0,
              spin: 0,
              seed: Math.random() * 100,
            });
            for (let i = 0; i < 10; i++) {
              const ang = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.25;
              const spd = 95 + Math.random() * 110;
              particlesRef.current.push({
                x: rcx,
                y: rcy,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 24,
                life: 0.38,
                maxLife: 0.38,
                size: (9 + Math.random() * 5) * fighter.scale,
                color: i % 2 === 0 ? '#DC2626' : '#991B1B',
                kind: 'spark',
                angle: ang,
                spin: 0,
                seed: Math.random() * 140,
              });
            }
            calloutsRef.current.push({
              x: fighter.joints.head.x,
              y: fighter.joints.head.y - 38 * fighter.scale,
              vy: -30,
              text: 'GRRR!',
              color: '#DC2626',
              life: 0.9,
              maxLife: 0.9,
              scale: 1.32,
              tilt: fighter.side === 'left' ? -0.1 : 0.1,
            });
          }
          if (fighter.pendingRollEffect) {
            const re = fighter.pendingRollEffect;
            fighter.pendingRollEffect = null;
            const ghostCol = fighter.characterDef.visual.scarfColor ?? re.accentColor;
            re.ghosts.forEach((g, idx) => {
              rollGhostsRef.current.push({
                x: g.x,
                y: g.y - 26 * fighter.scale,
                r: 15 * fighter.scale,
                color: ghostCol,
                life: 0.24 - idx * 0.04,
                maxLife: 0.24 - idx * 0.04,
                seed: Math.random() * 120,
              });
            });
            const moveDir = re.toX >= re.fromX ? 1 : -1;
            for (let i = 0; i < 4; i++) {
              particlesRef.current.push({
                x: re.fromX + (re.toX - re.fromX) * (0.2 + i * 0.18),
                y: re.y - 8 * fighter.scale + (i - 1.5) * 6 * fighter.scale,
                vx: -moveDir * 55 * fighter.scale,
                vy: 0,
                life: 0.22,
                maxLife: 0.22,
                size: (18 + i * 3) * fighter.scale,
                color: ghostCol,
                kind: 'line',
                angle: moveDir > 0 ? Math.PI : 0,
                spin: 0,
                seed: Math.random() * 100,
              });
            }
            calloutsRef.current.push({
              x: (re.fromX + re.toX) * 0.5,
              y: re.y - 34 * fighter.scale,
              vy: -44,
              text: 'VÈO!',
              color: '#EA580C',
              life: 0.48,
              maxLife: 0.48,
              scale: 0.98,
              tilt: moveDir * 0.14,
            });
          }
          if (fighter.pendingPanicEffect) {
            fighter.pendingPanicEffect = false;
            sfx.playTaunt(fighter.characterId);
            const pcx = fighter.joints.head.x;
            const pcy = fighter.joints.head.y;
            for (let i = 0; i < 6; i++) {
              const ang = -Math.PI * 0.9 + (Math.PI * 0.8 * i) / 5;
              particlesRef.current.push({
                x: pcx + Math.cos(ang) * 14 * fighter.scale,
                y: pcy + Math.sin(ang) * 14 * fighter.scale,
                vx: Math.cos(ang) * 85,
                vy: Math.sin(ang) * 85 - 25,
                life: 0.34,
                maxLife: 0.34,
                size: 8 * fighter.scale,
                color: '#F97316',
                kind: 'spark',
                angle: ang,
                spin: 0,
                seed: Math.random() * 110,
              });
            }
            calloutsRef.current.push({
              x: pcx,
              y: pcy - 34 * fighter.scale,
              vy: -36,
              text: 'ÁÁ!',
              color: '#EA580C',
              life: 0.72,
              maxLife: 0.72,
              scale: 1.15,
              tilt: fighter.side === 'left' ? -0.14 : 0.14,
            });
          }
          if (fighter.pendingOverreachEffect) {
            fighter.pendingOverreachEffect = false;
            shakeRef.current = Math.max(shakeRef.current, 4.2);
            sfx.playTaunt(fighter.characterId);
            const ocx = fighter.joints.shoulder.x;
            const ocy = fighter.joints.head.y;
            for (let i = 0; i < 6; i++) {
              const ang = -Math.PI * 0.8 + (Math.PI * 0.6 * i) / 5;
              particlesRef.current.push({
                x: ocx + Math.cos(ang) * 14 * fighter.scale,
                y: ocy + Math.sin(ang) * 14 * fighter.scale,
                vx: Math.cos(ang) * 95,
                vy: Math.sin(ang) * 95 - 18,
                life: 0.34,
                maxLife: 0.34,
                size: 11 * fighter.scale,
                color: '#16A34A',
                kind: 'line',
                angle: ang,
                spin: 0,
                seed: Math.random() * 110,
              });
            }
            calloutsRef.current.push({
              x: ocx,
              y: ocy - 34 * fighter.scale,
              vy: -32,
              text: 'VƯƠN!',
              color: '#16A34A',
              life: 0.75,
              maxLife: 0.75,
              scale: 1.08,
              tilt: fighter.side === 'left' ? -0.1 : 0.1,
            });
          }
          if (fighter.pendingVuongCallout) {
            fighter.pendingVuongCallout = false;
            calloutsRef.current.push({
              x: fighter.joints.handR.x,
              y: fighter.joints.handR.y - 24 * fighter.scale,
              vy: -28,
              text: 'VƯỚNG!',
              color: '#64748B',
              life: 0.44,
              maxLife: 0.44,
              scale: 0.82,
              tilt: (Math.random() - 0.5) * 0.16,
            });
          }
          if (fighter.pendingVentWarnCallout) {
            fighter.pendingVentWarnCallout = false;
            calloutsRef.current.push({
              x: fighter.joints.head.x,
              y: fighter.joints.head.y - 34 * fighter.scale,
              vy: -26,
              text: 'XÌÌÌ!',
              color: '#F97316',
              life: 0.52,
              maxLife: 0.52,
              scale: 1.08,
              tilt: fighter.side === 'left' ? -0.1 : 0.1,
            });
          }
          if (fighter.pendingOverheatCallout) {
            fighter.pendingOverheatCallout = false;
            calloutsRef.current.push({
              x: fighter.joints.head.x,
              y: fighter.joints.head.y - 36 * fighter.scale,
              vy: -28,
              text: 'NÓNG QUÁ…',
              color: '#DC2626',
              life: 0.78,
              maxLife: 0.78,
              scale: 1.02,
              tilt: -0.06,
            });
          }
          if (fighter.pendingTakeoffWarnCallout) {
            fighter.pendingTakeoffWarnCallout = false;
            shakeRef.current = Math.max(shakeRef.current, 5.5);
            particlesRef.current.push({
              x: fighter.joints.shoulder.x,
              y: fighter.joints.shoulder.y,
              vx: 0,
              vy: 0,
              life: 0.36,
              maxLife: 0.36,
              size: 16 * fighter.scale,
              color: '#0D9488',
              kind: 'ring',
              angle: 0,
              spin: 0,
              seed: Math.random() * 100,
            });
            calloutsRef.current.push({
              x: fighter.joints.head.x,
              y: fighter.joints.head.y - 42 * fighter.scale,
              vy: -32,
              text: 'CẤT CÁNH!',
              color: '#0D9488',
              life: 0.85,
              maxLife: 0.85,
              scale: 1.18,
              tilt: fighter.side === 'left' ? -0.1 : 0.1,
            });
          }
          if (fighter.pendingWingBreakCallout) {
            fighter.pendingWingBreakCallout = false;
            shakeRef.current = Math.max(shakeRef.current, 7.0);
            const wx = fighter.joints.shoulder.x;
            const wy = fighter.joints.shoulder.y;
            for (let wi = 0; wi < 10; wi++) {
              const ang = (Math.PI * 2 * wi) / 10 + Math.random() * 0.3;
              const spd = 95 + Math.random() * 115;
              particlesRef.current.push({
                x: wx,
                y: wy,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 35,
                life: 0.44,
                maxLife: 0.44,
                size: (9 + Math.random() * 5) * fighter.scale,
                color: wi % 3 === 0 ? '#0D9488' : wi % 2 === 0 ? '#334155' : '#DC2626',
                kind: wi % 2 === 0 ? 'line' : 'steam',
                angle: ang,
                spin: 5,
                seed: Math.random() * 120,
              });
            }
            calloutsRef.current.push({
              x: fighter.joints.head.x,
              y: fighter.joints.head.y - 36 * fighter.scale,
              vy: -30,
              text: 'GÃY CÁNH!',
              color: '#DC2626',
              life: 0.88,
              maxLife: 0.88,
              scale: 1.16,
              tilt: -0.08,
            });
          }
          if (fighter.pendingFlightTrailDot) {
            const fdot = fighter.pendingFlightTrailDot;
            fighter.pendingFlightTrailDot = null;
            flightTrailDotsRef.current.push({
              x: fdot.x,
              y: fdot.y,
              r: (2.2 + Math.random() * 1.4) * fighter.scale,
              life: 0.65,
              maxLife: 0.65,
              seed: Math.random() * 200,
            });
          }
          if (fighter.pendingRocketPodDrop) {
            const pd = fighter.pendingRocketPodDrop;
            fighter.pendingRocketPodDrop = null;
            for (const dir of [-1, 1] as const) {
              detachedPodsRef.current.push({
                x: pd.x + dir * 10 * pd.scale,
                y: pd.y,
                vx: dir * (135 + Math.random() * 55) * pd.scale,
                vy: -(140 + Math.random() * 75) * pd.scale,
                angle: dir * 0.4,
                spin: dir * (8 + Math.random() * 4),
                life: 4.5,
                maxLife: 4.5,
                seed: Math.random() * 300,
              });
            }
          }
          if (fighter.pendingFinaleCallout) {
            fighter.pendingFinaleCallout = false;
            shakeRef.current = Math.max(shakeRef.current, 5.2);
            calloutsRef.current.push({
              x: fighter.joints.head.x,
              y: fighter.joints.head.y - 40 * fighter.scale,
              vy: -34,
              text: 'MÀN CUỐI!',
              color: '#7C3AED',
              life: 0.9,
              maxLife: 0.9,
              scale: 1.24,
              tilt: fighter.side === 'left' ? -0.1 : 0.1,
            });
          }
          if (fighter.pendingOutOfTricksCallout) {
            fighter.pendingOutOfTricksCallout = false;
            calloutsRef.current.push({
              x: fighter.joints.head.x,
              y: fighter.joints.head.y - 34 * fighter.scale,
              vy: -26,
              text: 'HẾT TRÒ…',
              color: '#64748B',
              life: 0.8,
              maxLife: 0.8,
              scale: 1.0,
              tilt: -0.06,
            });
          }
          if (fighter.pendingSqueakCallout) {
            fighter.pendingSqueakCallout = false;
            calloutsRef.current.push({
              x: fighter.x + (Math.random() - 0.5) * 16 * scale,
              y: paper.floorY - 18 * scale,
              vy: -24,
              text: 'chút chít',
              color: '#D97706',
              life: 0.42,
              maxLife: 0.42,
              scale: 0.72,
              tilt: (Math.random() - 0.5) * 0.2,
            });
          }
          if (fighter.pendingHomeRunConfetti) {
            fighter.pendingHomeRunConfetti = false;
            const cols = ['#DC2626', '#F59E0B', '#7C3AED', '#2563EB', '#16A34A'];
            for (let ci = 0; ci < 14; ci++) {
              const ang = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7;
              const spd = 115 + Math.random() * 145;
              particlesRef.current.push({
                x: fighter.x + fighter.facing * 24 * fighter.scale,
                y: fighter.joints.shoulder.y,
                vx: Math.cos(ang) * spd + fighter.facing * 85,
                vy: Math.sin(ang) * spd - 40,
                life: 0.68,
                maxLife: 0.68,
                size: (4.5 + Math.random() * 2.5) * scale,
                color: cols[ci % cols.length],
                kind: 'confetti',
                angle: Math.random() * Math.PI,
                spin: (Math.random() - 0.5) * 16,
                seed: Math.random() * 200,
              });
            }
          }
          if (fighter.pendingGagSpawns.length > 0) {
            const spawns = fighter.pendingGagSpawns.splice(0, fighter.pendingGagSpawns.length);
            for (const gs of spawns) {
              if (gs.type === 'bananaPeel') {
                const peelRadius = 22 * scale;
                const placements = gs.dropTwoSidePeels
                  ? [
                      Math.max(minX + 18, Math.min(maxX - 18, gs.targetX - 42 * scale)),
                      Math.max(minX + 18, Math.min(maxX - 18, gs.targetX + 42 * scale)),
                    ]
                  : [
                      Math.max(
                        minX + 18,
                        Math.min(
                          maxX - 18,
                          gs.dropBehindTarget
                            ? gs.targetX + gs.facing * 42 * scale
                            : gs.attackerX + gs.facing * 52 * scale,
                        ),
                      ),
                    ];
                for (const px of placements) {
                  bananaPeelsRef.current.push({
                    id: gagIdCounterRef.current++,
                    x: px,
                    y: paper.floorY,
                    radius: peelRadius,
                    lifetime: 6.0,
                    maxLife: 6.0,
                    ownerSide: fighter.side,
                    affectsOwner: true,
                    insideLeft: Boolean(left && Math.abs(left.x - px) <= peelRadius),
                    insideRight: Boolean(right && Math.abs(right.x - px) <= peelRadius),
                    seed: Math.random() * 400,
                  });
                }
                sfx.playClownSqueak(1.18);
                calloutsRef.current.push({
                  x: placements[0],
                  y: paper.floorY - 26 * scale,
                  vy: -26,
                  text: gs.dropTwoSidePeels ? '2 VỎ CHUỐI!' : 'VỎ CHUỐI!',
                  color: '#CA8A04',
                  life: 0.58,
                  maxLife: 0.58,
                  scale: 0.86,
                  tilt: -0.08,
                });
              } else if (gs.type === 'creamPie') {
                const dx = gs.targetX - gs.attackerX;
                const dy = gs.targetY - gs.attackerY;
                const dist = Math.max(40, Math.hypot(dx, dy));
                const tFlight = Math.max(0.18, Math.min(0.55, dist / (490 * scale)));
                flyingPiesRef.current.push({
                  id: gagIdCounterRef.current++,
                  x: gs.attackerX,
                  y: gs.attackerY,
                  vx: dx / tFlight,
                  vy: dy / tFlight - 0.5 * 460 * scale * tFlight,
                  ownerSide: fighter.side,
                  targetSide: fighter.side === 'left' ? 'right' : 'left',
                  damage: 5,
                  dodged: false,
                  seed: Math.random() * 400,
                  life: 1.5,
                });
                sfx.playWhoosh();
                calloutsRef.current.push({
                  x: gs.attackerX,
                  y: gs.attackerY - 26 * scale,
                  vy: -28,
                  text: 'BÁNH KEM!',
                  color: '#D97706',
                  life: 0.56,
                  maxLife: 0.56,
                  scale: 0.88,
                  tilt: gs.facing * 0.1,
                });
              } else if (gs.type === 'jackBox') {
                const R = fighter.getWeaponReach();
                const jx = Math.max(minX + 24, Math.min(maxX - 24, gs.attackerX + gs.facing * (0.8 * R)));
                const fuse = gs.jackFuseOverride ?? 1.0;
                jackBoxesRef.current.push({
                  id: gagIdCounterRef.current++,
                  x: jx,
                  y: paper.floorY,
                  fuse,
                  maxFuse: fuse,
                  radius: 0.7 * R,
                  damage: 9,
                  ownerSide: fighter.side,
                  immuneSides: [fighter.side],
                  seed: Math.random() * 400,
                });
                sfx.playClownHorn();
                calloutsRef.current.push({
                  x: jx,
                  y: paper.floorY - 34 * scale,
                  vy: -28,
                  text: 'HỘP HỀ!',
                  color: '#7C3AED',
                  life: 0.62,
                  maxLife: 0.62,
                  scale: 0.9,
                  tilt: 0.08,
                });
              }
            }
          }
        }

        // Spawn thrown shields, hammer "BỐP!" & paper tears, pinned spears, boiler vent AoE, and home-run wall bounces
        if (left && right) {
          for (const fighter of [left, right]) {
            const opp = fighter.side === 'left' ? right : left;
            const oppSide = opp.side;

          if (fighter.pendingSteamPush) {
            const sp = fighter.pendingSteamPush;
            fighter.pendingSteamPush = null;
            for (let si = 0; si < 4; si++) {
              particlesRef.current.push({
                x: sp.x + sp.dir * (6 + si * 5) * fighter.scale,
                y: sp.y + (si - 1.5) * 4 * fighter.scale,
                vx: sp.dir * (115 + si * 28),
                vy: -24 + (si - 1.5) * 18,
                life: 0.36,
                maxLife: 0.36,
                size: (6.5 + si * 1.1) * fighter.scale,
                color: '#64748B',
                kind: 'steam',
                angle: 0,
                spin: 1,
                seed: Math.random() * 100,
              });
            }
            const oppDx = opp.x - fighter.x;
            if (
              opp.hp > 0 &&
              !opp.isDragged &&
              opp.action !== 'KO' &&
              oppDx * sp.dir >= -12 * fighter.scale &&
              Math.abs(oppDx) <= 78 * fighter.scale &&
              Math.abs(opp.y - fighter.y) <= 70 * fighter.scale
            ) {
              opp.vx += sp.dir * 135 * opp.scale * opp.characterDef.knockbackTaken;
            }
          }

          if (fighter.pendingAreaBlast) {
            const blast = fighter.pendingAreaBlast;
            fighter.pendingAreaBlast = null;
            areaBlastsRef.current.push({
              x: blast.x,
              y: blast.y,
              radius: 14 * fighter.scale,
              maxRadius: blast.radius,
              life: 0.38,
              maxLife: 0.38,
              color: blast.color,
              seed: Math.random() * 500,
            });
            shakeRef.current = Math.max(shakeRef.current, 11);
            for (let bi = 0; bi < 14; bi++) {
              const ang = (Math.PI * 2 * bi) / 14 + (Math.random() - 0.5) * 0.25;
              const spd = 155 + Math.random() * 145;
              particlesRef.current.push({
                x: blast.x + Math.cos(ang) * 14 * fighter.scale,
                y: blast.y + Math.sin(ang) * 14 * fighter.scale,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 20,
                life: 0.44,
                maxLife: 0.44,
                size: (bi % 2 === 0 ? 7.5 : 10) * fighter.scale,
                color: bi % 3 === 0 ? '#64748B' : blast.color,
                kind: bi % 2 === 0 ? 'steam' : 'spark',
                angle: ang,
                spin: 4,
                seed: Math.random() * 200,
              });
            }
            calloutsRef.current.push({
              x: blast.x,
              y: blast.y - 44 * fighter.scale,
              vy: -42,
              text: blast.label,
              color: blast.color,
              life: 0.68,
              maxLife: 0.68,
              scale: 1.32,
              tilt: (Math.random() - 0.5) * 0.2,
            });

            // Shatter drawn weapons & pinned spears inside the radial steam blast!
            const survivedDrawn: DrawnWeapon[] = [];
            for (const dw of drawnWeaponsRef.current) {
              if (Math.hypot(dw.x - blast.x, dw.y - blast.y) <= blast.radius + dw.radius) {
                for (let si = 0; si < 5; si++) {
                  const ang = (Math.PI * 2 * si) / 5 + Math.random() * 0.5;
                  particlesRef.current.push({
                    x: dw.x,
                    y: dw.y,
                    vx: Math.cos(ang) * 135,
                    vy: Math.sin(ang) * 135 - 30,
                    life: 0.3,
                    maxLife: 0.3,
                    size: 9 * scale,
                    color: '#475569',
                    kind: 'line',
                    angle: ang,
                    spin: 6,
                    seed: Math.random() * 150,
                  });
                }
              } else {
                survivedDrawn.push(dw);
              }
            }
            drawnWeaponsRef.current = survivedDrawn;

            pinnedSpearsRef.current = pinnedSpearsRef.current.filter(
              (ps) => Math.hypot(ps.x - blast.x, ps.y - blast.y) > blast.radius,
            );
            if (opp.action === 'PINNED' && Math.hypot(opp.x - blast.x, opp.y - blast.y) <= blast.radius + 24 * opp.hitboxScale) {
              opp.startAction('STANCE', 0);
            }

            const oppCenterX = opp.x;
            const oppCenterY = (opp.joints.hip.y + opp.joints.head.y) * 0.5;
            if (
              opp.hp > 0 &&
              !opp.isDragged &&
              opp.action !== 'KO' &&
              Math.hypot(oppCenterX - blast.x, oppCenterY - blast.y) <= blast.radius + 20 * opp.hitboxScale
            ) {
              // Clear launched momentum so the blast blasts cleanly from its center
              opp.homeRunTimer = 0;
              opp.bodySpinRate = 0;
              opp.isRecoverySliding = false;
              const blastDir: 1 | -1 = opp.x >= blast.x ? 1 : -1;
              let kbX = 340 * blast.knockbackMult * opp.scale;
              let kbY = -220 * blast.knockbackMult * opp.scale;
              if (blast.knockbackDistanceR && blast.knockbackDistanceR > 0) {
                const desiredDist = blast.knockbackDistanceR * (blast.weaponReach ?? fighter.getWeaponReach());
                kbY = -340 * opp.scale;
                kbX = (desiredDist / 0.62) / Math.max(0.55, opp.characterDef.knockbackTaken);
              }
              resolveHit({
                attacker: fighter,
                defender: opp,
                rawDamage: blast.damage,
                kbX,
                kbY,
                heavy: true,
                attackerDir: blastDir,
                attackType: blast.attackType ?? 'BOILER_VENT',
                isAoe: true,
                dodgeable: blast.dodgeable,
                breaksCombo: blast.breaksCombo,
                exceptArmored: blast.exceptArmored,
                particles: particlesRef.current,
                callouts: calloutsRef.current,
                impactX: oppCenterX,
                impactY: oppCenterY,
                opts: blast.stunDuration ? { stunDuration: blast.stunDuration } : undefined,
              });
              checkKO(opp, fighter.side);
            }
          }

          if (fighter.pendingRocketVolley) {
            const rv = fighter.pendingRocketVolley;
            fighter.pendingRocketVolley = null;
            const targetX = opp.hp > 0 ? opp.x + opp.vx * 0.05 : (minX + maxX) * 0.5;
            const targetY = opp.hp > 0
              ? (opp.joints.hip.y + opp.joints.head.y) * 0.5
              : paper.floorY - 40 * scale;
            const dx = targetX - rv.originX;
            const dy = targetY - rv.originY;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const speedPx = rv.speed * scale;
            const vx = (dx / dist) * speedPx;
            const vy = (dy / dist) * speedPx;
            directMissilesRef.current.push({
              x: rv.originX,
              y: rv.originY,
              vx,
              vy,
              angle: Math.atan2(vy, vx),
              isBig: rv.isBig,
              damage: rv.damage,
              blastRadius: rv.blastRadiusR * rv.weaponReach,
              knockback: rv.knockback,
              ownerSide: rv.ownerSide,
              life: 2.2,
              trail: [],
              trailEmitTimer: 0,
              seed: Math.random() * 500,
            });
            if (rv.isBig) {
              shakeRef.current = Math.max(shakeRef.current, 4.2);
              particlesRef.current.push({
                x: rv.originX,
                y: rv.originY,
                vx: 0,
                vy: 0,
                life: 0.28,
                maxLife: 0.28,
                size: 14 * scale,
                color: '#DC2626',
                kind: 'ring',
                angle: 0,
                spin: 0,
                seed: Math.random() * 120,
              });
              calloutsRef.current.push({
                x: fighter.joints.head.x,
                y: fighter.joints.head.y - 34 * fighter.scale,
                vy: -26,
                text: 'TÊN LỬA BỰ!',
                color: '#DC2626',
                life: 0.65,
                maxLife: 0.65,
                scale: 1.08,
                tilt: fighter.side === 'left' ? -0.1 : 0.1,
              });
            }
          }

          if (fighter.pendingShieldThrow) {
            const p = fighter.pendingShieldThrow;
            fighter.pendingShieldThrow = null;
            thrownShieldsRef.current.push(
              createThrownShield(
                p.x,
                p.y,
                p.vx,
                p.vy,
                fighter.scale,
                p.ownerSide,
                p.damage,
                fighter.characterId === 'lonsat'
                  ? 'lonsat'
                  : fighter.characterId === 'hebongbay'
                    ? 'hebongbay'
                    : 'standard',
              ),
            );
          }

          if (fighter.pendingBopCallout) {
            fighter.pendingBopCallout = false;
            calloutsRef.current.push({
              x: fighter.x,
              y: Math.max(76, paper.floorY - 210 * scale),
              vy: 35,
              text: 'BỐP!',
              color: '#B91C1C',
              life: 0.55,
              maxLife: 0.55,
              scale: 1.45,
              tilt: -0.14,
            });
          }

          if (fighter.pendingPaperTear) {
            const tearInfo = fighter.pendingPaperTear;
            fighter.pendingPaperTear = null;
            paperTearsRef.current.push({
              x: tearInfo.x,
              y: tearInfo.y,
              width: tearInfo.width,
              life: 6.5,
              maxLife: 6.5,
              seed: Math.random() * 1000,
            });
            shakeRef.current = Math.max(shakeRef.current, tearInfo.heavy ? 14 : 11);

            // Paper tear shock tosses nearby grounded opponent lightly!
            if (
              !fighter.hasHitThisAction &&
              opp.hp > 0 &&
              !opp.isDragged &&
              opp.action !== 'KO' &&
              opp.action !== 'DODGE_BACK' &&
              Math.abs(opp.x - tearInfo.x) < 118 * fighter.scale &&
              opp.y >= paper.floorY - 30 * scale
            ) {
              const kbDir: 1 | -1 = opp.x >= tearInfo.x ? 1 : -1;
              resolveHit({
                attacker: fighter,
                defender: opp,
                rawDamage: Math.round(9 * fighter.characterDef.damageDealt),
                kbX: 165 * fighter.scale * fighter.characterDef.knockbackDealt,
                kbY: -195 * fighter.scale,
                heavy: false,
                attackerDir: kbDir,
                attackType: 'HAMMER_TEAR',
                isAoe: true,
                particles: particlesRef.current,
                callouts: calloutsRef.current,
                impactX: opp.x,
                impactY: paper.floorY - 20 * opp.scale,
                weaponSource: 'hammer',
              });
              calloutsRef.current.push({
                x: opp.joints.head.x,
                y: opp.joints.head.y - 34 * opp.scale,
                vy: -42,
                text: 'XÉ GIẤY!',
                color: '#334155',
                life: 0.62,
                maxLife: 0.62,
                scale: 0.95,
                tilt: 0.12,
              });
              checkKO(opp, fighter.side);
            }
          }

          if (fighter.pendingPinnedSpear) {
            const ps = fighter.pendingPinnedSpear;
            fighter.pendingPinnedSpear = null;
            const pinDur = ps.duration ?? 0.95;
            pinnedSpearsRef.current.push({
              x: ps.x,
              y: ps.y,
              facing: ps.facing,
              scale: ps.scale,
              life: pinDur,
              maxLife: pinDur,
              seed: Math.random() * 500,
              style: ps.style,
            });
          }

          if (fighter.pendingWallBounce) {
            const wb = fighter.pendingWallBounce;
            fighter.pendingWallBounce = null;
            if (fighter.hp > 0) {
              const ev = resolveHit({
                attacker: null,
                defender: fighter,
                rawDamage: 10,
                kbX: 0,
                kbY: 0,
                heavy: false,
                attackerDir: wb.x <= fighter.x ? 1 : -1,
                attackType: 'WALL_BOUNCE',
                isAmbient: true,
                directEnvHit: true,
                particles: particlesRef.current,
                callouts: calloutsRef.current,
                impactX: wb.x,
                impactY: wb.y,
              });
              sfx.playHit(true);
              shakeRef.current = Math.max(shakeRef.current, 7);
              for (let i = 0; i < 6; i++) {
                const ang = (Math.PI * 2 * i) / 6;
                particlesRef.current.push({
                  x: wb.x,
                  y: wb.y,
                  vx: Math.cos(ang) * 140,
                  vy: Math.sin(ang) * 140 - 40,
                  life: 0.45,
                  maxLife: 0.45,
                  size: 7.5 * scale,
                  color: i % 2 === 0 ? '#D97706' : '#DC2626',
                  kind: 'star',
                  angle: ang,
                  spin: 8,
                  seed: Math.random() * 100,
                });
              }
              calloutsRef.current.push({
                x: wb.x,
                y: wb.y - 26 * scale,
                vy: -38,
                text: `ĐỤNG LỀ! -${ev.actualDamage}`,
                color: '#DC2626',
                life: 0.72,
                maxLife: 0.72,
                scale: 1.05,
                tilt: (Math.random() - 0.5) * 0.25,
              });
              checkKO(fighter, oppSide);
            }
          }

          // Heavy hammer slow recovery punish window
          if (fightingActive && opp.hp > 0 && opp.action === 'STANCE') {
            const atkSpec = fighter.getAttackSpecs();
            if (atkSpec?.longRecovery && fighter.actionTime > atkSpec.activeEnd && !fighter.hasHitThisAction) {
              opp.aiCooldown = Math.min(opp.aiCooldown, 0.04);
            }
          }

          // Bat / Launcher trait: launched airborne stickman hitting drawn scribbles takes bonus collision damage!
          if (
            fightingActive &&
            !fighter.isDragged &&
            !fighter.isAirborne() &&
            fighter.hp > 0 &&
            fighter.action !== 'KO' &&
            fighter.terrainHitCooldown <= 0 &&
            fighter.y < paper.floorY - 12 * scale &&
            Math.hypot(fighter.vx, fighter.vy) > 165 * scale
          ) {
            const fcx = (fighter.joints.hip.x + fighter.joints.head.x) * 0.5;
            const fcy = (fighter.joints.hip.y + fighter.joints.head.y) * 0.5;
            for (const dw of drawnWeaponsRef.current) {
              if (Math.hypot(fcx - dw.x, fcy - dw.y) < dw.radius + 32 * fighter.scale) {
                fighter.terrainHitCooldown = 0.5;
                const ev = resolveHit({
                  attacker: null,
                  defender: fighter,
                  rawDamage: 10,
                  kbX: 0,
                  kbY: 0,
                  heavy: false,
                  attackerDir: fighter.x >= dw.x ? 1 : -1,
                  attackType: 'DRAWN_WEAPON_BOUNCE',
                  isDrawnWeapon: true,
                  directEnvHit: true,
                  particles: particlesRef.current,
                  callouts: calloutsRef.current,
                  impactX: fcx,
                  impactY: fcy,
                });
                fighter.vy = -190 * fighter.scale;
                fighter.vx = -fighter.vx * 0.42;
                dw.state = 'FALLING';
                dw.vy = -175 * scale;
                dw.vx = fighter.vx * 0.4;
                dw.omega = 7.5;
                sfx.playDrop();
                shakeRef.current = Math.max(shakeRef.current, 4.5);
                calloutsRef.current.push({
                  x: fcx,
                  y: fcy - 24 * scale,
                  vy: -40,
                  text: `ĐẬP NÉT! -${ev.actualDamage}`,
                  color: '#92400E',
                  life: 0.65,
                  maxLife: 0.65,
                  scale: 0.96,
                  tilt: -0.1,
                });
                checkKO(fighter, oppSide);
                break;
              }
            }
          }
        }
        }

        if (fightingActive && left && right) {
          checkAttackHit(left, right, minX, maxX);
          checkAttackHit(right, left, minX, maxX);
        }

        // Update thrown shields (attack flight, boomerang return, ricochet bounce, first-touch claim)
        const nextShields: ThrownShield[] = [];
        if (left && right) {
        for (const ts of thrownShieldsRef.current) {
          if (ts.pickupDelay > 0) ts.pickupDelay = Math.max(0, ts.pickupDelay - rawDt);

          let claimed = false;
          const owner = ts.ownerSide === 'left' ? left : right;
          const target = ts.ownerSide === 'left' ? right : left;

          if (ts.mode === 'ATTACK') {
            ts.vy += 220 * scale * rawDt;
            ts.x += ts.vx * rawDt;
            ts.y += ts.vy * rawDt;
            ts.angle += ts.omega * rawDt;

            // Check hit on opponent
            if (!target.isDragged && target.hp > 0 && target.action !== 'KO') {
              const bodyX = (target.joints.shoulder.x + target.joints.hip.x) * 0.5;
              const bodyY = (target.joints.head.y + target.joints.hip.y) * 0.5;
              const dBody = Math.hypot(ts.x - bodyX, ts.y - bodyY);
              const dHead = Math.hypot(ts.x - target.joints.head.x, ts.y - target.joints.head.y);

              if (Math.min(dBody, dHead) < 34 * target.hitboxScale) {
                if (
                  target.action === 'DODGE_BACK' ||
                  target.action === 'ROLL_DODGE' ||
                  target.rollInvulnTimer > 0
                ) {
                  if (!ts.dodgedTarget) {
                    ts.dodgedTarget = true;
                    sfx.playDodge();
                    calloutsRef.current.push({
                      x: target.joints.head.x,
                      y: target.joints.head.y - 24 * target.scale,
                      vy: -40,
                      text: target.action === 'ROLL_DODGE' ? 'VÈO!' : 'NÉ!',
                      color: target.accentColor,
                      life: 0.45,
                      maxLife: 0.45,
                      scale: 0.9,
                      tilt: (Math.random() - 0.5) * 0.2,
                    });
                  }
                } else {
                  const kbDir: 1 | -1 = target.x >= ts.x ? 1 : -1;
                  resolveHit({
                    attacker: owner,
                    defender: target,
                    rawDamage: ts.damage ?? 18,
                    kbX: 255 * target.scale,
                    kbY: -135 * target.scale,
                    heavy: false,
                    attackerDir: kbDir,
                    attackType: 'SHIELD_THROW',
                    isFinisher: true,
                    particles: particlesRef.current,
                    callouts: calloutsRef.current,
                    impactX: ts.x,
                    impactY: ts.y,
                    weaponSource: 'shield',
                  });
                  if (ts.style === 'hebongbay') {
                    for (let ci = 0; ci < 5; ci++) {
                      const ang = (Math.PI * 2 * ci) / 5 + Math.random() * 0.4;
                      particlesRef.current.push({
                        x: ts.x,
                        y: ts.y,
                        vx: Math.cos(ang) * 115,
                        vy: Math.sin(ang) * 95 - 35,
                        life: 0.45,
                        maxLife: 0.45,
                        size: (4 + Math.random() * 2) * scale,
                        color: ci % 2 === 0 ? '#FFFDF7' : '#FDE68A',
                        kind: 'cream',
                        angle: ang,
                        spin: 4,
                        seed: Math.random() * 90,
                      });
                    }
                  }
                  shakeRef.current = 4.5;
                  hitstopRef.current = 0.032;
                  checkKO(target, ts.ownerSide);

                  // Probability to bounce back to thrower's hand OR ricochet off elsewhere!
                  if (Math.random() < 0.48 && owner.hp > 0 && !owner.hasShield) {
                    ts.mode = 'BOOMERANG';
                    ts.pickupDelay = 0.16;
                    ts.vx = (owner.x >= ts.x ? 1 : -1) * 340 * scale;
                    ts.vy = -210 * scale;
                    ts.omega = -ts.omega;
                    calloutsRef.current.push({
                      x: ts.x,
                      y: ts.y - 22 * scale,
                      vy: -32,
                      text: 'BẬT LẠI!',
                      color: '#1E3A8A',
                      life: 0.5,
                      maxLife: 0.5,
                      scale: 0.85,
                      tilt: -0.1,
                    });
                  } else {
                    ts.mode = 'LOOSE_BOUNCE';
                    ts.pickupDelay = 0.34;
                    const randDir = Math.random() < 0.5 ? -1 : 1;
                    ts.vx = randDir * (180 + Math.random() * 210) * scale;
                    ts.vy = -(255 + Math.random() * 140) * scale;
                    ts.omega = randDir * 14;
                  }
                }
              }
            }

            // Wall or floor miss bounce if still in ATTACK
            if (ts.mode === 'ATTACK') {
              const hitWall = ts.x <= minX || ts.x >= maxX;
              const hitFloor = ts.y >= paper.floorY - 14 * scale;
              if (hitWall || hitFloor) {
                ts.x = Math.max(minX, Math.min(maxX, ts.x));
                if (hitFloor) ts.y = paper.floorY - 14 * scale;
                sfx.playShieldClang(false);
                if (Math.random() < 0.38 && owner.hp > 0 && !owner.hasShield) {
                  ts.mode = 'BOOMERANG';
                  ts.pickupDelay = 0.14;
                  ts.vx = (owner.x >= ts.x ? 1 : -1) * 320 * scale;
                  ts.vy = -190 * scale;
                } else {
                  ts.mode = 'LOOSE_BOUNCE';
                  ts.pickupDelay = 0.28;
                  ts.vx = hitWall ? -ts.vx * 0.55 : ts.vx * 0.55;
                  ts.vy = -(210 + Math.random() * 120) * scale;
                }
              }
            }
          } else if (ts.mode === 'BOOMERANG') {
            if (owner.hp > 0 && !owner.isDragged && !owner.hasShield) {
              const tx = owner.joints.handL.x;
              const ty = owner.joints.handL.y;
              const dx = tx - ts.x;
              const dy = ty - ts.y;
              const dist = Math.hypot(dx, dy) || 1;
              const blend = Math.min(1, rawDt * 7.5);
              ts.vx = ts.vx + ((dx / dist) * 540 * scale - ts.vx) * blend;
              ts.vy = ts.vy + ((dy / dist) * 540 * scale - ts.vy) * blend;
              ts.x += ts.vx * rawDt;
              ts.y += ts.vy * rawDt;
              ts.angle += ts.omega * rawDt;

              if (dist < 32 * owner.scale && ts.pickupDelay <= 0) {
                owner.hasShield = true;
                owner.damageTakenWithShield = 0;
                sfx.playShieldCatch();
                calloutsRef.current.push({
                  x: owner.joints.head.x,
                  y: owner.joints.head.y - 26 * owner.scale,
                  vy: -36,
                  text: 'BẮT LẠI!',
                  color: owner.accentColor,
                  life: 0.62,
                  maxLife: 0.62,
                  scale: 0.92,
                  tilt: 0,
                });
                claimed = true;
              } else if (ts.y >= paper.floorY - 12 * scale) {
                ts.y = paper.floorY - 12 * scale;
                ts.mode = 'LOOSE_BOUNCE';
                ts.vy = -140 * scale;
              }
            } else {
              ts.mode = 'LOOSE_BOUNCE';
            }
          } else if (ts.mode === 'LOOSE_BOUNCE') {
            ts.vy += 980 * scale * rawDt;
            ts.x += ts.vx * rawDt;
            ts.y += ts.vy * rawDt;
            ts.angle += ts.omega * rawDt;

            if (ts.x < minX) {
              ts.x = minX;
              ts.vx = Math.abs(ts.vx) * 0.62;
            } else if (ts.x > maxX) {
              ts.x = maxX;
              ts.vx = -Math.abs(ts.vx) * 0.62;
            }

            if (ts.y >= paper.floorY - 14 * scale && ts.vy >= 0) {
              ts.y = paper.floorY - 14 * scale;
              if (ts.vy > 115 * scale) {
                ts.vy = -ts.vy * 0.48;
                ts.vx *= 0.72;
                ts.omega *= 0.55;
                sfx.playDrop();
              } else {
                ts.vy = 0;
                ts.omega = 0;
                ts.mode = 'RESTING';
              }
            }
          } else {
            // RESTING on floor line
            ts.vx *= Math.pow(0.02, rawDt);
            ts.x = Math.max(minX, Math.min(maxX, ts.x + ts.vx * rawDt));
            if (ts.restTimer > 0) {
              ts.restTimer -= rawDt;
            } else {
              ts.fadeTimer -= rawDt;
            }
          }

          // Anyone touching a loose/resting shield first claims it!
          if (!claimed && (ts.mode === 'LOOSE_BOUNCE' || ts.mode === 'RESTING') && ts.pickupDelay <= 0) {
            const contenders = Math.random() < 0.5 ? [left, right] : [right, left];
            for (const f of contenders) {
              if (f.hasShield || f.hp <= 0 || f.action === 'KO' || f.isDragged) continue;
              const hitX = Math.abs(ts.x - f.x) < 34 * f.scale;
              const hitY = ts.y >= f.joints.head.y - 12 * f.scale && ts.y <= paper.floorY + 12;
              if (hitX && hitY) {
                f.hasShield = true;
                f.damageTakenWithShield = 0;
                sfx.playShieldCatch();
                calloutsRef.current.push({
                  x: f.joints.head.x,
                  y: f.joints.head.y - 28 * f.scale,
                  vy: -38,
                  text: '+ KHIÊN!',
                  color: f.accentColor,
                  life: 0.68,
                  maxLife: 0.68,
                  scale: 0.94,
                  tilt: (Math.random() - 0.5) * 0.16,
                });
                claimed = true;
                break;
              }
            }
          }

          if (!claimed && (ts.mode !== 'RESTING' || ts.fadeTimer > 0)) {
            nextShields.push(ts);
          }
        }
        }
        thrownShieldsRef.current = nextShields;

        // Update drawn falling weapons (gravity, stickman collision, settling, fade-out)
        const nextDrawn: DrawnWeapon[] = [];
        for (const dw of drawnWeaponsRef.current) {
          if (dw.state === 'FALLING') {
            dw.vy += 980 * scale * rawDt;
            dw.x += dw.vx * rawDt;
            dw.y += dw.vy * rawDt;
            dw.angle += dw.omega * rawDt;

            if (dw.x < minX) {
              dw.x = minX;
              dw.vx = Math.abs(dw.vx) * 0.5;
            } else if (dw.x > maxX) {
              dw.x = maxX;
              dw.vx = -Math.abs(dw.vx) * 0.5;
            }

            // Check collision with both stick figures while moving with momentum
            const speed = Math.hypot(dw.vx, dw.vy);
            if (speed > 45 && left && right) {
              const fighters: Array<[StickFighter, 'left' | 'right']> = [
                [left, 'right'],
                [right, 'left'],
              ];
              for (const [target, oppSide] of fighters) {
                if (dw.hitSides.has(target.side)) continue;
                if (target.hp <= 0 || target.action === 'KO' || target.isDragged) continue;

                const bodyX = (target.joints.shoulder.x + target.joints.hip.x) * 0.5;
                const bodyY = (target.joints.head.y + target.joints.hip.y) * 0.5;
                const headX = target.joints.head.x;
                const headY = target.joints.head.y;

                // Broadphase check
                const approxDist = Math.hypot(dw.x - bodyX, dw.y - bodyY);
                if (approxDist <= dw.radius + 54 * target.hitboxScale) {
                  // Detailed vertex check
                  const cosA = Math.cos(dw.angle);
                  const sinA = Math.sin(dw.angle);
                  let hitPoint: { x: number; y: number } | null = null;
                  for (let i = 0; i < dw.localPoints.length; i++) {
                    const lp = dw.localPoints[i];
                    const wx = dw.x + lp.x * cosA - lp.y * sinA;
                    const wy = dw.y + lp.x * sinA + lp.y * cosA;
                    if (
                      Math.hypot(wx - bodyX, wy - bodyY) < 26 * target.hitboxScale ||
                      Math.hypot(wx - headX, wy - headY) < 20 * target.hitboxScale
                    ) {
                      hitPoint = { x: wx, y: wy };
                      break;
                    }
                  }

                  if (hitPoint) {
                    dw.hitSides.add(target.side);

                    if (
                      target.action === 'DODGE_BACK' ||
                      target.action === 'ROLL_DODGE' ||
                      target.rollInvulnTimer > 0
                    ) {
                      sfx.playDodge();
                      calloutsRef.current.push({
                        x: target.joints.head.x,
                        y: target.joints.head.y - 24 * target.scale,
                        vy: -40,
                        text: target.action === 'ROLL_DODGE' ? 'VÈO!' : 'NÉ!',
                        color: target.accentColor,
                        life: 0.45,
                        maxLife: 0.45,
                        scale: 0.9,
                        tilt: (Math.random() - 0.5) * 0.2,
                      });
                      continue;
                    }

                    const kbDir: 1 | -1 = target.x >= dw.x ? 1 : -1;
                    const heavy = dw.damage >= 20;
                    const wasGuarding =
                      target.action === 'BLOCK' || target.action === 'SHIELD_CROUCH';
                    const ev = resolveHit({
                      attacker: null,
                      defender: target,
                      rawDamage: dw.damage,
                      kbX: dw.knockback * target.scale,
                      kbY: -140 * target.scale,
                      heavy,
                      attackerDir: kbDir,
                      attackType: 'DRAWN_WEAPON',
                      isDrawnWeapon: true,
                      particles: particlesRef.current,
                      callouts: calloutsRef.current,
                      impactX: hitPoint.x,
                      impactY: hitPoint.y,
                    });
                    if (!wasGuarding && ev.actualDamage > 0) {
                      calloutsRef.current.push({
                        x: hitPoint.x,
                        y: hitPoint.y - 44 * target.scale,
                        vy: -38,
                        text: `-${ev.actualDamage}`,
                        color: '#B91C1C',
                        life: 0.72,
                        maxLife: 0.72,
                        scale: 0.92,
                        tilt: 0,
                      });
                    }

                    // Deflect drawn weapon lightly on impact
                    dw.vy = -Math.abs(dw.vy) * 0.3 - 85;
                    dw.vx = -kbDir * 95;
                    dw.omega = -kbDir * 5.2;
                    shakeRef.current = wasGuarding ? 1.5 : heavy ? 5 : 2.5;
                    checkKO(target, oppSide);
                  }
                }
              }
            }

            // Compute lowest world Y of the drawn polygon to land cleanly on paper.floorY
            const cosA = Math.cos(dw.angle);
            const sinA = Math.sin(dw.angle);
            let maxWorldY = dw.y;
            for (const lp of dw.localPoints) {
              const wy = dw.y + lp.x * sinA + lp.y * cosA;
              if (wy > maxWorldY) maxWorldY = wy;
            }

            if (maxWorldY >= paper.floorY && dw.vy >= 0) {
              dw.y -= maxWorldY - paper.floorY;
              if (dw.vy > 135) {
                dw.vy = -dw.vy * 0.28;
                dw.vx *= 0.65;
                dw.omega *= 0.45;
                sfx.playDrop();
                particlesRef.current.push({
                  x: dw.x,
                  y: paper.floorY - 2,
                  vx: (Math.random() - 0.5) * 60,
                  vy: -30,
                  life: 0.25,
                  maxLife: 0.25,
                  size: 5 * scale,
                  color: '#64748B',
                  kind: 'dust',
                  angle: 0,
                  spin: 2,
                  seed: Math.random() * 50,
                });
              } else {
                dw.vy = 0;
                dw.vx = 0;
                dw.omega = 0;
                dw.state = 'RESTING';
              }
            }

            nextDrawn.push(dw);
          } else {
            // RESTING on floor line, then fading out
            if (dw.restTimer > 0) {
              dw.restTimer -= rawDt;
              nextDrawn.push(dw);
            } else {
              dw.fadeTimer -= rawDt;
              if (dw.fadeTimer > 0) {
                nextDrawn.push(dw);
              }
            }
          }
        }
        drawnWeaponsRef.current = nextDrawn;

        // Update torn paper rips & quivering pinned spears
        paperTearsRef.current = paperTearsRef.current.filter((t) => {
          t.life -= rawDt;
          return t.life > 0;
        });
        pinnedSpearsRef.current = pinnedSpearsRef.current.filter((ps) => {
          ps.life -= rawDt;
          return ps.life > 0;
        });

        // Update banana peel ground traps (trigger ONLY on entering/moving/pushed onto, never stationary spawn)
        const nextPeels: BananaPeelTrap[] = [];
        for (const peel of bananaPeelsRef.current) {
          peel.lifetime -= rawDt;
          if (peel.lifetime <= 0) continue;
          let triggered = false;
          if (left && right) {
            for (const f of [left, right]) {
              const isInside =
                f.hp > 0 &&
                f.action !== 'KO' &&
                !f.isDragged &&
                !f.isAirborne() &&
                f.y >= paper.floorY - 12 * scale &&
                Math.abs(f.x - peel.x) <= peel.radius;
              const wasInside = f.side === 'left' ? peel.insideLeft : peel.insideRight;
              if (f.side === 'left') peel.insideLeft = isInside;
              else peel.insideRight = isInside;

              if (
                !triggered &&
                !wasInside &&
                isInside &&
                f.action !== 'SLIP' &&
                (f.side !== peel.ownerSide || peel.affectsOwner) &&
                !f.characterDef.trait.ignores?.includes('slip')
              ) {
                triggered = true;
                const owner = peel.ownerSide === 'left' ? left : right;
                const oppSide: FighterSide = f.side === 'left' ? 'right' : 'left';
                const res = resolveHit({
                  attacker: owner,
                  defender: f,
                  rawDamage: 6,
                  kbX: 0,
                  kbY: 0,
                  heavy: false,
                  attackerDir: f.vx >= 0 ? 1 : -1,
                  attackType: 'BANANA_PEEL',
                  isAmbient: true,
                  breaksCombo: true,
                  exceptArmored: ['hammerBeat2'],
                  particles: particlesRef.current,
                  callouts: calloutsRef.current,
                  impactX: f.x,
                  impactY: paper.floorY - 12 * scale,
                });
                sfx.playBananaSlip();
                if (!res.armored && f.hp > 0) {
                  const slideDir = Math.abs(f.vx) > 20 ? Math.sign(f.vx) : f.x >= peel.x ? 1 : -1;
                  f.vx = slideDir * 215 * f.scale;
                  f.vy = -85 * f.scale;
                  f.startAction('SLIP', 0.8);
                }
                calloutsRef.current.push({
                  x: f.joints.head.x,
                  y: f.joints.head.y - 32 * f.scale,
                  vy: -38,
                  text: 'TRƯỢT!',
                  color: '#CA8A04',
                  life: 0.72,
                  maxLife: 0.72,
                  scale: 1.08,
                  tilt: -0.14,
                });
                checkKO(f, oppSide);
              }
            }
          }
          if (!triggered) nextPeels.push(peel);
        }
        bananaPeelsRef.current = nextPeels;

        // Update flying cream pies
        const nextPies: FlyingCreamPie[] = [];
        for (const pie of flyingPiesRef.current) {
          pie.life -= rawDt;
          if (pie.life <= 0) continue;
          pie.vy += 460 * scale * rawDt;
          pie.x += pie.vx * rawDt;
          pie.y += pie.vy * rawDt;

          let hitDone = false;
          if (left && right) {
            const target = pie.targetSide === 'left' ? left : right;
            const owner = pie.ownerSide === 'left' ? left : right;
            if (target.hp > 0 && target.action !== 'KO' && !target.isDragged) {
              const headD = Math.hypot(pie.x - target.joints.head.x, pie.y - target.joints.head.y);
              const chestD = Math.hypot(pie.x - target.joints.shoulder.x, pie.y - target.joints.shoulder.y);
              if (Math.min(headD, chestD) <= 30 * target.hitboxScale) {
                if (
                  target.action === 'DODGE_BACK' ||
                  target.action === 'ROLL_DODGE' ||
                  target.rollInvulnTimer > 0
                ) {
                  if (!pie.dodged) {
                    pie.dodged = true;
                    sfx.playDodge();
                    calloutsRef.current.push({
                      x: target.joints.head.x,
                      y: target.joints.head.y - 24 * target.scale,
                      vy: -36,
                      text: 'NÉ!',
                      color: target.accentColor,
                      life: 0.45,
                      maxLife: 0.45,
                      scale: 0.9,
                      tilt: 0.1,
                    });
                  }
                } else {
                  hitDone = true;
                  const dir: 1 | -1 = target.x >= pie.x ? 1 : -1;
                  resolveHit({
                    attacker: owner,
                    defender: target,
                    rawDamage: pie.damage,
                    kbX: 70 * target.scale,
                    kbY: -35 * target.scale,
                    heavy: false,
                    attackerDir: dir,
                    attackType: 'CREAM_PIE',
                    isAmbient: true,
                    particles: particlesRef.current,
                    callouts: calloutsRef.current,
                    impactX: target.joints.head.x,
                    impactY: target.joints.head.y,
                  });
                  if (!target.characterDef.trait.ignores?.includes('pieFace') && target.hp > 0) {
                    target.addTempStatus({
                      id: 'creamPie',
                      duration: 2.5,
                      reachMul: 0.85,
                      windupMul: 1.2,
                      label: 'DÍNH KEM',
                    });
                  }
                  sfx.playPieSplat();
                  for (let ci = 0; ci < 9; ci++) {
                    const ang = (Math.PI * 2 * ci) / 9 + Math.random() * 0.4;
                    const spd = 75 + Math.random() * 110;
                    particlesRef.current.push({
                      x: target.joints.head.x,
                      y: target.joints.head.y,
                      vx: Math.cos(ang) * spd,
                      vy: Math.sin(ang) * spd - 35,
                      life: 0.52,
                      maxLife: 0.52,
                      size: (4.5 + Math.random() * 3) * scale,
                      color: ci % 3 === 0 ? '#FDE68A' : '#FFFDF7',
                      kind: 'cream',
                      angle: ang,
                      spin: 4,
                      seed: Math.random() * 120,
                    });
                  }
                  calloutsRef.current.push({
                    x: target.joints.head.x,
                    y: target.joints.head.y - 34 * target.scale,
                    vy: -32,
                    text: 'BÉT!',
                    color: '#D97706',
                    life: 0.68,
                    maxLife: 0.68,
                    scale: 1.08,
                    tilt: -0.1,
                  });
                  checkKO(target, pie.ownerSide);
                }
              }
            }
          }
          if (!hitDone && pie.y >= paper.floorY - 4 * scale) {
            hitDone = true;
            sfx.playPieSplat();
            for (let ci = 0; ci < 5; ci++) {
              particlesRef.current.push({
                x: pie.x,
                y: paper.floorY - 4 * scale,
                vx: (Math.random() - 0.5) * 110,
                vy: -40 - Math.random() * 55,
                life: 0.4,
                maxLife: 0.4,
                size: 4.5 * scale,
                color: ci % 2 === 0 ? '#FFFDF7' : '#FDE68A',
                kind: 'cream',
                angle: 0,
                spin: 2,
                seed: Math.random() * 90,
              });
            }
          }
          if (!hitDone && pie.x >= minX - 40 && pie.x <= maxX + 40) {
            nextPies.push(pie);
          }
        }
        flyingPiesRef.current = nextPies;

        // Update timed Jack-in-the-Box AoE traps
        const nextBoxes: JackInTheBoxTrap[] = [];
        for (const jb of jackBoxesRef.current) {
          jb.fuse -= rawDt;
          if (jb.fuse > 0) {
            nextBoxes.push(jb);
            continue;
          }
          // Pop & launch AoE explosion (not roll-dodgeable)
          sfx.playJackBoxBoing();
          shakeRef.current = Math.max(shakeRef.current, 7.5);
          areaBlastsRef.current.push({
            x: jb.x,
            y: jb.y - 16 * scale,
            radius: 12 * scale,
            maxRadius: jb.radius,
            life: 0.36,
            maxLife: 0.36,
            color: '#7C3AED',
            seed: jb.seed,
          });
          const cols = ['#DC2626', '#F59E0B', '#7C3AED', '#2563EB'];
          for (let ci = 0; ci < 14; ci++) {
            const ang = (Math.PI * 2 * ci) / 14 + (Math.random() - 0.5) * 0.3;
            const spd = 120 + Math.random() * 140;
            particlesRef.current.push({
              x: jb.x,
              y: jb.y - 18 * scale,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 65,
              life: 0.58,
              maxLife: 0.58,
              size: (5 + Math.random() * 3) * scale,
              color: cols[ci % cols.length],
              kind: ci % 3 === 0 ? 'spark' : 'confetti',
              angle: ang,
              spin: (Math.random() - 0.5) * 16,
              seed: Math.random() * 180,
            });
          }
          calloutsRef.current.push({
            x: jb.x,
            y: jb.y - 48 * scale,
            vy: -42,
            text: 'BOING!',
            color: '#7C3AED',
            life: 0.72,
            maxLife: 0.72,
            scale: 1.24,
            tilt: -0.1,
          });
          if (left && right) {
            const owner = jb.ownerSide === 'left' ? left : right;
            for (const f of [left, right]) {
              if (jb.immuneSides.includes(f.side)) continue;
              if (f.hp <= 0 || f.action === 'KO' || f.isDragged || f.isAirborne()) continue;
              const cy = (f.joints.hip.y + f.joints.head.y) * 0.5;
              if (Math.hypot(f.x - jb.x, cy - (jb.y - 18 * scale)) <= jb.radius + 20 * f.hitboxScale) {
                const dir: 1 | -1 = f.x >= jb.x ? 1 : -1;
                resolveHit({
                  attacker: owner,
                  defender: f,
                  rawDamage: jb.damage,
                  kbX: 215 * f.scale,
                  kbY: -365 * f.scale,
                  heavy: true,
                  attackerDir: dir,
                  attackType: 'JACK_BOX',
                  isAoe: true,
                  isAmbient: true,
                  dodgeable: false,
                  breaksCombo: true,
                  exceptArmored: ['hammerBeat2'],
                  particles: particlesRef.current,
                  callouts: calloutsRef.current,
                  impactX: f.x,
                  impactY: cy,
                });
                checkKO(f, jb.ownerSide);
              }
            }
          }
        }
        jackBoxesRef.current = nextBoxes;

        // Update direct-fire missiles launched from Lon Sắt straight toward the opponent
        const nextMissiles: DirectMissile[] = [];
        for (const dm of directMissilesRef.current) {
          dm.life -= rawDt;
          dm.x += dm.vx * rawDt;
          dm.y += dm.vy * rawDt;

          dm.trailEmitTimer += rawDt;
          if (dm.trailEmitTimer >= (dm.isBig ? 0.018 : 0.025)) {
            dm.trailEmitTimer = 0;
            const tailOffset = (dm.isBig ? 18 : 10) * scale;
            dm.trail.push({
              x: dm.x - Math.cos(dm.angle) * tailOffset + (Math.random() - 0.5) * 2.5 * scale,
              y: dm.y - Math.sin(dm.angle) * tailOffset + (Math.random() - 0.5) * 2.5 * scale,
              r: (dm.isBig ? 5.2 + Math.random() * 2.6 : 2.8 + Math.random() * 1.6) * scale,
              life: dm.isBig ? 0.42 : 0.3,
              maxLife: dm.isBig ? 0.42 : 0.3,
            });
          }
          dm.trail = dm.trail.filter((t) => {
            t.life -= rawDt;
            t.r += (dm.isBig ? 6 : 3.5) * scale * rawDt;
            return t.life > 0;
          });

          let detonated = false;
          let hitDirect = false;
          let impactX = dm.x;
          let impactY = dm.y;

          if (left && right) {
            const target = dm.ownerSide === 'left' ? right : left;
            if (target.hp > 0 && !target.isDragged && target.action !== 'KO') {
              const bodyX = (target.joints.shoulder.x + target.joints.hip.x) * 0.5;
              const bodyY = (target.joints.head.y + target.joints.hip.y) * 0.5;
              const hitR = (dm.isBig ? 32 : 22) * target.hitboxScale;
              if (
                Math.hypot(dm.x - bodyX, dm.y - bodyY) <= hitR ||
                Math.hypot(dm.x - target.joints.head.x, dm.y - target.joints.head.y) <= hitR * 0.9 ||
                Math.hypot(dm.x - target.x, dm.y - (target.y - 14 * target.scale)) <= hitR * 0.85
              ) {
                detonated = true;
                hitDirect = true;
              }
            }
          }

          if (!detonated && (dm.y >= paper.floorY - 4 * scale || dm.x < minX - 18 || dm.x > maxX + 18 || dm.life <= 0)) {
            detonated = true;
            impactY = Math.min(dm.y, paper.floorY - 4 * scale);
          }

          if (detonated) {
            const blastCol = dm.isBig ? '#DC2626' : '#0D9488';
            areaBlastsRef.current.push({
              x: impactX,
              y: impactY,
              radius: (dm.isBig ? 16 : 9) * scale,
              maxRadius: dm.blastRadius,
              life: dm.isBig ? 0.42 : 0.3,
              maxLife: dm.isBig ? 0.42 : 0.3,
              color: blastCol,
              seed: dm.seed,
            });
            sfx.playMissileExplosion(dm.isBig);
            shakeRef.current = Math.max(shakeRef.current, dm.isBig ? 12 : 5.5);
            if (dm.isBig) {
              hitstopRef.current = Math.max(hitstopRef.current, 0.055);
            }
            const partCount = dm.isBig ? 16 : 8;
            for (let ri = 0; ri < partCount; ri++) {
              const ang = (Math.PI * 2 * ri) / partCount + (Math.random() - 0.5) * 0.25;
              const spd = (dm.isBig ? 165 : 105) + Math.random() * (dm.isBig ? 165 : 95);
              particlesRef.current.push({
                x: impactX,
                y: impactY,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 20,
                life: dm.isBig ? 0.46 : 0.32,
                maxLife: dm.isBig ? 0.46 : 0.32,
                size: (dm.isBig ? (ri % 2 === 0 ? 10 : 12) : ri % 2 === 0 ? 6 : 7.5) * scale,
                color: ri % 3 === 0 ? '#64748B' : ri % 2 === 0 ? '#F97316' : blastCol,
                kind: ri % 2 === 0 ? 'steam' : 'spark',
                angle: ang,
                spin: 4,
                seed: Math.random() * 200,
              });
            }
            calloutsRef.current.push({
              x: impactX,
              y: impactY - (dm.isBig ? 42 : 28) * scale,
              vy: -38,
              text: dm.isBig ? 'ĐÙNGGG!' : 'BÙM!',
              color: blastCol,
              life: dm.isBig ? 0.68 : 0.46,
              maxLife: dm.isBig ? 0.68 : 0.46,
              scale: dm.isBig ? 1.4 : 0.96,
              tilt: (Math.random() - 0.5) * 0.18,
            });

            if (left && right) {
              const owner = dm.ownerSide === 'left' ? left : right;
              const target = dm.ownerSide === 'left' ? right : left;
              if (target.hp > 0 && !target.isDragged && target.action !== 'KO') {
                const oppBodyX = (target.joints.shoulder.x + target.joints.hip.x) * 0.5;
                const oppBodyY = (target.joints.head.y + target.joints.hip.y) * 0.5;
                const inBlast =
                  hitDirect ||
                  Math.hypot(oppBodyX - impactX, oppBodyY - impactY) <= dm.blastRadius + 20 * target.hitboxScale;
                if (inBlast) {
                  const blastDir: 1 | -1 = dm.vx !== 0 ? (dm.vx >= 0 ? 1 : -1) : (target.x >= impactX ? 1 : -1);
                  resolveHit({
                    attacker: owner,
                    defender: target,
                    rawDamage: dm.damage,
                    kbX: (dm.isBig ? 330 : 175) * dm.knockback * target.scale,
                    kbY: (dm.isBig ? -255 : -135) * dm.knockback * target.scale,
                    heavy: dm.isBig,
                    attackerDir: blastDir,
                    attackType: dm.isBig ? 'BIG_ROCKET_MISSILE' : 'ROCKET_MISSILE',
                    isAoe: true,
                    dodgeable: false,
                    particles: particlesRef.current,
                    callouts: calloutsRef.current,
                    impactX,
                    impactY,
                  });
                  checkKO(target, dm.ownerSide);
                }
              }
            }
          } else {
            nextMissiles.push(dm);
          }
        }
        directMissilesRef.current = nextMissiles;

        flightTrailDotsRef.current = flightTrailDotsRef.current.filter((dot) => {
          dot.life -= rawDt;
          return dot.life > 0;
        });

        detachedPodsRef.current = detachedPodsRef.current.filter((pod) => {
          pod.life -= rawDt;
          if (pod.life <= 0) return false;
          pod.vy += 820 * scale * rawDt;
          pod.x += pod.vx * rawDt;
          pod.y += pod.vy * rawDt;
          pod.angle += pod.spin * rawDt;
          if (pod.x < minX) {
            pod.x = minX;
            pod.vx = Math.abs(pod.vx) * 0.55;
            pod.spin = -pod.spin * 0.7;
          } else if (pod.x > maxX) {
            pod.x = maxX;
            pod.vx = -Math.abs(pod.vx) * 0.55;
            pod.spin = -pod.spin * 0.7;
          }
          const podR = 6 * scale;
          if (pod.y >= paper.floorY - podR && pod.vy > 0) {
            pod.y = paper.floorY - podR;
            if (pod.vy > 85 * scale) {
              pod.vy = -pod.vy * 0.42;
              pod.vx *= 0.76;
              pod.spin = pod.vx / Math.max(4, podR);
            } else {
              pod.vy = 0;
              pod.vx *= Math.pow(0.08, rawDt);
              pod.spin = pod.vx / Math.max(4, podR);
            }
          }
          return true;
        });

        // Update expanding boiler area-blast shockwaves
        areaBlastsRef.current = areaBlastsRef.current.filter((ab) => {
          ab.life -= rawDt;
          const p = 1 - Math.max(0, ab.life) / ab.maxLife;
          ab.radius = 14 * scale + (ab.maxRadius - 14 * scale) * (1 - Math.pow(1 - p, 2));
          return ab.life > 0;
        });

        // Update particles
        const nextParticles: Particle[] = [];
        for (const p of particlesRef.current) {
          p.life -= rawDt;
          if (p.life <= 0) continue;
          p.x += p.vx * rawDt;
          p.y += p.vy * rawDt;
          if (p.kind === 'dust') {
            p.vx *= Math.pow(0.1, rawDt);
            p.vy -= 12 * rawDt;
          } else if (p.kind === 'steam') {
            p.vx *= Math.pow(0.18, rawDt);
            p.vy -= 38 * rawDt;
            p.size += 5.5 * scale * rawDt;
          } else if (p.kind === 'oil') {
            p.vy += 420 * scale * rawDt;
            if (p.y >= paper.floorY - 2) {
              p.y = paper.floorY - 2;
              p.vy = 0;
              p.vx *= 0.2;
            }
          } else if (p.kind === 'screw') {
            p.vy += 680 * scale * rawDt;
            if (p.y >= paper.floorY - 3 && p.vy > 0) {
              p.y = paper.floorY - 3;
              p.vy = -p.vy * 0.42;
              p.vx *= 0.65;
              p.spin *= 0.5;
            }
          } else if (p.kind === 'spark' || p.kind === 'line' || p.kind === 'slash' || p.kind === 'crack') {
            p.vx *= Math.pow(0.05, rawDt);
            p.vy *= Math.pow(0.05, rawDt);
          } else if (p.kind === 'ring') {
            p.size += 165 * rawDt;
          } else if (p.kind === 'confetti') {
            p.vy += 260 * scale * rawDt;
            p.vx *= Math.pow(0.32, rawDt);
            p.x += Math.sin(tSec * 12 + p.seed) * 26 * scale * rawDt;
          } else if (p.kind === 'puff') {
            p.vx *= Math.pow(0.15, rawDt);
            p.vy -= 30 * rawDt;
            p.size += 8 * scale * rawDt;
          } else if (p.kind === 'cream') {
            p.vy += 520 * scale * rawDt;
            if (p.y >= paper.floorY - 2 && p.vy > 0) {
              p.y = paper.floorY - 2;
              p.vy = 0;
              p.vx *= 0.25;
            }
          }
          p.angle += p.spin * rawDt;
          nextParticles.push(p);
        }
        particlesRef.current = nextParticles;

        // Update motion trails & roll-dodge ghosts
        trailsRef.current = trailsRef.current.filter((tr) => {
          tr.life -= rawDt;
          return tr.life > 0;
        });
        rollGhostsRef.current = rollGhostsRef.current.filter((rg) => {
          rg.life -= rawDt;
          return rg.life > 0;
        });

        // Update comic callouts
        calloutsRef.current = calloutsRef.current.filter((c) => {
          c.life -= rawDt;
          c.y += c.vy * rawDt;
          c.vy *= Math.pow(0.12, rawDt);
          return c.life > 0;
        });

        if (shakeRef.current > 0) {
          shakeRef.current = Math.max(0, shakeRef.current - rawDt * 28);
        }

        // --- RENDER ---
        if (ctx) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const shakeX = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current * 2 : 0;
          const shakeY = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current * 2 : 0;

          ctx.drawImage(paper.canvas, shakeX * paper.dpr, shakeY * paper.dpr);
          ctx.scale(paper.dpr, paper.dpr);
          ctx.translate(shakeX, shakeY);

          const boilTick = Math.floor(now / 115);

          // 1. IDLE landing doodle pads + handwritten hint
          if (phaseRef.current === 'IDLE') {
            const { leftX, rightX } = getStartPositions(paper.width, paper.marginX, scale);
            if (left && !left.hasBeenPulledOut && left.action !== 'ENTRANCE_JUMP') {
              drawDoodleZone(
                ctx,
                leftX,
                paper.floorY - 48 * scale,
                34 * scale,
                56 * scale,
                '#1E3A8A',
                'Kéo ra',
                11,
              );
            }

            if (right && !right.hasBeenPulledOut && right.action !== 'ENTRANCE_JUMP') {
              drawDoodleZone(
                ctx,
                rightX,
                paper.floorY - 48 * scale,
                34 * scale,
                56 * scale,
                '#991B1B',
                'Kéo ra',
                22,
              );
            }

            const bothSettled =
              !isCharSelectOpenRef.current &&
              left &&
              right &&
              left.action !== 'ENTRANCE_JUMP' &&
              right.action !== 'ENTRANCE_JUMP' &&
              left.action !== 'TAUNT' &&
              right.action !== 'TAUNT';

            if (bothSettled) {
              ctx.save();
              ctx.font = `${Math.round(21 * scale)}px "Patrick Hand", cursive, sans-serif`;
              ctx.fillStyle = '#475569';
              ctx.globalAlpha = 0.85;
              ctx.textAlign = 'center';
              const hintY = Math.max(118, paper.floorY - 175 * scale);
              const centerX = (paper.marginX + paper.width) * 0.5;
              ctx.fillText('Kéo nhân vật vào giữa · Vẽ nét bất kỳ để thả vũ khí', centerX, hintY);

              drawSketchLine(ctx, centerX - 110 * scale, hintY + 14, centerX - 36 * scale, hintY + 14, {
                color: '#64748B',
                lineWidth: 1.5,
                roughness: 1,
                seed: 31,
                passes: 1,
                alpha: 0.6,
              });
              drawSketchLine(ctx, centerX + 110 * scale, hintY + 14, centerX + 36 * scale, hintY + 14, {
                color: '#64748B',
                lineWidth: 1.5,
                roughness: 1,
                seed: 32,
                passes: 1,
                alpha: 0.6,
              });
              ctx.restore();
            }
          }

          // 2. Scribbled HP bars in top ruled lines during FIGHTING / KO
          if ((phaseRef.current === 'FIGHTING' || phaseRef.current === 'KO') && left && right) {
            const isNarrow = paper.width < 768;
            const barY = isNarrow ? 68 : 26;
            const usableW = paper.width - paper.marginX - 32;
            const barW = Math.min(200, Math.max(92, usableW * 0.36));
            const barH = 14;
            const leftBarX = paper.marginX + 16;
            const rightBarX = Math.max(leftBarX + barW + 16, paper.width - barW - 20);

            ctx.save();
            ctx.font = `${isNarrow ? 16 : 18}px "Patrick Hand", cursive, sans-serif`;
            ctx.fillStyle = '#1E3A8A';
            ctx.textAlign = 'left';
            ctx.fillText(`${left.characterDef.name} (Xanh) · ${left.hp}`, leftBarX, barY - 5);
            drawSketchHealthBar(
              ctx,
              leftBarX,
              barY,
              barW,
              barH,
              left.hp / left.maxHp,
              '#2563EB',
              401,
              false,
            );

            ctx.fillStyle = '#991B1B';
            ctx.textAlign = 'right';
            ctx.fillText(`${right.hp} · ${right.characterDef.name} (Đỏ)`, rightBarX + barW, barY - 5);
            drawSketchHealthBar(
              ctx,
              rightBarX,
              barY,
              barW,
              barH,
              right.hp / right.maxHp,
              '#DC2626',
              801,
              true,
            );
            ctx.restore();
          }

          // 3. Target highlight ring when dragging/selecting a tray weapon to equip
          const activeTrayDrag = trayDragRef.current;
          const highlightedTarget =
            activeTrayDrag && activeTrayDrag.moved
              ? findTargetFighterAt(activeTrayDrag.x, activeTrayDrag.y)
              : null;

          if (highlightedTarget) {
            const cx = (highlightedTarget.joints.hip.x + highlightedTarget.joints.head.x) * 0.5;
            const cy = (highlightedTarget.joints.hip.y + highlightedTarget.joints.head.y) * 0.5;
            drawSketchCircle(ctx, cx, cy, 52 * highlightedTarget.hitboxScale, {
              color: highlightedTarget.accentColor,
              lineWidth: 2,
              roughness: 1.5,
              seed: 777 + boilTick,
              passes: 1,
              alpha: 0.65,
            });
          } else if (selectedTrayRef.current && left && right) {
            // Soft indicator on both fighters when tap-selected
            for (const f of [left, right]) {
              const cx = (f.joints.hip.x + f.joints.head.x) * 0.5;
              const cy = (f.joints.hip.y + f.joints.head.y) * 0.5;
              drawSketchCircle(ctx, cx, cy, 48 * f.hitboxScale, {
                color: f.accentColor,
                lineWidth: 1.4,
                roughness: 1.2,
                seed: 555 + f.seedBase,
                passes: 1,
                alpha: 0.35,
              });
            }
          }

          // 4. Torn paper rips on floor, banana peels, jack-in-the-box traps, drawn falling/resting weapons & thrown shields
          for (const tear of paperTearsRef.current) {
            drawPaperTear(ctx, tear, boilTick);
          }
          for (const peel of bananaPeelsRef.current) {
            const fade = Math.min(1, peel.lifetime / 0.8);
            const ps = scale;
            ctx.save();
            ctx.globalAlpha = fade;
            // Bright yellow curved 3-petal banana peel lying on the ruled floor line
            const drawPetal = (dx1: number, dy1: number, dx2: number, dy2: number, sOff: number) => {
              drawSketchPolyline(
                ctx,
                [
                  { x: peel.x, y: peel.y - 6 * ps },
                  { x: peel.x + dx1 * ps, y: peel.y + dy1 * ps },
                  { x: peel.x + dx2 * ps, y: peel.y + dy2 * ps },
                ],
                { color: '#FACC15', lineWidth: 3.4 * ps, roughness: 0.45, seed: peel.seed + sOff, passes: 1 },
              );
              drawSketchPolyline(
                ctx,
                [
                  { x: peel.x, y: peel.y - 6 * ps },
                  { x: peel.x + dx1 * ps, y: peel.y + dy1 * ps },
                  { x: peel.x + dx2 * ps, y: peel.y + dy2 * ps },
                ],
                { color: '#854D0E', lineWidth: 1.2 * ps, roughness: 0.4, seed: peel.seed + sOff + 3, passes: 1 },
              );
            };
            drawPetal(-7, -3, -15, 0, 1);
            drawPetal(7, -3, 15, 0, 10);
            drawPetal(-2, -1, 3, 1, 20);
            // Brown stem nub on top
            drawSketchLine(ctx, peel.x - 1 * ps, peel.y - 6 * ps, peel.x + 1.5 * ps, peel.y - 10 * ps, {
              color: '#78350F',
              lineWidth: 2.2 * ps,
              roughness: 0.35,
              seed: peel.seed + 30,
              passes: 1,
            });
            ctx.restore();
          }
          for (const jb of jackBoxesRef.current) {
            const prog = 1 - Math.max(0, jb.fuse) / jb.maxFuse;
            const rattle = Math.sin(tSec * 28 + jb.seed) * (1.2 + prog * 2.2) * scale;
            const bw = 18 * scale;
            const bh = 18 * scale;
            const bx = jb.x + rattle;
            const by = jb.y - bh * 0.5;
            // Dashed AoE blast circle preview around Jack-in-the-box
            ctx.save();
            ctx.strokeStyle = jb.fuse < 0.35 && Math.floor(tSec * 16) % 2 === 0 ? '#DC2626' : '#7C3AED';
            ctx.lineWidth = 1.6 * scale;
            ctx.globalAlpha = 0.42 + prog * 0.32;
            ctx.setLineDash([6 * scale, 5 * scale]);
            ctx.beginPath();
            ctx.arc(jb.x, jb.y - 16 * scale, jb.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            // Checkered box body
            ctx.save();
            ctx.fillStyle = '#F3E8FF';
            ctx.fillRect(bx - bw * 0.5, by - bh * 0.5, bw, bh);
            ctx.fillStyle = '#DC2626';
            ctx.fillRect(bx - bw * 0.5, by - bh * 0.5, bw * 0.5, bh * 0.5);
            ctx.fillRect(bx, by, bw * 0.5, bh * 0.5);
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(bx - bw * 0.5, by - bh * 0.5 - 3 * scale, bw, 3 * scale);
            ctx.restore();
            drawSketchPolyline(
              ctx,
              [
                { x: bx - bw * 0.5, y: by - bh * 0.5 },
                { x: bx + bw * 0.5, y: by - bh * 0.5 },
                { x: bx + bw * 0.5, y: by + bh * 0.5 },
                { x: bx - bw * 0.5, y: by + bh * 0.5 },
                { x: bx - bw * 0.5, y: by - bh * 0.5 },
              ],
              { color: '#1E293B', lineWidth: 1.7 * scale, roughness: 0.45, seed: jb.seed + boilTick, passes: 1 },
            );
            // Spinning crank handle (3 full turns over fuse countdown)
            const crankAng = prog * Math.PI * 6;
            const cx = bx + bw * 0.5;
            const cy = by;
            const hx = cx + 6 * scale;
            const hy = cy + Math.sin(crankAng) * 5 * scale;
            drawSketchLine(ctx, cx, cy, hx, hy, {
              color: '#334155',
              lineWidth: 1.6 * scale,
              roughness: 0.3,
              seed: jb.seed + 5,
              passes: 1,
            });
            drawSketchCircle(ctx, hx, hy, 2 * scale, {
              color: '#DC2626',
              lineWidth: 1.3 * scale,
              roughness: 0.25,
              seed: jb.seed + 8,
              passes: 1,
            });
          }
          for (const dw of drawnWeaponsRef.current) {
            drawFallingWeapon(ctx, dw, boilTick);
          }
          for (const ts of thrownShieldsRef.current) {
            drawThrownShield(ctx, ts, boilTick);
          }
          for (const pod of detachedPodsRef.current) {
            const podFade = Math.min(1, pod.life / 0.8);
            const podR = 5.5 * scale;
            ctx.save();
            ctx.translate(pod.x, pod.y);
            ctx.rotate(pod.angle);
            drawSketchCircle(ctx, 0, 0, podR, {
              color: '#334155',
              lineWidth: 1.6 * scale,
              roughness: 0.7,
              seed: pod.seed,
              passes: 1,
              alpha: podFade,
            });
            drawSketchCircle(ctx, 0, 0, podR * 0.52, {
              color: '#0D9488',
              lineWidth: 1.3 * scale,
              roughness: 0.5,
              seed: pod.seed + 5,
              passes: 1,
              alpha: podFade,
            });
            // Open hinged lid
            drawSketchLine(ctx, -podR * 0.6, -podR * 0.9, podR * 0.85, -podR * 1.45, {
              color: '#334155',
              lineWidth: 1.5 * scale,
              roughness: 0.5,
              seed: pod.seed + 9,
              passes: 1,
              alpha: podFade,
            });
            ctx.restore();
          }

          // 5. Active scribble stroke currently being drawn by mouse/finger
          const activeStroke = drawingStrokeRef.current;
          if (activeStroke && activeStroke.length >= 2) {
            for (let i = 0; i < activeStroke.length - 1; i++) {
              drawSketchLine(
                ctx,
                activeStroke[i].x,
                activeStroke[i].y,
                activeStroke[i + 1].x,
                activeStroke[i + 1].y,
                {
                  color: '#1E293B',
                  lineWidth: 2.7,
                  roughness: 0.9,
                  seed: 33 + i * 7.1,
                  passes: 2,
                  alpha: 0.88,
                },
              );
            }
          }

          // 6. Motion trails behind punches/kicks/weapons
          for (const tr of trailsRef.current) {
            const alpha = (tr.life / tr.maxLife) * 0.55;
            drawSketchLine(ctx, tr.x1, tr.y1, tr.x2, tr.y2, {
              color: tr.color,
              lineWidth: 2.2 * scale,
              roughness: 0.8,
              seed: tr.x1 + tr.y1,
              passes: 1,
              alpha,
            });
          }

          // Translucent ghostly roll afterimages behind Nhóc during Lộn Né
          for (const rg of rollGhostsRef.current) {
            const a = Math.max(0, rg.life / rg.maxLife) * 0.42;
            drawSketchCircle(ctx, rg.x, rg.y, rg.r, {
              color: rg.color,
              lineWidth: 1.7 * scale,
              roughness: 1.1,
              seed: rg.seed,
              passes: 1,
              alpha: a,
            });
            drawSketchCircle(ctx, rg.x, rg.y, rg.r * 0.52, {
              color: rg.color,
              lineWidth: 1.2 * scale,
              roughness: 0.8,
              seed: rg.seed + 3,
              passes: 1,
              alpha: a * 0.85,
            });
          }

          // Dotted lead-pencil smoke trajectory behind flying Lon Sắt
          for (const dot of flightTrailDotsRef.current) {
            const da = Math.max(0, dot.life / dot.maxLife) * 0.55;
            ctx.save();
            ctx.fillStyle = '#64748B';
            ctx.globalAlpha = da;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Direct-fire missiles (3 small + 1 heavy final rocket) + lead-pencil smoke trail
          for (const dm of directMissilesRef.current) {
            for (const tr of dm.trail) {
              const ta = Math.max(0, tr.life / tr.maxLife) * (dm.isBig ? 0.65 : 0.52);
              drawSketchCircle(ctx, tr.x, tr.y, tr.r, {
                color: dm.isBig ? '#475569' : '#64748B',
                lineWidth: (dm.isBig ? 1.8 : 1.3) * scale,
                roughness: 0.8,
                seed: dm.seed + tr.y * 0.2,
                passes: 1,
                alpha: ta,
              });
            }

            const sz = dm.isBig ? 1.85 : 1.0;
            const halfH = 3.8 * sz * scale;
            const tailX = -13 * sz * scale;
            const bodyFrontX = 2 * sz * scale;
            const noseX = 9 * sz * scale;
            const warheadCol = dm.isBig ? '#DC2626' : '#0D9488';

            ctx.save();
            ctx.translate(dm.x, dm.y);
            ctx.rotate(dm.angle);

            // Rocket body cylinder
            drawSketchLine(ctx, tailX, -halfH, bodyFrontX, -halfH, {
              color: '#1E293B',
              lineWidth: (dm.isBig ? 2.6 : 1.8) * scale,
              roughness: 0.55,
              seed: dm.seed,
              passes: dm.isBig ? 2 : 1,
            });
            drawSketchLine(ctx, tailX, halfH, bodyFrontX, halfH, {
              color: '#1E293B',
              lineWidth: (dm.isBig ? 2.6 : 1.8) * scale,
              roughness: 0.55,
              seed: dm.seed + 2,
              passes: dm.isBig ? 2 : 1,
            });
            drawSketchLine(ctx, tailX, -halfH, tailX, halfH, {
              color: '#334155',
              lineWidth: (dm.isBig ? 2.4 : 1.8) * scale,
              roughness: 0.5,
              seed: dm.seed + 3,
              passes: 1,
            });
            // Warhead nose cone pointing straight toward opponent
            drawSketchLine(ctx, bodyFrontX, -halfH, noseX, 0, {
              color: warheadCol,
              lineWidth: (dm.isBig ? 2.8 : 2.1) * scale,
              roughness: 0.5,
              seed: dm.seed + 4,
              passes: dm.isBig ? 2 : 1,
            });
            drawSketchLine(ctx, bodyFrontX, halfH, noseX, 0, {
              color: warheadCol,
              lineWidth: (dm.isBig ? 2.8 : 2.1) * scale,
              roughness: 0.5,
              seed: dm.seed + 5,
              passes: dm.isBig ? 2 : 1,
            });
            // Extra danger band on the big missile
            if (dm.isBig) {
              drawSketchLine(ctx, -3 * sz * scale, -halfH, -3 * sz * scale, halfH, {
                color: '#F97316',
                lineWidth: 2.2 * scale,
                roughness: 0.4,
                seed: dm.seed + 11,
                passes: 1,
              });
            }
            // Rear fins
            drawSketchLine(ctx, tailX + 3 * sz * scale, -halfH, tailX - 3 * sz * scale, -halfH * 1.85, {
              color: '#334155',
              lineWidth: (dm.isBig ? 2.2 : 1.5) * scale,
              roughness: 0.5,
              seed: dm.seed + 6,
              passes: 1,
            });
            drawSketchLine(ctx, tailX + 3 * sz * scale, halfH, tailX - 3 * sz * scale, halfH * 1.85, {
              color: '#334155',
              lineWidth: (dm.isBig ? 2.2 : 1.5) * scale,
              roughness: 0.5,
              seed: dm.seed + 7,
              passes: 1,
            });
            // Flickering tail exhaust flame
            const flameLen = (dm.isBig ? 14 : 8) * sz * scale;
            const wobbleY = Math.sin(tSec * 32 + dm.seed) * 3.2 * sz * scale;
            drawSketchLine(ctx, tailX, 0, tailX - flameLen, wobbleY, {
              color: '#F97316',
              lineWidth: (dm.isBig ? 3.2 : 2.0) * scale,
              roughness: 0.85,
              seed: dm.seed + boilTick,
              passes: dm.isBig ? 2 : 1,
            });
            if (dm.isBig) {
              drawSketchLine(ctx, tailX, -2 * scale, tailX - flameLen * 0.72, -wobbleY * 0.7, {
                color: '#DC2626',
                lineWidth: 2.2 * scale,
                roughness: 0.7,
                seed: dm.seed + boilTick + 3,
                passes: 1,
              });
            }
            ctx.restore();
          }

          // Dashed warning circle under/around any fighter winding up VENT_WARN or TAKEOFF_WARN
          for (const f of [left, right]) {
            if (f && (f.action === 'VENT_WARN' || f.action === 'TAKEOFF_WARN') && f.hp > 0) {
              const isTakeoff = f.action === 'TAKEOFF_WARN';
              const bodyH = 105 * f.scale;
              const mult = isTakeoff
                ? (f.characterDef.trait.takeoff?.megaVent.radiusR ?? 1.8)
                : (f.characterDef.trait.ventRadiusR ?? 1.0);
              const warnR = isTakeoff
                ? f.getWeaponReach() * mult
                : Math.max(bodyH, f.getWeaponReach() * mult);
              const warnY = (f.joints.hip.y + f.joints.shoulder.y) * 0.5;
              ctx.save();
              ctx.strokeStyle = isTakeoff
                ? (Math.floor(tSec * 14) % 2 === 0 ? '#0D9488' : '#F97316')
                : (Math.floor(tSec * 14) % 2 === 0 ? '#DC2626' : '#F97316');
              ctx.lineWidth = (isTakeoff ? 2.6 : 2.2) * scale;
              ctx.globalAlpha = 0.76;
              ctx.setLineDash([8 * scale, 6 * scale]);
              ctx.beginPath();
              ctx.arc(f.x, warnY, warnR, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            }
          }

          // Expanding double-circle boiler vent AoE shockwaves
          for (const ab of areaBlastsRef.current) {
            const a = Math.max(0, ab.life / ab.maxLife);
            drawSketchCircle(ctx, ab.x, ab.y, ab.radius, {
              color: ab.color,
              lineWidth: 3.0 * scale,
              roughness: 1.5,
              seed: ab.seed,
              passes: 2,
              alpha: a * 0.88,
            });
            drawSketchCircle(ctx, ab.x, ab.y, ab.radius * 0.72, {
              color: '#334155',
              lineWidth: 2.0 * scale,
              roughness: 1.2,
              seed: ab.seed + 7,
              passes: 1,
              alpha: a * 0.65,
            });
          }

          // 7. Draw spawned fighters (dragged one on top)
          if (left?.isDragged) {
            right?.draw(ctx, paper.floorY, boilTick, now);
            left.draw(ctx, paper.floorY, boilTick, now);
          } else {
            left?.draw(ctx, paper.floorY, boilTick, now);
            right?.draw(ctx, paper.floorY, boilTick, now);
          }

          // Quivering spears pinning fighters onto the paper
          for (const ps of pinnedSpearsRef.current) {
            drawPinnedSpear(ctx, ps, tSec);
          }

          // Flying cream pies mid-arc
          for (const pie of flyingPiesRef.current) {
            ctx.save();
            ctx.translate(pie.x, pie.y);
            ctx.rotate(Math.atan2(pie.vy, pie.vx) * 0.22);
            // Tin foil pie tray base
            drawSketchLine(ctx, -10 * scale, 2 * scale, 10 * scale, 2 * scale, {
              color: '#64748B',
              lineWidth: 2.6 * scale,
              roughness: 0.4,
              seed: pie.seed,
              passes: 1,
            });
            // White meringue cream dome
            ctx.fillStyle = '#FFFDF7';
            ctx.beginPath();
            ctx.arc(0, 1.5 * scale, 8 * scale, Math.PI, 0);
            ctx.closePath();
            ctx.fill();
            drawSketchCircle(ctx, 0, -1.5 * scale, 7.2 * scale, {
              color: '#D97706',
              lineWidth: 1.4 * scale,
              roughness: 0.65,
              seed: pie.seed + 4,
              passes: 1,
            });
            // Red cherry on top
            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(0, -7.5 * scale, 2.2 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // 8. Floating tray weapon following cursor during drag
          if (activeTrayDrag && activeTrayDrag.moved) {
            if (activeTrayDrag.type === 'shield') {
              drawHeldShield(
                ctx,
                activeTrayDrag.x,
                activeTrayDrag.y,
                1,
                false,
                scale * 1.15,
                909 + boilTick,
              );
            } else {
              drawHeldWeapon(
                ctx,
                activeTrayDrag.type,
                activeTrayDrag.x,
                activeTrayDrag.y,
                0.72,
                -0.68,
                scale * 1.15,
                909 + boilTick,
              );
            }
          }

          // 9. Hand-drawn particles
          for (const p of particlesRef.current) {
            const a = Math.max(0, p.life / p.maxLife);
            if (p.kind === 'line' || p.kind === 'spark') {
              const ex = p.x + Math.cos(p.angle) * p.size;
              const ey = p.y + Math.sin(p.angle) * p.size;
              drawSketchLine(ctx, p.x, p.y, ex, ey, {
                color: p.color,
                lineWidth: p.kind === 'spark' ? 2.2 * scale : 1.5 * scale,
                roughness: 0.7,
                seed: p.seed,
                passes: 1,
                alpha: a * 0.9,
              });
            } else if (p.kind === 'dust') {
              ctx.save();
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 1.3 * scale;
              ctx.globalAlpha = a * 0.48;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * (1.2 - a * 0.4), 0, Math.PI * 1.6);
              ctx.stroke();
              ctx.restore();
            } else if (p.kind === 'slash') {
              const half = p.size * 0.5;
              const sx = p.x - Math.cos(p.angle) * half;
              const sy = p.y - Math.sin(p.angle) * half;
              const ex = p.x + Math.cos(p.angle) * half;
              const ey = p.y + Math.sin(p.angle) * half;
              drawSketchLine(ctx, sx, sy, ex, ey, {
                color: p.color,
                lineWidth: 2.6 * scale,
                roughness: 0.9,
                seed: p.seed,
                passes: 2,
                alpha: a * 0.95,
              });
            } else if (p.kind === 'ring') {
              drawSketchCircle(ctx, p.x, p.y, p.size, {
                color: p.color,
                lineWidth: 2.1 * scale,
                roughness: 1.5,
                seed: p.seed,
                passes: 1,
                alpha: a * 0.85,
              });
            } else if (p.kind === 'crack') {
              const midX = p.x + Math.cos(p.angle) * p.size * 0.5;
              const midY = p.y + Math.sin(p.angle) * p.size * 0.35 + 3 * scale;
              const ex = p.x + Math.cos(p.angle - 0.3) * p.size;
              const ey = p.y + Math.sin(p.angle) * p.size * 0.45;
              drawSketchLine(ctx, p.x, p.y, midX, midY, {
                color: p.color,
                lineWidth: 1.9 * scale,
                roughness: 0.8,
                seed: p.seed,
                passes: 1,
                alpha: a * 0.85,
              });
              drawSketchLine(ctx, midX, midY, ex, ey, {
                color: p.color,
                lineWidth: 1.6 * scale,
                roughness: 0.8,
                seed: p.seed + 5,
                passes: 1,
                alpha: a * 0.8,
              });
            } else if (p.kind === 'star') {
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.angle);
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 1.6 * scale;
              ctx.globalAlpha = a * 0.9;
              ctx.beginPath();
              ctx.moveTo(-p.size, 0);
              ctx.lineTo(p.size, 0);
              ctx.moveTo(0, -p.size);
              ctx.lineTo(0, p.size);
              ctx.stroke();
              ctx.restore();
            } else if (p.kind === 'steam') {
              drawSketchCircle(ctx, p.x, p.y, p.size, {
                color: p.color,
                lineWidth: 1.3 * scale,
                roughness: 0.9,
                seed: p.seed,
                passes: 1,
                alpha: a * 0.56,
              });
            } else if (p.kind === 'oil') {
              ctx.save();
              ctx.fillStyle = p.color;
              ctx.globalAlpha = a * 0.85;
              ctx.beginPath();
              ctx.ellipse(p.x, p.y, p.size * 0.72, p.size * 1.15, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            } else if (p.kind === 'screw') {
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.angle);
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 1.6 * scale;
              ctx.globalAlpha = a * 0.92;
              ctx.beginPath();
              ctx.moveTo(-p.size * 0.7, 0);
              ctx.lineTo(p.size * 0.7, 0);
              ctx.moveTo(p.size * 0.45, -p.size * 0.55);
              ctx.lineTo(p.size * 0.45, p.size * 0.55);
              ctx.stroke();
              ctx.restore();
            } else if (p.kind === 'confetti') {
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.angle);
              ctx.fillStyle = p.color;
              ctx.globalAlpha = a * 0.92;
              ctx.fillRect(-p.size * 0.65, -p.size * 0.36, p.size * 1.3, p.size * 0.72);
              ctx.restore();
            } else if (p.kind === 'puff') {
              drawSketchCircle(ctx, p.x, p.y, p.size, {
                color: p.color,
                lineWidth: 1.4 * scale,
                roughness: 0.85,
                seed: p.seed,
                passes: 1,
                alpha: a * 0.65,
              });
            } else if (p.kind === 'cream') {
              ctx.save();
              ctx.fillStyle = p.color;
              ctx.globalAlpha = a * 0.9;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }

          // 10. Comic callouts
          for (const c of calloutsRef.current) {
            const a = Math.min(1, (c.life / c.maxLife) * 1.6);
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.tilt);
            ctx.font = `bold ${Math.round(24 * c.scale * scale)}px "Patrick Hand", cursive, sans-serif`;
            ctx.fillStyle = c.color;
            ctx.globalAlpha = a;
            ctx.textAlign = 'center';
            ctx.fillText(c.text, hash1D(c.y) * 0.8, 0);
            ctx.restore();
          }

          // 11. Handwritten KO banner right on the ruled paper
          if (phaseRef.current === 'KO') {
            const centerX = (paper.marginX + paper.width) * 0.5;
            const koY = Math.max(125, paper.floorY - 190 * scale);
            const winSide = winnerRef.current;
            const winFighter = winSide === 'left' ? left : right;
            const winName = winFighter ? winFighter.characterDef.name : 'Người Que';
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = `bold ${Math.round(42 * scale)}px "Patrick Hand", cursive, sans-serif`;
            ctx.fillStyle = winSide === 'left' ? '#1E3A8A' : '#991B1B';
            ctx.fillText(
              winSide === 'left' ? `${winName} Xanh thắng!` : `${winName} Đỏ thắng!`,
              centerX,
              koY,
            );
            drawSketchLine(ctx, centerX - 135 * scale, koY + 10, centerX + 135 * scale, koY + 10, {
              color: winSide === 'left' ? '#2563EB' : '#DC2626',
              lineWidth: 2.2,
              roughness: 1.3,
              seed: 900 + boilTick,
              passes: 2,
              alpha: 0.78,
            });
            ctx.restore();
          }

          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [findTargetFighterAt, syncPhase, triggerFightStart]);

  const getLocalPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    sfx.unlock();
    const { x, y } = getLocalPoint(e);
    if (isCharSelectOpenRef.current) return;
    const left = leftFighterRef.current;
    const right = rightFighterRef.current;
    if (!left || !right) return;

    // If user tap-selected a weapon from the tray and then taps a stick figure, equip it
    if (selectedTrayRef.current) {
      const target = findTargetFighterAt(x, y);
      if (target) {
        equipWeaponToFighter(target, selectedTrayRef.current);
        setSelectedTrayWeapon(null);
        return;
      }
      setSelectedTrayWeapon(null);
    }

    const hitLeft = left.action !== 'ENTRANCE_JUMP' && left.containsPoint(x, y);
    const hitRight = right.action !== 'ENTRANCE_JUMP' && right.containsPoint(x, y);

    let chosen: StickFighter | null = null;
    if (hitLeft && hitRight) {
      const dL = Math.hypot(x - left.x, y - (left.y - 45 * left.scale));
      const dR = Math.hypot(x - right.x, y - (right.y - 45 * right.scale));
      chosen = dL <= dR ? left : right;
    } else if (hitLeft) {
      chosen = left;
    } else if (hitRight) {
      chosen = right;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;

    if (chosen) {
      draggedFighterRef.current = chosen;
      lastMoveTimeRef.current = performance.now();
      chosen.startDrag(x, y);
      setIsDraggingAny(true);
    } else {
      // Empty paper -> start freehand weapon scribble!
      drawingStrokeRef.current = [{ x, y }];
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getLocalPoint(e);
    const paper = paperRef.current;
    const dragged = draggedFighterRef.current;

    if (dragged && activePointerIdRef.current === e.pointerId && paper) {
      const now = performance.now();
      const dt = Math.max(0.008, Math.min(0.05, (now - lastMoveTimeRef.current) / 1000));
      lastMoveTimeRef.current = now;
      const minX = paper.marginX + 26 * dragged.scale;
      const maxX = paper.width - 26 * dragged.scale;
      dragged.moveDrag(x, y, dt, minX, maxX, paper.floorY);
      return;
    }

    if (drawingStrokeRef.current && activePointerIdRef.current === e.pointerId) {
      const pts = drawingStrokeRef.current;
      const last = pts[pts.length - 1];
      if (Math.hypot(x - last.x, y - last.y) >= 5) {
        pts.push({ x, y });
      }
      return;
    }

    const left = leftFighterRef.current;
    const right = rightFighterRef.current;
    const over = Boolean(left?.containsPoint(x, y) || right?.containsPoint(x, y));
    if (over !== hoveringFighter) {
      setHoveringFighter(over);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const dragged = draggedFighterRef.current;
    const paper = paperRef.current;

    if (dragged && activePointerIdRef.current === e.pointerId && paper) {
      dragged.endDrag(paper.floorY);
      draggedFighterRef.current = null;
      activePointerIdRef.current = null;
      setIsDraggingAny(false);
    } else if (drawingStrokeRef.current && activePointerIdRef.current === e.pointerId) {
      const stroke = drawingStrokeRef.current;
      drawingStrokeRef.current = null;
      activePointerIdRef.current = null;

      const weapon = createDrawnWeaponFromStroke(stroke, '#1E293B');
      if (weapon) {
        drawnWeaponsRef.current.push(weapon);
        sfx.playWhoosh();
      }
    }

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleTrayWeaponPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    type: WeaponType,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    sfx.unlock();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    trayDragRef.current = {
      type,
      x,
      y,
      startX: x,
      startY: y,
      moved: false,
    };
    setIsDraggingAny(true);
  };

  const openCharacterSelector = () => {
    sfx.unlock();
    sfx.playPageFlip();
    setSelectedTrayWeapon(null);
    setIsNotebookOpen(false);
    setSelectingSide('left');
    const resetSess = { left: false, right: false };
    sessionPickedRef.current = resetSess;
    setSessionPicked(resetSess);
    setIsCharSelectOpen((prev) => !prev);
  };

  const cursorClass = isDraggingAny
    ? 'cursor-grabbing'
    : hoveringFighter
      ? 'cursor-grab'
      : 'cursor-crosshair';

  return (
    <div
      ref={containerRef}
      className="relative h-dvh w-screen overflow-hidden bg-[#FDF8EB]"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`block h-full w-full touch-none ${cursorClass}`}
      />

      {/* Centered card-row character selector (opens only when user clicks Chọn nhân vật) */}
      <CharacterSelectOverlay
        isVisible={isCharSelectOpen}
        selectingSide={selectingSide}
        pickedCharacters={pickedCharacters}
        sessionPicked={sessionPicked}
        onChangeSide={(side) => setSelectingSide(side)}
        onSelectCharacter={handleSelectCharacter}
        onClose={() => setIsCharSelectOpen(false)}
      />

      {/* Bottom Weapon selector dock */}
      {!isCharSelectOpen && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex max-w-[calc(100vw-16px)] -translate-x-1/2 flex-col items-center gap-1">
          <span className="font-hand text-sm whitespace-nowrap text-slate-600">
            {selectedTrayWeapon
              ? `Chạm vào nhân vật để trao ${WEAPONS[selectedTrayWeapon].name}`
              : 'Chọn & kéo vũ khí vào nhân vật'}
          </span>
          <div
            className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-slate-400/55 bg-[#FDF8EB]/92 px-1.5 py-1.5 shadow-xs sm:gap-2 sm:px-2.5"
            role="group"
            aria-label="Chọn vũ khí"
          >
            {WEAPON_LIST.map((w) => {
              const isSelected = selectedTrayWeapon === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onPointerDown={(e) => handleTrayWeaponPointerDown(e, w.id)}
                  className={`flex min-h-[52px] min-w-[56px] cursor-grab flex-col items-center justify-center rounded-md border px-1.5 py-1 transition-colors active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:min-h-[54px] sm:min-w-[64px] sm:px-2 ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50/80 text-blue-900'
                      : 'border-slate-300/75 bg-[#FAF2DD]/70 text-slate-800 hover:border-slate-500 hover:bg-[#F4E9CC]'
                  }`}
                >
                  <WeaponTrayIcon type={w.id} />
                  <span className="font-hand text-sm leading-none whitespace-nowrap">
                    {w.name}
                  </span>
                  <span className="text-[10px] leading-tight whitespace-nowrap text-slate-500 tabular-nums">
                    {w.id === 'shield' ? w.trait : `${w.trait} · ${w.heavyDamage}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Corner Combo Notebook & Character Selector buttons: top-left on mobile (<768px), bottom-left on desktop (>=768px) */}
      <div className="pointer-events-none fixed top-3 left-3 z-20 flex items-center gap-1.5 md:top-auto md:bottom-4 md:left-4 md:gap-2">
        <button
          type="button"
          onClick={() => {
            sfx.unlock();
            sfx.playPageFlip();
            setIsCharSelectOpen(false);
            setIsNotebookOpen((prev) => !prev);
          }}
          aria-expanded={isNotebookOpen}
          aria-label="Mở sổ tay chiêu thức"
          className={`pointer-events-auto inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-2 text-sm font-semibold whitespace-nowrap shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:px-3 ${
            isNotebookOpen
              ? 'border-blue-700 bg-blue-50/95 text-blue-900'
              : 'border-slate-500/65 bg-[#FDF8EB]/95 text-slate-800 hover:border-slate-800 hover:bg-[#F7EED8]'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4.5 w-4.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 4.5 C5 3.6 5.7 3 6.6 3 H18.5 V20.5 H6.6 C5.7 20.5 5 19.8 5 19 Z" />
            <path d="M8.5 3.2 V20.3" stroke="#DF646E" strokeWidth="1.5" />
            <path d="M11 8 H16 M11 11.5 H16 M11 15 H14.5" strokeWidth="1.4" />
            <path d="M3.5 6.5 H5.5 M3.5 11.5 H5.5 M3.5 16.5 H5.5" strokeWidth="1.8" />
          </svg>
          <span className="font-hand text-base leading-none">Sổ tay</span>
        </button>

        <button
          type="button"
          onClick={openCharacterSelector}
          aria-expanded={isCharSelectOpen}
          aria-label="Chọn nhân vật"
          className={`pointer-events-auto inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-2 text-sm font-semibold whitespace-nowrap shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:px-3 ${
            isCharSelectOpen
              ? 'border-blue-700 bg-blue-50/95 text-blue-900'
              : 'border-slate-500/65 bg-[#FDF8EB]/95 text-slate-800 hover:border-slate-800 hover:bg-[#F7EED8]'
          }`}
        >
          <Users className="h-4 w-4 shrink-0" />
          <span className="font-hand text-base leading-none">
            <span className="hidden xl:inline">Chọn nhân vật</span>
            <span className="xl:hidden">Nhân vật</span>
          </span>
        </button>
      </div>

      {/* Minimal utility controls: top-right on mobile (<768px), bottom-right on desktop (>=768px) */}
      <div className="pointer-events-none fixed top-3 right-3 z-20 flex items-center gap-2 md:top-auto md:right-4 md:bottom-4">
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="pointer-events-auto inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-slate-400/55 bg-[#FDF8EB]/92 px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-700 shadow-xs transition-colors hover:border-slate-600 hover:bg-[#F7EED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          <span className="hidden lg:inline">{muted ? 'Đã tắt' : 'Âm thanh'}</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="pointer-events-auto inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-slate-700/75 bg-[#FDF8EB]/95 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-slate-800 shadow-xs transition-colors hover:bg-slate-800 hover:text-[#FDF8EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{phase === 'KO' ? 'Đấu lại' : 'Đặt lại'}</span>
        </button>
      </div>

      <ComboNotebook
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
      />
    </div>
  );
};
