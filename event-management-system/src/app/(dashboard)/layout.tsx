'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Sidebar } from '@/components/layout/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-muted/40">
          <div className="flex h-16 items-center border-b px-6">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="ml-2 h-6 w-20" />
          </div>
          <div className="flex-1 space-y-4 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={{
          name: session.user.name || '',
          email: session.user.email || '',
          role: session.user.role,
          image: session.user.image,
        }}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="container mx-auto p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
