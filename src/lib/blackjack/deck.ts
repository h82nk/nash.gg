// Deck & shoe management for blackjack card counting trainer

import type { BJCard, BJRank, BJSuit, DeckCount } from "@/types/blackjack";

const ALL_SUITS: BJSuit[] = ["hearts", "diamonds", "clubs", "spades"];
const ALL_RANKS: BJRank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];

function createSingleDeck(deckIndex: number): BJCard[] {
  const cards: BJCard[] = [];
  for (const suit of ALL_SUITS) {
    for (const rank of ALL_RANKS) {
      cards.push({
        rank,
        suit,
        id: `${rank}${suit[0]}-${deckIndex}`,
      });
    }
  }
  return cards;
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createShoe(deckCount: DeckCount): BJCard[] {
  const cards: BJCard[] = [];
  for (let d = 0; d < deckCount; d++) {
    cards.push(...createSingleDeck(d));
  }
  return shuffle(cards);
}

export function getCardsRemaining(shoe: BJCard[], currentIndex: number): number {
  return shoe.length - currentIndex;
}

export function getTotalCards(deckCount: DeckCount): number {
  return deckCount * 52;
}

export function getPenetration(shoe: BJCard[], currentIndex: number): number {
  if (shoe.length === 0) return 0;
  return Math.round((currentIndex / shoe.length) * 100);
}
