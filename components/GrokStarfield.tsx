"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * GrokStarfield v3 — layered parallax starfield with realistic 5-point stars
 * and cinematic shooting stars.
 *
 * Key properties:
 * - Three depth layers (far / mid / near) rotate at different rates for parallax.
 * - Stars are stored as NORMALIZED coordinates (0..1) so resizing the viewport
 *   rescales their positions automatically — no clustering at the top-left
 *   after a window resize or devtools toggle.
 * - Near + mid layers render as actual 5-point stars with a soft glow. The far
 *   layer renders as tiny dots (at 0.5-1.2 px the shape is invisible anyway
 *   and dots are ~20x cheaper per frame).
 * - Realistic stellar-class color tints, heavily white-weighted.
 * - Very subtle nebula patches behind the stars — low enough alpha that the
 *   "black night sky" feel dominates.
 * - Shooting stars: 3-4s lifetime, 220-320px gradient trail with a bright
 *   core line, a soft outer plume, and a radial head glow. Cadence 12-25s
 *   with a 70% spawn probability, so stretches of empty sky are possible.
 * - Full static fallback when prefers-reduced-motion is set.
 */

type StarTint = { r: number; g: number; b: number };

/** Stellar-class-inspired tints. Heavily white-weighted so the field reads as
 *  a realistic night sky rather than a confetti of colors. */
const STAR_TINTS: Array<{ tint: StarTint; weight: number }> = [
  { tint: { r: 255, g: 255, b: 255 }, weight: 65 }, // white
  { tint: { r: 210, g: 230, b: 255 }, weight: 15 }, // pale blue-white
  { tint: { r: 255, g: 245, b: 215 }, weight: 10 }, // warm white
  { tint: { r: 255, g: 225, b: 180 }, weight: 7 },  // pale orange
  { tint: { r: 255, g: 205, b: 175 }, weight: 3 },  // pale red
];

function pickStarTint(): StarTint {
  const total = STAR_TINTS.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const entry of STAR_TINTS) {
    if (r < entry.weight) return entry.tint;
    r -= entry.weight;
  }
  return STAR_TINTS[0].tint;
}

interface Star {
  /** Normalized x position 0..1 — multiplied by canvas width at draw time. */
  nx: number;
  /** Normalized y position 0..1 — multiplied by canvas height at draw time. */
  ny: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  shouldTwinkle: boolean;
  tint: StarTint;
  layer: 0 | 1 | 2; // 0=far, 1=mid, 2=near
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  tailLength: number;
}

