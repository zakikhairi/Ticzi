import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/schemas';
import { createAuditLog } from '@/services/audit.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone, institution, role } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();
    const userRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'PARTICIPANT';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        institution: institution ? institution.trim() : null,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'REGISTER',
      entity: 'User',
      entityId: user.id,
      metadata: { email: user.email },
    });

    return NextResponse.json(
      { message: 'Akun berhasil dibuat. Silakan login.', user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem saat pendaftaran akun' },
      { status: 500 }
    );
  }
}
