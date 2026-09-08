# Event Management System

A comprehensive event management system built with Next.js 15, TypeScript, Prisma, and Neon PostgreSQL.

## Features

### Authentication & Authorization
- Secure login/register with credentials
- Role-based access control (Super Admin, Organizer, Participant)
- Session management with NextAuth.js v5

### Event Management
- Create, read, update, delete events
- Publish/unpublish events
- Event categorization
- Event filtering and search

### Ticketing System
- Multiple ticket types per event
- Configurable pricing and quotas
- Sale period management

### Registration & Check-in
- Participant registration with QR codes
- Digital ticket generation
- QR code scanning for check-in
- Duplicate check-in prevention

### Dashboards
- Super Admin dashboard
- Organizer dashboard with statistics
- Participant dashboard

### Reporting
- Registration reports
- Ticket sales reports
- Check-in reports
- CSV/Excel export

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (Neon), Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Validation**: Zod, React Hook Form
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- Neon PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd event-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your Neon PostgreSQL connection string:
```env
DATABASE_URL="postgresql://user:password@host.neon.tech/neon_db?sslmode=require"
AUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

5. Generate Auth Secret:
```bash
openssl rand -base64 32
```

### Database Setup

1. Push the Prisma schema to your Neon database:
```bash
npx prisma db push
```

2. Seed the database with sample data:
```bash
npm run db:seed
```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

After seeding, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@eventms.com | Password123 |
| Organizer | organizer1@eventms.com | Password123 |
| Organizer | organizer2@eventms.com | Password123 |
| Participant | alice@email.com | Password123 |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Dashboard pages (protected)
│   ├── (auth)/           # Auth pages
│   ├── api/              # API routes
│   └── events/           # Public event pages
├── components/
│   ├── ui/              # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
├── services/             # Business logic
├── schemas/              # Zod validation schemas
└── types/                # TypeScript types
```

## Deployment to Vercel

1. Push your code to GitHub

2. Create a new project on Vercel

3. Connect your GitHub repository

4. Add environment variables in Vercel:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `AUTH_SECRET`: Generated secret
   - `NEXTAUTH_URL`: Your Vercel deployment URL

5. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/[id]` - Get event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `POST /api/events/[id]/publish` - Publish event
- `POST /api/events/[id]/unpublish` - Unpublish event

### Registration
- `POST /api/events/[eventId]/register` - Register for event

### Check-in
- `POST /api/check-in` - Perform check-in

### Categories
- `GET /api/categories` - List categories

## Database Schema

The application uses the following main tables:
- `User` - User accounts
- `Event` - Event details
- `Category` - Event categories
- `Ticket` - Ticket types
- `Registration` - Participant registrations
- `CheckIn` - Check-in records
- `AuditLog` - Activity audit logs

## License

MIT
