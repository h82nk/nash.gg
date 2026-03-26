// Blackjack Card Counting Trainer - Type Definitions

export type BJSuit = "hearts" | "diamonds" | "clubs" | "spades";
export type BJRank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K";

export interface BJCard {
  rank: BJRank;
  suit: BJSuit;
  id: string; // unique per card in shoe (e.g., "3h-2" for 2nd 3 of hearts)
}

export type CountingSystem = "hi-lo" | "ko" | "hi-opt-i" | "hi-opt-ii";

export interface CountingSystemDef {
  name: string;
  shortName: string;
  description: string;
  balanced: boolean;
  values: Record<BJRank, number>;
}

export type DeckCount = 1 | 2 | 6 | 8;
export type DealSpeed = "slow" | "medium" | "fast" | "turbo";
export type TrainerMode = "setup" | "speed-drill" | "table-sim" | "results";

export interface DrillCheckpoint {
  cardIndex: number;
  userCount: number | null;
  actualCount: number;
  isCorrect: boolean;
  timeTakenMs: number;
}

export interface TrainerStats {
  totalCheckpoints: number;
  correctCheckpoints: number;
  accuracy: number;
  avgResponseTimeMs: number;
  bestStreak: number;
  currentStreak: number;
  cardsDealt: number;
  cardsPerMinute: number;
}

export type BurstCount = 1 | 2 | 3;

export interface TrainerConfig {
  system: CountingSystem;
  deckCount: DeckCount;
  speed: DealSpeed;
  checkpointInterval: number; // check count every N cards
  burstCount: BurstCount; // cards dealt per beat (1 = normal, 2-3 = multi-hand)
}

export const DEAL_SPEED_MS: Record<DealSpeed, number> = {
  slow: 1500,
  medium: 900,
  fast: 500,
  turbo: 250,
};

export const SUIT_SYMBOLS: Record<BJSuit, string> = {
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
  spades: "\u2660",
};

export const SUIT_DISPLAY: Record<BJSuit, { color: string; bgClass: string }> = {
  hearts: { color: "#ef4444", bgClass: "text-red-500" },
  diamonds: { color: "#ef4444", bgClass: "text-red-500" },
  clubs: { color: "#1a1a2e", bgClass: "text-gray-900" },
  spades: { color: "#1a1a2e", bgClass: "text-gray-900" },
};

export const RANK_DISPLAY: Record<BJRank, string> = {
  A: "A",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  T: "10",
  J: "J",
  Q: "Q",
  K: "K",
};
