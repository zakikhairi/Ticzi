'use client';

import * as React from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Shield,
  Clock,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { formatDateTime } from '@/lib/utils';

interface AuditLogItem {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionFilter, setActionFilter] = React.useState<string>('ALL');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  // Metadata inspector dialog
  const [selectedLog, setSelectedLog] = React.useState<AuditLogItem | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(false);

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '20');
      if (actionFilter !== 'ALL') {
        params.set('action', actionFilter);
      }

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();

      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Could not load audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleActionChange = (val: string) => {
    setActionFilter(val);
    setPage(1);
  };

  const handleInspect = (log: AuditLogItem) => {
    setSelectedLog(log);
    setIsInspectorOpen(true);
  };

  const getActionBadge = (action: string) => {
    if (action.startsWith('CREATE') || action === 'REGISTER') {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px]">
          {action}
        </Badge>
      );
    }
    if (action.startsWith('UPDATE') || action === 'PUBLISH_EVENT') {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[11px]">
          {action}
        </Badge>
      );
    }
    if (action.startsWith('DELETE') || action.includes('CANCEL')) {
      return (
        <Badge variant="destructive" className="font-mono text-[11px]">
          {action}
        </Badge>
      );
    }
    if (action === 'CHECK_IN') {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-mono text-[11px]">
          {action}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="font-mono text-[11px]">
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Audit Trail & Security Logs</h1>
          <p className="text-muted-foreground text-sm">
            Immutable log records of administrative actions, logins, check-ins, and data modifications.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Activity Records</CardTitle>
              <CardDescription>
                Showing {totalItems} recorded events across the system.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={actionFilter} onValueChange={handleActionChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="CREATE_EVENT">CREATE_EVENT</SelectItem>
                  <SelectItem value="UPDATE_EVENT">UPDATE_EVENT</SelectItem>
                  <SelectItem value="PUBLISH_EVENT">PUBLISH_EVENT</SelectItem>
                  <SelectItem value="UNPUBLISH_EVENT">UNPUBLISH_EVENT</SelectItem>
                  <SelectItem value="CREATE_TICKET">CREATE_TICKET</SelectItem>
                  <SelectItem value="UPDATE_TICKET">UPDATE_TICKET</SelectItem>
                  <SelectItem value="CHECK_IN">CHECK_IN</SelectItem>
                  <SelectItem value="REGISTRATION">REGISTRATION</SelectItem>
                  <SelectItem value="CREATE_USER">CREATE_USER</SelectItem>
                  <SelectItem value="UPDATE_USER">UPDATE_USER</SelectItem>
                  <SelectItem value="DELETE_USER">DELETE_USER</SelectItem>
                  <SelectItem value="CREATE_CATEGORY">CREATE_CATEGORY</SelectItem>
                  <SelectItem value="UPDATE_CATEGORY">UPDATE_CATEGORY</SelectItem>
                  <SelectItem value="DELETE_CATEGORY">DELETE_CATEGORY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">No audit logs found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {actionFilter !== 'ALL'
                  ? `No events logged with action "${actionFilter}".`
                  : 'System activity will appear here as actions are performed.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[150px]">Actor / User</TableHead>
                      <TableHead className="w-[170px]">Action</TableHead>
                      <TableHead className="w-[120px]">Entity</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead className="w-[80px] text-right">Payload</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          {log.user ? (
                            <div className="min-w-0">
                              <span className="font-semibold text-xs truncate block text-foreground">
                                {log.user.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground truncate block">
                                {log.user.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs italic text-muted-foreground">System</span>
                          )}
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-mono">
                            {log.entity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[150px] truncate">
                          {log.entityId || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleInspect(log)}
                            disabled={!log.metadata && !log.ipAddress && !log.userAgent}
                            title="Inspect metadata"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Page {page} of {totalPages} ({totalItems} total logs)
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

      {/* Payload Inspector Dialog */}
      <Dialog open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Audit Log Details</span>
            </DialogTitle>
            <DialogDescription>
              Action: <span className="font-mono font-semibold text-foreground">{selectedLog?.action}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/50 border text-xs">
              <div>
                <span className="text-muted-foreground block">Actor:</span>
                <span className="font-medium text-foreground">
                  {selectedLog?.user?.name || 'System / Unauthenticated'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Entity ID:</span>
                <span className="font-mono text-foreground">{selectedLog?.entityId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Logged At:</span>
                <span>{selectedLog?.createdAt ? formatDateTime(selectedLog.createdAt) : '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">IP Address:</span>
                <span className="font-mono">{selectedLog?.ipAddress || 'Not captured'}</span>
              </div>
            </div>

            {selectedLog?.userAgent && (
              <div>
                <span className="text-muted-foreground block font-medium mb-1">User Agent:</span>
                <div className="p-2 rounded bg-muted/40 font-mono text-[11px] text-muted-foreground break-all">
                  {selectedLog.userAgent}
                </div>
              </div>
            )}

            <div>
              <span className="text-muted-foreground block font-medium mb-1">Payload Metadata:</span>
              <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] max-h-60 overflow-y-auto overflow-x-auto">
                {selectedLog?.metadata
                  ? JSON.stringify(selectedLog.metadata, null, 2)
                  : 'No additional metadata attached.'}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
