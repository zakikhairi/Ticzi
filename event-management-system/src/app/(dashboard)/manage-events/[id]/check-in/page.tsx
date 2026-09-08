'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Users,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { QRScanner } from '@/components/scanner/qr-scanner';

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [scanning, setScanning] = React.useState(false);
  const [manualMode, setManualMode] = React.useState(false);
  const [ticketCode, setTicketCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState<any>(null);
  const [lastResult, setLastResult] = React.useState<any>(null);

  React.useEffect(() => {
    loadStats();
  }, [eventId]);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/check-in-stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCheckIn = async (token: string) => {
    setLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token }),
      });

      const result = await response.json();

      if (response.ok) {
        setLastResult({
          success: true,
          message: result.data?.message || 'Check-in berhasil!',
          registration: result.data?.registration,
        });
        loadStats();
      } else {
        setLastResult({
          success: false,
          message: result.error || 'QR Code tidak valid',
        });
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketCode.trim()) {
      handleCheckIn(ticketCode.trim());
      setTicketCode('');
    }
  };

  const handleManualModeToggle = () => {
    setManualMode(!manualMode);
    setLastResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/manage-events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Check-in Scanner</h1>
            <p className="text-muted-foreground">Scan QR codes to check in participants</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleManualModeToggle}>
          {manualMode ? (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Use Scanner
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Manual Entry
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                <p className="text-sm text-muted-foreground">Total Registered</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCheckedIn}</p>
                <p className="text-sm text-muted-foreground">Checked In</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(stats.checkInPercentage)}%
                </p>
                <p className="text-sm text-muted-foreground">Check-in Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scanner / Manual Entry */}
      <Card>
        <CardHeader>
          <CardTitle>
            {manualMode ? 'Manual Ticket Entry' : 'QR Code Scanner'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {manualMode ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter ticket code (e.g., TKT-XXXXXXXX)"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  className="text-lg font-mono"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !ticketCode.trim()}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Check In'
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the ticket code found on the participant's digital ticket
              </p>
            </form>
          ) : (
            <QRScanner
              onScanSuccess={(token) => {
                if (!loading) {
                  handleCheckIn(token);
                }
              }}
              disabled={loading}
            />
          )}

          {/* Result */}
          {lastResult && (
            <div
              className={`rounded-lg p-6 ${
                lastResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-4">
                {lastResult.success ? (
                  <CheckCircle className="h-12 w-12 text-green-600" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600" />
                )}
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold ${
                      lastResult.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {lastResult.success ? 'Check-in Berhasil!' : 'Check-in Gagal'}
                  </h3>
                  <p
                    className={`mt-1 ${
                      lastResult.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {lastResult.message}
                  </p>
                  {lastResult.registration && (
                    <div className="mt-3 flex gap-4 text-sm">
                      <span className="text-green-800">
                        <strong>{lastResult.registration.fullName}</strong>
                      </span>
                      <span className="text-green-700">
                        {lastResult.registration.ticket?.name}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setLastResult(null)}
                  className={lastResult.success ? 'border-green-300' : 'border-red-300'}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-5 w-5 rounded-full bg-primary/10 text-center text-xs font-medium leading-5 text-primary">
                1
              </span>
              <span>Ask the participant to show their digital ticket with QR code</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-5 w-5 rounded-full bg-primary/10 text-center text-xs font-medium leading-5 text-primary">
                2
              </span>
              <span>
                Scan the QR code using the camera or enter their ticket code manually
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-5 w-5 rounded-full bg-primary/10 text-center text-xs font-medium leading-5 text-primary">
                3
              </span>
              <span>
                Verify the participant's name matches the registration
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-5 w-5 rounded-full bg-primary/10 text-center text-xs font-medium leading-5 text-primary">
                4
              </span>
              <span>
                The check-in is complete when you see the success confirmation
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
