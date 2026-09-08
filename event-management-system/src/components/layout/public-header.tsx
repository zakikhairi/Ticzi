'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Calendar, LayoutDashboard, LogIn, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function PublicHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none tracking-tight">Ticzi</span>
            <span className="text-[10px] text-muted-foreground font-medium">Event Management</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/events"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse Events
          </Link>
          <Link
            href="/#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
        </nav>

        {/* Auth CTA */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Button asChild className="gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Link href="/profile" className="flex items-center gap-2 text-xs font-medium hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {session.user.name
                      ? session.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-accent text-foreground"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3">
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-foreground py-1"
          >
            Browse Events
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-muted-foreground py-1"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-muted-foreground py-1"
          >
            How It Works
          </Link>

          <div className="pt-2 border-t flex flex-col gap-2">
            {session?.user ? (
              <Button asChild className="w-full gap-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
