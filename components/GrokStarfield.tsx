"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * GrokStarfield v2 — layered parallax starfield with realistic shooting stars.
 *
 * Design notes:
 * - Three depth layers (far / mid / near) rotate at different rates to create
 *   parallax without using per-frame 3D math. Far stars drift slowest.
 * - Stars carry realistic stellar-class tints (mostly white, with a long tail
 *   of cyan, gold, orange, and red) so the field reads as a night sky rather
 *   than a pure monochrome dot pattern.
 * - Twinkle is a cheap sine wave per star with random phase/speed, and only
 *   roughly half of stars twinkle at all.
 * - Shooting stars have a proper comet-like gradient trail with a bright
 *   head, a long fading tail, and a soft outer plume. They appear every
 *   12-25s and live for ~3-4s, so they feel rare and cinematic rather than
 *   constant.
 * - Three very soft nebula patches sit behind everything and breathe with a
 *   long cycle so the background never feels flat.
 * - Everything collapses to a static, low-cost field when
 *   prefers-reduced-motion is set.
 */

type StarTint = { r: number; g: number; b: number };

/** Stellar-class-inspired tint palette. Weights roughly mirror real spectral
 *  distribution in a night-sky sample: overwhelmingly white with faint blues,
 *  golds, oranges, reds. Values deliberately stay near white so the field
 *  reads as realistic rather than tropical. */
const STAR_TINTS: Array<{ tint: StarTint; weight: number }> = [
  { tint: { r: 255, g: 255, b: 255 }, weight: 65 }, // white
  { tint: { r: 210, g: 230, b: 255 }, weight: 15 }, // pale blue-white (O/B)
  { tint: { r: 255, g: 245, b: 215 }, weight: 10 }, // warm white (G)
  { tint: { r: 255, g: 225, b: 180 }, weight: 7 },  // pale orange (K)
  { tint: { r: 255, g: 205, b: 175 }, weight: 3 },  // pale red (M)
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
  baseX: number;
  baseY: number;
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
  life: number;       // frames remaining
  maxLife: number;    // total lifetime in frames
  tailLength: number; // in px at peak
}

