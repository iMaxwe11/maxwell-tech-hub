"use client";
import { useEffect } from "react";

export function ConsoleGreeting() {
  useEffect(() => {
    console.log(
      "%c👋 Hey there, curious developer!",
      "color: #06b6d4; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px rgba(6,182,212,0.5);"
    );
    console.log(
      "%cYou found the console. Nice.\n\nThis site was built with Next.js 15, TypeScript, Framer Motion, and way too much caffeine.\nWant to see the code? → github.com/iMaxwe11/maxwell-tech-hub\n\n— Maxwell",
      "color: #a855f7; font-size: 12px; line-height: 1.8;"
    );
    console.log(
      "%c🕹️ Try the Konami Code on any page for a surprise...",
      "color: #f59e0b; font-size: 11px; font-style: italic;"
    );
  }, []);

  return null;
}
