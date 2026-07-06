"use client";

import { Component, type ReactNode } from "react";
import { CloudOff } from "lucide-react";

interface Props {
  /** Short widget name shown in the fallback card, e.g. "Crypto". */
  label: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Per-widget error boundary. Live-data widgets render third-party API data;
 * any render-time throw in one of them would otherwise bubble to the
 * route-level error boundary and replace the ENTIRE page with error.tsx
 * (observed in production: a crypto formatting crash blanked the homepage).
 * This contains the blast radius to a single quiet fallback card.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Keep a breadcrumb in the console; boundary swallows it otherwise.
    console.error(`[widget:${this.props.label}]`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <CloudOff className="w-5 h-5 text-white/40" aria-hidden />
            <h3 className="text-lg font-bold text-white/70">{this.props.label}</h3>
          </div>
          <p className="text-sm text-white/50">
            This widget hit a snag rendering live data. It&apos;ll be back on the
            next visit.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
