"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Worm } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { readBest, recordScore } from "@/lib/arcade-scores";

const COLS = 24;
const ROWS = 24;
const BASE_TICK_MS = 110; // starting speed
const MIN_TICK_MS = 55; // speed cap
const RAMP_PER_FOOD = 2; // ms shaved off per food eaten
const MAX_CANVAS = 520; // px cap on desktop

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string;
}

interface Popup {
  x: number; y: number;
  text: string;
  life: number; maxLife: number;
}

const COLORS = {
  bg: "#050505",
  grid: "rgba(6,182,212,0.04)",
  snake: "#06b6d4",
  snakeHead: "#22d3ee",
  snakeGlow: "rgba(6,182,212,0.4)",
  food: "#f59e0b",
  foodGlow: "rgba(245,158,11,0.5)",
  border: "rgba(255,255,255,0.08)",
};

function randomPos(exclude: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (exclude.some((e) => e.x === p.x && e.y === p.y));
  return p;
}

export default function PlayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"menu" | "countdown" | "playing" | "paused" | "over">("menu");
  const [countdown, setCountdown] = useState<number | "GO">(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speedMult, setSpeedMult] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [canvasSize, setCanvasSize] = useState(384);

  // Mutable game state for the rAF loop
  const snake = useRef<Point[]>([{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }]);
  const dir = useRef<Dir>("RIGHT");
  const nextDir = useRef<Dir>("RIGHT");
  const food = useRef<Point>(randomPos(snake.current));
  const scoreRef = useRef(0);
  const foodsEaten = useRef(0);
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Juice state
  const particles = useRef<Particle[]>([]);
  const popups = useRef<Popup[]>([]);
  const shake = useRef({ t: 0, mag: 0 });
  const accumulator = useRef(0);
  const lastFrame = useRef(0);
  const sizeRef = useRef(384);
  const reducedMotion = useRef(false);

  // Persistent high score via the unified arcade store
  const highScoreRef = useRef(0);
  useEffect(() => {
    const best = readBest("snake")?.value ?? 0;
    highScoreRef.current = best;
    setHighScore(best);
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Responsive canvas — fill the container up to MAX_CANVAS, crisp at any DPR
  useEffect(() => {
    const measure = () => {
      const w = wrapRef.current?.clientWidth ?? 384;
      const size = Math.max(240, Math.min(w, MAX_CANVAS));
      sizeRef.current = size;
      setCanvasSize(size);
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const currentTickMs = useCallback(() => {
    return Math.max(MIN_TICK_MS, BASE_TICK_MS - foodsEaten.current * RAMP_PER_FOOD);
  }, []);

  const spawnBurst = useCallback((cx: number, cy: number, color: string, count: number, speed: number) => {
    if (reducedMotion.current) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.4 + Math.random() * 0.8);
      particles.current.push({
        x: cx, y: cy,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 0, maxLife: 0.45 + Math.random() * 0.35,
        size: 1.5 + Math.random() * 2.5,
        color,
      });
    }
  }, []);

  /* ── Render one frame (runs every rAF) ── */
  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = sizeRef.current;
    const dpr = canvas.width / size;
    const cell = size / COLS;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Screen shake offset
    if (shake.current.t > 0 && !reducedMotion.current) {
      const m = shake.current.mag * (shake.current.t / 0.28);
      ctx.translate((Math.random() - 0.5) * 2 * m, (Math.random() - 0.5) * 2 * m);
    }

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(-8, -8, size + 16, size + 16);

    // Grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, size); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(size, y * cell); ctx.stroke();
    }

    // Food — pulsing
    const pulse = reducedMotion.current ? 0 : Math.sin(now / 220) * 0.15;
    const fx = food.current.x * cell + cell / 2;
    const fy = food.current.y * cell + cell / 2;
    const fGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, cell * (1.5 + pulse));
    fGrad.addColorStop(0, COLORS.foodGlow);
    fGrad.addColorStop(1, "transparent");
    ctx.fillStyle = fGrad;
    ctx.fillRect(fx - cell * 2, fy - cell * 2, cell * 4, cell * 4);
    ctx.fillStyle = COLORS.food;
    ctx.shadowColor = COLORS.food;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(fx, fy, (cell / 2 - 1) * (1 + pulse), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake with trail effect
    snake.current.forEach((seg, i) => {
      const sx = seg.x * cell;
      const sy = seg.y * cell;
      const isHead = i === 0;

      if (isHead) {
        const hGrad = ctx.createRadialGradient(
          sx + cell / 2, sy + cell / 2, 0,
          sx + cell / 2, sy + cell / 2, cell * 1.5
        );
        hGrad.addColorStop(0, COLORS.snakeGlow);
        hGrad.addColorStop(1, "transparent");
        ctx.fillStyle = hGrad;
        ctx.fillRect(sx - cell * 1.5, sy - cell * 1.5, cell * 3, cell * 3);
      }

      const alpha = isHead ? 1 : Math.max(0.2, 1 - (i / snake.current.length) * 0.8);
      ctx.fillStyle = isHead ? COLORS.snakeHead : COLORS.snake;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = COLORS.snake;
      ctx.shadowBlur = isHead ? 14 : 6;

      const r = isHead ? cell / 4 : cell / 5;
      const pad = 1;
      ctx.beginPath();
      ctx.roundRect(sx + pad, sy + pad, cell - pad * 2, cell - pad * 2, r);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    // Particles
    for (const p of particles.current) {
      const t = p.life / p.maxLife;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - t * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Score popups
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.max(12, cell * 0.85)}px ui-monospace, monospace`;
    for (const pop of popups.current) {
      const t = pop.life / pop.maxLife;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = COLORS.food;
      ctx.shadowColor = COLORS.food;
      ctx.shadowBlur = 8;
      ctx.fillText(pop.text, pop.x, pop.y - t * cell * 1.6);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);
  }, []);

  /* ── Advance game logic one cell ── */
  const step = useCallback(() => {
    const cell = sizeRef.current / COLS;
    dir.current = nextDir.current;
    const head = { ...snake.current[0] };

    switch (dir.current) {
      case "UP": head.y--; break;
      case "DOWN": head.y++; break;
      case "LEFT": head.x--; break;
      case "RIGHT": head.x++; break;
    }

    // Wall collision (wrap mode)
    if (head.x < 0) head.x = COLS - 1;
    if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    if (head.y >= ROWS) head.y = 0;

    // Self collision — death
    if (snake.current.some((s) => s.x === head.x && s.y === head.y)) {
      shake.current = { t: 0.28, mag: 7 };
      spawnBurst(head.x * cell + cell / 2, head.y * cell + cell / 2, "#ef4444", 22, 160);
      spawnBurst(head.x * cell + cell / 2, head.y * cell + cell / 2, COLORS.snake, 14, 110);
      setGameState("over");
      const { best } = recordScore("snake", scoreRef.current, "higher");
      highScoreRef.current = best;
      setHighScore(best);
      return;
    }

    snake.current.unshift(head);

    // Eat food
    if (head.x === food.current.x && head.y === food.current.y) {
      scoreRef.current += 10;
      foodsEaten.current += 1;
      setScore(scoreRef.current);
      setSpeedMult(Math.round((BASE_TICK_MS / currentTickMs()) * 10) / 10);
      spawnBurst(
        food.current.x * cell + cell / 2,
        food.current.y * cell + cell / 2,
        COLORS.food, 12, 120
      );
      popups.current.push({
        x: food.current.x * cell + cell / 2,
        y: food.current.y * cell + cell / 2,
        text: "+10",
        life: 0, maxLife: 0.7,
      });
      food.current = randomPos(snake.current);
    } else {
      snake.current.pop();
    }
  }, [currentTickMs, spawnBurst]);

  /* ── Master rAF loop: fixed-step logic + per-frame FX ── */
  useEffect(() => {
    let raf: number;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - (lastFrame.current || now)) / 1000);
      lastFrame.current = now;

      if (stateRef.current === "playing") {
        accumulator.current += dt * 1000;
        const tickMs = currentTickMs();
        while (accumulator.current >= tickMs) {
          accumulator.current -= tickMs;
          step();
          if (stateRef.current !== "playing") { accumulator.current = 0; break; }
        }
      }

      // FX updates run in every state so death bursts + shake play out
      if (shake.current.t > 0) shake.current.t = Math.max(0, shake.current.t - dt);
      particles.current = particles.current.filter((p) => {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.92;
        p.vy *= 0.92;
        return p.life < p.maxLife;
      });
      popups.current = popups.current.filter((p) => {
        p.life += dt;
        return p.life < p.maxLife;
      });

      draw(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw, step, currentTickMs]);

  /* ── Start sequence: 3·2·1·GO countdown, then play ── */
  const startGame = useCallback(() => {
    snake.current = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
    dir.current = "RIGHT";
    nextDir.current = "RIGHT";
    food.current = randomPos(snake.current);
    scoreRef.current = 0;
    foodsEaten.current = 0;
    particles.current = [];
    popups.current = [];
    shake.current = { t: 0, mag: 0 };
    accumulator.current = 0;
    setScore(0);
    setSpeedMult(1);

    if (reducedMotion.current) {
      setGameState("playing");
      return;
    }
    setGameState("countdown");
    setCountdown(3);
    const seq: (number | "GO")[] = [2, 1, "GO"];
    seq.forEach((v, i) => {
      window.setTimeout(() => setCountdown(v), (i + 1) * 480);
    });
    window.setTimeout(() => setGameState("playing"), (seq.length + 1) * 480 - 140);
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (gameState === "menu" || gameState === "over") startGame();
        else if (gameState === "playing") setGameState("paused");
        else if (gameState === "paused") setGameState("playing");
        return;
      }
      if (gameState !== "playing" && gameState !== "countdown") return;
      const map: Record<string, Dir> = {
        ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
        W: "UP", S: "DOWN", A: "LEFT", D: "RIGHT",
      };
      const nd = map[e.key];
      if (!nd) return;
      e.preventDefault();
      const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      if (nd !== opp[dir.current]) nextDir.current = nd;
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, startGame]);

  // Touch controls
  const touchStart = useRef<Point | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || gameState !== "playing") return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    if (Math.abs(dx) > Math.abs(dy)) {
      const nd = dx > 0 ? "RIGHT" : "LEFT";
      if (nd !== opp[dir.current]) nextDir.current = nd;
    } else {
      const nd = dy > 0 ? "DOWN" : "UP";
      if (nd !== opp[dir.current]) nextDir.current = nd;
    }
  };

  const dpad = (d: Dir) => {
    if (gameState !== "playing") return;
    const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    if (d !== opp[dir.current]) nextDir.current = d;
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <Navbar breadcrumb={["arcade", "snake"]} accent="#06b6d4" />

      <div className="absolute top-20 right-4 z-20">
        <Link href="/play" className="px-4 py-2 text-xs font-mono text-cyan-400 border border-cyan-400/40 rounded hover:bg-cyan-400/10 transition-colors">
          ← Back to Arcade
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 mt-14 w-full max-w-[560px]">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-mono">
            NEON SNAKE
          </h1>
          <p className="text-xs text-white/30 font-mono mt-2">A classic, reimagined</p>
        </motion.div>

        {/* Score */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <motion.div
              key={score}
              initial={{ scale: score > 0 ? 1.35 : 1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-2xl font-bold text-cyan-400 font-mono tabular-nums"
            >
              {score}
            </motion.div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Score</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 font-mono tabular-nums">{highScore}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Best</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">×{speedMult.toFixed(1)}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Speed</div>
          </div>
        </div>

        {/* Canvas */}
        <div ref={wrapRef} className="w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-xl overflow-hidden"
            style={{ boxShadow: "0 0 40px rgba(6,182,212,0.1), inset 0 0 40px rgba(6,182,212,0.02)" }}
          >
            <canvas
              ref={canvasRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="block touch-none"
              style={{ width: canvasSize, height: canvasSize }}
            />

            {/* Overlay states */}
            <AnimatePresence>
              {gameState === "menu" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <motion.span
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="p-4 rounded-2xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                    style={{ boxShadow: "0 0 30px rgba(6,182,212,0.35)" }}
                  >
                    <Worm size={44} strokeWidth={1.5} aria-hidden />
                  </motion.span>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-mono font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                  >
                    Play
                  </motion.button>
                  <p className="text-[10px] text-white/30 font-mono">Press Space or Enter</p>
                </motion.div>
              )}
              {gameState === "countdown" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <motion.span
                    key={String(countdown)}
                    initial={{ scale: 1.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="font-mono font-black text-6xl"
                    style={{
                      color: countdown === "GO" ? "#22d3ee" : "#fff",
                      textShadow: "0 0 30px rgba(6,182,212,0.8)",
                    }}
                  >
                    {countdown}
                  </motion.span>
                </motion.div>
              )}
              {gameState === "paused" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <div className="text-white font-mono font-bold text-xl uppercase tracking-widest">Paused</div>
                  <p className="text-[10px] text-white/30 font-mono">Press Space to resume</p>
                </motion.div>
              )}
              {gameState === "over" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: 0.35 }}
                  className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
                  <div className="text-red-400 font-mono font-bold text-2xl uppercase tracking-widest">Game Over</div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white font-mono mb-1">{score}</div>
                    <div className="text-xs text-white/50 font-mono">SCORE</div>
                  </div>
                  {score >= highScore && score > 0 && (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-sm text-yellow-400 font-mono font-bold px-4 py-2 border border-yellow-400/50 rounded animate-pulse"
                    >
                      New High Score!
                    </motion.div>
                  )}
                  {highScore > 0 && (
                    <div className="text-xs text-white/60 font-mono">
                      Best: <span className="text-purple-400 font-bold">{highScore}</span>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={startGame}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-mono font-bold text-sm uppercase tracking-wider"
                    >
                      Play Again
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/play"
                        className="block px-8 py-3 rounded-xl border border-cyan-400/50 text-cyan-400 font-mono font-bold text-sm uppercase tracking-wider hover:bg-cyan-400/10 text-center"
                      >
                        Back
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Mobile D-pad */}
        <div className="sm:hidden grid grid-cols-3 gap-2 w-40">
          <div />
          <button onTouchStart={() => dpad("UP")} className="h-12 rounded-lg bg-white/5 border border-white/10 active:bg-cyan-400/20 flex items-center justify-center text-white/50">▲</button>
          <div />
          <button onTouchStart={() => dpad("LEFT")} className="h-12 rounded-lg bg-white/5 border border-white/10 active:bg-cyan-400/20 flex items-center justify-center text-white/50">◀</button>
          <button onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") setGameState("paused"); else if (gameState === "paused") setGameState("playing"); else if (gameState !== "countdown") startGame(); }}
            className="h-12 rounded-lg bg-white/5 border border-white/10 active:bg-cyan-400/20 flex items-center justify-center text-[10px] font-mono text-white/50">
            {gameState === "playing" ? "II" : "▶"}
          </button>
          <button onTouchStart={() => dpad("RIGHT")} className="h-12 rounded-lg bg-white/5 border border-white/10 active:bg-cyan-400/20 flex items-center justify-center text-white/50">▶</button>
          <div />
          <button onTouchStart={() => dpad("DOWN")} className="h-12 rounded-lg bg-white/5 border border-white/10 active:bg-cyan-400/20 flex items-center justify-center text-white/50">▼</button>
          <div />
        </div>

        {/* Controls hint */}
        <button onClick={() => setShowControls(!showControls)} className="text-[10px] text-white/20 font-mono hover:text-white/40 transition-colors">
          {showControls ? "Hide controls" : "Show controls"}
        </button>
        <AnimatePresence>
          {showControls && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="text-xs text-white/30 font-mono space-y-1 text-center overflow-hidden">
              <p>Arrow keys or WASD to move</p>
              <p>Space / Enter to start / pause</p>
              <p>Walls wrap around · Speed ramps as you eat</p>
              <p>Swipe on mobile</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