export function GrokStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Device pixel ratio scaling so stars stay sharp on retina displays.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    // Layer counts tuned for "rich but not busy" on a 1440p canvas.
    // Reduced-motion users get ~40% of the full field and no animation.
    const counts = shouldReduceMotion
      ? { far: 100, mid: 50, near: 20 }
      : { far: 240, mid: 120, near: 50 };

    const makeStar = (layer: 0 | 1 | 2): Star => {
      const sizeRanges: Record<0 | 1 | 2, [number, number]> = {
        0: [0.5, 1.2],  // far — tiny specks
        1: [1.0, 2.0],  // mid — small-medium
        2: [1.6, 3.0],  // near — larger, twinkly
      };
      const opacityRanges: Record<0 | 1 | 2, [number, number]> = {
        0: [0.25, 0.55],
        1: [0.4, 0.75],
        2: [0.6, 0.95],
      };
      const [sMin, sMax] = sizeRanges[layer];
      const [oMin, oMax] = opacityRanges[layer];
      // Near layer twinkles more often; far layer rarely.
      const twinkleChance = layer === 2 ? 0.7 : layer === 1 ? 0.45 : 0.25;
      return {
        baseX: Math.random() * cssW(),
        baseY: Math.random() * cssH(),
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

    // Nebula patches — very faint, slow-drifting color pools behind the stars
    // so the background feels deeper than flat black. Colors map to the site's
    // accent tokens but at dilute alpha.
    const nebulae = shouldReduceMotion
      ? []
      : [
          { x: 0.2, y: 0.3, r: 380, color: "rgba(6, 182, 212, 0.05)",  driftSpeed: 0.00006, phase: 0 },
          { x: 0.78, y: 0.65, r: 420, color: "rgba(168, 85, 247, 0.045)", driftSpeed: 0.00005, phase: Math.PI },
          { x: 0.5, y: 0.15, r: 300, color: "rgba(245, 158, 11, 0.025)", driftSpeed: 0.00004, phase: Math.PI / 2 },
        ];

    let shootingStar: ShootingStar | null = null;
    // First shooting star arrives 6-15s after mount, then 12-25s apart.
    let shootingStarTimer = shouldReduceMotion
      ? Number.POSITIVE_INFINITY
      : 6000 + Math.random() * 9000;

    const spawnShootingStar = () => {
      // Pick a side; bias toward top/sides so stars fall "down" most of the time.
      const side = Math.random();
      // Diagonal angle in radians, varied within a cinematic band.
      // Base direction points down-left or down-right depending on side.
      const speed = 2.6 + Math.random() * 1.4; // px per frame at 60fps
      const angleDeg = 22 + Math.random() * 20; // 22-42 degrees off horizontal
      const angle = (angleDeg * Math.PI) / 180;

      let x: number, y: number, vx: number, vy: number;
      const w = cssW();
      const h = cssH();

      if (side < 0.45) {
        // From top, falling down-right
        x = Math.random() * w * 0.6;
        y = -40;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      } else if (side < 0.9) {
        // From top, falling down-left
        x = w * 0.4 + Math.random() * w * 0.6;
        y = -40;
        vx = -Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      } else {
        // From the right edge, crossing toward bottom-left (rarer, dramatic)
        x = w + 40;
        y = Math.random() * h * 0.3;
        vx = -Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed * 0.8;
      }

      // 3-4 seconds of life at ~60fps = 180-240 frames.
      const maxLife = 180 + Math.floor(Math.random() * 60);
      shootingStar = {
        x, y, vx, vy,
        life: maxLife,
        maxLife,
        tailLength: 220 + Math.random() * 100, // 220-320px trails
      };
    };

    const drawStar = (
      x: number,
      y: number,
      size: number,
      opacity: number,
      tint: StarTint,
      withGlow: boolean,
    ) => {
      const { r, g, b } = tint;
      if (withGlow) {
        // Soft radial glow for near/mid stars.
        const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3.2);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity * 0.65})`);
        glow.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${opacity * 0.22})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, size * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Solid core dot — dominant visual.
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawShootingStar = (s: ShootingStar) => {
      const progress = 1 - s.life / s.maxLife; // 0 -> 1
      // Smooth ramp in/out via half-sine: alpha peaks mid-flight.
      const alpha = Math.sin(progress * Math.PI);
      if (alpha <= 0.01) return;

      // Unit vector of travel direction.
      const mag = Math.hypot(s.vx, s.vy) || 1;
      const ux = s.vx / mag;
      const uy = s.vy / mag;

      // Tail end point
      const tailX = s.x - ux * s.tailLength;
      const tailY = s.y - uy * s.tailLength;

      // Outer plume: wider, fainter, gives the comet-like soft body.
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

      // Inner bright line: tight, white, gives the hard streak.
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

      // Bright head with layered glow.
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

    // Rotation speeds per layer — far drifts slowest, near rotates a bit faster
    // so the parallax illusion reads without any per-frame 3D math.
    // Full rotation periods: far ~ 480s, mid ~ 360s, near ~ 240s.
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

      // Nebula background pass — very cheap even at peak alpha.
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

      // Star pass — rotate each star around the center with its layer's speed.
      for (const star of stars) {
        const rot = shouldReduceMotion ? 0 : elapsed * LAYER_ROT[star.layer];
        let x = star.baseX;
        let y = star.baseY;
        if (rot !== 0) {
          const dx = star.baseX - centerX;
          const dy = star.baseY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ang = Math.atan2(dy, dx) + rot;
          x = centerX + Math.cos(ang) * dist;
          y = centerY + Math.sin(ang) * dist;
        }

        let opacity = star.opacity;
        if (star.shouldTwinkle) {
          // Twinkle depth shrinks with size so large stars twinkle subtly.
          const depth = star.layer === 0 ? 0.5 : star.layer === 1 ? 0.35 : 0.22;
          opacity *=
            1 - depth + depth * Math.sin(timestamp * star.twinkleSpeed + star.twinkleOffset);
        }

        // Only draw a soft glow halo on mid + near stars — keeps the fill rate
        // sane when there are 240 far stars on screen.
        drawStar(x, y, star.size, opacity, star.tint, star.layer > 0);
      }

      // Shooting star update + draw
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
          // Schedule next — 12-25s cadence.
          shootingStarTimer = shouldReduceMotion
            ? Number.POSITIVE_INFINITY
            : 12_000 + Math.random() * 13_000;
        } else {
          drawShootingStar(shootingStar);
        }
      } else if (!shouldReduceMotion) {
        const dt = timestamp - lastTs;
        shootingStarTimer -= dt;
        // 70% chance to actually spawn when the timer elapses, so the cadence
        // stays varied and a rare stretch of empty sky is possible.
        if (shootingStarTimer <= 0 && Math.random() < 0.7) {
          spawnShootingStar();
        } else if (shootingStarTimer <= 0) {
          // Missed this spawn roll — try again soon.
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
