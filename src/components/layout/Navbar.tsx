"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
              <span className="text-primary font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold">
              Nash<span className="text-primary">.gg</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/analyze"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Analyze
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/puzzles"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Puzzles
            </Link>
            <Link
              href="/ranges"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ranges
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </button>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="space-y-1.5">
              <span
                className={cn(
                  "block h-0.5 w-6 bg-foreground transition-all",
                  mobileOpen && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-6 bg-foreground transition-all",
                  mobileOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-6 bg-foreground transition-all",
                  mobileOpen && "-translate-y-2 -rotate-45"
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <Link
              href="/analyze"
              className="block text-sm text-muted-foreground hover:text-foreground"
            >
              Analyze
            </Link>
            <Link
              href="/dashboard"
              className="block text-sm text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/puzzles"
              className="block text-sm text-muted-foreground hover:text-foreground"
            >
              Puzzles
            </Link>
            <Link
              href="/ranges"
              className="block text-sm text-muted-foreground hover:text-foreground"
            >
              Ranges
            </Link>
            <div className="pt-3 border-t border-border space-y-3">
              <button className="block text-sm text-muted-foreground">
                Sign In
              </button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
