'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
  Ticket,
  Eye,
  BarChart3,
  QrCode,
  Globe,
  Archive,
  Loader2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

export default function AllEventsPage() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null);

  const fetchEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events/my-events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Could not load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleTogglePublish = async (event: any) => {
    const isPublished = event.status === 'PUBLISHED';
    const endpoint = isPublished
      ? `/api/events/${event.id}/unpublish`
      : `/api/events/${event.id}/publish`;

    try {
      setActionInProgress(event.id);
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event status');

      toast({
        title: isPublished ? 'Event Unpublished' : 'Event Published',
        description: `"${event.name}" is now ${isPublished ? 'a draft' : 'published to the public'}.`,
      });
      fetchEvents();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        !search.trim() ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.organizer?.name && e.organizer.name.toLowerCase().includes(search.toLowerCase())) ||
        (e.category?.name && e.category.name.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [events, search, statusFilter]);

  const stats = React.useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.status === 'PUBLISHED').length;
    const drafts = events.filter((e) => e.status === 'DRAFT').length;
    const totalRegs = events.reduce((acc, cur) => acc + (cur._count?.registrations || 0), 0);
    return { total, published, drafts, totalRegs };
  }, [events]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Published
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="outline" className="gap-1 font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="secondary" className="gap-1 font-medium">
            Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive" className="gap-1 font-medium">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All Events Administration</h1>
          <p className="text-muted-foreground text-sm">
            Platform-wide event directory across all registered organizers.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/manage-events/create">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Created on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Published Events</CardTitle>
            <Globe className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.published}</div>
            <p className="text-xs text-muted-foreground mt-1">Live and accepting registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Draft Events</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.drafts}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpublished drafts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.totalRegs}</div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by event or organizer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">No events found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search || statusFilter !== 'ALL'
                  ? 'No events match the selected criteria.'
                  : 'No events have been created on the system yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Event Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead className="text-center">Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((ev) => {
                    const isBusy = actionInProgress === ev.id;
                    return (
                      <TableRow key={ev.id}>
                        <TableCell>
                          <div className="font-semibold text-sm line-clamp-1">{ev.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{ev.location}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {ev.category?.name || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium">{ev.organizer?.name || 'Unknown'}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(ev.startDate)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-xs">
                            {ev._count?.registrations || 0}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(ev.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePublish(ev)}
                              disabled={isBusy}
                              className="text-xs h-8 px-2"
                              title={ev.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            >
                              {isBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : ev.status === 'PUBLISHED' ? (
                                'Unpublish'
                              ) : (
                                'Publish'
                              )}
                            </Button>

                            <Button asChild variant="ghost" size="icon" title="View Public Page">
                              <Link href={`/events/${ev.slug}`} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>

                            <Button asChild variant="ghost" size="icon" title="Check-In Scanner">
                              <Link href={`/manage-events/${ev.id}/check-in`}>
                                <QrCode className="h-4 w-4" />
                              </Link>
                            </Button>

                            <Button asChild variant="ghost" size="icon" title="Reports & Analytics">
                              <Link href={`/reports?eventId=${ev.id}`}>
                                <BarChart3 className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
