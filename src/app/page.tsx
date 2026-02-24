import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const features = [
  {
    title: "GTO Accuracy Score",
    description:
      "Every hand graded 0-100 against theoretical perfection. Know exactly where you deviate from optimal play.",
    icon: "chart",
  },
  {
    title: "AI Hand Coach",
    description:
      'Natural language explanations for every decision. Not just "what" is optimal, but "why" it\'s optimal.',
    icon: "brain",
  },
  {
    title: "Hand History Upload",
    description:
      "Upload your sessions from PokerStars, GGPoker, and more. Instant parsing and analysis.",
    icon: "upload",
  },
  {
    title: "Range Visualizer",
    description:
      "Interactive 13x13 heatmaps showing optimal raise, call, and fold frequencies for every spot.",
    icon: "grid",
  },
  {
    title: "Relive the Legend",
    description:
      "Solve iconic hands from Moneymaker, Ivey, and Dwan. Compare your play against the pros and GTO.",
    icon: "trophy",
  },
  {
    title: "Population Exploits",
    description:
      "MDA-powered insights reveal how your opponents deviate from GTO. Turn their leaks into your profit.",
    icon: "target",
  },
];

function FeatureIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    chart: "M3 3v18h18M7 17V11m4 6V7m4 10v-4m4 4V9",
    brain: "M12 2a9 9 0 0 0-9 9c0 3.6 2.4 6.5 5.5 7.7.3.1.5.4.5.8V21h6v-1.5c0-.4.2-.7.5-.8A9 9 0 0 0 12 2Z",
    upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M9 21h6m-3-3v3M6 4h12v5a6 6 0 0 1-12 0V4Z",
    target: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d={icons[type] || icons.chart} />
    </svg>
  );
}

function ScoreDemo() {
  return (
    <div className="relative">
      {/* Outer glow */}
      <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-3xl" />

      <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Session GTO Score
            </div>
            <div className="text-3xl font-bold font-mono text-[var(--gto-best)]">
              87
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">142 hands</div>
            <div className="text-sm text-emerald-400 font-mono">+$347.50</div>
          </div>
        </div>

        {/* Mini hand timeline */}
        <div className="space-y-3">
          {[
            { hand: "A\u2660 K\u2665", action: "3-bet", score: "best", label: "Best Move", color: "var(--gto-best)" },
            { hand: "J\u2663 T\u2663", action: "Call flop cbet", score: "correct", label: "Correct", color: "var(--gto-correct)" },
            { hand: "9\u2666 8\u2666", action: "Fold to 4-bet", score: "inaccuracy", label: "Inaccuracy", color: "var(--gto-inaccuracy)" },
            { hand: "Q\u2665 Q\u2660", action: "Call river jam", score: "blunder", label: "Blunder", color: "var(--gto-blunder)" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm w-14">{item.hand}</span>
                <span className="text-sm text-muted-foreground">
                  {item.action}
                </span>
              </div>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full border"
                style={{
                  color: item.color,
                  borderColor: `color-mix(in srgb, ${item.color} 30%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${item.color} 10%, transparent)`,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                AI-Powered Poker Analytics
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                Your edge is{" "}
                <span className="gradient-text">mathematical.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Nash.gg grades every hand against GTO perfection, explains{" "}
                <em>why</em> plays are optimal, and reveals population exploits
                that turn theory into profit. The OP.GG of Poker.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/analyze"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-all glow-primary"
                >
                  Analyze Your Hands
                </Link>
                <Link
                  href="/puzzles"
                  className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Try a Puzzle
                </Link>
              </div>

              <div className="flex items-center gap-8 mt-10 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M20 6 9 17l-5-5"/></svg>
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M20 6 9 17l-5-5"/></svg>
                  Post-session only
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M20 6 9 17l-5-5"/></svg>
                  100% compliant
                </div>
              </div>
            </div>

            <ScoreDemo />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 border-t border-border/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Every tool you need.{" "}
              <span className="text-muted-foreground">One platform.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop juggling between trackers, solvers, and spreadsheets. Nash.gg
              unifies hand analysis, GTO training, and population data into a
              single, intuitive experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:bg-card/80 transition-all"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <FeatureIcon type={feature.icon} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 border-t border-border/50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to find your edge?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of players who use Nash.gg to identify leaks, study
            GTO strategy, and maximize their win rate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-all glow-primary"
            >
              Start Analyzing for Free
            </Link>
            <Link
              href="/puzzles"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Solve Famous Hands
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 border border-primary/30">
              <span className="text-primary font-bold text-xs">N</span>
            </div>
            <span className="text-sm font-medium">
              Nash<span className="text-primary">.gg</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Post-session analysis only. Nash.gg does not provide real-time
            assistance during gameplay.
          </p>
          <p className="text-xs text-muted-foreground">
            Named after John Nash &middot; Built with AI
          </p>
        </div>
      </footer>
    </div>
  );
}
