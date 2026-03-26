"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface CountInputProps {
  onSubmit: (value: number) => void;
  label?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  className?: string;
}

/**
 * Fast, tap-friendly running count input.
 * - Large central number display
 * - +/- buttons for quick adjustment
 * - Horizontal number strip for direct tap selection
 * - Full keyboard support (arrows, numbers, minus, enter)
 */
export function CountInput({
  onSubmit,
  label = "Running count?",
  autoFocus = true,
  className,
}: CountInputProps) {
  const [value, setValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus the container for keyboard events
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      containerRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        e.preventDefault();
        setValue((v) => Math.min(v + 1, 50));
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        setValue((v) => Math.max(v - 1, -50));
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSubmit(value);
      }
    },
    [value, onSubmit]
  );

  // Generate the visible range strip (11 numbers centered on value)
  const stripRange = 5;
  const stripNumbers = Array.from(
    { length: stripRange * 2 + 1 },
    (_, i) => value - stripRange + i
  );

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        "bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 px-4 py-4 w-full max-w-sm outline-none select-none",
        className
      )}
    >
      {/* Label */}
      <div className="text-xs text-white/50 text-center mb-3">{label}</div>

      {/* Main display + stepper */}
      <div className="flex items-center justify-center gap-3 mb-3">
        {/* Minus button */}
        <button
          type="button"
          onClick={() => setValue((v) => Math.max(v - 1, -50))}
          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/10 flex items-center justify-center text-white text-2xl font-light transition-all active:scale-95"
        >
          −
        </button>

        {/* Central number */}
        <div
          className={cn(
            "min-w-[80px] h-16 rounded-xl flex items-center justify-center text-3xl font-bold tabular-nums transition-colors",
            value > 0
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              : value < 0
                ? "text-red-400 bg-red-500/10 border border-red-500/20"
                : "text-white bg-white/5 border border-white/10"
          )}
        >
          {value > 0 ? "+" : ""}
          {value}
        </div>

        {/* Plus button */}
        <button
          type="button"
          onClick={() => setValue((v) => Math.min(v + 1, 50))}
          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/10 flex items-center justify-center text-white text-2xl font-light transition-all active:scale-95"
        >
          +
        </button>
      </div>

      {/* Number strip - tap to jump */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {stripNumbers.map((n) => {
          const isSelected = n === value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setValue(n)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-bold tabular-nums transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
              )}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={() => onSubmit(value)}
        className="w-full rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        Submit
      </button>

      {/* Keyboard hint */}
      <div className="text-[10px] text-white/25 text-center mt-2">
        ← → to adjust · Enter to submit
      </div>
    </div>
  );
}
