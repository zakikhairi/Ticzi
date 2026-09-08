import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { performCheckIn } from '@/services/check-in.service';
import { createAuditLog } from '@/services/audit.service';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { qrToken } = body;

    if (!qrToken) {
      return NextResponse.json(
        { error: 'QR token is required' },
        { status: 400 }
      );
    }

    const result = await performCheckIn(qrToken, session.user.id);

    // Create audit log for successful check-in
    if (result.success && result.data?.registration) {
      await createAuditLog({
        userId: session.user.id,
        action: 'CHECK_IN',
        entity: 'Registration',
        entityId: result.data.registration.id,
        metadata: {
          eventId: result.data.registration.eventId,
          participantId: result.data.registration.participantId,
        },
      });
    }

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
