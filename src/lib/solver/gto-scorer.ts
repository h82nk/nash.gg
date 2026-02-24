import type {
  ActionType,
  HandHistory,
  HandAnalysis,
  ActionEvaluation,
  GTOClassification,
  PlayerAction,
} from "@/types/poker";

/**
 * GTO Accuracy Scoring Engine
 *
 * Evaluates player actions against precomputed GTO solutions and assigns
 * a normalized 0-100 accuracy score. This is a heuristic engine for the MVP -
 * it uses simplified strategy approximations. A full CFR solver integration
 * will replace this in production.
 */

// Simplified preflop opening ranges by position (approximation)
// In production, these come from precomputed solver databases
const PREFLOP_OPEN_RANGES: Record<string, Set<string>> = {
  UTG: new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88",
    "AKs", "AQs", "AJs", "ATs", "KQs", "KJs",
    "AKo", "AQo",
  ]),
  MP: new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77",
    "AKs", "AQs", "AJs", "ATs", "A9s", "KQs", "KJs", "KTs", "QJs",
    "AKo", "AQo", "AJo",
  ]),
  CO: new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s",
    "KQs", "KJs", "KTs", "K9s", "QJs", "QTs", "JTs", "T9s", "98s",
    "AKo", "AQo", "AJo", "ATo", "KQo", "KJo",
  ]),
  BTN: new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "KQs", "KJs", "KTs", "K9s", "K8s", "K7s",
    "QJs", "QTs", "Q9s", "JTs", "J9s", "T9s", "98s", "87s", "76s", "65s",
    "AKo", "AQo", "AJo", "ATo", "A9o",
    "KQo", "KJo", "KTo", "QJo", "QTo", "JTo",
  ]),
  SB: new Set([
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s",
    "KQs", "KJs", "KTs", "K9s", "QJs", "QTs", "JTs", "T9s", "98s",
    "AKo", "AQo", "AJo", "ATo", "KQo", "KJo",
  ]),
};

function getHandCombo(cards: [{ rank: string; suit: string }, { rank: string; suit: string }]): string {
  const [c1, c2] = cards;
  const r1 = c1.rank;
  const r2 = c2.rank;

  if (r1 === r2) return `${r1}${r2}`;

  const rankOrder = "AKQJT98765432";
  const higher = rankOrder.indexOf(r1) < rankOrder.indexOf(r2) ? r1 : r2;
  const lower = higher === r1 ? r2 : r1;
  const suited = c1.suit === c2.suit ? "s" : "o";

  return `${higher}${lower}${suited}`;
}

function classifyEvLoss(evLossPercent: number): GTOClassification {
  if (evLossPercent <= 0.5) return "best";
  if (evLossPercent <= 2) return "correct";
  if (evLossPercent <= 8) return "inaccuracy";
  if (evLossPercent <= 20) return "mistake";
  return "blunder";
}

function classificationToScore(classification: GTOClassification): number {
  switch (classification) {
    case "best": return 100;
    case "correct": return 85;
    case "inaccuracy": return 65;
    case "mistake": return 40;
    case "blunder": return 10;
  }
}

function evaluatePreflopAction(
  action: PlayerAction,
  hand: HandHistory
): ActionEvaluation {
  const hero = hand.players.find((p) => p.isHero);
  if (!hero?.holeCards) {
    return {
      street: "preflop",
      action,
      classification: "correct",
      evLoss: 0,
      evLossPercent: 0,
      optimalAction: action.action,
      optimalFrequency: 1,
      explanation: "Unable to evaluate without hole cards.",
    };
  }

  const combo = getHandCombo(hero.holeCards);
  const position = hero.position;
  const openRange = PREFLOP_OPEN_RANGES[position] || PREFLOP_OPEN_RANGES["CO"];

  // Check if this is an opening spot (no raises before us)
  const priorActions = hand.actions.filter(
    (a) => a.street === "preflop" && !a.isHero
  );
  const hasRaiseBefore = priorActions.some(
    (a) => a.action === "raise" || a.action === "bet"
  );
  const isInRange = openRange.has(combo);

  let classification: GTOClassification;
  let evLoss = 0;
  let evLossPercent = 0;
  let optimalAction: ActionType;
  let explanation: string;

  if (!hasRaiseBefore) {
    // Opening spot
    if (isInRange) {
      optimalAction = "raise";
      if (action.action === "raise" || action.action === "bet") {
        classification = "best";
        explanation = `${combo} is a standard open from ${position}. Well played.`;
      } else if (action.action === "call") {
        classification = "inaccuracy";
        evLoss = 0.5;
        evLossPercent = 5;
        explanation = `${combo} should be raised, not limped, from ${position}. Raising captures dead money and builds the pot with a strong hand.`;
      } else {
        classification = "blunder";
        evLoss = 2;
        evLossPercent = 25;
        explanation = `Folding ${combo} from ${position} is a significant error. This hand has enough equity to open profitably.`;
      }
    } else {
      optimalAction = "fold";
      if (action.action === "fold") {
        classification = "best";
        explanation = `${combo} is correctly folded from ${position}. It's outside the standard opening range.`;
      } else if (action.action === "raise" || action.action === "bet") {
        classification = "inaccuracy";
        evLoss = 0.3;
        evLossPercent = 4;
        explanation = `${combo} is a marginal open from ${position}. Tighter is generally more profitable.`;
      } else {
        classification = "mistake";
        evLoss = 0.5;
        evLossPercent = 8;
        explanation = `Limping ${combo} from ${position} is suboptimal. Either raise or fold.`;
      }
    }
  } else {
    // Facing a raise
    optimalAction = isInRange ? "call" : "fold";
    if (isInRange && (action.action === "call" || action.action === "raise")) {
      classification = "correct";
      evLoss = 0;
      evLossPercent = 0;
      explanation = `Continuing with ${combo} facing a raise is standard.`;
    } else if (!isInRange && action.action === "fold") {
      classification = "best";
      explanation = `Folding ${combo} to a raise is the correct play.`;
    } else {
      classification = "inaccuracy";
      evLoss = 0.5;
      evLossPercent = 5;
      explanation = `This action deviates from the equilibrium strategy for ${combo} facing a raise.`;
    }
  }

  return {
    street: "preflop",
    action,
    classification,
    evLoss,
    evLossPercent,
    optimalAction,
    optimalFrequency: 0.8,
    explanation,
  };
}

