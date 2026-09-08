import prisma from '@/lib/prisma';
import { generateTicketCode, generateQrToken } from '@/lib/utils';
import { checkTicketAvailability } from './ticket.service';
import { getEventById } from './event.service';
import type { RegistrationInput, ParticipantFilters } from '@/types';
import { RegistrationStatus, EventStatus } from '@prisma/client';

export async function registerForEvent(participantId: string, data: RegistrationInput) {
  // Check if event exists and is published
  const event = await getEventById(data.eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  if (event.status !== EventStatus.PUBLISHED) {
    throw new Error('Event is not available for registration');
  }

  // Check registration period
  const now = new Date();
  if (now < event.registrationStart || now > event.registrationEnd) {
    throw new Error('Registration period has ended');
  }

  // Check max participants
  if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
    throw new Error('Event has reached maximum participants');
  }

  // Check ticket availability
  const availability = await checkTicketAvailability(data.ticketId);
  if (!availability.available) {
    throw new Error(availability.reason);
  }

  // Check for duplicate registration
  const existingRegistration = await prisma.registration.findUnique({
    where: {
      eventId_participantId: {
        eventId: data.eventId,
        participantId,
      },
    },
  });

  if (existingRegistration) {
    // If user is already registered, update their registration to the newly selected ticket
    return prisma.$transaction(async (tx) => {
      if (existingRegistration.ticketId !== data.ticketId) {
        if (existingRegistration.ticketId) {
          await tx.ticket
            .update({
              where: { id: existingRegistration.ticketId },
              data: { sold: { decrement: 1 } },
            })
            .catch(() => {});
        }
        await tx.ticket.update({
          where: { id: data.ticketId },
          data: { sold: { increment: 1 } },
        });
      }

      const updated = await tx.registration.update({
        where: { id: existingRegistration.id },
        data: {
          ticketId: data.ticketId,
          status: RegistrationStatus.CONFIRMED,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          institution: data.institution,
          additionalInfo: data.additionalInfo,
        },
        include: {
          event: true,
          ticket: true,
          participant: { select: { id: true, name: true, email: true } },
        },
      });

      return updated;
    });
  }

  // Create registration with transaction
  return prisma.$transaction(async (tx) => {
    // Create registration
    const registration = await tx.registration.create({
      data: {
        eventId: data.eventId,
        participantId,
        ticketId: data.ticketId,
        ticketCode: generateTicketCode(),
        qrToken: generateQrToken(),
        status: RegistrationStatus.CONFIRMED,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        institution: data.institution,
        additionalInfo: data.additionalInfo,
      },
      include: {
        event: true,
        ticket: true,
        participant: { select: { id: true, name: true, email: true } },
      },
    });

    // Increment ticket sold count
    await tx.ticket.update({
      where: { id: data.ticketId },
      data: { sold: { increment: 1 } },
    });

    return registration;
  });
}

export async function getRegistrationById(id: string) {
  return prisma.registration.findUnique({
    where: { id },
    include: {
      event: {
        include: {
          category: true,
          organizer: { select: { id: true, name: true } },
        },
      },
      ticket: true,
      participant: { select: { id: true, name: true, email: true } },
      checkIn: true,
    },
  });
}

export async function getRegistrationByTicketCode(ticketCode: string) {
  return prisma.registration.findUnique({
    where: { ticketCode },
    include: {
      event: true,
      ticket: true,
      participant: { select: { id: true, name: true, email: true } },
      checkIn: true,
    },
  });
}

export async function getRegistrationByQrToken(qrToken: string) {
  return prisma.registration.findUnique({
    where: { qrToken },
    include: {
      event: true,
      ticket: true,
      participant: { select: { id: true, name: true, email: true } },
      checkIn: true,
    },
  });
}

export async function getParticipantRegistrations(participantId: string) {
  return prisma.registration.findMany({
    where: { participantId },
    include: {
      event: {
        include: {
          category: true,
          organizer: { select: { id: true, name: true } },
        },
      },
      ticket: true,
      checkIn: true,
    },
    orderBy: { registeredAt: 'desc' },
  });
}

export async function getEventParticipants(eventId: string, filters: ParticipantFilters = {}) {
  const {
    search,
    ticketType,
    registrationStatus,
    checkInStatus,
    page = 1,
    pageSize = 10,
  } = filters;

  const where: any = { eventId };

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { institution: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (ticketType) {
    where.ticketId = ticketType;
  }

  if (registrationStatus) {
    where.status = registrationStatus;
  }

  if (checkInStatus === 'CHECKED_IN') {
    where.checkIn = { isNot: null };
  } else if (checkInStatus === 'NOT_CHECKED_IN') {
    where.checkIn = null;
  }

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      include: {
        ticket: true,
        checkIn: true,
      },
      orderBy: { registeredAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.registration.count({ where }),
  ]);

  return {
    registrations,
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function cancelRegistration(id: string, participantId: string) {
  const registration = await prisma.registration.findFirst({
    where: { id, participantId },
  });

  if (!registration) {
    throw new Error('Registration not found');
  }

  if (registration.status === RegistrationStatus.CHECKED_IN) {
    throw new Error('Cannot cancel checked-in registration');
  }

  return prisma.$transaction(async (tx) => {
    // Update registration status
    const updated = await tx.registration.update({
      where: { id },
      data: { status: RegistrationStatus.CANCELLED },
    });

    // Decrement ticket sold count
    await tx.ticket.update({
      where: { id: registration.ticketId },
      data: { sold: { decrement: 1 } },
    });

    return updated;
  });
}

export async function getRegistrationStats(eventId: string) {
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
