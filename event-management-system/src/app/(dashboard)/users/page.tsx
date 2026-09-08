'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import {
  Users,
  UserCheck,
  UserCog,
  Shield,
  Search,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Phone,
  Building,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ORGANIZER' | 'PARTICIPANT';
  phone: string | null;
  institution: string | null;
  image: string | null;
  createdAt: string;
  _count?: {
    registrations: number;
    organizedEvents: number;
  };
}

export default function UsersManagementPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [activeRoleTab, setActiveRoleTab] = React.useState<string>('ALL');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserItem | null>(null);

  // Form states
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [newUserData, setNewUserData] = React.useState({
    name: '',
    email: '',
    password: '',
    role: 'PARTICIPANT',
    phone: '',
    institution: '',
  });
  const [editUserData, setEditUserData] = React.useState({
    name: '',
    role: 'PARTICIPANT',
    phone: '',
    institution: '',
  });

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '10');
      if (search.trim()) params.set('search', search.trim());
      if (activeRoleTab !== 'ALL') params.set('role', activeRoleTab);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();

      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Could not load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, activeRoleTab]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Search submit / reset page
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleTabChange = (val: string) => {
    setActiveRoleTab(val);
    setPage(1);
  };

  // Create User
  const handleOpenCreate = () => {
    setNewUserData({
      name: '',
      email: '',
      password: '',
      role: 'PARTICIPANT',
      phone: '',
      institution: '',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      setFormError('Name, email, and password are required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast({
        title: 'User Created',
        description: `User "${data.user.name}" created successfully.`,
      });
      setIsCreateOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit User
  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      institution: user.institution || '',
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      setFormError(null);
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      toast({
        title: 'User Updated',
        description: `Profile for "${data.user.name}" has been updated.`,
      });
      setIsEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const handleOpenDelete = (user: UserItem) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      toast({
        title: 'User Deleted',
        description: `Account for "${selectedUser.name}" has been permanently removed.`,
      });
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Cannot Delete User',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <Badge variant="destructive" className="gap-1 font-medium">
            <Shield className="h-3 w-3" />
            Super Admin
          </Badge>
        );
      case 'ORGANIZER':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white gap-1 font-medium">
            <UserCog className="h-3 w-3" />
            Organizer
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 font-medium">
            <UserCheck className="h-3 w-3" />
            Participant
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm">
            Oversee system accounts, assign organizer permissions, and manage platform roles.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Tabs for quick role filter */}
            <Tabs value={activeRoleTab} onValueChange={handleTabChange} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="ALL">All ({totalItems})</TabsTrigger>
                <TabsTrigger value="SUPER_ADMIN">Admins</TabsTrigger>
                <TabsTrigger value="ORGANIZER">Organizers</TabsTrigger>
                <TabsTrigger value="PARTICIPANT">Participants</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {search
                  ? `No user records matching "${search}"`
                  : 'No users in this role category.'}
              </p>
              {search && (
                <Button variant="outline" onClick={() => handleSearchChange('')}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[240px]">User</TableHead>
                      <TableHead className="w-[150px]">Role</TableHead>
                      <TableHead>Contact / Institution</TableHead>
                      <TableHead className="text-center">Activity</TableHead>
                      <TableHead className="w-[120px]">Joined</TableHead>
                      <TableHead className="w-[110px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => {
                      const isSelf = u.id === currentUserId;
                      return (
                        <TableRow key={u.id} className={isSelf ? 'bg-muted/30' : undefined}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                  {u.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm truncate">{u.name}</span>
                                  {isSelf && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground truncate block">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(u.role)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {u.institution ? (
                              <div className="flex items-center gap-1.5 truncate">
                                <Building className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{u.institution}</span>
                              </div>
                            ) : null}
                            {u.phone ? (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <Phone className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span>{u.phone}</span>
                              </div>
                            ) : null}
                            {!u.institution && !u.phone && (
                              <span className="text-xs italic text-muted-foreground/60">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {u.role === 'ORGANIZER' ? (
                              <span className="font-medium text-foreground">
                                {u._count?.organizedEvents || 0} events created
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {u._count?.registrations || 0} registrations
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(u.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(u)}
                                title="Edit Role / Info"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDelete(u)}
                                disabled={isSelf}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                                title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Page {page} of {totalPages} ({totalItems} total users)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a user account and assign system privileges.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20 my-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3.5 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-name">Full Name *</Label>
                <Input
                  id="create-name"
                  placeholder="John Doe"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-email">Email Address *</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="john@example.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-password">Temporary Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-role">Role</Label>
                <Select
                  value={newUserData.role}
                  onValueChange={(val) => setNewUserData({ ...newUserData, role: val })}
                >
                  <SelectTrigger id="create-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PARTICIPANT">Participant</SelectItem>
                    <SelectItem value="ORGANIZER">Organizer</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-phone">Phone (Optional)</Label>
                  <Input
                    id="create-phone"
                    placeholder="08123456789"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-inst">Institution (Optional)</Label>
                  <Input
                    id="create-inst"
                    placeholder="Company / Campus"
                    value={newUserData.institution}
                    onChange={(e) => setNewUserData({ ...newUserData, institution: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit User Profile</DialogTitle>
              <DialogDescription>
                Update role and profile information for {selectedUser?.email}.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20 my-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3.5 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-role">Assigned Role</Label>
                <Select
                  value={editUserData.role}
                  onValueChange={(val) => setEditUserData({ ...editUserData, role: val })}
                  disabled={selectedUser?.id === currentUserId}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PARTICIPANT">Participant</SelectItem>
                    <SelectItem value="ORGANIZER">Organizer</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                {selectedUser?.id === currentUserId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    You cannot modify your own Super Admin privileges here.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editUserData.phone}
                  onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                  placeholder="08123456789"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-inst">Institution / Organization</Label>
                <Input
                  id="edit-inst"
                  value={editUserData.institution}
                  onChange={(e) => setEditUserData({ ...editUserData, institution: e.target.value })}
                  placeholder="Company / University"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={submitting}
              >
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

      {/* Delete User Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the account for &ldquo;{selectedUser?.name}&rdquo; ({selectedUser?.email})?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2 p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20 my-2">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Permanent Action</p>
              <p className="mt-1 text-xs">
                This will delete the user and may cascade to their event registrations or audit logs. This cannot be undone.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
