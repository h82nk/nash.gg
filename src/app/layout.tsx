import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nash.gg | The OP.GG of Poker",
  description:
    "AI-powered poker analytics platform. Analyze your hands, get GTO accuracy scores, study famous spots, and gain a mathematical edge.",
  keywords: [
    "poker",
    "GTO",
    "poker analytics",
    "hand analysis",
    "Nash equilibrium",
    "poker solver",
    "poker AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
