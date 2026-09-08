import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import type { UpdateUserInput } from '@/schemas';

export async function getUsers(options: {
  search?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}) {
  const { search, role, page = 1, pageSize = 10 } = options;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        institution: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            organizedEvents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      institution: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          registrations: true,
          organizedEvents: true,
        },
      },
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  institution?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || UserRole.PARTICIPANT,
      phone: data.phone,
      institution: data.institution,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data,
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
}

export async function updateUserRole(id: string, role: UserRole) {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function changePassword(id: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
}

export async function getOrganizers() {
  return prisma.user.findMany({
    where: { role: UserRole.ORGANIZER },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: { organizedEvents: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}
