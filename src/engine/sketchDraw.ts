export interface SketchOptions {
  color?: string;
  lineWidth?: number;
  roughness?: number;
  seed?: number;
  passes?: number;
  alpha?: number;
  secondPassOffsetY?: number;
  waveAmp?: number;
}

// Fast deterministic hash in [-1, 1]
export function hash1D(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return (x - Math.floor(x)) * 2 - 1;
}

export function drawSketchLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts: SketchOptions = {},
) {
  const {
    color = '#1e3a8a',
    lineWidth = 2.6,
    roughness = 1.6,
    seed = 1,
    passes = 2,
    alpha = 0.9,
    secondPassOffsetY = 0,
    waveAmp = 0,
  } = opts;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return;

  // Perpendicular unit vector for organic wobble
  const nx = -dy / len;
  const ny = dx / len;
  const ux = dx / len;
  const uy = dy / len;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let p = 0; p < passes; p++) {
    const s = seed + p * 37.13;
    const passYOff = p === 1 ? secondPassOffsetY : 0;
    const jStart = hash1D(s + 1.1) * roughness;
    const jEnd = hash1D(s + 2.7) * roughness;
    const overshoot1 = hash1D(s + 3.9) * Math.min(2.2, len * 0.06);
    const overshoot2 = hash1D(s + 5.3) * Math.min(2.2, len * 0.06);

    const sx = x1 + nx * jStart - ux * Math.abs(overshoot1) * 0.4;
    const sy = y1 + passYOff + ny * jStart - uy * Math.abs(overshoot1) * 0.4;
    const ex = x2 + nx * jEnd + ux * Math.abs(overshoot2) * 0.4;
    const ey = y2 + passYOff + ny * jEnd + uy * Math.abs(overshoot2) * 0.4;

    const wave1 = waveAmp > 0 ? Math.sin(seed * 0.7) * waveAmp * Math.min(1.4, len / 26) : 0;
    const wave2 = waveAmp > 0 ? -Math.sin(seed * 0.7) * waveAmp * Math.min(1.4, len / 26) : 0;
    const midJitter1 = hash1D(s + 7.7) * roughness * 1.35 + wave1;
    const midJitter2 = hash1D(s + 9.4) * roughness * 1.15 + wave2;

    const c1x = x1 + dx * 0.33 + nx * midJitter1;
    const c1y = y1 + passYOff + dy * 0.33 + ny * midJitter1;
    const c2x = x1 + dx * 0.67 + nx * midJitter2;
    const c2y = y1 + passYOff + dy * 0.67 + ny * midJitter2;

    ctx.globalAlpha = p === 0 ? alpha : alpha * 0.55;
    ctx.lineWidth = p === 0 ? lineWidth : Math.max(1.1, lineWidth * 0.72);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawSketchCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  opts: SketchOptions = {},
) {
  const {
    color = '#1e3a8a',
    lineWidth = 2.6,
    roughness = 1.4,
    seed = 1,
    passes = 2,
    alpha = 0.92,
    secondPassOffsetY = 0,
  } = opts;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const segments = 16;

  for (let p = 0; p < passes; p++) {
    const s = seed + p * 53.7;
    const passYOff = p === 1 ? secondPassOffsetY : 0;
    const startAngle = hash1D(s + 0.5) * Math.PI;
    // Slight overdraw past 2*PI so the circle overlaps like a fast pen stroke
    const sweep = Math.PI * 2 + 0.32 + Math.abs(hash1D(s + 1.9)) * 0.35;

    ctx.globalAlpha = p === 0 ? alpha : alpha * 0.5;
    ctx.lineWidth = p === 0 ? lineWidth : Math.max(1.1, lineWidth * 0.72);
    ctx.beginPath();

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = startAngle + t * sweep;
      const radialWobble =
        hash1D(s + i * 3.17) * roughness * 0.85 +
        Math.sin(angle * 2 + s) * (roughness * 0.4);
      const r = radius + radialWobble;
      const px = cx + Math.cos(angle) * r;
      const py = cy + passYOff + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  }

  ctx.restore();
}

export function drawSketchPolyline(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  opts: SketchOptions = {},
) {
  if (points.length < 2) return;
  for (let i = 0; i < points.length - 1; i++) {
    drawSketchLine(ctx, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, {
      ...opts,
      seed: (opts.seed ?? 1) + i * 19.3,
    });
  }
}

