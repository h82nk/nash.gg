import type {
  Card,
  Rank,
  Suit,
  HandHistory,
  Player,
  PlayerAction,
  Position,
  Street,
  ActionType,
} from "@/types/poker";

/**
 * PokerStars Hand History Parser
 *
 * Parses raw PokerStars text hand history files into structured HandHistory objects.
 * Handles NL Hold'em cash game and tournament formats.
 */

function parseCardString(str: string): Card {
  const rankMap: Record<string, Rank> = {
    "2": "2", "3": "3", "4": "4", "5": "5", "6": "6",
    "7": "7", "8": "8", "9": "9", "T": "T", "J": "J",
    "Q": "Q", "K": "K", "A": "A",
  };
  const suitMap: Record<string, Suit> = {
    h: "h", d: "d", c: "c", s: "s",
  };
  return {
    rank: rankMap[str[0]] || (str[0] as Rank),
    suit: suitMap[str[1]] || (str[1] as Suit),
  };
}

function parseCards(text: string): Card[] {
  const cardPattern = /[2-9TJQKA][hdcs]/g;
  const matches = text.match(cardPattern);
  return matches ? matches.map(parseCardString) : [];
}

const SEAT_TO_POSITION: Record<number, Record<number, Position>> = {
  6: { 1: "UTG", 2: "MP", 3: "CO", 4: "BTN", 5: "SB", 6: "BB" },
  9: { 1: "UTG", 2: "UTG+1", 3: "MP", 4: "MP+1", 5: "HJ", 6: "CO", 7: "BTN", 8: "SB", 9: "BB" },
};

function inferPosition(seatIndex: number, totalPlayers: number): Position {
  const map = SEAT_TO_POSITION[totalPlayers] || SEAT_TO_POSITION[6];
  return map[Math.min(seatIndex, Object.keys(map).length)] || "UTG";
}

interface ParseState {
  handId: string;
  site: string;
  gameType: "NL Hold'em" | "PL Omaha" | "NL Omaha";
  stakes: { smallBlind: number; bigBlind: number; ante?: number };
  tableName: string;
  maxSeats: number;
  timestamp: Date;
  players: Map<string, Player>;
  heroName: string;
  buttonSeat: number;
  seatNumbers: Map<string, number>;
  communityCards: {
    flop?: [Card, Card, Card];
    turn?: Card;
    river?: Card;
  };
  actions: PlayerAction[];
  currentStreet: Street;
  potSize: number;
  rake: number;
  winners: { player: string; amount: number }[];
}

function parseHeader(line: string, state: ParseState): void {
  // PokerStars Hand #216542870945:  Hold'em No Limit ($0.25/$0.50 USD) - 2020/07/15 14:32:05 ET
  const headerMatch = line.match(
    /PokerStars (?:Hand|Game) #(\d+):\s+(.+?)\s+\((?:\$|)([0-9.]+)\/(?:\$|)([0-9.]+)/
  );
  if (headerMatch) {
    state.handId = headerMatch[1];
    state.site = "PokerStars";
    state.stakes = {
      smallBlind: parseFloat(headerMatch[3]),
      bigBlind: parseFloat(headerMatch[4]),
    };

    const gameStr = headerMatch[2].toLowerCase();
    if (gameStr.includes("omaha") && gameStr.includes("pot limit")) {
      state.gameType = "PL Omaha";
    } else if (gameStr.includes("omaha")) {
      state.gameType = "NL Omaha";
    } else {
      state.gameType = "NL Hold'em";
    }
  }

  // Timestamp
  const dateMatch = line.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (dateMatch) {
    state.timestamp = new Date(
      `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${dateMatch[4]}:${dateMatch[5]}:${dateMatch[6]}`
    );
  }
}