export function GrokStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Resize: update both the backing store and the CSS size, then reinstate
    // the DPR transform. Stars use normalized coordinates so nothing else
    // needs to change — they'll just rescale on next draw.
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const cssW = () => canvas.width / dpr;
    const cssH = () => canvas.height / dpr;

    // Counts tuned for "rich but readable" — reduced-motion gets ~40% density
    // and no animation.
    const counts = shouldReduceMotion
      ? { far: 100, mid: 50, near: 20 }
      : { far: 240, mid: 120, near: 50 };

    const makeStar = (layer: 0 | 1 | 2): Star => {
      const sizeRanges: Record<0 | 1 | 2, [number, number]> = {
        0: [0.5, 1.2],
        1: [1.0, 2.0],
        2: [1.6, 3.0],
      };
      const opacityRanges: Record<0 | 1 | 2, [number, number]> = {
        0: [0.3, 0.6],
        1: [0.45, 0.8],
        2: [0.65, 0.98],
      };
      const [sMin, sMax] = sizeRanges[layer];
      const [oMin, oMax] = opacityRanges[layer];
      const twinkleChance = layer === 2 ? 0.7 : layer === 1 ? 0.45 : 0.25;
      return {
        nx: Math.random(),
        ny: Math.random(),
        size: sMin + Math.random() * (sMax - sMin),
        opacity: oMin + Math.random() * (oMax - oMin),
        twinkleSpeed: shouldReduceMotion ? 0 : 0.0008 + Math.random() * 0.002,
        twinkleOffset: Math.random() * Math.PI * 2,
        shouldTwinkle: !shouldReduceMotion && Math.random() < twinkleChance,
        tint: pickStarTint(),
        layer,
      };
    };

    const stars: Star[] = [
      ...Array.from({ length: counts.far }, () => makeStar(0)),
      ...Array.from({ length: counts.mid }, () => makeStar(1)),
      ...Array.from({ length: counts.near }, () => makeStar(2)),
    ];

    // Very subtle nebula patches — low alpha so the black sky dominates.
    const nebulae = shouldReduceMotion
      ? []
      : [
          { x: 0.2,  y: 0.3,  r: 380, color: "rgba(6, 182, 212, 0.022)",  driftSpeed: 0.00006, phase: 0 },
          { x: 0.78, y: 0.65, r: 420, color: "rgba(168, 85, 247, 0.02)",  driftSpeed: 0.00005, phase: Math.PI },
          { x: 0.5,  y: 0.15, r: 300, color: "rgba(245, 158, 11, 0.012)", driftSpeed: 0.00004, phase: Math.PI / 2 },
        ];

    let shootingStar: ShootingStar | null = null;
    let shootingStarTimer = shouldReduceMotion
      ? Number.POSITIVE_INFINITY
      : 6000 + Math.random() * 9000;

    const spawnShootingStar = () => {
      const side = Math.random();
      const speed = 2.6 + Math.random() * 1.4; // px per frame at ~60fps
      const angleDeg = 22 + Math.random() * 20;
      const angle = (angleDeg * Math.PI) / 180;
      const w = cssW();
      const h = cssH();

      let x: number, y: number, vx: number, vy: number;

      if (side < 0.45) {
        x = Math.random() * w * 0.6;
        y = -40;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      } else if (side < 0.9) {
        x = w * 0.4 + Math.random() * w * 0.6;
        y = -40;
        vx = -Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      } else {
        x = w + 40;
        y = Math.random() * h * 0.3;
        vx = -Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed * 0.8;
      }

      const maxLife = 180 + Math.floor(Math.random() * 60); // 3-4s at 60fps
      shootingStar = {
        x, y, vx, vy,
        life: maxLife,
        maxLife,
        tailLength: 220 + Math.random() * 100,
      };
    };

    /** Fast path for the far layer — draw a plain dot with no glow, no shape.
     *  At 0.5-1.2 px the shape would be invisible anyway. */
    const drawDot = (x: number, y: number, size: number, opacity: number, tint: StarTint) => {
      ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    /** Pretty path — soft radial glow + a 5-point star shape. Used for mid
     *  and near layers where the shape reads and the glow gives the sparkle
     *  feel from the original field. */
    const drawStarShape = (
      x: number,
      y: number,
      size: number,
      opacity: number,
      tint: StarTint,
      rotation: number,
    ) => {
      const { r, g, b } = tint;

      // Soft outer glow.
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3.2);
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`);
      glow.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${opacity * 0.2})`);
      glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, size * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // 5-point star shape: alternate between outer (size * 1.5) and inner
      // (size * 0.6) radii for a crisp spike pattern.
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const ang = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? size * 1.5 : size * 0.6;
        const px = Math.cos(ang) * radius;
        const py = Math.sin(ang) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      // Bright center point for sparkle.
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, opacity * 1.1)})`;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawShootingStar = (s: ShootingStar) => {
      const progress = 1 - s.life / s.maxLife;
      const alpha = Math.sin(progress * Math.PI);
      if (alpha <= 0.01) return;

      const mag = Math.hypot(s.vx, s.vy) || 1;
      const ux = s.vx / mag;
      const uy = s.vy / mag;
      const tailX = s.x - ux * s.tailLength;
      const tailY = s.y - uy * s.tailLength;

      // Outer plume — wide, faint, comet body.
      const plume = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      plume.addColorStop(0, `rgba(220, 235, 255, ${alpha * 0.45})`);
      plume.addColorStop(0.25, `rgba(180, 210, 255, ${alpha * 0.2})`);
      plume.addColorStop(1, "rgba(180, 210, 255, 0)");
      ctx.strokeStyle = plume;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Inner bright streak.
      const core = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      core.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      core.addColorStop(0.15, `rgba(240, 245, 255, ${alpha * 0.85})`);
      core.addColorStop(0.6, `rgba(200, 220, 255, ${alpha * 0.3})`);
      core.addColorStop(1, "rgba(200, 220, 255, 0)");
      ctx.strokeStyle = core;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Head glow.
      const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 12);
      headGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      headGlow.addColorStop(0.4, `rgba(220, 235, 255, ${alpha * 0.55})`);
      headGlow.addColorStop(1, "rgba(220, 235, 255, 0)");
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Solid head dot.
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    };

    // Full rotation periods per layer (far drifts slowest).
    const LAYER_ROT: Record<0 | 1 | 2, number> = {
      0: (2 * Math.PI) / 480_000,
      1: (2 * Math.PI) / 360_000,
      2: (2 * Math.PI) / 240_000,
    };

    let frameId = 0;
    let lastTs = performance.now();
    const START = lastTs;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - START;
      const cw = cssW();
      const ch = cssH();
      ctx.clearRect(0, 0, cw, ch);

      // Subtle nebula backdrop.
      for (const n of nebulae) {
        const drift = Math.sin(timestamp * n.driftSpeed + n.phase);
        const x = n.x * cw + drift * 40;
        const y = n.y * ch + drift * 25;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, n.r);
        grad.addColorStop(0, n.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }

      const centerX = cw / 2;
      const centerY = ch / 2;

      for (const star of stars) {
        // Resolve to absolute pixel coords from normalized.
        const baseX = star.nx * cw;
        const baseY = star.ny * ch;

        const rot = shouldReduceMotion ? 0 : elapsed * LAYER_ROT[star.layer];
        let x = baseX;
        let y = baseY;
        if (rot !== 0) {
          const dx = baseX - centerX;
          const dy = baseY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ang = Math.atan2(dy, dx) + rot;
          x = centerX + Math.cos(ang) * dist;
          y = centerY + Math.sin(ang) * dist;
        }

        let opacity = star.opacity;
        if (star.shouldTwinkle) {
          const depth = star.layer === 0 ? 0.5 : star.layer === 1 ? 0.35 : 0.22;
          opacity *=
            1 - depth + depth * Math.sin(timestamp * star.twinkleSpeed + star.twinkleOffset);
        }

        if (star.layer === 0) {
          drawDot(x, y, star.size, opacity, star.tint);
        } else {
          // Slow per-star rotation of the 5-point shape gives a subtle
          // shimmer without making the sky feel busy.
          const shapeRot = timestamp * 0.00004 + star.twinkleOffset;
          drawStarShape(x, y, star.size, opacity, star.tint, shapeRot);
        }
      }

      if (shootingStar) {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.life -= 1;

        const offscreen =
          shootingStar.x < -300 ||
          shootingStar.x > cw + 300 ||
          shootingStar.y < -300 ||
          shootingStar.y > ch + 300;

        if (shootingStar.life <= 0 || offscreen) {
          shootingStar = null;
          shootingStarTimer = shouldReduceMotion
            ? Number.POSITIVE_INFINITY
            : 12_000 + Math.random() * 13_000;
        } else {
          drawShootingStar(shootingStar);
        }
      } else if (!shouldReduceMotion) {
        const dt = timestamp - lastTs;
        shootingStarTimer -= dt;
        if (shootingStarTimer <= 0 && Math.random() < 0.7) {
          spawnShootingStar();
        } else if (shootingStarTimer <= 0) {
          shootingStarTimer = 3_000 + Math.random() * 4_000;
        }
      }

      lastTs = timestamp;
      if (!shouldReduceMotion) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, [shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    />
  );
}
