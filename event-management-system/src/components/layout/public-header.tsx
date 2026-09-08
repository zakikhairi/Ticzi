'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Menu,
  X,
  Ticket,
  Search,
  Sparkles,
  PhoneCall,
  AtSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function PublicHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="sticky top-3 sm:top-5 z-50 w-full px-4 max-w-6xl mx-auto transition-all duration-300">
      <header className="relative flex items-center justify-between px-5 sm:px-7 py-2.5 rounded-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-md shadow-zinc-900/5 transition-all">
        {/* Brand Logo - Stylized Tixonic/Ticzi aesthetic */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-[1.5px] shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
              <span className="text-rose-500 font-extrabold text-sm tracking-tighter">✕</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white group-hover:text-rose-600 transition-colors">
              Ticzi<span className="text-rose-500">.</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link
            href="/events"
            className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            Cari Event
          </Link>
          <Link
            href="/my-tickets"
            className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            Lacak Pesanan
          </Link>
          <Link
            href="/events?discount=true"
            className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <span>Promo</span>
            <span className="bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              HOT
            </span>
          </Link>
          <Link
            href="/#contact"
            className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            Hubungi Kami
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Button asChild size="sm" className="rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black gap-1.5 shadow-sm text-xs font-semibold px-4">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5 text-rose-400" />
                  Dashboard
                </Link>
              </Button>
              <Link href="/profile" className="flex items-center hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8 ring-2 ring-rose-500/20">
                  <AvatarFallback className="bg-gradient-to-tr from-rose-500 to-pink-600 text-white text-xs font-bold">
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
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 border border-rose-400/80 hover:border-rose-600 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow"
              >
                <AtSign className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown modal/pill */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-5 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-semibold text-zinc-800 dark:text-zinc-200 py-2 border-b border-zinc-100 dark:border-zinc-800"
          >
            <span>Cari Event</span>
            <Search className="w-4 h-4 text-zinc-400" />
          </Link>
          <Link
            href="/my-tickets"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-semibold text-zinc-800 dark:text-zinc-200 py-2 border-b border-zinc-100 dark:border-zinc-800"
          >
            <span>Lacak Pesanan</span>
            <Ticket className="w-4 h-4 text-zinc-400" />
          </Link>
          <Link
            href="/events?discount=true"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-semibold text-rose-600 dark:text-rose-400 py-2 border-b border-zinc-100 dark:border-zinc-800"
          >
            <span>Promo Diskon Spesial</span>
            <Sparkles className="w-4 h-4 text-rose-500" />
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-semibold text-zinc-800 dark:text-zinc-200 py-2"
          >
            <span>Hubungi Kami</span>
            <PhoneCall className="w-4 h-4 text-zinc-400" />
          </Link>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
            {session?.user ? (
              <Button asChild className="w-full rounded-full bg-zinc-900 text-white gap-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  Ke Dashboard
                </Link>
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button asChild variant="outline" className="rounded-full border-rose-300 text-rose-600 hover:bg-rose-50">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Daftar
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