function parseTable(line: string, state: ParseState): void {
  const tableMatch = line.match(/Table '(.+?)'\s+(\d+)-max/);
  if (tableMatch) {
    state.tableName = tableMatch[1];
    state.maxSeats = parseInt(tableMatch[2]);
  }

  const buttonMatch = line.match(/Seat #(\d+) is the button/);
  if (buttonMatch) {
    state.buttonSeat = parseInt(buttonMatch[1]);
  }
}

function parseSeat(line: string, state: ParseState): void {
  const seatMatch = line.match(/Seat (\d+): (.+?) \((?:\$|)([0-9.]+) in chips\)/);
  if (seatMatch) {
    const seatNum = parseInt(seatMatch[1]);
    const name = seatMatch[2];
    const stack = parseFloat(seatMatch[3]);
    state.seatNumbers.set(name, seatNum);
    state.players.set(name, {
      name,
      position: "UTG", // will be resolved later
      stack,
      isHero: false,
    });
  }
}

function resolvePositions(state: ParseState): void {
  const seatEntries = Array.from(state.seatNumbers.entries()).sort(
    (a, b) => a[1] - b[1]
  );
  const numPlayers = seatEntries.length;

  // Find button index
  let buttonIdx = seatEntries.findIndex(
    ([, seat]) => seat === state.buttonSeat
  );
  if (buttonIdx === -1) buttonIdx = 0;

  // Assign positions relative to button
  const positionOrder: Position[] =
    numPlayers <= 6
      ? ["BTN", "SB", "BB", "UTG", "MP", "CO"]
      : ["BTN", "SB", "BB", "UTG", "UTG+1", "MP", "MP+1", "HJ", "CO"];

  for (let i = 0; i < numPlayers; i++) {
    const idx = (buttonIdx + i) % numPlayers;
    const [name] = seatEntries[idx];
    const player = state.players.get(name);
    if (player) {
      player.position = positionOrder[i] || inferPosition(i + 1, numPlayers);
    }
  }
}

function parseAction(line: string, state: ParseState): void {
  const playerNames = Array.from(state.players.keys());

  for (const name of playerNames) {
    if (!line.startsWith(name + ":")) continue;

    const actionStr = line.slice(name.length + 2).trim().toLowerCase();
    const player = state.players.get(name)!;

    let action: ActionType;
    let amount: number | undefined;

    if (actionStr.startsWith("folds")) {
      action = "fold";
    } else if (actionStr.startsWith("checks")) {
      action = "check";
    } else if (actionStr.startsWith("calls")) {
      action = "call";
      const amtMatch = actionStr.match(/calls (?:\$|)([0-9.]+)/);
      if (amtMatch) amount = parseFloat(amtMatch[1]);
    } else if (actionStr.startsWith("bets")) {
      action = "bet";
      const amtMatch = actionStr.match(/bets (?:\$|)([0-9.]+)/);
      if (amtMatch) amount = parseFloat(amtMatch[1]);
    } else if (actionStr.startsWith("raises")) {
      action = "raise";
      const amtMatch = actionStr.match(/to (?:\$|)([0-9.]+)/);
      if (amtMatch) amount = parseFloat(amtMatch[1]);
    } else if (actionStr.includes("all-in")) {
      action = "all-in";
      const amtMatch = actionStr.match(/(?:\$|)([0-9.]+)/);
      if (amtMatch) amount = parseFloat(amtMatch[1]);
    } else {
      return;
    }

    state.actions.push({
      player: name,
      position: player.position,
      action,
      amount,
      street: state.currentStreet,
      isHero: player.isHero,
    });
  }
}

function parseHeroCards(line: string, state: ParseState): void {
  const heroMatch = line.match(/Dealt to (.+?) \[(.+?)\]/);
  if (heroMatch) {
    const heroName = heroMatch[1];
    state.heroName = heroName;
    const player = state.players.get(heroName);
    if (player) {
      player.isHero = true;
      const cards = parseCards(heroMatch[2]);
      if (cards.length >= 2) {
        player.holeCards = [cards[0], cards[1]];
      }
    }
  }
}

function parseCommunityCards(line: string, state: ParseState): void {
  if (line.includes("*** FLOP ***")) {
    state.currentStreet = "flop";
    const cards = parseCards(line);
    if (cards.length >= 3) {
      state.communityCards.flop = [cards[0], cards[1], cards[2]];
    }
  } else if (line.includes("*** TURN ***")) {
    state.currentStreet = "turn";
    const cards = parseCards(line);
    if (cards.length > 0) {
      state.communityCards.turn = cards[cards.length - 1];
    }
  } else if (line.includes("*** RIVER ***")) {
    state.currentStreet = "river";
    const cards = parseCards(line);
    if (cards.length > 0) {
      state.communityCards.river = cards[cards.length - 1];
    }
  }
}

function parseSummary(line: string, state: ParseState): void {
  const winMatch = line.match(/(.+?) collected (?:\$|)([0-9.]+)/);
  if (winMatch) {
    state.winners.push({
      player: winMatch[1],
      amount: parseFloat(winMatch[2]),
    });
  }

  const rakeMatch = line.match(/Rake (?:\$|)([0-9.]+)/);
  if (rakeMatch) {
    state.rake = parseFloat(rakeMatch[1]);
  }

  const potMatch = line.match(/Total pot (?:\$|)([0-9.]+)/);
  if (potMatch) {
    state.potSize = parseFloat(potMatch[1]);
  }
}

/**
 * Parse a single PokerStars hand history text block into a HandHistory object.
 */
export function parsePokerStarsHand(text: string): HandHistory {
  const state: ParseState = {
    handId: "",
    site: "PokerStars",
    gameType: "NL Hold'em",
    stakes: { smallBlind: 0, bigBlind: 0 },
    tableName: "",
    maxSeats: 6,
    timestamp: new Date(),
    players: new Map(),
    heroName: "",
    buttonSeat: 0,
    seatNumbers: new Map(),
    communityCards: {},
    actions: [],
    currentStreet: "preflop",
    potSize: 0,
    rake: 0,
    winners: [],
  };

  const lines = text.split("\n").map((l) => l.trim());
  let inSummary = false;

  for (const line of lines) {
    if (!line) continue;

    if (line.includes("*** SUMMARY ***")) {
      inSummary = true;
      continue;
    }

    if (inSummary) {
      parseSummary(line, state);
      continue;
    }

    if (line.startsWith("PokerStars")) {
      parseHeader(line, state);
    } else if (line.startsWith("Table")) {
      parseTable(line, state);
    } else if (line.startsWith("Seat") && line.includes("in chips")) {
      parseSeat(line, state);
    } else if (line.includes("*** HOLE CARDS ***")) {
      state.currentStreet = "preflop";
      resolvePositions(state);
    } else if (line.startsWith("Dealt to")) {
      parseHeroCards(line, state);
    } else if (line.includes("*** FLOP ***") || line.includes("*** TURN ***") || line.includes("*** RIVER ***")) {
      parseCommunityCards(line, state);
    } else {
      parseAction(line, state);
    }
  }

  const hero = Array.from(state.players.values()).find((p) => p.isHero);

  return {
    id: state.handId,
    site: state.site,
    gameType: state.gameType,
    stakes: state.stakes,
    tableName: state.tableName,
    maxSeats: state.maxSeats,
    timestamp: state.timestamp,
    players: Array.from(state.players.values()),
    communityCards: state.communityCards,
    actions: state.actions,
    potSize: state.potSize,
    rake: state.rake,
    winners: state.winners,
    heroPosition: hero?.position || "BTN",
  };
}

/**
 * Parse a multi-hand PokerStars text file into an array of HandHistory objects.
 * Hands are separated by double newlines in PokerStars exports.
 */
export function parsePokerStarsFile(fileContent: string): HandHistory[] {
  const handBlocks = fileContent
    .split(/\n\n\n+|\n\n(?=PokerStars)/)
    .filter((block) => block.trim().startsWith("PokerStars"));

  return handBlocks.map(parsePokerStarsHand);
}
