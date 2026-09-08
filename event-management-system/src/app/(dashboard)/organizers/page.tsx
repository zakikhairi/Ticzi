'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  UserCog,
  Search,
  Calendar,
  Plus,
  ExternalLink,
  Mail,
  Building,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

export default function OrganizersPage() {
  const [organizers, setOrganizers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  const fetchOrganizers = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users?role=ORGANIZER&pageSize=100');
      if (!res.ok) throw new Error('Failed to fetch organizers');
      const data = await res.json();
      setOrganizers(data.users || []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Could not load organizers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  const filteredOrganizers = React.useMemo(() => {
    if (!search.trim()) return organizers;
    const q = search.toLowerCase();
    return organizers.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        (o.institution && o.institution.toLowerCase().includes(q))
    );
  }, [organizers, search]);

  const totalEvents = organizers.reduce(
    (acc, cur) => acc + (cur._count?.organizedEvents || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Organizers Directory</h1>
          <p className="text-muted-foreground text-sm">
            Event creators with administrative hosting privileges.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/users">
            <Plus className="h-4 w-4" />
            Manage Roles in Users
          </Link>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Organizers</CardTitle>
            <UserCog className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : organizers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Authorized event publishers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Events Hosted</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Created across all organizers</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Platform Access</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Verified</div>
            <p className="text-xs text-muted-foreground mt-1">Full organizer tooling enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Organizer Accounts</CardTitle>
              <CardDescription>Track events organized by user.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredOrganizers.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">No organizers found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {search
                  ? `No organizers matching "${search}"`
                  : 'No users have the Organizer role yet.'}
              </p>
              <Button asChild variant="outline">
                <Link href="/users">Assign Organizer Role</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Organizer</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Events Created</TableHead>
                    <TableHead className="w-[140px]">Joined</TableHead>
                    <TableHead className="w-[100px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizers.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold text-xs">
                              {org.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="font-semibold text-sm truncate block">{org.name}</span>
                            <span className="text-xs text-muted-foreground truncate block">
                              {org.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {org.institution || <span className="italic text-muted-foreground/50">Personal</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {org.phone || <span className="italic text-muted-foreground/50">-</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-medium">
                          {org._count?.organizedEvents || 0} events
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(org.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="gap-1">
                          <Link href={`/users?search=${encodeURIComponent(org.email)}`}>
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
