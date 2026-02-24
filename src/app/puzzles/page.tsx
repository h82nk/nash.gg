"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { BoardDisplay, HandDisplay } from "@/components/poker/CardDisplay";
import { GtoClassificationBadge } from "@/components/poker/GtoScoreBadge";
import { FAMOUS_HANDS } from "@/lib/data/famous-hands";
import type { FamousHand, ActionType, PuzzleResult } from "@/types/poker";
import { cn } from "@/lib/utils";

function DifficultyBadge({ difficulty }: { difficulty: FamousHand["difficulty"] }) {
  const colors = {
    beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    intermediate: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    advanced: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    legendary: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        colors[difficulty]
      )}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

function PuzzleCard({
  hand,
  onSelect,
}: {
  hand: FamousHand;
  onSelect: (hand: FamousHand) => void;
}) {
  return (
    <button
      onClick={() => onSelect(hand)}
      className="group text-left rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:bg-card/80 transition-all w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <DifficultyBadge difficulty={hand.difficulty} />
        <span className="text-xs text-muted-foreground">{hand.year}</span>
      </div>
      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
        {hand.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">{hand.event}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {hand.description}
      </p>
      <div className="mt-4 flex items-center gap-2">
        {hand.players.map((player) => (
          <span
            key={player}
            className="text-xs px-2 py-1 rounded-full bg-secondary border border-border/50"
          >
            {player}
          </span>
        ))}
      </div>
    </button>
  );
}

function PuzzleGame({
  hand,
  onBack,
}: {
  hand: FamousHand;
  onBack: () => void;
}) {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [result, setResult] = useState<PuzzleResult | null>(null);

  function handleAction(action: ActionType) {
    setSelectedAction(action);

    const matchesPro = action === hand.proMove;
    const matchesGTO = action === hand.gtoMove;

    let explanation = "";
    if (matchesPro && matchesGTO) {
      explanation = `Perfect. You made the same play as the pro AND it aligns with GTO. This is the mathematically correct decision in this spot.`;
    } else if (matchesGTO) {
      explanation = `You chose the GTO-optimal play, even though the pro went a different route. The solver confirms your decision maximizes expected value.`;
    } else if (matchesPro) {
      explanation = `You matched the pro's play! While GTO suggests a different line, the pro's exploitative read was spot-on in this specific situation.`;
    } else {
      explanation = `Neither the pro nor GTO agrees with this line. The optimal play here was to ${hand.gtoMove}. Review the board texture and ranges to understand why.`;
    }

    setResult({
      userMove: action,
      proMove: hand.proMove,
      gtoMove: hand.gtoMove,
      matchesPro,
      matchesGTO,
      evDifference: matchesGTO ? 0 : -2.5,
      explanation,
    });
  }

  const hero = hand.hand.players.find((p) => p.isHero);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
        Back to Puzzles
      </button>

      {/* Puzzle Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <DifficultyBadge difficulty={hand.difficulty} />
            <h2 className="text-2xl font-bold mt-2">{hand.title}</h2>
            <p className="text-sm text-muted-foreground">
              {hand.event} ({hand.year})
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {hand.description}
        </p>
      </div>

      {/* Game State */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            The Situation
          </h3>

          {hero?.holeCards && (
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-1">
                Your Hand ({hero.position})
              </div>
              <HandDisplay cards={hero.holeCards} size="lg" />
            </div>
          )}

          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-1">Board</div>
            <BoardDisplay
              flop={hand.hand.communityCards.flop}
              turn={hand.hand.communityCards.turn}
              river={hand.hand.communityCards.river}
              size="lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">Pot</span>
              <div className="font-mono font-bold">
                ${hand.hand.potSize.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">Stack</span>
              <div className="font-mono font-bold">
                ${hero?.stack.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action History */}
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">
              Action So Far
            </div>
            <div className="space-y-1">
              {hand.hand.actions.map((action, i) => (
                <div
                  key={i}
                  className="text-xs font-mono text-muted-foreground"
                >
                  <span className="text-foreground/70">{action.position}</span>{" "}
                  {action.action}
                  {action.amount
                    ? ` $${action.amount.toLocaleString()}`
                    : ""}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decision Area */}
        <div className="rounded-xl border border-border bg-card p-6">
          {!result ? (
            <>
              <h3 className="text-lg font-bold mb-2">Your Decision</h3>
              <p className="text-sm text-muted-foreground mb-6">
                It&apos;s the {hand.decisionPoint.street}. What do you do?
              </p>
              <div className="space-y-3">
                {hand.decisionPoint.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAction(option)}
                    className="w-full p-4 rounded-lg border border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all text-left"
                  >
                    <span className="text-lg font-semibold capitalize">
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold mb-4">Results</h3>

              <div className="space-y-4">
                {/* Your move */}
                <div
                  className={cn(
                    "p-4 rounded-lg border",
                    result.matchesGTO
                      ? "border-[var(--gto-best)]/30 bg-[var(--gto-best)]/5"
                      : result.matchesPro
                        ? "border-[var(--gto-correct)]/30 bg-[var(--gto-correct)]/5"
                        : "border-[var(--gto-blunder)]/30 bg-[var(--gto-blunder)]/5"
                  )}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    Your Move
                  </div>
                  <div className="text-lg font-bold capitalize">
                    {result.userMove}
                  </div>
                </div>

                {/* Pro move */}
                <div className="p-4 rounded-lg border border-accent/30 bg-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">
                    The Pro&apos;s Move
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold capitalize">
                      {result.proMove}
                    </span>
                    {result.matchesPro && (
                      <span className="text-xs text-accent px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10">
                        Match!
                      </span>
                    )}
                  </div>
                </div>

                {/* GTO move */}
                <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="text-xs text-muted-foreground mb-1">
                    GTO Optimal
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold capitalize">
                      {result.gtoMove}
                    </span>
                    {result.matchesGTO && (
                      <span className="text-xs text-primary px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10">
                        Match!
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">
                    Analysis
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedAction(null);
                    setResult(null);
                  }}
                  className="w-full rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PuzzlesPage() {
  const [selectedHand, setSelectedHand] = useState<FamousHand | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="mx-auto max-w-6xl">
          {selectedHand ? (
            <PuzzleGame
              hand={selectedHand}
              onBack={() => setSelectedHand(null)}
            />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  Relive the Legend
                </h1>
                <p className="text-muted-foreground">
                  Step into iconic poker moments. Make your decision, then see
                  how you compare against the pros and GTO.
                </p>
              </div>

              {/* Difficulty Filter */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {["all", "beginner", "intermediate", "advanced", "legendary"].map(
                  (diff) => (
                    <button
                      key={diff}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-secondary/50 hover:border-primary/30 transition-colors capitalize"
                    >
                      {diff}
                    </button>
                  )
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {FAMOUS_HANDS.map((hand) => (
                  <PuzzleCard
                    key={hand.id}
                    hand={hand}
                    onSelect={setSelectedHand}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
