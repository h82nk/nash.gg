// Card counting systems - mathematically optimal definitions

import type { BJRank, CountingSystem, CountingSystemDef } from "@/types/blackjack";

export const COUNTING_SYSTEMS: Record<CountingSystem, CountingSystemDef> = {
  "hi-lo": {
    name: "Hi-Lo",
    shortName: "Hi-Lo",
    description: "The most popular balanced counting system. Perfect for beginners and pros alike.",
    balanced: true,
    values: {
      "2": 1, "3": 1, "4": 1, "5": 1, "6": 1,
      "7": 0, "8": 0, "9": 0,
      T: -1, J: -1, Q: -1, K: -1, A: -1,
    },
  },
  ko: {
    name: "Knock-Out",
    shortName: "KO",
    description: "An unbalanced system — no true count conversion needed. Great for beginners.",
    balanced: false,
    values: {
      "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1,
      "8": 0, "9": 0,
      T: -1, J: -1, Q: -1, K: -1, A: -1,
    },
  },
  "hi-opt-i": {
    name: "Hi-Opt I",
    shortName: "Hi-Opt I",
    description: "A balanced single-level system with higher accuracy than Hi-Lo. Intermediate level.",
    balanced: true,
    values: {
      "2": 0, "3": 1, "4": 1, "5": 1, "6": 1,
      "7": 0, "8": 0, "9": 0,
      T: -1, J: -1, Q: -1, K: -1, A: 0,
    },
  },
  "hi-opt-ii": {
    name: "Hi-Opt II",
    shortName: "Hi-Opt II",
    description: "A multi-level balanced system offering the highest accuracy. Advanced players only.",
    balanced: true,
    values: {
      "2": 1, "3": 1, "4": 2, "5": 2, "6": 1,
      "7": 1, "8": 0, "9": 0,
      T: -2, J: -2, Q: -2, K: -2, A: 0,
    },
  },
};

export function getCardValue(rank: BJRank, system: CountingSystem): number {
  return COUNTING_SYSTEMS[system].values[rank];
}

export function getRunningCount(ranks: BJRank[], system: CountingSystem): number {
  return ranks.reduce((sum, rank) => sum + getCardValue(rank, system), 0);
}

export function getTrueCount(
  runningCount: number,
  cardsRemaining: number,
  cardsPerDeck: number = 52
): number {
  const decksRemaining = cardsRemaining / cardsPerDeck;
  if (decksRemaining <= 0) return runningCount;
  return Math.round((runningCount / decksRemaining) * 10) / 10;
}

export function getBettingAdvice(trueCount: number): {
  multiplier: number;
  label: string;
  description: string;
  color: string;
} {
  if (trueCount <= 0) {
    return {
      multiplier: 1,
      label: "Minimum",
      description: "House has the edge. Bet the table minimum.",
      color: "#6b6b80",
    };
  }
  if (trueCount <= 1) {
    return {
      multiplier: 2,
      label: "2x",
      description: "Slight player edge. Double your minimum bet.",
      color: "#eab308",
    };
  }
  if (trueCount <= 2) {
    return {
      multiplier: 4,
      label: "4x",
      description: "Good player edge. Increase to 4x minimum.",
      color: "#22c55e",
    };
  }
  if (trueCount <= 3) {
    return {
      multiplier: 8,
      label: "8x",
      description: "Strong edge. Ramp to 8x minimum.",
      color: "#00d4aa",
    };
  }
  if (trueCount <= 4) {
    return {
      multiplier: 12,
      label: "12x",
      description: "Very strong edge. Push to 12x minimum.",
      color: "#3b82f6",
    };
  }
  return {
    multiplier: 16,
    label: "Max Bet",
    description: "Maximum player advantage. Bet the max!",
    color: "#7c3aed",
  };
}
