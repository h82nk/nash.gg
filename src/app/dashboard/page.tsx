"use client";

import { Navbar } from "@/components/layout/Navbar";
import { GtoScoreRing } from "@/components/poker/GtoScoreBadge";
import { cn } from "@/lib/utils";

// Mock data for the dashboard MVP
const MOCK_SESSIONS = [
  { id: "1", date: "2024-01-15", venue: "PokerStars $0.25/$0.50", hands: 142, gtoScore: 87, profit: 347.5, bb100: 12.3 },
  { id: "2", date: "2024-01-14", venue: "PokerStars $0.25/$0.50", hands: 98, gtoScore: 72, profit: -125.0, bb100: -6.4 },
  { id: "3", date: "2024-01-13", venue: "Live $1/$2 - Aria", hands: 45, gtoScore: 91, profit: 580.0, bb100: 32.2 },
  { id: "4", date: "2024-01-12", venue: "PokerStars $0.50/$1.00", hands: 210, gtoScore: 65, profit: -420.0, bb100: -10.0 },
  { id: "5", date: "2024-01-11", venue: "GGPoker $0.25/$0.50", hands: 176, gtoScore: 79, profit: 195.0, bb100: 5.5 },
];

const MOCK_STATS = {
  vpip: 24.3,
  pfr: 19.1,
  threeBet: 8.2,
  aggFreq: 42.5,
  wtsd: 28.7,
  cbet: 65.0,
};

function StatCard({
  label,
  value,
  suffix = "",
  trend,
}: {
  label: string;
  value: number;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold font-mono">{value}</span>
        <span className="text-sm text-muted-foreground mb-0.5">{suffix}</span>
      </div>
      {trend && (
        <div
          className={cn(
            "text-xs mt-1 font-mono",
            trend === "up" && "text-emerald-400",
            trend === "down" && "text-red-400",
            trend === "neutral" && "text-muted-foreground"
          )}
        >
          {trend === "up" ? "+3.2%" : trend === "down" ? "-1.8%" : "0.0%"} vs
          last week
        </div>
      )}
    </div>
  );
}

function PlayerRadarChart({ stats }: { stats: typeof MOCK_STATS }) {
  // Simple radar chart using SVG
  const categories = [
    { key: "vpip", label: "VPIP", max: 50 },
    { key: "pfr", label: "PFR", max: 40 },
    { key: "threeBet", label: "3-Bet", max: 20 },
    { key: "aggFreq", label: "Agg%", max: 80 },
    { key: "wtsd", label: "WTSD", max: 50 },
    { key: "cbet", label: "C-Bet", max: 100 },
  ];

  const cx = 120;
  const cy = 120;
  const maxR = 90;
  const n = categories.length;

  function getPoint(index: number, value: number, max: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / max) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  const dataPoints = categories.map((cat, i) => {
    const val = stats[cat.key as keyof typeof stats];
    return getPoint(i, val, cat.max);
  });

  const dataPath = dataPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ") + " Z";

  return (
    <svg width="240" height="240" className="mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={categories
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              const r = maxR * scale;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            })
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-border"
        />
      ))}

      {/* Axes */}
      {categories.map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + maxR * Math.cos(angle)}
            y2={cy + maxR * Math.sin(angle)}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-border"
          />
        );
      })}

      {/* Data polygon */}
      <path
        d={dataPath}
        fill="var(--primary)"
        fillOpacity="0.15"
        stroke="var(--primary)"
        strokeWidth="2"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="var(--primary)"
        />
      ))}

      {/* Labels */}
      {categories.map((cat, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const labelR = maxR + 18;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px] font-mono"
          >
            {cat.label}
          </text>
        );
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const totalProfit = MOCK_SESSIONS.reduce((sum, s) => sum + s.profit, 0);
  const avgScore = Math.round(
    MOCK_SESSIONS.reduce((sum, s) => sum + s.gtoScore, 0) / MOCK_SESSIONS.length
  );
  const totalHands = MOCK_SESSIONS.reduce((sum, s) => sum + s.hands, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Your poker performance at a glance. Track sessions, GTO accuracy,
              and bankroll.
            </p>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Avg GTO Score"
              value={avgScore}
              suffix="/100"
              trend="up"
            />
            <StatCard
              label="Total Profit"
              value={totalProfit}
              suffix="$"
              trend={totalProfit >= 0 ? "up" : "down"}
            />
            <StatCard
              label="Hands Played"
              value={totalHands}
              trend="neutral"
            />
            <StatCard
              label="Sessions"
              value={MOCK_SESSIONS.length}
              trend="neutral"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sessions List */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h3 className="font-medium">Recent Sessions</h3>
              </div>
              <div className="divide-y divide-border">
                {MOCK_SESSIONS.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <GtoScoreRing score={session.gtoScore} size="sm" />
                      <div>
                        <div className="text-sm font-medium">
                          {session.venue}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.date} &middot; {session.hands} hands
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={cn(
                          "text-sm font-mono font-bold",
                          session.profit >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        )}
                      >
                        {session.profit >= 0 ? "+" : ""}$
                        {session.profit.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {session.bb100 >= 0 ? "+" : ""}
                        {session.bb100.toFixed(1)} bb/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Profile */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium mb-4">Player Profile</h3>
                <PlayerRadarChart stats={MOCK_STATS} />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {Object.entries(MOCK_STATS).map(([key, value]) => (
                    <div
                      key={key}
                      className="text-center p-2 rounded-lg bg-secondary/30"
                    >
                      <div className="text-xs text-muted-foreground uppercase">
                        {key === "threeBet" ? "3-Bet" : key === "aggFreq" ? "Agg%" : key.toUpperCase()}
                      </div>
                      <div className="font-mono font-bold text-sm">
                        {value}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium mb-3">Play Style</h3>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    TAG
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tight-Aggressive
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your VPIP/PFR ratio of 24/19 indicates a tight-aggressive
                    style with good preflop discipline. Your 3-bet of 8.2% is
                    within optimal range.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
