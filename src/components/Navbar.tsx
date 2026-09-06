import React from 'react';
import {
  Menu,
  X,
  FileSpreadsheet,
  Search,
  Printer,
  UploadCloud,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenExcelUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  onOpenExcelUpload
}) => {
  const { beneficiaries, stats, setCurrentNav } = useBeneficiary();

  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Main Title */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            id="mobile-sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo / Icon */}
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-2xs">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                प्रधानमंत्री आवास योजना शहरी
              </h1>
              <span className="hidden md:inline-flex text-[11px] font-bold px-2 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                महानगरपालिका छत्रपती संभाजीनगर
              </span>
            </div>
            <p className="text-xs text-amber-800 font-semibold mt-0.5">
              लाभार्थी व्यवस्थापन प्रणाली (Beneficiary Working System)
            </p>
          </div>
        </div>

        {/* Right: Status counter & Quick Action Shortcuts */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Working Database Indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">मास्टर डेटाबेस:</span>
            <span className="font-bold text-slate-900">
              {stats.total} लाभार्थी
            </span>
          </div>

          {/* Quick Search shortcut */}
          <button
            type="button"
            id="nav-quick-search-btn"
            onClick={() => setCurrentNav('search')}
            className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition"
            title="लाभार्थी शोधा"
          >
            <Search className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">शोधा (Search)</span>
          </button>

          {/* Quick Print shortcut */}
          <button
            type="button"
            id="nav-quick-print-btn"
            onClick={() => setCurrentNav('print')}
            className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition"
            title="प्रिंट केंद्र उघडा"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">प्रिंट (Print)</span>
          </button>

          {/* Excel Import button */}
          <button
            type="button"
            id="nav-import-excel-btn"
            onClick={onOpenExcelUpload}
            className="flex items-center space-x-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg shadow-2xs transition active:scale-[0.98]"
            title="नवीन एक्सेल फाईल इंपोर्ट करा"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{beneficiaries.length === 0 ? 'Excel Import' : 'Update Excel'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
