import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  getOrganizerDashboardStats,
  getRegistrationTrend,
  getTicketSalesByEvent,
  getEventStatusDistribution,
  getRecentRegistrations,
  getUpcomingEvents,
  getOrganizerRecentCheckIns,
  getParticipantDashboardStats,
  getParticipantUpcomingEvents,
  getParticipantTickets,
  getSystemStats,
} from '@/services/dashboard.service';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId, role } = session.user;

    if (role === 'SUPER_ADMIN') {
      const [systemStats, trend, ticketSales, eventStatus, recentRegs, upcoming, recentAuditLogs] = await Promise.all([
        getSystemStats(),
        getRegistrationTrend(undefined, 30),
        getTicketSalesByEvent(undefined),
        getEventStatusDistribution(undefined),
        getRecentRegistrations(undefined, 5),
        getUpcomingEvents(undefined, 5),
        prisma.auditLog.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        }),
      ]);

      return NextResponse.json({
        role,
        stats: systemStats,
        recentItems: {
          trend,
          ticketSales,
          eventStatus,
          recentRegs,
          upcoming,
          recentAuditLogs,
        },
      });
    }

    if (role === 'ORGANIZER') {
      const [organizerStats, trend, ticketSales, eventStatus, recentRegs, upcoming, recentCheckIns] = await Promise.all([
        getOrganizerDashboardStats(userId),
        getRegistrationTrend(userId, 30),
        getTicketSalesByEvent(userId),
        getEventStatusDistribution(userId),
        getRecentRegistrations(userId, 5),
        getUpcomingEvents(userId, 5),
        getOrganizerRecentCheckIns(userId, 5),
      ]);

      return NextResponse.json({
        role,
        stats: organizerStats,
        recentItems: { trend, ticketSales, eventStatus, recentRegs, upcoming, recentCheckIns },
      });
    }

    // Default: PARTICIPANT
    const [participantStats, upcomingEvents, allTickets] = await Promise.all([
      getParticipantDashboardStats(userId),
      getParticipantUpcomingEvents(userId, 5),
      getParticipantTickets(userId),
    ]);

    return NextResponse.json({
      role,
      stats: participantStats,
      recentItems: { upcomingEvents, tickets: allTickets },
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
