"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { readBest, recordScore } from "@/lib/arcade-scores";

const W = 480;
const H = 520;
const PADDLE_W = 76;
const PADDLE_H = 10;
const BALL_R = 6;
const BRICK_COLS = 8;
const BRICK_ROWS = 6;
const BRICK_GAP = 4;
const BRICK_TOP = 56;
const BRICK_H = 18;
const BRICK_W = (W - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;

// Obsidian Luxe row colors, top (high value) to bottom
const ROW_COLORS = ["#ef4444", "#f59e0b", "#d4af37", "#a855f7", "#06b6d4", "#10b981"];
const ROW_POINTS = [60, 50, 40, 30, 20, 10];

interface Brick {
  x: number;
  y: number;
  row: number;
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

function buildBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: BRICK_GAP + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        row: r,
        alive: true,
      });
    }
  }
  return bricks;
}

export default function BreakoutPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "over">("menu");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // Mutable game state for the rAF loop
  const bricks = useRef<Brick[]>(buildBricks());
  const particles = useRef<Particle[]>([]);
  const paddleX = useRef(W / 2 - PADDLE_W / 2);
  const ball = useRef({ x: W / 2, y: H - 90, vx: 3, vy: -3, stuck: true });
  const keys = useRef({ left: false, right: false });
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const stateRef = useRef(gameState);
  stateRef.current = gameState;
  const animRef = useRef<number>(0);

  // Persistent high score via the unified arcade store
  useEffect(() => {
    setHighScore(readBest("breakout")?.value ?? 0);
  }, []);

  const baseSpeed = useCallback(() => 3 + (levelRef.current - 1) * 0.6, []);

  const resetBall = useCallback(() => {
    ball.current = { x: paddleX.current + PADDLE_W / 2, y: H - 90, vx: 0, vy: 0, stuck: true };
  }, []);

  const launchBall = useCallback(() => {
    if (!ball.current.stuck) return;
    const speed = baseSpeed();
    const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3); // mostly upward
    ball.current.vx = Math.cos(angle) * speed;
    ball.current.vy = Math.sin(angle) * speed;
    ball.current.stuck = false;
  }, [baseSpeed]);

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        life: 1,
        color,
      });
    }
    if (particles.current.length > 160) particles.current.splice(0, particles.current.length - 160);
  };

  const endRun = useCallback(() => {
    setGameState("over");
    const { best } = recordScore("breakout", scoreRef.current, "higher");
    setHighScore(best);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = "rgba(212,175,55,0.04)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Bricks
    bricks.current.forEach((b) => {
      if (!b.alive) return;
      const color = ROW_COLORS[b.row];
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    // Particles
    particles.current.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    });
    ctx.globalAlpha = 1;

    // Paddle
    ctx.fillStyle = "#d4af37";
    ctx.shadowColor = "#d4af37";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(paddleX.current, H - 32, PADDLE_W, PADDLE_H, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball
    const bl = ball.current;
    const grad = ctx.createRadialGradient(bl.x, bl.y, 0, bl.x, bl.y, BALL_R * 3);
    grad.addColorStop(0, "rgba(255,255,255,0.5)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(bl.x - BALL_R * 3, bl.y - BALL_R * 3, BALL_R * 6, BALL_R * 6);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#d4af37";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(bl.x, bl.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, W, H);
  }, []);

  const tick = useCallback(() => {
    if (stateRef.current !== "playing") return;

    // Paddle via keys
    const PADDLE_SPEED = 6.5;
    if (keys.current.left) paddleX.current = Math.max(0, paddleX.current - PADDLE_SPEED);
    if (keys.current.right) paddleX.current = Math.min(W - PADDLE_W, paddleX.current + PADDLE_SPEED);

    const b = ball.current;
    if (b.stuck) {
      b.x = paddleX.current + PADDLE_W / 2;
      b.y = H - 90;
    } else {
      b.x += b.vx;
      b.y += b.vy;

      // Walls
      if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx); }
      if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx); }
      if (b.y < BALL_R) { b.y = BALL_R; b.vy = Math.abs(b.vy); }

      // Paddle
      const py = H - 32;
      if (
        b.vy > 0 &&
        b.y + BALL_R >= py &&
        b.y + BALL_R <= py + PADDLE_H + 6 &&
        b.x >= paddleX.current - BALL_R &&
        b.x <= paddleX.current + PADDLE_W + BALL_R
      ) {
        // Reflect with angle based on hit position
        const rel = (b.x - (paddleX.current + PADDLE_W / 2)) / (PADDLE_W / 2);
        const speed = Math.min(Math.hypot(b.vx, b.vy) * 1.015, baseSpeed() * 2.2);
        const angle = -Math.PI / 2 + rel * (Math.PI / 3); // up to ±60°
        b.vx = Math.cos(angle) * speed;
        b.vy = Math.sin(angle) * speed;
        b.y = py - BALL_R;
      }

      // Bricks
      for (const brick of bricks.current) {
        if (!brick.alive) continue;
        if (
          b.x + BALL_R > brick.x &&
          b.x - BALL_R < brick.x + BRICK_W &&
          b.y + BALL_R > brick.y &&
          b.y - BALL_R < brick.y + BRICK_H
        ) {
          brick.alive = false;
          scoreRef.current += ROW_POINTS[brick.row] * levelRef.current;
          setScore(scoreRef.current);
          spawnParticles(b.x, b.y, ROW_COLORS[brick.row]);

          // Reflect off the nearest face
          const overlapX = Math.min(b.x + BALL_R - brick.x, brick.x + BRICK_W - (b.x - BALL_R));
          const overlapY = Math.min(b.y + BALL_R - brick.y, brick.y + BRICK_H - (b.y - BALL_R));
          if (overlapX < overlapY) b.vx = -b.vx;
          else b.vy = -b.vy;
          break;
        }
      }

      // Level cleared
      if (bricks.current.every((br) => !br.alive)) {
        levelRef.current += 1;
        setLevel(levelRef.current);
        bricks.current = buildBricks();
        resetBall();
      }

      // Dropped
      if (b.y > H + BALL_R) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          endRun();
          return;
        }
        resetBall();
      }
    }

    // Particles
    particles.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life -= 0.03;
    });
    particles.current = particles.current.filter((p) => p.life > 0);

    draw();
    animRef.current = requestAnimationFrame(tick);
  }, [baseSpeed, draw, endRun, resetBall]);

  const startGame = useCallback(() => {
    bricks.current = buildBricks();
    particles.current = [];
    paddleX.current = W / 2 - PADDLE_W / 2;
    scoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    setScore(0);
    setLives(3);
    setLevel(1);
    resetBall();
    setGameState("playing");
  }, [resetBall]);

  // Game loop lifecycle
  useEffect(() => {
    if (gameState === "playing") {
      animRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, tick]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (gameState === "menu" || gameState === "over") startGame();
        else if (gameState === "playing") {
          if (ball.current.stuck) launchBall();
          else setGameState("paused");
        } else if (gameState === "paused") setGameState("playing");
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [gameState, launchBall, startGame]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  // Pointer / touch: paddle follows X
  const movePaddleTo = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    paddleX.current = Math.min(W - PADDLE_W, Math.max(0, x - PADDLE_W / 2));
    if (stateRef.current === "playing" && ball.current.stuck) draw();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <Navbar breadcrumb={["arcade", "breakout"]} accent="#d4af37" />

      <div className="absolute top-20 right-4 z-20">
        <Link href="/play" className="px-4 py-2 text-xs font-mono text-[#d4af37] border border-[#d4af37]/40 rounded hover:bg-[#d4af37]/10 transition-colors">
          ← Back to Arcade
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 mt-14">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-amber-500 font-mono">
            NEON BREAKOUT
          </h1>
          <p className="text-xs text-white/30 font-mono mt-2">Six rows of trouble</p>
        </motion.div>

        {/* Scoreboard */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#d4af37] font-mono tabular-nums">{score}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Score</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 font-mono tabular-nums">{highScore}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Best</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">{level}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Level</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 font-mono tabular-nums">{"●".repeat(Math.max(0, lives))}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Lives</div>
          </div>
        </div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-xl overflow-hidden"
          style={{ boxShadow: "0 0 40px rgba(212,175,55,0.1), inset 0 0 40px rgba(212,175,55,0.02)" }}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onMouseMove={(e) => movePaddleTo(e.clientX)}
            onTouchStart={(e) => movePaddleTo(e.touches[0].clientX)}
            onTouchMove={(e) => movePaddleTo(e.touches[0].clientX)}
            onClick={() => {
              if (gameState === "playing" && ball.current.stuck) launchBall();
            }}
            className="block touch-none cursor-none"
            style={{ width: Math.min(W, 360), height: Math.min(H, 390) }}
          />

          <AnimatePresence>
            {gameState === "menu" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="grid grid-cols-4 gap-1">
                  {ROW_COLORS.slice(0, 4).map((c) => (
                    <div key={c} className="w-8 h-3 rounded-sm" style={{ background: c, boxShadow: `0 0 10px ${c}66` }} />
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-600 text-black font-mono font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                >
                  Play
                </motion.button>
                <p className="text-[10px] text-white/30 font-mono">Press Space or Enter</p>
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
                className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
                <div className="text-red-400 font-mono font-bold text-2xl uppercase tracking-widest">Game Over</div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white font-mono mb-1">{score}</div>
                  <div className="text-xs text-white/50 font-mono">SCORE · LEVEL {level}</div>
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
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-600 text-black font-mono font-bold text-sm uppercase tracking-wider"
                  >
                    Play Again
                  </motion.button>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/play"
                      className="block px-8 py-3 rounded-xl border border-[#d4af37]/50 text-[#d4af37] font-mono font-bold text-sm uppercase tracking-wider hover:bg-[#d4af37]/10 text-center"
                    >
                      Back
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Controls hint */}
        <button onClick={() => setShowControls(!showControls)} className="text-[10px] text-white/20 font-mono hover:text-white/40 transition-colors">
          {showControls ? "Hide controls" : "Show controls"}
        </button>
        <AnimatePresence>
          {showControls && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="text-xs text-white/30 font-mono space-y-1 text-center overflow-hidden">
              <p>Mouse / touch or ← → / A D to move the paddle</p>
              <p>Space launches the ball, then pauses</p>
              <p>Top rows score more · bricks multiply by level</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
