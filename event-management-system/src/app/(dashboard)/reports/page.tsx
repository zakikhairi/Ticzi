'use client';

import * as React from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  Users,
  CheckCircle2,
  Ticket,
  Clock,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { exportToExcel, exportToCSV } from '@/lib/export';

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId') || undefined;

  const [loading, setLoading] = React.useState(true);
  const [events, setEvents] = React.useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string>('');
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);
  const [regReport, setRegReport] = React.useState<any>(null);
  const [ticketReport, setTicketReport] = React.useState<any>(null);
  const [checkInReport, setCheckInReport] = React.useState<any>(null);
  const [participants, setParticipants] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');

  const loadReport = React.useCallback(async (eventId?: string) => {
    setLoading(true);
    try {
      const url = eventId ? `/api/reports?eventId=${eventId}` : '/api/reports';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setSelectedEvent(data.selectedEvent || null);
        if (data.selectedEvent) {
          setSelectedEventId(data.selectedEvent.id);
        }
        setRegReport(data.registrationReport || null);
        setTicketReport(data.ticketReport || null);
        setCheckInReport(data.checkInReport || null);
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Failed to load report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadReport(initialEventId);
  }, [loadReport, initialEventId]);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    loadReport(eventId);
  };

  const handleExportExcel = () => {
    if (!selectedEvent || participants.length === 0) {
      toast({ title: 'No data to export', variant: 'destructive' });
      return;
    }

    const participantData = participants.map((p, idx) => ({
      No: idx + 1,
      'Full Name': p.fullName,
      Email: p.email,
      Phone: p.phone,
      Institution: p.institution,
      'Ticket Tier': p.ticketName,
      'Price (IDR)': p.price,
      'Registration Status': p.status,
      'Checked In': p.isCheckedIn ? 'YES' : 'NO',
      'Checked In At': p.checkedInAt
        ? new Date(p.checkedInAt).toLocaleString('id-ID')
        : '-',
      'Registered At': new Date(p.registeredAt).toLocaleString('id-ID'),
    }));

    const ticketData = (ticketReport?.salesByType || []).map((t: any) => ({
      'Ticket Name': t.name,
      'Price (IDR)': t.revenue && t.sold ? Math.round(t.revenue / t.sold) : 0,
      'Tickets Sold': t.sold,
      Quota: t.quota,
      'Remaining Quota': t.quota - t.sold,
      'Total Revenue (IDR)': t.revenue,
    }));

    const summaryData = [
      { Metric: 'Event Name', Value: selectedEvent.name },
      { Metric: 'Event Date', Value: new Date(selectedEvent.startDate).toLocaleDateString('id-ID') },
      { Metric: 'Location', Value: selectedEvent.location },
      { Metric: 'Total Registrations', Value: regReport?.total || 0 },
      { Metric: 'Confirmed Attendees', Value: regReport?.confirmed || 0 },
      { Metric: 'Checked In', Value: checkInReport?.totalCheckedIn || 0 },
      { Metric: 'Check-in Rate', Value: `${Math.round(checkInReport?.checkInPercentage || 0)}%` },
      { Metric: 'Total Tickets Sold', Value: ticketReport?.ticketsSold || 0 },
    ];

    exportToExcel(`Report_${selectedEvent.name.replace(/[^a-zA-Z0-9]/g, '_')}`, [
      { sheetName: 'Participants', data: participantData },
      { sheetName: 'Ticket Sales', data: ticketData },
      { sheetName: 'Event Summary', data: summaryData },
    ]);

    toast({ title: 'Success', description: 'Report exported to Excel (.xlsx)' });
  };

  const handleExportCSV = () => {
    if (!selectedEvent || participants.length === 0) {
      toast({ title: 'No data to export', variant: 'destructive' });
      return;
    }

    const participantData = participants.map((p, idx) => ({
      No: idx + 1,
      'Full Name': p.fullName,
      Email: p.email,
      Phone: p.phone,
      Institution: p.institution,
      'Ticket Tier': p.ticketName,
      'Price (IDR)': p.price,
      'Registration Status': p.status,
      'Checked In': p.isCheckedIn ? 'YES' : 'NO',
      'Registered At': new Date(p.registeredAt).toLocaleDateString('id-ID'),
    }));

    exportToCSV(`Participants_${selectedEvent.name.replace(/[^a-zA-Z0-9]/g, '_')}`, participantData);
    toast({ title: 'Success', description: 'Participants exported to CSV' });
  };

  const filteredParticipants = participants.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.institution.toLowerCase().includes(q) ||
      p.ticketName.toLowerCase().includes(q)
    );
  });

  if (loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Event Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Detailed event reports and data export</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {events.length > 0 && (
            <Select value={selectedEventId} onValueChange={handleEventChange}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" onClick={handleExportCSV} disabled={participants.length === 0}>
            <FileText className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={handleExportExcel} disabled={participants.length === 0}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel (.xlsx)
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Events Found</h3>
          <p className="text-muted-foreground">Create an event to view reports and analytics.</p>
        </Card>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regReport?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {regReport?.confirmed || 0} confirmed, {regReport?.pending || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(checkInReport?.checkInPercentage || 0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {checkInReport?.totalCheckedIn || 0} of {checkInReport?.totalParticipants || 0} checked in
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {ticketReport?.ticketsSold || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {ticketReport?.ticketsRemaining || 0} tickets remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Revenue</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    (ticketReport?.salesByType || []).reduce(
                      (acc: number, curr: any) => acc + (curr.revenue || 0),
                      0
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total ticket sales</p>
              </CardContent>
            </Card>
          </div>

          {/* Report Tabs */}
          <Tabs defaultValue="participants" className="space-y-4">
            <TabsList>
              <TabsTrigger value="participants">Participant Registrations</TabsTrigger>
              <TabsTrigger value="tickets">Ticket Sales Breakdown</TabsTrigger>
              <TabsTrigger value="checkin">Check-in Activity</TabsTrigger>
            </TabsList>

            {/* Tab 1: Participants */}
            <TabsContent value="participants" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Participants List ({participants.length})</CardTitle>
                    <CardDescription>All registered participants for this event</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search participant..."
                      className="pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredParticipants.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                      No participants match your criteria
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Institution</TableHead>
                          <TableHead>Ticket</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead>Registered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredParticipants.map((p, idx) => (
                          <TableRow key={p.id}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell className="font-medium">{p.fullName}</TableCell>
                            <TableCell>{p.email}</TableCell>
                            <TableCell>{p.institution}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{p.ticketName}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  p.status === 'CONFIRMED'
                                    ? 'success'
                                    : p.status === 'CHECKED_IN'
                                    ? 'info'
                                    : 'secondary'
                                }
                              >
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {p.isCheckedIn ? (
                                <Badge variant="success">Checked In</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(p.registeredAt).toLocaleDateString('id-ID')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Tickets */}
            <TabsContent value="tickets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Sales per Tier</CardTitle>
                  <CardDescription>Quota, sold count, and revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket Tier</TableHead>
                        <TableHead>Sold</TableHead>
                        <TableHead>Quota</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Sales Percentage</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(ticketReport?.salesByType || []).map((t: any) => {
                        const pct = t.quota > 0 ? Math.round((t.sold / t.quota) * 100) : 0;
                        return (
                          <TableRow key={t.name}>
                            <TableCell className="font-semibold">{t.name}</TableCell>
                            <TableCell className="font-medium text-green-600">{t.sold}</TableCell>
                            <TableCell>{t.quota}</TableCell>
                            <TableCell>{t.quota - t.sold}</TableCell>
                            <TableCell>{pct}%</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(t.revenue)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Check-in Activity */}
            <TabsContent value="checkin" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Check-in Distribution</CardTitle>
                  <CardDescription>Volume of attendees arriving over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {(checkInReport?.checkInsByHour || []).length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">
                      No check-in activity recorded yet for this event
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(checkInReport?.checkInsByHour || []).map((h: any) => (
                        <div key={h.hour} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{h.hour}</span>
                          </div>
                          <Badge variant="success">{h.count} attendees</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <ReportsContent />
    </React.Suspense>
  );
}
