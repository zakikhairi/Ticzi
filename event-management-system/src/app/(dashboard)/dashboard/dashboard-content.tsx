'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle,
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

  return <ParticipantDashboard stats={stats} recentItems={recentItems} />;
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

function ParticipantDashboard({ stats, recentItems }: { stats: any; recentItems: any }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participant Dashboard</h1>
          <p className="text-muted-foreground">Track your event registrations, digital tickets, and attendances.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/my-tickets">
              <Ticket className="h-4 w-4 mr-2" />
              My Tickets
            </Link>
          </Button>
          <Button asChild>
            <Link href="/events">
              <Calendar className="h-4 w-4 mr-2" />
              Browse Events
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Registered Events"
          value={stats?.totalRegistered || 0}
          icon={Calendar}
          description="Total registrations"
        />
        <StatCard
          title="Upcoming Events"
          value={stats?.upcoming || 0}
          icon={Clock}
          description="Events to attend"
        />
        <StatCard
          title="Completed Events"
          value={stats?.completed || 0}
          icon={CheckCircle}
          description="Past attendances"
        />
        <StatCard
          title="Check-ins Verified"
          value={stats?.checkedIn || 0}
          icon={QrCode}
          description="Successful check-ins"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">My Upcoming Events & Tickets</CardTitle>
            <CardDescription>Events you have registered to attend</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/my-tickets">
              View All Tickets <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentItems?.upcomingEvents?.length > 0 ? (
            <div className="space-y-4">
              {recentItems.upcomingEvents.map((registration: any) => (
                <div
                  key={registration.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-lg border bg-card hover:bg-accent/30 transition-colors gap-3"
                >
                  <div className="flex items-center gap-4">
                    {registration.event.bannerUrl ? (
                      <img
                        src={registration.event.bannerUrl}
                        alt={registration.event.name}
                        className="h-14 w-14 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center border">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{registration.event.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(registration.event.startDate)}</span>
                        <span>•</span>
                        <span>{registration.event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0">
                    <div className="flex flex-col sm:items-end gap-0.5">
                      <Badge variant={registration.checkIn ? 'success' : 'default'} className="text-[11px]">
                        {registration.checkIn ? 'Checked In' : 'Confirmed'}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {registration.ticket?.name || 'General Ticket'}
                      </span>
                    </div>
                    <Button asChild size="sm" variant="outline" className="text-xs">
                      <Link href={`/my-tickets/${registration.id}`}>
                        Open Ticket
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Ticket className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="font-medium text-foreground text-sm">No event registrations found</p>
              <p className="text-muted-foreground text-xs mt-1 mb-4">Discover exciting events and reserve your pass.</p>
              <Button asChild size="sm">
                <Link href="/events">Browse Events</Link>
              </Button>
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
