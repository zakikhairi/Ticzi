import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateCategory, deleteCategory } from '@/services/event.service';
import { createAuditLog } from '@/services/audit.service';
import { categorySchema } from '@/schemas';

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
    const validatedData = categorySchema.parse(body);

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check duplicate name
    const duplicate = await prisma.category.findFirst({
      where: {
        name: validatedData.name,
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const updated = await updateCategory(id, validatedData);

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE_CATEGORY',
      entity: 'Category',
      entityId: id,
      metadata: validatedData,
    });

    return NextResponse.json({ category: updated });
  } catch (error: any) {
    console.error('Failed to update category:', error);
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (category._count.events > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${category.name}". It is currently used by ${category._count.events} event(s).`,
        },
        { status: 400 }
      );
    }

    await deleteCategory(id);

    await createAuditLog({
      userId: session.user.id,
      action: 'DELETE_CATEGORY',
      entity: 'Category',
      entityId: id,
      metadata: { name: category.name },
    });

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
