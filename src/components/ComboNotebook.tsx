import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { sfx } from '../audio/sfx';
import {
  drawSketchCircle,
  drawSketchLine,
} from '../engine/sketchDraw';
import {
  drawHeldShield,
  drawHeldWeapon,
  drawPaperTear,
  drawPinnedSpear,
  drawThrownShield,
  PrimaryWeaponType,
} from '../engine/weapons';

export type NotebookPageId = 'unarmed' | 'sword' | 'bat' | 'spear' | 'hammer' | 'shield';

interface PanelSpec {
  stepLabel: string;
  moveTitle: string;
  caption: string;
}

interface NotebookPage {
  id: NotebookPageId;
  tabLabel: string;
  title: string;
  rhythm: string;
  accentHex: string;
  panels: [PanelSpec, PanelSpec, PanelSpec];
  traitNote: string;
}

const PAGES: NotebookPage[] = [
  {
    id: 'unarmed',
    tabLabel: 'Tay không',
    title: 'Tay Không · Đánh Thường',
    rhythm: 'Nhịp tự do · Đấm đá cận chiến',
    accentHex: '#1E3A8A',
    panels: [
      {
        stepLabel: 'Combo 1',
        moveTitle: 'Thẳng → Chéo → Quét',
        caption: 'Đấm thẳng mở đòn, nối đấm chéo rồi đá quét hất ngã đối thủ.',
      },
      {
        stepLabel: 'Combo 2',
        moveTitle: 'Thẳng → Móc → Đá nhảy',
        caption: 'Đấm thẳng rồi móc ngược hất lên không, bồi thêm cú đá bay.',
      },
      {
        stepLabel: 'Áp sát & Né',
        moveTitle: 'Trượt · Đấm gồng · NÉ!',
        caption: 'Trượt chân từ xa, gồng đấm nặng hoặc bật lùi né đòn bất ngờ.',
      },
    ],
    traitNote: 'Khi trúng đòn liên tiếp, người que có tỉ lệ bật nhảy lùi né đòn để thoát combo.',
  },
  {
    id: 'sword',
    tabLabel: 'Kiếm',
    title: 'Kiếm · Nhanh và Linh Hoạt',
    rhythm: 'Nhịp: Nhanh · Nhanh · Nhanh',
    accentHex: '#1E293B',
    panels: [
      {
        stepLabel: 'Nhịp 1',
        moveTitle: 'Chém chéo xuống',
        caption: 'Vung kiếm chéo từ trên xuống tốc độ cao (11 sát thương).',
      },
      {
        stepLabel: 'Nhịp 2',
        moveTitle: 'Chém ngược lên',
        caption: 'Nối tiếp cú chém hất ngược lên nếu đánh trúng ở cự ly chuẩn (12).',
      },
      {
        stepLabel: 'Nhịp 3 · Chốt',
        moveTitle: 'Gần: Xoay · Xa: Lướt đâm',
        caption: 'Ở gần xoay người chém ngang 360° (20); ở xa lướt tới đâm thẳng (19).',
      },
    ],
    traitNote: 'Chém hụt nhịp đầu sẽ ngắt combo; đòn chốt xoay 360° hoặc lướt đâm có độ trễ thu kiếm nếu đánh trượt.',
  },
  {
    id: 'bat',
    tabLabel: 'Gậy',
    title: 'Gậy · Bóng Chày Hất Văng',
    rhythm: 'Nhịp: Nhanh · Khựng · Nặng',
    accentHex: '#78350F',
    panels: [
      {
        stepLabel: 'Nhịp 1',
        moveTitle: 'Quất ngang hông',
        caption: 'Quét gậy ngang tầm hông nhanh, khiến đối thủ giật lùi nhẹ (11).',
      },
      {
        stepLabel: 'Nhịp 2 · Giả đòn',
        moveTitle: 'Khựng 0,15s → Hất ngược',
        caption: 'Khựng giữa chừng đánh lừa, hất ngược từ dưới lên phá đỡ & tung lên trời (15).',
      },
      {
        stepLabel: 'Nhịp 3 · Chốt',
        moveTitle: 'HOME RUN!',
        caption: 'Gồng sau lưng vụt bay ra lề đỏ/mép giấy, nảy quay tròn (-10) & choáng váng (25).',
      },
    ],
    traitNote: 'Người bị hất văng đập trúng vũ khí vẽ tay trên sân sẽ chịu thêm +10 sát thương va chạm.',
  },
  {
    id: 'spear',
    tabLabel: 'Giáo',
    title: 'Giáo · Đâm Dứt Khoát',
    rhythm: 'Nhịp: Nhanh · Nhanh · Lao',
    accentHex: '#991B1B',
    panels: [
      {
        stepLabel: 'Nhịp 1',
        moveTitle: 'Đâm thấp vào chân',
        caption: 'Chọc nhanh vào chân làm đối thủ loạng choạng và bị làm chậm (10).',
      },
      {
        stepLabel: 'Nhịp 2',
        moveTitle: 'Đâm ngực → Giật lùi',
        caption: 'Đâm tầm ngực xong rút giáo nhảy lùi nửa bước giữ cự ly an toàn (13).',
      },
      {
        stepLabel: 'Nhịp 3 · Chốt',
        moveTitle: 'Lao đâm ghim giấy',
        caption: 'Lao cả thân đâm xuyên, ghim chặt đối thủ lên mặt giấy ~1 giây rung rung (22).',
      },
    ],
    traitNote: 'Nếu đối thủ lọt vào quá sát, giáo tự chuyển sang đập cán đẩy lùi về lại tầm giáo.',
  },
  {
    id: 'hammer',
    tabLabel: 'Búa',
    title: 'Búa · Nặng và Chắc',
    rhythm: 'Nhịp: Chậm · Vừa · Rất nặng',
    accentHex: '#334155',
    panels: [
      {
        stepLabel: 'Nhịp 1',
        moveTitle: 'Đẩy cán mở đường',
        caption: 'Dùng cán búa huých lùi đối thủ để lấy đà vào tầm vung (4).',
      },
      {
        stepLabel: 'Nhịp 2',
        moveTitle: 'Xoay vòng 360°',
        caption: 'Xoay cả người quét ngang kèm giáp siêu nặng, không bị đẩy lùi hay ngắt đòn (17).',
      },
      {
        stepLabel: 'Nhịp 3 · Chốt',
        moveTitle: 'Nhảy bổ xé giấy',
        caption: 'Bật khỏi khung hình, hiện "BỐP!" rồi đập xuống xé rách mặt giấy (27 + sóng nứt).',
      },
    ],
    traitNote: 'Đòn búa nặng thu về chậm; nếu đối thủ né kịp (NÉ HỞ ĐÒN!) sẽ phản công rất đau.',
  },
  {
    id: 'shield',
    tabLabel: 'Khiên',
    title: 'Khiên · Cúi Đỡ & Ném Khiên',
    rhythm: 'Phòng thủ · Phản đòn tầm xa',
    accentHex: '#1E3A8A',
    panels: [
      {
        stepLabel: 'Phòng thủ',
        moveTitle: 'Cúi thấp giơ khiên',
        caption: 'Cúi người thu khiên ra trước: 58% chắn hết sát thương, còn lại giảm 78%.',
      },
      {
        stepLabel: 'Ném khiên',
        moveTitle: 'Mất ≥36 HP → Quăng',
        caption: 'Sau khi chịu đủ sát thương lúc cầm khiên, nhân vật có tỉ lệ ném thẳng (18).',
      },
      {
        stepLabel: 'Tranh giành',
        moveTitle: 'Bật lại hoặc Rơi sân',
        caption: 'Khiên có thể bay bật lại tay người ném hoặc văng ra sàn — ai chạm trước lấy!',
      },
    ],
    traitNote: 'Nhịp 2 giả đòn của Gậy có thể phá thế cúi khiên và hất tung người cầm khiên.',
  },
];

