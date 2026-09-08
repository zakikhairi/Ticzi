import type {
  User,
  Event,
  Ticket,
  Registration,
  CheckIn,
  Category,
  AuditLog,
  Role,
  Permission,
} from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';

export type { User, Event, CheckIn, Category, AuditLog, Role, Permission };

// Ticket with proper price type from Prisma
export type TicketWithPrice = Omit<Ticket, 'price'> & {
  price: Decimal | number;
};

// Extended types with relations
export type EventWithRelations = Event & {
  organizer: Pick<User, 'id' | 'name' | 'email'>;
  category: Category;
  tickets: TicketWithPrice[];
  _count?: {
    registrations: number;
  };
};

export type TicketWithRelations = TicketWithPrice & {
  event: Pick<Event, 'id' | 'name' | 'slug' | 'startDate' | 'location'>;
};

export type RegistrationWithRelations = Registration & {
  event: Event;
  ticket: TicketWithPrice;
  participant: Pick<User, 'id' | 'name' | 'email'>;
  checkIn?: CheckIn | null;
};

export type CheckInWithRelations = CheckIn & {
  event: Event;
  participant: Pick<User, 'id' | 'name' | 'email'>;
  ticket: TicketWithPrice;
  registration: Registration;
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Dashboard types
export interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  totalParticipants: number;
  totalTicketsSold: number;
  totalCheckIns: number;
  checkInPercentage: number;
}

// Filter types
export interface EventFilters {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  organizerId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ParticipantFilters {
  search?: string;
  ticketType?: string;
  registrationStatus?: string;
  checkInStatus?: string;
  page?: number;
  pageSize?: number;
}

// Form types
export interface CreateEventInput {
  name: string;
  categoryId: string;
  description?: string;
  bannerUrl?: string;
  location: string;
  address?: string;
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  maxParticipants?: number;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface CreateTicketInput {
  name: string;
  description?: string;
  price: number;
  quota: number;
  saleStart: string;
  saleEnd: string;
}

export interface UpdateTicketInput extends Partial<CreateTicketInput> {
  status?: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT';
}

export interface RegistrationInput {
  eventId: string;
  ticketId: string;
  fullName: string;
  email: string;
  phone?: string;
  institution?: string;
  additionalInfo?: string;
}

// Report types
export interface RegistrationReport {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  checkedIn: number;
  notCheckedIn: number;
}

export interface TicketReport {
  totalQuota: number;
  ticketsSold: number;
  ticketsRemaining: number;
  salesByType: {
    name: string;
    sold: number;
    quota: number;
    revenue: number;
  }[];
}

export interface CheckInReport {
  totalParticipants: number;
  totalCheckedIn: number;
  totalNotCheckedIn: number;
  checkInPercentage: number;
  checkInsByHour: {
    hour: string;
    count: number;
  }[];
}
