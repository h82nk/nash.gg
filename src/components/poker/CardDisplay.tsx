"use client";

import { type Card, type Suit, suitSymbol } from "@/types/poker";
import { cn } from "@/lib/utils";

function getSuitColor(suit: Suit): string {
  switch (suit) {
    case "h":
      return "text-red-500";
    case "d":
      return "text-blue-400";
    case "c":
      return "text-emerald-400";
    case "s":
      return "text-gray-200";
  }
}

function getSuitBg(suit: Suit): string {
  switch (suit) {
    case "h":
      return "bg-red-500/10 border-red-500/30";
    case "d":
      return "bg-blue-400/10 border-blue-400/30";
    case "c":
      return "bg-emerald-400/10 border-emerald-400/30";
    case "s":
      return "bg-gray-200/10 border-gray-200/30";
  }
}

interface CardDisplayProps {
  card: Card;
  size?: "sm" | "md" | "lg";
  faceDown?: boolean;
  className?: string;
}

export function CardDisplay({
  card,
  size = "md",
  faceDown = false,
  className,
}: CardDisplayProps) {
  const sizeClasses = {
    sm: "w-8 h-11 text-xs",
    md: "w-12 h-16 text-sm",
    lg: "w-16 h-22 text-lg",
  };

  if (faceDown) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center",
          sizeClasses[size],
          className
        )}
      >
        <span className="text-muted-foreground font-bold">?</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border flex flex-col items-center justify-center font-bold transition-transform hover:scale-105",
        sizeClasses[size],
        getSuitBg(card.suit),
        className
      )}
    >
      <span className={cn("leading-none", getSuitColor(card.suit))}>
        {card.rank}
      </span>
      <span className={cn("leading-none", getSuitColor(card.suit))}>
        {suitSymbol(card.suit)}
      </span>
    </div>
  );
}

interface HandDisplayProps {
  cards: [Card, Card];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function HandDisplay({ cards, size = "md", className }: HandDisplayProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      <CardDisplay card={cards[0]} size={size} />
      <CardDisplay card={cards[1]} size={size} />
    </div>
  );
}

interface BoardDisplayProps {
  flop?: [Card, Card, Card];
  turn?: Card;
  river?: Card;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BoardDisplay({
  flop,
  turn,
  river,
  size = "md",
  className,
}: BoardDisplayProps) {
  return (
    <div className={cn("flex gap-1 items-center", className)}>
      {flop ? (
        <>
          <CardDisplay card={flop[0]} size={size} />
          <CardDisplay card={flop[1]} size={size} />
          <CardDisplay card={flop[2]} size={size} />
        </>
      ) : (
        <>
          <CardDisplay card={{ rank: "A", suit: "s" }} size={size} faceDown />
          <CardDisplay card={{ rank: "A", suit: "s" }} size={size} faceDown />
          <CardDisplay card={{ rank: "A", suit: "s" }} size={size} faceDown />
        </>
      )}

      {turn ? (
        <CardDisplay card={turn} size={size} />
      ) : flop ? (
        <CardDisplay card={{ rank: "A", suit: "s" }} size={size} faceDown />
      ) : null}

      {river ? (
        <CardDisplay card={river} size={size} />
      ) : turn ? (
        <CardDisplay card={{ rank: "A", suit: "s" }} size={size} faceDown />
      ) : null}
    </div>
  );
}
