'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Upload,
  Download,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteEvent, setDeleteEvent] = React.useState<any>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (status === 'authenticated') {
      loadEvents();
    }
  }, [status]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events/my-events');
      const data = await response.json();
      if (response.ok) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/publish`, {
        method: 'POST',
      });
      if (response.ok) {
        toast({ title: 'Event published successfully' });
        loadEvents();
      }
    } catch (error) {
      toast({ title: 'Failed to publish event', variant: 'destructive' });
    }
  };

  const handleUnpublish = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/unpublish`, {
        method: 'POST',
      });
      if (response.ok) {
        toast({ title: 'Event unpublished' });
        loadEvents();
      }
    } catch (error) {
      toast({ title: 'Failed to unpublish event', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteEvent) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/events/${deleteEvent.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast({ title: 'Event deleted successfully' });
        setDeleteEvent(null);
        loadEvents();
      }
    } catch (error) {
      toast({ title: 'Failed to delete event', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: 'secondary',
      PUBLISHED: 'success',
      ONGOING: 'info',
      COMPLETED: 'secondary',
      CANCELLED: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Manage your events</p>
        </div>
        <Button asChild>
          <Link href="/manage-events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No events yet</h3>
          <p className="mb-4 text-muted-foreground">
            Create your first event to get started
          </p>
          <Button asChild>
            <Link href="/manage-events/create">Create Event</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.bannerUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={event.bannerUrl}
                    alt={event.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  {getStatusBadge(event.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${event.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Public Page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/manage-events/${event.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Event
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/manage-events/${event.id}/tickets`}>
                          <Ticket className="mr-2 h-4 w-4" />
                          Manage Tickets
                        </Link>
                      </DropdownMenuItem>
                      {event.status === 'DRAFT' && (
                        <DropdownMenuItem onClick={() => handlePublish(event.id)}>
                          <Upload className="mr-2 h-4 w-4" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {event.status === 'PUBLISHED' && (
                        <DropdownMenuItem onClick={() => handleUnpublish(event.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Unpublish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteEvent(event)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(event.startDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {event.category?.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {event._count?.registrations || 0}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="grid grid-cols-3 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/manage-events/${event.id}/tickets`}>
                    <Ticket className="mr-1 h-4 w-4" />
                    Tickets
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/manage-events/${event.id}/participants`}>
                    <Users className="mr-1 h-4 w-4" />
                    Attendees
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/manage-events/${event.id}/check-in`}>
                    Check-in
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteEvent} onOpenChange={() => setDeleteEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteEvent?.name}"? This action
              cannot be undone and will also delete all associated registrations
              and tickets.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEvent(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
