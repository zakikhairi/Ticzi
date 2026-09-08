import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { registerForEvent } from '@/services/registration.service';
import { createAuditLog } from '@/services/audit.service';
import { registrationSchema } from '@/schemas';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await params;
    const body = await request.json();

    // Validate input
    const validation = registrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Ensure valid participantId from DB (handles stale JWT cookies)
    let participantId = session.user.id;
    if (session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email.trim().toLowerCase() },
        select: { id: true },
      });
      if (dbUser) {
        participantId = dbUser.id;
      }
    }

    // Perform registration
    const registration = await registerForEvent(participantId, {
      eventId,
      ticketId: body.ticketId,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      institution: body.institution,
      additionalInfo: body.additionalInfo,
    });

    // Create audit log
    await createAuditLog({
      userId: participantId,
      action: 'REGISTRATION',
      entity: 'Registration',
      entityId: registration.id,
      metadata: {
        eventId,
        eventName: event.name,
        ticketId: body.ticketId,
      },
    });

    return NextResponse.json(
      { message: 'Registration successful', registration },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat pendaftaran tiket' },
      { status: 400 }
    );
  }
}
