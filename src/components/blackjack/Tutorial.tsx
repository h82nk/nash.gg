"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { BJCard, BJRank, BJSuit, CountingSystem } from "@/types/blackjack";
import { SUIT_SYMBOLS, RANK_DISPLAY } from "@/types/blackjack";
import { getCardValue, COUNTING_SYSTEMS } from "@/lib/blackjack/counting";
import { PlayingCard } from "./PlayingCard";
import { cn } from "@/lib/utils";

interface TutorialProps {
  system: CountingSystem;
  onComplete: () => void;
  onBack: () => void;
}

type TutorialStep =
  | "intro"
  | "learn-values"
  | "quiz-single"
  | "quiz-sequence"
  | "true-count"
  | "betting"
  | "complete";

const STEPS: { key: TutorialStep; label: string }[] = [
  { key: "intro", label: "Why Count?" },
  { key: "learn-values", label: "Card Values" },
  { key: "quiz-single", label: "Value Quiz" },
  { key: "quiz-sequence", label: "Count Quiz" },
  { key: "true-count", label: "True Count" },
  { key: "betting", label: "Bet Sizing" },
  { key: "complete", label: "Ready!" },
];

const ALL_SUITS: BJSuit[] = ["hearts", "diamonds", "clubs", "spades"];
const ALL_RANKS: BJRank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];

function randomCard(): BJCard {
  const rank = ALL_RANKS[Math.floor(Math.random() * ALL_RANKS.length)];
  const suit = ALL_SUITS[Math.floor(Math.random() * ALL_SUITS.length)];
  return { rank, suit, id: `${rank}${suit[0]}-${Date.now()}-${Math.random()}` };
}

function randomCards(n: number): BJCard[] {
  return Array.from({ length: n }, () => randomCard());
}

// ─────────────────────── Progress Bar ───────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-500",
            i < current ? "bg-primary" : i === current ? "bg-primary/50" : "bg-border"
          )}
        />
      ))}
    </div>
  );
}

// ─────────────────────── Step: Intro ───────────────────────
function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <h2 className="text-2xl font-bold">Why Count Cards?</h2>
      <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
        <p>
          In blackjack, cards already dealt <em>change the odds</em> of future hands.
          When many low cards have been played, the remaining shoe is rich in tens and aces —
          which favors the player with more blackjacks and better double-down outcomes.
        </p>
        <p>
          Card counting tracks this shift. By keeping a simple mental tally, you know
          when the deck favors you (bet more) and when it favors the house (bet less).
        </p>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-primary text-sm">
          It&apos;s not about memorizing every card. It&apos;s about tracking a single number
          that tells you when you have the edge.
        </div>
      </div>
      <button onClick={onNext} className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        Got it — teach me the values
      </button>
    </div>
  );
}

