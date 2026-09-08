'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface DashboardChartsProps {
  trendData?: { date: string; count: number }[];
  ticketSalesData?: {
    eventId: string;
    eventName: string;
    tickets: { name: string; sold: number; quota: number; revenue: number }[];
  }[];
  eventStatusData?: { status: string; count: number }[];
  stats?: {
    totalParticipants: number;
    totalCheckIns: number;
    checkInPercentage: number;
  };
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4'];
const CHECKIN_COLORS = ['#16a34a', '#e2e8f0'];

export function DashboardCharts({
  trendData = [],
  ticketSalesData = [],
  eventStatusData = [],
  stats,
}: DashboardChartsProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-[350px] animate-pulse bg-muted/40" />
        <Card className="h-[350px] animate-pulse bg-muted/40" />
      </div>
    );
  }

  // Flatten ticket sales for bar chart
  const flatTicketSales: { name: string; sold: number; remaining: number }[] = [];
  ticketSalesData.forEach((event) => {
    event.tickets.forEach((t) => {
      flatTicketSales.push({
        name: `${event.eventName.slice(0, 14)}.. - ${t.name}`,
        sold: t.sold,
        remaining: Math.max(0, t.quota - t.sold),
      });
    });
  });

  // Check-in pie data
  const totalReg = stats?.totalParticipants || 0;
  const checkedIn = stats?.totalCheckIns || 0;
  const notCheckedIn = Math.max(0, totalReg - checkedIn);

  const checkInData = [
    { name: 'Checked In', value: checkedIn },
    { name: 'Not Checked In', value: notCheckedIn },
  ];

  // Format date for trend chart (e.g. "08 Sep")
  const formattedTrend = trendData.map((item) => {
    const parts = item.date.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return {
      date: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      registrations: item.count,
    };
  });

  return (
    <div className="space-y-6">
      {/* Row 1: Trend and Check-in Ratio */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 1. Registration Trend (Area Chart) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registration Trend</CardTitle>
                <CardDescription>Daily participant registrations (Last 30 days)</CardDescription>
              </div>
              <Badge variant="outline">30 Days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              {formattedTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      interval={Math.ceil(formattedTrend.length / 8)}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(val: any) => [`${val} participants`, 'Registrations']}
                    />
                    <Area
                      type="monotone"
                      dataKey="registrations"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorReg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No registration trend data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Check-in Ratio (Donut/Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in Attendance</CardTitle>
            <CardDescription>Ratio of attendees checked in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[280px] flex-col items-center justify-center">
              {totalReg > 0 ? (
                <>
                  <div className="relative h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={checkInData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          <Cell fill="#16a34a" />
                          <Cell fill="#cbd5e1" />
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: any) => [`${value} people`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-green-600">
                        {Math.round(stats?.checkInPercentage || 0)}%
                      </span>
                      <span className="text-xs text-muted-foreground">Attendance</span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-green-600" />
                      <span>Checked In ({checkedIn})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-slate-300" />
                      <span>Pending ({notCheckedIn})</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No attendee data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Ticket Sales Bar Chart and Event Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 3. Ticket Sales Breakdown (Bar Chart) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ticket Sales by Type</CardTitle>
            <CardDescription>Sold vs Remaining quota per ticket tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              {flatTicketSales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={flatTicketSales.slice(0, 8)}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="sold" name="Tickets Sold" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remaining" name="Remaining Quota" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No ticket sales data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Event Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Status</CardTitle>
            <CardDescription>Overview of event states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full flex flex-col justify-center">
              {eventStatusData.length > 0 ? (
                <div className="space-y-4">
                  {eventStatusData.map((st, idx) => {
                    const total = eventStatusData.reduce((acc, curr) => acc + curr.count, 0);
                    const pct = total > 0 ? Math.round((st.count / total) * 100) : 0;
                    return (
                      <div key={st.status} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold">{st.status}</span>
                          <span className="text-muted-foreground">
                            {st.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No events recorded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
