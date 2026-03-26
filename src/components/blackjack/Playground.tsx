"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { BJCard, CountingSystem, DeckCount, DealSpeed } from "@/types/blackjack";
import { DEAL_SPEED_MS, RANK_DISPLAY } from "@/types/blackjack";
import { createShoe, getPenetration, getCardsRemaining } from "@/lib/blackjack/deck";
import {
  getCardValue,
  getRunningCount,
  getTrueCount,
  getBettingAdvice,
  COUNTING_SYSTEMS,
} from "@/lib/blackjack/counting";
import { getDeviationInsight } from "@/lib/blackjack/basic-strategy";
import { PlayingCard } from "./PlayingCard";
import { cn } from "@/lib/utils";

interface PlaygroundProps {
  system: CountingSystem;
  deckCount: DeckCount;
  onBack: () => void;
}

interface DealtCardEntry {
  card: BJCard;
  countValue: number;
  runningCountAfter: number;
}

const SPEED_OPTIONS: { key: DealSpeed; label: string }[] = [
  { key: "slow", label: "Slow" },
  { key: "medium", label: "Normal" },
  { key: "fast", label: "Fast" },
  { key: "turbo", label: "Turbo" },
];

export function Playground({ system, deckCount, onBack }: PlaygroundProps) {
  const [shoe, setShoe] = useState(() => createShoe(deckCount));
  const [cardIndex, setCardIndex] = useState(0);
  const [entries, setEntries] = useState<DealtCardEntry[]>([]);
  const [speed, setSpeed] = useState<DealSpeed>("slow");
  const [isPlaying, setIsPlaying] = useState(false);
  const [countTrail, setCountTrail] = useState<number[]>([0]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const sys = COUNTING_SYSTEMS[system];

  const runningCount = entries.length > 0 ? entries[entries.length - 1].runningCountAfter : 0;
  const remaining = getCardsRemaining(shoe, cardIndex);
  const trueCount = getTrueCount(runningCount, remaining);
  const penetration = getPenetration(shoe, cardIndex);
  const bettingAdvice = getBettingAdvice(trueCount);
  const deviation = getDeviationInsight(trueCount);

  const dealNextCard = useCallback(() => {
    if (cardIndex >= shoe.length) {
      setIsPlaying(false);
      return;
    }

    const card = shoe[cardIndex];
    const value = getCardValue(card.rank, system);
    const prevCount = entries.length > 0 ? entries[entries.length - 1].runningCountAfter : 0;
    const newCount = prevCount + value;

    const entry: DealtCardEntry = {
      card,
      countValue: value,
      runningCountAfter: newCount,
    };

    setEntries((prev) => [...prev, entry]);
    setCountTrail((prev) => [...prev, newCount]);
    setCardIndex((prev) => prev + 1);
  }, [cardIndex, shoe, system, entries]);

  // Auto-deal timer
  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setTimeout(dealNextCard, DEAL_SPEED_MS[speed]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, entries.length, speed, dealNextCard]);

  // Auto-scroll card history
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollLeft = historyRef.current.scrollWidth;
    }
  }, [entries.length]);

  const handleReset = () => {
    setIsPlaying(false);
    setShoe(createShoe(deckCount));
    setCardIndex(0);
    setEntries([]);
    setCountTrail([0]);
  };

  // The last 8 cards for the main display area
  const visibleEntries = entries.slice(-8);
  // Older cards for the scrollable history
  const historyEntries = entries.slice(0, -8);

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to menu
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Speed:</span>
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSpeed(opt.key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                speed === opt.key
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Felt + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Felt Area */}
        <div className="bg-felt rounded-2xl p-6 sm:p-8 min-h-[380px] relative overflow-hidden flex flex-col">
          {/* Cards display */}
          <div className="flex-1 flex items-center justify-center">
            {visibleEntries.length === 0 ? (
              <div className="text-white/20 text-sm">
                Press Play to start dealing
              </div>
            ) : (
              <div className="flex items-start gap-3 flex-wrap justify-center">
                {visibleEntries.map((entry, i) => {
                  const isLatest = i === visibleEntries.length - 1;
                  return (
                    <div key={entry.card.id} className="relative">
                      <PlayingCard
                        card={entry.card}
                        size="lg"
                        animate={isLatest}
                      />
                      {/* Count value badge */}
                      <div
                        className={cn(
                          "absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-lg transition-all",
                          isLatest && "animate-deal",
                          entry.countValue > 0
                            ? "bg-emerald-500 border-emerald-300 text-white"
                            : entry.countValue < 0
                              ? "bg-red-500 border-red-300 text-white"
                              : "bg-gray-500 border-gray-300 text-white"
                        )}
                      >
                        {entry.countValue > 0 ? "+" : ""}
                        {entry.countValue}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Count trail */}
          {entries.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-1 flex-wrap">
              {countTrail.slice(-12).map((count, i, arr) => {
                const isLast = i === arr.length - 1;
                const prev = i > 0 ? arr[i - 1] : null;
                const diff = prev !== null ? count - prev : 0;
                return (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <span className={cn(
                        "text-xs",
                        diff > 0 ? "text-emerald-400/60" : diff < 0 ? "text-red-400/60" : "text-white/20"
                      )}>
                        →
                      </span>
                    )}
                    <span className={cn(
                      "text-sm font-mono font-bold transition-all",
                      isLast ? "text-white text-base count-pop" : "text-white/40"
                    )}>
                      {count > 0 ? "+" : ""}{count}
                    </span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "rounded-xl px-8 py-3 font-semibold transition-all",
                isPlaying
                  ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isPlaying ? "Pause" : entries.length === 0 ? "Play" : "Resume"}
            </button>
            {entries.length > 0 && (
              <button
                onClick={handleReset}
                className="rounded-xl px-6 py-3 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
              >
                New Shoe
              </button>
            )}
          </div>
        </div>

        {/* Side Panel — Live Stats */}
        <div className="space-y-4">
          {/* Running Count */}
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Running Count</div>
            <div className={cn(
              "text-4xl font-bold transition-all count-pop",
              runningCount > 0 ? "text-emerald-400" : runningCount < 0 ? "text-red-400" : "text-foreground"
            )}>
              {runningCount > 0 ? "+" : ""}{runningCount}
            </div>
          </div>

          {/* True Count */}
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">True Count</div>
            <div className={cn(
              "text-2xl font-bold",
              trueCount > 0 ? "text-emerald-400" : trueCount < 0 ? "text-red-400" : "text-foreground"
            )}>
              {trueCount > 0 ? "+" : ""}{trueCount}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              RC ({runningCount}) ÷ {(remaining / 52).toFixed(1)} decks
            </div>
          </div>

          {/* Betting Advice */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground mb-2">Optimal Bet</div>
            <div className="text-xl font-bold" style={{ color: bettingAdvice.color }}>
              {bettingAdvice.label}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {bettingAdvice.description}
            </p>
          </div>

          {/* Shoe Info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Shoe</span>
              <span>{remaining}/{shoe.length}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${100 - penetration}%`,
                  background: penetration > 75 ? "#ef4444" : penetration > 50 ? "#eab308" : "#00d4aa",
                }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {penetration}% dealt · {Math.ceil(remaining / 52)} deck{Math.ceil(remaining / 52) !== 1 ? "s" : ""} left
            </div>
          </div>

          {/* Strategy Insight */}
          {deviation && entries.length > 10 && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
              <div className="text-xs text-accent mb-2 font-medium">Strategy Deviation</div>
              <div className="text-sm font-semibold mb-1">{deviation.name}</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {deviation.explanation}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  Basic: {deviation.basicPlay}
                </span>
                <span>→</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Deviation: {deviation.deviationPlay}
                </span>
              </div>
            </div>
          )}

          {/* Count System Reference */}
          <div className="rounded-xl border border-border bg-card/50 p-3">
            <div className="text-[10px] text-muted-foreground mb-2">{sys.name} Values</div>
            <div className="flex gap-2 text-[10px]">
              <div>
                <span className="text-emerald-400 font-bold">+1</span>{" "}
                <span className="text-muted-foreground">
                  {Object.entries(sys.values).filter(([, v]) => v === 1).map(([r]) => RANK_DISPLAY[r as keyof typeof RANK_DISPLAY]).join(" ")}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-bold">0</span>{" "}
                <span className="text-muted-foreground">
                  {Object.entries(sys.values).filter(([, v]) => v === 0).map(([r]) => RANK_DISPLAY[r as keyof typeof RANK_DISPLAY]).join(" ")}
                </span>
              </div>
              <div>
                <span className="text-red-400 font-bold">-1</span>{" "}
                <span className="text-muted-foreground">
                  {Object.entries(sys.values).filter(([, v]) => v === -1).map(([r]) => RANK_DISPLAY[r as keyof typeof RANK_DISPLAY]).join(" ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card History */}
      {historyEntries.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="text-xs text-muted-foreground mb-2">
            Card History ({entries.length} cards dealt)
          </div>
          <div ref={historyRef} className="flex gap-1.5 overflow-x-auto pb-1">
            {historyEntries.slice(-40).map((entry) => {
              const suitColor =
                entry.card.suit === "hearts" || entry.card.suit === "diamonds"
                  ? "text-red-500"
                  : "text-gray-800";
              return (
                <span
                  key={entry.card.id}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-[2px] text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border",
                    entry.countValue > 0
                      ? "bg-emerald-50 border-emerald-200"
                      : entry.countValue < 0
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                  )}
                >
                  <span className={suitColor}>
                    {RANK_DISPLAY[entry.card.rank]}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
