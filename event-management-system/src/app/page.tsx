import Link from 'next/link';
import {
  Calendar,
  CheckCircle,
  MapPin,
  QrCode,
  Search,
  Ticket,
  Users,
  Zap,
  ArrowRight,
  ShieldCheck,
  Star,
  Globe,
  Headphones,
  Bell,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/layout/public-header';
import prisma from '@/lib/prisma';

async function getFeaturedEvents() {
  return prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    take: 6,
    orderBy: { startDate: 'asc' },
    include: {
      category: true,
      organizer: { select: { name: true } },
      tickets: {
        orderBy: { price: 'asc' },
        take: 1,
      },
      _count: { select: { registrations: true } },
    },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { events: true } } },
  });
}

export default async function HomePage() {
  const [featuredEvents, categories] = await Promise.all([
    getFeaturedEvents(),
    getCategories(),
  ]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FBFBFA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-rose-500 selection:text-white">
      {/* Floating Capsule Header */}
      <PublicHeader />

      {/* Hero Section Container */}
      <section className="relative pt-6 sm:pt-10 pb-16 overflow-hidden">
        {/* Ambient Decorative Stars & Glows */}
        <div className="absolute top-12 left-1/4 w-3 h-3 text-amber-400 animate-pulse pointer-events-none">
          ⭐
        </div>
        <div className="absolute top-24 right-1/4 w-3 h-3 text-rose-400 animate-pulse delay-300 pointer-events-none">
          ✨
        </div>
        <div className="absolute top-8 right-12 w-2.5 h-2.5 text-yellow-300 animate-pulse delay-700 pointer-events-none">
          ⭐
        </div>

        {/* Floating Search Pill Bar */}
        <div className="container mx-auto px-4 mb-8 sm:mb-12">
          <form
            action="/events"
            method="GET"
            className="max-w-xl mx-auto relative flex items-center bg-white dark:bg-zinc-900 rounded-full shadow-lg shadow-zinc-900/5 border border-zinc-200/90 dark:border-zinc-800 p-1.5 pl-5 transition-all hover:shadow-xl hover:border-zinc-300 focus-within:ring-2 focus-within:ring-rose-500/20"
          >
            <Search className="w-5 h-5 text-zinc-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              name="search"
              placeholder="Cari konser, festival, seminar, atau artis..."
              className="w-full bg-transparent border-none text-sm sm:text-base outline-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
            />
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 text-xs px-3 border-l border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Semua Kota</span>
            </div>
            <button
              type="submit"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center flex-shrink-0 ml-2 transition-transform hover:scale-105 active:scale-95 shadow"
              aria-label="Cari Event"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>

        {/* 3 Bento Highlight Cards (Dark Glowing Theme) */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7">
            {/* CARD 1: WELCOME TO TICZI / DIGITAL TICKETING */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#161220] via-[#0E0B16] to-[#07050C] text-white p-6 sm:p-7 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-pink-500/30 transition-all duration-300">
              {/* Glow Accent */}
              <div className="absolute -top-24 -left-24 w-56 h-56 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Brand Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 text-xs font-bold">
                    ✕
                  </div>
                  <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    TICZI
                  </span>
                </div>

                <span className="text-xs font-bold tracking-wider text-pink-400 uppercase">
                  WELCOME TO
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300">
                  TICZI
                </h3>
                <p className="text-sm font-semibold text-zinc-200 mb-1">
                  Smart Ticketing, Better Experience
                </p>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Platform tiket digital untuk setiap momen berharga. Cepat, aman, dan tanpa repot.
                </p>

                {/* Smartphone Preview Visual */}
                <div className="relative mx-auto my-3 w-56 bg-zinc-900/90 rounded-2xl p-3 border border-zinc-700/60 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-2 mb-2 border-b border-zinc-800">
                    <span className="font-semibold text-white">✕ TICZI Pass</span>
                    <span className="text-emerald-400">● Valid</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center shadow-md">
                    <QrCode className="w-24 h-24 text-zinc-900" />
                    <span className="text-[9px] font-mono text-zinc-500 mt-1 tracking-widest">
                      TCZ-8921-X9A
                    </span>
                  </div>
                  <div className="mt-2 text-center text-[10px] text-zinc-300 font-medium">
                    Konser Musik Nusantara 2026
                  </div>
                </div>

                {/* 4 Micro Feature Pills */}
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5 text-center">
                    <span className="text-[11px] text-zinc-300 font-medium">✨ Pesan Mudah</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5 text-center">
                    <span className="text-[11px] text-zinc-300 font-medium">⚡ Cepat & Praktis</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5 text-center">
                    <span className="text-[11px] text-zinc-300 font-medium">🛡️ Aman Terpercaya</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5 text-center">
                    <span className="text-[11px] text-zinc-300 font-medium">🔔 Notifikasi Real-Time</span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-6 pt-2">
                <Button
                  asChild
                  className="w-full rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-pink-500/20 py-2.5"
                >
                  <Link href="/events">Mulai Pesan Tiketmu</Link>
                </Button>
              </div>
            </div>

            {/* CARD 2: SPECIAL DEALS & 30% OFF */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#1F0E1B] via-[#130711] to-[#090208] text-white p-6 sm:p-7 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
              {/* Glow Accent */}
              <div className="absolute -top-24 -right-24 w-56 h-56 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Brand Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold">
                    ✕
                  </div>
                  <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    TICZI
                  </span>
                </div>

                <div className="mb-2">
                  <span className="font-serif italic text-amber-200 text-xl block">
                    Dapatkan
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">
                    DISKON SPESIAL
                  </h3>
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    untuk Event Pilihan
                  </span>
                </div>

                {/* Big 30% OFF & Ticket Graphic */}
                <div className="my-6 relative bg-gradient-to-br from-rose-950/40 to-pink-900/20 border border-rose-500/30 rounded-2xl p-5 text-center overflow-hidden">
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-md">
                    UP TO <span className="text-rose-400">30%</span> OFF
                  </div>

                  {/* 3D Ticket Visual */}
                  <div className="mt-4 mx-auto max-w-[200px] bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl p-3 shadow-lg flex items-center justify-between border-dashed border-2 border-rose-300/40">
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-widest font-bold block text-rose-200">
                        PROMO CODE
                      </span>
                      <span className="text-xs font-mono font-extrabold tracking-wider">
                        TICZIFUN30
                      </span>
                    </div>
                    <div className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase">
                      ADMIT 1
                    </div>
                  </div>
                </div>

                {/* 3 Highlights */}
                <div className="space-y-2.5 mt-4">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <div className="h-5 w-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                      🎟️
                    </div>
                    <span>Ribuan Event Setiap Bulan</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <div className="h-5 w-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                      🎵
                    </div>
                    <span>Konser, Festival & Olahraga</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <div className="h-5 w-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                      ⭐
                    </div>
                    <span>Promo Terbaru Eksklusif</span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-6 pt-2">
                <Button
                  asChild
                  className="w-full rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Link href="/events?discount=true">
                    <span>Cek Event Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* CARD 3: ALL IN ONE PLATFORM ECOSYSTEM */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#111728] via-[#0A0E1C] to-[#050711] text-white p-6 sm:p-7 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
              {/* Glow Accent */}
              <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Brand Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                    ✕
                  </div>
                  <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    TICZI
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 leading-tight">
                  Semua yang Kamu Butuhkan, Dalam{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                    Satu Platform.
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Solusi terintegrasi untuk penonton, peserta seminar, dan penyelenggara event.
                </p>

                {/* 4 Feature Rows */}
                <div className="space-y-3.5 my-4">
                  <div className="flex items-start gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Booking Instan</h4>
                      <p className="text-[11px] text-zinc-400">Pesan tiket kapan saja dengan konfirmasi otomatis</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 flex-shrink-0 mt-0.5">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Scan QR Cepat</h4>
                      <p className="text-[11px] text-zinc-400">Masuk venue tanpa antre berbelit</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Transaksi Aman</h4>
                      <p className="text-[11px] text-zinc-400">Tiket resmi terjamin 100% dan terverifikasi</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Update Real-Time</h4>
                      <p className="text-[11px] text-zinc-400">Info rundown event & promo terkini langsung di dashboard</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-6 pt-2">
                <Button
                  asChild
                  className="w-full rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Link href="/register">
                    <span>Gabung di TICZI Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Trust Badges Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-3.5 px-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Authorized Partner</span>
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instan & Praktis</span>
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Rating Terbaik</span>
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Event Nasional</span>
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <Headphones className="w-4 h-4 text-rose-500" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Pill Scroller */}
      {categories.length > 0 && (
        <section className="py-6 border-y border-zinc-200/60 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:justify-center">
              <Link
                href="/events"
                className="px-4 py-2 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 whitespace-nowrap shadow-sm"
              >
                Semua Kategori
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/events?category=${category.id}`}
                  className="px-4 py-2 rounded-full text-xs font-medium bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-nowrap transition-all shadow-sm hover:shadow"
                >
                  <span className="mr-1.5">{getCategoryIcon(category.name)}</span>
                  {category.name}
                  <span className="ml-1 text-[10px] text-zinc-400 font-normal">
                    ({category._count.events})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Events Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rekomendasi Event Pilihan</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Jangan Lewatkan Keseruan Ini
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Jelajahi konser musik, festival budaya, hingga workshop teknologi terkini.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 group"
            >
              <span>Lihat Semua Event</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
              <Ticket className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                Belum ada event yang dipublikasikan
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Kembali lagi nanti atau login sebagai organizer untuk membuat event baru.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => {
                const cheapestTicket = event.tickets[0];
                const priceFormatted =
                  cheapestTicket && Number(cheapestTicket.price) > 0
                    ? `Rp ${Number(cheapestTicket.price).toLocaleString('id-ID')}`
                    : 'Gratis';

                return (
                  <div
                    key={event.id}
                    className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image / Banner */}
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {event.bannerUrl ? (
                          <img
                            src={event.bannerUrl}
                            alt={event.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-rose-100 to-pink-50 dark:from-zinc-900 dark:to-zinc-800 text-rose-500">
                            <Ticket className="w-12 h-12 opacity-40" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800">
                          {event.category.name}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-zinc-900/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow">
                          {priceFormatted}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-rose-500" />
                            <span>
                              {new Date(event.startDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {event.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]">
                            Oleh <span className="font-semibold text-zinc-700 dark:text-zinc-300">{event.organizer.name}</span>
                          </span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            {event._count.registrations} Peserta
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <Button
                        asChild
                        className="w-full rounded-full bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs py-2.5 transition-all shadow-sm group-hover:shadow"
                      >
                        <Link href={`/events/${event.slug}`}>
                          <span>Lihat & Pesan Tiket</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How it Works / 4 Langkah Mudah */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white dark:bg-zinc-900/50 border-t border-zinc-200/70 dark:border-zinc-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              Langkah Sederhana
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Cara Mudah Menggunakan Ticzi
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Hanya butuh 4 langkah mudah untuk mengamankan tiket acaramu tanpa antre berbelit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Cari Event',
                desc: 'Temukan konser, festival, atau workshop favoritmu.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Pilih Tiket',
                desc: 'Tentukan jumlah tiket dan isi data diri dengan cepat.',
                icon: Ticket,
              },
              {
                step: '03',
                title: 'Dapatkan QR Pass',
                desc: 'Tiket digital ber-QR Code otomatis terbit di akunmu.',
                icon: QrCode,
              },
              {
                step: '04',
                title: 'Scan & Masuk',
                desc: 'Tunjukkan QR Code di pintu masuk venue tanpa repot.',
                icon: CheckCircle,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-[#FBFBFA] dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center"
              >
                <div className="text-xs font-mono font-black text-rose-500 mb-3 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 rounded-full">
                  STEP {item.step}
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-[#1F0E1B] text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-zinc-800 text-center">
            {/* Ambient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                Mulai Sekarang
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-4">
                Siap Menyelenggarakan atau Menghadiri Event Seru?
              </h2>
              <p className="text-sm text-zinc-300 mb-8 leading-relaxed">
                Bergabunglah bersama ribuan penyelenggara dan peserta di seluruh Indonesia.
                Daftar sekarang gratis dalam hitungan detik.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:opacity-95 text-white font-semibold px-8 shadow-lg shadow-rose-500/25"
                >
                  <Link href="/register">Buat Akun Gratis</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-full border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 px-8"
                >
                  <Link href="/events">Jelajahi Semua Event</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer id="contact" className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  ✕
                </div>
                <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">
                  Ticzi<span className="text-rose-500">.</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-4">
                Platform manajemen event cerdas & ticketing digital modern.
                Didesain untuk memberikan pengalaman terbaik bagi peserta dan penyelenggara.
              </p>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>📍 Jakarta, Indonesia</span>
                <span>•</span>
                <span>✉️ support@ticzi.com</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                Navigasi
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li>
                  <Link href="/events" className="hover:text-rose-600 transition-colors">
                    Cari Event
                  </Link>
                </li>
                <li>
                  <Link href="/my-tickets" className="hover:text-rose-600 transition-colors">
                    Lacak Pesanan
                  </Link>
                </li>
                <li>
                  <Link href="/events?discount=true" className="hover:text-rose-600 transition-colors">
                    Promo Spesial
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-rose-600 transition-colors">
                    Login / Masuk
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                Untuk Penyelenggara
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li>
                  <Link href="/manage-events/create" className="hover:text-rose-600 transition-colors">
                    Buat Event Baru
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-rose-600 transition-colors">
                    Dashboard Organizer
                  </Link>
                </li>
                <li>
                  <Link href="/manage-events" className="hover:text-rose-600 transition-colors">
                    Scan QR Tiket
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <p>&copy; {new Date().getFullYear()} Ticzi Event Management System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Syarat & Ketentuan</span>
              <span>Kebijakan Privasi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getCategoryIcon(categoryName: string): string {
  const icons: Record<string, string> = {
    Seminar: '🎤',
    Workshop: '🔧',
    Conference: '🏛️',
    Competition: '🏆',
    Webinar: '💻',
    Gathering: '🎉',
    Training: '📚',
    Konser: '🎸',
    Festival: '🎪',
    Other: '📌',
  };
  return icons[categoryName] || '📌';
}