interface MiniPose {
  hipDrop: number;
  torsoLean: number;
  upperArmL: number;
  elbowL: number;
  upperArmR: number;
  elbowR: number;
  thighL: number;
  kneeL: number;
  thighR: number;
  kneeR: number;
}

function drawMiniFighter(
  ctx: CanvasRenderingContext2D,
  x: number,
  floorY: number,
  facing: 1 | -1,
  color: string,
  accent: string,
  pose: MiniPose,
  scale: number,
  seed: number,
  opts?: {
    weapon?: PrimaryWeaponType | null;
    weaponVec?: { dx: number; dy: number };
    hasShield?: boolean;
    shieldCrouch?: boolean;
    bodySpin?: number;
    koEyes?: boolean;
  },
) {
  const s = scale;
  const f = facing;
  const legH = 28 * s;
  const hipX = x;
  const hipY = floorY - legH + pose.hipDrop * s;

  const torsoLen = 21 * s;
  const shX = hipX + Math.sin(pose.torsoLean) * torsoLen * f;
  const shY = hipY - Math.cos(pose.torsoLean) * torsoLen;

  const headDist = 11.5 * s;
  const headAng = pose.torsoLean * 0.65;
  const headX = shX + Math.sin(headAng) * headDist * f;
  const headY = shY - Math.cos(headAng) * headDist;

  const uArm = 12.5 * s;
  const fArm = 12 * s;
  const elLX = shX + Math.sin(pose.upperArmL) * uArm * f;
  const elLY = shY + Math.cos(pose.upperArmL) * uArm;
  const handLX = elLX + Math.sin(pose.upperArmL + pose.elbowL) * fArm * f;
  const handLY = elLY + Math.cos(pose.upperArmL + pose.elbowL) * fArm;

  const elRX = shX + Math.sin(pose.upperArmR) * uArm * f;
  const elRY = shY + Math.cos(pose.upperArmR) * uArm;
  const handRX = elRX + Math.sin(pose.upperArmR + pose.elbowR) * fArm * f;
  const handRY = elRY + Math.cos(pose.upperArmR + pose.elbowR) * fArm;

  const thighLen = 14 * s;
  const shinLen = 14 * s;
  const knLX = hipX + Math.sin(pose.thighL) * thighLen * f;
  const knLY = hipY + Math.cos(pose.thighL) * thighLen;
  const ftLX = knLX + Math.sin(pose.thighL - pose.kneeL) * shinLen * f;
  const ftLY = knLY + Math.cos(pose.thighL - pose.kneeL) * shinLen;

  const knRX = hipX + Math.sin(pose.thighR) * thighLen * f;
  const knRY = hipY + Math.cos(pose.thighR) * thighLen;
  const ftRX = knRX + Math.sin(pose.thighR - pose.kneeR) * shinLen * f;
  const ftRY = knRY + Math.cos(pose.thighR - pose.kneeR) * shinLen;

  const spin = opts?.bodySpin ?? 0;
  if (Math.abs(spin) > 0.001) {
    const px = hipX;
    const py = (hipY + shY) * 0.5;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(spin);
    ctx.translate(-px, -py);
  }

  const lw = 2.1 * s;
  // Back limbs
  drawSketchLine(ctx, hipX, hipY, knRX, knRY, { color, lineWidth: lw, roughness: 0.9, seed: seed + 1, passes: 1, alpha: 0.78 });
  drawSketchLine(ctx, knRX, knRY, ftRX, ftRY, { color, lineWidth: lw, roughness: 0.9, seed: seed + 2, passes: 1, alpha: 0.78 });
  drawSketchLine(ctx, shX, shY, elRX, elRY, { color, lineWidth: lw * 0.9, roughness: 0.9, seed: seed + 3, passes: 1, alpha: 0.78 });
  drawSketchLine(ctx, elRX, elRY, handRX, handRY, { color, lineWidth: lw * 0.9, roughness: 0.9, seed: seed + 4, passes: 1, alpha: 0.78 });

  if (opts?.weapon) {
    const vec = opts.weaponVec ?? { dx: f * 0.75, dy: -0.65 };
    drawHeldWeapon(ctx, opts.weapon, handRX, handRY, vec.dx, vec.dy, s * 0.68, seed + 22);
  }

  // Torso
  drawSketchLine(ctx, hipX, hipY, shX, shY, { color, lineWidth: lw * 1.08, roughness: 0.9, seed: seed + 5, passes: 2 });

  // Front limbs
  drawSketchLine(ctx, hipX, hipY, knLX, knLY, { color, lineWidth: lw, roughness: 0.9, seed: seed + 6, passes: 2 });
  drawSketchLine(ctx, knLX, knLY, ftLX, ftLY, { color, lineWidth: lw, roughness: 0.9, seed: seed + 7, passes: 2 });
  drawSketchLine(ctx, shX, shY, elLX, elLY, { color, lineWidth: lw * 0.95, roughness: 0.9, seed: seed + 8, passes: 2 });
  drawSketchLine(ctx, elLX, elLY, handLX, handLY, { color, lineWidth: lw * 0.95, roughness: 0.9, seed: seed + 9, passes: 2 });

  if (opts?.hasShield) {
    drawHeldShield(ctx, handLX, handLY, f, Boolean(opts.shieldCrouch), s * 0.72, seed + 31);
  }

  // Head + headband
  const headR = 8.4 * s;
  drawSketchCircle(ctx, headX, headY, headR, { color, lineWidth: lw, roughness: 0.9, seed: seed + 10, passes: 2 });
  drawSketchLine(ctx, headX - headR * 0.85, headY - headR * 0.35, headX + headR * 0.85, headY - headR * 0.35, {
    color: accent,
    lineWidth: 2.3 * s,
    roughness: 0.6,
    seed: seed + 11,
    passes: 1,
  });

  if (opts?.koEyes) {
    const ex = headX + f * 2.8 * s;
    const ey = headY + 0.5 * s;
    drawSketchLine(ctx, ex - 2 * s, ey - 2 * s, ex + 2 * s, ey + 2 * s, { color, lineWidth: 1.3 * s, roughness: 0.3, seed: seed + 12, passes: 1 });
    drawSketchLine(ctx, ex + 2 * s, ey - 2 * s, ex - 2 * s, ey + 2 * s, { color, lineWidth: 1.3 * s, roughness: 0.3, seed: seed + 13, passes: 1 });
  }

  if (Math.abs(spin) > 0.001) {
    ctx.restore();
  }
}

