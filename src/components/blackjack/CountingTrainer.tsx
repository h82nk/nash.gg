"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  BJCard,
  TrainerConfig,
  TrainerStats,
  DrillCheckpoint,
  CountingSystem,
  DeckCount,
  DealSpeed,
  BurstCount,
} from "@/types/blackjack";
import { DEAL_SPEED_MS } from "@/types/blackjack";
import { createShoe, getPenetration, getCardsRemaining } from "@/lib/blackjack/deck";
import {
  getRunningCount,
  getCardValue,
  getTrueCount,
  getBettingAdvice,
  COUNTING_SYSTEMS,
} from "@/lib/blackjack/counting";
import { PlayingCard, MiniCard } from "./PlayingCard";
import { Tutorial } from "./Tutorial";
import { Playground } from "./Playground";
import { playCardSlide, playChipClick, playBuzz, playShuffle } from "@/lib/blackjack/sounds";
import { cn } from "@/lib/utils";

// ─────────────────────── Inline Count Input (Numpad) ───────────────────────
function CountInput({
  onSubmit,
  label = "Running count?",
}: {
  onSubmit: (value: number) => void;
  label?: string;
}) {
  const [display, setDisplay] = useState("0");
  const [isNegative, setIsNegative] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const numericValue = (isNegative ? -1 : 1) * (parseInt(display, 10) || 0);

  const handleDigit = (digit: string) => {
    setDisplay((prev) => {
      if (prev === "0") return digit;
      if (prev.length >= 2) return prev;
      return prev + digit;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      handleDigit(e.key);
    } else if (e.key === "-") {
      e.preventDefault();
      setIsNegative(true);
    } else if (e.key === "+") {
      e.preventDefault();
      setIsNegative(false);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      setDisplay((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(numericValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDisplay("0");
      setIsNegative(false);
    }
  };

  const padBtn =
    "rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/5 text-xl h-12";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-4 w-full max-w-xs outline-none select-none"
    >
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

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => handleDigit(d)} className={padBtn}>
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIsNegative((p) => !p)}
          className={cn(
            "rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center h-12 text-lg border",
            isNegative
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-white/10 text-white/70 border-white/5"
          )}
        >
          +/−
        </button>
        <button type="button" onClick={() => handleDigit("0")} className={padBtn}>
          0
        </button>
        <button
          type="button"
          onClick={() => setDisplay((p) => (p.length <= 1 ? "0" : p.slice(0, -1)))}
          className="rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white/60 border border-white/5 h-12 text-sm"
        >
          ←
        </button>
      </div>

      <button
        type="button"
        onClick={() => onSubmit(numericValue)}
        className="w-full rounded-xl bg-primary py-3 font-bold text-lg text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        Submit
      </button>
      <div className="text-[10px] text-white/20 text-center mt-2 hidden sm:block">
        Type digits · minus key for negative · Enter to submit
      </div>
    </div>
  );
}

type AppMode = "home" | "tutorial" | "playground" | "speed-drill" | "table-sim" | "results";

/** Cut card penetration threshold — typical casino range is 75-80% */
const CUT_CARD_PENETRATION = 75;

const DEFAULT_CONFIG: TrainerConfig = {
  system: "hi-lo",
  deckCount: 6,
  speed: "medium",
  checkpointInterval: 5,
  burstCount: 1,
};

// ─────────────────────── Home Screen ───────────────────────
function HomeScreen({
  config,
  onConfigChange,
  onSelectMode,
}: {
  config: TrainerConfig;
  onConfigChange: (c: TrainerConfig) => void;
  onSelectMode: (mode: AppMode) => void;
}) {
  const [showSettings, setShowSettings] = useState(false);

  const modes = [
    {
      key: "tutorial" as AppMode,
      title: "Learn to Count",
      tag: "Start Here",
      tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      desc: "Interactive tutorial that teaches card values, running count, true count, and bet sizing step by step.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      key: "playground" as AppMode,
      title: "Playground",
      tag: "Recommended",
      tagColor: "bg-primary/10 text-primary border-primary/20",
      desc: "Watch cards dealt with live count overlay, value badges on every card, and real-time strategy insights. No pressure — just observe and learn.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
      ),
    },
    {
      key: "speed-drill" as AppMode,
      title: "Speed Drill",
      tag: null,
      tagColor: "",
      desc: "Cards dealt one at a time. Track the count in your head, then verify at checkpoints. Build speed and accuracy.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      key: "table-sim" as AppMode,
      title: "Table Simulation",
      tag: null,
      tagColor: "",
      desc: "Full multi-spot blackjack rounds. Track the count across an entire shoe like you would at a real table.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 2v5M8 2v5M2 12h20" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Mode Cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Choose Your Path</h2>
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => onSelectMode(mode.key)}
            className="w-full rounded-xl border border-border bg-card hover:bg-card/80 hover:border-muted-foreground/20 p-5 text-left transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5 shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                {mode.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{mode.title}</span>
                  {mode.tag && (
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", mode.tagColor)}>
                      {mode.tag}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{mode.desc}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-1 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Settings Toggle */}
      <div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn("transition-transform", showSettings && "rotate-90")}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Settings
          <span className="text-xs text-muted-foreground/60">
            {COUNTING_SYSTEMS[config.system].name} · {config.deckCount} deck{config.deckCount > 1 ? "s" : ""} · {config.speed}
          </span>
        </button>

        {showSettings && (
          <div className="mt-4 rounded-xl border border-border bg-card/50 p-5 space-y-5">
            {/* System */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Counting System</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(COUNTING_SYSTEMS) as CountingSystem[]).map((key) => {
                  const sys = COUNTING_SYSTEMS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => onConfigChange({ ...config, system: key })}
                      className={cn(
                        "rounded-lg border p-3 text-left text-sm transition-all",
                        config.system === key
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <span className="font-medium">{sys.name}</span>
                      {!sys.balanced && (
                        <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          Unbalanced
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Decks */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Shoe Size</label>
              <div className="flex gap-2">
                {([1, 2, 6, 8] as DeckCount[]).map((n) => (
                  <button
                    key={n}
                    onClick={() => onConfigChange({ ...config, deckCount: n })}
                    className={cn(
                      "flex-1 rounded-lg border py-2 text-center text-sm font-medium transition-all relative",
                      config.deckCount === n
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {n}
                    {(n === 6 || n === 8) && (
                      <span className="absolute -top-1.5 right-1 text-[7px] px-1 py-0 rounded bg-yellow-500/15 text-yellow-500 border border-yellow-500/20 leading-tight">
                        Casino
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5">6-8 deck shoes are standard at most casinos</p>
            </div>

            {/* Speed */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Deal Speed</label>
              <div className="flex gap-2">
                {(["slow", "medium", "fast", "turbo"] as DealSpeed[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => onConfigChange({ ...config, speed: s })}
                    className={cn(
                      "flex-1 rounded-lg border py-2 text-center text-sm font-medium capitalize transition-all",
                      config.speed === s
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkpoint */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Check Count Every (drill modes)</label>
              <div className="flex gap-2">
                {[1, 3, 5, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => onConfigChange({ ...config, checkpointInterval: n })}
                    className={cn(
                      "flex-1 rounded-lg border py-2 text-center text-sm font-medium transition-all",
                      config.checkpointInterval === n
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Burst Count */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Cards Per Beat (speed drill)</label>
              <div className="flex gap-2">
                {([1, 2, 3] as BurstCount[]).map((n) => (
                  <button
                    key={n}
                    onClick={() => onConfigChange({ ...config, burstCount: n })}
                    className={cn(
                      "flex-1 rounded-lg border py-2.5 text-center text-sm font-medium transition-all",
                      config.burstCount === n
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    <div>{n}</div>
                    <div className="text-[9px] text-muted-foreground/60 mt-0.5">
                      {n === 1 ? "Normal" : n === 2 ? "Double" : "Triple"}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                Simulate busy tables where multiple cards flip quickly
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────── Shoe Indicator (stats panel) ───────────────────────
function ShoeIndicator({
  total,
  remaining,
  penetration,
}: {
  total: number;
  remaining: number;
  penetration: number;
}) {
  return (
    <div className="shoe-glow rounded-xl border border-border bg-card/80 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-12 rounded bg-gradient-to-b from-[#1a1a5e] to-[#12124a] border border-[#2a2a6e] flex items-center justify-center">
          <span className="text-[10px] text-[#4a4aae] font-bold">
            {Math.ceil(remaining / 52)}
          </span>
        </div>
        <div>
          <div className="text-sm font-medium">Shoe</div>
          <div className="text-xs text-muted-foreground">
            {remaining} / {total} cards
          </div>
        </div>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${100 - penetration}%`,
            background:
              penetration > 75 ? "#ef4444" : penetration > 50 ? "#eab308" : "#00d4aa",
          }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">
        {penetration}% penetration
      </div>
    </div>
  );
}

// ─────────────────────── Visual Shoe on Felt ───────────────────────
function FeltShoe({
  remaining,
  total,
  deckCount,
}: {
  remaining: number;
  total: number;
  deckCount: number;
}) {
  const pct = remaining / total;
  const stackHeight = Math.max(8, Math.round(pct * 48));
  const decksLeft = Math.ceil(remaining / 52);

  return (
    <div className="absolute top-4 right-4 flex flex-col items-center gap-1 z-[5]">
      {/* Shoe housing */}
      <div className="relative w-14 rounded-lg bg-gradient-to-b from-[#1a1a2e] to-[#0e0e1a] border border-white/10 shadow-lg overflow-hidden"
        style={{ height: `${56}px` }}
      >
        {/* Card stack inside shoe */}
        <div
          className="absolute bottom-0 left-1 right-1 rounded-sm transition-all duration-700 ease-out"
          style={{
            height: `${stackHeight}px`,
            background: `linear-gradient(180deg, #2a2a6e 0%, #1a1a5e 40%, #12124a 100%)`,
            boxShadow: "inset 0 1px 2px rgba(100, 100, 200, 0.3)",
          }}
        />
        {/* Top slot line */}
        <div className="absolute top-2 left-1 right-1 h-[2px] bg-white/10 rounded" />
        {/* Deck count */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-bold text-white/40">{decksLeft}D</span>
        </div>
      </div>
      <span className="text-[8px] text-white/30 font-medium">{deckCount}-DECK</span>
    </div>
  );
}

// ─────────────────────── Discard Tray on Felt ───────────────────────
function DiscardTray({ cardsDealt }: { cardsDealt: number }) {
  if (cardsDealt === 0) return null;

  // Stack grows as more cards are dealt (max visual height)
  const stackHeight = Math.min(40, Math.max(4, Math.round(cardsDealt / 4)));
  // Show up to 4 stacked card edges
  const layers = Math.min(4, Math.ceil(cardsDealt / 10));

  return (
    <div className="absolute bottom-4 left-4 flex flex-col items-center gap-1 z-[5]">
      <div className="relative w-12" style={{ height: `${stackHeight + 16}px` }}>
        {/* Tray base */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-white/10" />
        {/* Stacked card edges */}
        {Array.from({ length: layers }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 rounded-sm border border-white/10"
            style={{
              bottom: `${3 + i * 3}px`,
              height: `${Math.max(6, stackHeight - i * 2)}px`,
              background: `linear-gradient(180deg, #e8e8e0 0%, #d8d8d0 100%)`,
              opacity: 0.4 + i * 0.15,
              transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (i + 1)}deg)`,
            }}
          />
        ))}
      </div>
      <span className="text-[8px] text-white/25 font-medium">{cardsDealt}</span>
    </div>
  );
}

// ─────────────────────── Cut Card Banner ───────────────────────
function CutCardBanner({ onReshuffle }: { onReshuffle: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
          <div className="w-6 h-8 rounded-sm bg-yellow-400 border border-yellow-300" />
          <span className="text-yellow-300 font-bold text-sm">Cut Card Reached</span>
        </div>
        <div className="text-white/50 text-xs">
          {CUT_CARD_PENETRATION}% of the shoe has been dealt
        </div>
        <button
          onClick={onReshuffle}
          className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Reshuffle &amp; Continue
        </button>
      </div>
    </div>
  );
}

// ─────────────────────── Speed Drill Mode ───────────────────────
function SpeedDrill({
  config,
  onFinish,
  onBack,
}: {
  config: TrainerConfig;
  onFinish: (stats: TrainerStats, checkpoints: DrillCheckpoint[]) => void;
  onBack: () => void;
}) {
  const [shoe, setShoe] = useState(() => createShoe(config.deckCount));
  const [cardIndex, setCardIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState<BJCard[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [hitCutCard, setHitCutCard] = useState(false);
  const [checkpoints, setCheckpoints] = useState<DrillCheckpoint[]>([]);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    actual: number;
  } | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showCount, setShowCount] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [stats, setStats] = useState<TrainerStats>({
    totalCheckpoints: 0,
    correctCheckpoints: 0,
    accuracy: 0,
    avgResponseTimeMs: 0,
    bestStreak: 0,
    currentStreak: 0,
    cardsDealt: 0,
    cardsPerMinute: 0,
  });

  const checkpointStartTime = useRef(Date.now());
  const sessionStartTime = useRef(Date.now());
  const dealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const actualCount = getRunningCount(
    visibleCards.map((c) => c.rank),
    config.system
  );
  const remaining = getCardsRemaining(shoe, cardIndex);
  const trueCount = getTrueCount(actualCount, remaining);
  const penetration = getPenetration(shoe, cardIndex);
  const bettingAdvice = getBettingAdvice(trueCount);

  // Cut card detection
  useEffect(() => {
    if (penetration >= CUT_CARD_PENETRATION && !hitCutCard && cardIndex > 0) {
      setHitCutCard(true);
      setIsPaused(true);
    }
  }, [penetration, hitCutCard, cardIndex]);

  const handleReshuffle = () => {
    playShuffle();
    setShoe(createShoe(config.deckCount));
    setCardIndex(0);
    setVisibleCards([]);
    setHitCutCard(false);
    setIsPaused(false);
  };

  const dealNextCard = useCallback(() => {
    if (cardIndex >= shoe.length) {
      const elapsed = (Date.now() - sessionStartTime.current) / 60000;
      onFinish(
        {
          ...stats,
          cardsDealt: cardIndex,
          cardsPerMinute: Math.round(cardIndex / elapsed),
        },
        checkpoints
      );
      return;
    }

    // Deal burstCount cards in rapid succession
    const burst = config.burstCount;
    const cardsToAdd: BJCard[] = [];
    let idx = cardIndex;
    for (let b = 0; b < burst && idx < shoe.length; b++) {
      cardsToAdd.push(shoe[idx]);
      idx++;
    }

    // Stagger sounds for burst > 1
    cardsToAdd.forEach((_, i) => {
      if (i === 0) playCardSlide();
      else setTimeout(() => playCardSlide(), i * 80);
    });

    setVisibleCards((prev) => [...prev.slice(-(12 - cardsToAdd.length)), ...cardsToAdd]);
    setCardIndex(idx);
    setStats((prev) => ({ ...prev, cardsDealt: idx }));

    if (idx % config.checkpointInterval === 0) {
      setIsWaiting(true);
      checkpointStartTime.current = Date.now();
    }
  }, [cardIndex, shoe, config.checkpointInterval, config.burstCount, onFinish, stats, checkpoints]);

  useEffect(() => {
    if (isPaused || isWaiting) return;
    dealTimerRef.current = setTimeout(dealNextCard, DEAL_SPEED_MS[config.speed]);
    return () => {
      if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    };
  }, [cardIndex, isPaused, isWaiting, config.speed, dealNextCard]);

  const handleSubmitCountValue = (value: number) => {
    const timeTaken = Date.now() - checkpointStartTime.current;
    const isCorrect = value === actualCount;

    const checkpoint: DrillCheckpoint = {
      cardIndex,
      userCount: value,
      actualCount,
      isCorrect,
      timeTakenMs: timeTaken,
    };

    const newCheckpoints = [...checkpoints, checkpoint];
    setCheckpoints(newCheckpoints);

    const correct = newCheckpoints.filter((c) => c.isCorrect).length;
    const currentStreak = isCorrect ? stats.currentStreak + 1 : 0;
    const bestStreak = Math.max(stats.bestStreak, currentStreak);
    const avgTime =
      newCheckpoints.reduce((s, c) => s + c.timeTakenMs, 0) / newCheckpoints.length;

    setStats((prev) => ({
      ...prev,
      totalCheckpoints: newCheckpoints.length,
      correctCheckpoints: correct,
      accuracy: Math.round((correct / newCheckpoints.length) * 100),
      avgResponseTimeMs: Math.round(avgTime),
      currentStreak,
      bestStreak,
    }));

    if (isCorrect) playChipClick(); else playBuzz();
    setLastResult({ correct: isCorrect, actual: actualCount });
    setIsWaiting(false);
    setTimeout(() => setLastResult(null), 1500);
  };

  const handleEndDrill = () => {
    const elapsed = (Date.now() - sessionStartTime.current) / 60000;
    onFinish(
      {
        ...stats,
        cardsPerMinute:
          elapsed > 0 ? Math.round(stats.cardsDealt / elapsed) : 0,
      },
      checkpoints
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-card transition-colors"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={() => setShowCount(!showCount)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              showCount
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border hover:bg-card"
            )}
          >
            {showCount ? "Hide Count" : "Peek"}
          </button>
          <button
            onClick={() => setShowBadges(!showBadges)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              showBadges
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-border hover:bg-card"
            )}
          >
            {showBadges ? "Hide Values" : "Show Values"}
          </button>
        </div>
        <button
          onClick={handleEndDrill}
          className="rounded-lg border border-destructive/50 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          End Drill
        </button>
      </div>

      {/* Felt Area */}
      <div className="bg-felt rounded-2xl p-6 sm:p-8 min-h-[340px] relative overflow-hidden">
        {/* Visual shoe on felt */}
        <FeltShoe remaining={remaining} total={shoe.length} deckCount={config.deckCount} />
        <DiscardTray cardsDealt={shoe.length - remaining} />

        {hitCutCard && (
          <CutCardBanner onReshuffle={handleReshuffle} />
        )}

        {isPaused && !hitCutCard && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Paused</div>
              <button
                onClick={() => setIsPaused(false)}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
              >
                Resume
              </button>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="flex items-center justify-center min-h-[160px]">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {visibleCards.slice(-6).map((card, i) => (
              <PlayingCard
                key={card.id + "-" + (cardIndex - visibleCards.slice(-6).length + i)}
                card={card}
                size="lg"
                animate={i === visibleCards.slice(-6).length - 1}
                faceDown={false}
                countValue={getCardValue(card.rank, config.system)}
                showCountBadge={showBadges}
              />
            ))}
          </div>
        </div>

        {/* Count input — tap-friendly stepper */}
        {isWaiting && (
          <div
            className={cn(
              "mt-6 flex justify-center",
              lastResult?.correct === true && "flash-correct",
              lastResult?.correct === false && "flash-incorrect"
            )}
          >
            <CountInput
              label={`Running count after ${cardIndex} cards?`}
              onSubmit={handleSubmitCountValue}
            />
          </div>
        )}

        {/* Result toast */}
        {lastResult && !isWaiting && (
          <div className="mt-4 flex justify-center">
            <div
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium",
                lastResult.correct
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              )}
            >
              {lastResult.correct
                ? "Correct!"
                : `Wrong — actual: ${lastResult.actual}`}
            </div>
          </div>
        )}

        {/* Peek overlay */}
        {showCount && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/50">RC</div>
            <div className="text-2xl font-bold text-white count-pop">
              {actualCount > 0 ? "+" : ""}
              {actualCount}
            </div>
            <div className="text-xs text-white/40 mt-1">
              TC: {trueCount > 0 ? "+" : ""}
              {trueCount}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ShoeIndicator total={shoe.length} remaining={remaining} penetration={penetration} />
        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
          <div className="text-2xl font-bold">
            {stats.totalCheckpoints > 0 ? `${stats.accuracy}%` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.correctCheckpoints}/{stats.totalCheckpoints}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Streak</div>
          <div className="text-2xl font-bold text-primary">{stats.currentStreak}</div>
          <div className="text-xs text-muted-foreground">Best: {stats.bestStreak}</div>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Bet Sizing</div>
          <div className="text-2xl font-bold" style={{ color: bettingAdvice.color }}>
            {bettingAdvice.label}
          </div>
          <div className="text-xs text-muted-foreground">
            TC: {trueCount > 0 ? "+" : ""}
            {trueCount}
          </div>
        </div>
      </div>

      {/* Card history */}
      {visibleCards.length > 6 && (
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="text-xs text-muted-foreground mb-2">Recent Cards</div>
          <div className="flex flex-wrap gap-1">
            {visibleCards
              .slice(0, -6)
              .slice(-20)
              .map((card) => (
                <MiniCard key={card.id} card={card} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────── Table Simulation ───────────────────────
function TableSim({
  config,
  onFinish,
  onBack,
}: {
  config: TrainerConfig;
  onFinish: (stats: TrainerStats, checkpoints: DrillCheckpoint[]) => void;
  onBack: () => void;
}) {
  const [shoe, setShoe] = useState(() => createShoe(config.deckCount));
  const [cardIndex, setCardIndex] = useState(0);
  const [playerHands, setPlayerHands] = useState<BJCard[][]>([]);
  const [dealerHand, setDealerHand] = useState<BJCard[]>([]);
  const [allDealtCards, setAllDealtCards] = useState<BJCard[]>([]);
  const [roundNum, setRoundNum] = useState(0);
  const [phase, setPhase] = useState<"dealing" | "waiting" | "between" | "cut-card">("between");
  const [checkpoints, setCheckpoints] = useState<DrillCheckpoint[]>([]);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    actual: number;
  } | null>(null);
  const [showCount, setShowCount] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [stats, setStats] = useState<TrainerStats>({
    totalCheckpoints: 0,
    correctCheckpoints: 0,
    accuracy: 0,
    avgResponseTimeMs: 0,
    bestStreak: 0,
    currentStreak: 0,
    cardsDealt: 0,
    cardsPerMinute: 0,
  });

  const checkpointStartTime = useRef(Date.now());
  const sessionStartTime = useRef(Date.now());
  const numSpots = 3;

  const handleTableReshuffle = () => {
    playShuffle();
    setShoe(createShoe(config.deckCount));
    setCardIndex(0);
    setAllDealtCards([]);
    setPlayerHands([]);
    setDealerHand([]);
    setPhase("between");
  };

  const actualCount = getRunningCount(
    allDealtCards.map((c) => c.rank),
    config.system
  );
  const remaining = getCardsRemaining(shoe, cardIndex);
  const trueCount = getTrueCount(actualCount, remaining);
  const penetration = getPenetration(shoe, cardIndex);
  const bettingAdvice = getBettingAdvice(trueCount);

  const dealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dealRound = useCallback(() => {
    if (cardIndex + (numSpots + 1) * 2 > shoe.length) {
      const elapsed = (Date.now() - sessionStartTime.current) / 60000;
      onFinish(
        {
          ...stats,
          cardsDealt: cardIndex,
          cardsPerMinute: Math.round(cardIndex / elapsed),
        },
        checkpoints
      );
      return;
    }

    setPhase("dealing");
    setRoundNum((prev) => prev + 1);

    // Pre-compute the full round of cards
    let idx = cardIndex;
    const allRoundCards: BJCard[] = [];
    // Deal order: spot1, spot2, spot3, dealer, spot1, spot2, spot3, dealer
    for (let s = 0; s < numSpots; s++) { allRoundCards.push(shoe[idx++]); }
    allRoundCards.push(shoe[idx++]); // dealer card 1
    for (let s = 0; s < numSpots; s++) { allRoundCards.push(shoe[idx++]); }
    allRoundCards.push(shoe[idx++]); // dealer card 2

    const dealInterval = Math.max(180, DEAL_SPEED_MS[config.speed] * 0.4);

    // Clear any leftover timers
    dealTimersRef.current.forEach(clearTimeout);
    dealTimersRef.current = [];

    // Deal cards one at a time with sequential animation
    allRoundCards.forEach((card, i) => {
      const timer = setTimeout(() => {
        playCardSlide();

        if (i < numSpots) {
          // First pass — card 1 to each player spot
          setPlayerHands((prev) => {
            const next = prev.length === 0
              ? Array.from({ length: numSpots }, () => [] as BJCard[])
              : prev.map((h) => [...h]);
            next[i] = [...(next[i] || []), card];
            return next;
          });
        } else if (i === numSpots) {
          // Dealer card 1
          setDealerHand([card]);
        } else if (i < numSpots * 2 + 1) {
          // Second pass — card 2 to each player spot
          const spotIdx = i - numSpots - 1;
          setPlayerHands((prev) => {
            const next = prev.map((h) => [...h]);
            next[spotIdx] = [...(next[spotIdx] || []), card];
            return next;
          });
        } else {
          // Dealer card 2
          setDealerHand((prev) => [...prev, card]);
        }

        setAllDealtCards((prev) => [...prev, card]);
        setCardIndex(cardIndex + i + 1);
        setStats((prev) => ({ ...prev, cardsDealt: cardIndex + i + 1 }));

        // After last card, check cut card or transition to waiting
        if (i === allRoundCards.length - 1) {
          const finalIdx = cardIndex + allRoundCards.length;
          const finalPenetration = Math.round((finalIdx / shoe.length) * 100);
          setTimeout(() => {
            if (finalPenetration >= CUT_CARD_PENETRATION) {
              setPhase("cut-card");
            } else {
              setPhase("waiting");
              checkpointStartTime.current = Date.now();
            }
          }, dealInterval + 200);
        }
      }, i * dealInterval);

      dealTimersRef.current.push(timer);
    });
  }, [cardIndex, shoe, config.speed, numSpots, onFinish, stats, checkpoints]);

  const handleSubmitCountValue = (value: number) => {
    const timeTaken = Date.now() - checkpointStartTime.current;
    const isCorrect = value === actualCount;

    const checkpoint: DrillCheckpoint = {
      cardIndex,
      userCount: value,
      actualCount,
      isCorrect,
      timeTakenMs: timeTaken,
    };

    const newCheckpoints = [...checkpoints, checkpoint];
    setCheckpoints(newCheckpoints);

    const correct = newCheckpoints.filter((c) => c.isCorrect).length;
    const currentStreak = isCorrect ? stats.currentStreak + 1 : 0;
    const bestStreak = Math.max(stats.bestStreak, currentStreak);
    const avgTime =
      newCheckpoints.reduce((s, c) => s + c.timeTakenMs, 0) / newCheckpoints.length;

    setStats((prev) => ({
      ...prev,
      totalCheckpoints: newCheckpoints.length,
      correctCheckpoints: correct,
      accuracy: Math.round((correct / newCheckpoints.length) * 100),
      avgResponseTimeMs: Math.round(avgTime),
      currentStreak,
      bestStreak,
    }));

    if (isCorrect) playChipClick(); else playBuzz();
    setLastResult({ correct: isCorrect, actual: actualCount });
    setPhase("between");
    setTimeout(() => setLastResult(null), 1500);
  };

  const handleEndDrill = () => {
    const elapsed = (Date.now() - sessionStartTime.current) / 60000;
    onFinish(
      {
        ...stats,
        cardsPerMinute:
          elapsed > 0 ? Math.round(stats.cardsDealt / elapsed) : 0,
      },
      checkpoints
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </button>
          <div className="w-px h-4 bg-border" />
          <span className="text-sm text-muted-foreground">Round {roundNum}</span>
          <button
            onClick={() => setShowCount(!showCount)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              showCount ? "border-primary/50 bg-primary/10 text-primary" : "border-border hover:bg-card"
            )}
          >
            {showCount ? "Hide Count" : "Peek"}
          </button>
          <button
            onClick={() => setShowBadges(!showBadges)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              showBadges
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-border hover:bg-card"
            )}
          >
            {showBadges ? "Hide Values" : "Show Values"}
          </button>
        </div>
        <button
          onClick={handleEndDrill}
          className="rounded-lg border border-destructive/50 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Felt */}
      <div className="bg-felt rounded-2xl p-6 sm:p-8 min-h-[400px] relative overflow-hidden">
        {/* Visual shoe on felt */}
        <FeltShoe remaining={remaining} total={shoe.length} deckCount={config.deckCount} />
        <DiscardTray cardsDealt={shoe.length - remaining} />

        {/* Cut card overlay */}
        {phase === "cut-card" && (
          <CutCardBanner onReshuffle={handleTableReshuffle} />
        )}

        {/* Dealer */}
        <div className="text-center mb-8">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Dealer</div>
          <div className="flex justify-center gap-3">
            {dealerHand.length > 0 ? (
              dealerHand.map((card, i) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  size="lg"
                  faceDown={i === 1}
                  animate
                  animationType="deal-table"
                  countValue={i === 0 ? getCardValue(card.rank, config.system) : null}
                  showCountBadge={showBadges && i === 0}
                />
              ))
            ) : (
              <div className="h-[136px] flex items-center">
                <span className="text-white/20 text-sm">Waiting to deal...</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 my-6" />

        {/* Player spots */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-6">
          {Array.from({ length: numSpots }).map((_, spotIdx) => (
            <div key={spotIdx} className="text-center">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                Spot {spotIdx + 1}
              </div>
              <div className="flex justify-center gap-1 sm:gap-2">
                {playerHands[spotIdx]?.map((card) => (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    size="md"
                    animate
                    animationType="deal-table"
                    countValue={getCardValue(card.rank, config.system)}
                    showCountBadge={showBadges}
                  />
                ))}
                {!playerHands[spotIdx] && (
                  <div className="w-[72px] h-[102px] rounded-lg border border-dashed border-white/10" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Count Input — tap-friendly stepper */}
        {phase === "waiting" && (
          <div className="flex justify-center mt-4">
            <CountInput
              label={`Running count after round ${roundNum}?`}
              onSubmit={handleSubmitCountValue}
            />
          </div>
        )}

        {/* Deal button */}
        {phase === "between" && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                setPlayerHands([]);
                setDealerHand([]);
                dealRound();
              }}
              className="rounded-xl bg-primary/90 hover:bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors"
            >
              {roundNum === 0 ? "Deal First Round" : "Deal Next Round"}
            </button>
          </div>
        )}

        {/* Result */}
        {lastResult && phase === "between" && (
          <div className="flex justify-center mt-4">
            <div
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium",
                lastResult.correct
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              )}
            >
              {lastResult.correct ? "Correct!" : `Wrong — actual: ${lastResult.actual}`}
            </div>
          </div>
        )}

        {/* Peek */}
        {showCount && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/50">RC</div>
            <div className="text-2xl font-bold text-white count-pop">
              {actualCount > 0 ? "+" : ""}
              {actualCount}
            </div>
            <div className="text-xs text-white/40 mt-1">
              TC: {trueCount > 0 ? "+" : ""}
              {trueCount}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ShoeIndicator total={shoe.length} remaining={remaining} penetration={penetration} />
        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
          <div className="text-2xl font-bold">
            {stats.totalCheckpoints > 0 ? `${stats.accuracy}%` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.correctCheckpoints}/{stats.totalCheckpoints}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Streak</div>
          <div className="text-2xl font-bold text-primary">{stats.currentStreak}</div>
          <div className="text-xs text-muted-foreground">Best: {stats.bestStreak}</div>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Bet Sizing</div>
          <div className="text-2xl font-bold" style={{ color: bettingAdvice.color }}>
            {bettingAdvice.label}
          </div>
          <div className="text-xs text-muted-foreground">
            TC: {trueCount > 0 ? "+" : ""}
            {trueCount}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── Results Screen ───────────────────────
function ResultsScreen({
  stats,
  checkpoints,
  config,
  onRestart,
  onPlayground,
}: {
  stats: TrainerStats;
  checkpoints: DrillCheckpoint[];
  config: TrainerConfig;
  onRestart: () => void;
  onPlayground: () => void;
}) {
  const system = COUNTING_SYSTEMS[config.system];

  const grade =
    stats.accuracy >= 95
      ? { label: "Master", color: "#7c3aed", desc: "Elite counting precision." }
      : stats.accuracy >= 85
        ? { label: "Expert", color: "#00d4aa", desc: "Strong skills — keep sharpening." }
        : stats.accuracy >= 70
          ? { label: "Proficient", color: "#22c55e", desc: "Good foundation — practice speed next." }
          : stats.accuracy >= 50
            ? { label: "Developing", color: "#eab308", desc: "Getting there — keep at it." }
            : { label: "Beginner", color: "#ef4444", desc: "Try the Playground to learn the flow first." };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="text-5xl font-bold" style={{ color: grade.color }}>
          {stats.accuracy}%
        </div>
        <div className="text-xl font-semibold" style={{ color: grade.color }}>
          {grade.label}
        </div>
        <p className="text-muted-foreground text-sm">{grade.desc}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold">{stats.cardsDealt}</div>
          <div className="text-xs text-muted-foreground">Cards</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold">
            {stats.correctCheckpoints}/{stats.totalCheckpoints}
          </div>
          <div className="text-xs text-muted-foreground">Correct</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold">{stats.bestStreak}</div>
          <div className="text-xs text-muted-foreground">Best Streak</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold">
            {stats.avgResponseTimeMs > 0 ? `${(stats.avgResponseTimeMs / 1000).toFixed(1)}s` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">Avg Time</div>
        </div>
      </div>

      {checkpoints.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <h3 className="text-sm font-medium mb-3">Checkpoint History</h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {checkpoints.map((cp, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                  cp.isCorrect
                    ? "bg-emerald-500/5 border border-emerald-500/10"
                    : "bg-red-500/5 border border-red-500/10"
                )}
              >
                <span className="text-muted-foreground text-xs">#{cp.cardIndex}</span>
                <div className="flex items-center gap-4 text-xs">
                  <span>Yours: <strong>{cp.userCount}</strong></span>
                  <span>Actual: <strong>{cp.actualCount}</strong></span>
                  <span className={cp.isCorrect ? "text-emerald-400" : "text-red-400"}>
                    {cp.isCorrect ? "Correct" : "Wrong"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">
        {system.name} · {config.deckCount}-deck · {config.speed} speed
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={onRestart} className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Try Again
        </button>
        {stats.accuracy < 70 && (
          <button onClick={onPlayground} className="rounded-xl border border-primary/50 bg-primary/5 px-6 py-3 font-semibold text-primary hover:bg-primary/10 transition-colors">
            Try Playground
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────── Main Orchestrator ───────────────────────
export function CountingTrainer() {
  const [mode, setMode] = useState<AppMode>("home");
  const [config, setConfig] = useState<TrainerConfig>(DEFAULT_CONFIG);
  const [finalStats, setFinalStats] = useState<TrainerStats | null>(null);
  const [finalCheckpoints, setFinalCheckpoints] = useState<DrillCheckpoint[]>([]);

  const handleFinish = (stats: TrainerStats, checkpoints: DrillCheckpoint[]) => {
    setFinalStats(stats);
    setFinalCheckpoints(checkpoints);
    setMode("results");
  };

  const handleRestart = () => {
    setFinalStats(null);
    setFinalCheckpoints([]);
    setMode("home");
  };

  return (
    <div>
      {/* DEBUG: If you can see this, the new code is loaded */}
      <div style={{ background: "#ff0000", color: "#ffffff", padding: "12px", textAlign: "center" as const, fontWeight: "bold", fontSize: "18px", borderRadius: "8px", marginBottom: "16px" }}>
        NEW CODE LOADED — NUMPAD VERSION
      </div>
      {mode === "home" && (
        <HomeScreen config={config} onConfigChange={setConfig} onSelectMode={setMode} />
      )}
      {mode === "tutorial" && (
        <Tutorial
          system={config.system}
          onComplete={() => setMode("playground")}
          onBack={() => setMode("home")}
        />
      )}
      {mode === "playground" && (
        <Playground
          system={config.system}
          deckCount={config.deckCount}
          onBack={() => setMode("home")}
        />
      )}
      {mode === "speed-drill" && (
        <SpeedDrill config={config} onFinish={handleFinish} onBack={() => setMode("home")} />
      )}
      {mode === "table-sim" && (
        <TableSim config={config} onFinish={handleFinish} onBack={() => setMode("home")} />
      )}
      {mode === "results" && finalStats && (
        <ResultsScreen
          stats={finalStats}
          checkpoints={finalCheckpoints}
          config={config}
          onRestart={handleRestart}
          onPlayground={() => setMode("playground")}
        />
      )}
    </div>
  );
}
