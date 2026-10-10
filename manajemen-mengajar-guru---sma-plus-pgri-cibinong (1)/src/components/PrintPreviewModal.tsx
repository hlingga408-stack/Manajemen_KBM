import React, { useRef } from 'react';
import { X, Printer, FileDown, FileSpreadsheet } from 'lucide-react';
import { SchoolProfile } from '../types';
import { KopSurat } from './KopSurat';
import { TandaTanganFooter } from './TandaTanganFooter';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subTitle?: string;
  profile: SchoolProfile;
  orientation?: 'portrait' | 'landscape';
  onDownloadPdf?: () => void;
  onDownloadExcel?: () => void;
  children: React.ReactNode;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subTitle,
  profile,
  orientation = 'portrait',
  onDownloadPdf,
  onDownloadExcel,
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleBrowserPrint = () => {
    window.print();
  };

  const isLandscape = orientation === 'landscape';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-xs">
      {/* Top Floating Control Bar */}
      <div className="print:hidden h-16 bg-slate-900 border-b border-slate-700 px-4 sm:px-6 flex items-center justify-between text-white flex-shrink-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-tight">
              Pratinjau Cetak Dokumen Resmi
            </h3>
            <p className="text-xs text-slate-400">
              {title} &bull; {orientation === 'landscape' ? 'Format Landscape (Mendatar)' : 'Format Portrait (Tegak)'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onDownloadExcel && (
            <button
              onClick={onDownloadExcel}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              title="Download File MS Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Download Excel</span>
            </button>
          )}

          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-700 hover:bg-rose-600 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              title="Download File PDF Langsung"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          )}

          <button
            onClick={handleBrowserPrint}
            className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Buka Dialog Cetak / Simpan PDF Browser"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print</span>
          </button>

          <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-slate-800/90 print:bg-white print:p-0 print:overflow-visible">
        {/* Paper simulation */}
        <div
          ref={contentRef}
          id="printable-document"
          className={`bg-white text-slate-900 shadow-2xl print:shadow-none print:m-0 rounded-sm p-6 sm:p-10 transition-all ${
            isLandscape
              ? 'w-full max-w-[1100px] min-h-[780px]'
              : 'w-full max-w-[850px] min-h-[1100px]'
          }`}
        >
          {/* Formal School Letterhead */}
          <KopSurat profile={profile} judulDokumen={title} subJudul={subTitle} />

          {/* Dynamic Content */}
          <div className="w-full text-xs sm:text-sm">{children}</div>

          {/* Formal Signatures */}
          <TandaTanganFooter profile={profile} />
        </div>
      </div>
    </div>
  );
};
