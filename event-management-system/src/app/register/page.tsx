'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { registerSchema, type RegisterInput } from '@/schemas';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function RegisterPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PARTICIPANT',
    },
  });

  const selectedRole = watch('role') || 'PARTICIPANT';

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const payload = {
        ...data,
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
        role: data.role || 'PARTICIPANT',
        phone: data.phone?.trim() || undefined,
        institution: data.institution?.trim() || undefined,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
        toast({
          title: 'Pendaftaran Gagal',
          description: result.error || 'Terjadi kesalahan saat pendaftaran',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Pendaftaran Berhasil!',
        description: 'Akun Anda berhasil dibuat. Sedang masuk otomatis...',
      });

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push('/login?registered=true');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setServerError(error.message || 'Terjadi kesalahan koneksi. Silakan coba beberapa saat lagi.');
      toast({
        title: 'Error',
        description: 'Gagal menghubungi server.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBFBFA] dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border border-zinc-200/80 dark:border-zinc-800">
        <CardHeader className="space-y-3 text-center pb-2">
          {/* Ticzi Brand Logo */}
          <Link href="/" className="inline-flex items-center justify-center gap-2 group mx-auto mb-1">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-base">✕</span>
            </div>
          </Link>
          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Daftar Akun Baru</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {selectedRole === 'ORGANIZER'
                ? 'Kelola penjualan tiket & publikasikan event Anda'
                : 'Bergabunglah di Ticzi untuk memesan tiket event seru'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Server Error Alert */}
          {serverError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <div className="flex-1">{serverError}</div>
              <button
                type="button"
                onClick={() => setServerError(null)}
                className="opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Pilihan Peran Akun (Role) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Daftar Sebagai <span className="text-rose-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setValue('role', 'PARTICIPANT')}
                  className={cn(
                    'p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 relative overflow-hidden cursor-pointer',
                    selectedRole === 'PARTICIPANT'
                      ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/20 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-card text-foreground'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl">🎟️</span>
                    <span
                      className={cn(
                        'h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors',
                        selectedRole === 'PARTICIPANT'
                          ? 'bg-rose-500 text-white'
                          : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                      )}
                    >
                      ✓
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-xs">Partisipan</p>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                      Beli tiket & ikuti event
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('role', 'ORGANIZER')}
                  className={cn(
                    'p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 relative overflow-hidden cursor-pointer',
                    selectedRole === 'ORGANIZER'
                      ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/20 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-card text-foreground'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl">🎪</span>
                    <span
                      className={cn(
                        'h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors',
                        selectedRole === 'ORGANIZER'
                          ? 'bg-rose-500 text-white'
                          : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                      )}
                    >
                      ✓
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-xs">Organizer</p>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                      Buat & kelola event
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Nama Lengkap <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="cth: Ahmad Zaki"
                className="rounded-xl"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Alamat Email <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className="rounded-xl"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Password <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[10px] text-zinc-400">Min. 6 karakter</span>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-xl"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                Konfirmasi Password <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="rounded-xl"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-zinc-500">
                  No. Telepon (Opsional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0812xxxxxxxx"
                  className="rounded-xl"
                  {...register('phone')}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="institution" className="text-xs font-medium text-zinc-500">
                  {selectedRole === 'ORGANIZER' ? 'Organisasi / EO' : 'Instansi'} (Opsional)
                </Label>
                <Input
                  id="institution"
                  type="text"
                  placeholder={selectedRole === 'ORGANIZER' ? 'Nama EO / Komunitas' : 'Univ / Perusahaan'}
                  className="rounded-xl"
                  {...register('institution')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-2.5 shadow-md shadow-rose-500/20 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftarkan Akun...
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-xs text-muted-foreground pb-6">
          <p className="w-full">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