// ─────────────────────── Step: Learn Values ───────────────────────
function LearnValuesStep({
  system,
  onNext,
}: {
  system: CountingSystem;
  onNext: () => void;
}) {
  const sys = COUNTING_SYSTEMS[system];
  const groups = [
    { value: 1, label: "+1", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", desc: "Low cards — their removal helps you" },
    { value: 0, label: "0", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", desc: "Neutral — no effect on the count" },
    { value: -1, label: "-1", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", desc: "High cards — their removal hurts you" },
  ];

  // Include +2/-2 for multi-level systems
  if (Object.values(sys.values).some((v) => v === 2)) {
    groups.unshift({ value: 2, label: "+2", color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20", desc: "Extra valuable low cards" });
  }
  if (Object.values(sys.values).some((v) => v === -2)) {
    groups.push({ value: -2, label: "-2", color: "text-red-300", bg: "bg-red-500/10 border-red-500/20", desc: "Extra valuable high cards" });
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{sys.name} Card Values</h2>
        <p className="text-sm text-muted-foreground">
          Each card has a counting value. As cards are dealt, add each value to your running total.
        </p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => {
          const ranks = Object.entries(sys.values)
            .filter(([, v]) => v === group.value)
            .map(([r]) => r as BJRank);
          if (ranks.length === 0) return null;

          return (
            <div key={group.value} className={cn("rounded-xl border p-4", group.bg)}>
              <div className="flex items-center gap-3 mb-3">
                <span className={cn("text-2xl font-bold", group.color)}>{group.label}</span>
                <span className="text-xs text-muted-foreground">{group.desc}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ranks.map((rank) => (
                  <div key={rank} className="flex items-center gap-1">
                    <PlayingCard
                      card={{ rank, suit: "spades", id: `learn-${rank}` }}
                      size="sm"
                      animate={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <button onClick={onNext} className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Quiz me on these
        </button>
      </div>
    </div>
  );
}

// ─────────────────────── Step: Single Card Quiz ───────────────────────
function QuizSingleStep({
  system,
  onNext,
}: {
  system: CountingSystem;
  onNext: () => void;
}) {
  const [card, setCard] = useState<BJCard>(() => randomCard());
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [animate, setAnimate] = useState(true);

  const correctValue = getCardValue(card.rank, system);
  const isAnswered = selected !== null;
  const isCorrect = selected === correctValue;

  const sys = COUNTING_SYSTEMS[system];
  const uniqueValues = [...new Set(Object.values(sys.values))].sort((a, b) => b - a);

  const handleSelect = (value: number) => {
    if (isAnswered) return;
    setSelected(value);
    setScore((prev) => ({
      correct: prev.correct + (value === correctValue ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    setAnimate(false);
    setTimeout(() => {
      setCard(randomCard());
      setSelected(null);
      setAnimate(true);
    }, 50);
  };

  const canProceed = score.total >= 10 && score.correct / score.total >= 0.8;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Card Value Quiz</h2>
        <p className="text-sm text-muted-foreground">
          What&apos;s this card&apos;s counting value? Get 8 out of 10 right to continue.
        </p>
      </div>

      {/* Score */}
      <div className="flex justify-center gap-6 text-sm">
        <span>
          Score: <strong className="text-primary">{score.correct}/{score.total}</strong>
        </span>
        {score.total > 0 && (
          <span className="text-muted-foreground">
            {Math.round((score.correct / score.total) * 100)}%
          </span>
        )}
      </div>

      {/* Card */}
      <div className="flex justify-center py-4">
        <PlayingCard card={card} size="lg" animate={animate} />
      </div>

      {/* Choices */}
      <div className="flex justify-center gap-3">
        {uniqueValues.map((value) => {
          const isThis = value === correctValue;
          return (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              disabled={isAnswered}
              className={cn(
                "w-16 h-16 rounded-xl border-2 text-xl font-bold transition-all",
                !isAnswered && "hover:scale-105 cursor-pointer",
                isAnswered && isThis && "border-emerald-400 bg-emerald-500/20 text-emerald-300",
                isAnswered && !isThis && selected === value && "border-red-400 bg-red-500/20 text-red-300",
                isAnswered && !isThis && selected !== value && "border-border/50 text-muted-foreground/50",
                !isAnswered && "border-border hover:border-muted-foreground"
              )}
            >
              {value > 0 ? "+" : ""}{value}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div className="text-center space-y-3">
          <div className={cn(
            "text-sm font-medium",
            isCorrect ? "text-emerald-400" : "text-red-400"
          )}>
            {isCorrect
              ? "Correct!"
              : `Not quite — ${RANK_DISPLAY[card.rank]} is ${correctValue > 0 ? "+" : ""}${correctValue}`}
          </div>
          <button onClick={handleNext} className="rounded-lg bg-secondary px-6 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors">
            Next Card
          </button>
        </div>
      )}

      {canProceed && (
        <div className="text-center pt-2">
          <button onClick={onNext} className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            I&apos;ve got the values — try sequences
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────── Step: Sequence Quiz ───────────────────────
function QuizSequenceStep({
  system,
  onNext,
}: {
  system: CountingSystem;
  onNext: () => void;
}) {
  const [cards, setCards] = useState<BJCard[]>(() => randomCards(3));
  const [revealedCount, setRevealedCount] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<{ correct: boolean; actual: number } | null>(null);
  const [sequenceLen, setSequenceLen] = useState(3);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const actualCount = cards
    .slice(0, revealedCount)
    .reduce((sum, c) => sum + getCardValue(c.rank, system), 0);

  // Auto-reveal cards one at a time
  useEffect(() => {
    if (revealedCount < cards.length && result === null) {
      revealTimerRef.current = setTimeout(() => {
        setRevealedCount((prev) => prev + 1);
      }, 800);
      return () => {
        if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      };
    }
    if (revealedCount === cards.length && result === null) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [revealedCount, cards.length, result]);

  const handleSubmit = () => {
    const parsed = parseInt(userInput, 10);
    if (isNaN(parsed)) return;
    const correct = parsed === actualCount;
    setResult({ correct, actual: actualCount });
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    const newLen = score.correct > 0 && score.total > 0 && score.correct === score.total && sequenceLen < 7
      ? sequenceLen + 1
      : sequenceLen;
    setSequenceLen(newLen);
    setCards(randomCards(newLen));
    setRevealedCount(0);
    setUserInput("");
    setResult(null);
  };

  const canProceed = score.total >= 5 && score.correct / score.total >= 0.6;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Count the Sequence</h2>
        <p className="text-sm text-muted-foreground">
          Watch {sequenceLen} cards dealt, then give the running count.
          Add each card&apos;s value as it appears.
        </p>
      </div>

      <div className="flex justify-center gap-4 text-sm">
        <span>Score: <strong className="text-primary">{score.correct}/{score.total}</strong></span>
        <span className="text-muted-foreground">{sequenceLen} cards</span>
      </div>

      {/* Cards on felt */}
      <div className="bg-felt rounded-2xl p-6 min-h-[200px] flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {cards.map((card, i) => (
            <div key={card.id} className="relative">
              <PlayingCard
                card={card}
                size="lg"
                faceDown={i >= revealedCount}
                animate={i < revealedCount}
                dealDelay={0}
              />
              {/* Show count value badge after reveal when answered */}
              {result && i < revealedCount && (
                <div className={cn(
                  "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                  getCardValue(card.rank, system) > 0
                    ? "bg-emerald-500/90 border-emerald-400 text-white"
                    : getCardValue(card.rank, system) < 0
                      ? "bg-red-500/90 border-red-400 text-white"
                      : "bg-gray-500/90 border-gray-400 text-white"
                )}>
                  {getCardValue(card.rank, system) > 0 ? "+" : ""}
                  {getCardValue(card.rank, system)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Count trail after answered */}
        {result && (
          <div className="mt-4 flex items-center gap-1 text-sm font-mono text-white/60">
            {cards.map((card, i) => {
              const val = getCardValue(card.rank, system);
              return (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-white/30 mx-1">→</span>}
                  <span className={cn(
                    val > 0 ? "text-emerald-400" : val < 0 ? "text-red-400" : "text-gray-400"
                  )}>
                    {val > 0 ? "+" : ""}{val}
                  </span>
                </span>
              );
            })}
            <span className="text-white/30 mx-1">=</span>
            <span className="text-white font-bold">{actualCount}</span>
          </div>
        )}
      </div>

      {/* Input */}
      {revealedCount === cards.length && !result && (
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          className="flex justify-center gap-2"
        >
          <input
            ref={inputRef}
            type="number"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-24 rounded-lg bg-secondary border border-border px-4 py-2.5 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="0"
          />
          <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Check
          </button>
        </form>
      )}

      {/* Result */}
      {result && (
        <div className="text-center space-y-3">
          <div className={cn("text-sm font-medium", result.correct ? "text-emerald-400" : "text-red-400")}>
            {result.correct ? "Correct!" : `The count was ${result.actual > 0 ? "+" : ""}${result.actual}`}
          </div>
          <button onClick={handleNext} className="rounded-lg bg-secondary px-6 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors">
            Next Sequence
          </button>
        </div>
      )}

      {canProceed && (
        <div className="text-center pt-2">
          <button onClick={onNext} className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            I can count — what&apos;s next?
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────── Step: True Count ───────────────────────
function TrueCountStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <h2 className="text-2xl font-bold">The True Count</h2>
      <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
        <p>
          The <strong className="text-foreground">running count</strong> is your
          cumulative total. But a +5 running count in a 6-deck shoe doesn&apos;t mean the same
          as +5 in a single deck.
        </p>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-foreground font-mono text-lg mb-2">
            True Count = Running Count ÷ Decks Remaining
          </div>
          <p className="text-xs text-muted-foreground">
            This normalizes the count to a per-deck basis so you can make accurate betting decisions.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="rounded-lg bg-card border border-border p-3">
            <div className="font-mono text-sm mb-1">RC: +6, Decks: 3</div>
            <div className="text-primary font-bold">TC = +2</div>
          </div>
          <div className="rounded-lg bg-card border border-border p-3">
            <div className="font-mono text-sm mb-1">RC: +6, Decks: 1</div>
            <div className="text-primary font-bold">TC = +6</div>
          </div>
        </div>
        <p>
          The same running count of +6 is <em>three times more powerful</em> with fewer
          decks remaining. The true count tells you your real edge.
        </p>
      </div>
      <button onClick={onNext} className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        How do I use this for betting?
      </button>
    </div>
  );
}

// ─────────────────────── Step: Betting ───────────────────────
function BettingStep({ onNext }: { onNext: () => void }) {
  const bets = [
    { tc: "0 or less", mult: "1x (min)", color: "#6b6b80", desc: "House has the edge. Minimize losses." },
    { tc: "+1", mult: "2x", color: "#eab308", desc: "Slight edge. Small increase." },
    { tc: "+2", mult: "4x", color: "#22c55e", desc: "Good edge. Double up." },
    { tc: "+3", mult: "8x", color: "#00d4aa", desc: "Strong edge. Push hard." },
    { tc: "+4", mult: "12x", color: "#3b82f6", desc: "Very strong. Near maximum." },
    { tc: "+5+", mult: "Max bet", color: "#7c3aed", desc: "Maximum player advantage." },
  ];

  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <h2 className="text-2xl font-bold">GTO Bet Sizing</h2>
      <p className="text-sm text-muted-foreground">
        The true count directly maps to your optimal bet size. This is where your edge
        becomes profit.
      </p>

      <div className="space-y-2">
        {bets.map((b) => (
          <div key={b.tc} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <div className="w-16 text-center">
              <span className="text-xs text-muted-foreground">TC</span>
              <div className="font-bold" style={{ color: b.color }}>{b.tc}</div>
            </div>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(bets.indexOf(b) + 1) / bets.length * 100}%`, backgroundColor: b.color }}
              />
            </div>
            <div className="w-20 text-right">
              <div className="text-sm font-bold" style={{ color: b.color }}>{b.mult}</div>
              <div className="text-[10px] text-muted-foreground">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onNext} className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        I&apos;m ready to practice!
      </button>
    </div>
  );
}

// ─────────────────────── Step: Complete ───────────────────────
function CompleteStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <div className="text-5xl mb-2">&#9813;</div>
      <h2 className="text-2xl font-bold">You&apos;re Ready</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        You know the card values, you can keep a running count, you understand the
        true count, and you know how to size your bets. Now it&apos;s time to practice
        in a realistic setting.
      </p>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
        <strong>Recommended next step:</strong> Try the Playground mode. It deals cards
        with a live count overlay so you can watch the flow naturally and build speed
        without pressure.
      </div>
      <button onClick={onComplete} className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        Open Playground
      </button>
    </div>
  );
}

// ─────────────────────── Main Tutorial ───────────────────────
export function Tutorial({ system, onComplete, onBack }: TutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex].key;

  const goNext = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={stepIndex > 0 ? () => setStepIndex((p) => p - 1) : onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {stepIndex > 0 ? "Back" : "Menu"}
        </button>
        <span className="text-xs text-muted-foreground">
          {STEPS[stepIndex].label} ({stepIndex + 1}/{STEPS.length})
        </span>
      </div>

      <ProgressBar current={stepIndex} total={STEPS.length} />

      {step === "intro" && <IntroStep onNext={goNext} />}
      {step === "learn-values" && <LearnValuesStep system={system} onNext={goNext} />}
      {step === "quiz-single" && <QuizSingleStep system={system} onNext={goNext} />}
      {step === "quiz-sequence" && <QuizSequenceStep system={system} onNext={goNext} />}
      {step === "true-count" && <TrueCountStep onNext={goNext} />}
      {step === "betting" && <BettingStep onNext={goNext} />}
      {step === "complete" && <CompleteStep onComplete={onComplete} />}
    </div>
  );
}
