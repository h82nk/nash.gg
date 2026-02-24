# Nash.gg - The OP.GG of Poker

## Vision
Nash.gg is the ultimate AI-powered poker analytics platform. Named after John Nash (Nash Equilibrium), it bridges the gap between complex GTO solver mathematics and intuitive, actionable insights. Think OP.GG/lol.ps but for poker - a cloud-native, zero-configuration platform that provides an unmistakable mathematical edge to players.

## Core Value Proposition
- **GTO Accuracy Score (0-100)**: Grade every hand against theoretical perfection
- **AI-Powered Coaching**: Natural language explanations of why plays are optimal or suboptimal
- **Hand History Analysis**: Upload and instantly analyze sessions
- **Famous Hands Puzzles**: "Relive the Legend" - solve iconic poker spots
- **Population Exploits (MDA)**: Identify how populations deviate from GTO baselines
- **Range Visualization**: Interactive 13x13 heatmaps for range construction

## Tech Stack
- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Visualization**: D3.js for range matrices, equity graphs, radar charts
- **Database**: PostgreSQL (app state) + columnar analytics (future)
- **AI**: Claude API for natural language hand analysis coaching
- **Deployment**: Vercel (frontend) + serverless functions

## Project Structure
```
src/
  app/                  # Next.js App Router pages
    (marketing)/        # Landing page, about, pricing
    dashboard/          # Main authenticated dashboard
    analyze/            # Hand analysis views
    puzzles/            # Famous hands puzzle feature
    api/                # API routes
  components/
    ui/                 # shadcn/ui components
    poker/              # Poker-specific components (range matrix, card display, etc.)
    charts/             # D3.js visualization components
    layout/             # Navigation, sidebar, footer
  lib/
    parser/             # Hand history parsing engine
    solver/             # GTO evaluation and scoring
    poker/              # Core poker logic (hand evaluation, equity calc)
    db/                 # Database queries and schemas
    utils/              # General utilities
  types/                # TypeScript type definitions
    poker.ts            # Core poker types (Hand, Card, Action, etc.)
    analysis.ts         # Analysis result types
    user.ts             # User-related types
```

## Key Conventions
- Use TypeScript strict mode throughout
- Functional components with React hooks
- Server Components by default, 'use client' only when needed
- All poker logic in pure functions for testability
- Dark theme first (poker aesthetic)
- Mobile-responsive design
- No real-time assistance during gameplay (compliance)

## GTO Scoring Classification
| Classification | Definition | Score Impact |
|---------------|------------|--------------|
| Best Move | Matches highest-frequency GTO play | Max positive |
| Correct Move | Part of mixed strategy, near-zero EV loss | Neutral/minor |
| Inaccuracy | <3.5% frequency, minimal EV loss | Moderate deduction |
| Mistake | Never in GTO strategy, measurable EV loss | Significant deduction |
| Blunder | Severe deviation, massive EV loss | Severe penalty |

## Development Phase: MVP
Priority features for v0.1:
1. Landing page with brand identity
2. Hand history upload & parsing (PokerStars format first)
3. Hand replay viewer with action timeline
4. GTO accuracy scoring display
5. 13x13 range matrix visualization
6. "Relive the Legend" famous hands puzzles
7. Basic session stats dashboard

## Compliance
- Strictly post-session analysis only
- No real-time assistance during active gameplay
- No client memory hooking or screen scraping
- HUD stats (if added) partitioned from solver engine
