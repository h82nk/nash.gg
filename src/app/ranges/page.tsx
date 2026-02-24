"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { RangeMatrix, type RangeCellData } from "@/components/poker/RangeMatrix";
import { RANKS, type Position } from "@/types/poker";
import { cn } from "@/lib/utils";

// Generate sample range data for different positions
function generateRangeData(position: Position): Record<string, RangeCellData> {
  const data: Record<string, RangeCellData> = {};

  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      let hand: string;
      if (row === col) hand = `${RANKS[row]}${RANKS[col]}`;
      else if (row < col) hand = `${RANKS[row]}${RANKS[col]}s`;
      else hand = `${RANKS[col]}${RANKS[row]}o`;

      const isPair = row === col;
      const isSuited = row < col;
      const highRank = Math.min(row, col);
      const lowRank = Math.max(row, col);

      // Approximate GTO opening ranges by position
      let raise = 0;
      let call = 0;

      const positionLooseness: Record<string, number> = {
        UTG: 0.15,
        "UTG+1": 0.18,
        MP: 0.22,
        "MP+1": 0.25,
        HJ: 0.30,
        CO: 0.38,
        BTN: 0.48,
        SB: 0.35,
        BB: 0.15,
      };

      const looseness = positionLooseness[position] || 0.3;

      if (isPair) {
        // Pairs
        if (highRank <= 4) {
          raise = 1.0;
        } else if (highRank <= 7) {
          raise = Math.max(0, 1.0 - (highRank - 4) * (1 - looseness) * 0.3);
        } else {
          raise = Math.max(0, looseness - (highRank - 7) * 0.1);
        }
      } else if (isSuited) {
        // Suited hands
        const gap = lowRank - highRank;
        if (highRank === 0) {
          // Ax suited
          raise = gap <= 5 ? 1.0 : Math.max(0, looseness + 0.2 - gap * 0.08);
        } else if (highRank <= 2) {
          // Kx, Qx suited
          raise = gap <= 3 ? Math.max(0, 0.8 * looseness * 2) : Math.max(0, looseness - gap * 0.1);
        } else {
          // Connectors
          raise = gap <= 2 ? Math.max(0, looseness - highRank * 0.05) : 0;
        }
      } else {
        // Offsuit hands
        const gap = lowRank - highRank;
        if (highRank === 0 && gap <= 2) {
          raise = 1.0;
        } else if (highRank === 0) {
          raise = Math.max(0, looseness * 1.5 - gap * 0.12);
        } else if (highRank <= 1 && gap <= 2) {
          raise = Math.max(0, looseness * 1.2);
        } else {
          raise = Math.max(0, looseness * 0.5 - gap * 0.1 - highRank * 0.05);
        }
      }

      raise = Math.min(1, Math.max(0, raise));
      call = Math.min(1 - raise, Math.max(0, raise > 0.1 ? raise * 0.2 : 0));
      const fold = Math.max(0, 1 - raise - call);

      const ev = raise > 0.5 ? (raise - 0.3) * 5 : raise > 0.1 ? (raise - 0.5) * 2 : -1;

      data[hand] = { raise, call, fold, ev };
    }
  }

  return data;
}

const POSITIONS: Position[] = ["UTG", "MP", "CO", "BTN", "SB", "BB"];

export default function RangesPage() {
  const [selectedPosition, setSelectedPosition] = useState<Position>("BTN");
  const [rangeData] = useState(() => {
    const data: Record<string, Record<string, RangeCellData>> = {};
    for (const pos of POSITIONS) {
      data[pos] = generateRangeData(pos);
    }
    return data;
  });

  const currentData = rangeData[selectedPosition];

  // Calculate range stats
  const totalCombos = Object.values(currentData).reduce(
    (sum, cell) => sum + cell.raise + cell.call,
    0
  );
  const raisePercent = (
    (Object.values(currentData).reduce((sum, cell) => sum + cell.raise, 0) /
      169) *
    100
  ).toFixed(1);
  const callPercent = (
    (Object.values(currentData).reduce((sum, cell) => sum + cell.call, 0) /
      169) *
    100
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Range Visualizer</h1>
            <p className="text-muted-foreground">
              Explore GTO opening ranges by position. Hover over any cell to
              see raise, call, and fold frequencies.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            <div>
              {/* Position Selector */}
              <div className="flex gap-2 mb-6">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    className={cn(
                      "px-4 py-2 text-sm font-mono font-medium rounded-lg border transition-all",
                      selectedPosition === pos
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              {/* Range Matrix */}
              <div className="rounded-xl border border-border bg-card p-6 overflow-x-auto">
                <RangeMatrix
                  data={currentData}
                  size="md"
                  onCellClick={(hand, data) => {
                    console.log("Clicked:", hand, data);
                  }}
                />
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium mb-4">
                  {selectedPosition} Opening Range
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Raise</span>
                    <span className="font-mono text-red-400">{raisePercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${raisePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Call</span>
                    <span className="font-mono text-emerald-400">{callPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${callPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium mb-3">Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-600/60" />
                    <span className="text-muted-foreground">
                      High raise frequency
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/40" />
                    <span className="text-muted-foreground">
                      Medium raise frequency
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-600/60" />
                    <span className="text-muted-foreground">
                      High call frequency
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500/40" />
                    <span className="text-muted-foreground">
                      Mixed raise/call
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-900/40" />
                    <span className="text-muted-foreground">Fold</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
                <h3 className="font-medium mb-2">About GTO Ranges</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These ranges approximate Game Theory Optimal (Nash Equilibrium)
                  opening strategies for 6-max cash games. In practice, you
                  should deviate from GTO based on your opponents&apos; tendencies
                  - the MDA engine helps identify these exploits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
