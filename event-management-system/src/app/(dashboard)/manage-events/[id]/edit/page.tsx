'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Ticket, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { updateEventSchema, type UpdateEventInput } from '@/schemas';
import type { Category } from '@/types';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [eventData, setEventData] = React.useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(updateEventSchema),
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesRes, eventRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/events/${eventId}`),
      ]);

      const catData = await categoriesRes.json();
      const evData = await eventRes.json();

      setCategories(catData.categories || []);

      if (eventRes.ok && evData.event) {
        const ev = evData.event;
        setEventData(ev);

        // Populate form
        reset({
          name: ev.name,
          categoryId: ev.categoryId,
          description: ev.description || '',
          bannerUrl: ev.bannerUrl || '',
          location: ev.location,
          address: ev.address || '',
          startDate: new Date(ev.startDate).toISOString().slice(0, 16),
          endDate: new Date(ev.endDate).toISOString().slice(0, 16),
          registrationStart: new Date(ev.registrationStart).toISOString().slice(0, 16),
          registrationEnd: new Date(ev.registrationEnd).toISOString().slice(0, 16),
          maxParticipants: ev.maxParticipants || undefined,
        });
      } else {
        toast({
          title: 'Error',
          description: evData.error || 'Failed to load event details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load edit event data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, reset]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: UpdateEventInput) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        maxParticipants:
          data.maxParticipants && !isNaN(Number(data.maxParticipants)) && Number(data.maxParticipants) > 0
            ? Number(data.maxParticipants)
            : undefined,
      };

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: 'Update Failed',
          description: result.error || 'Failed to update event',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });

      router.push('/manage-events');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/manage-events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground">{eventData?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {eventData?.slug && (
            <Button variant="outline" asChild>
              <Link href={`/events/${eventData.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                View Public Page
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={`/manage-events/${eventId}/tickets`}>
              <Ticket className="mr-2 h-4 w-4" />
              Manage Tickets
            </Link>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update general details for your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter event name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  defaultValue={eventData?.categoryId}
                  onValueChange={(v) => setValue('categoryId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  rows={4}
                  {...register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerUrl">Banner Image URL</Label>
                <Input
                  id="bannerUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...register('bannerUrl')}
                />
                {errors.bannerUrl && (
                  <p className="text-sm text-destructive">{errors.bannerUrl.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where will the event be hosted?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Venue Name *</Label>
                <Input
                  id="location"
                  placeholder="e.g. Jakarta Convention Center or Online via Zoom"
                  {...register('location')}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  placeholder="Complete address details..."
                  rows={3}
                  {...register('address')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Event Dates</CardTitle>
              <CardDescription>When does the event start and finish?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register('startDate')}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register('endDate')}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">{errors.endDate.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Period & Quota</CardTitle>
              <CardDescription>Set the window when participants can register</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registrationStart">Registration Opens *</Label>
                  <Input
                    id="registrationStart"
                    type="datetime-local"
                    {...register('registrationStart')}
                  />
                  {errors.registrationStart && (
                    <p className="text-sm text-destructive">{errors.registrationStart.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationEnd">Registration Closes *</Label>
                  <Input
                    id="registrationEnd"
                    type="datetime-local"
                    {...register('registrationEnd')}
                  />
                  {errors.registrationEnd && (
                    <p className="text-sm text-destructive">{errors.registrationEnd.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Overall Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="0"
                  placeholder="Leave empty for unlimited"
                  {...register('maxParticipants', { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
