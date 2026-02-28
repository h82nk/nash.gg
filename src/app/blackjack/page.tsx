import { Navbar } from "@/components/layout/Navbar";
import { CountingTrainer } from "@/components/blackjack/CountingTrainer";

export const metadata = {
  title: "Card Counting Trainer | Nash.gg",
  description:
    "Master blackjack card counting with our casino-realistic trainer. Practice Hi-Lo, KO, Hi-Opt I & II systems with speed drills and full table simulations.",
};

export default function BlackjackPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Card Counting Trainer
              </h1>
              <p className="text-sm text-muted-foreground">
                Sharpen your edge with GTO-optimal counting practice
              </p>
            </div>
          </div>
        </div>

        {/* Trainer */}
        <CountingTrainer />
      </main>
    </div>
  );
}
