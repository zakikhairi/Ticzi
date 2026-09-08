import prisma from '@/lib/prisma';
import { EventStatus, RegistrationStatus, UserRole } from '@prisma/client';
import type { DashboardStats, RegistrationReport, TicketReport, CheckInReport } from '@/types';

// Organizer Dashboard
export async function getOrganizerDashboardStats(organizerId: string): Promise<DashboardStats> {
  const [
    totalEvents,
    publishedEvents,
    totalParticipants,
    totalTicketsSold,
    totalCheckIns,
    totalConfirmed,
  ] = await Promise.all([
    prisma.event.count({ where: { organizerId } }),
    prisma.event.count({ where: { organizerId, status: EventStatus.PUBLISHED } }),
    prisma.registration.count({
      where: { event: { organizerId } },
    }),
    prisma.registration.count({
      where: {
        event: { organizerId },
        status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] },
      },
    }),
    prisma.checkIn.count({
      where: { event: { organizerId } },
    }),
    prisma.registration.count({
      where: {
        event: { organizerId },
        status: RegistrationStatus.CONFIRMED,
      },
    }),
  ]);

  return {
    totalEvents,
    publishedEvents,
    totalParticipants,
    totalTicketsSold,
    totalCheckIns,
    checkInPercentage: totalTicketsSold > 0 ? (totalCheckIns / totalTicketsSold) * 100 : 0,
  };
}

export async function getRegistrationTrend(organizerId?: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const where: any = {
    registeredAt: { gte: startDate },
  };
  if (organizerId) {
    where.event = { organizerId };
  }

  const registrations = await prisma.registration.findMany({
    where,
    select: { registeredAt: true },
    orderBy: { registeredAt: 'asc' },
  });

  // Group by date
  const trend: Record<string, number> = {};
  registrations.forEach((reg) => {
    const date = reg.registeredAt.toISOString().split('T')[0];
    trend[date] = (trend[date] || 0) + 1;
  });

  // Fill in missing dates
  const result: { date: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({ date: dateStr, count: trend[dateStr] || 0 });
  }

  return result;
}

export async function getTicketSalesByEvent(organizerId?: string) {
  const where: any = {};
  if (organizerId) {
    where.organizerId = organizerId;
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      tickets: true,
    },
  });

  return events.map((event) => ({
    eventId: event.id,
    eventName: event.name,
    tickets: event.tickets.map((ticket) => ({
      name: ticket.name,
      sold: ticket.sold,
      quota: ticket.quota,
      revenue: ticket.sold * Number(ticket.price),
    })),
  }));
}

export async function getEventStatusDistribution(organizerId?: string) {
  const where: any = {};
  if (organizerId) {
    where.organizerId = organizerId;
  }

  const statusCounts = await prisma.event.groupBy({
    by: ['status'],
    where,
    _count: { status: true },
  });

  return statusCounts.map((item) => ({
    status: item.status,
    count: item._count.status,
  }));
}

export async function getRecentRegistrations(organizerId?: string, limit = 10) {
  const where: any = {};
  if (organizerId) {
    where.event = { organizerId };
  }

  return prisma.registration.findMany({
    where,
    take: limit,
    orderBy: { registeredAt: 'desc' },
    include: {
      event: { select: { id: true, name: true } },
      ticket: { select: { id: true, name: true } },
      participant: { select: { id: true, name: true } },
    },
  });
}

export async function getUpcomingEvents(organizerId?: string, limit = 5) {
  const now = new Date();
  const where: any = {
    startDate: { gte: now },
    status: EventStatus.PUBLISHED,
  };
  if (organizerId) {
    where.organizerId = organizerId;
  }

  return prisma.event.findMany({
    where,
    take: limit,
    orderBy: { startDate: 'asc' },
    include: {
      _count: { select: { registrations: true } },
    },
  });
}

export async function getOrganizerRecentCheckIns(organizerId: string, limit = 10) {
  return prisma.checkIn.findMany({
    where: { event: { organizerId } },
    take: limit,
    orderBy: { checkedInAt: 'desc' },
    include: {
      event: { select: { id: true, name: true } },
      participant: { select: { id: true, name: true } },
      registration: {
        select: {
          ticket: { select: { id: true, name: true } },
        },
      },
    },
  });
}

