import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { RegistrationButton } from './registration-button';
import { PublicHeader } from '@/components/layout/public-header';
import { formatCurrency } from '@/lib/utils';

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: {
        select: { id: true, name: true, email: true },
      },
      category: true,
      tickets: {
        where: { status: 'ACTIVE' },
        orderBy: { price: 'asc' },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Check if current user is already registered for this event
  let existingUserRegistration = null;
  if (session?.user) {
    let participantId = session.user.id;
    if (session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email.trim().toLowerCase() },
        select: { id: true },
      });
      if (dbUser) participantId = dbUser.id;
    }

    existingUserRegistration = await prisma.registration.findUnique({
      where: {
        eventId_participantId: {
          eventId: event.id,
          participantId,
        },
      },
    });
  }

  const isRegistrationOpen =
    event.status === 'PUBLISHED' &&
    new Date() >= event.registrationStart &&
    new Date() <= event.registrationEnd;

  const spotsRemaining = event.maxParticipants
    ? event.maxParticipants - event._count.registrations
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <PublicHeader />

      {/* Banner */}
      {event.bannerUrl && (
        <div className="relative h-64 md:h-80 lg:h-96">
          <img
            src={event.bannerUrl}
            alt={event.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{event.category.name}</Badge>
                <Badge
                  variant={
                    event.status === 'PUBLISHED'
                      ? 'success'
                      : event.status === 'ONGOING'
                      ? 'info'
                      : 'secondary'
                  }
                >
                  {event.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">{event.name}</h1>
              <p className="mt-2 text-muted-foreground">
                Organized by {event.organizer.name}
              </p>
            </div>

            {/* Event Info */}
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(event.endDate).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                    {event.address && (
                      <p className="text-sm text-muted-foreground">{event.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Participants</p>
                    <p className="text-sm text-muted-foreground">
                      {event._count.registrations} registered
                      {event.maxParticipants && ` / ${event.maxParticipants} max`}
                    </p>
                    {spotsRemaining !== null && (
                      <p className="text-sm font-medium text-primary">
                        {spotsRemaining} spots remaining
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {event.description && (
              <div>
                <h2 className="mb-3 text-xl font-semibold">About This Event</h2>
                <div className="prose max-w-none text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}

            {/* Organizer */}
            <div>
              <h2 className="mb-3 text-xl font-semibold">Organizer</h2>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.organizer.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Tickets */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tickets available</p>
                ) : (
                  event.tickets.map((ticket) => {
                    const isSoldOut = ticket.sold >= ticket.quota;
                    const isSaleOpen =
                      new Date() >= ticket.saleStart &&
                      new Date() <= ticket.saleEnd &&
                      !isSoldOut;

                    return (
                      <div
                        key={ticket.id}
                        className={`rounded-lg border p-4 ${
                          isSoldOut ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{ticket.name}</p>
                            {ticket.description && (
                              <p className="text-sm text-muted-foreground">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                          <p className="font-bold">
                            {Number(ticket.price) === 0 ? 'FREE' : formatCurrency(Number(ticket.price))}
                          </p>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {ticket.sold} / {ticket.quota} sold
                          </span>
                          {isSoldOut ? (
                            <Badge variant="destructive">Sold Out</Badge>
                          ) : isSaleOpen ? (
                            <Badge variant="success">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Sale Closed</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {isRegistrationOpen ? (
                  <RegistrationButton
                    eventId={event.id}
                    tickets={event.tickets}
                    hasMaxParticipants={!!event.maxParticipants}
                    spotsRemaining={spotsRemaining}
                    existingRegistrationId={existingUserRegistration?.id || null}
                  />
                ) : (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <p className="font-medium">Registration Closed</p>
                    <p className="text-sm text-muted-foreground">
                      {event.status !== 'PUBLISHED'
                        ? 'This event is not currently open for registration'
                        : new Date() < event.registrationStart
                        ? `Registration opens ${new Date(event.registrationStart).toLocaleDateString('id-ID')}`
                        : 'Registration period has ended'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
