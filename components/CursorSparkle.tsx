"use client";
import { useEffect } from "react";

interface Sparkle {
  id: string;
  x: number;
  y: number;
  color: string;
  element: HTMLElement;
}

export function CursorSparkle() {
  useEffect(() => {
    // Don't run on mobile/touch devices
    const isTouchDevice = () => {
      return (
        (typeof window !== "undefined" &&
          ("ontouchstart" in window ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 0))) ||
        false
      );
    };

    if (isTouchDevice()) return;

    const sparkles: Sparkle[] = [];
    const maxSparkles = 15;
    const colors = ["#06b6d4", "#a855f7", "#f59e0b"];
    let lastSparkleTime = 0;
    const sparkleInterval = 150; // ms between sparkles

    const createSparkle = (x: number, y: number) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const sparkle = document.createElement("div");

      sparkle.style.position = "fixed";
      sparkle.style.left = x + "px";
      sparkle.style.top = y + "px";
      sparkle.style.width = "4px";
      sparkle.style.height = "4px";
      sparkle.style.borderRadius = "50%";
      sparkle.style.backgroundColor = color;
      sparkle.style.pointerEvents = "none";
      sparkle.style.zIndex = "9999";
      sparkle.style.boxShadow = `0 0 8px ${color}`;
      sparkle.style.filter = "blur(0.5px)";

      document.body.appendChild(sparkle);

      const id = Math.random().toString(36);
      sparkles.push({ id, x, y, color, element: sparkle });

      // Fade out and remove after 500ms
      setTimeout(() => {
        sparkle.style.transition = "opacity 500ms ease-out";
        sparkle.style.opacity = "0";

        setTimeout(() => {
          sparkle.remove();
          sparkles.splice(
            sparkles.findIndex((s) => s.id === id),
            1
          );
        }, 500);
      }, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();

      if (now - lastSparkleTime > sparkleInterval) {
        if (sparkles.length < maxSparkles) {
          // Add slight randomness to sparkle position
          const offsetX = (Math.random() - 0.5) * 20;
          const offsetY = (Math.random() - 0.5) * 20;
          createSparkle(e.clientX + offsetX, e.clientY + offsetY);
        }
        lastSparkleTime = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      // Cleanup remaining sparkles
      sparkles.forEach((sparkle) => {
        sparkle.element.remove();
      });
    };
  }, []);

  return null;
}
