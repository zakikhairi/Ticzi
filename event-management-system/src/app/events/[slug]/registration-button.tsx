'use client';

import * as React from 'react';
import Link from 'next/link';
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
  existingRegistrationId?: string | null;
}

export function RegistrationButton({
  eventId,
  tickets,
  hasMaxParticipants,
  spotsRemaining,
  existingRegistrationId,
}: RegistrationButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
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
    setFormError(null);

    if (!selectedTicket) {
      const err = 'Silakan pilih jenis tiket terlebih dahulu';
      setFormError(err);
      toast({
        title: 'Tiket Belum Dipilih',
        description: err,
        variant: 'destructive',
      });
      return;
    }

    if (!formData.fullName || !formData.email) {
      const err = 'Nama lengkap dan email wajib diisi';
      setFormError(err);
      toast({
        title: 'Data Belum Lengkap',
        description: err,
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
        const errMsg = result.error || 'Terjadi kesalahan saat pendaftaran event';
        setFormError(errMsg);
        toast({
          title: 'Pendaftaran Gagal',
          description: errMsg,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Pendaftaran Berhasil!',
        description: 'Anda berhasil terdaftar. Membuka tiket Anda...',
      });

      setOpen(false);
      router.push(`/my-tickets/${result.registration.id}`);
      router.refresh();
    } catch (error: any) {
      const errMsg = error.message || 'Gagal terhubung ke server. Silakan coba lagi.';
      setFormError(errMsg);
      toast({
        title: 'Error',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <Button disabled className="w-full">Memuat...</Button>;
  }

  if (!session) {
    return (
      <div className="space-y-3">
        <Button asChild className="w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold">
          <a href={`/login?callbackUrl=/events`}>Masuk untuk Mendaftar</a>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{' '}
          <a href="/register" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">
            Daftar Akun
          </a>
        </p>
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <Button disabled className="w-full rounded-full">
        Tiket Habis (Sold Out)
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setFormError(null); }}>
      {existingRegistrationId ? (
        <div className="space-y-2">
          <Button
            asChild
            className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 shadow-md shadow-emerald-600/20"
          >
            <Link href={`/my-tickets/${existingRegistrationId}`}>
              ✓ Anda Sudah Memiliki Tiket (Buka Tiket)
            </Link>
          </Button>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full text-xs font-medium text-muted-foreground hover:text-foreground border-dashed"
            >
              Ganti Jenis Tiket / Perbarui Data
            </Button>
          </DialogTrigger>
        </div>
      ) : (
        <DialogTrigger asChild>
          <Button className="w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-2.5 shadow-md shadow-rose-500/20">
            Daftar Sekarang
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Pendaftaran Event</DialogTitle>
            <DialogDescription>
              Lengkapi data di bawah ini untuk mengonfirmasi tiket Anda
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span className="flex-1">{formError}</span>
            </div>
          )}
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
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-2.5 shadow-md shadow-rose-500/20"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Memproses Pendaftaran...' : 'Konfirmasi Pendaftaran'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
