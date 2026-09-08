'use client';

import * as React from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface PrintButtonProps {
  eventName?: string;
  ticketCode?: string;
}

export function PrintButton({ eventName = 'event', ticketCode = 'ticket' }: PrintButtonProps) {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-ticket-card');
    if (!element) {
      toast({ title: 'Error', description: 'Ticket element not found', variant: 'destructive' });
      return;
    }

    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 15, imgWidth, Math.min(imgHeight, pageHeight - 30));
      pdf.save(`${eventName.replace(/[^a-zA-Z0-9]/g, '_')}-${ticketCode}.pdf`);

      toast({ title: 'Berhasil!', description: 'Digital ticket PDF berhasil di-download.' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Download PDF Gagal',
        description: 'Gunakan fitur Print untuk menyimpan sebagai PDF.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <Button onClick={handleDownloadPDF} disabled={downloading}>
        {downloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download PDF
      </Button>
    </div>
  );
}
