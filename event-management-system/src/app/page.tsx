import Link from 'next/link';
import {
  Calendar,
  CheckCircle,
  MapPin,
  QrCode,
  Search,
  Ticket,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';

async function getFeaturedEvents() {
  return prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    take: 3,
    orderBy: { startDate: 'asc' },
    include: {
      category: true,
      organizer: { select: { name: true } },
      _count: { select: { registrations: true } },
    },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { events: true } } },
  });
}

export default async function HomePage() {
  const [featuredEvents, categories] = await Promise.all([
    getFeaturedEvents(),
    getCategories(),
  ]);

  const features = [
    {
      icon: Search,
      title: 'Find Events',
      description: 'Browse and discover events that match your interests',
    },
    {
      icon: Ticket,
      title: 'Easy Registration',
      description: 'Register for events with just a few clicks',
    },
    {
      icon: QrCode,
      title: 'Digital Tickets',
      description: 'Get your QR code ticket instantly after registration',
    },
    {
      icon: CheckCircle,
      title: 'Quick Check-in',
      description: 'Organizers can scan QR codes for seamless check-ins',
    },
  ];

  const steps = [
    { number: 1, title: 'Find Event', description: 'Browse events by category' },
    { number: 2, title: 'Register', description: 'Sign up with your details' },
    { number: 3, title: 'Get Ticket', description: 'Receive your digital ticket' },
    { number: 4, title: 'Check-in', description: 'Scan QR at the event' },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Manage Events. Simplify Registration.{' '}
              <span className="text-primary">Track Every Check-in.</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              The all-in-one platform for organizing events, managing
              registrations, and streamlining check-ins with digital tickets.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/events">
                  <Search className="mr-2 h-5 w-5" />
                  Explore Events
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Everything You Need
            </h2>
            <p className="text-muted-foreground">
              Powerful features to manage your events from start to finish
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Get started in four simple steps
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold tracking-tight">
                  Featured Events
                </h2>
                <p className="text-muted-foreground">
                  Don't miss these upcoming events
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/events">View All</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  {event.bannerUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={event.bannerUrl}
                        alt={event.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="mb-2">
                      <span className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {event.category.name}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.startDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        By {event.organizer.name}
                      </span>
                      <span className="text-sm font-medium">
                        {event._count.registrations} registered
                      </span>
                    </div>
                    <Button asChild className="mt-4 w-full">
                      <Link href={`/events/${event.slug}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-muted/50 py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                Event Categories
              </h2>
              <p className="text-muted-foreground">
                Find events by category
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-auto py-4"
                >
                  <Link href={`/events?category=${category.id}`}>
                    <span className="mr-2">{getCategoryIcon(category.name)}</span>
                    {category.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({category._count.events})
                    </span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-8 text-center text-primary-foreground lg:p-12">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-primary-foreground/80">
              Join thousands of event organizers and participants using our
              platform every day.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Create Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent">
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">Event Management System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Event Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getCategoryIcon(categoryName: string): string {
  const icons: Record<string, string> = {
    Seminar: '🎤',
    Workshop: '🔧',
    Conference: '🏛️',
    Competition: '🏆',
    Webinar: '💻',
    Gathering: '🎉',
    Training: '📚',
    Other: '📌',
  };
  return icons[categoryName] || '📌';
}
