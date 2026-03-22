"use client";

import { useEffect, useState } from "react";
import type { BJCard } from "@/types/blackjack";
import { SUIT_SYMBOLS, RANK_DISPLAY } from "@/types/blackjack";
import { cn } from "@/lib/utils";

interface PlayingCardProps {
  card: BJCard;
  faceDown?: boolean;
  animate?: boolean;
  dealDelay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  highlight?: "correct" | "incorrect" | null;
  countValue?: number | null;
  showCountBadge?: boolean;
}

function getSuitColor(suit: BJCard["suit"]): string {
  return suit === "hearts" || suit === "diamonds" ? "#dc2626" : "#111827";
}

function getPipLayout(rank: BJCard["rank"]): { x: number; y: number; flip?: boolean }[] {
  const layouts: Record<string, { x: number; y: number; flip?: boolean }[]> = {
    A: [{ x: 50, y: 50 }],
    "2": [{ x: 50, y: 20 }, { x: 50, y: 80, flip: true }],
    "3": [{ x: 50, y: 20 }, { x: 50, y: 50 }, { x: 50, y: 80, flip: true }],
    "4": [{ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 30, y: 80, flip: true }, { x: 70, y: 80, flip: true }],
    "5": [{ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 50, y: 50 }, { x: 30, y: 80, flip: true }, { x: 70, y: 80, flip: true }],
    "6": [{ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 80, flip: true }, { x: 70, y: 80, flip: true }],
    "7": [{ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 50, y: 35 }, { x: 30, y: 80, flip: true }, { x: 70, y: 80, flip: true }],
    "8": [{ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 50, y: 35 }, { x: 50, y: 65, flip: true }, { x: 30, y: 80, flip: true }, { x: 70, y: 80, flip: true }],
    "9": [{ x: 30, y: 18 }, { x: 70, y: 18 }, { x: 30, y: 40 }, { x: 70, y: 40 }, { x: 50, y: 50 }, { x: 30, y: 62, flip: true }, { x: 70, y: 62, flip: true }, { x: 30, y: 82, flip: true }, { x: 70, y: 82, flip: true }],
    T: [{ x: 30, y: 18 }, { x: 70, y: 18 }, { x: 30, y: 38 }, { x: 70, y: 38 }, { x: 50, y: 28 }, { x: 50, y: 72, flip: true }, { x: 30, y: 62, flip: true }, { x: 70, y: 62, flip: true }, { x: 30, y: 82, flip: true }, { x: 70, y: 82, flip: true }],
  };
  return layouts[rank] || [];
}

function FaceCardCenter({ rank, suit }: { rank: string; suit: BJCard["suit"] }) {
  const color = getSuitColor(suit);
  const symbol = SUIT_SYMBOLS[suit];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span
        className="text-3xl font-bold leading-none"
        style={{ color }}
      >
        {RANK_DISPLAY[rank as BJCard["rank"]]}
      </span>
      <span className="text-lg mt-0.5" style={{ color }}>
        {symbol}
      </span>
    </div>
  );
}

function PipCenter({ card, size }: { card: BJCard; size: string }) {
  const color = getSuitColor(card.suit);
  const symbol = SUIT_SYMBOLS[card.suit];
  const pips = getPipLayout(card.rank);
  const pipSize = size === "lg" ? "text-sm" : "text-[10px]";
  const acePipSize = size === "lg" ? "text-4xl" : "text-2xl";

  if (card.rank === "A") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={acePipSize} style={{ color }}>{symbol}</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-[15%]">
      {pips.map((pip, i) => (
        <span
          key={i}
          className={cn("absolute leading-none", pipSize)}
          style={{
            color,
            left: `${pip.x}%`,
            top: `${pip.y}%`,
            transform: `translate(-50%, -50%) ${pip.flip ? "rotate(180deg)" : ""}`,
          }}
        >
          {symbol}
        </span>
      ))}
    </div>
  );
}

