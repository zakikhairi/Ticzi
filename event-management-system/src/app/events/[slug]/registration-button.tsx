'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import type { Decimal } from '@prisma/client/runtime/library';

interface Ticket {
  id: string;
  name: string;
  description: string | null;
  price: string | number | Decimal;
  quota: number;
  sold: number;
}

interface RegistrationButtonProps {
  eventId: string;
  tickets: Ticket[];
  hasMaxParticipants: boolean;
  spotsRemaining: number | null;
}

export function RegistrationButton({
  eventId,
  tickets,
  hasMaxParticipants,
  spotsRemaining,
}: RegistrationButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<string>('');
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    additionalInfo: '',
  });

  const isSoldOut = spotsRemaining === 0;

  React.useEffect(() => {
    if (session?.user) {
      setFormData({
        fullName: session.user.name || '',
        email: session.user.email || '',
        phone: '',
        institution: '',
        additionalInfo: '',
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket) {
      toast({
        title: 'Error',
        description: 'Please select a ticket type',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.fullName || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: 'Registration Failed',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Registration Successful!',
        description: 'You have been registered for this event.',
      });

      setOpen(false);
      router.push(`/my-tickets/${result.registration.id}`);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <Button disabled>Loading...</Button>;
  }

  if (!session) {
    return (
      <div className="space-y-3">
        <Button asChild className="w-full">
          <a href="/login?callbackUrl=/events">Login to Register</a>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="/register" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <Button disabled className="w-full">
        Sold Out
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Register Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Event Registration</DialogTitle>
            <DialogDescription>
              Fill in your details to register for this event
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ticket">Ticket Type *</Label>
              <Select value={selectedTicket} onValueChange={setSelectedTicket} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket type" />
                </SelectTrigger>
                <SelectContent>
                  {tickets.map((ticket) => {
                    const remaining = ticket.quota - ticket.sold;
                    const isTicketSoldOut = remaining <= 0;
                    return (
                      <SelectItem
                        key={ticket.id}
                        value={ticket.id}
                        disabled={isTicketSoldOut}
                      >
                        {ticket.name} -{' '}
                        {ticket.price === '0' ? 'FREE' : formatCurrency(Number(ticket.price))}
                        {isTicketSoldOut && ' (Sold Out)'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution / Company</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) =>
                  setFormData({ ...formData, institution: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, additionalInfo: e.target.value })
                }
                placeholder="Any special requirements or notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Registration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
