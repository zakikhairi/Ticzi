import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getUserById, updateUser, deleteUser } from '@/services/user.service';
import { createAuditLog } from '@/services/audit.service';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const updateUserAdminSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  institution: z.string().optional().nullable(),
  role: z.enum(['SUPER_ADMIN', 'ORGANIZER', 'PARTICIPANT']).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to get user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateUserAdminSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent demoting self from SUPER_ADMIN
    if (id === session.user.id && validatedData.role && validatedData.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'You cannot remove your own Super Admin privileges' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.institution !== undefined) updateData.institution = validatedData.institution;
    if (validatedData.role !== undefined) updateData.role = validatedData.role as UserRole;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        institution: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: id,
      metadata: updateData,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Failed to update user:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { organizedEvents: true, registrations: true },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await deleteUser(id);

    await createAuditLog({
      userId: session.user.id,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: id,
      metadata: { email: targetUser.email, name: targetUser.name, role: targetUser.role },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