// Participant Dashboard
export async function getParticipantDashboardStats(participantId: string) {
  const [
    totalRegistered,
    upcoming,
    completed,
    checkedIn,
  ] = await Promise.all([
    prisma.registration.count({
      where: { participantId },
    }),
    prisma.registration.count({
      where: {
        participantId,
        event: {
          startDate: { gte: new Date() },
          status: { in: [EventStatus.PUBLISHED, EventStatus.ONGOING] },
        },
      },
    }),
    prisma.registration.count({
      where: {
        participantId,
        event: {
          OR: [
            { status: EventStatus.COMPLETED },
            { endDate: { lt: new Date() } },
          ],
        },
      },
    }),
    prisma.registration.count({
      where: {
        participantId,
        status: RegistrationStatus.CHECKED_IN,
      },
    }),
  ]);

  return {
    totalRegistered,
    upcoming,
    completed,
    checkedIn,
  };
}

export async function getParticipantUpcomingEvents(participantId: string, limit = 5) {
  const now = new Date();
  return prisma.registration.findMany({
    where: {
      participantId,
      event: {
        startDate: { gte: now },
        status: { in: [EventStatus.PUBLISHED, EventStatus.ONGOING] },
      },
    },
    take: limit,
    orderBy: { event: { startDate: 'asc' } },
    include: {
      event: true,
      ticket: true,
      checkIn: true,
    },
  });
}

// Reports
export async function getEventRegistrationReport(eventId: string): Promise<RegistrationReport> {
  const [total, confirmed, pending, cancelled, checkedIn] = await Promise.all([
    prisma.registration.count({ where: { eventId } }),
    prisma.registration.count({ where: { eventId, status: RegistrationStatus.CONFIRMED } }),
    prisma.registration.count({ where: { eventId, status: RegistrationStatus.PENDING } }),
    prisma.registration.count({ where: { eventId, status: RegistrationStatus.CANCELLED } }),
    prisma.registration.count({ where: { eventId, status: RegistrationStatus.CHECKED_IN } }),
  ]);

  return {
    total,
    confirmed,
    pending,
    cancelled,
    checkedIn,
    notCheckedIn: confirmed - checkedIn,
  };
}

export async function getEventTicketReport(eventId: string): Promise<TicketReport> {
  const tickets = await prisma.ticket.findMany({
    where: { eventId },
  });

  const totalQuota = tickets.reduce((sum, t) => sum + t.quota, 0);
  const ticketsSold = tickets.reduce((sum, t) => sum + t.sold, 0);
  const ticketsRemaining = totalQuota - ticketsSold;

  return {
    totalQuota,
    ticketsSold,
    ticketsRemaining,
    salesByType: tickets.map((t) => ({
      name: t.name,
      sold: t.sold,
      quota: t.quota,
      revenue: t.sold * Number(t.price),
    })),
  };
}

export async function getEventCheckInReport(eventId: string): Promise<CheckInReport> {
  const [totalParticipants, totalCheckedIn, checkIns] = await Promise.all([
    prisma.registration.count({
      where: {
        eventId,
        status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] },
      },
    }),
    prisma.checkIn.count({ where: { eventId } }),
    prisma.checkIn.findMany({
      where: { eventId },
      orderBy: { checkedInAt: 'asc' },
    }),
  ]);

  // Group check-ins by hour
  const checkInsByHour: Record<string, number> = {};
  checkIns.forEach((checkIn) => {
    const hour = checkIn.checkedInAt.toISOString().substring(0, 13) + ':00';
    checkInsByHour[hour] = (checkInsByHour[hour] || 0) + 1;
  });

  return {
    totalParticipants,
    totalCheckedIn,
    totalNotCheckedIn: totalParticipants - totalCheckedIn,
    checkInPercentage: totalParticipants > 0 ? (totalCheckedIn / totalParticipants) * 100 : 0,
    checkInsByHour: Object.entries(checkInsByHour).map(([hour, count]) => ({ hour, count })),
  };
}

// Super Admin Dashboard
export async function getSystemStats() {
  const [
    totalUsers,
    totalOrganizers,
    totalParticipants,
    totalEvents,
    totalRegistrations,
    totalCheckIns,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: UserRole.ORGANIZER } }),
    prisma.user.count({ where: { role: UserRole.PARTICIPANT } }),
    prisma.event.count(),
    prisma.registration.count(),
    prisma.checkIn.count(),
  ]);

  return {
    totalUsers,
    totalOrganizers,
    totalParticipants,
    totalEvents,
    totalRegistrations,
    totalCheckIns,
  };
}
