import { drawSketchCircle, drawSketchLine, drawSketchPolyline, hash1D } from './sketchDraw';

export type WeaponType = 'sword' | 'bat' | 'spear' | 'hammer' | 'shield';
export type PrimaryWeaponType = Exclude<WeaponType, 'shield'>;

export interface WeaponDef {
  id: WeaponType;
  name: string;
  trait: string;
  length: number;
  lightDamage: number;
  heavyDamage: number;
  extraReach: number;
  knockbackX: number;
  knockbackY: number;
  cooldownMult: number;
  blockPenetration: number; // fraction of damage passing through block
  hitstop: number;
  shake: number;
  heavyOverride: boolean;
  callouts: string[];
  color: string;
}

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  sword: {
    id: 'sword',
    name: 'Kiếm',
    trait: 'Chém nhanh',
    length: 50,
    lightDamage: 11,
    heavyDamage: 18,
    extraReach: 24,
    knockbackX: 200,
    knockbackY: -90,
    cooldownMult: 0.9,
    blockPenetration: 0.22,
    hitstop: 0.028,
    shake: 3.5,
    heavyOverride: false,
    callouts: ['XOẸT!', 'XOẠC!', 'SẮC!'],
    color: '#334155',
  },
  bat: {
    id: 'bat',
    name: 'Gậy',
    trait: 'Đánh văng',
    length: 44,
    lightDamage: 11,
    heavyDamage: 19,
    extraReach: 22,
    knockbackX: 480,
    knockbackY: -270,
    cooldownMult: 0.96,
    blockPenetration: 0.25,
    hitstop: 0.048,
    shake: 6.5,
    heavyOverride: true,
    callouts: ['CỐP!', 'VÚT!', 'BỐP!'],
    color: '#78350F',
  },
  spear: {
    id: 'spear',
    name: 'Giáo',
    trait: 'Đâm xa',
    length: 68,
    lightDamage: 12,
    heavyDamage: 20,
    extraReach: 48,
    knockbackX: 265,
    knockbackY: -80,
    cooldownMult: 0.88,
    blockPenetration: 0.58,
    hitstop: 0.032,
    shake: 4,
    heavyOverride: false,
    callouts: ['PHẬP!', 'CHÍU!', 'XUYÊN!'],
    color: '#475569',
  },
  hammer: {
    id: 'hammer',
    name: 'Búa',
    trait: 'Cực mạnh',
    length: 48,
    lightDamage: 18,
    heavyDamage: 33,
    extraReach: 24,
    knockbackX: 410,
    knockbackY: -185,
    cooldownMult: 1.26,
    blockPenetration: 0.45,
    hitstop: 0.072,
    shake: 10.5,
    heavyOverride: true,
    callouts: ['RẦM!', 'BÙM!', 'NÁT!'],
    color: '#334155',
  },
  shield: {
    id: 'shield',
    name: 'Khiên',
    trait: 'Chắn đòn',
    length: 28,
    lightDamage: 8,
    heavyDamage: 12,
    extraReach: 10,
    knockbackX: 260,
    knockbackY: -80,
    cooldownMult: 1,
    blockPenetration: 0.2,
    hitstop: 0.03,
    shake: 4,
    heavyOverride: false,
    callouts: ['KENG!', 'ĐỠ!', 'CHẮN!'],
    color: '#1E3A8A',
  },
};

export const WEAPON_REACH: Record<WeaponType | 'unarmed', number> = {
  unarmed: 62,
  shield: 65,
  bat: 88,
  hammer: 90,
  sword: 94,
  spear: 114,
};

export const WEAPON_LIST: WeaponDef[] = [
  WEAPONS.sword,
  WEAPONS.bat,
  WEAPONS.spear,
  WEAPONS.hammer,
  WEAPONS.shield,
];

