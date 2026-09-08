'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Search, SlidersHorizontal, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicHeader } from '@/components/layout/public-header';
import { getEvents } from '@/services/event.service';
import type { EventWithRelations, Category } from '@/types';

export const dynamic = 'force-dynamic';

function EventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = React.useState<EventWithRelations[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({
    page: 1,
    pageSize: 9,
    totalItems: 0,
    totalPages: 0,
  });

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || 'PUBLISHED';
  const page = parseInt(searchParams.get('page') || '1');

  React.useEffect(() => {
    loadData();
  }, [search, category, status, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (status) params.set('status', status);
      params.set('page', page.toString());
      params.set('pageSize', '9');

      const [eventsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/events?${params.toString()}`),
        fetch('/api/categories'),
      ]);

      const eventsData = await eventsResponse.json();
      const categoriesData = await categoriesResponse.json();

      setEvents(eventsData.events || []);
      setCategories(categoriesData.categories || []);
      setPagination(eventsData.pagination || { page: 1, pageSize: 9, totalItems: 0, totalPages: 0 });
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/events?${params.toString()}`);
  };

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <PublicHeader />

      {/* Header */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-2 text-3xl font-bold">Browse Events</h1>
          <p className="text-muted-foreground">
            Discover and register for amazing events
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10"
              defaultValue={search}
              onChange={(e) => updateParams('search', e.target.value)}
            />
          </div>
          <Select
            value={category || 'ALL'}
            onValueChange={(v) => updateParams('category', v === 'ALL' ? '' : v)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status || 'ALL'}
            onValueChange={(v) => updateParams('status', v === 'ALL' ? '' : v)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {events.length} of {pagination.totalItems} events
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  {event.bannerUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={event.bannerUrl}
                        alt={event.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary">{event.category.name}</Badge>
                      <Badge
                        variant={
                          event.status === 'PUBLISHED'
                            ? 'success'
                            : event.status === 'ONGOING'
                            ? 'info'
                            : 'secondary'
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <h3 className="line-clamp-1 text-lg font-semibold">{event.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(event.startDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        By {event.organizer.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {event._count?.registrations || 0}
                          {event.maxParticipants && ` / ${event.maxParticipants}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/events/${event.slug}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-4 text-sm">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === pagination.totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsPageContent />
    </Suspense>
  );
}

function EventsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
