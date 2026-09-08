import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getEventParticipants, getRegistrationStats } from '@/services/registration.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, organizerId: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (session.user.role !== 'SUPER_ADMIN' && event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const ticketType = searchParams.get('ticketType') || undefined;
    const registrationStatus = searchParams.get('registrationStatus') || undefined;
    const checkInStatus = searchParams.get('checkInStatus') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const [participantsData, statsData] = await Promise.all([
      getEventParticipants(eventId, {
        search,
        ticketType,
        registrationStatus,
        checkInStatus,
        page,
        pageSize,
      }),
      getRegistrationStats(eventId),
    ]);

    return NextResponse.json({
      registrations: participantsData.registrations,
      pagination: participantsData.pagination,
      stats: statsData,
    });
  } catch (error) {
    console.error('Failed to fetch event participants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