export function drawSketchHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  ratio: number,
  color: string,
  seed: number,
  alignRight = false,
) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const fillW = w * clamped;

  // Scribbled diagonal pen fill inside
  if (fillW > 2) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.28;

    const startX = alignRight ? x + (w - fillW) : x;
    const endX = startX + fillW;

    ctx.beginPath();
    ctx.rect(startX, y + 1, fillW, h - 2);
    ctx.clip();

    const step = 5;
    for (let sx = startX - h; sx < endX + h; sx += step) {
      const wobble = hash1D(seed + sx * 0.7) * 1.2;
      ctx.beginPath();
      ctx.moveTo(sx + wobble, y + h);
      ctx.lineTo(sx + h * 0.8 - wobble, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Hand-drawn box outline with slight double strokes
  drawSketchLine(ctx, x, y, x + w, y, { color: '#334155', lineWidth: 1.7, roughness: 0.9, seed: seed + 1 });
  drawSketchLine(ctx, x + w, y, x + w, y + h, { color: '#334155', lineWidth: 1.7, roughness: 0.9, seed: seed + 2 });
  drawSketchLine(ctx, x + w, y + h, x, y + h, { color: '#334155', lineWidth: 1.7, roughness: 0.9, seed: seed + 3 });
  drawSketchLine(ctx, x, y + h, x, y, { color: '#334155', lineWidth: 1.7, roughness: 0.9, seed: seed + 4 });
}

export function drawDoodleZone(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  label: string,
  seed: number,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.42;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([6, 6]);

  const segments = 24;
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const j = hash1D(seed + i * 2.1) * 1.6;
    const px = cx + Math.cos(a) * (rx + j);
    const py = cy + Math.sin(a) * (ry + j);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '18px "Patrick Hand", cursive, sans-serif';
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.72;
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, cy + ry + 24);
  ctx.restore();
}

