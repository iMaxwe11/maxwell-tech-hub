"use client";

import { useEffect, useRef } from "react";

export function GrokStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Set canvas size first
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Stars - larger and more visible, positioned AFTER canvas is sized
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1.5, // Bigger stars (1.5-4.5px)
      opacity: Math.random() * 0.4 + 0.5, // Brighter (0.5-0.9)
      twinkleSpeed: Math.random() * 0.003 + 0.001, // MUCH slower (was 0.02)
      twinkleOffset: Math.random() * Math.PI * 2,
      shouldTwinkle: Math.random() < 0.4,
      rotationSpeed: Math.random() * 0.00005 + 0.00002,
    }));

    let shootingStar: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
    } | null = null;

    let shootingStarTimer = Math.random() * 8000 + 8000;

    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    // Draw CLEAR 5-pointed star
    const drawStar = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Outer glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.8})`);
      gradient.addColorStop(0.3, `rgba(255, 255, 255, ${opacity * 0.3})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Star shape - MUCH clearer
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? size * 1.5 : size * 0.6;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      
      // Center bright point
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    // Shooting star with trail
    const drawShootingStar = (star: NonNullable<typeof shootingStar>) => {
      const progress = 1 - star.life / star.maxLife;
      const alpha = Math.sin(progress * Math.PI);
      
      // Brighter trail
      const gradient = ctx.createLinearGradient(
        star.x,
        star.y,
        star.x - star.vx * 30,
        star.y - star.vy * 30
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.7})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x - star.vx * 40, star.y - star.vy * 40);
      ctx.stroke();
      
      // Brighter head with glow
      const headGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 8);
      headGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      headGlow.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.5})`);
      headGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      drawStar(star.x, star.y, 5, alpha, time * 0.01);
    };

    const animate = (timestamp: number) => {
      time = timestamp;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const globalRotation = (timestamp / 240000) * Math.PI * 2;

      // Background stars
      stars.forEach((star) => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const dx = star.x - centerX;
        const dy = star.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + globalRotation;
        
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        let opacity = star.opacity;
        if (star.shouldTwinkle) {
          opacity *= 0.6 + 0.4 * Math.sin(timestamp * star.twinkleSpeed + star.twinkleOffset);
        }

        const rotation = timestamp * star.rotationSpeed;
        drawStar(x, y, star.size, opacity, rotation);
      });

      // Shooting star
      if (shootingStar) {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.life--;
        
        if (shootingStar.life <= 0 || 
            shootingStar.x < -100 || shootingStar.x > canvas.width + 100 ||
            shootingStar.y < -100 || shootingStar.y > canvas.height + 100) {
          shootingStar = null;
          shootingStarTimer = Math.random() * 10000 + 10000; // Longer wait
        } else {
          drawShootingStar(shootingStar);
        }
      } else {
        shootingStarTimer -= 16;
        if (shootingStarTimer <= 0 && Math.random() < 0.7) {
          const side = Math.floor(Math.random() * 4);
          let x, y, vx, vy;
          
          if (side === 0) {
            x = Math.random() * canvas.width;
            y = -50;
            vx = (Math.random() - 0.5) * 1.5; // SLOWER
            vy = Math.random() * 1.2 + 1; // SLOWER
          } else if (side === 1) {
            x = canvas.width + 50;
            y = Math.random() * canvas.height;
            vx = -(Math.random() * 1.2 + 1); // SLOWER
            vy = (Math.random() - 0.5) * 1.5; // SLOWER
          } else if (side === 2) {
            x = -50;
            y = Math.random() * canvas.height;
            vx = Math.random() * 1.2 + 1; // SLOWER
            vy = (Math.random() - 0.5) * 1.5; // SLOWER
          } else {
            x = Math.random() * canvas.width * 0.5 + canvas.width * 0.5;
            y = -50;
            vx = -(Math.random() * 1 + 1.5); // SLOWER
            vy = Math.random() * 1 + 1.5; // SLOWER
          }
          
          shootingStar = {
            x, y, vx, vy,
            life: 90, // Longer life
            maxLife: 90
          };
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
