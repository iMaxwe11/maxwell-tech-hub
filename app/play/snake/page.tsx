"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const CELL = 16;
const COLS = 24;
const ROWS = 24;
const W = COLS * CELL;
const H = ROWS * CELL;
const TICK_MS = 100;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

const COLORS = {
  bg: "#050505",
  grid: "rgba(6,182,212,0.04)",
  snake: "#06b6d4",
  snakeHead: "#22d3ee",
  snakeGlow: "rgba(6,182,212,0.4)",
  food: "#f59e0b",
  foodGlow: "rgba(245,158,11,0.5)",
  poison: "#ef4444",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
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
  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "over">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // Game state refs (mutable for game loop)
  const snake = useRef<Point[]>([{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }]);
  const dir = useRef<Dir>("RIGHT");
  const nextDir = useRef<Dir>("RIGHT");
  const food = useRef<Point>(randomPos(snake.current));
  const scoreRef = useRef(0);
  const loopRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Load high score
  useEffect(() => {
    try { const hs = localStorage.getItem("snake-hs"); if (hs) setHighScore(+hs); } catch {}
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke();
    }

    // Food glow
    const fx = food.current.x * CELL + CELL / 2;
    const fy = food.current.y * CELL + CELL / 2;
    const fGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, CELL * 1.5);
    fGrad.addColorStop(0, COLORS.foodGlow);
    fGrad.addColorStop(1, "transparent");
    ctx.fillStyle = fGrad;
    ctx.fillRect(fx - CELL * 1.5, fy - CELL * 1.5, CELL * 3, CELL * 3);

    // Food
    ctx.fillStyle = COLORS.food;
    ctx.shadowColor = COLORS.food;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(fx, fy, CELL / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.current.forEach((seg, i) => {
      const sx = seg.x * CELL;
      const sy = seg.y * CELL;
      const isHead = i === 0;

      if (isHead) {
        // Head glow
        const hGrad = ctx.createRadialGradient(
          sx + CELL / 2, sy + CELL / 2, 0,
          sx + CELL / 2, sy + CELL / 2, CELL * 1.2
        );
        hGrad.addColorStop(0, COLORS.snakeGlow);
        hGrad.addColorStop(1, "transparent");
        ctx.fillStyle = hGrad;
        ctx.fillRect(sx - CELL * 0.5, sy - CELL * 0.5, CELL * 2, CELL * 2);
      }

      const alpha = isHead ? 1 : Math.max(0.3, 1 - (i / snake.current.length) * 0.7);
      ctx.fillStyle = isHead ? COLORS.snakeHead : COLORS.snake;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = COLORS.snake;
      ctx.shadowBlur = isHead ? 12 : 4;

      const r = isHead ? 4 : 3;
      const pad = 1;
      ctx.beginPath();
      ctx.roundRect(sx + pad, sy + pad, CELL - pad * 2, CELL - pad * 2, r);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    // Border
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, W, H);
  }, []);

  const tick = useCallback(() => {
    if (stateRef.current !== "playing") return;

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

    // Self collision
    if (snake.current.some((s) => s.x === head.x && s.y === head.y)) {
      setGameState("over");
      const hs = Math.max(scoreRef.current, +(localStorage.getItem("snake-hs") || "0"));
      setHighScore(hs);
      try { localStorage.setItem("snake-hs", String(hs)); } catch {}
      return;
    }

    snake.current.unshift(head);

    // Eat food
    if (head.x === food.current.x && head.y === food.current.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      food.current = randomPos(snake.current);
    } else {
      snake.current.pop();
    }

    draw();
  }, [draw]);

  const startGame = useCallback(() => {
    snake.current = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
    dir.current = "RIGHT";
    nextDir.current = "RIGHT";
    food.current = randomPos(snake.current);
    scoreRef.current = 0;
    setScore(0);
    setGameState("playing");
    draw();
  }, [draw]);

  // Game loop
  useEffect(() => {
    if (gameState === "playing") {
      loopRef.current = setInterval(tick, TICK_MS);
    } else if (loopRef.current) {
      clearInterval(loopRef.current);
    }
    return () => { if (loopRef.current) clearInterval(loopRef.current); };
  }, [gameState, tick]);

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
      if (gameState !== "playing") return;
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

  // Initial draw
  useEffect(() => { draw(); }, [draw]);

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

      <div className="relative z-10 flex flex-col items-center gap-6 mt-14">
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
            <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">{score}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Score</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 font-mono tabular-nums">{highScore}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Best</div>
          </div>
        </div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-xl overflow-hidden"
          style={{ boxShadow: "0 0 40px rgba(6,182,212,0.1), inset 0 0 40px rgba(6,182,212,0.02)" }}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="block touch-none"
            style={{ width: Math.min(W, 384), height: Math.min(H, 384) }}
          />

          {/* Overlay states */}
          <AnimatePresence>
            {gameState === "menu" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">🐍</div>
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
            {gameState === "paused" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="text-white font-mono font-bold text-xl uppercase tracking-widest">Paused</div>
                <p className="text-[10px] text-white/30 font-mono">Press Space to resume</p>
              </motion.div>
            )}
            {gameState === "over" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="text-red-400 font-mono font-bold text-xl uppercase tracking-widest">Game Over</div>
                <div className="text-3xl font-bold text-white font-mono">{score}</div>
                {score >= highScore && score > 0 && (
                  <div className="text-xs text-yellow-400 font-mono animate-pulse">New High Score!</div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-mono font-bold text-sm uppercase tracking-wider"
                >
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mobile D-pad */}
        <div className="sm:hidden grid grid-cols-3 gap-2 w-40">
          <div />
          <button onTouchStart={() => dpad("UP")} className="h-12 rounded-lg bg-white/5 border border-white/10 active:bg-cyan-400/20 flex items-center justify-center text-white/50">▲</button>
          <div />
          <button onTouchStart={() => dpad("LEFT")} className="h-12 rounded-lg bg-white/5 border border-white/10 active:bg-cyan-400/20 flex items-center justify-center text-white/50">◀</button>
          <button onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") setGameState("paused"); else if (gameState === "paused") setGameState("playing"); else startGame(); }}
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
              <p>Walls wrap around</p>
              <p>Swipe on mobile</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
