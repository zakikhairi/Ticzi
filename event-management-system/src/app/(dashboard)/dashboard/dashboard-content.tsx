'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  QrCode,
  Ticket,
  TrendingUp,
  Users,
  ArrowRight,
  Shield,
  Tags,
  UserCog,
  BarChart3,
  Sliders,
  Eye,
  ExternalLink,
  CreditCard,
  AlertCircle,
  CalendarCheck,
  Loader2,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { formatDate } from '@/lib/utils';

interface DashboardContentProps {
  userId: string;
  userRole: string;
}

export function DashboardContent({ userId, userRole }: DashboardContentProps) {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<any>(null);
  const [recentItems, setRecentItems] = React.useState<any>(null);

  React.useEffect(() => {
    loadDashboardData();
  }, [userId, userRole]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentItems(data.recentItems);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (userRole === 'SUPER_ADMIN') {
    return <AdminDashboard stats={stats} recentItems={recentItems} />;
  }

  if (userRole === 'ORGANIZER') {
    return <OrganizerDashboard stats={stats} recentItems={recentItems} />;
  }

  return <ParticipantDashboard stats={stats} recentItems={recentItems} onRefresh={loadDashboardData} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

function AdminDashboard({ stats, recentItems }: { stats: any; recentItems: any }) {
  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">Platform-wide health, activity metrics, and governance controls.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/users">
              <Users className="h-4 w-4" /> Users
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/all-events">
              <Calendar className="h-4 w-4" /> All Events
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/categories">
              <Tags className="h-4 w-4" /> Categories
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/audit-logs">
              <FileText className="h-4 w-4" /> Audit Logs
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/reports">
              <BarChart3 className="h-4 w-4" /> Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          description="Registered accounts"
        />
        <StatCard
          title="Organizers"
          value={stats?.totalOrganizers || 0}
          icon={UserCog}
          description="Event creators"
        />
        <StatCard
          title="Participants"
          value={stats?.totalParticipants || 0}
          icon={Ticket}
          description="Active attendees"
        />
        <StatCard
          title="Total Events"
          value={stats?.totalEvents || 0}
          icon={Calendar}
          description="Platform events"
        />
        <StatCard
          title="Registrations"
          value={stats?.totalRegistrations || 0}
          icon={FileText}
          description="Ticket reservations"
        />
        <StatCard
          title="Check-ins"
          value={stats?.totalCheckIns || 0}
          icon={CheckCircle}
          description="Verified presences"
        />
      </div>

      {/* Analytics Visualizations */}
      {recentItems?.trend && (
        <DashboardCharts
          trendData={recentItems.trend}
          ticketSalesData={recentItems.ticketSales}
          eventStatusData={recentItems.eventStatus}
          stats={stats}
        />
      )}

      {/* Recent Platform Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent & Upcoming Events</CardTitle>
              <CardDescription>Latest events created across the system</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/all-events">
                View All <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentItems?.upcoming?.length > 0 ? (
              <div className="space-y-3">
                {recentItems.upcoming.map((ev: any) => (
                  <div key={ev.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-sm truncate">{ev.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(ev.startDate)} • {ev.location}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      {ev._count?.registrations || 0} registered
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent events recorded.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Audit Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Latest Audit Records</CardTitle>
              <CardDescription>Security & administrative changes</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/audit-logs">
                All Logs <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentItems?.recentAuditLogs?.length > 0 ? (
              <div className="space-y-3">
                {recentItems.recentAuditLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                          {log.action}
                        </Badge>
                        <span className="text-xs text-foreground font-medium truncate">
                          {log.user?.name || 'System'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-mono">
                        {log.entity} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ''}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent audit logs available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrganizerDashboard({ stats, recentItems }: { stats: any; recentItems: any }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Manage your events, ticketing, and live check-ins.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="gap-2">
            <Link href="/manage-events/create">
              <Calendar className="h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={stats?.totalEvents || 0}
          icon={Calendar}
          description={`${stats?.publishedEvents || 0} published`}
        />
        <StatCard
          title="Total Participants"
          value={stats?.totalParticipants || 0}
          icon={Users}
          description="Registered"
        />
        <StatCard
          title="Check-ins"
          value={stats?.totalCheckIns || 0}
          icon={CheckCircle}
          description={`${Math.round(stats?.checkInPercentage || 0)}% rate`}
        />
        <StatCard
          title="Tickets Sold"
          value={stats?.totalTicketsSold || 0}
          icon={Ticket}
          description="Across all events"
        />
      </div>

      {/* Analytics & Visualizations */}
      <DashboardCharts
        trendData={recentItems?.trend}
        ticketSalesData={recentItems?.ticketSales}
        eventStatusData={recentItems?.eventStatus}
        stats={stats}
      />

      {stats?.checkInPercentage > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Check-in Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.checkInPercentage} className="h-4" />
            <p className="mt-2 text-sm text-muted-foreground">
              {Math.round(stats.checkInPercentage)}% of registered participants have checked in
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
              <CardDescription>Your scheduled events</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/manage-events">
                View All <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentItems?.upcoming?.length > 0 ? (
              <div className="space-y-3">
                {recentItems.upcoming.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors">
                    <div>
                      <p className="font-semibold text-sm">{event.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(event.startDate)}
                      </p>
                    </div>
                    <Badge variant="secondary">{event._count?.registrations || 0} registered</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming events found.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Check-ins</CardTitle>
              <CardDescription>Latest attendees checked in</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/reports">
                Reports <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentItems?.recentCheckIns?.length > 0 ? (
              <div className="space-y-3">
                {recentItems.recentCheckIns.map((checkIn: any) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
                    <div>
                      <p className="font-semibold text-sm">{checkIn.participant.name}</p>
                      <p className="text-xs text-muted-foreground">{checkIn.event.name}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">Checked In</Badge>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDate(checkIn.checkedInAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No check-ins recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ParticipantDashboard({
  stats,
  recentItems,
  onRefresh,
}: {
  stats: any;
  recentItems: any;
  onRefresh?: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState<'all' | 'upcoming' | 'used' | 'unpaid'>('all');
  const [payingId, setPayingId] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Extract all registrations/tickets
  const allTickets: any[] = recentItems?.tickets || recentItems?.upcomingEvents || [];
  const now = new Date();

  // Categorize tickets
  const upcomingList = allTickets.filter(
    (r) => r.status === 'CONFIRMED' && !r.checkIn && new Date(r.event.startDate) >= now
  );

  const usedList = allTickets.filter(
    (r) =>
      r.status === 'CHECKED_IN' ||
      !!r.checkIn ||
      r.event.status === 'COMPLETED' ||
      (r.status === 'CONFIRMED' && new Date(r.event.startDate) < now)
  );

  const unpaidList = allTickets.filter((r) => r.status === 'PENDING');

  const ownedList = allTickets.filter((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN');

  // Filter based on active tab
  const displayedTickets = React.useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingList;
      case 'used':
        return usedList;
      case 'unpaid':
        return unpaidList;
      case 'all':
      default:
        return allTickets;
    }
  }, [activeTab, allTickets, upcomingList, usedList, unpaidList]);

  // Counts
  const ownedCount = stats?.ownedTickets ?? ownedList.length;
  const upcomingCount = stats?.upcomingTickets ?? upcomingList.length;
  const usedCount = stats?.usedTickets ?? usedList.length;
  const unpaidCount = stats?.unpaidTickets ?? unpaidList.length;

  const handlePayTicket = async (registrationId: string, eventName: string) => {
    setPayingId(registrationId);
    setNotification(null);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/pay`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Pembayaran tiket "${eventName}" berhasil! Tiket Anda sekarang aktif dan siap digunakan.`,
        });
        if (onRefresh) onRefresh();
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Gagal memproses pembayaran tiket.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Terjadi kesalahan sistem saat memproses pembayaran.',
      });
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participant Dashboard</h1>
          <p className="text-muted-foreground">
            Kelola tiket yang Anda punya, event mendatang, tiket terpakai, dan status pembayaran.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/my-tickets">
              <Ticket className="h-4 w-4 mr-2 text-rose-500" />
              Semua Tiket Saya
            </Link>
          </Button>
          <Button asChild className="rounded-full bg-zinc-900 hover:bg-black text-white">
            <Link href="/events">
              <Calendar className="h-4 w-4 mr-2" />
              Jelajahi Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Dedicated Ticket Categories (Stat Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Tiket Yang Anda Punya */}
        <button
          onClick={() => setActiveTab('all')}
          className={`text-left transition-all rounded-2xl border p-5 bg-card hover:shadow-md ${
            activeTab === 'all'
              ? 'ring-2 ring-rose-500 border-rose-500/50 shadow-sm bg-rose-50/20 dark:bg-rose-950/10'
              : 'hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Tiket Anda Punya
            </span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-white">
            {ownedCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Total tiket aktif & valid dimiliki</p>
        </button>

        {/* 2. Tiket Akan Berlangsung */}
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`text-left transition-all rounded-2xl border p-5 bg-card hover:shadow-md ${
            activeTab === 'upcoming'
              ? 'ring-2 ring-amber-500 border-amber-500/50 shadow-sm bg-amber-50/20 dark:bg-amber-950/10'
              : 'hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Akan Berlangsung
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-white">
            {upcomingCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Tiket mendatang & siap dipakai</p>
        </button>

        {/* 3. Tiket Sudah Digunakan */}
        <button
          onClick={() => setActiveTab('used')}
          className={`text-left transition-all rounded-2xl border p-5 bg-card hover:shadow-md ${
            activeTab === 'used'
              ? 'ring-2 ring-emerald-500 border-emerald-500/50 shadow-sm bg-emerald-50/20 dark:bg-emerald-950/10'
              : 'hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Sudah Digunakan
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-white">
            {usedCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Telah check-in / hadir di acara</p>
        </button>

        {/* 4. Tiket Belum Dibayar */}
        <button
          onClick={() => setActiveTab('unpaid')}
          className={`text-left transition-all rounded-2xl border p-5 bg-card hover:shadow-md ${
            activeTab === 'unpaid'
              ? 'ring-2 ring-red-500 border-red-500/50 shadow-sm bg-red-50/20 dark:bg-red-950/10'
              : 'hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Belum Dibayar
            </span>
            <div className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-white">
            {unpaidCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Menunggu pelunasan pembayaran</p>
        </button>
      </div>

      {/* Main Ticket Center Container */}
      <Card className="rounded-3xl border shadow-sm overflow-hidden">
        <CardHeader className="p-6 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Daftar Tiket Acara Anda</CardTitle>
              <CardDescription>
                Pilih kategori untuk melihat tiket yang Anda miliki, jadwal mendatang, tiket terpakai, atau tagihan.
              </CardDescription>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Semua ({allTickets.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'upcoming'
                    ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Akan Berlangsung ({upcomingCount})
              </button>
              <button
                onClick={() => setActiveTab('used')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'used'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Sudah Digunakan ({usedCount})
              </button>
              <button
                onClick={() => setActiveTab('unpaid')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'unpaid'
                    ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Belum Dibayar ({unpaidCount})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {displayedTickets.length > 0 ? (
            <div className="space-y-4">
              {displayedTickets.map((registration: any) => {
                const isUnpaid = registration.status === 'PENDING';
                const isCheckedIn = registration.checkIn || registration.status === 'CHECKED_IN';
                const isUpcoming =
                  registration.status === 'CONFIRMED' &&
                  !isCheckedIn &&
                  new Date(registration.event.startDate) >= now;
                const isPast =
                  registration.event.status === 'COMPLETED' ||
                  new Date(registration.event.startDate) < now;

                const priceNumber = Number(registration.ticket?.price || 0);
                const priceFormatted =
                  priceNumber > 0 ? `Rp ${priceNumber.toLocaleString('id-ID')}` : 'Gratis';

                return (
                  <div
                    key={registration.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
                      isUnpaid
                        ? 'border-red-200 bg-red-50/20 dark:border-red-950 dark:bg-red-950/10'
                        : isCheckedIn
                        ? 'border-emerald-200/80 bg-emerald-50/10 dark:border-emerald-950'
                        : 'border-zinc-200 dark:border-zinc-800 bg-card hover:shadow-sm'
                    }`}
                  >
                    {/* Event & Ticket Details */}
                    <div className="flex items-start sm:items-center gap-4">
                      {registration.event.bannerUrl ? (
                        <img
                          src={registration.event.bannerUrl}
                          alt={registration.event.name}
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border flex-shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-muted flex items-center justify-center border flex-shrink-0 text-rose-500">
                          <Ticket className="h-8 w-8 opacity-60" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {registration.event.category?.name || 'Event'}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            Kode: {registration.ticketCode}
                          </span>
                        </div>

                        <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white line-clamp-1">
                          {registration.event.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-rose-500" />
                            <span>{formatDate(registration.event.startDate)}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="truncate max-w-[200px]">
                              {registration.event.location}
                            </span>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center gap-2 text-xs">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {registration.ticket?.name || 'Tiket Masuk'}
                          </span>
                          <span className="text-zinc-400">|</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                            {priceFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges & Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                      <div className="flex flex-col sm:items-end gap-1">
                        {isUnpaid ? (
                          <Badge
                            variant="outline"
                            className="border-red-400 bg-red-100/70 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full"
                          >
                            💳 Belum Dibayar
                          </Badge>
                        ) : isCheckedIn ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full"
                          >
                            ✓ Sudah Digunakan
                          </Badge>
                        ) : isUpcoming ? (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            ⏳ Siap Digunakan
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-zinc-500 rounded-full">
                            Selesai
                          </Badge>
                        )}

                        <span className="text-[11px] text-muted-foreground">
                          {isUnpaid
                            ? 'Menunggu konfirmasi'
                            : isCheckedIn
                            ? 'Check-in terverifikasi'
                            : 'Tiket valid & aktif'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUnpaid ? (
                          <Button
                            onClick={() => handlePayTicket(registration.id, registration.event.name)}
                            disabled={payingId === registration.id}
                            className="rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold text-xs px-4 shadow-sm"
                          >
                            {payingId === registration.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Memproses...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                                Bayar Sekarang
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            asChild
                            size="sm"
                            className="rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black font-semibold text-xs px-4"
                          >
                            <Link href={`/my-tickets/${registration.id}`}>
                              <QrCode className="w-3.5 h-3.5 mr-1.5" />
                              Buka Tiket (QR)
                            </Link>
                          </Button>
                        )}

                        <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
                          <Link href={`/events/${registration.event.slug}`}>
                            Detail
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                <Ticket className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-foreground">
                {activeTab === 'upcoming'
                  ? 'Tidak ada tiket yang akan berlangsung'
                  : activeTab === 'used'
                  ? 'Belum ada tiket yang digunakan'
                  : activeTab === 'unpaid'
                  ? 'Tidak ada tagihan tiket yang belum dibayar'
                  : 'Belum ada tiket yang terdaftar'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {activeTab === 'unpaid'
                  ? 'Semua tiket Anda sudah lunas atau gratis. Selamat menikmati acara!'
                  : 'Jelajahi berbagai event seru di Ticzi dan dapatkan tiket digital Anda sekarang.'}
              </p>
              <div className="mt-4">
                <Button asChild size="sm" className="rounded-full bg-rose-600 hover:bg-rose-700 text-white">
                  <Link href="/events">Cari Event Menarik</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
