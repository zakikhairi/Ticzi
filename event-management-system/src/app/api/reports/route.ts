import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  getEventRegistrationReport,
  getEventTicketReport,
  getEventCheckInReport,
} from '@/services/dashboard.service';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id: userId } = session.user;
    if (role === 'PARTICIPANT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const requestedEventId = searchParams.get('eventId');

    // Fetch accessible events
    const eventWhere = role === 'SUPER_ADMIN' ? {} : { organizerId: userId };
    const events = await prisma.event.findMany({
      where: eventWhere,
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        location: true,
      },
      orderBy: { startDate: 'desc' },
    });

    if (events.length === 0) {
      return NextResponse.json({
        events: [],
        selectedEvent: null,
        registrationReport: null,
        ticketReport: null,
        checkInReport: null,
        participants: [],
      });
    }

    // Determine target event
    const targetEventId = requestedEventId && events.some((e) => e.id === requestedEventId)
      ? requestedEventId
      : events[0].id;

    const selectedEvent = events.find((e) => e.id === targetEventId);

    // Get reports & participant rows for export
    const [registrationReport, ticketReport, checkInReport, participants] = await Promise.all([
      getEventRegistrationReport(targetEventId),
      getEventTicketReport(targetEventId),
      getEventCheckInReport(targetEventId),
      prisma.registration.findMany({
        where: { eventId: targetEventId },
        include: {
          ticket: true,
          checkIn: true,
        },
        orderBy: { registeredAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      events,
      selectedEvent,
      registrationReport,
      ticketReport,
      checkInReport,
      participants: participants.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone || '-',
        institution: p.institution || '-',
        ticketName: p.ticket.name,
        price: Number(p.ticket.price),
        status: p.status,
        isCheckedIn: !!p.checkIn,
        checkedInAt: p.checkIn ? p.checkIn.checkedInAt : null,
        registeredAt: p.registeredAt,
      })),
    });
  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
