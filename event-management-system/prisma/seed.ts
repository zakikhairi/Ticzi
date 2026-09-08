import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.checkIn.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleaned existing data');

  // Create roles
  const superAdminRole = await prisma.role.create({
    data: { name: 'SUPER_ADMIN' },
  });

  const organizerRole = await prisma.role.create({
    data: { name: 'ORGANIZER' },
  });

  const participantRole = await prisma.role.create({
    data: { name: 'PARTICIPANT' },
  });

  console.log('👥 Created roles');

  // Create permissions
  const permissions = [
    'manage_users',
    'manage_events',
    'manage_categories',
    'view_reports',
    'check_in',
    'manage_own_events',
  ];

  for (const permName of permissions) {
    await prisma.permission.create({
      data: { name: permName },
    });
  }

  console.log('🔐 Created permissions');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('Password123', 12);

  // Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Admin System',
      email: 'admin@eventms.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      phone: '+62 812 3456 7890',
      institution: 'Event Management System',
    },
  });

  // Create Organizers
  const organizer1 = await prisma.user.create({
    data: {
      name: 'John Organizer',
      email: 'organizer1@eventms.com',
      password: hashedPassword,
      role: 'ORGANIZER',
      phone: '+62 812 3456 7891',
      institution: 'Tech Events Co.',
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: 'Jane Organizer',
      email: 'organizer2@eventms.com',
      password: hashedPassword,
      role: 'ORGANIZER',
      phone: '+62 812 3456 7892',
      institution: 'Creative Studios',
    },
  });

  console.log('👤 Created organizers');

  // Create Participants
  const participants = [];
  const participantData = [
    { name: 'Alice Participant', email: 'alice@email.com', institution: 'University A' },
    { name: 'Bob Participant', email: 'bob@email.com', institution: 'Company B' },
    { name: 'Charlie Participant', email: 'charlie@email.com', institution: 'University C' },
    { name: 'Diana Participant', email: 'diana@email.com', institution: 'Company D' },
    { name: 'Eve Participant', email: 'eve@email.com', institution: 'University E' },
    { name: 'Frank Participant', email: 'frank@email.com', institution: 'Company F' },
    { name: 'Grace Participant', email: 'grace@email.com', institution: 'University G' },
    { name: 'Henry Participant', email: 'henry@email.com', institution: 'Company H' },
    { name: 'Ivy Participant', email: 'ivy@email.com', institution: 'University I' },
    { name: 'Jack Participant', email: 'jack@email.com', institution: 'Company J' },
  ];

  for (const data of participantData) {
    const participant = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'PARTICIPANT',
        phone: '+62 812 0000 0000',
        institution: data.institution,
      },
    });
    participants.push(participant);
  }

  console.log('👥 Created participants');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Seminar', description: 'Educational seminars and talks' },
    }),
    prisma.category.create({
      data: { name: 'Workshop', description: 'Hands-on workshops' },
    }),
    prisma.category.create({
      data: { name: 'Conference', description: 'Large-scale conferences' },
    }),
    prisma.category.create({
      data: { name: 'Competition', description: 'Competitive events' },
    }),
    prisma.category.create({
      data: { name: 'Webinar', description: 'Online seminars' },
    }),
    prisma.category.create({
      data: { name: 'Gathering', description: 'Social gatherings' },
    }),
    prisma.category.create({
      data: { name: 'Training', description: 'Professional training' },
    }),
    prisma.category.create({
      data: { name: 'Other', description: 'Other events' },
    }),
  ]);

  console.log('📁 Created categories');

  // Create Events
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const events = await Promise.all([
    // Published events
    prisma.event.create({
      data: {
        organizerId: organizer1.id,
        categoryId: categories[0].id, // Seminar
        name: 'Tech Innovation Summit 2024',
        slug: 'tech-innovation-summit-2024',
        description: 'Join industry leaders discussing the future of technology and innovation.',
        bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        location: 'Jakarta Convention Center',
        address: 'Jl. Jend. Sudirman No.1, Jakarta',
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        registrationStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(nextWeek.getTime() - 1 * 24 * 60 * 60 * 1000),
        maxParticipants: 500,
        status: 'PUBLISHED',
      },
    }),
    prisma.event.create({
      data: {
        organizerId: organizer1.id,
        categoryId: categories[1].id, // Workshop
        name: 'React Masterclass Workshop',
        slug: 'react-masterclass-workshop',
        description: 'A comprehensive workshop on building modern web applications with React.',
        bannerUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800',
        location: 'Bandung Tech Hub',
        address: 'Jl. Braga No.45, Bandung',
        startDate: twoWeeksLater,
        endDate: new Date(twoWeeksLater.getTime() + 1 * 24 * 60 * 60 * 1000),
        registrationStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(twoWeeksLater.getTime() - 2 * 24 * 60 * 60 * 1000),
        maxParticipants: 50,
        status: 'PUBLISHED',
      },
    }),
    prisma.event.create({
      data: {
        organizerId: organizer2.id,
        categoryId: categories[2].id, // Conference
        name: 'Business Leadership Conference',
        slug: 'business-leadership-conference',
        description: 'Annual conference for business leaders and entrepreneurs.',
        bannerUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        location: 'Bali International Convention Center',
        address: 'Nusa Dua, Bali',
        startDate: nextMonth,
        endDate: new Date(nextMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
        registrationStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(nextMonth.getTime() - 7 * 24 * 60 * 60 * 1000),
        maxParticipants: 1000,
        status: 'PUBLISHED',
      },
    }),
    prisma.event.create({
      data: {
        organizerId: organizer2.id,
        categoryId: categories[4].id, // Webinar
        name: 'Digital Marketing Fundamentals',
        slug: 'digital-marketing-fundamentals',
        description: 'Learn the basics of digital marketing in this comprehensive webinar.',
        bannerUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800',
        location: 'Online',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        registrationStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        maxParticipants: 200,
        status: 'PUBLISHED',
      },
    }),
    prisma.event.create({
      data: {
        organizerId: organizer1.id,
        categoryId: categories[3].id, // Competition
        name: 'Coding Challenge 2024',
        slug: 'coding-challenge-2024',
        description: 'Show off your coding skills and win exciting prizes!',
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        location: 'Surabaya Tech Park',
        address: 'Jl. Teknik Kimia, Surabaya',
        startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
        registrationStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        maxParticipants: 100,
        status: 'PUBLISHED',
      },
    }),
  ]);

  console.log('📅 Created events');

  // Create Tickets
  const tickets = await Promise.all([
    // Tech Innovation Summit tickets
    prisma.ticket.create({
      data: {
        eventId: events[0].id,
        name: 'Regular',
        description: 'Standard admission',
        price: 150000,
        quota: 300,
        sold: 45,
        saleStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(nextWeek.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: events[0].id,
        name: 'VIP',
        description: 'VIP seating and networking',
        price: 350000,
        quota: 100,
        sold: 23,
        saleStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(nextWeek.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: events[0].id,
        name: 'VVIP',
        description: 'Premium experience with exclusive access',
        price: 750000,
        quota: 50,
        sold: 12,
        saleStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(nextWeek.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
    // React Workshop tickets
    prisma.ticket.create({
      data: {
        eventId: events[1].id,
        name: 'Early Bird',
        description: 'Discounted early registration',
        price: 500000,
        quota: 20,
        sold: 20,
        saleStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: events[1].id,
        name: 'Standard',
        description: 'Regular admission',
        price: 750000,
        quota: 30,
        sold: 8,
        saleStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(twoWeeksLater.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
    // Conference tickets
    prisma.ticket.create({
      data: {
        eventId: events[2].id,
        name: 'Standard',
        description: 'Conference attendance',
        price: 2000000,
        quota: 600,
        sold: 156,
        saleStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(nextMonth.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: events[2].id,
        name: 'Premium',
        description: 'Premium seating with meals included',
        price: 5000000,
        quota: 200,
        sold: 45,
        saleStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(nextMonth.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
    // Webinar ticket (free)
    prisma.ticket.create({
      data: {
        eventId: events[3].id,
        name: 'Free Pass',
        description: 'Free access to the webinar',
        price: 0,
        quota: 200,
        sold: 78,
        saleStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
    // Coding Challenge tickets
    prisma.ticket.create({
      data: {
        eventId: events[4].id,
        name: 'Individual',
        description: 'Individual participation',
        price: 100000,
        quota: 70,
        sold: 34,
        saleStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: events[4].id,
        name: 'Team',
        description: 'Team participation (up to 4 members)',
        price: 300000,
        quota: 30,
        sold: 12,
        saleStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log('🎫 Created tickets');

  // Create Registrations
  const registrations = [];
  let ticketIndex = 0;

  // Tech Innovation Summit registrations
  for (let i = 0; i < 5; i++) {
    const participant = participants[i];
    const ticket = tickets[ticketIndex]; // Regular ticket
    const registration = await prisma.registration.create({
      data: {
        eventId: events[0].id,
        participantId: participant.id,
        ticketId: ticket.id,
        ticketCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        qrToken: `QR-${Math.random().toString(36).substring(2, 34)}`,
        status: 'CONFIRMED',
        fullName: participant.name,
        email: participant.email,
        phone: participant.phone,
        institution: participant.institution,
      },
    });
    registrations.push(registration);

    // Create some check-ins
    if (i < 3) {
      await prisma.checkIn.create({
        data: {
          registrationId: registration.id,
          eventId: events[0].id,
          participantId: participant.id,
          ticketId: ticket.id,
          checkedInBy: organizer1.id,
          status: 'SUCCESS',
        },
      });
      await prisma.registration.update({
        where: { id: registration.id },
        data: { status: 'CHECKED_IN' },
      });
    }
  }
  ticketIndex += 3; // Move past Tech Summit tickets

  // React Workshop registrations
  for (let i = 5; i < 8; i++) {
    const participant = participants[i % participants.length];
    const ticket = tickets[ticketIndex]; // Standard ticket
    const registration = await prisma.registration.create({
      data: {
        eventId: events[1].id,
        participantId: participant.id,
        ticketId: ticket.id,
        ticketCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        qrToken: `QR-${Math.random().toString(36).substring(2, 34)}`,
        status: 'CONFIRMED',
        fullName: participant.name,
        email: participant.email,
        phone: participant.phone,
        institution: participant.institution,
      },
    });
    registrations.push(registration);
  }
  ticketIndex += 2; // Move past Workshop tickets

  // Webinar registrations (free)
  for (let i = 0; i < 3; i++) {
    const participant = participants[(i + 3) % participants.length];
    const ticket = tickets[ticketIndex]; // Free Pass
    const registration = await prisma.registration.create({
      data: {
        eventId: events[3].id,
        participantId: participant.id,
        ticketId: ticket.id,
        ticketCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        qrToken: `QR-${Math.random().toString(36).substring(2, 34)}`,
        status: 'CONFIRMED',
        fullName: participant.name,
        email: participant.email,
        phone: participant.phone,
        institution: participant.institution,
      },
    });
    registrations.push(registration);
  }

  console.log('📝 Created registrations and check-ins');

  // Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdmin.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: superAdmin.id,
        metadata: { ip: '127.0.0.1' },
      },
      {
        userId: organizer1.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: organizer1.id,
        metadata: { ip: '127.0.0.1' },
      },
      {
        userId: organizer1.id,
        action: 'CREATE_EVENT',
        entity: 'Event',
        entityId: events[0].id,
        metadata: { eventName: events[0].name },
      },
      {
        userId: organizer2.id,
        action: 'CREATE_EVENT',
        entity: 'Event',
        entityId: events[2].id,
        metadata: { eventName: events[2].name },
      },
      {
        action: 'REGISTRATION',
        entity: 'Registration',
        entityId: registrations[0]?.id,
        metadata: { eventName: events[0].name },
      },
    ],
  });

  console.log('📋 Created audit logs');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📋 Demo Accounts:');
  console.log('─────────────────────────────────────────');
  console.log('🔐 SUPER ADMIN');
  console.log('   Email: admin@eventms.com');
  console.log('   Password: Password123');
  console.log('');
  console.log('🔐 ORGANIZER 1');
  console.log('   Email: organizer1@eventms.com');
  console.log('   Password: Password123');
  console.log('');
  console.log('🔐 ORGANIZER 2');
  console.log('   Email: organizer2@eventms.com');
  console.log('   Password: Password123');
  console.log('');
  console.log('🔐 PARTICIPANT');
  console.log('   Email: alice@email.com');
  console.log('   Password: Password123');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
