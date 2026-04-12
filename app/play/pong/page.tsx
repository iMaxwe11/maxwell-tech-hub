"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const W = 600, H = 400;
const PADDLE_H = 70, PADDLE_W = 10, BALL_R = 6;
const PLAYER_SPEED = 7, AI_BASE_SPEED = 3.5;
const WINNING_SCORE = 7;

type GameState = "menu" | "playing" | "paused" | "won" | "lost";

export default function PongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [rally, setRally] = useState(0);
  const stateRef = useRef(gameState);
  stateRef.current = gameState;
  const animRef = useRef<number>(0);

  // Game objects as refs for the animation loop
  const player = useRef({ y: H / 2 - PADDLE_H / 2 });
  const ai = useRef({ y: H / 2 - PADDLE_H / 2 });
  const ball = useRef({ x: W / 2, y: H / 2, vx: 4, vy: 2 });
  const keys = useRef<Set<string>>(new Set());
  const pScoreRef = useRef(0);
  const aiScoreRef = useRef(0);
  const rallyRef = useRef(0);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);

  const spawnParticles = (x: number, y: number, color: string, count = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      particles.current.push({ x, y, vx: Math.cos(angle) * (2 + Math.random() * 3), vy: Math.sin(angle) * (2 + Math.random() * 3), life: 1, color });
    }
  };

  const resetBall = useCallback((direction: number) => {
    ball.current = { x: W / 2, y: H / 2, vx: 4 * direction, vy: (Math.random() - 0.5) * 4 };
    rallyRef.current = 0;
    setRally(0);
  }, []);

  const startGame = useCallback(() => {
    player.current.y = H / 2 - PADDLE_H / 2;
    ai.current.y = H / 2 - PADDLE_H / 2;
    pScoreRef.current = 0; aiScoreRef.current = 0;
    setPlayerScore(0); setAiScore(0);
    particles.current = [];
    resetBall(1);
    setGameState("playing");
  }, [resetBall]);

  // Main game loop
  const gameLoop = useCallback(() => {
    if (stateRef.current !== "playing") return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const b = ball.current;

    // Player movement
    if (keys.current.has("ArrowUp") || keys.current.has("w")) player.current.y = Math.max(0, player.current.y - PLAYER_SPEED);
    if (keys.current.has("ArrowDown") || keys.current.has("s")) player.current.y = Math.min(H - PADDLE_H, player.current.y + PLAYER_SPEED);

    // AI movement (adaptive difficulty)
    const aiSpeed = AI_BASE_SPEED + Math.min(rallyRef.current * 0.15, 3);
    const aiTarget = b.y - PADDLE_H / 2 + (Math.random() - 0.5) * 20;
    if (ai.current.y + PADDLE_H / 2 < aiTarget) ai.current.y = Math.min(H - PADDLE_H, ai.current.y + aiSpeed);
    else ai.current.y = Math.max(0, ai.current.y - aiSpeed);

    // Ball movement
    b.x += b.vx; b.y += b.vy;

    // Top/bottom bounce
    if (b.y - BALL_R <= 0 || b.y + BALL_R >= H) {
      b.vy *= -1;
      b.y = b.y - BALL_R <= 0 ? BALL_R : H - BALL_R;
      spawnParticles(b.x, b.y, "rgba(255,255,255,0.5)", 4);
    }

    // Player paddle collision (left side)
    if (b.x - BALL_R <= PADDLE_W + 20 && b.y >= player.current.y && b.y <= player.current.y + PADDLE_H && b.vx < 0) {
      b.vx = Math.abs(b.vx) * 1.05;
      b.vy += ((b.y - (player.current.y + PADDLE_H / 2)) / PADDLE_H) * 4;
      b.x = PADDLE_W + 20 + BALL_R;
      rallyRef.current++; setRally(rallyRef.current);
      spawnParticles(b.x, b.y, "#06b6d4", 10);
    }

    // AI paddle collision (right side)
    if (b.x + BALL_R >= W - PADDLE_W - 20 && b.y >= ai.current.y && b.y <= ai.current.y + PADDLE_H && b.vx > 0) {
      b.vx = -Math.abs(b.vx) * 1.05;
      b.vy += ((b.y - (ai.current.y + PADDLE_H / 2)) / PADDLE_H) * 4;
      b.x = W - PADDLE_W - 20 - BALL_R;
      rallyRef.current++; setRally(rallyRef.current);
      spawnParticles(b.x, b.y, "#a855f7", 10);
    }

    // Speed cap
    const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (speed > 12) { b.vx *= 12 / speed; b.vy *= 12 / speed; }

    // Scoring
    if (b.x < 0) {
      aiScoreRef.current++; setAiScore(aiScoreRef.current);
      spawnParticles(0, b.y, "#ef4444", 15);
      if (aiScoreRef.current >= WINNING_SCORE) { setGameState("lost"); return; }
      resetBall(1);
    }
    if (b.x > W) {
      pScoreRef.current++; setPlayerScore(pScoreRef.current);
      spawnParticles(W, b.y, "#06b6d4", 15);
      if (pScoreRef.current >= WINNING_SCORE) { setGameState("won"); return; }
      resetBall(-1);
    }

    // Update particles
    particles.current = particles.current.filter(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.03; return p.life > 0; });

    // ── DRAW ──
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    // Center line
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    // Ball trail glow
    const bGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, BALL_R * 4);
    bGrad.addColorStop(0, "rgba(255,255,255,0.12)");
    bGrad.addColorStop(1, "transparent");
    ctx.fillStyle = bGrad;
    ctx.fillRect(b.x - BALL_R * 4, b.y - BALL_R * 4, BALL_R * 8, BALL_R * 8);

    // Ball
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Player paddle
    ctx.fillStyle = "#06b6d4";
    ctx.shadowColor = "#06b6d4";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(20, player.current.y, PADDLE_W, PADDLE_H, 4);
    ctx.fill();

    // AI paddle
    ctx.fillStyle = "#a855f7";
    ctx.shadowColor = "#a855f7";
    ctx.beginPath();
    ctx.roundRect(W - 20 - PADDLE_W, ai.current.y, PADDLE_W, PADDLE_H, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Particles
    particles.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, H);

    animRef.current = requestAnimationFrame(gameLoop);
  }, [resetBall]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState === "playing") { animRef.current = requestAnimationFrame(gameLoop); }
    else { cancelAnimationFrame(animRef.current); }
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, gameLoop]);

  // Keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current.add(e.key);
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (stateRef.current === "menu" || stateRef.current === "won" || stateRef.current === "lost") startGame();
        else if (stateRef.current === "playing") setGameState("paused");
        else if (stateRef.current === "paused") setGameState("playing");
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [startGame]);

  // Initial draw
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) { ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, W, H); }
  }, []);

  // Touch/mouse controls
  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== "playing") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleY = H / rect.height;
    player.current.y = Math.max(0, Math.min(H - PADDLE_H, (e.clientY - rect.top) * scaleY - PADDLE_H / 2));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <Navbar breadcrumb={["arcade", "pong"]} accent="#a855f7" />

      <div className="relative z-10 flex flex-col items-center gap-6 mt-14">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-mono">NEON PONG</h1>
          <p className="text-xs text-white/30 font-mono mt-2">First to {WINNING_SCORE} wins</p>
        </motion.div>

        {/* Scores */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 font-mono tabular-nums">{playerScore}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">You</div>
          </div>
          <div className="text-white/20 font-mono text-sm">vs</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 font-mono tabular-nums">{aiScore}</div>
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">AI</div>
          </div>
          {rally > 3 && (
            <div className="text-center ml-4">
              <div className="text-lg font-bold text-amber-400 font-mono tabular-nums animate-pulse">{rally}</div>
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Rally</div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-xl overflow-hidden"
          style={{ boxShadow: "0 0 40px rgba(168,85,247,0.1)" }}>
          <canvas ref={canvasRef} width={W} height={H} onPointerMove={handlePointerMove}
            className="block touch-none" style={{ width: Math.min(W, 600), height: Math.min(H, 400), maxWidth: "calc(100vw - 2rem)" }} />

          <AnimatePresence>
            {gameState === "menu" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">🏓</div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-mono font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  Play
                </motion.button>
                <p className="text-[10px] text-white/30 font-mono">Arrow keys / WASD / Mouse to move</p>
              </motion.div>
            )}
            {gameState === "paused" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="text-white font-mono font-bold text-xl uppercase tracking-widest">Paused</div>
                <p className="text-[10px] text-white/30 font-mono">Press Space to resume</p>
              </motion.div>
            )}
            {(gameState === "won" || gameState === "lost") && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className={`font-mono font-bold text-xl uppercase tracking-widest ${gameState === "won" ? "text-cyan-400" : "text-red-400"}`}>
                  {gameState === "won" ? "You Win!" : "AI Wins"}
                </div>
                <div className="text-white/50 font-mono text-sm">{playerScore} - {aiScore}</div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-mono font-bold text-sm uppercase tracking-wider">
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-[10px] text-white/20 font-mono text-center">Arrow keys / WASD to move paddle &middot; Space to pause &middot; Mouse also works</p>
      </div>
    </div>
  );
}
