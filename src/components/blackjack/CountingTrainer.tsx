"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  BJCard,
  TrainerMode,
  TrainerConfig,
  TrainerStats,
  DrillCheckpoint,
  CountingSystem,
  DeckCount,
  DealSpeed,
} from "@/types/blackjack";
import { DEAL_SPEED_MS } from "@/types/blackjack";
import { createShoe, getPenetration, getCardsRemaining } from "@/lib/blackjack/deck";
import { getRunningCount, getTrueCount, getBettingAdvice, COUNTING_SYSTEMS } from "@/lib/blackjack/counting";
import { PlayingCard, MiniCard } from "./PlayingCard";
import { cn } from "@/lib/utils";

const DEFAULT_CONFIG: TrainerConfig = {
  system: "hi-lo",
  deckCount: 6,
  speed: "medium",
  checkpointInterval: 5,
};

// ─────────────────────── Setup Screen ───────────────────────
function SetupScreen({
  config,
  onConfigChange,
  onStart,
}: {
  config: TrainerConfig;
  onConfigChange: (c: TrainerConfig) => void;
  onStart: (mode: "speed-drill" | "table-sim") => void;
}) {
  const system = COUNTING_SYSTEMS[config.system];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* System Selection */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Counting System
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(COUNTING_SYSTEMS) as CountingSystem[]).map((key) => {
            const sys = COUNTING_SYSTEMS[key];
            return (
              <button
                key={key}
                onClick={() => onConfigChange({ ...config, system: key })}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  config.system === key
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{sys.name}</span>
                  {!sys.balanced && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      Unbalanced
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{sys.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Count Values Reference */}
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <h3 className="text-sm font-medium mb-3">{system.name} Card Values</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
            <div className="text-emerald-400 text-lg font-bold mb-1">+1</div>
            <div className="text-xs text-muted-foreground">
              {Object.entries(system.values)
                .filter(([, v]) => v === 1)
                .map(([r]) => r === "T" ? "10" : r)
                .join(", ")}
            </div>
          </div>
          <div className="rounded-lg bg-gray-500/10 border border-gray-500/20 p-3 text-center">
            <div className="text-gray-400 text-lg font-bold mb-1">0</div>
            <div className="text-xs text-muted-foreground">
              {Object.entries(system.values)
                .filter(([, v]) => v === 0)
                .map(([r]) => r === "T" ? "10" : r)
                .join(", ")}
            </div>
          </div>
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
            <div className="text-red-400 text-lg font-bold mb-1">-1</div>
            <div className="text-xs text-muted-foreground">
              {Object.entries(system.values)
                .filter(([, v]) => v === -1)
                .map(([r]) => r === "T" ? "10" : r)
                .join(", ")}
            </div>
          </div>
          {Object.values(system.values).some((v) => v === 2) && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
              <div className="text-emerald-300 text-lg font-bold mb-1">+2</div>
              <div className="text-xs text-muted-foreground">
                {Object.entries(system.values)
                  .filter(([, v]) => v === 2)
                  .map(([r]) => r === "T" ? "10" : r)
                  .join(", ")}
              </div>
            </div>
          )}
          {Object.values(system.values).some((v) => v === -2) && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
              <div className="text-red-300 text-lg font-bold mb-1">-2</div>
              <div className="text-xs text-muted-foreground">
                {Object.entries(system.values)
                  .filter(([, v]) => v === -2)
                  .map(([r]) => r === "T" ? "10" : r)
                  .join(", ")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deck Count */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Number of Decks
        </label>
        <div className="flex gap-3">
          {([1, 2, 6, 8] as DeckCount[]).map((n) => (
            <button
              key={n}
              onClick={() => onConfigChange({ ...config, deckCount: n })}
              className={cn(
                "flex-1 rounded-xl border py-3 text-center font-semibold transition-all",
                config.deckCount === n
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Deal Speed */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Deal Speed
        </label>
        <div className="flex gap-3">
          {(["slow", "medium", "fast", "turbo"] as DealSpeed[]).map((s) => (
            <button
              key={s}
              onClick={() => onConfigChange({ ...config, speed: s })}
              className={cn(
                "flex-1 rounded-xl border py-3 text-center text-sm font-medium capitalize transition-all",
                config.speed === s
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Checkpoint interval */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Check Count Every
        </label>
        <div className="flex gap-3">
          {[1, 3, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => onConfigChange({ ...config, checkpointInterval: n })}
              className={cn(
                "flex-1 rounded-xl border py-3 text-center text-sm font-medium transition-all",
                config.checkpointInterval === n
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              )}
            >
              {n} card{n > 1 ? "s" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Start Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <button
          onClick={() => onStart("speed-drill")}
          className="rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <div className="text-base">Speed Drill</div>
          <div className="text-xs opacity-70 mt-1">
            Cards dealt one at a time — track the count
          </div>
        </button>
        <button
          onClick={() => onStart("table-sim")}
          className="rounded-xl border border-primary/50 bg-primary/5 px-6 py-4 font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          <div className="text-base">Table Simulation</div>
          <div className="text-xs opacity-70 mt-1">
            Full rounds with multiple hands dealt
          </div>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────── Shoe Indicator ───────────────────────
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
            background: penetration > 75
              ? "#ef4444"
              : penetration > 50
                ? "#eab308"
                : "#00d4aa",
          }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">
        {penetration}% penetration
      </div>
    </div>
  );
}

// ─────────────────────── Speed Drill Mode ───────────────────────
function SpeedDrill({
  config,
  onFinish,
}: {
  config: TrainerConfig;
  onFinish: (stats: TrainerStats, checkpoints: DrillCheckpoint[]) => void;
}) {
  const [shoe] = useState(() => createShoe(config.deckCount));
  const [cardIndex, setCardIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState<BJCard[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [checkpoints, setCheckpoints] = useState<DrillCheckpoint[]>([]);
  const [lastResult, setLastResult] = useState<{ correct: boolean; actual: number } | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showCount, setShowCount] = useState(false);
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
  const inputRef = useRef<HTMLInputElement>(null);

  const actualCount = getRunningCount(
    visibleCards.map((c) => c.rank),
    config.system
  );
  const remaining = getCardsRemaining(shoe, cardIndex);
  const trueCount = getTrueCount(actualCount, remaining);
  const penetration = getPenetration(shoe, cardIndex);
  const bettingAdvice = getBettingAdvice(trueCount);

  const dealNextCard = useCallback(() => {
    if (cardIndex >= shoe.length) {
      const elapsed = (Date.now() - sessionStartTime.current) / 60000;
      onFinish(
        { ...stats, cardsDealt: cardIndex, cardsPerMinute: Math.round(cardIndex / elapsed) },
        checkpoints
      );
      return;
    }

    const nextCard = shoe[cardIndex];
    setVisibleCards((prev) => [...prev.slice(-11), nextCard]);
    setCardIndex((prev) => prev + 1);
    setStats((prev) => ({ ...prev, cardsDealt: prev.cardsDealt + 1 }));

    const newIndex = cardIndex + 1;
    if (newIndex % config.checkpointInterval === 0) {
      setIsWaiting(true);
      checkpointStartTime.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [cardIndex, shoe, config.checkpointInterval, onFinish, stats, checkpoints]);

  // Auto-deal timer
  useEffect(() => {
    if (isPaused || isWaiting) return;
    dealTimerRef.current = setTimeout(dealNextCard, DEAL_SPEED_MS[config.speed]);
    return () => {
      if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    };
  }, [cardIndex, isPaused, isWaiting, config.speed, dealNextCard]);

  const handleSubmitCount = () => {
    const parsed = parseInt(userInput, 10);
    if (isNaN(parsed)) return;

    const timeTaken = Date.now() - checkpointStartTime.current;
    const isCorrect = parsed === actualCount;

    const checkpoint: DrillCheckpoint = {
      cardIndex,
      userCount: parsed,
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

    setLastResult({ correct: isCorrect, actual: actualCount });
    setUserInput("");
    setIsWaiting(false);

    setTimeout(() => setLastResult(null), 1500);
  };

  const handleEndDrill = () => {
    const elapsed = (Date.now() - sessionStartTime.current) / 60000;
    onFinish(
      { ...stats, cardsPerMinute: elapsed > 0 ? Math.round(stats.cardsDealt / elapsed) : 0 },
      checkpoints
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-card transition-colors"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={() => setShowCount(!showCount)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              showCount
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border hover:bg-card"
            )}
          >
            {showCount ? "Hide Count" : "Peek Count"}
          </button>
        </div>
        <button
          onClick={handleEndDrill}
          className="rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          End Drill
        </button>
      </div>

      {/* Main Felt Area */}
      <div className="bg-felt rounded-2xl p-6 sm:p-8 min-h-[360px] relative overflow-hidden">
        {isPaused && (
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

        {/* Cards Area */}
        <div className="flex items-center justify-center min-h-[160px]">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {visibleCards.slice(-6).map((card, i) => (
              <PlayingCard
                key={card.id + "-" + (cardIndex - visibleCards.slice(-6).length + i)}
                card={card}
                size="lg"
                animate={i === visibleCards.slice(-6).length - 1}
                faceDown={false}
              />
            ))}
          </div>
        </div>

        {/* Count Input Area */}
        {isWaiting && (
          <div className="mt-8 flex justify-center">
            <div className={cn(
              "bg-black/40 backdrop-blur rounded-xl p-5 border border-white/10 w-full max-w-xs text-center",
              lastResult?.correct === true && "flash-correct",
              lastResult?.correct === false && "flash-incorrect"
            )}>
              <div className="text-sm text-white/70 mb-3">
                What is the running count?
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitCount();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="number"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-center text-lg font-bold text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Check
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Last Result Toast */}
        {lastResult && !isWaiting && (
          <div className="mt-6 flex justify-center">
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
                : `Wrong — actual count: ${lastResult.actual}`}
            </div>
          </div>
        )}

        {/* Peek count overlay */}
        {showCount && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/50">Running Count</div>
            <div className="text-2xl font-bold text-white count-pop">
              {actualCount > 0 ? "+" : ""}{actualCount}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ShoeIndicator
          total={shoe.length}
          remaining={remaining}
          penetration={penetration}
        />

        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
          <div className="text-2xl font-bold">
            {stats.totalCheckpoints > 0 ? `${stats.accuracy}%` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.correctCheckpoints}/{stats.totalCheckpoints} correct
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Streak</div>
          <div className="text-2xl font-bold text-primary">
            {stats.currentStreak}
          </div>
          <div className="text-xs text-muted-foreground">
            Best: {stats.bestStreak}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Bet Sizing</div>
          <div className="text-2xl font-bold" style={{ color: bettingAdvice.color }}>
            {bettingAdvice.label}
          </div>
          <div className="text-xs text-muted-foreground">
            TC: {trueCount > 0 ? "+" : ""}{trueCount}
          </div>
        </div>
      </div>

      {/* Card History */}
      {visibleCards.length > 6 && (
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="text-xs text-muted-foreground mb-2">Recent Cards</div>
          <div className="flex flex-wrap gap-1">
            {visibleCards.slice(0, -6).slice(-20).map((card) => (
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
}: {
  config: TrainerConfig;
  onFinish: (stats: TrainerStats, checkpoints: DrillCheckpoint[]) => void;
}) {
  const [shoe] = useState(() => createShoe(config.deckCount));
  const [cardIndex, setCardIndex] = useState(0);
  const [playerHands, setPlayerHands] = useState<BJCard[][]>([]);
  const [dealerHand, setDealerHand] = useState<BJCard[]>([]);
  const [allDealtCards, setAllDealtCards] = useState<BJCard[]>([]);
  const [roundNum, setRoundNum] = useState(0);
  const [phase, setPhase] = useState<"dealing" | "waiting" | "between">("between");
  const [userInput, setUserInput] = useState("");
  const [checkpoints, setCheckpoints] = useState<DrillCheckpoint[]>([]);
  const [lastResult, setLastResult] = useState<{ correct: boolean; actual: number } | null>(null);
  const [showCount, setShowCount] = useState(false);
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
  const inputRef = useRef<HTMLInputElement>(null);
  const numSpots = 3; // 3 player spots

  const actualCount = getRunningCount(
    allDealtCards.map((c) => c.rank),
    config.system
  );
  const remaining = getCardsRemaining(shoe, cardIndex);
  const trueCount = getTrueCount(actualCount, remaining);
  const penetration = getPenetration(shoe, cardIndex);
  const bettingAdvice = getBettingAdvice(trueCount);

  const dealRound = useCallback(() => {
    if (cardIndex + (numSpots + 1) * 2 > shoe.length) {
      const elapsed = (Date.now() - sessionStartTime.current) / 60000;
      onFinish(
        { ...stats, cardsDealt: cardIndex, cardsPerMinute: Math.round(cardIndex / elapsed) },
        checkpoints
      );
      return;
    }

    setPhase("dealing");
    setRoundNum((prev) => prev + 1);

    let idx = cardIndex;
    const hands: BJCard[][] = Array.from({ length: numSpots }, () => []);
    const dealer: BJCard[] = [];
    const roundCards: BJCard[] = [];

    // First pass: one card to each spot + dealer
    for (let s = 0; s < numSpots; s++) {
      hands[s].push(shoe[idx]);
      roundCards.push(shoe[idx]);
      idx++;
    }
    dealer.push(shoe[idx]);
    roundCards.push(shoe[idx]);
    idx++;

    // Second pass
    for (let s = 0; s < numSpots; s++) {
      hands[s].push(shoe[idx]);
      roundCards.push(shoe[idx]);
      idx++;
    }
    dealer.push(shoe[idx]);
    roundCards.push(shoe[idx]);
    idx++;

    setPlayerHands(hands);
    setDealerHand(dealer);
    setAllDealtCards((prev) => [...prev, ...roundCards]);
    setCardIndex(idx);
    setStats((prev) => ({ ...prev, cardsDealt: idx }));

    // After dealing animation, wait for count
    setTimeout(() => {
      setPhase("waiting");
      checkpointStartTime.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 100);
    }, DEAL_SPEED_MS[config.speed] * 3);
  }, [cardIndex, shoe, config.speed, numSpots, onFinish, stats, checkpoints]);

  const handleSubmitCount = () => {
    const parsed = parseInt(userInput, 10);
    if (isNaN(parsed)) return;

    const timeTaken = Date.now() - checkpointStartTime.current;
    const isCorrect = parsed === actualCount;

    const checkpoint: DrillCheckpoint = {
      cardIndex,
      userCount: parsed,
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

    setLastResult({ correct: isCorrect, actual: actualCount });
    setUserInput("");
    setPhase("between");

    setTimeout(() => setLastResult(null), 1500);
  };

  const handleEndDrill = () => {
    const elapsed = (Date.now() - sessionStartTime.current) / 60000;
    onFinish(
      { ...stats, cardsPerMinute: elapsed > 0 ? Math.round(stats.cardsDealt / elapsed) : 0 },
      checkpoints
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Round {roundNum}</span>
          <button
            onClick={() => setShowCount(!showCount)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              showCount
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border hover:bg-card"
            )}
          >
            {showCount ? "Hide Count" : "Peek Count"}
          </button>
        </div>
        <button
          onClick={handleEndDrill}
          className="rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Table Felt */}
      <div className="bg-felt rounded-2xl p-6 sm:p-8 min-h-[420px] relative overflow-hidden">
        {/* Dealer Area */}
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
                  dealDelay={i * 150 + numSpots * 150}
                />
              ))
            ) : (
              <div className="h-[136px] flex items-center">
                <span className="text-white/20 text-sm">Waiting to deal...</span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-6" />

        {/* Player Spots */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-6">
          {Array.from({ length: numSpots }).map((_, spotIdx) => (
            <div key={spotIdx} className="text-center">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                Spot {spotIdx + 1}
              </div>
              <div className="flex justify-center gap-1 sm:gap-2">
                {playerHands[spotIdx]?.map((card, cardIdx) => (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    size="md"
                    animate
                    dealDelay={spotIdx * 150 + (cardIdx === 1 ? (numSpots + 1) * 150 : 0)}
                  />
                ))}
                {!playerHands[spotIdx] && (
                  <div className="w-[72px] h-[102px] rounded-lg border border-dashed border-white/10" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Count Input */}
        {phase === "waiting" && (
          <div className="flex justify-center mt-4">
            <div className="bg-black/40 backdrop-blur rounded-xl p-5 border border-white/10 w-full max-w-xs text-center">
              <div className="text-sm text-white/70 mb-3">
                Running count after this round?
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitCount();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="number"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-center text-lg font-bold text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Check
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Between rounds — deal button */}
        {phase === "between" && (
          <div className="flex justify-center mt-4">
            <button
              onClick={dealRound}
              className="rounded-xl bg-primary/90 hover:bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors"
            >
              {roundNum === 0 ? "Deal First Round" : "Deal Next Round"}
            </button>
          </div>
        )}

        {/* Result Toast */}
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
              {lastResult.correct
                ? "Correct!"
                : `Wrong — actual count: ${lastResult.actual}`}
            </div>
          </div>
        )}

        {/* Peek count */}
        {showCount && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/50">Running Count</div>
            <div className="text-2xl font-bold text-white count-pop">
              {actualCount > 0 ? "+" : ""}{actualCount}
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ShoeIndicator
          total={shoe.length}
          remaining={remaining}
          penetration={penetration}
        />

        <div className="rounded-xl border border-border bg-card/80 p-4">
          <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
          <div className="text-2xl font-bold">
            {stats.totalCheckpoints > 0 ? `${stats.accuracy}%` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.correctCheckpoints}/{stats.totalCheckpoints} correct
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
            TC: {trueCount > 0 ? "+" : ""}{trueCount}
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
}: {
  stats: TrainerStats;
  checkpoints: DrillCheckpoint[];
  config: TrainerConfig;
  onRestart: () => void;
}) {
  const system = COUNTING_SYSTEMS[config.system];

  const grade =
    stats.accuracy >= 95
      ? { label: "Master", color: "#7c3aed", desc: "You have elite counting precision." }
      : stats.accuracy >= 85
        ? { label: "Expert", color: "#00d4aa", desc: "Strong counting skills — keep sharpening." }
        : stats.accuracy >= 70
          ? { label: "Proficient", color: "#22c55e", desc: "Good foundation — practice speed next." }
          : stats.accuracy >= 50
            ? { label: "Developing", color: "#eab308", desc: "Keep practicing — accuracy comes with reps." }
            : { label: "Beginner", color: "#ef4444", desc: "Focus on the card values first, speed later." };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Grade */}
      <div className="text-center space-y-3">
        <div
          className="text-5xl font-bold"
          style={{ color: grade.color }}
        >
          {stats.accuracy}%
        </div>
        <div className="text-xl font-semibold" style={{ color: grade.color }}>
          {grade.label}
        </div>
        <p className="text-muted-foreground">{grade.desc}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold">{stats.cardsDealt}</div>
          <div className="text-xs text-muted-foreground">Cards Dealt</div>
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
            {stats.avgResponseTimeMs > 0
              ? `${(stats.avgResponseTimeMs / 1000).toFixed(1)}s`
              : "—"}
          </div>
          <div className="text-xs text-muted-foreground">Avg Response</div>
        </div>
      </div>

      {/* Checkpoint History */}
      {checkpoints.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <h3 className="text-sm font-medium mb-3">Checkpoint History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
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
                <span className="text-muted-foreground">
                  Card #{cp.cardIndex}
                </span>
                <div className="flex items-center gap-4">
                  <span>
                    Your: <strong>{cp.userCount}</strong>
                  </span>
                  <span>
                    Actual: <strong>{cp.actualCount}</strong>
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      cp.isCorrect ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {cp.isCorrect ? "Correct" : "Wrong"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="text-center text-xs text-muted-foreground">
        {system.name} system &middot; {config.deckCount}-deck shoe &middot;{" "}
        {config.speed} speed
      </div>

      {/* Restart */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onRestart}
          className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Practice Again
        </button>
      </div>
    </div>
  );
}

// ─────────────────────── Main Trainer ───────────────────────
export function CountingTrainer() {
  const [mode, setMode] = useState<TrainerMode>("setup");
  const [config, setConfig] = useState<TrainerConfig>(DEFAULT_CONFIG);
  const [finalStats, setFinalStats] = useState<TrainerStats | null>(null);
  const [finalCheckpoints, setFinalCheckpoints] = useState<DrillCheckpoint[]>([]);

  const handleStart = (m: "speed-drill" | "table-sim") => {
    setMode(m);
  };

  const handleFinish = (stats: TrainerStats, checkpoints: DrillCheckpoint[]) => {
    setFinalStats(stats);
    setFinalCheckpoints(checkpoints);
    setMode("results");
  };

  const handleRestart = () => {
    setFinalStats(null);
    setFinalCheckpoints([]);
    setMode("setup");
  };

  return (
    <div>
      {mode === "setup" && (
        <SetupScreen
          config={config}
          onConfigChange={setConfig}
          onStart={handleStart}
        />
      )}
      {mode === "speed-drill" && (
        <SpeedDrill config={config} onFinish={handleFinish} />
      )}
      {mode === "table-sim" && (
        <TableSim config={config} onFinish={handleFinish} />
      )}
      {mode === "results" && finalStats && (
        <ResultsScreen
          stats={finalStats}
          checkpoints={finalCheckpoints}
          config={config}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
