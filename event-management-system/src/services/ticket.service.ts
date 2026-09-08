import prisma from '@/lib/prisma';
import type { CreateTicketInput, UpdateTicketInput } from '@/types';
import { TicketStatus } from '@prisma/client';

export async function getTicketsByEvent(eventId: string) {
  return prisma.ticket.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      event: {
        include: {
          organizer: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function createTicket(eventId: string, data: CreateTicketInput) {
  return prisma.ticket.create({
    data: {
      ...data,
      eventId,
      price: data.price,
      saleStart: new Date(data.saleStart),
      saleEnd: new Date(data.saleEnd),
    },
  });
}

export async function updateTicket(id: string, data: UpdateTicketInput) {
  const updateData: any = { ...data };

  if (data.saleStart) updateData.saleStart = new Date(data.saleStart);
  if (data.saleEnd) updateData.saleEnd = new Date(data.saleEnd);
  if (data.price !== undefined) updateData.price = data.price;

  return prisma.ticket.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteTicket(id: string) {
  return prisma.ticket.delete({
    where: { id },
  });
}

export async function incrementTicketSold(ticketId: string) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { sold: { increment: 1 } },
  });
}

export async function checkTicketAvailability(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { available: false, reason: 'Ticket not found' };
  }

  if (ticket.status !== 'ACTIVE') {
    return { available: false, reason: 'Ticket is not active' };
  }

  const now = new Date();
  if (now < ticket.saleStart || now > ticket.saleEnd) {
    return { available: false, reason: 'Ticket sale is not open' };
  }

  if (ticket.sold >= ticket.quota) {
    // Update status to SOLD_OUT
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.SOLD_OUT },
    });
    return { available: false, reason: 'Ticket is sold out' };
  }

  return { available: true, ticket };
}

export async function getTicketStats(eventId: string) {
  const tickets = await prisma.ticket.findMany({
    where: { eventId },
  });

  return tickets.reduce(
    (acc, ticket) => ({
      totalQuota: acc.totalQuota + ticket.quota,
      totalSold: acc.totalSold + ticket.sold,
      totalRemaining: acc.totalRemaining + (ticket.quota - ticket.sold),
      totalRevenue: acc.totalRevenue + ticket.sold * Number(ticket.price),
    }),
    { totalQuota: 0, totalSold: 0, totalRemaining: 0, totalRevenue: 0 }
  );
}