function evaluatePostflopAction(
  action: PlayerAction,
  hand: HandHistory
): ActionEvaluation {
  // Simplified heuristic for MVP
  // In production, this queries the precomputed solver database

  const isAggressive = action.action === "bet" || action.action === "raise";
  const isPassive = action.action === "check" || action.action === "call";

  // Simple heuristic: aggressive actions on dry boards and passive on wet boards
  // This is a placeholder - real evaluation needs solver output
  const classification: GTOClassification = "correct";
  const evLoss = 0;
  const evLossPercent = 0;

  return {
    street: action.street,
    action,
    classification,
    evLoss,
    evLossPercent,
    optimalAction: action.action,
    optimalFrequency: 0.5,
    explanation: `Post-flop action evaluated. Detailed solver analysis available in full version.`,
  };
}

/**
 * Analyze a complete hand history and produce a GTO accuracy score.
 */
export function analyzeHand(hand: HandHistory): HandAnalysis {
  const heroActions = hand.actions.filter((a) => a.isHero);

  const evaluations: ActionEvaluation[] = heroActions.map((action) => {
    if (action.street === "preflop") {
      return evaluatePreflopAction(action, hand);
    }
    return evaluatePostflopAction(action, hand);
  });

  // Calculate overall GTO score
  const totalEvLoss = evaluations.reduce((sum, e) => sum + e.evLossPercent, 0);
  const avgScore =
    evaluations.length > 0
      ? evaluations.reduce(
          (sum, e) => sum + classificationToScore(e.classification),
          0
        ) / evaluations.length
      : 100;

  const gtoScore = Math.max(0, Math.min(100, Math.round(avgScore)));

  let overallClassification: GTOClassification;
  if (gtoScore >= 90) overallClassification = "best";
  else if (gtoScore >= 75) overallClassification = "correct";
  else if (gtoScore >= 55) overallClassification = "inaccuracy";
  else if (gtoScore >= 35) overallClassification = "mistake";
  else overallClassification = "blunder";

  const summaryExplanation = generateSummary(evaluations, gtoScore);

  return {
    handId: hand.id,
    gtoScore,
    overallClassification,
    evaluations,
    totalEvLoss,
    summaryExplanation,
  };
}

function generateSummary(
  evaluations: ActionEvaluation[],
  score: number
): string {
  const blunders = evaluations.filter((e) => e.classification === "blunder").length;
  const mistakes = evaluations.filter((e) => e.classification === "mistake").length;
  const best = evaluations.filter((e) => e.classification === "best").length;

  if (score >= 90) {
    return `Excellent play. ${best} out of ${evaluations.length} actions were optimal. Your decisions closely followed GTO strategy.`;
  }
  if (score >= 75) {
    return `Solid play overall. Minor deviations detected but no critical errors. Focus on the highlighted inaccuracies to tighten your game.`;
  }
  if (score >= 55) {
    return `Room for improvement. ${mistakes} mistake(s) detected. Review the highlighted spots to understand the optimal frequencies.`;
  }
  return `Significant leaks detected. ${blunders} blunder(s) and ${mistakes} mistake(s) found. These spots represent the largest areas for EV improvement.`;
}
