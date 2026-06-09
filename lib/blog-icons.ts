// Shared icon + category metadata for the blog. Icon names verified against lucide-react@1.8.0.
import type { LucideIcon } from "lucide-react";
import {
  Atom,
  Brain,
  Car,
  ChartLine,
  Cpu,
  Dna,
  FileText,
  Gamepad2,
  Ghost,
  Lock,
  LockOpen,
  Network,
  Orbit,
  Package,
  Palette,
  Rocket,
  Satellite,
  Scale,
  Search,
  Sparkles,
  Syringe,
  Trophy,
  Wrench,
  FlaskConical,
  Shield,
  CodeXml,
  LayoutGrid,
} from "lucide-react";

/** Per-post icons, keyed by the `icon` string stored in lib/blog-posts.ts. */
export const POST_ICONS: Record<string, LucideIcon> = {
  Atom,
  Brain,
  Car,
  ChartLine,
  Cpu,
  Dna,
  Gamepad2,
  Ghost,
  Lock,
  LockOpen,
  Network,
  Orbit,
  Package,
  Palette,
  Rocket,
  Satellite,
  Scale,
  Search,
  Sparkles,
  Syringe,
  Trophy,
};

export function getPostIcon(name: string): LucideIcon {
  return POST_ICONS[name] ?? FileText;
}

export interface CategoryMeta {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "all", label: "All", icon: LayoutGrid, color: "#06b6d4" },
  { id: "builds", label: "Build Log", icon: Wrench, color: "#d4af37" },
  { id: "ai", label: "AI", icon: Brain, color: "#a855f7" },
  { id: "dev", label: "Dev", icon: CodeXml, color: "#06b6d4" },
  { id: "space", label: "Space", icon: Rocket, color: "#6366f1" },
  { id: "gaming", label: "Gaming", icon: Gamepad2, color: "#22c55e" },
  { id: "science", label: "Science", icon: FlaskConical, color: "#f59e0b" },
  { id: "security", label: "Security", icon: Shield, color: "#ef4444" },
];

export const CATEGORY_COLORS: Record<string, string> = {
  builds: "#d4af37",
  ai: "#a855f7",
  dev: "#06b6d4",
  space: "#6366f1",
  gaming: "#22c55e",
  science: "#f59e0b",
  security: "#ef4444",
};
