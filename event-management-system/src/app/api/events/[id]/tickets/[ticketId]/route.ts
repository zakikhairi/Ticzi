import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateTicket, deleteTicket } from '@/services/ticket.service';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId, ticketId } = await params;

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

    const existingTicket = await prisma.ticket.findFirst({
      where: { id: ticketId, eventId },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const body = await request.json();

    // If quota is updated, ensure it's not less than already sold tickets
    if (body.quota !== undefined && body.quota < existingTicket.sold) {
      return NextResponse.json(
        { error: `Kuota tidak boleh lebih kecil dari jumlah tiket yang sudah terjual (${existingTicket.sold})` },
        { status: 400 }
      );
    }

    const updated = await updateTicket(ticketId, body);

    return NextResponse.json({ ticket: updated });
  } catch (error: any) {
    console.error('Failed to update ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId, ticketId } = await params;

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

    const existingTicket = await prisma.ticket.findFirst({
      where: { id: ticketId, eventId },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (existingTicket.sold > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus tiket yang sudah memiliki pendaftar. Anda dapat mengubah status tiket menjadi INACTIVE.' },
        { status: 400 }
      );
    }

    await deleteTicket(ticketId);

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
