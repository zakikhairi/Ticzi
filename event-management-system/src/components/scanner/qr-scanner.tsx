'use client';

import * as React from 'react';
import { Camera, CameraOff, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  disabled?: boolean;
}

export function QRScanner({ onScanSuccess, disabled }: QRScannerProps) {
  const [isScanning, setIsScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const scannerRef = React.useRef<any>(null);
  const regionId = 'qr-reader-region';

  const startScanner = async () => {
    setError(null);
    setLoading(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(regionId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          if (!disabled) {
            onScanSuccess(decodedText);
          }
        },
        () => {
          // Ignore frames without QR codes
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera QR scanner error:', err);
      let message = 'Gagal mengakses kamera.';
      if (err?.name === 'NotAllowedError') {
        message = 'Izin akses kamera ditolak. Silakan izinkan browser untuk mengakses kamera.';
      } else if (err?.name === 'NotFoundError') {
        message = 'Kamera tidak ditemukan pada perangkat Anda.';
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
      setIsScanning(false);
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop camera scanner:', err);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border bg-muted/30 p-2 shadow-inner">
        <div
          id={regionId}
          className="mx-auto overflow-hidden rounded-lg min-h-[280px] flex items-center justify-center"
        >
          {!isScanning && (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <Camera className="mb-3 h-12 w-12 text-muted-foreground/60" />
              <p className="font-medium text-foreground">Kamera Scanner Tidak Aktif</p>
              <p className="mt-1 text-xs max-w-xs">
                Klik tombol di bawah untuk mengaktifkan kamera perangkat dan memindai QR Code tiket
                peserta.
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Perhatian</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        {!isScanning ? (
          <Button onClick={startScanner} disabled={loading || disabled}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            Buka Kamera Scanner
          </Button>
        ) : (
          <Button variant="outline" onClick={stopScanner}>
            <CameraOff className="mr-2 h-4 w-4" />
            Tutup Kamera
          </Button>
        )}
      </div>
    </div>
  );
}
