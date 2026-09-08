'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createEventSchema, type CreateEventInput } from '@/schemas';
import type { Category } from '@/types';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
  });

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const onSubmit = async (data: CreateEventInput) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        maxParticipants:
          data.maxParticipants && !isNaN(Number(data.maxParticipants)) && Number(data.maxParticipants) > 0
            ? Number(data.maxParticipants)
            : undefined,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create event',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Event created successfully. Now, add your ticket types!',
      });

      router.push(`/manage-events/${result.event.id}/tickets`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/manage-events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">Fill in the details for your event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
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
                <Select onValueChange={(v) => setValue('categoryId', v)}>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Venue Name *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Jakarta Convention Center"
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
                  placeholder="Full address including city..."
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
              <CardTitle>Registration Period</CardTitle>
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
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
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
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}