const STAND_POSE: MiniPose = {
  hipDrop: 2,
  torsoLean: 0.12,
  upperArmL: 0.7,
  elbowL: 1.35,
  upperArmR: 0.35,
  elbowR: 1.45,
  thighL: 0.32,
  kneeL: 0.38,
  thighR: -0.28,
  kneeR: 0.3,
};

const HURT_POSE: MiniPose = {
  hipDrop: 4,
  torsoLean: -0.48,
  upperArmL: -0.45,
  elbowL: 0.5,
  upperArmR: -0.65,
  elbowR: 0.45,
  thighL: 0.28,
  kneeL: 0.38,
  thighR: -0.38,
  kneeR: 0.32,
};

function drawSketchSpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  seed: number,
) {
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI * 2 * i) / 6 + 0.25;
    drawSketchLine(
      ctx,
      x + Math.cos(ang) * radius * 0.35,
      y + Math.sin(ang) * radius * 0.35,
      x + Math.cos(ang) * radius,
      y + Math.sin(ang) * radius,
      { color, lineWidth: 1.6, roughness: 0.6, seed: seed + i, passes: 1 },
    );
  }
}

function drawNotebookCanvasIllustration(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pageId: NotebookPageId,
  tSec: number,
) {
  ctx.clearRect(0, 0, width, height);
  const boil = Math.floor(tSec * 7);
  const panelW = width / 3;
  const floorY = height - 24;
  const s = Math.max(0.78, Math.min(1.06, width / 560));

  // Hand-drawn comic panel dividers + ground ink lines inside each panel
  for (let i = 0; i < 3; i++) {
    const px = i * panelW;
    if (i > 0) {
      drawSketchLine(ctx, px, 10, px, height - 10, {
        color: '#94A3B8',
        lineWidth: 1.3,
        roughness: 0.8,
        seed: 50 + i,
        passes: 1,
        alpha: 0.65,
      });
    }
    drawSketchLine(ctx, px + 14, floorY, px + panelW - 14, floorY, {
      color: '#475569',
      lineWidth: 1.4,
      roughness: 0.7,
      seed: 100 + i,
      passes: 1,
      alpha: 0.7,
    });
  }

  const phase = (tSec % 2.1) / 2.1; // smooth 2.1s demo loop
  const pulse = Math.sin(tSec * 4.5) * 0.5 + 0.5;
  const blue = '#1E3A8A';
  const blueAcc = '#2563EB';
  const red = '#991B1B';
  const redAcc = '#DC2626';

  const label = (cx: number, y: number, text: string, color: string, size = 14) => {
    ctx.save();
    ctx.font = `bold ${Math.round(size * s)}px "Patrick Hand", cursive, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, cx, y);
    ctx.restore();
  };

  if (pageId === 'unarmed') {
    // Panel 1: Punch combo
    const p1 = panelW * 0.5;
    const ext = phase < 0.5 ? 1 : 0.6;
    drawMiniFighter(
      ctx,
      p1 - 28 * s,
      floorY,
      1,
      blue,
      blueAcc,
      {
        ...STAND_POSE,
        torsoLean: 0.32,
        upperArmL: 1.52 * ext,
        elbowL: 0.08,
        upperArmR: 1.15,
        elbowR: 0.35,
      },
      s,
      11 + boil * 0.05,
    );
    drawMiniFighter(ctx, p1 + 26 * s, floorY, -1, red, redAcc, HURT_POSE, s, 21 + boil * 0.05);
    drawSketchSpark(ctx, p1 + 3 * s, floorY - 38 * s, 11 * s, redAcc, 300 + boil);
    label(p1 + 2 * s, floorY - 56 * s, 'BỤP!', redAcc, 15);

    // Panel 2: Uppercut + Jump Kick
    const p2 = panelW * 1.5;
    drawMiniFighter(
      ctx,
      p2 - 26 * s,
      floorY - 6 * s,
      1,
      blue,
      blueAcc,
      {
        ...STAND_POSE,
        torsoLean: -0.35,
        thighL: 0.75,
        kneeL: 1.35,
        thighR: 1.65,
        kneeR: 0.06,
      },
      s,
      31,
    );
    drawMiniFighter(
      ctx,
      p2 + 27 * s,
      floorY - 18 * s - pulse * 8 * s,
      -1,
      red,
      redAcc,
      HURT_POSE,
      s,
      41,
      { bodySpin: -0.4 },
    );
    drawSketchSpark(ctx, p2 + 3 * s, floorY - 40 * s, 12 * s, '#D97706', 310);

    // Panel 3: Slide & Dodge Back ("NÉ!")
    const p3 = panelW * 2.5;
    drawMiniFighter(
      ctx,
      p3 - 26 * s,
      floorY,
      1,
      blue,
      blueAcc,
      {
        ...STAND_POSE,
        hipDrop: 14,
        torsoLean: -0.62,
        thighL: 1.3,
        kneeL: 0.08,
        thighR: -0.2,
        kneeR: 1.35,
      },
      s,
      51,
    );
    drawMiniFighter(
      ctx,
      p3 + 28 * s,
      floorY - 12 * s,
      -1,
      red,
      redAcc,
      { ...STAND_POSE, torsoLean: -0.58, thighL: 1.1, kneeL: 1.4, thighR: -0.25, kneeR: 1.3 },
      s,
      61,
    );
    // Dodge speed lines
    for (let i = 0; i < 3; i++) {
      drawSketchLine(ctx, p3 + 42 * s, floorY - (26 + i * 7) * s, p3 + 56 * s, floorY - (26 + i * 7) * s, {
        color: redAcc,
        lineWidth: 1.3,
        roughness: 0.5,
        seed: 70 + i,
        passes: 1,
      });
    }
    label(p3 + 28 * s, floorY - 58 * s, 'NÉ!', redAcc, 15);
    return;
  }

  if (pageId === 'sword') {
    // Panel 1: Diagonal slash down
    const p1 = panelW * 0.5;
    drawMiniFighter(
      ctx,
      p1 - 24 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, torsoLean: 0.36, upperArmR: 0.85, elbowR: 0.08 },
      s,
      12,
      { weapon: 'sword', weaponVec: { dx: 0.82, dy: 0.58 } },
    );
    drawSketchLine(ctx, p1 - 2 * s, floorY - 62 * s, p1 + 22 * s, floorY - 22 * s, {
      color: redAcc,
      lineWidth: 2.2,
      roughness: 0.9,
      seed: 120 + boil,
      passes: 2,
    });
    drawMiniFighter(ctx, p1 + 28 * s, floorY, -1, red, redAcc, HURT_POSE, s, 22);

    // Panel 2: Reverse upward slash
    const p2 = panelW * 1.5;
    drawMiniFighter(
      ctx,
      p2 - 22 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, torsoLean: -0.15, upperArmR: 2.15, elbowR: 0.1 },
      s,
      32,
      { weapon: 'sword', weaponVec: { dx: 0.62, dy: -0.78 } },
    );
    drawSketchLine(ctx, p2 - 4 * s, floorY - 20 * s, p2 + 24 * s, floorY - 60 * s, {
      color: '#1E293B',
      lineWidth: 2.2,
      roughness: 0.9,
      seed: 140 + boil,
      passes: 2,
    });
    drawMiniFighter(ctx, p2 + 28 * s, floorY - 5 * s, -1, red, redAcc, HURT_POSE, s, 42);

    // Panel 3: Close spin OR Far lunge
    const p3 = panelW * 2.5;
    const lungeX = p3 - 26 * s + phase * 12 * s;
    drawMiniFighter(
      ctx,
      lungeX,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, hipDrop: 6, torsoLean: 0.58, upperArmR: 1.56, elbowR: 0.04, thighL: 0.6, kneeL: 0.6, thighR: -0.6, kneeR: 0.15 },
      s,
      52,
      { weapon: 'sword', weaponVec: { dx: 1, dy: 0 }, bodySpin: phase < 0.45 ? 0 : (phase - 0.45) * 3.2 },
    );
    drawMiniFighter(ctx, p3 + 30 * s, floorY - 4 * s, -1, red, redAcc, HURT_POSE, s, 62);
    drawSketchSpark(ctx, p3 + 10 * s, floorY - 36 * s, 12 * s, redAcc, 320);
    label(p3, floorY - 60 * s, phase < 0.45 ? 'LƯỚT ĐÂM!' : 'XOAY 360°!', '#1E293B', 13);
    return;
  }

  if (pageId === 'bat') {
    // Panel 1: Hip horizontal sweep
    const p1 = panelW * 0.5;
    drawMiniFighter(
      ctx,
      p1 - 24 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, torsoLean: 0.34, upperArmR: 1.15, elbowR: 0.1 },
      s,
      13,
      { weapon: 'bat', weaponVec: { dx: 0.95, dy: 0.25 } },
    );
    drawMiniFighter(ctx, p1 + 28 * s, floorY, -1, red, redAcc, HURT_POSE, s, 23);
    drawSketchSpark(ctx, p1 + 5 * s, floorY - 32 * s, 10 * s, '#92400E', 330);

    // Panel 2: Feint 0.15s + Guard Break Upward Launch
    const p2 = panelW * 1.5;
    drawMiniFighter(
      ctx,
      p2 - 22 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, torsoLean: -0.2, upperArmR: 2.25, elbowR: 0.08 },
      s,
      33,
      { weapon: 'bat', weaponVec: { dx: 0.55, dy: -0.84 } },
    );
    drawMiniFighter(
      ctx,
      p2 + 27 * s,
      floorY - 18 * s - pulse * 10 * s,
      -1,
      red,
      redAcc,
      HURT_POSE,
      s,
      43,
      { hasShield: true },
    );
    label(p2 + 8 * s, floorY - 62 * s, 'PHÁ ĐỠ!', '#D97706', 14);

    // Panel 3: HOME RUN + Red margin bounce!
    const p3 = panelW * 2.5;
    const wallX = p3 + panelW * 0.42;
    // Double red notebook margin line on right edge of panel 3
    drawSketchLine(ctx, wallX, 14, wallX, floorY, { color: '#DF646E', lineWidth: 1.8, roughness: 0.3, seed: 44, passes: 1 });
    drawMiniFighter(
      ctx,
      p3 - 34 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, torsoLean: 0.5, upperArmR: 1.65, elbowR: 0.05 },
      s,
      53,
      { weapon: 'bat', weaponVec: { dx: 0.94, dy: -0.35 } },
    );
    drawMiniFighter(
      ctx,
      wallX - 18 * s,
      floorY - 22 * s,
      -1,
      red,
      redAcc,
      HURT_POSE,
      s * 0.92,
      63,
      { bodySpin: tSec * 10 },
    );
    drawSketchCircle(ctx, p3 - 6 * s, floorY - 38 * s, 11 * s, { color: '#D97706', lineWidth: 1.5, roughness: 1.1, seed: 88, passes: 1 });
    label(p3, 24, 'HOME RUN!', '#D97706', 14);
    return;
  }

  if (pageId === 'spear') {
    // Panel 1: Low leg poke -> CHẬM!
    const p1 = panelW * 0.5;
    drawMiniFighter(
      ctx,
      p1 - 28 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, hipDrop: 6, torsoLean: 0.32, upperArmR: 1.05, elbowR: 0.06 },
      s,
      14,
      { weapon: 'spear', weaponVec: { dx: 0.92, dy: 0.38 } },
    );
    drawMiniFighter(ctx, p1 + 29 * s, floorY, -1, red, redAcc, HURT_POSE, s, 24);
    drawSketchCircle(ctx, p1 + 29 * s, floorY - 6 * s, 12 * s, { color: '#0369A1', lineWidth: 1.4, roughness: 1, seed: 91, passes: 1 });
    label(p1 + 24 * s, floorY - 56 * s, 'CHẬM!', '#0369A1', 14);

    // Panel 2: Chest poke + Step back arrow
    const p2 = panelW * 1.5;
    drawMiniFighter(
      ctx,
      p2 - 26 * s - pulse * 7 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, torsoLean: -0.15, upperArmR: 1.55, elbowR: 0.05 },
      s,
      34,
      { weapon: 'spear', weaponVec: { dx: 1, dy: -0.05 } },
    );
    drawMiniFighter(ctx, p2 + 30 * s, floorY, -1, red, redAcc, HURT_POSE, s, 44);
    // Backstep arrow above attacker
    drawSketchLine(ctx, p2 - 10 * s, floorY - 58 * s, p2 - 34 * s, floorY - 58 * s, { color: blueAcc, lineWidth: 1.6, roughness: 0.5, seed: 92, passes: 1 });
    label(p2 - 22 * s, floorY - 63 * s, 'LÙI', blueAcc, 12);

    // Panel 3: Pinned onto paper!
    const p3 = panelW * 2.5;
    drawMiniFighter(
      ctx,
      p3 - 28 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, torsoLean: 0.48, upperArmR: 1.48, elbowR: 0.05 },
      s,
      54,
    );
    drawMiniFighter(
      ctx,
      p3 + 22 * s,
      floorY,
      -1,
      red,
      redAcc,
      { ...HURT_POSE, torsoLean: -0.22 },
      s,
      64,
    );
    drawPinnedSpear(
      ctx,
      {
        x: p3 + 18 * s,
        y: floorY - 36 * s,
        facing: 1,
        scale: s * 0.72,
        life: 0.85,
        maxLife: 0.95,
        seed: 93,
      },
      tSec,
    );
    label(p3 + 18 * s, 24, 'GHIM CHẶT!', red, 13);
    return;
  }

  if (pageId === 'hammer') {
    // Panel 1: Pommel shove
    const p1 = panelW * 0.5;
    drawMiniFighter(
      ctx,
      p1 - 24 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, torsoLean: 0.34, upperArmL: 1.25, elbowL: 0.35, upperArmR: 1.35, elbowR: 0.2 },
      s,
      15,
      { weapon: 'hammer', weaponVec: { dx: 0.96, dy: -0.15 } },
    );
    drawMiniFighter(ctx, p1 + 29 * s, floorY, -1, red, redAcc, HURT_POSE, s, 25);
    drawSketchLine(ctx, p1 + 4 * s, floorY - 34 * s, p1 + 18 * s, floorY - 34 * s, { color: '#334155', lineWidth: 1.8, roughness: 0.5, seed: 94, passes: 1 });

    // Panel 2: 360 Spin + Super Armor
    const p2 = panelW * 1.5;
    drawMiniFighter(
      ctx,
      p2,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, torsoLean: 0.28, upperArmR: 1.48, elbowR: 0.1 },
      s,
      35,
      { weapon: 'hammer', weaponVec: { dx: 1, dy: 0 }, bodySpin: tSec * 7.5 },
    );
    drawSketchCircle(ctx, p2, floorY - 32 * s, 28 * s, { color: '#334155', lineWidth: 1.5, roughness: 1.2, seed: 95, passes: 1, alpha: 0.65 });
    label(p2, 24, 'GIÁP NẶNG!', '#334155', 13);

    // Panel 3: Offscreen leap "BỐP!" + Paper Tear!
    const p3 = panelW * 2.5;
    drawPaperTear(
      ctx,
      {
        x: p3 + 6 * s,
        y: floorY,
        width: 84 * s,
        life: 5,
        maxLife: 6.5,
        seed: 96,
      },
      boil,
    );
    drawMiniFighter(
      ctx,
      p3 - 18 * s,
      floorY,
      1,
      blue,
      blueAcc,
      { ...STAND_POSE, hipDrop: 9, torsoLean: 0.55, upperArmR: 0.9, elbowR: 0.1 },
      s,
      55,
      { weapon: 'hammer', weaponVec: { dx: 0.55, dy: 0.84 } },
    );
    drawMiniFighter(
      ctx,
      p3 + 30 * s,
      floorY - 12 * s - pulse * 6 * s,
      -1,
      red,
      redAcc,
      HURT_POSE,
      s,
      65,
    );
    label(p3 - 16 * s, 24, 'BỐP!', red, 15);
    label(p3 + 26 * s, floorY - 56 * s, 'XÉ GIẤY!', '#334155', 12);
    return;
  }

  // Page 6: Shield
  // Panel 1: Crouch Shield Guard
  const p1 = panelW * 0.5;
  drawMiniFighter(
    ctx,
    p1 - 14 * s,
    floorY,
    1,
    blue,
    blueAcc,
    { ...STAND_POSE, hipDrop: 12, torsoLean: 0.34, upperArmL: 1.15, elbowL: 0.68, thighL: 0.95, kneeL: 1.45, thighR: -0.55, kneeR: 1.0 },
    s,
    16,
    { hasShield: true, shieldCrouch: true },
  );
  drawSketchCircle(ctx, p1 + 8 * s, floorY - 26 * s, 14 * s, { color: blue, lineWidth: 1.6, roughness: 1.1, seed: 97, passes: 1 });
  label(p1, 24, 'CHẮN HẾT!', blue, 14);

  // Panel 2: Shield Throw
  const p2 = panelW * 1.5;
  drawMiniFighter(
    ctx,
    p2 - 32 * s,
    floorY,
    1,
    blue,
    blueAcc,
    { ...STAND_POSE, torsoLean: 0.42, upperArmL: 1.6, elbowL: 0.08 },
    s,
    36,
  );
  drawThrownShield(
    ctx,
    {
      id: 1,
      x: p2 + pulse * 14 * s,
      y: floorY - 36 * s,
      vx: 200,
      vy: 0,
      angle: tSec * 14,
      omega: 14,
      scale: s * 0.72,
      ownerSide: 'left',
      mode: 'ATTACK',
      pickupDelay: 0,
      restTimer: 1,
      fadeTimer: 1,
      dodgedTarget: false,
      seed: 42,
    },
    boil,
  );
  drawMiniFighter(ctx, p2 + 32 * s, floorY, -1, red, redAcc, HURT_POSE, s, 46);

  // Panel 3: Return OR loose pickup
  const p3 = panelW * 2.5;
  drawMiniFighter(ctx, p3 - 30 * s, floorY, 1, blue, blueAcc, STAND_POSE, s, 56);
  drawMiniFighter(ctx, p3 + 30 * s, floorY, -1, red, redAcc, STAND_POSE, s, 66);
  drawThrownShield(
    ctx,
    {
      id: 2,
      x: p3 + Math.sin(tSec * 2.5) * 14 * s,
      y: floorY - 12 * s,
      vx: 0,
      vy: 0,
      angle: 0,
      omega: 0,
      scale: s * 0.75,
      ownerSide: 'left',
      mode: 'RESTING',
      pickupDelay: 0,
      restTimer: 2,
      fadeTimer: 2,
      dodgedTarget: false,
      seed: 77,
    },
    boil,
  );
  label(p3, 24, 'BẬT LẠI / NHẶT!', blue, 13);
}

interface ComboNotebookProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComboNotebook: React.FC<ComboNotebookProps> = ({ isOpen, onClose }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [flipKey, setFlipKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const page = PAGES[pageIndex];

  const goToPage = (nextIdx: number) => {
    const clamped = (nextIdx + PAGES.length) % PAGES.length;
    if (clamped === pageIndex) return;
    sfx.unlock();
    sfx.playPageFlip();
    setPageIndex(clamped);
    setFlipKey((k) => k + 1);
  };

  // Keyboard navigation while notebook is open
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        goToPage(pageIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        goToPage(pageIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Live animated hand-drawn comic strip illustration on the open page
  useEffect(() => {
    if (!isOpen) return;
    let rafId = 0;
    const render = (now: number) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(280, Math.round(rect.width));
        const h = Math.max(150, Math.round(rect.height));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
          canvas.width = w * dpr;
          canvas.height = h * dpr;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawNotebookCanvasIllustration(ctx, w, h, page.id, now / 1000);
          ctx.restore();
        }
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, page.id]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#1E293B]/20 p-3 backdrop-blur-[1.5px] sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sổ tay võ công người que"
    >
      <div
        className="relative w-full max-w-[650px] overflow-hidden rounded-lg border-2 border-slate-700/80 bg-[#FDF8EB] shadow-[5px_7px_0_rgba(30,41,59,0.22)]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(169,203,233,0.42) 27px, rgba(169,203,233,0.42) 28px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Double red vertical notebook margin inside the book */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 bottom-0 left-7 w-[4px] border-x border-[#DF646E]/65 sm:left-10"
        />

        {/* Notebook spiral binding holes along left edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 bottom-6 left-1.5 flex flex-col justify-between sm:left-2.5"
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full border border-slate-600/75 bg-[#E2D9C2]"
            />
          ))}
        </div>

        {/* Header: Chapter tabs + Close */}
        <div className="relative flex items-center justify-between gap-2 border-b border-slate-400/45 bg-[#FAF2DD]/85 py-2.5 pr-3 pl-10 sm:pr-4 sm:pl-14">
          <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Mục lục sổ tay">
            {PAGES.map((p, idx) => {
              const active = idx === pageIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => goToPage(idx)}
                  className={`min-h-[34px] rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700 sm:text-sm ${
                    active
                      ? 'border border-slate-700/70 bg-[#FDF8EB] text-slate-900 underline decoration-2 underline-offset-4'
                      : 'text-slate-600 hover:bg-[#F3E8CC] hover:text-slate-900'
                  }`}
                >
                  {p.tabLabel}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng sổ tay"
            className="inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-md border border-slate-400/60 bg-[#FDF8EB] text-slate-700 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-[#FDF8EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Single-topic Notebook Page Body */}
        <div
          key={flipKey}
          className="relative py-4 pr-4 pl-10 transition-opacity duration-200 sm:py-5 sm:pr-6 sm:pl-14"
        >
          {/* Page heading & rhythm */}
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2">
            <h2
              className="font-hand text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: page.accentHex }}
            >
              {page.title}
            </h2>
            <span className="text-xs font-medium text-slate-600 sm:text-sm">
              {page.rhythm}
            </span>
          </div>

          {/* Live animated hand-drawn 3-panel comic illustration */}
          <div className="overflow-hidden rounded-md border border-slate-500/45 bg-[#FDF8EB]/70">
            <canvas
              ref={canvasRef}
              className="block h-[156px] w-full sm:h-[184px]"
            />
          </div>

          {/* 3 Illustrated Step Captions (strictly aligned to the 3 panels above) */}
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {page.panels.map((panel) => (
              <div
                key={panel.stepLabel}
                className="rounded border border-slate-400/40 bg-[#FAF2DD]/55 px-2.5 py-2"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <span>{panel.stepLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-800">{panel.moveTitle}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-700 sm:text-[13px]">
                  {panel.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Single crisp note for unique paper/weapon trait */}
          <p className="mt-3 border-t border-slate-400/35 pt-2.5 text-xs leading-relaxed text-slate-700 sm:text-sm">
            <span className="font-semibold text-slate-900">Mẹo riêng: </span>
            {page.traitNote}
          </p>
        </div>

        {/* Bottom Page Flip Navigation */}
        <div className="relative flex items-center justify-between gap-3 border-t border-slate-400/45 bg-[#FAF2DD]/85 py-2.5 pr-4 pl-10 sm:pr-6 sm:pl-14">
          <button
            type="button"
            onClick={() => goToPage(pageIndex - 1)}
            className="inline-flex min-h-[40px] items-center gap-1 rounded-md border border-slate-500/60 bg-[#FDF8EB] px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-slate-800 transition-colors hover:border-slate-800 hover:bg-[#F3E8CC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Trang trước</span>
          </button>

          <span className="font-hand text-base font-bold text-slate-700 tabular-nums">
            Trang {pageIndex + 1} / {PAGES.length}
          </span>

          <button
            type="button"
            onClick={() => goToPage(pageIndex + 1)}
            className="inline-flex min-h-[40px] items-center gap-1 rounded-md border border-slate-500/60 bg-[#FDF8EB] px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-slate-800 transition-colors hover:border-slate-800 hover:bg-[#F3E8CC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <span>Trang sau</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
