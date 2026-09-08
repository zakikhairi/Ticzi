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

    // Perform registration
    const registration = await registerForEvent(session.user.id, {
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
      userId: session.user.id,
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

    if (error.message === 'You have already registered for this event') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message?.includes('Ticket')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
