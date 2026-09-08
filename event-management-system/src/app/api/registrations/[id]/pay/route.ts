import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/services/audit.service';
import { RegistrationStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: registrationId } = await params;

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true, ticket: true },
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Verify user owns registration or is super admin
    if (registration.participantId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (registration.status !== RegistrationStatus.PENDING) {
      return NextResponse.json(
        { error: 'Ticket is already confirmed or processed' },
        { status: 400 }
      );
    }

    // Update status to CONFIRMED
    const updated = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: RegistrationStatus.CONFIRMED,
      },
      include: {
        event: true,
        ticket: true,
      },
    });

    // Create Audit Log
    await createAuditLog({
      userId: session.user.id,
      action: 'PAYMENT_SUCCESS',
      entity: 'Registration',
      entityId: registration.id,
      metadata: {
        amount: Number(registration.ticket?.price || 0),
        ticketCode: registration.ticketCode,
        eventName: registration.event?.name,
        paymentMethod: 'INSTANT_PAYMENT_SIMULATION',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully. Ticket is now active!',
      registration: updated,
    });
  } catch (error) {
    console.error('Failed to process ticket payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
