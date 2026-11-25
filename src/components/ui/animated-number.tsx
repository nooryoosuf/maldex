"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

/**
 * Subtle, fast numeric interpolation (280ms cubic-out) when values mount or change.
 * Avoids gimmicky slow count-ups and respects prefers-reduced-motion.
 */
export function AnimatedNumber({
  value,
  format,
  className,
  duration = 280,
}: {
  value: number | null | undefined;
  format: (val: number) => string;
  className?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState<number | null>(
    value !== null && value !== undefined && Number.isFinite(value) ? value : null,
  );
  const prevRef = useRef<number | null>(display);

  useEffect(() => {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      setDisplay(null);
      prevRef.current = null;
      return;
    }
    if (reduced) {
      setDisplay(value);
      prevRef.current = value;
      return;
    }

    const from = prevRef.current ?? value * 0.96;
    const to = value;
    if (Math.abs(to - from) < 1e-6) {
      setDisplay(to);
      prevRef.current = to;
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
        prevRef.current = to;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  if (display === null) {
    return <span className={cn("num font-mono text-muted", className)}>—</span>;
  }

  return <span className={cn("num font-mono", className)}>{format(display)}</span>;
}
