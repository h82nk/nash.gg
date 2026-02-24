"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BoardDisplay, HandDisplay } from "@/components/poker/CardDisplay";
import { GtoScoreRing, GtoClassificationBadge } from "@/components/poker/GtoScoreBadge";
import { parsePokerStarsHand } from "@/lib/parser/pokerstars";
import { analyzeHand } from "@/lib/solver/gto-scorer";
import type { HandHistory, HandAnalysis } from "@/types/poker";
import { cn } from "@/lib/utils";

const SAMPLE_HAND = `PokerStars Hand #216542870945:  Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 14:32:05 ET
Table 'Adhara IV' 6-max Seat #3 is the button
Seat 1: Player1 ($52.50 in chips)
Seat 2: Player2 ($48.75 in chips)
Seat 3: Hero ($50.00 in chips)
Seat 4: Player4 ($55.25 in chips)
Seat 5: Player5 ($47.00 in chips)
Seat 6: Player6 ($51.50 in chips)
Player4: posts small blind $0.25
Player5: posts big blind $0.50
*** HOLE CARDS ***
Dealt to Hero [As Kh]
Player6: folds
Player1: folds
Player2: raises $1.25 to $1.25
Hero: raises $3.75 to $3.75
Player4: folds
Player5: folds
Player2: calls $2.50
*** FLOP *** [Kd 7s 3c]
Player2: checks
Hero: bets $3.00
Player2: calls $3.00
*** TURN *** [Kd 7s 3c] [Jh]
Player2: checks
Hero: bets $7.50
Player2: folds
Uncalled bet ($7.50) returned to Hero
Hero collected $13.75 from pot
*** SUMMARY ***
Total pot $14.25 | Rake $0.50
Board [Kd 7s 3c Jh]`;

export default function AnalyzePage() {
  const [inputText, setInputText] = useState(SAMPLE_HAND);
  const [parsedHand, setParsedHand] = useState<HandHistory | null>(null);
  const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "result">("input");

  function handleAnalyze() {
    try {
      const hand = parsePokerStarsHand(inputText);
      setParsedHand(hand);
      const result = analyzeHand(hand);
      setAnalysis(result);
      setActiveTab("result");
    } catch (e) {
      console.error("Parse error:", e);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Hand Analyzer</h1>
            <p className="text-muted-foreground">
              Paste your hand history and get an instant GTO accuracy score with
              detailed action-by-action analysis.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-lg bg-secondary/50 border border-border w-fit">
            <button
              onClick={() => setActiveTab("input")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === "input"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab("result")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === "result"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                !analysis && "opacity-50 cursor-not-allowed"
              )}
              disabled={!analysis}
            >
              Analysis
            </button>
          </div>

          {activeTab === "input" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hand History (PokerStars format)
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-96 rounded-xl border border-border bg-card p-4 font-mono text-xs text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Paste your PokerStars hand history here..."
                />
                <button
                  onClick={handleAnalyze}
                  className="mt-4 w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all glow-primary"
                >
                  Analyze Hand
                </button>
              </div>

              <div className="rounded-xl border border-border bg-card/50 p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Supported Formats
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      name: "PokerStars",
                      status: "Supported",
                      active: true,
                    },
                    {
                      name: "GGPoker",
                      status: "Coming Soon",
                      active: false,
                    },
                    {
                      name: "WPN / ACR",
                      status: "Coming Soon",
                      active: false,
                    },
                    {
                      name: "888poker",
                      status: "Coming Soon",
                      active: false,
                    },
                  ].map((format) => (
                    <div
                      key={format.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <span className="text-sm font-medium">
                        {format.name}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          format.active
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {format.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <h4 className="text-sm font-medium text-accent-foreground mb-1">
                    Pro Tip
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    You can find your PokerStars hand histories in the
                    HandHistory folder. On Windows:{" "}
                    <code className="text-xs bg-secondary px-1 py-0.5 rounded">
                      C:\Users\You\AppData\Local\PokerStars\HandHistory
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "result" && parsedHand && analysis && (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-6">
                  <GtoScoreRing score={analysis.gtoScore} size="lg" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      GTO Accuracy
                    </div>
                    <GtoClassificationBadge
                      classification={analysis.overallClassification}
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Total EV Loss: {analysis.totalEvLoss.toFixed(2)}% of pot
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="text-sm text-muted-foreground mb-3">
                    Hand Info
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stakes</span>
                      <span className="font-mono">
                        ${parsedHand.stakes.smallBlind}/$
                        {parsedHand.stakes.bigBlind}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Position</span>
                      <span className="font-mono">
                        {parsedHand.heroPosition}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pot Size</span>
                      <span className="font-mono">
                        ${parsedHand.potSize.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="text-sm text-muted-foreground mb-3">
                    Cards
                  </div>
                  {parsedHand.players.find((p) => p.isHero)?.holeCards && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Your Hand
                      </div>
                      <HandDisplay
                        cards={
                          parsedHand.players.find((p) => p.isHero)!.holeCards!
                        }
                        size="lg"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Board
                    </div>
                    <BoardDisplay
                      flop={parsedHand.communityCards.flop}
                      turn={parsedHand.communityCards.turn}
                      river={parsedHand.communityCards.river}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-medium mb-2">AI Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.summaryExplanation}
                </p>
              </div>

              {/* Action Timeline */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-medium mb-4">
                  Action-by-Action Analysis
                </h3>
                <div className="space-y-3">
                  {analysis.evaluations.map((evaluation, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <GtoClassificationBadge
                          classification={evaluation.classification}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground uppercase">
                            {evaluation.street}
                          </span>
                          <span className="text-sm font-medium">
                            {evaluation.action.action}
                            {evaluation.action.amount
                              ? ` $${evaluation.action.amount.toFixed(2)}`
                              : ""}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {evaluation.explanation}
                        </p>
                        {evaluation.evLossPercent > 0 && (
                          <div className="mt-1 text-xs text-red-400 font-mono">
                            EV Loss: {evaluation.evLossPercent.toFixed(1)}% of
                            pot ({evaluation.evLoss.toFixed(2)} bb)
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab("input")}
                className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
              >
                Analyze Another Hand
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
