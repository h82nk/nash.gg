// Core poker type definitions for Nash.gg

export type Suit = "h" | "d" | "c" | "s";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K" | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type Street = "preflop" | "flop" | "turn" | "river";

export type ActionType =
  | "fold"
  | "check"
  | "call"
  | "bet"
  | "raise"
  | "all-in";

export type Position = "UTG" | "UTG+1" | "MP" | "MP+1" | "HJ" | "CO" | "BTN" | "SB" | "BB";

export interface PlayerAction {
  player: string;
  position: Position;
  action: ActionType;
  amount?: number;
  street: Street;
  isHero: boolean;
}

export interface Player {
  name: string;
  position: Position;
  stack: number;
  holeCards?: [Card, Card];
  isHero: boolean;
}

export interface HandHistory {
  id: string;
  site: string;
  gameType: "NL Hold'em" | "PL Omaha" | "NL Omaha";
  stakes: { smallBlind: number; bigBlind: number; ante?: number };
  tableName: string;
  maxSeats: number;
  timestamp: Date;
  players: Player[];
  communityCards: {
    flop?: [Card, Card, Card];
    turn?: Card;
    river?: Card;
  };
  actions: PlayerAction[];
  potSize: number;
  rake: number;
  winners: { player: string; amount: number }[];
  heroPosition: Position;
}

// GTO Analysis Types
export type GTOClassification =
  | "best"
  | "correct"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export interface ActionEvaluation {
  street: Street;
  action: PlayerAction;
  classification: GTOClassification;
  evLoss: number; // in big blinds
  evLossPercent: number; // as % of pot
  optimalAction: ActionType;
  optimalFrequency: number; // 0-1 probability
  explanation: string;
}

export interface HandAnalysis {
  handId: string;
  gtoScore: number; // 0-100
  overallClassification: GTOClassification;
  evaluations: ActionEvaluation[];
  totalEvLoss: number;
  summaryExplanation: string;
}

// Session tracking
export interface Session {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  venue: string;
  gameType: string;
  stakes: string;
  buyIn: number;
  cashOut?: number;
  netProfit: number;
  handsPlayed: number;
  avgGtoScore: number;
  bb100: number; // bb/100 win rate
}

// Player stats (HUD-style)
export interface PlayerStats {
  vpip: number; // Voluntarily Put $ In Pot
  pfr: number; // Pre-Flop Raise %
  aggFreq: number; // Aggression Frequency
  threeBet: number; // 3-Bet %
  wtsd: number; // Went to Showdown %
  cbet: number; // Continuation Bet %
  foldToCbet: number;
  handsPlayed: number;
}

// Range matrix (13x13 grid)
export type RangeFrequency = number; // 0-1

export interface RangeMatrix {
  // Indexed by "AsKs", "AKo", "AA", etc.
  [combo: string]: {
    raise: RangeFrequency;
    call: RangeFrequency;
    fold: RangeFrequency;
    ev: number;
  };
}

// Famous hands / puzzles
export interface FamousHand {
  id: string;
  title: string;
  event: string;
  year: number;
  players: string[];
  description: string;
  hand: HandHistory;
  decisionPoint: {
    street: Street;
    actionIndex: number; // which action to decide on
    options: ActionType[];
  };
  proMove: ActionType;
  gtoMove: ActionType;
  difficulty: "beginner" | "intermediate" | "advanced" | "legendary";
  imageUrl?: string;
}

export interface PuzzleResult {
  userMove: ActionType;
  proMove: ActionType;
  gtoMove: ActionType;
  matchesPro: boolean;
  matchesGTO: boolean;
  evDifference: number;
  explanation: string;
}

// Utility functions
export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function parseCard(str: string): Card {
  return {
    rank: str[0] as Rank,
    suit: str[1] as Suit,
  };
}

export function suitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    h: "\u2665",
    d: "\u2666",
    c: "\u2663",
    s: "\u2660",
  };
  return symbols[suit];
}

export function suitColor(suit: Suit): string {
  return suit === "h" || suit === "d" ? "text-red-500" : "text-white";
}

export const RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

export const POSITIONS: Position[] = ["UTG", "UTG+1", "MP", "MP+1", "HJ", "CO", "BTN", "SB", "BB"];
