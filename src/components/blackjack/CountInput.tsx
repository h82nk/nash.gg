"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface CountInputProps {
  onSubmit: (value: number) => void;
  label?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Speed-optimized running count input with numpad.
 *
 * Design goals:
 * - 2 taps max for any count: e.g. "±" then "3" → submit -3
 * - Numpad layout familiar from phone dialers
 * - Large touch targets for mobile
 * - Full keyboard support (type digits, minus, enter)
 * - Visual feedback with color-coded display
 */
export function CountInput({
  onSubmit,
  label = "Running count?",
  autoFocus = true,
  className,
}: CountInputProps) {
  const [display, setDisplay] = useState("0");
  const [isNegative, setIsNegative] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      containerRef.current.focus();
    }
  }, [autoFocus]);

  const numericValue = (isNegative ? -1 : 1) * (parseInt(display, 10) || 0);

  const handleDigit = useCallback((digit: string) => {
    setDisplay((prev) => {
      if (prev === "0") return digit;
      if (prev.length >= 2) return prev; // max 2 digits for counts
      return prev + digit;
    });
  }, []);

  const handleSign = useCallback(() => {
    setIsNegative((prev) => !prev);
  }, []);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setIsNegative(false);
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(numericValue);
  }, [numericValue, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "-" || e.key === "+") {
        e.preventDefault();
        if (e.key === "-") setIsNegative(true);
        else setIsNegative(false);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C") {
        e.preventDefault();
        handleClear();
      }
    },
    [handleDigit, handleBackspace, handleSubmit, handleClear]
  );

  const padBtnBase =
    "rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center";
  const padBtnDigit = cn(
    padBtnBase,
    "bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/5 text-xl h-12"
  );

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        "bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-4 w-full max-w-xs outline-none select-none",
        className
      )}
    >
      {/* Label */}
      <div className="text-xs text-white/50 text-center mb-2">{label}</div>

      {/* Display */}
      <div
        className={cn(
          "rounded-xl px-4 py-3 mb-3 text-center text-4xl font-bold tabular-nums transition-colors border",
          numericValue > 0
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : numericValue < 0
              ? "text-red-400 bg-red-500/10 border-red-500/20"
              : "text-white bg-white/5 border-white/10"
        )}
      >
        {isNegative ? "−" : numericValue > 0 ? "+" : ""}
        {display}
      </div>

      {/* Numpad grid */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className={padBtnDigit}
          >
            {d}
          </button>
        ))}

        {/* Bottom row: ±, 0, ⌫ */}
        <button
          type="button"
          onClick={handleSign}
          className={cn(
            padBtnBase,
            "h-12 text-lg border",
            isNegative
              ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
              : "bg-white/10 text-white/70 border-white/5 hover:bg-white/15"
          )}
        >
          +/−
        </button>
        <button
          type="button"
          onClick={() => handleDigit("0")}
          className={padBtnDigit}
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className={cn(
            padBtnBase,
            "bg-white/10 hover:bg-white/15 text-white/60 border border-white/5 h-12 text-sm"
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full rounded-xl bg-primary py-3 font-bold text-lg text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        Submit Count
      </button>

      {/* Keyboard hint (desktop) */}
      <div className="text-[10px] text-white/20 text-center mt-2 hidden sm:block">
        Type digits · minus for negative · Enter to submit
      </div>
    </div>
  );
}