export function renderNotebookPaperToCanvas(
  width: number,
  height: number,
  dpr: number,
): { canvas: HTMLCanvasElement; marginX: number; floorY: number; lineSpacing: number } {
  const offscreen = document.createElement('canvas');
  offscreen.width = Math.max(1, Math.floor(width * dpr));
  offscreen.height = Math.max(1, Math.floor(height * dpr));

  const ctx = offscreen.getContext('2d');
  const lineSpacing = Math.max(30, Math.min(38, Math.round(height / 20)));
  // Margin around 76-92px on desktop, tighter on narrow screens
  const marginX = width < 560 ? 44 : 88;
  // Choose a ruled line near ~68% height as the main standing floor line
  const rawFloorY = height * 0.68;
  const topOffset = 58;
  const floorIndex = Math.round((rawFloorY - topOffset) / lineSpacing);
  const floorY = topOffset + floorIndex * lineSpacing;

  if (!ctx) {
    return { canvas: offscreen, marginX, floorY, lineSpacing };
  }

  ctx.scale(dpr, dpr);

  // 1. Warm cream notebook paper base
  const grad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    Math.min(width, height) * 0.15,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.85,
  );
  grad.addColorStop(0, '#FDF8EB');
  grad.addColorStop(1, '#F6EED9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle organic paper fibers / speckling
  const grainCount = Math.min(2600, Math.floor((width * height) / 420));
  for (let i = 0; i < grainCount; i++) {
    const gx = (hash1D(i * 1.7 + 12) * 0.5 + 0.5) * width;
    const gy = (hash1D(i * 2.3 + 45) * 0.5 + 0.5) * height;
    const dark = hash1D(i * 5.1) > 0;
    ctx.fillStyle = dark ? 'rgba(130, 110, 82, 0.035)' : 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 3. Light blue horizontal ruled lines with subtle hand-ink imperfection
  const numLines = Math.ceil((height - topOffset) / lineSpacing) + 1;
  for (let i = 0; i < numLines; i++) {
    const y = topOffset + i * lineSpacing;
    const isFloorLine = Math.abs(y - floorY) < 1;

    ctx.save();
    ctx.strokeStyle = isFloorLine ? '#7FAFD9' : '#A9CBE9';
    ctx.lineWidth = isFloorLine ? 1.55 : 1.05;
    ctx.globalAlpha = isFloorLine ? 0.92 : 0.72;
    ctx.beginPath();

    const segments = 14;
    for (let s = 0; s <= segments; s++) {
      const px = (s / segments) * width;
      const py = y + hash1D(i * 31.7 + s * 7.3) * 0.45;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 4. Red vertical margin line on the left (classic school notebook double-thin or single red line)
  const drawRedMargin = (mx: number, alpha: number, seedOffset: number) => {
    ctx.save();
    ctx.strokeStyle = '#DF646E';
    ctx.lineWidth = 1.35;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    const segs = 16;
    for (let s = 0; s <= segs; s++) {
      const py = (s / segs) * height;
      const px = mx + hash1D(seedOffset + s * 11.1) * 0.55;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  };

  drawRedMargin(marginX, 0.85, 100);
  drawRedMargin(marginX + 4, 0.35, 200);

  // 5. Subtle notebook binder punch holes on the far left margin
  if (width >= 480) {
    const holeX = Math.max(22, marginX * 0.36);
    const holeYs = [height * 0.2, height * 0.5, height * 0.8];
    for (let i = 0; i < holeYs.length; i++) {
      const hy = holeYs[i];
      ctx.save();
      ctx.beginPath();
      ctx.arc(holeX, hy, 9.5, 0, Math.PI * 2);
      ctx.fillStyle = '#EAE0C8';
      ctx.fill();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = 'rgba(130, 112, 86, 0.32)';
      ctx.stroke();
      ctx.restore();
    }
  }

  return { canvas: offscreen, marginX, floorY, lineSpacing };
}

export function drawSketchGear(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  teeth = 6,
  rotation = 0,
  opts: SketchOptions = {},
) {
  const {
    color = '#1E293B',
    lineWidth = 1.6,
    roughness = 0.4,
    seed = 1,
    alpha = 0.92,
  } = opts;

  const innerR = radius * 0.68;
  const toothCount = Math.max(4, teeth);
  const pts: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < toothCount; i++) {
    const step = (Math.PI * 2) / toothCount;
    const a0 = rotation + i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.48;
    const a3 = a0 + step * 0.7;
    pts.push({ x: cx + Math.cos(a0) * innerR, y: cy + Math.sin(a0) * innerR });
    pts.push({ x: cx + Math.cos(a1) * radius, y: cy + Math.sin(a1) * radius });
    pts.push({ x: cx + Math.cos(a2) * radius, y: cy + Math.sin(a2) * radius });
    pts.push({ x: cx + Math.cos(a3) * innerR, y: cy + Math.sin(a3) * innerR });
  }
  pts.push(pts[0]);

  drawSketchPolyline(ctx, pts, {
    color,
    lineWidth,
    roughness,
    seed,
    passes: 1,
    alpha,
  });

  drawSketchCircle(ctx, cx, cy, Math.max(1.3, radius * 0.28), {
    color,
    lineWidth: lineWidth * 0.85,
    roughness: roughness * 0.6,
    seed: seed + 13,
    passes: 1,
    alpha,
  });
}

export function drawSketchSpring(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  coils = 4,
  width = 5,
  opts: SketchOptions = {},
) {
  const {
    color = '#1E293B',
    lineWidth = 1.7,
    roughness = 0.35,
    seed = 1,
    passes = 1,
    alpha = 0.94,
  } = opts;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return;

  const nx = -dy / len;
  const ny = dx / len;
  const halfW = width * 0.5;
  const segs = Math.max(2, coils) * 2;
  const pts: Array<{ x: number; y: number }> = [{ x: x1, y: y1 }];

  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const side = i % 2 === 1 ? 1 : -1;
    pts.push({
      x: x1 + dx * t + nx * halfW * side,
      y: y1 + dy * t + ny * halfW * side,
    });
  }
  pts.push({ x: x2, y: y2 });

  drawSketchPolyline(ctx, pts, {
    color,
    lineWidth,
    roughness,
    seed,
    passes,
    alpha,
  });
}

export function drawSketchGauge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  ratio: number,
  opts: SketchOptions & {
    gaugeColor?: string;
    needleAngleOverride?: number;
    cracked?: boolean;
    blinkingRed?: boolean;
  } = {},
) {
  const {
    color = '#1E293B',
    lineWidth = 1.6,
    roughness = 0.45,
    seed = 1,
    alpha = 0.94,
    gaugeColor = '#0D9488',
    needleAngleOverride,
    cracked = false,
    blinkingRed = false,
  } = opts;

  // Dial face wash
  ctx.save();
  ctx.globalAlpha = 0.85 * alpha;
  ctx.fillStyle = '#FDF8EB';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Colored pressure arc zone (cool teal -> warm yellow -> hot red)
  const startA = Math.PI * 0.78;
  const sweepA = Math.PI * 1.44;
  ctx.lineWidth = Math.max(1.5, radius * 0.22);
  ctx.globalAlpha = 0.38 * alpha;
  ctx.strokeStyle = gaugeColor;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.72, startA, startA + sweepA * 0.45);
  ctx.stroke();

  ctx.strokeStyle = '#EAB308';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.72, startA + sweepA * 0.45, startA + sweepA * 0.75);
  ctx.stroke();

  ctx.strokeStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.72, startA + sweepA * 0.75, startA + sweepA);
  ctx.stroke();
  ctx.restore();

  // Outer dial rim
  drawSketchCircle(ctx, cx, cy, radius, {
    color: blinkingRed ? '#DC2626' : color,
    lineWidth,
    roughness,
    seed: seed + 1,
    passes: 2,
    alpha,
  });

  // 5 radial scale ticks
  for (let i = 0; i <= 4; i++) {
    const a = startA + (sweepA * i) / 4;
    const r0 = radius * 0.62;
    const r1 = radius * 0.86;
    drawSketchLine(
      ctx,
      cx + Math.cos(a) * r0,
      cy + Math.sin(a) * r0,
      cx + Math.cos(a) * r1,
      cy + Math.sin(a) * r1,
      {
        color,
        lineWidth: Math.max(1, lineWidth * 0.65),
        roughness: 0.2,
        seed: seed + 10 + i,
        passes: 1,
        alpha: alpha * 0.82,
      },
    );
  }

  // Needle
  const clamped = Math.max(0, Math.min(1, ratio));
  const needleA =
    needleAngleOverride !== undefined ? needleAngleOverride : startA + clamped * sweepA;
  drawSketchLine(
    ctx,
    cx,
    cy,
    cx + Math.cos(needleA) * radius * 0.74,
    cy + Math.sin(needleA) * radius * 0.74,
    {
      color: clamped >= 0.75 || blinkingRed ? '#DC2626' : gaugeColor,
      lineWidth: Math.max(1.4, lineWidth * 0.9),
      roughness: 0.2,
      seed: seed + 25,
      passes: 1,
      alpha,
    },
  );

  // Center pivot pin
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1.4, radius * 0.16), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Cracked glass overlay when overheated
  if (cracked) {
    drawSketchPolyline(
      ctx,
      [
        { x: cx - radius * 0.62, y: cy - radius * 0.42 },
        { x: cx - radius * 0.08, y: cy - radius * 0.06 },
        { x: cx + radius * 0.12, y: cy + radius * 0.14 },
        { x: cx + radius * 0.66, y: cy + radius * 0.36 },
      ],
      {
        color: '#334155',
        lineWidth: Math.max(1, lineWidth * 0.6),
        roughness: 0.25,
        seed: seed + 40,
        passes: 1,
        alpha: alpha * 0.88,
      },
    );
    drawSketchLine(
      ctx,
      cx - radius * 0.08,
      cy - radius * 0.06,
      cx + radius * 0.38,
      cy - radius * 0.58,
      {
        color: '#475569',
        lineWidth: Math.max(0.9, lineWidth * 0.5),
        roughness: 0.2,
        seed: seed + 41,
        passes: 1,
        alpha: alpha * 0.78,
      },
    );
  }
}

