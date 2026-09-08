import prisma from '@/lib/prisma';
import { generateSlug, generateTicketCode, generateQrToken } from '@/lib/utils';
import type { CreateEventInput, UpdateEventInput, EventFilters } from '@/types';
import { EventStatus } from '@prisma/client';

export async function getEvents(filters: EventFilters = {}) {
  const {
    search,
    category,
    status,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.startDate = {};
    if (dateFrom) where.startDate.gte = new Date(dateFrom);
    if (dateTo) where.startDate.lte = new Date(dateTo);
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        category: true,
        _count: { select: { registrations: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      category: true,
      tickets: { where: { status: 'ACTIVE' } },
      _count: { select: { registrations: true } },
    },
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      category: true,
      tickets: { where: { status: 'ACTIVE' } },
      _count: { select: { registrations: true } },
    },
  });
}

export async function createEvent(data: CreateEventInput, organizerId: string) {
  const slug = generateSlug(data.name);

  // Check if slug already exists
  const existingEvent = await prisma.event.findUnique({ where: { slug } });
  if (existingEvent) {
    throw new Error('Event with this name already exists');
  }

  return prisma.event.create({
    data: {
      ...data,
      slug,
      organizerId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationStart: new Date(data.registrationStart),
      registrationEnd: new Date(data.registrationEnd),
    },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      category: true,
    },
  });
}

export async function updateEvent(id: string, data: UpdateEventInput) {
  const updateData: any = { ...data };

  if (data.name) {
    updateData.slug = generateSlug(data.name);
  }

  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.registrationStart) updateData.registrationStart = new Date(data.registrationStart);
  if (data.registrationEnd) updateData.registrationEnd = new Date(data.registrationEnd);

  return prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      category: true,
    },
  });
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({
    where: { id },
  });
}

export async function publishEvent(id: string) {
  return prisma.event.update({
    where: { id },
    data: { status: EventStatus.PUBLISHED },
  });
}

export async function unpublishEvent(id: string) {
  return prisma.event.update({
    where: { id },
    data: { status: EventStatus.DRAFT },
  });
}

export async function getOrganizerEvents(organizerId: string, filters: EventFilters = {}) {
  return getEvents({ ...filters, organizerId });
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createCategory(data: { name: string; description?: string }) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: { name?: string; description?: string }) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
