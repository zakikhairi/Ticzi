'use client';

import * as React from 'react';
import QRCode from 'qrcode';

interface QRTicketProps {
  qrToken: string;
  size?: number;
}

export function QRTicket({ qrToken, size = 200 }: QRTicketProps) {
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');

  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(qrToken, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(url);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQR();
  }, [qrToken, size]);

  if (!qrDataUrl) {
    return (
      <div
        className="animate-pulse bg-gray-200"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-lg"
    />
  );
}