export function drawSketchPaperFanWing(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  length: number,
  baseAngle: number,
  spreadAngle: number,
  opts: SketchOptions & {
    edgeColor?: string;
    hatchColor?: string;
    ribs?: number;
    broken?: boolean;
    crumpled?: boolean;
    openRatio?: number;
  } = {},
) {
  const {
    color = '#1E293B',
    edgeColor = '#0D9488',
    hatchColor = '#64748B',
    lineWidth = 1.8,
    roughness = 0.6,
    seed = 1,
    alpha = 0.94,
    ribs = 4,
    broken = false,
    crumpled = false,
    openRatio = 1,
  } = opts;

  const effSpread = spreadAngle * Math.max(0.15, openRatio);
  const ribCount = Math.max(3, ribs);
  const tips: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < ribCount; i++) {
    const t = ribCount === 1 ? 0.5 : i / (ribCount - 1);
    let ang = baseAngle + (t - 0.5) * effSpread;
    let len = length * (0.88 + Math.sin(t * Math.PI) * 0.14);

    if (crumpled) {
      ang += hash1D(seed + i * 7.3) * 0.38;
      len *= 0.48 + Math.abs(hash1D(seed + i * 11.7)) * 0.34;
    } else if (broken && i === 1) {
      // One rib bent and torn downward
      ang += 0.52;
      len *= 0.72;
    }

    if (broken && i === 1) {
      const midLen = len * 0.52;
      const midX = ax + Math.cos(ang - 0.35) * midLen;
      const midY = ay + Math.sin(ang - 0.35) * midLen;
      const tipX = midX + Math.cos(ang + 0.48) * (len * 0.45);
      const tipY = midY + Math.sin(ang + 0.48) * (len * 0.45);
      tips.push({ x: tipX, y: tipY });
    } else {
      tips.push({
        x: ax + Math.cos(ang) * len,
        y: ay + Math.sin(ang) * len,
      });
    }
  }

  // Light paper fan body wash
  ctx.save();
  ctx.fillStyle = crumpled ? '#E2E8F0' : '#FDF8EB';
  ctx.globalAlpha = 0.76 * alpha;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  for (const tp of tips) {
    ctx.lineTo(tp.x, tp.y);
  }
  ctx.closePath();
  ctx.fill();

  // Dense horizontal hatching lines clipped inside fan silhouette (like boiler torso)
  ctx.clip();
  const minY = Math.min(ay, ...tips.map((t) => t.y));
  const maxY = Math.max(ay, ...tips.map((t) => t.y));
  const minX = Math.min(ax, ...tips.map((t) => t.x));
  const maxX = Math.max(ax, ...tips.map((t) => t.x));
  const stepY = Math.max(3.6, length * 0.085);
  ctx.strokeStyle = hatchColor;
  ctx.lineWidth = Math.max(0.85, lineWidth * 0.5);
  ctx.globalAlpha = 0.46 * alpha;
  for (let hy = minY + 2; hy <= maxY - 2; hy += stepY) {
    const wob = hash1D(seed + hy * 0.37) * 1.1;
    ctx.beginPath();
    ctx.moveTo(minX - 2, hy + wob);
    ctx.lineTo(maxX + 2, hy - wob);
    ctx.stroke();
  }
  ctx.restore();

  // Radial fan ribs (4 gân nan)
  for (let i = 0; i < ribCount; i++) {
    const tp = tips[i];
    if (broken && i === 1) {
      const ang = baseAngle + (1 / (ribCount - 1) - 0.5) * effSpread;
      const midX = ax + Math.cos(ang + 0.15) * (length * 0.42);
      const midY = ay + Math.sin(ang + 0.15) * (length * 0.42);
      drawSketchPolyline(
        ctx,
        [
          { x: ax, y: ay },
          { x: midX, y: midY },
          { x: tp.x, y: tp.y },
        ],
        {
          color,
          lineWidth: lineWidth * 0.85,
          roughness: roughness * 0.8,
          seed: seed + 12 + i * 3,
          passes: 1,
          alpha,
        },
      );
    } else {
      drawSketchLine(ctx, ax, ay, tp.x, tp.y, {
        color,
        lineWidth: i === 0 || i === ribCount - 1 ? lineWidth : lineWidth * 0.82,
        roughness: roughness * 0.75,
        seed: seed + 12 + i * 3,
        passes: i === 0 || i === ribCount - 1 ? 2 : 1,
        alpha,
      });
    }
  }

  // Outer fan rim tinted teal (or torn gap if broken)
  for (let i = 0; i < tips.length - 1; i++) {
    if (broken && i === 0) {
      // Torn notch on broken wing rim
      const midX = (tips[i].x + tips[i + 1].x) * 0.5 - Math.cos(baseAngle) * length * 0.14;
      const midY = (tips[i].y + tips[i + 1].y) * 0.5 - Math.sin(baseAngle) * length * 0.14;
      drawSketchLine(ctx, tips[i].x, tips[i].y, midX, midY, {
        color: edgeColor,
        lineWidth: lineWidth * 1.15,
        roughness,
        seed: seed + 40 + i,
        passes: 1,
        alpha,
      });
      drawSketchLine(ctx, midX, midY, tips[i + 1].x, tips[i + 1].y, {
        color: edgeColor,
        lineWidth: lineWidth * 1.15,
        roughness,
        seed: seed + 50 + i,
        passes: 1,
        alpha,
      });
    } else {
      drawSketchLine(ctx, tips[i].x, tips[i].y, tips[i + 1].x, tips[i + 1].y, {
        color: crumpled ? hatchColor : edgeColor,
        lineWidth: lineWidth * 1.25,
        roughness: roughness * 0.9,
        seed: seed + 40 + i,
        passes: 2,
        alpha,
      });
    }
  }
}

