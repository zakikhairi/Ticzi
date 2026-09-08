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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

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
    return <AdminDashboard stats={stats} />;
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

function AdminDashboard({ stats }: { stats: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Dashboard</h1>
        <p className="text-muted-foreground">Overview of the entire system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          description="Registered users"
        />
        <StatCard
          title="Organizers"
          value={stats?.totalOrganizers || 0}
          icon={Users}
          description="Event organizers"
        />
        <StatCard
          title="Participants"
          value={stats?.totalParticipants || 0}
          icon={Ticket}
          description="Event participants"
        />
        <StatCard
          title="Total Events"
          value={stats?.totalEvents || 0}
          icon={Calendar}
          description="All events"
        />
        <StatCard
          title="Registrations"
          value={stats?.totalRegistrations || 0}
          icon={FileText}
          description="Total registrations"
        />
        <StatCard
          title="Check-ins"
          value={stats?.totalCheckIns || 0}
          icon={CheckCircle}
          description="Total check-ins"
        />
      </div>
    </div>
  );
}

function OrganizerDashboard({ stats, recentItems }: { stats: any; recentItems: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your event overview.</p>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your next events</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/manage-events">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentItems?.upcoming?.length > 0 ? (
              <div className="space-y-4">
                {recentItems.upcoming.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge>{event._count?.registrations || 0} registered</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>Latest check-ins today</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/reports">
                Reports <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentItems?.recentCheckIns?.length > 0 ? (
              <div className="space-y-4">
                {recentItems.recentCheckIns.map((checkIn: any) => (
                  <div key={checkIn.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{checkIn.participant.name}</p>
                      <p className="text-sm text-muted-foreground">{checkIn.event.name}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">Checked In</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(checkIn.checkedInAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent check-ins</p>
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
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Track your event journey</p>
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
          description="Past events"
        />
        <StatCard
          title="Check-ins"
          value={stats?.checkedIn || 0}
          icon={QrCode}
          description="Successful check-ins"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Upcoming Events</CardTitle>
            <CardDescription>Events you're registered for</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/my-tickets">
              View Tickets <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentItems?.upcomingEvents?.length > 0 ? (
            <div className="space-y-4">
              {recentItems.upcomingEvents.map((registration: any) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {registration.event.bannerUrl && (
                      <img
                        src={registration.event.bannerUrl}
                        alt={registration.event.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{registration.event.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(registration.event.startDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <span>•</span>
                        <span>{registration.event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={registration.checkIn ? 'success' : 'info'}>
                      {registration.checkIn ? 'Checked In' : 'Confirmed'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {registration.ticket.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't registered for any events yet</p>
              <Button asChild>
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
