import prisma from '@/lib/prisma';
import { getRegistrationByQrToken, getRegistrationByTicketCode } from './registration.service';
import { EventStatus, RegistrationStatus, CheckInStatus } from '@prisma/client';

export interface CheckInResult {
  success: boolean;
  message: string;
  data?: {
    registration: any;
    checkIn: any;
  };
}

export async function performCheckIn(token: string, officerId: string): Promise<CheckInResult> {
  // Find registration by QR token or Ticket Code
  let registration = await getRegistrationByQrToken(token);
  if (!registration) {
    registration = await getRegistrationByTicketCode(token);
  }

  if (!registration) {
    return {
      success: false,
      message: 'Kode tiket atau QR Code tidak valid. Registrasi tidak ditemukan.',
    };
  }

  // Check if registration is confirmed
  if (registration.status === RegistrationStatus.CANCELLED) {
    return {
      success: false,
      message: 'Registrasi telah dibatalkan.',
    };
  }

  if (registration.status === RegistrationStatus.PENDING) {
    return {
      success: false,
      message: 'Registrasi belum dikonfirmasi.',
    };
  }

  // Check if already checked in
  if (registration.checkIn) {
    return {
      success: false,
      message: `Peserta sudah check-in pada ${new Date(registration.checkIn.checkedInAt).toLocaleString('id-ID')}`,
    };
  }

  // Check if event is active
  if (registration.event.status !== EventStatus.PUBLISHED && registration.event.status !== EventStatus.ONGOING) {
    return {
      success: false,
      message: 'Event tidak sedang aktif.',
    };
  }

  // Perform check-in with transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create check-in record
    const checkIn = await tx.checkIn.create({
      data: {
        registrationId: registration.id,
        eventId: registration.eventId,
        participantId: registration.participantId,
        ticketId: registration.ticketId,
        checkedInBy: officerId,
        status: CheckInStatus.SUCCESS,
      },
    });

    // Update registration status
    const updatedRegistration = await tx.registration.update({
      where: { id: registration.id },
      data: { status: RegistrationStatus.CHECKED_IN },
    });

    return { checkIn, registration: updatedRegistration };
  });

  return {
    success: true,
    message: 'Check-in berhasil!',
    data: {
      registration: {
        ...registration,
        status: RegistrationStatus.CHECKED_IN,
      },
      checkIn: result.checkIn,
    },
  };
}

export async function getCheckIns(eventId: string) {
  return prisma.checkIn.findMany({
    where: { eventId },
    include: {
      participant: { select: { id: true, name: true, email: true } },
      registration: {
        select: {
          ticketCode: true,
          ticket: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { checkedInAt: 'desc' },
  });
}

export async function getCheckInStats(eventId: string) {
  const [totalParticipants, totalCheckedIn] = await Promise.all([
    prisma.registration.count({
      where: {
        eventId,
        status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] },
      },
    }),
    prisma.checkIn.count({ where: { eventId } }),
  ]);

  return {
    totalParticipants,
    totalCheckedIn,
    totalNotCheckedIn: totalParticipants - totalCheckedIn,
    checkInPercentage: totalParticipants > 0 ? (totalCheckedIn / totalParticipants) * 100 : 0,
  };
}

export async function getRecentCheckIns(eventId: string, limit = 10) {
  return prisma.checkIn.findMany({
    where: { eventId },
    take: limit,
    orderBy: { checkedInAt: 'desc' },
    include: {
      participant: { select: { id: true, name: true } },
      registration: {
        select: {
          ticket: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function getCheckInTrend(eventId: string, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const checkIns = await prisma.checkIn.findMany({
    where: {
      eventId,
      checkedInAt: { gte: startDate },
    },
    orderBy: { checkedInAt: 'asc' },
  });

  // Group by date
  const trend: Record<string, number> = {};
  checkIns.forEach((checkIn) => {
    const date = checkIn.checkedInAt.toISOString().split('T')[0];
    trend[date] = (trend[date] || 0) + 1;
  });

  return trend;
}
