'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Ticket as TicketIcon,
  Pencil,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { formatCurrency } from '@/lib/utils';

export default function EventTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [loading, setLoading] = React.useState(true);
  const [event, setEvent] = React.useState<any>(null);
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editTicket, setEditTicket] = React.useState<any>(null);
  const [deleteTicket, setDeleteTicket] = React.useState<any>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    price: 0,
    quota: 100,
    saleStart: '',
    saleEnd: '',
    status: 'ACTIVE',
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/tickets`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
        setTickets(data.tickets || []);
        setStats(data.stats || null);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load tickets',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setFormData({
      name: '',
      description: '',
      price: 0,
      quota: 100,
      saleStart: now.toISOString().slice(0, 16),
      saleEnd: nextWeek.toISOString().slice(0, 16),
      status: 'ACTIVE',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (ticket: any) => {
    setFormData({
      name: ticket.name,
      description: ticket.description || '',
      price: Number(ticket.price),
      quota: ticket.quota,
      saleStart: new Date(ticket.saleStart).toISOString().slice(0, 16),
      saleEnd: new Date(ticket.saleEnd).toISOString().slice(0, 16),
      status: ticket.status,
    });
    setEditTicket(ticket);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Ticket name is required', variant: 'destructive' });
      return;
    }

    if (new Date(formData.saleEnd) <= new Date(formData.saleStart)) {
      toast({ title: 'Sale end must be after sale start', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          quota: Number(formData.quota),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Success', description: 'Ticket created successfully' });
        setIsCreateOpen(false);
        loadData();
      } else {
        toast({ title: 'Failed to create ticket', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTicket) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/tickets/${editTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          quota: Number(formData.quota),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Success', description: 'Ticket updated successfully' });
        setEditTicket(null);
        loadData();
      } else {
        toast({ title: 'Failed to update ticket', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTicket) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/tickets/${deleteTicket.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Success', description: 'Ticket deleted successfully' });
        setDeleteTicket(null);
        loadData();
      } else {
        toast({ title: 'Failed to delete ticket', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'SOLD_OUT':
        return <Badge variant="destructive">Sold Out</Badge>;
      case 'INACTIVE':
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/manage-events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manage Tickets</h1>
            <p className="text-muted-foreground">{event?.name || 'Event Tickets'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/manage-events/${eventId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Event
            </Link>
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Ticket Tier
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quota</CardTitle>
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuota}</div>
              <p className="text-xs text-muted-foreground">Available ticket slots</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalSold}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalQuota > 0
                  ? `${Math.round((stats.totalSold / stats.totalQuota) * 100)}% sold`
                  : '0% sold'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Quota</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalRemaining}</div>
              <p className="text-xs text-muted-foreground">Remaining tickets</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">From ticket sales</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Types ({tickets.length})</CardTitle>
          <CardDescription>
            Define ticket tiers such as Regular, VIP, Early Bird, or Free Admission.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <div className="p-12 text-center">
              <TicketIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No tickets yet</h3>
              <p className="mb-4 text-muted-foreground">
                Create at least one ticket type so participants can register for this event.
              </p>
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Ticket
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sales & Quota</TableHead>
                  <TableHead>Sale Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const percentSold =
                    ticket.quota > 0 ? Math.round((ticket.sold / ticket.quota) * 100) : 0;
                  const isFree = Number(ticket.price) === 0;

                  return (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="font-semibold">{ticket.name}</div>
                        {ticket.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {ticket.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {isFree ? 'FREE' : formatCurrency(Number(ticket.price))}
                        </span>
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{ticket.sold} sold</span>
                            <span className="text-muted-foreground">
                              {ticket.quota - ticket.sold} left of {ticket.quota}
                            </span>
                          </div>
                          <Progress value={percentSold} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>
                          Start: {new Date(ticket.saleStart).toLocaleDateString('id-ID')}
                        </div>
                        <div>
                          End: {new Date(ticket.saleEnd).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(ticket)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTicket(ticket)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Add Ticket Tier</DialogTitle>
              <DialogDescription>
                Create a new ticket type with pricing and quota limits.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ticket Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Regular, VIP, Early Bird"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is included with this ticket?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (IDR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0 for Free"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter 0 for free tickets</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quota">Quota *</Label>
                  <Input
                    id="quota"
                    type="number"
                    min="1"
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saleStart">Sale Start *</Label>
                  <Input
                    id="saleStart"
                    type="datetime-local"
                    value={formData.saleStart}
                    onChange={(e) => setFormData({ ...formData, saleStart: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saleEnd">Sale End *</Label>
                  <Input
                    id="saleEnd"
                    type="datetime-local"
                    value={formData.saleEnd}
                    onChange={(e) => setFormData({ ...formData, saleEnd: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Modal */}
      <Dialog open={!!editTicket} onOpenChange={() => setEditTicket(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Ticket Tier</DialogTitle>
              <DialogDescription>
                Update ticket details, price, quota, or status.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Ticket Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (IDR) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-quota">Quota *</Label>
                  <Input
                    id="edit-quota"
                    type="number"
                    min={editTicket?.sold || 1}
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                    required
                  />
                  {editTicket?.sold > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Minimum {editTicket.sold} (already sold)
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-saleStart">Sale Start *</Label>
                  <Input
                    id="edit-saleStart"
                    type="datetime-local"
                    value={formData.saleStart}
                    onChange={(e) => setFormData({ ...formData, saleStart: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-saleEnd">Sale End *</Label>
                  <Input
                    id="edit-saleEnd"
                    type="datetime-local"
                    value={formData.saleEnd}
                    onChange={(e) => setFormData({ ...formData, saleEnd: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTicket} onOpenChange={() => setDeleteTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTicket?.name}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deleteTicket?.sold > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                This ticket has {deleteTicket.sold} registered participant(s) and cannot be deleted.
                Deactivate it instead.
              </span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTicket(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={submitting || deleteTicket?.sold > 0}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
