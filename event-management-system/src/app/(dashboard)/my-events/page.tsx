'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  Ticket,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export default function MyEventsParticipantPage() {
  const { data: session } = useSession();
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    async function loadRegistrations() {
      try {
        setLoading(true);
        const res = await fetch('/api/my-tickets');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setRegistrations(data.registrations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadRegistrations();
  }, []);

  const filteredRegistrations = React.useMemo(() => {
    if (!search.trim()) return registrations;
    const q = search.toLowerCase();
    return registrations.filter(
      (r) =>
        r.event?.name.toLowerCase().includes(q) ||
        r.event?.location.toLowerCase().includes(q) ||
        r.ticket?.name.toLowerCase().includes(q)
    );
  }, [registrations, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Registered Events</h1>
          <p className="text-muted-foreground text-sm">
            Events you have signed up for or purchased tickets to attend.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/my-tickets">
              <Ticket className="h-4 w-4 mr-2" />
              All Tickets
            </Link>
          </Button>
          <Button asChild>
            <Link href="/events">Browse More Events</Link>
          </Button>
        </div>
      </div>

      {/* Search filter */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search registered events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Cards list */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-medium">No registered events yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Explore upcoming events and reserve your spot.
            </p>
            <Button asChild>
              <Link href="/events">Explore Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRegistrations.map((reg) => (
            <Card key={reg.id} className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {reg.event?.category?.name || 'Event'}
                  </Badge>
                  <Badge
                    variant={reg.checkIn ? 'secondary' : 'default'}
                    className={reg.checkIn ? 'bg-emerald-600 text-white' : undefined}
                  >
                    {reg.checkIn ? 'Checked In' : reg.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-1">{reg.event?.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{reg.event?.location}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 pb-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatDate(reg.event?.startDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="font-medium text-foreground">
                    {reg.ticket?.name}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ({reg.ticketCode})
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t bg-muted/20 flex items-center justify-between gap-2">
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link href={`/events/${reg.event?.slug}`}>
                    Details <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
                <Button asChild size="sm" className="text-xs">
                  <Link href={`/my-tickets/${reg.id}`}>
                    Digital Ticket <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
