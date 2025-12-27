'use client';

import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportButtonsProps {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
}

export function ExportButtons({ onExportPDF, onExportExcel }: ExportButtonsProps) {
  const handlePDFExport = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      // Default PDF export logic
      window.print();
    }
  };

  const handleExcelExport = () => {
    if (onExportExcel) {
      onExportExcel();
    } else {
      // Default Excel export logic - would need to implement
      alert('Excel export özelliği yakında eklenecek');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handlePDFExport}
        variant="outline"
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        PDF İndir
      </Button>
      <Button
        onClick={handleExcelExport}
        variant="outline"
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel İndir
      </Button>
    </div>
  );
}