export function drawHeldShield(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: 1 | -1,
  crouching: boolean,
  scale: number,
  seed: number,
  style: 'standard' | 'lonsat' | 'hebongbay' = 'standard',
) {
  const r = (crouching ? 19.5 : 16) * scale;
  const x = cx + facing * (crouching ? 6 : 3) * scale;
  const y = cy + (crouching ? -2 : 0) * scale;

  if (style === 'hebongbay') {
    // Waiter serving tray ("mâm bưng đồ") with shiny metallic rim & cream dome accent
    drawSketchCircle(ctx, x, y, r * 1.04, {
      color: '#334155',
      lineWidth: 2.5 * scale,
      roughness: 0.75,
      seed: seed + 1,
      passes: 2,
      alpha: 0.96,
    });
    drawSketchCircle(ctx, x, y, r * 0.78, {
      color: '#94A3B8',
      lineWidth: 1.5 * scale,
      roughness: 0.5,
      seed: seed + 2,
      passes: 1,
      alpha: 0.85,
    });
    // Small cream puff swirl in center of tray
    ctx.save();
    ctx.fillStyle = 'rgba(254, 249, 195, 0.85)';
    ctx.beginPath();
    ctx.arc(x + facing * 1.5 * scale, y, 5.2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawSketchCircle(ctx, x + facing * 1.5 * scale, y, 5.2 * scale, {
      color: '#F59E0B',
      lineWidth: 1.6 * scale,
      roughness: 0.5,
      seed: seed + 5,
      passes: 1,
    });
    return;
  }

  if (style === 'lonsat') {
    // Iron pot-lid ("nắp nồi sắt") with curved metal lip, rivets & central knob
    drawSketchCircle(ctx, x, y, r * 1.02, {
      color: '#334155',
      lineWidth: 2.7 * scale,
      roughness: 0.75,
      seed: seed + 1,
      passes: 2,
      alpha: 0.96,
    });
    drawSketchCircle(ctx, x, y, r * 0.72, {
      color: '#64748B',
      lineWidth: 1.6 * scale,
      roughness: 0.55,
      seed: seed + 2,
      passes: 1,
      alpha: 0.85,
    });
    // Subtle metallic sheen strokes
    drawSketchLine(ctx, x - r * 0.42, y - r * 0.36, x + r * 0.18, y - r * 0.48, {
      color: '#94A3B8',
      lineWidth: 1.5 * scale,
      roughness: 0.3,
      seed: seed + 3,
      passes: 1,
      alpha: 0.75,
    });
    // 4 perimeter lid rivets
    ctx.save();
    ctx.fillStyle = '#334155';
    for (let ri = 0; ri < 4; ri++) {
      const a = (Math.PI * 2 * ri) / 4 + 0.4;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r * 0.84, y + Math.sin(a) * r * 0.84, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Chunky center pot-lid knob handle
    drawSketchCircle(ctx, x + facing * 2.5 * scale, y, 4.4 * scale, {
      color: '#1E293B',
      lineWidth: 2.3 * scale,
      roughness: 0.4,
      seed: seed + 5,
      passes: 2,
    });
    return;
  }

  // Outer shield rim (double-pass ballpoint ink)
  drawSketchCircle(ctx, x, y, r, {
    color: '#1E293B',
    lineWidth: 2.6 * scale,
    roughness: 1.05,
    seed: seed + 1,
    passes: 2,
    alpha: 0.94,
  });

  // Inner wooden/iron trim circle
  drawSketchCircle(ctx, x, y, r * 0.65, {
    color: '#92400E',
    lineWidth: 1.7 * scale,
    roughness: 0.85,
    seed: seed + 2,
    passes: 1,
    alpha: 0.8,
  });

  // Cross-brace lines + center boss
  drawSketchLine(ctx, x - r * 0.72, y, x + r * 0.72, y, {
    color: '#78350F',
    lineWidth: 1.6 * scale,
    roughness: 0.6,
    seed: seed + 3,
    passes: 1,
    alpha: 0.75,
  });
  drawSketchLine(ctx, x, y - r * 0.72, x, y + r * 0.72, {
    color: '#78350F',
    lineWidth: 1.6 * scale,
    roughness: 0.6,
    seed: seed + 4,
    passes: 1,
    alpha: 0.75,
  });
  drawSketchCircle(ctx, x, y, 3.6 * scale, {
    color: '#1E293B',
    lineWidth: 2 * scale,
    roughness: 0.4,
    seed: seed + 5,
    passes: 2,
  });
}

export interface ThrownShield {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  omega: number;
  scale: number;
  ownerSide: 'left' | 'right';
  mode: 'ATTACK' | 'BOOMERANG' | 'LOOSE_BOUNCE' | 'RESTING';
  pickupDelay: number;
  restTimer: number;
  fadeTimer: number;
  dodgedTarget: boolean;
  seed: number;
  damage?: number;
  style?: 'standard' | 'lonsat' | 'hebongbay';
}

let nextShieldId = 1;

export function createThrownShield(
  x: number,
  y: number,
  vx: number,
  vy: number,
  scale: number,
  ownerSide: 'left' | 'right',
  damage = 18,
  style: 'standard' | 'lonsat' | 'hebongbay' = 'standard',
): ThrownShield {
  const id = nextShieldId++;
  return {
    id,
    x,
    y,
    vx,
    vy,
    angle: 0,
    omega: (vx >= 0 ? 1 : -1) * 14,
    scale,
    ownerSide,
    mode: 'ATTACK',
    pickupDelay: 0.18,
    restTimer: 12,
    fadeTimer: 1.4,
    dodgedTarget: false,
    seed: 500 + id * 37.3,
    damage,
    style,
  };
}

export function drawThrownShield(
  ctx: CanvasRenderingContext2D,
  s: ThrownShield,
  boilTick: number,
) {
  const alpha =
    s.mode === 'RESTING' && s.restTimer <= 0 ? Math.max(0, s.fadeTimer / 1.4) : 0.96;
  if (alpha <= 0.02) return;

  const r = 16.5 * s.scale;
  const seed = s.seed + boilTick * 4.7;
  const isFlying = s.mode === 'ATTACK' || s.mode === 'BOOMERANG';

  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.angle);

  // Subtle spinning speed arcs when flying through the air
  if (isFlying) {
    drawSketchLine(ctx, -r * 1.45, -r * 0.55, -r * 0.85, -r * 0.55, {
      color: s.mode === 'BOOMERANG' ? '#2563EB' : '#64748B',
      lineWidth: 1.5 * s.scale,
      roughness: 0.8,
      seed: seed + 20,
      passes: 1,
      alpha: 0.65 * alpha,
    });
    drawSketchLine(ctx, -r * 1.6, r * 0.4, -r * 0.95, r * 0.4, {
      color: s.mode === 'BOOMERANG' ? '#2563EB' : '#64748B',
      lineWidth: 1.5 * s.scale,
      roughness: 0.8,
      seed: seed + 21,
      passes: 1,
      alpha: 0.65 * alpha,
    });
  }

  if (s.style === 'hebongbay') {
    drawSketchCircle(ctx, 0, 0, r * 1.04, {
      color: '#334155',
      lineWidth: 2.5 * s.scale,
      roughness: 0.75,
      seed: seed + 1,
      passes: 2,
      alpha,
    });
    drawSketchCircle(ctx, 0, 0, r * 0.76, {
      color: '#94A3B8',
      lineWidth: 1.5 * s.scale,
      roughness: 0.5,
      seed: seed + 2,
      passes: 1,
      alpha: 0.85 * alpha,
    });
    drawSketchCircle(ctx, 0, 0, 4.5 * s.scale, {
      color: '#F59E0B',
      lineWidth: 1.7 * s.scale,
      roughness: 0.4,
      seed: seed + 5,
      passes: 1,
      alpha,
    });
  } else if (s.style === 'lonsat') {
    drawSketchCircle(ctx, 0, 0, r * 1.02, {
      color: '#334155',
      lineWidth: 2.7 * s.scale,
      roughness: 0.75,
      seed: seed + 1,
      passes: 2,
      alpha,
    });
    drawSketchCircle(ctx, 0, 0, r * 0.72, {
      color: '#64748B',
      lineWidth: 1.6 * s.scale,
      roughness: 0.55,
      seed: seed + 2,
      passes: 1,
      alpha: 0.85 * alpha,
    });
    drawSketchCircle(ctx, 0, 0, 4.2 * s.scale, {
      color: '#1E293B',
      lineWidth: 2.2 * s.scale,
      roughness: 0.4,
      seed: seed + 5,
      passes: 2,
      alpha,
    });
  } else {
    drawSketchCircle(ctx, 0, 0, r, {
      color: '#1E293B',
      lineWidth: 2.6 * s.scale,
      roughness: 1.05,
      seed: seed + 1,
      passes: 2,
      alpha,
    });
    drawSketchCircle(ctx, 0, 0, r * 0.65, {
      color: '#92400E',
      lineWidth: 1.7 * s.scale,
      roughness: 0.85,
      seed: seed + 2,
      passes: 1,
      alpha: 0.82 * alpha,
    });
    drawSketchLine(ctx, -r * 0.72, 0, r * 0.72, 0, {
      color: '#78350F',
      lineWidth: 1.6 * s.scale,
      roughness: 0.6,
      seed: seed + 3,
      passes: 1,
      alpha: 0.78 * alpha,
    });
    drawSketchLine(ctx, 0, -r * 0.72, 0, r * 0.72, {
      color: '#78350F',
      lineWidth: 1.6 * s.scale,
      roughness: 0.6,
      seed: seed + 4,
      passes: 1,
      alpha: 0.78 * alpha,
    });
    drawSketchCircle(ctx, 0, 0, 3.6 * s.scale, {
      color: '#1E293B',
      lineWidth: 2 * s.scale,
      roughness: 0.4,
      seed: seed + 5,
      passes: 2,
      alpha,
    });
  }

  ctx.restore();
}

/**
 * Draws a hand-sketched weapon anchored at (ox, oy) pointing along (dx, dy) unit vector.
 */
export function drawHeldWeapon(
  ctx: CanvasRenderingContext2D,
  type: PrimaryWeaponType,
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  scale: number,
  seed: number,
  style: 'standard' | 'lonsat' | 'hebongbay' = 'standard',
) {
  const def = WEAPONS[type];
  const len = def.length * scale;
  // Perpendicular vector
  const px = -dy;
  const py = dx;

  const tipX = ox + dx * len;
  const tipY = oy + dy * len;

  if (type === 'sword') {
    if (style === 'hebongbay') {
      // Twisted colorful balloon sword ("kiếm bóng bay xoắn")
      const hiltX = ox + dx * (10 * scale);
      const hiltY = oy + dy * (10 * scale);
      // Balloon loop crossguard
      drawSketchCircle(ctx, hiltX - px * 5.5 * scale, hiltY - py * 5.5 * scale, 4.4 * scale, {
        color: '#7C3AED',
        lineWidth: 2.2 * scale,
        roughness: 0.6,
        seed: seed + 1,
        passes: 2,
      });
      drawSketchCircle(ctx, hiltX + px * 5.5 * scale, hiltY + py * 5.5 * scale, 4.4 * scale, {
        color: '#F59E0B',
        lineWidth: 2.2 * scale,
        roughness: 0.6,
        seed: seed + 2,
        passes: 2,
      });
      // Segmented balloon blade (3 rounded sausage links)
      const segs = 3;
      for (let i = 0; i < segs; i++) {
        const t0 = i / segs;
        const t1 = (i + 1) / segs;
        const sx = hiltX + (tipX - hiltX) * t0;
        const sy = hiltY + (tipY - hiltY) * t0;
        const ex = hiltX + (tipX - hiltX) * t1;
        const ey = hiltY + (tipY - hiltY) * t1;
        const col = i % 2 === 0 ? '#DC2626' : '#7C3AED';
        drawSketchLine(ctx, sx - px * 2.6 * scale, sy - py * 2.6 * scale, ex - px * 2.2 * scale, ey - py * 2.2 * scale, {
          color: col,
          lineWidth: 2.3 * scale,
          roughness: 0.65,
          seed: seed + 3 + i,
          passes: 2,
        });
        drawSketchLine(ctx, sx + px * 2.6 * scale, sy + py * 2.6 * scale, ex + px * 2.2 * scale, ey + py * 2.2 * scale, {
          color: col,
          lineWidth: 2.1 * scale,
          roughness: 0.65,
          seed: seed + 8 + i,
          passes: 1,
        });
      }
      // Balloon tie nipple at tip
      drawSketchCircle(ctx, tipX + dx * 2 * scale, tipY + dy * 2 * scale, 2.3 * scale, {
        color: '#F59E0B',
        lineWidth: 1.8 * scale,
        roughness: 0.4,
        seed: seed + 12,
        passes: 1,
      });
      return;
    }

    const hiltX = ox + dx * (10 * scale);
    const hiltY = oy + dy * (10 * scale);
    // Handle
    drawSketchLine(ctx, ox - dx * 5 * scale, oy - dy * 5 * scale, hiltX, hiltY, {
      color: '#475569',
      lineWidth: 2.8 * scale,
      roughness: 0.7,
      seed: seed + 1,
      passes: 2,
    });
    // Crossguard
    drawSketchLine(
      ctx,
      hiltX - px * 8 * scale,
      hiltY - py * 8 * scale,
      hiltX + px * 8 * scale,
      hiltY + py * 8 * scale,
      {
        color: '#92400E',
        lineWidth: 2.6 * scale,
        roughness: 0.7,
        seed: seed + 2,
        passes: 2,
      },
    );
    // Blade edges tapering to point
    drawSketchLine(
      ctx,
      hiltX - px * 3 * scale,
      hiltY - py * 3 * scale,
      tipX,
      tipY,
      {
        color: '#1E293B',
        lineWidth: 2.1 * scale,
        roughness: 0.9,
        seed: seed + 3,
        passes: 2,
      },
    );
    drawSketchLine(
      ctx,
      hiltX + px * 3 * scale,
      hiltY + py * 3 * scale,
      tipX,
      tipY,
      {
        color: '#475569',
        lineWidth: 1.7 * scale,
        roughness: 0.9,
        seed: seed + 4,
        passes: 1,
      },
    );
    return;
  }

  if (type === 'bat') {
    if (style === 'hebongbay') {
      // Colorful circus pom-pom baton ("gậy tung hứng có bông")
      const gripX = ox - dx * (4 * scale);
      const gripY = oy - dy * (4 * scale);
      drawSketchLine(ctx, gripX, gripY, tipX - dx * 5 * scale, tipY - dy * 5 * scale, {
        color: '#7C3AED',
        lineWidth: 3.1 * scale,
        roughness: 0.7,
        seed: seed + 5,
        passes: 2,
      });
      // Spiral gold stripes along baton shaft
      for (let bi = 1; bi <= 3; bi++) {
        const bx = gripX + (tipX - gripX) * (bi * 0.22);
        const by = gripY + (tipY - gripY) * (bi * 0.22);
        drawSketchLine(ctx, bx - px * 2.5 * scale, by - py * 2.5 * scale, bx + px * 2.5 * scale, by + py * 2.5 * scale, {
          color: '#F59E0B',
          lineWidth: 2.0 * scale,
          roughness: 0.5,
          seed: seed + 10 + bi,
          passes: 1,
        });
      }
      // Fluffy red/gold pom-pom at tip
      ctx.save();
      ctx.fillStyle = 'rgba(220, 38, 38, 0.24)';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 7.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawSketchCircle(ctx, tipX, tipY, 7.2 * scale, {
        color: '#DC2626',
        lineWidth: 2.3 * scale,
        roughness: 1.35,
        seed: seed + 15,
        passes: 2,
      });
      drawSketchCircle(ctx, tipX, tipY, 3.6 * scale, {
        color: '#F59E0B',
        lineWidth: 1.8 * scale,
        roughness: 0.8,
        seed: seed + 16,
        passes: 1,
      });
      return;
    }

    const gripX = ox - dx * (4 * scale);
    const gripY = oy - dy * (4 * scale);
    // Tapered wooden club
    drawSketchLine(
      ctx,
      gripX - px * 1.5 * scale,
      gripY - py * 1.5 * scale,
      tipX - px * 4.5 * scale,
      tipY - py * 4.5 * scale,
      {
        color: '#78350F',
        lineWidth: 2.4 * scale,
        roughness: 0.9,
        seed: seed + 5,
        passes: 2,
      },
    );
    drawSketchLine(
      ctx,
      gripX + px * 1.5 * scale,
      gripY + py * 1.5 * scale,
      tipX + px * 4.5 * scale,
      tipY + py * 4.5 * scale,
      {
        color: '#92400E',
        lineWidth: 2.4 * scale,
        roughness: 0.9,
        seed: seed + 6,
        passes: 2,
      },
    );
    drawSketchLine(
      ctx,
      tipX - px * 4.5 * scale,
      tipY - py * 4.5 * scale,
      tipX + px * 4.5 * scale,
      tipY + py * 4.5 * scale,
      {
        color: '#78350F',
        lineWidth: 2.6 * scale,
        roughness: 0.7,
        seed: seed + 7,
        passes: 2,
      },
    );
    return;
  }

  if (type === 'spear') {
    if (style === 'hebongbay') {
      // Prank flag spear ("giáo đồ chơi bật cờ BANG!")
      const baseTailX = ox - dx * (14 * scale);
      const baseTailY = oy - dy * (14 * scale);
      const headBaseX = ox + dx * (len - 13 * scale);
      const headBaseY = oy + dy * (len - 13 * scale);
      drawSketchLine(ctx, baseTailX, baseTailY, headBaseX, headBaseY, {
        color: '#7C3AED',
        lineWidth: 2.5 * scale,
        roughness: 0.75,
        seed: seed + 8,
        passes: 2,
      });
      // Toy cork/cone tip
      drawSketchLine(ctx, headBaseX - px * 4.5 * scale, headBaseY - py * 4.5 * scale, tipX, tipY, {
        color: '#F59E0B',
        lineWidth: 2.2 * scale,
        roughness: 0.65,
        seed: seed + 9,
        passes: 2,
      });
      drawSketchLine(ctx, headBaseX + px * 4.5 * scale, headBaseY + py * 4.5 * scale, tipX, tipY, {
        color: '#DC2626',
        lineWidth: 2.0 * scale,
        roughness: 0.65,
        seed: seed + 10,
        passes: 2,
      });
      // Little triangular prank pennant hanging near head
      const fBaseX = headBaseX - dx * 6 * scale;
      const fBaseY = headBaseY - dy * 6 * scale;
      const fDropX = fBaseX + px * 9 * scale - dx * 5 * scale;
      const fDropY = fBaseY + py * 9 * scale - dy * 5 * scale;
      drawSketchLine(ctx, headBaseX, headBaseY, fDropX, fDropY, {
        color: '#DC2626',
        lineWidth: 1.8 * scale,
        roughness: 0.5,
        seed: seed + 11,
        passes: 1,
      });
      drawSketchLine(ctx, fBaseX, fBaseY, fDropX, fDropY, {
        color: '#F59E0B',
        lineWidth: 1.8 * scale,
        roughness: 0.5,
        seed: seed + 12,
        passes: 1,
      });
      return;
    }

    const baseTailX = ox - dx * (16 * scale);
    const baseTailY = oy - dy * (16 * scale);
    const headBaseX = ox + dx * (len - 13 * scale);
    const headBaseY = oy + dy * (len - 13 * scale);
    // Long shaft
    drawSketchLine(ctx, baseTailX, baseTailY, headBaseX, headBaseY, {
      color: '#78350F',
      lineWidth: 2.4 * scale,
      roughness: 0.95,
      seed: seed + 8,
      passes: 2,
    });
    // Sharp spearhead triangle
    drawSketchLine(
      ctx,
      headBaseX - px * 4.5 * scale,
      headBaseY - py * 4.5 * scale,
      tipX,
      tipY,
      {
        color: '#1E293B',
        lineWidth: 2.2 * scale,
        roughness: 0.7,
        seed: seed + 9,
        passes: 2,
      },
    );
    drawSketchLine(
      ctx,
      headBaseX + px * 4.5 * scale,
      headBaseY + py * 4.5 * scale,
      tipX,
      tipY,
      {
        color: '#DC2626',
        lineWidth: 1.8 * scale,
        roughness: 0.7,
        seed: seed + 10,
        passes: 1,
      },
    );
    drawSketchLine(
      ctx,
      headBaseX - px * 4.5 * scale,
      headBaseY - py * 4.5 * scale,
      headBaseX + px * 4.5 * scale,
      headBaseY + py * 4.5 * scale,
      {
        color: '#1E293B',
        lineWidth: 1.8 * scale,
        roughness: 0.6,
        seed: seed + 11,
        passes: 1,
      },
    );
    return;
  }

  // Hammer (or Lon Sắt's giant wrench "cờ lê khổng lồ" or Hề's smiley squeaky mallet)
  if (style === 'hebongbay') {
    const handleEndX = ox + dx * (len - 7 * scale);
    const handleEndY = oy + dy * (len - 7 * scale);
    drawSketchLine(ctx, ox - dx * 5 * scale, oy - dy * 5 * scale, handleEndX, handleEndY, {
      color: '#2563EB',
      lineWidth: 2.6 * scale,
      roughness: 0.6,
      seed: seed + 12,
      passes: 2,
    });
    const hcX = ox + dx * (len - 7 * scale);
    const hcY = oy + dy * (len - 7 * scale);
    const hw = 11.5 * scale;
    const hh = 7.2 * scale;
    const c1x = hcX - px * hw - dx * hh;
    const c1y = hcY - py * hw - dy * hh;
    const c2x = hcX + px * hw - dx * hh;
    const c2y = hcY + py * hw - dy * hh;
    const c3x = hcX + px * hw + dx * hh;
    const c3y = hcY + py * hw + dy * hh;
    const c4x = hcX - px * hw + dx * hh;
    const c4y = hcY - py * hw + dy * hh;
    ctx.save();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.beginPath();
    ctx.moveTo(c1x, c1y);
    ctx.lineTo(c2x, c2y);
    ctx.lineTo(c3x, c3y);
    ctx.lineTo(c4x, c4y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSketchLine(ctx, c1x, c1y, c2x, c2y, { color: '#DC2626', lineWidth: 2.5 * scale, roughness: 0.65, seed: seed + 13 });
    drawSketchLine(ctx, c2x, c2y, c3x, c3y, { color: '#F59E0B', lineWidth: 2.6 * scale, roughness: 0.65, seed: seed + 14 });
    drawSketchLine(ctx, c3x, c3y, c4x, c4y, { color: '#DC2626', lineWidth: 2.5 * scale, roughness: 0.65, seed: seed + 15 });
    drawSketchLine(ctx, c4x, c4y, c1x, c1y, { color: '#F59E0B', lineWidth: 2.6 * scale, roughness: 0.65, seed: seed + 16 });
    // Cute smiley face inside squeaky mallet head
    drawSketchCircle(ctx, hcX, hcY, 4.2 * scale, {
      color: '#1E293B',
      lineWidth: 1.4 * scale,
      roughness: 0.4,
      seed: seed + 18,
      passes: 1,
    });
    return;
  }

  if (style === 'lonsat') {
    const tailX = ox - dx * (8 * scale);
    const tailY = oy - dy * (8 * scale);
    const neckX = ox + dx * (len - 13 * scale);
    const neckY = oy + dy * (len - 13 * scale);
    // Double-bar metallic wrench handle
    drawSketchLine(ctx, tailX - px * 2.2 * scale, tailY - py * 2.2 * scale, neckX - px * 2.6 * scale, neckY - py * 2.6 * scale, {
      color: '#334155',
      lineWidth: 2.3 * scale,
      roughness: 0.6,
      seed: seed + 12,
      passes: 2,
    });
    drawSketchLine(ctx, tailX + px * 2.2 * scale, tailY + py * 2.2 * scale, neckX + px * 2.6 * scale, neckY + py * 2.6 * scale, {
      color: '#475569',
      lineWidth: 2.1 * scale,
      roughness: 0.6,
      seed: seed + 13,
      passes: 1,
    });
    // Bottom ring-end eye
    drawSketchCircle(ctx, tailX, tailY, 4.2 * scale, {
      color: '#334155',
      lineWidth: 2.1 * scale,
      roughness: 0.45,
      seed: seed + 14,
      passes: 1,
    });
    // Giant open-end C-jaw wrench head
    const jw = 10.5 * scale;
    const jawBaseX = neckX;
    const jawBaseY = neckY;
    const jawTipL = { x: jawBaseX + dx * 14 * scale - px * jw, y: jawBaseY + dy * 14 * scale - py * jw };
    const jawTipR = { x: jawBaseX + dx * 14 * scale + px * jw, y: jawBaseY + dy * 14 * scale + py * jw };
    const slotL = { x: jawBaseX + dx * 5.5 * scale - px * 4.5 * scale, y: jawBaseY + dy * 5.5 * scale - py * 4.5 * scale };
    const slotR = { x: jawBaseX + dx * 5.5 * scale + px * 4.5 * scale, y: jawBaseY + dy * 5.5 * scale + py * 4.5 * scale };
    const outerL = { x: jawBaseX + dx * 4 * scale - px * (jw * 1.05), y: jawBaseY + dy * 4 * scale - py * (jw * 1.05) };
    const outerR = { x: jawBaseX + dx * 4 * scale + px * (jw * 1.05), y: jawBaseY + dy * 4 * scale + py * (jw * 1.05) };

    drawSketchLine(ctx, jawBaseX - px * 2.8 * scale, jawBaseY - py * 2.8 * scale, outerL.x, outerL.y, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 0.5, seed: seed + 15 });
    drawSketchLine(ctx, outerL.x, outerL.y, jawTipL.x, jawTipL.y, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 0.5, seed: seed + 16 });
    drawSketchLine(ctx, jawTipL.x, jawTipL.y, slotL.x, slotL.y, { color: '#1E293B', lineWidth: 2.3 * scale, roughness: 0.5, seed: seed + 17 });
    drawSketchLine(ctx, slotL.x, slotL.y, slotR.x, slotR.y, { color: '#475569', lineWidth: 2.1 * scale, roughness: 0.4, seed: seed + 18 });
    drawSketchLine(ctx, slotR.x, slotR.y, jawTipR.x, jawTipR.y, { color: '#1E293B', lineWidth: 2.3 * scale, roughness: 0.5, seed: seed + 19 });
    drawSketchLine(ctx, jawTipR.x, jawTipR.y, outerR.x, outerR.y, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 0.5, seed: seed + 20 });
    drawSketchLine(ctx, outerR.x, outerR.y, jawBaseX + px * 2.8 * scale, jawBaseY + py * 2.8 * scale, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 0.5, seed: seed + 21 });
    return;
  }

  const handleEndX = ox + dx * (len - 6 * scale);
  const handleEndY = oy + dy * (len - 6 * scale);
  drawSketchLine(ctx, ox - dx * 6 * scale, oy - dy * 6 * scale, handleEndX, handleEndY, {
    color: '#78350F',
    lineWidth: 2.6 * scale,
    roughness: 0.85,
    seed: seed + 12,
    passes: 2,
  });

  const headCenterX = ox + dx * (len - 7 * scale);
  const headCenterY = oy + dy * (len - 7 * scale);
  const hw = 10 * scale;
  const hh = 6 * scale;
  const c1x = headCenterX - px * hw - dx * hh;
  const c1y = headCenterY - py * hw - dy * hh;
  const c2x = headCenterX + px * hw - dx * hh;
  const c2y = headCenterY + py * hw - dy * hh;
  const c3x = headCenterX + px * hw + dx * hh;
  const c3y = headCenterY + py * hw + dy * hh;
  const c4x = headCenterX - px * hw + dx * hh;
  const c4y = headCenterY - py * hw + dy * hh;

  drawSketchLine(ctx, c1x, c1y, c2x, c2y, { color: '#1E293B', lineWidth: 2.4 * scale, roughness: 0.7, seed: seed + 13 });
  drawSketchLine(ctx, c2x, c2y, c3x, c3y, { color: '#1E293B', lineWidth: 2.4 * scale, roughness: 0.7, seed: seed + 14 });
  drawSketchLine(ctx, c3x, c3y, c4x, c4y, { color: '#1E293B', lineWidth: 2.4 * scale, roughness: 0.7, seed: seed + 15 });
  drawSketchLine(ctx, c4x, c4y, c1x, c1y, { color: '#1E293B', lineWidth: 2.4 * scale, roughness: 0.7, seed: seed + 16 });
  // Crosshatch scribble inside hammer head
  drawSketchLine(ctx, c1x, c1y, c3x, c3y, { color: '#475569', lineWidth: 1.5 * scale, roughness: 0.6, seed: seed + 17, passes: 1, alpha: 0.65 });
  drawSketchLine(ctx, c2x, c2y, c4x, c4y, { color: '#475569', lineWidth: 1.5 * scale, roughness: 0.6, seed: seed + 18, passes: 1, alpha: 0.65 });
}

