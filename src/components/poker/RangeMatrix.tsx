"use client";

import { cn } from "@/lib/utils";
import { RANKS } from "@/types/poker";
import { useState } from "react";

// Generate the 13x13 hand matrix labels
function getHandLabel(row: number, col: number): string {
  if (row === col) return `${RANKS[row]}${RANKS[col]}`;
  if (row < col) return `${RANKS[row]}${RANKS[col]}s`;
  return `${RANKS[col]}${RANKS[row]}o`;
}

export interface RangeCellData {
  raise: number; // 0-1 frequency
  call: number;
  fold: number;
  ev?: number;
}

interface RangeMatrixProps {
  data?: Record<string, RangeCellData>;
  onCellClick?: (hand: string, data: RangeCellData) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function getCellBackground(cell: RangeCellData | undefined): string {
  if (!cell) return "bg-secondary/50";

  const { raise, call } = cell;
  const total = raise + call;

  if (total < 0.05) return "bg-blue-900/40";
  if (raise > 0.7) return "bg-red-600/60";
  if (raise > 0.4) return "bg-red-500/40";
  if (call > 0.7) return "bg-emerald-600/60";
  if (call > 0.4) return "bg-emerald-500/40";
  if (raise > 0.2 && call > 0.2) return "bg-yellow-500/40";
  return "bg-secondary/70";
}

export function RangeMatrix({
  data,
  onCellClick,
  className,
  size = "md",
}: RangeMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const cellSizes = {
    sm: "w-6 h-6 text-[8px]",
    md: "w-9 h-9 text-[10px]",
    lg: "w-12 h-12 text-xs",
  };

  return (
    <div className={cn("inline-block", className)}>
      <div className="grid grid-cols-13 gap-px bg-border/50 rounded-lg overflow-hidden p-px">
        {Array.from({ length: 13 }, (_, row) =>
          Array.from({ length: 13 }, (_, col) => {
            const hand = getHandLabel(row, col);
            const cellData = data?.[hand];
            const isHovered = hoveredCell === hand;
            const isPair = row === col;
            const isSuited = row < col;

            return (
              <button
                key={`${row}-${col}`}
                className={cn(
                  "flex items-center justify-center font-mono font-medium transition-all duration-150 border border-transparent",
                  cellSizes[size],
                  getCellBackground(cellData),
                  isHovered && "ring-1 ring-primary scale-110 z-10",
                  isPair && "font-bold",
                  onCellClick && "cursor-pointer hover:brightness-125"
                )}
                onMouseEnter={() => setHoveredCell(hand)}
                onMouseLeave={() => setHoveredCell(null)}
                onClick={() => cellData && onCellClick?.(hand, cellData)}
              >
                <span
                  className={cn(
                    "leading-none",
                    isPair && "text-primary/90",
                    isSuited && !isPair && "text-foreground/90",
                    !isSuited && !isPair && "text-foreground/60"
                  )}
                >
                  {hand}
                </span>
              </button>
            );
          })
        )}
      </div>

      {hoveredCell && data?.[hoveredCell] && (
        <div className="mt-3 p-3 rounded-lg bg-card border border-border text-sm">
          <div className="font-mono font-bold text-foreground mb-1">
            {hoveredCell}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-red-400">Raise:</span>{" "}
              <span className="font-mono">
                {(data[hoveredCell].raise * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-emerald-400">Call:</span>{" "}
              <span className="font-mono">
                {(data[hoveredCell].call * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-blue-400">Fold:</span>{" "}
              <span className="font-mono">
                {(data[hoveredCell].fold * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          {data[hoveredCell].ev !== undefined && (
            <div className="mt-1 text-xs text-muted-foreground">
              EV:{" "}
              <span
                className={cn(
                  "font-mono",
                  data[hoveredCell].ev! >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                )}
              >
                {data[hoveredCell].ev! >= 0 ? "+" : ""}
                {data[hoveredCell].ev!.toFixed(2)} bb
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
