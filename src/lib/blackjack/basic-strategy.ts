// Basic strategy + Illustrious 18 count-based deviations
// Standard 6-deck, dealer stands on soft 17 (S17)

import type { BJRank } from "@/types/blackjack";

export type BJAction = "hit" | "stand" | "double" | "split" | "surrender";

export interface StrategyDeviation {
  name: string;
  playerDesc: string;
  dealerUpcard: string;
  basicPlay: BJAction;
  deviationPlay: BJAction;
  trueCountThreshold: number;
  direction: "above" | "below";
  explanation: string;
}

// The Illustrious 18 — the most profitable count-based deviations
export const ILLUSTRIOUS_18: StrategyDeviation[] = [
  {
    name: "Insurance",
    playerDesc: "Any hand",
    dealerUpcard: "A",
    basicPlay: "hit",
    deviationPlay: "stand",
    trueCountThreshold: 3,
    direction: "above",
    explanation:
      "Insurance is normally a sucker bet. But at TC +3, the density of tens in the shoe makes it profitable — the odds of dealer blackjack exceed the 2:1 payout threshold.",
  },
  {
    name: "16 vs 10",
    playerDesc: "Hard 16",
    dealerUpcard: "10",
    basicPlay: "hit",
    deviationPlay: "stand",
    trueCountThreshold: 0,
    direction: "above",
    explanation:
      "The most important deviation. At TC 0 or above, the extra tens in the shoe make hitting too dangerous — you'll bust more often, and the dealer's ten is more likely to have a stiff hand underneath.",
  },
  {
    name: "15 vs 10",
    playerDesc: "Hard 15",
    dealerUpcard: "10",
    basicPlay: "hit",
    deviationPlay: "stand",
    trueCountThreshold: 4,
    direction: "above",
    explanation:
      "Similar logic to 16 vs 10, but requires a higher count because 15 is slightly worse. At TC +4, the shoe is rich enough in tens to make standing the better play.",
  },
  {
    name: "10,10 vs 5",
    playerDesc: "Pair of 10s",
    dealerUpcard: "5",
    basicPlay: "stand",
    deviationPlay: "split",
    trueCountThreshold: 5,
    direction: "above",
    explanation:
      "Splitting twenties is normally insane. But at TC +5 against a weak 5, each new hand is likely to draw a ten, and the dealer is very likely to bust.",
  },
  {
    name: "10,10 vs 6",
    playerDesc: "Pair of 10s",
    dealerUpcard: "6",
    basicPlay: "stand",
    deviationPlay: "split",
    trueCountThreshold: 4,
    direction: "above",
    explanation:
      "At TC +4, splitting twenties against dealer 6 becomes profitable. The dealer's bust probability skyrockets with a ten-rich shoe.",
  },
  {
    name: "10 vs 10",
    playerDesc: "Hard 10",
    dealerUpcard: "10",
    basicPlay: "hit",
    deviationPlay: "double",
    trueCountThreshold: 4,
    direction: "above",
    explanation:
      "Doubling 10 vs dealer 10 is normally too risky. But at TC +4, you're very likely to draw a ten for 20, and the double payout makes it worthwhile.",
  },
  {
    name: "12 vs 3",
    playerDesc: "Hard 12",
    dealerUpcard: "3",
    basicPlay: "hit",
    deviationPlay: "stand",
    trueCountThreshold: 2,
    direction: "above",
    explanation:
      "At TC +2, the ten-rich shoe makes hitting 12 more dangerous (higher bust rate), and the dealer's 3 is more likely to lead to a bust with a stiff total.",
  },
  {
    name: "12 vs 2",
    playerDesc: "Hard 12",
    dealerUpcard: "2",
    basicPlay: "hit",
    deviationPlay: "stand",
    trueCountThreshold: 3,
    direction: "above",
    explanation:
      "Normally you hit 12 vs 2 because the dealer's upcard is relatively strong. At TC +3, the bust risk tips the math toward standing.",
  },
  {
    name: "11 vs A",
    playerDesc: "Hard 11",
    dealerUpcard: "A",
    basicPlay: "hit",
    deviationPlay: "double",
    trueCountThreshold: 1,
    direction: "above",
    explanation:
      "With a positive count, 11 vs Ace becomes a doubling opportunity. You're likely to draw a ten for 21, and the dealer's ace is less dangerous in a high-count shoe.",
  },
  {
    name: "9 vs 2",
    playerDesc: "Hard 9",
    dealerUpcard: "2",
    basicPlay: "hit",
    deviationPlay: "double",
    trueCountThreshold: 1,
    direction: "above",
    explanation:
      "At TC +1, the surplus of tens makes doubling 9 vs 2 more profitable than just hitting — you'll hit 19-21 more often.",
  },
  {
    name: "10 vs A",
    playerDesc: "Hard 10",
    dealerUpcard: "A",
    basicPlay: "hit",
    deviationPlay: "double",
    trueCountThreshold: 4,
    direction: "above",
    explanation:
      "At TC +4, there are enough tens left to make doubling 10 against an Ace worthwhile despite the Ace's strength.",
  },
  {
    name: "9 vs 7",
    playerDesc: "Hard 9",
    dealerUpcard: "7",
    basicPlay: "hit",
    deviationPlay: "double",
    trueCountThreshold: 3,
    direction: "above",
    explanation:
      "At TC +3, doubling 9 vs 7 works because you're likely to draw a ten for 19, and the dealer's 7 often ends up with 17.",
  },
  {
    name: "16 vs 9",
    playerDesc: "Hard 16",
    dealerUpcard: "9",
    basicPlay: "hit",
    deviationPlay: "stand",
    trueCountThreshold: 5,
    direction: "above",
    explanation:
      "16 vs 9 is a close play. At TC +5, the very high ten density makes standing less costly than busting.",
  },
  {
    name: "13 vs 2",
    playerDesc: "Hard 13",
    dealerUpcard: "2",
    basicPlay: "stand",
    deviationPlay: "hit",
    trueCountThreshold: -1,
    direction: "below",
    explanation:
      "At negative counts, the shoe has fewer tens. This means less bust risk for hitting AND the dealer's 2 is less likely to bust. Hitting becomes correct.",
  },
  {
    name: "12 vs 4",
    playerDesc: "Hard 12",
    dealerUpcard: "4",
    basicPlay: "stand",
    deviationPlay: "hit",
    trueCountThreshold: 0,
    direction: "below",
    explanation:
      "At negative counts, 12 vs 4 favors hitting. The depleted high cards mean you bust less often and the dealer busts less often too.",
  },
  {
    name: "12 vs 5",
    playerDesc: "Hard 12",
    dealerUpcard: "5",
    basicPlay: "stand",
    deviationPlay: "hit",
    trueCountThreshold: -2,
    direction: "below",
    explanation:
      "At TC -2 or below, even against a weak 5, the low-card-heavy shoe makes it safe to hit 12.",
  },
  {
    name: "12 vs 6",
    playerDesc: "Hard 12",
    dealerUpcard: "6",
    basicPlay: "stand",
    deviationPlay: "hit",
    trueCountThreshold: -1,
    direction: "below",
    explanation:
      "At TC -1 or below, hit 12 vs 6. The lack of high cards reduces both your bust chance and the dealer's bust chance.",
  },
  {
    name: "13 vs 3",
    playerDesc: "Hard 13",
    dealerUpcard: "3",
    basicPlay: "stand",
    deviationPlay: "hit",
    trueCountThreshold: -2,
    direction: "below",
    explanation:
      "At TC -2 or below, the low-card-rich shoe means standing on 13 vs 3 is worse than taking a card.",
  },
];

export function getDeviationInsight(
  trueCount: number
): StrategyDeviation | null {
  // Return the most relevant deviation for the current count
  const active = ILLUSTRIOUS_18.filter((d) => {
    if (d.direction === "above") return trueCount >= d.trueCountThreshold;
    return trueCount <= d.trueCountThreshold;
  });
  if (active.length === 0) return null;
  // Return the one with the tightest threshold (most recently triggered)
  return active.reduce((best, d) => {
    const bestDist = Math.abs(trueCount - best.trueCountThreshold);
    const dist = Math.abs(trueCount - d.trueCountThreshold);
    return dist < bestDist ? d : best;
  });
}

// Card value for blackjack hand total
export function bjValue(rank: BJRank): number {
  if (rank === "A") return 11;
  if (["T", "J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank, 10);
}
