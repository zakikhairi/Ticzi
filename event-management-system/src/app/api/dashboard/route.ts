import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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
      const systemStats = await getSystemStats();
      return NextResponse.json({
        role,
        stats: systemStats,
        recentItems: {},
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
    const [participantStats, upcomingEvents] = await Promise.all([
      getParticipantDashboardStats(userId),
      getParticipantUpcomingEvents(userId, 5),
    ]);

    return NextResponse.json({
      role,
      stats: participantStats,
      recentItems: { upcomingEvents },
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
