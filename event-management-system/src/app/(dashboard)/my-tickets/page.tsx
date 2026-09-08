import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, QrCode, Ticket as TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function MyTicketsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const registrations = await prisma.registration.findMany({
    where: { participantId: session.user.id },
    include: {
      event: {
        include: {
          category: true,
          organizer: { select: { id: true, name: true } },
        },
      },
      ticket: true,
      checkIn: true,
    },
    orderBy: { registeredAt: 'desc' },
  });

  const upcomingEvents = registrations.filter(
    (r) =>
      new Date(r.event.startDate) >= new Date() &&
      (r.event.status === 'PUBLISHED' || r.event.status === 'ONGOING')
  );

  const pastEvents = registrations.filter(
    (r) =>
      new Date(r.event.startDate) < new Date() || r.event.status === 'COMPLETED'
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">
          View and manage your event tickets
        </p>
      </div>

      {registrations.length === 0 ? (
        <Card className="p-12 text-center">
          <TicketIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No tickets yet</h3>
          <p className="mb-4 text-muted-foreground">
            You haven't registered for any events yet
          </p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">
                Upcoming Events ({upcomingEvents.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((registration) => (
                  <TicketCard key={registration.id} registration={registration} />
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">
                Past Events ({pastEvents.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((registration) => (
                  <TicketCard key={registration.id} registration={registration} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TicketCardProps {
  registration: any;
}

function TicketCard({ registration }: TicketCardProps) {
  const event = registration.event;
  const ticket = registration.ticket;

  return (
    <Card className="overflow-hidden">
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
          <Badge variant="secondary">{ticket.name}</Badge>
          <Badge
            variant={
              registration.status === 'CHECKED_IN'
                ? 'success'
                : registration.status === 'CONFIRMED'
                ? 'info'
                : 'secondary'
            }
          >
            {registration.status.replace('_', ' ')}
          </Badge>
        </div>
        <CardTitle className="line-clamp-1 text-lg">{event.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(event.startDate).toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div>
            <p className="text-xs text-muted-foreground">Ticket Code</p>
            <p className="font-mono font-medium">{registration.ticketCode}</p>
          </div>
          {registration.checkIn && (
            <QrCode className="h-6 w-6 text-green-600" />
          )}
        </div>
        <Button asChild className="w-full">
          <Link href={`/my-tickets/${registration.id}`}>View Ticket</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