export interface DrawnWeapon {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  omega: number;
  localPoints: Array<{ x: number; y: number }>;
  radius: number;
  halfHeight: number;
  damage: number;
  knockback: number;
  sharpness: number;
  totalLength: number;
  color: string;
  seed: number;
  state: 'FALLING' | 'RESTING';
  restTimer: number;
  fadeTimer: number;
  hitUnitIds: Set<number>;
}

let nextDrawnId = 1;

/**
 * Analyzes a user's freehand doodle stroke and turns it into a physical falling weapon.
 * Damage scales with bounding size, total ink length, and sharpness (acute angles / spikes / thin pointiness).
 */
export function createDrawnWeaponFromStroke(
  rawPoints: Array<{ x: number; y: number }>,
  color = '#1E293B',
): DrawnWeapon | null {
  if (rawPoints.length < 2) return null;

  // Resample points so spacing is consistent (~8px) for clean angle/sharpness analysis
  const pts: Array<{ x: number; y: number }> = [rawPoints[0]];
  let totalLength = 0;
  for (let i = 1; i < rawPoints.length; i++) {
    const prev = pts[pts.length - 1];
    const curr = rawPoints[i];
    const d = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    if (d >= 7 || i === rawPoints.length - 1) {
      totalLength += d;
      pts.push(curr);
    }
  }

  if (totalLength < 20 || pts.length < 2) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let sumX = 0;
  let sumY = 0;

  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    sumX += p.x;
    sumY += p.y;
  }

  const cx = sumX / pts.length;
  const cy = sumY / pts.length;
  const w = Math.max(8, maxX - minX);
  const h = Math.max(8, maxY - minY);
  const bboxDiag = Math.hypot(w, h);

  // Measure sharpness: count acute bends / spikes along the polyline
  let sharpScoreAccum = 0;
  let sharpVertexCount = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const ax = pts[i].x - pts[i - 1].x;
    const ay = pts[i].y - pts[i - 1].y;
    const bx = pts[i + 1].x - pts[i].x;
    const by = pts[i + 1].y - pts[i].y;
    const la = Math.hypot(ax, ay);
    const lb = Math.hypot(bx, by);
    if (la < 2 || lb < 2) continue;

    const dot = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)));
    // Turn angle in [0, PI]: PI = complete 180° hairpin spike!
    const turn = Math.acos(dot);
    if (turn > Math.PI * 0.48) {
      // Sharp corner / spike!
      sharpScoreAccum += (turn - Math.PI * 0.45) / (Math.PI * 0.55);
      sharpVertexCount++;
    }
  }

  // Elongated needle/spear-like strokes also carry intrinsic pointiness
  const aspect = Math.max(w / h, h / w);
  const elongationBonus = Math.min(0.45, Math.max(0, (aspect - 1.8) * 0.12));
  const vertexSharpness = Math.min(1, sharpScoreAccum * 0.28 + sharpVertexCount * 0.08);
  const sharpness = Math.max(0.05, Math.min(1, vertexSharpness + elongationBonus));

  // Damage calculation: length + size + sharpness multiplier
  const lengthComponent = Math.min(26, totalLength / 26);
  const sizeComponent = Math.min(18, bboxDiag / 18);
  const rawDmg = (4 + lengthComponent + sizeComponent) * (0.72 + sharpness * 1.05);
  const damage = Math.max(5, Math.min(60, Math.round(rawDmg)));
  const knockback = Math.round(130 + sizeComponent * 11 + sharpness * 140);

  const localPoints = pts.map((p) => ({ x: p.x - cx, y: p.y - cy }));
  let maxR = 8;
  for (const lp of localPoints) {
    const d = Math.hypot(lp.x, lp.y);
    if (d > maxR) maxR = d;
  }

  const id = nextDrawnId++;
  return {
    id,
    x: cx,
    y: cy,
    vx: (hash1D(id * 3.1) * 28),
    vy: 25,
    angle: 0,
    omega: hash1D(id * 7.3) * 3.2,
    localPoints,
    radius: maxR,
    halfHeight: Math.max(8, h * 0.45),
    damage,
    knockback,
    sharpness,
    totalLength,
    color,
    seed: id * 41.7,
    state: 'FALLING',
    restTimer: 4.5,
    fadeTimer: 1.25,
    hitUnitIds: new Set(),
  };
}

