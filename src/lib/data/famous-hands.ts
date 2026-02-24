import type { FamousHand, Card } from "@/types/poker";

/**
 * Famous poker hands database for the "Relive the Legend" puzzle feature.
 * Each hand presents the user with a decision point where they choose their action,
 * then compare against what the pro did and what GTO dictates.
 */

const c = (rank: string, suit: string): Card => ({
  rank: rank as Card["rank"],
  suit: suit as Card["suit"],
});

export const FAMOUS_HANDS: FamousHand[] = [
  {
    id: "moneymaker-2003-final",
    title: "Moneymaker's Legendary Bluff",
    event: "2003 WSOP Main Event Final Table",
    year: 2003,
    players: ["Chris Moneymaker", "Sam Farha"],
    difficulty: "advanced",
    description:
      "The hand that changed poker forever. Chris Moneymaker, a $39 satellite qualifier, faces Sam Farha heads-up for the world championship. On a K-7-3 board with no flush draws, Moneymaker holds 5-4 offsuit - complete air. After Farha checks, Moneymaker fires a massive bluff. Should you pull the trigger?",
    hand: {
      id: "wsop-2003-final-bluff",
      site: "WSOP",
      gameType: "NL Hold'em",
      stakes: { smallBlind: 50000, bigBlind: 100000 },
      tableName: "WSOP Main Event Final",
      maxSeats: 2,
      timestamp: new Date("2003-05-24"),
      players: [
        {
          name: "Chris Moneymaker",
          position: "BTN",
          stack: 5000000,
          holeCards: [c("5", "d"), c("4", "s")],
          isHero: true,
        },
        {
          name: "Sam Farha",
          position: "BB",
          stack: 3500000,
          holeCards: [c("Q", "h"), c("9", "h")],
          isHero: false,
        },
      ],
      communityCards: {
        flop: [c("K", "s"), c("7", "d"), c("3", "h")],
      },
      actions: [
        { player: "Chris Moneymaker", position: "BTN", action: "raise", amount: 175000, street: "preflop", isHero: true },
        { player: "Sam Farha", position: "BB", action: "call", amount: 175000, street: "preflop", isHero: false },
        { player: "Sam Farha", position: "BB", action: "check", street: "flop", isHero: false },
      ],
      potSize: 450000,
      rake: 0,
      winners: [{ player: "Chris Moneymaker", amount: 450000 }],
      heroPosition: "BTN",
    },
    decisionPoint: {
      street: "flop",
      actionIndex: 3,
      options: ["check", "bet"],
    },
    proMove: "bet",
    gtoMove: "check",
  },
  {
    id: "dwan-ivey-durrrr-challenge",
    title: "Dwan's River Bluff vs Ivey",
    event: "High Stakes Poker Season 6",
    year: 2009,
    players: ["Tom Dwan", "Phil Ivey"],
    difficulty: "legendary",
    description:
      "Two of the greatest players ever face off in a massive pot. Tom 'durrrr' Dwan holds a busted straight draw on the river and decides to turn his hand into a bluff against Phil Ivey - widely considered the best poker player alive. The pot is already massive. Do you have the courage to pull the trigger against the GOAT?",
    hand: {
      id: "hsp-dwan-ivey-2009",
      site: "HSP",
      gameType: "NL Hold'em",
      stakes: { smallBlind: 500, bigBlind: 1000 },
      tableName: "High Stakes Poker",
      maxSeats: 6,
      timestamp: new Date("2009-04-15"),
      players: [
        {
          name: "Tom Dwan",
          position: "CO",
          stack: 750000,
          holeCards: [c("7", "c"), c("6", "c")],
          isHero: true,
        },
        {
          name: "Phil Ivey",
          position: "BTN",
          stack: 600000,
          holeCards: [c("A", "d"), c("Q", "d")],
          isHero: false,
        },
      ],
      communityCards: {
        flop: [c("J", "c"), c("3", "d"), c("5", "c")],
        turn: c("T", "h"),
        river: c("K", "s"),
      },
      actions: [
        { player: "Tom Dwan", position: "CO", action: "raise", amount: 3000, street: "preflop", isHero: true },
        { player: "Phil Ivey", position: "BTN", action: "call", amount: 3000, street: "preflop", isHero: false },
        { player: "Tom Dwan", position: "CO", action: "bet", amount: 4500, street: "flop", isHero: true },
        { player: "Phil Ivey", position: "BTN", action: "call", amount: 4500, street: "flop", isHero: false },
        { player: "Tom Dwan", position: "CO", action: "bet", amount: 11000, street: "turn", isHero: true },
        { player: "Phil Ivey", position: "BTN", action: "call", amount: 11000, street: "turn", isHero: false },
      ],
      potSize: 38000,
      rake: 0,
      winners: [{ player: "Tom Dwan", amount: 38000 }],
      heroPosition: "CO",
    },
    decisionPoint: {
      street: "river",
      actionIndex: 6,
      options: ["check", "bet"],
    },
    proMove: "bet",
    gtoMove: "bet",
  },
  {
    id: "negreanu-aces-wsop-2015",
    title: "Negreanu's Aces Cracked",
    event: "2015 WSOP Main Event",
    year: 2015,
    players: ["Daniel Negreanu", "Unknown Opponent"],
    difficulty: "beginner",
    description:
      "You pick up pocket Aces - the best starting hand in poker. A player in middle position raises, and you're sitting on the button. This is a textbook spot. What's the optimal play with the bullets?",
    hand: {
      id: "wsop-2015-aces",
      site: "WSOP",
      gameType: "NL Hold'em",
      stakes: { smallBlind: 300, bigBlind: 600, ante: 75 },
      tableName: "WSOP Main Event Day 3",
      maxSeats: 9,
      timestamp: new Date("2015-07-10"),
      players: [
        {
          name: "Hero",
          position: "BTN",
          stack: 85000,
          holeCards: [c("A", "s"), c("A", "h")],
          isHero: true,
        },
        {
          name: "Villain",
          position: "MP",
          stack: 62000,
          isHero: false,
        },
      ],
      communityCards: {},
      actions: [
        { player: "Villain", position: "MP", action: "raise", amount: 1400, street: "preflop", isHero: false },
      ],
      potSize: 2675,
      rake: 0,
      winners: [],
      heroPosition: "BTN",
    },
    decisionPoint: {
      street: "preflop",
      actionIndex: 1,
      options: ["fold", "call", "raise"],
    },
    proMove: "raise",
    gtoMove: "raise",
  },
  {
    id: "hellmuth-bad-fold-2019",
    title: "Hellmuth's Hero Fold",
    event: "Super High Roller Cash Game",
    year: 2019,
    players: ["Phil Hellmuth", "Daniel Negreanu"],
    difficulty: "intermediate",
    description:
      "Phil Hellmuth faces a massive river bet from Daniel Negreanu holding top pair with a decent kicker on a connected board. Negreanu has been playing aggressively all session. The pot is huge and Negreanu jams the river for more than the pot. Do you trust your read and make a hero fold, or call down the GOAT?",
    hand: {
      id: "shr-hellmuth-2019",
      site: "PokerGO",
      gameType: "NL Hold'em",
      stakes: { smallBlind: 500, bigBlind: 1000 },
      tableName: "Super High Roller",
      maxSeats: 6,
      timestamp: new Date("2019-09-20"),
      players: [
        {
          name: "Phil Hellmuth",
          position: "BB",
          stack: 300000,
          holeCards: [c("A", "c"), c("T", "s")],
          isHero: true,
        },
        {
          name: "Daniel Negreanu",
          position: "BTN",
          stack: 350000,
          holeCards: [c("K", "h"), c("Q", "h")],
          isHero: false,
        },
      ],
      communityCards: {
        flop: [c("A", "d"), c("J", "h"), c("4", "c")],
        turn: c("8", "h"),
        river: c("T", "h"),
      },
      actions: [
        { player: "Daniel Negreanu", position: "BTN", action: "raise", amount: 3000, street: "preflop", isHero: false },
        { player: "Phil Hellmuth", position: "BB", action: "call", amount: 3000, street: "preflop", isHero: true },
        { player: "Phil Hellmuth", position: "BB", action: "check", street: "flop", isHero: true },
        { player: "Daniel Negreanu", position: "BTN", action: "bet", amount: 4000, street: "flop", isHero: false },
        { player: "Phil Hellmuth", position: "BB", action: "call", amount: 4000, street: "flop", isHero: true },
        { player: "Phil Hellmuth", position: "BB", action: "check", street: "turn", isHero: true },
        { player: "Daniel Negreanu", position: "BTN", action: "bet", amount: 12000, street: "turn", isHero: false },
        { player: "Phil Hellmuth", position: "BB", action: "call", amount: 12000, street: "turn", isHero: true },
        { player: "Phil Hellmuth", position: "BB", action: "check", street: "river", isHero: true },
        { player: "Daniel Negreanu", position: "BTN", action: "bet", amount: 45000, street: "river", isHero: false },
      ],
      potSize: 83000,
      rake: 0,
      winners: [{ player: "Daniel Negreanu", amount: 83000 }],
      heroPosition: "BB",
    },
    decisionPoint: {
      street: "river",
      actionIndex: 10,
      options: ["fold", "call"],
    },
    proMove: "fold",
    gtoMove: "fold",
  },
  {
    id: "ivey-jackson-wsop-2005",
    title: "Ivey's Read of a Lifetime",
    event: "2005 Monte Carlo Million",
    year: 2005,
    players: ["Phil Ivey", "Paul Jackson"],
    difficulty: "legendary",
    description:
      "Phil Ivey makes one of the most famous calls in poker history. Facing a large river bet with only a pair of nines on a board with multiple overcards, Ivey uses his legendary reading ability to make a hero call that stuns the poker world. Can you read the situation like the Tiger Woods of poker?",
    hand: {
      id: "monte-carlo-2005-ivey",
      site: "WPT",
      gameType: "NL Hold'em",
      stakes: { smallBlind: 5000, bigBlind: 10000, ante: 1000 },
      tableName: "Monte Carlo Million Euro",
      maxSeats: 6,
      timestamp: new Date("2005-11-15"),
      players: [
        {
          name: "Phil Ivey",
          position: "BB",
          stack: 800000,
          holeCards: [c("9", "c"), c("8", "c")],
          isHero: true,
        },
        {
          name: "Paul Jackson",
          position: "BTN",
          stack: 650000,
          holeCards: [c("T", "s"), c("7", "s")],
          isHero: false,
        },
      ],
      communityCards: {
        flop: [c("Q", "d"), c("9", "h"), c("5", "c")],
        turn: c("K", "d"),
        river: c("J", "d"),
      },
      actions: [
        { player: "Paul Jackson", position: "BTN", action: "raise", amount: 25000, street: "preflop", isHero: false },
        { player: "Phil Ivey", position: "BB", action: "call", amount: 25000, street: "preflop", isHero: true },
        { player: "Phil Ivey", position: "BB", action: "check", street: "flop", isHero: true },
        { player: "Paul Jackson", position: "BTN", action: "bet", amount: 35000, street: "flop", isHero: false },
        { player: "Phil Ivey", position: "BB", action: "call", amount: 35000, street: "flop", isHero: true },
        { player: "Phil Ivey", position: "BB", action: "check", street: "turn", isHero: true },
        { player: "Paul Jackson", position: "BTN", action: "bet", amount: 75000, street: "turn", isHero: false },
        { player: "Phil Ivey", position: "BB", action: "call", amount: 75000, street: "turn", isHero: true },
        { player: "Phil Ivey", position: "BB", action: "check", street: "river", isHero: true },
        { player: "Paul Jackson", position: "BTN", action: "bet", amount: 200000, street: "river", isHero: false },
      ],
      potSize: 480000,
      rake: 0,
      winners: [{ player: "Phil Ivey", amount: 480000 }],
      heroPosition: "BB",
    },
    decisionPoint: {
      street: "river",
      actionIndex: 10,
      options: ["fold", "call"],
    },
    proMove: "call",
    gtoMove: "call",
  },
];

export function getFamousHandById(id: string): FamousHand | undefined {
  return FAMOUS_HANDS.find((h) => h.id === id);
}

export function getFamousHandsByDifficulty(
  difficulty: FamousHand["difficulty"]
): FamousHand[] {
  return FAMOUS_HANDS.filter((h) => h.difficulty === difficulty);
}