export function PlayingCard({
  card,
  faceDown = false,
  animate = true,
  dealDelay = 0,
  size = "md",
  className,
  highlight,
  countValue = null,
  showCountBadge = false,
}: PlayingCardProps) {
  // CSS: default = face visible. .flipped = back visible (face-down).
  // So isFlipped directly maps to faceDown — simple and intuitive.
  // When animating: start face-down (true), then flip to faceDown after delay.
  const [isFlipped, setIsFlipped] = useState(animate ? true : faceDown);
  const [isVisible, setIsVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) {
      setIsFlipped(faceDown);
      return;
    }
    const showTimer = setTimeout(() => setIsVisible(true), dealDelay);
    const flipTimer = setTimeout(() => setIsFlipped(faceDown), dealDelay + 150);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(flipTimer);
    };
  }, [animate, faceDown, dealDelay]);

  const sizeClasses = {
    sm: "w-[52px] h-[74px]",
    md: "w-[72px] h-[102px]",
    lg: "w-[96px] h-[136px]",
  };

  const cornerSize = {
    sm: "text-[9px] leading-[10px]",
    md: "text-[11px] leading-[13px]",
    lg: "text-sm leading-4",
  };

  const color = getSuitColor(card.suit);
  const symbol = SUIT_SYMBOLS[card.suit];
  const displayRank = RANK_DISPLAY[card.rank];
  const isFaceCard = ["J", "Q", "K"].includes(card.rank);

  return (
    <div
      className={cn(
        "card-perspective inline-block shrink-0",
        sizeClasses[size],
        animate && isVisible && "animate-deal",
        !isVisible && "opacity-0",
        className
      )}
      style={animate ? { animationDelay: `${dealDelay}ms` } : undefined}
    >
      <div className={cn("card-inner", isFlipped && "flipped")}>
        {/* Card Face */}
        <div
          className={cn(
            "card-face rounded-lg overflow-hidden shadow-lg border",
            highlight === "correct" && "ring-2 ring-emerald-400",
            highlight === "incorrect" && "ring-2 ring-red-400"
          )}
          style={{
            background: "linear-gradient(145deg, #ffffff 0%, #f5f5f0 100%)",
            borderColor: "#d1d1c7",
          }}
        >
          {/* Top-left corner */}
          <div className={cn("absolute top-[3px] left-[4px] flex flex-col items-center", cornerSize[size])}>
            <span className="font-bold" style={{ color }}>{displayRank}</span>
            <span className="-mt-[2px]" style={{ color }}>{symbol}</span>
          </div>

          {/* Bottom-right corner (rotated) */}
          <div className={cn("absolute bottom-[3px] right-[4px] flex flex-col items-center rotate-180", cornerSize[size])}>
            <span className="font-bold" style={{ color }}>{displayRank}</span>
            <span className="-mt-[2px]" style={{ color }}>{symbol}</span>
          </div>

          {/* Center */}
          {isFaceCard ? (
            <FaceCardCenter rank={card.rank} suit={card.suit} />
          ) : (
            <PipCenter card={card} size={size} />
          )}
        </div>

        {/* Card Back */}
        <div className="card-back rounded-lg overflow-hidden shadow-lg border border-[#2a2a6e]">
          <div className="card-back-pattern w-full h-full rounded-lg">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-[70%] h-[70%] rounded border border-[#3a3a8e]/50 flex items-center justify-center bg-[#0e0e3a]/50">
                <span className="text-[#4a4aae] font-bold text-xs opacity-60">N</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Count value badge */}
      {showCountBadge && countValue !== null && !faceDown && (
        <div
          className={cn(
            "absolute -top-2 -right-2 z-10 flex items-center justify-center rounded-full border-2 shadow-md text-[10px] font-bold text-white",
            size === "sm" ? "w-5 h-5" : "w-6 h-6",
            countValue > 0
              ? "bg-emerald-500 border-emerald-300"
              : countValue < 0
                ? "bg-red-500 border-red-300"
                : "bg-gray-500 border-gray-300"
          )}
        >
          {countValue > 0 ? "+" : ""}{countValue}
        </div>
      )}
    </div>
  );
}

// Compact card for the dealt stream
export function MiniCard({ card }: { card: BJCard }) {
  const color = getSuitColor(card.suit);
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <span
      className="inline-flex items-center gap-[1px] text-xs font-mono font-bold px-1 py-0.5 rounded bg-white/90 border border-gray-200"
      style={{ color }}
    >
      {RANK_DISPLAY[card.rank]}{symbol}
    </span>
  );
}
