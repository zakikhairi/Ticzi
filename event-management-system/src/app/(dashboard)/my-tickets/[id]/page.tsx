import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, User, CheckCircle, QrCode, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { QRTicket } from './qr-ticket';
import { PrintButton } from './print-button';

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const registration = await prisma.registration.findFirst({
    where:
      session.user.role === 'SUPER_ADMIN'
        ? { id }
        : {
            id,
            OR: [
              { participantId: session.user.id },
              { event: { organizerId: session.user.id } },
            ],
          },
    include: {
      event: {
        include: {
          category: true,
          organizer: { select: { id: true, name: true, email: true } },
        },
      },
      ticket: true,
      checkIn: true,
    },
  });

  if (!registration) {
    notFound();
  }

  const event = registration.event;
  const isUpcoming = new Date(event.startDate) >= new Date();
  const isCheckedIn = !!registration.checkIn;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/my-tickets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Tickets
          </Link>
        </Button>
        <div className="flex gap-2">
          <PrintButton eventName={event.name} ticketCode={registration.ticketCode} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ticket Card */}
        <div className="print:shadow-none">
          <Card className="overflow-hidden" id="printable-ticket-card">
            {event.bannerUrl && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={event.bannerUrl}
                  alt={event.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {registration.ticket.name}
                  </Badge>
                  <CardTitle className="text-2xl">{event.name}</CardTitle>
                </div>
                {isCheckedIn && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Checked In</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="flex flex-col items-center rounded-lg bg-white p-6">
                <p className="mb-4 text-sm font-medium text-gray-600">
                  Scan this QR code at the event
                </p>
                <QRTicket qrToken={registration.qrToken} />
                <p className="mt-4 font-mono text-lg font-bold">
                  {registration.ticketCode}
                </p>
              </div>

              <Separator />

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
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
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                    {event.address && (
                      <p className="text-sm text-muted-foreground">
                        {event.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p className="text-sm text-muted-foreground">
                      {event.organizer.name}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Attendee Info */}
              <div className="space-y-2">
                <h3 className="font-medium">Attendee Information</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{registration.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{registration.email}</span>
                  </div>
                  {registration.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span>{registration.phone}</span>
                    </div>
                  )}
                  {registration.institution && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Institution</span>
                      <span>{registration.institution}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Check-in Info */}
              {isCheckedIn && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Successfully Checked In</span>
                    </div>
                    <p className="mt-1 text-sm text-green-700">
                      Check-in time:{' '}
                      {new Date(registration.checkIn!.checkedInAt).toLocaleString(
                        'id-ID',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <div>
                  <h3 className="mb-2 font-medium">About</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}
              <Separator />
              <div>
                <h3 className="mb-2 font-medium">Registration Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket Type</span>
                    <span>{registration.ticket.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration ID</span>
                    <span className="font-mono text-xs">{registration.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registered On</span>
                    <span>
                      {new Date(registration.registeredAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isUpcoming && !isCheckedIn && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="mb-2 font-medium">Tips for the Event</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Arrive early to complete the check-in process</li>
                  <li>• Keep this ticket (digital or printed) ready for scanning</li>
                  <li>• Bring a valid ID for verification</li>
                  <li>• Check the event location and plan your route</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