export function drawFallingWeapon(
  ctx: CanvasRenderingContext2D,
  w: DrawnWeapon,
  boilTick: number,
) {
  const alpha = w.state === 'RESTING' && w.restTimer <= 0 ? Math.max(0, w.fadeTimer / 1.25) : 0.92;
  if (alpha <= 0.02) return;

  ctx.save();
  ctx.translate(w.x, w.y);
  ctx.rotate(w.angle);

  const pts = w.localPoints;
  const seed = w.seed + boilTick * 5.3;
  for (let i = 0; i < pts.length - 1; i++) {
    drawSketchLine(ctx, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, {
      color: w.color,
      lineWidth: 2.7,
      roughness: 1.15,
      seed: seed + i * 11.1,
      passes: 2,
      alpha,
    });
  }
  ctx.restore();
}

export interface PaperTear {
  x: number;
  y: number;
  width: number;
  life: number;
  maxLife: number;
  seed: number;
}

export function drawPaperTear(
  ctx: CanvasRenderingContext2D,
  tear: PaperTear,
  boilTick: number,
) {
  const alpha = tear.life < 1.2 ? Math.max(0, tear.life / 1.2) : 0.95;
  if (alpha <= 0.02) return;

  const half = tear.width * 0.5;
  const segments = 9;
  const topPts: Array<{ x: number; y: number }> = [];
  const botPts: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const px = tear.x - half + t * tear.width;
    const envelope = Math.sin(t * Math.PI);
    const gap = (3.5 + Math.abs(hash1D(tear.seed + i * 7.3)) * 5.5) * envelope;
    const jag = hash1D(tear.seed + i * 13.1) * 4.5 * envelope;
    topPts.push({ x: px, y: tear.y - gap + jag });
    botPts.push({ x: px, y: tear.y + gap + jag });
  }

  // Dark inner gap beneath torn notebook sheet
  ctx.save();
  ctx.globalAlpha = alpha * 0.72;
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(topPts[0].x, topPts[0].y);
  for (let i = 1; i < topPts.length; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
  for (let i = botPts.length - 1; i >= 0; i--) ctx.lineTo(botPts[i].x, botPts[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Jagged ripped paper edge ink outlines + radiating paper creases
  const seed = tear.seed + boilTick * 0.1;
  for (let i = 0; i < segments; i++) {
    drawSketchLine(ctx, topPts[i].x, topPts[i].y, topPts[i + 1].x, topPts[i + 1].y, {
      color: '#1E293B',
      lineWidth: 2,
      roughness: 0.7,
      seed: seed + i * 3,
      passes: 1,
      alpha,
    });
    drawSketchLine(ctx, botPts[i].x, botPts[i].y, botPts[i + 1].x, botPts[i + 1].y, {
      color: '#475569',
      lineWidth: 1.7,
      roughness: 0.7,
      seed: seed + 50 + i * 3,
      passes: 1,
      alpha: alpha * 0.9,
    });
  }

  // Torn curl crease cracks branching off the rip
  for (let i = 0; i < 4; i++) {
    const cx = tear.x + hash1D(tear.seed + i * 19.7) * half * 0.75;
    const dir = i % 2 === 0 ? -1 : 1;
    drawSketchLine(
      ctx,
      cx,
      tear.y + dir * 2,
      cx + hash1D(tear.seed + i * 29.1) * 22,
      tear.y + dir * (10 + Math.abs(hash1D(tear.seed + i * 31)) * 12),
      {
        color: '#64748B',
        lineWidth: 1.4,
        roughness: 0.8,
        seed: seed + 90 + i,
        passes: 1,
        alpha: alpha * 0.75,
      },
    );
  }
}

export interface PinnedSpear {
  x: number;
  y: number;
  facing: 1 | -1;
  scale: number;
  life: number;
  maxLife: number;
  seed: number;
  style?: 'standard' | 'hebongbay';
}

export function drawPinnedSpear(
  ctx: CanvasRenderingContext2D,
  ps: PinnedSpear,
  timeSec: number,
) {
  const alpha = ps.life < 0.25 ? Math.max(0, ps.life / 0.25) : 0.95;
  if (alpha <= 0.02) return;

  const s = ps.scale;
  // Decaying high-frequency vibration as the spear quivers in the paper!
  const vibAmp = (ps.life / ps.maxLife) * 0.095;
  const vib = Math.sin(timeSec * 56 + ps.seed) * vibAmp;

  // Embedded diagonally into the paper behind/through the pinned fighter
  const baseAngle = ps.facing === 1 ? 0.56 : Math.PI - 0.56;
  const angle = baseAngle + vib;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const tipX = ps.x + ps.facing * 8 * s;
  const tipY = ps.y;
  const tailX = tipX - dx * 64 * s;
  const tailY = tipY - dy * 64 * s;

  // Puncture cross tear on the paper at tip
  drawSketchLine(ctx, tipX - 6 * s, tipY - 3 * s, tipX + 6 * s, tipY + 3 * s, {
    color: '#334155',
    lineWidth: 1.6 * s,
    roughness: 0.6,
    seed: ps.seed + 1,
    passes: 1,
    alpha: alpha * 0.85,
  });
  drawSketchLine(ctx, tipX + 5 * s, tipY - 4 * s, tipX - 5 * s, tipY + 4 * s, {
    color: '#334155',
    lineWidth: 1.5 * s,
    roughness: 0.6,
    seed: ps.seed + 2,
    passes: 1,
    alpha: alpha * 0.85,
  });

  // Spear shaft & tip quivering
  drawSketchLine(ctx, tailX, tailY, tipX - dx * 10 * s, tipY - dy * 10 * s, {
    color: ps.style === 'hebongbay' ? '#7C3AED' : '#78350F',
    lineWidth: 2.5 * s,
    roughness: 0.7,
    seed: ps.seed + 3,
    passes: 2,
    alpha,
  });
  drawSketchLine(ctx, tipX - dx * 12 * s, tipY - dy * 12 * s, tipX, tipY, {
    color: ps.style === 'hebongbay' ? '#F59E0B' : '#DC2626',
    lineWidth: 2.6 * s,
    roughness: 0.6,
    seed: ps.seed + 4,
    passes: 2,
    alpha,
  });

  // Unfurled "BANG!" prank flag banner when Hề pins an enemy
  if (ps.style === 'hebongbay') {
    const midX = (tailX + tipX) * 0.5;
    const midY = (tailY + tipY) * 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FEF9C3';
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.6 * s;
    const bw = 42 * s;
    const bh = 16 * s;
    const bx = midX - bw * 0.5;
    const by = midY + 6 * s;
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.stroke();
    ctx.font = `700 ${Math.round(10.5 * s)}px "Patrick Hand", sans-serif`;
    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BANG!', midX, by + bh * 0.5 + 1);
    ctx.restore();
  }
}

export interface ThrownShuriken {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  omega: number;
  scale: number;
  ownerSide: 'left' | 'right';
  damage: number;
  life: number;
  maxLife: number;
  hasHit: boolean;
  hitOnce: true;
  blockable: true;
  seed: number;
}

let nextShurikenId = 1;

export function createThrownShuriken(
  x: number,
  y: number,
  vx: number,
  vy: number,
  scale: number,
  ownerSide: 'left' | 'right',
  damage = 7,
): ThrownShuriken {
  const id = nextShurikenId++;
  return {
    id,
    x,
    y,
    vx,
    vy,
    angle: 0,
    omega: (vx >= 0 ? 1 : -1) * 26,
    scale,
    ownerSide,
    damage,
    life: 1.6,
    maxLife: 1.6,
    hasHit: false,
    hitOnce: true,
    blockable: true,
    seed: 910 + id * 29.7,
  };
}

export function drawThrownShuriken(
  ctx: CanvasRenderingContext2D,
  sh: ThrownShuriken,
  boilTick: number,
) {
  if (sh.hasHit || sh.life <= 0) return;
  const s = sh.scale;
  const seed = sh.seed + boilTick * 5.3;
  const spd = Math.hypot(sh.vx, sh.vy) || 1;
  const dirX = sh.vx / spd;
  const dirY = sh.vy / spd;

  // Pencil streak behind the flying shuriken
  for (let i = 0; i < 2; i++) {
    const offPerp = (i === 0 ? -1 : 1) * 3.8 * s;
    const perpX = -dirY * offPerp;
    const perpY = dirX * offPerp;
    const startOff = 10 * s;
    const endOff = (28 + i * 7) * s;
    drawSketchLine(
      ctx,
      sh.x - dirX * startOff + perpX,
      sh.y - dirY * startOff + perpY,
      sh.x - dirX * endOff + perpX,
      sh.y - dirY * endOff + perpY,
      {
        color: i === 0 ? '#7C3AED' : '#475569',
        lineWidth: 1.5 * s,
        roughness: 0.45,
        seed: seed + 30 + i,
        passes: 1,
        alpha: 0.8,
      },
    );
  }

  const r = 9.5 * s;
  ctx.save();
  ctx.translate(sh.x, sh.y);
  ctx.rotate(sh.angle);

  // 4-point purple/dark-ink star blades
  const pts: Array<{ x: number; y: number }> = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const rad = k % 2 === 0 ? r : r * 0.34;
    pts.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad });
  }
  pts.push(pts[0]);

  ctx.fillStyle = '#7C3AED';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let k = 1; k < pts.length; k++) {
    ctx.lineTo(pts[k].x, pts[k].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  drawSketchPolyline(ctx, pts, {
    color: '#0F172A',
    lineWidth: 1.55 * s,
    roughness: 0.35,
    seed: seed + 1,
    passes: 1,
    alpha: 0.96,
  });

  drawSketchCircle(ctx, 0, 0, 1.9 * s, {
    color: '#7C3AED',
    lineWidth: 1.3 * s,
    roughness: 0.25,
    seed: seed + 5,
    passes: 1,
    alpha: 0.96,
  });

  ctx.restore();
}

